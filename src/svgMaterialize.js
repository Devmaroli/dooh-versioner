import { svgLayerSource } from './svgDocument.js'
import { normalizeSvgWithWasm } from './svgWasm.js'
import { svgElement } from './svgStyle.js'
import { resolveFont } from './fontResolve.js'
let worker
let sequence = 0
const pending = new Map()

function decoder() {
  if (!worker && typeof Worker !== 'undefined') {
    worker = new Worker(new URL('./workers/imageDecode.worker.js', import.meta.url), { type: 'module' })
    worker.onmessage = (event) => {
      const wait = pending.get(event.data.id)
      if (!wait) return
      pending.delete(event.data.id)
      if (event.data.error) wait.reject(new Error(event.data.error))
      else wait.resolve(event.data)
    }
  }
  return worker
}

export function decodeImageOffThread(base64, mime) {
  const current = decoder()
  if (!current) return Promise.reject(new Error('Image decode worker is unavailable.'))
  const id = ++sequence
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    current.postMessage({ id, base64, mime })
  })
}

async function canvasFromDecode(result) {
  const canvas = document.createElement('canvas')
  canvas.sourceAspect = result.sourceAspect
  canvas.width = result.width
  canvas.height = result.height
  const image = new ImageData(new Uint8ClampedArray(result.buffer), result.width, result.height)
  canvas.getContext('2d').putImageData(image, 0, 0)
  return canvas
}

async function canvasFromBytes(bytes, mime) {
  const bitmap = await createImageBitmap(new Blob([bytes], { type: mime || 'image/png' }))
  const canvas = document.createElement('canvas')
  canvas.sourceAspect = bitmap.width / bitmap.height
  const scale = Math.min(1, 4096 / Math.max(bitmap.width, bitmap.height))
  canvas.width = Math.max(1, Math.ceil(bitmap.width * scale))
  canvas.height = Math.max(1, Math.ceil(bitmap.height * scale))
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close?.()
  return canvas
}

async function bytesFromBase64(base64) {
  const clean = String(base64 || '').replace(/\s+/g, '')
  const parts = []
  const size = 1024 * 1024
  for (let index = 0; index < clean.length; index += size) {
    parts.push(atob(clean.slice(index, index + size)))
    await new Promise(resolve => setTimeout(resolve, 0))
  }
  const binary = parts.join('')
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index)
  return bytes
}

export function placeRaster(source, layer) {
  const [bx, by, bw, bh] = layer.box || [0, 0, source.width, source.height]
  if (!(bw > 0) || !(bh > 0)) return source
  const scale = Math.min(1, 4096 / Math.max(bw, bh))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.ceil(bw * scale))
  canvas.height = Math.max(1, Math.ceil(bh * scale))
  const context = canvas.getContext('2d')
  context.setTransform(scale, 0, 0, scale, -bx * scale, -by * scale)
  if (layer.clip?.d) {
    try { context.clip(new Path2D(layer.clip.d)) } catch { /* An unreadable clip keeps the image visible for review. */ }
  } else if (layer.clip?.rect) {
    const [cx, cy, cw, ch] = layer.clip.rect
    context.beginPath(); context.rect(cx, cy, cw, ch); context.clip()
  }
  const matrix = layer.transform || [1, 0, 0, 1, 0, 0]
  context.transform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5])
  const [x, y, w, h] = layer.localBox || [0, 0, source.width, source.height]
  let dw = w || source.width, dh = h || source.height, dx = x, dy = y
  const aspect = layer.preserveAspectRatio
  if (aspect && aspect !== 'none') {
    const intrinsicRatio = source.sourceAspect || source.width / source.height
    const ratio = aspect.includes('slice') ? Math.max(dw / intrinsicRatio, dh) : Math.min(dw / intrinsicRatio, dh)
    const width = intrinsicRatio * ratio, height = ratio
    dx += (dw - width) * (aspect.includes('xMax') ? 1 : aspect.includes('xMin') ? 0 : .5)
    dy += (dh - height) * (aspect.includes('YMax') ? 1 : aspect.includes('YMin') ? 0 : .5)
    context.beginPath(); context.rect(x, y, dw, dh); context.clip()
    dw = width; dh = height
  }
  context.drawImage(source, dx, dy, dw, dh)
  return canvas
}

export async function rasterizeSvgLayer(layer, outputSize) {
  if (typeof document === 'undefined') return null
  if (layer.kind === 'text' && !layer.px) {
    if (!layer.editable) return null
    const probe = document.createElement('canvas').getContext('2d')
    probe.font = `${layer.fontStyle || 'normal'} ${layer.fontWeight || 'normal'} ${layer.size || 16}px ${layer.fontStatus === 'generic' ? layer.font : JSON.stringify(layer.font)}`
    const metrics = probe.measureText(layer.text || '')
    const width = metrics.width, size = layer.size || 16
    const x = (layer.textX || 0) - (layer.textAnchor === 'middle' ? width / 2 : layer.textAnchor === 'end' ? width : 0)
    layer.localBox = [x - 1, (layer.textY || 0) - Math.max(size, metrics.actualBoundingBoxAscent) - 1, width + 2, Math.max(size, metrics.actualBoundingBoxAscent) + Math.max(size * .3, metrics.actualBoundingBoxDescent) + 2]
    const m = layer.transform || [1, 0, 0, 1, 0, 0], [lx, ly, lw, lh] = layer.localBox
    const points = [[lx, ly], [lx + lw, ly], [lx, ly + lh], [lx + lw, ly + lh]].map(([a, b]) => [m[0]*a+m[2]*b+m[4], m[1]*a+m[3]*b+m[5]])
    const xs = points.map(p => p[0]), ys = points.map(p => p[1])
    layer.box = [Math.min(...xs), Math.min(...ys), Math.max(...xs)-Math.min(...xs), Math.max(...ys)-Math.min(...ys)]
  }
  const [x, y, w, h] = layer.box || [0, 0, 1, 1]
  if (!(w > 0) || !(h > 0)) return null
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, 1600 / Math.max(w, h))
  canvas.width = Math.max(1, Math.ceil(outputSize?.width ?? w * scale))
  canvas.height = Math.max(1, Math.ceil(outputSize?.height ?? h * scale))
  const context = canvas.getContext('2d')
  context.setTransform(canvas.width/w, 0, 0, canvas.height/h, -x*canvas.width/w, -y*canvas.height/h)
  if (layer.sourceClip) context.clip(new Path2D(layer.sourceClip))
  // Layer opacity is applied by the shared compositor, once.
  if (layer.clip?.d) { context.clip(new Path2D(layer.clip.d)) }
  else if (layer.clip?.rect) { const [cx, cy, cw, ch] = layer.clip.rect; context.beginPath(); context.rect(cx, cy, cw, ch); context.clip() }
  if (layer.svgShape) {
    const normalized = await normalizeSvgWithWasm(svgLayerSource(layer, canvas.width, canvas.height))
    layer.geometryEngine = 'vectorcraft-wasm'
    layer.svgWarnings = normalized.warnings
    const svg = normalized.svg
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    try {
      const image = new Image()
      image.src = url
      await image.decode()
      context.setTransform(1, 0, 0, 1, 0, 0)
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
    } finally { URL.revokeObjectURL(url) }
    return canvas
  }
  if (layer.kind === 'text') {
    if (!layer.editable) return null
    for (const stroke of [false, true]) {
      const colour = stroke ? layer.stroke : layer.color || '#000'
      if (!colour || colour === 'none') continue
      const gradient = stroke ? layer.strokeGradient : layer.fillGradient
      const part = document.createElement('canvas'); part.width = canvas.width; part.height = canvas.height
      const g = part.getContext('2d'), m = layer.transform || [1, 0, 0, 1, 0, 0]
      g.setTransform(scale, 0, 0, scale, -x * scale, -y * scale); g.transform(...m)
      g.font = `${layer.fontStyle || 'normal'} ${layer.fontWeight || 'normal'} ${layer.size || 16}px ${layer.fontStatus === 'generic' ? layer.font : JSON.stringify(layer.font)}`
      g.textBaseline = 'alphabetic'
      g.textAlign = layer.textAnchor === 'middle' ? 'center' : layer.textAnchor === 'end' ? 'right' : 'left'
      g.globalAlpha = (stroke ? layer.svgStrokeOpacity : layer.svgFillOpacity) ?? 1
      g.fillStyle = g.strokeStyle = gradient ? '#fff' : colour
      g.lineWidth = layer.strokeWidth || 1
      if (stroke) g.strokeText(layer.text || '', layer.textX || 0, layer.textY || 0)
      else g.fillText(layer.text || '', layer.textX || 0, layer.textY || 0)
      if (gradient) {
        const [lx, ly, lw, lh] = layer.localBox
        const paint = await rasterizeSvgLayer({ kind: 'shape', box: layer.box, transform: layer.transform, fillGradient: gradient, svgShape: svgElement('rect', { x: lx, y: ly, width: lw, height: lh, fill: `url(#${gradient.attrs.id})` }) })
        g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-in'; g.drawImage(paint, 0, 0)
      }
      context.setTransform(1, 0, 0, 1, 0, 0); context.drawImage(part, 0, 0)
    }
    return canvas
  }
  if (!layer.pathData) return canvas
  const path = new Path2D(layer.pathData)
  if (layer.transform) context.setTransform(layer.transform[0] * scale, layer.transform[1] * scale, layer.transform[2] * scale, layer.transform[3] * scale, layer.transform[4] * scale - x * scale, layer.transform[5] * scale - y * scale)
  if (layer.fill && layer.fill !== 'none') { context.fillStyle = layer.fill; context.fill(path) }
  if (layer.stroke && layer.stroke !== 'none') { context.strokeStyle = layer.stroke; context.lineWidth = layer.strokeWidth || 1; context.stroke(path) }
  return canvas
}

async function pixelsForImage(layer) {
  if (typeof document === 'undefined') return null
  if (layer.linkedFile) return canvasFromBytes(new Uint8Array(await layer.linkedFile.arrayBuffer()), layer.linkedFile.type)
  const embedded = layer.embeddedImage
  if (!embedded) return null
  if (embedded.base64) {
    try { return await canvasFromDecode(await decodeImageOffThread(embedded.base64, embedded.mime)) }
    catch { /* The worker can be unavailable in a test page. Decode in slices on the next frames instead. */ }
    return canvasFromBytes(await bytesFromBase64(embedded.base64), embedded.mime)
  }
  if (embedded.data && embedded.width) return canvasFromPdfPixels(embedded)
  return canvasFromBytes(new TextEncoder().encode(embedded.text || ''), embedded.mime)
}

function canvasFromPdfPixels(image) {
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d')
  if (image.bitmap) { context.drawImage(image.bitmap, 0, 0); return canvas }
  const pixels = context.createImageData(image.width, image.height)
  const source = image.data
  if (image.kind === 3) pixels.data.set(source)
  else if (image.kind === 2) {
    for (let from = 0, to = 0; from < source.length; from += 3, to += 4) {
      pixels.data[to] = source[from]; pixels.data[to + 1] = source[from + 1]; pixels.data[to + 2] = source[from + 2]; pixels.data[to + 3] = 255
    }
  } else return null
  context.putImageData(pixels, 0, 0)
  return canvas
}

export async function materializeSvgArtwork(artwork) {
  if (typeof document === 'undefined') return artwork
  const layers = []
  const visit = nodes => { for (const layer of nodes || []) { layers.push(layer); visit(layer.children) } }
  visit(artwork.layers)
  for (let index = 0; index < layers.length; index++) {
    const layer = layers[index]
    if (layer.kind === 'image') {
      try {
        const canvas = layer.pixelSource || await pixelsForImage(layer)
        if (canvas) {
          Object.defineProperty(layer, 'px', { value: placeRaster(canvas, layer), enumerable: false })
          if (layer.embeddedImage?.base64) layer.embeddedImage = { mime: layer.embeddedImage.mime }
        }
      } catch {
        layer.decodeError = true
        artwork.warnings = [...(artwork.warnings || []), `Embedded image ${layer.name || 'image'} could not be read. Needs review.`]
      }
    } else if ((layer.kind === 'shape' || layer.kind === 'text') && !layer.px) {
      if (layer.kind === 'text') {
        await resolveFont(layer, artwork.fontFiles)
        if (layer.fontStatus === 'missing') artwork.warnings.push(`Font ${layer.requestedFont} unavailable for ${layer.name}. Needs review. Supply the original font; no substitute rendered.`)
      }
      const canvas = await rasterizeSvgLayer(layer)
      if (canvas) Object.defineProperty(layer, 'px', { value: canvas, enumerable: false })
      for (const warning of layer.svgWarnings || []) artwork.warnings.push(`VectorCraft: ${layer.name}: ${warning}. Needs review.`)
    }
    if (index % 12 === 11) await new Promise(resolve => setTimeout(resolve, 0))
  }
  if (artwork.source?.format === 'svg') artwork.source.svgGeometry = layers.some(layer => layer.geometryEngine === 'vectorcraft-wasm') ? 'vectorcraft-wasm' : 'text-and-images'
  delete artwork.fontFiles
  return artwork
}

export async function relinkImages(artwork, files) {
  const map = new Map([...files].map(file => [file.name.toLowerCase(), file]))
  const layers = []
  const visit = nodes => { for (const layer of nodes || []) { layers.push(layer); visit(layer.children) } }
  visit(artwork.layers)
  const unresolved = []
  for (const layer of layers) {
    if (!layer.missingLink) continue
    const file = map.get(String(layer.linkName || '').toLowerCase())
    if (!file) { unresolved.push(layer.linkName || 'image'); continue }
    layer.linkedFile = file
    layer.missingLink = false
    layer.imageSource = 'linked'
    layer.sourceKind = 'linked'
    const canvas = await pixelsForImage(layer)
    if (canvas) Object.defineProperty(layer, 'px', { value: placeRaster(canvas, layer), enumerable: false })
    else if (typeof document !== 'undefined') { layer.missingLink = true; unresolved.push(layer.linkName || 'image'); continue }
  }
  artwork.warnings = (artwork.warnings || []).filter(warning => !warning.startsWith('Missing linked image'))
  for (const name of unresolved) artwork.warnings.push(`Missing linked image ${name}. Needs review.`)
  return unresolved
}

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
  canvas.width = result.width
  canvas.height = result.height
  const image = new ImageData(new Uint8ClampedArray(result.buffer), result.width, result.height)
  canvas.getContext('2d').putImageData(image, 0, 0)
  return canvas
}

async function canvasFromBytes(bytes, mime) {
  const bitmap = await createImageBitmap(new Blob([bytes], { type: mime || 'image/png' }))
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  canvas.getContext('2d').drawImage(bitmap, 0, 0)
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
  context.drawImage(source, x, y, w || source.width, h || source.height)
  return canvas
}

export async function rasterizeSvgLayer(layer) {
  if (typeof document === 'undefined') return null
  const [x, y, w, h] = layer.box || [0, 0, 1, 1]
  if (!(w > 0) || !(h > 0)) return null
  const canvas = document.createElement('canvas')
  const scale = Math.min(1, 1600 / Math.max(w, h))
  canvas.width = Math.max(1, Math.ceil(w * scale))
  canvas.height = Math.max(1, Math.ceil(h * scale))
  const context = canvas.getContext('2d')
  context.setTransform(scale, 0, 0, scale, -x * scale, -y * scale)
  context.globalAlpha = layer.opacity ?? 1
  if (layer.clip?.d) { context.clip(new Path2D(layer.clip.d)) }
  else if (layer.clip?.rect) { const [cx, cy, cw, ch] = layer.clip.rect; context.beginPath(); context.rect(cx, cy, cw, ch); context.clip() }
  if (layer.kind === 'text') {
    context.fillStyle = layer.color || '#111'
    context.font = `${layer.size || 16}px ${layer.font || 'sans-serif'}`
    context.textBaseline = 'alphabetic'
    context.fillText(layer.text || '', layer.box[0], layer.box[1] + (layer.size || 16))
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
    } else if (layer.kind === 'shape' || layer.kind === 'text') {
      const canvas = await rasterizeSvgLayer(layer)
      if (canvas) Object.defineProperty(layer, 'px', { value: canvas, enumerable: false })
    }
    if (index % 12 === 11) await new Promise(resolve => setTimeout(resolve, 0))
  }
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

import * as pdfjs from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

let pdfApi = pdfjs
let configured = false
async function configurePdf() {
  if (configured) return pdfApi
  if (import.meta.env.VITEST && globalThis.__DOOH_PDFJS__) pdfApi = globalThis.__DOOH_PDFJS__
  else {
    pdfApi.GlobalWorkerOptions.workerSrc = workerUrl
    pdfApi = pdfjs
  }
  configured = true
  return pdfApi
}

const DRAW = { moveTo: 0, lineTo: 1, curveTo: 2, quadraticCurveTo: 3, closePath: 4 }

function pathFromDrawOps(data) {
  let d = '', index = 0
  const points = []
  while (index < data.length) {
    const op = data[index++]
    if (op === DRAW.moveTo) { const x = data[index++], y = data[index++]; d += `M${x} ${y}`; points.push([x, y]) }
    else if (op === DRAW.lineTo) { const x = data[index++], y = data[index++]; d += `L${x} ${y}`; points.push([x, y]) }
    else if (op === DRAW.curveTo) { const values = [data[index++], data[index++], data[index++], data[index++], data[index++], data[index++]]; d += `C${values.join(' ')}`; points.push([values[4], values[5]]) }
    else if (op === DRAW.quadraticCurveTo) { const values = [data[index++], data[index++], data[index++], data[index++]]; d += `Q${values.join(' ')}`; points.push([values[2], values[3]]) }
    else if (op === DRAW.closePath) d += 'Z'
    else break
  }
  if (!points.length) return null
  const xs = points.map(point => point[0]), ys = points.map(point => point[1])
  const x = Math.min(...xs), y = Math.min(...ys)
  return { d, box: [x, y, Math.max(...xs) - x, Math.max(...ys) - y] }
}

function flipBox(box, height) {
  return [box[0], height - box[1] - box[3], box[2], box[3]]
}

const IDENTITY = [1, 0, 0, 1, 0, 0]
function multiply(a, b) {
  return [
    a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
  ]
}
function applyPoint(m, x, y) {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]
}

/** Maps image pixels (origin top-left) through a PDF content-stream matrix into top-left page space. */
export function pdfImagePlacement(ctm, width, height, pageHeight) {
  const [a, b, c, d, e, f] = ctm
  const matrix = [a / width, -b / width, -c / height, d / height, c + e, pageHeight - d - f]
  const corners = [applyPoint(matrix, 0, 0), applyPoint(matrix, width, 0), applyPoint(matrix, 0, height), applyPoint(matrix, width, height)]
  const xs = corners.map(point => point[0]), ys = corners.map(point => point[1])
  const x = Math.min(...xs), y = Math.min(...ys)
  return { matrix, localBox: [0, 0, width, height], box: [x, y, Math.max(...xs) - x, Math.max(...ys) - y] }
}

function pdfObject(page, name) {
  const store = String(name).startsWith('g_') ? page.commonObjs : page.objs
  if (store?.has?.(name)) return Promise.resolve(store.get(name))
  return new Promise((resolve, reject) => {
    try { store.get(name, resolve) } catch (error) { reject(error) }
  })
}

function rasterFromPdfImage(image) {
  if (typeof document === 'undefined' || !image?.width || !image?.height) return null
  const canvas = document.createElement('canvas')
  canvas.width = image.width
  canvas.height = image.height
  const context = canvas.getContext('2d')
  if (image.bitmap) { context.drawImage(image.bitmap, 0, 0); return canvas }
  if (!image.data) return null
  const pixels = context.createImageData(image.width, image.height)
  if (image.kind === 3 || image.kind === pdfApi.ImageKind?.RGBA_32BPP) pixels.data.set(image.data)
  else if (image.kind === 2 || image.kind === pdfApi.ImageKind?.RGB_24BPP) {
    for (let from = 0, to = 0; from < image.data.length; from += 3, to += 4) {
      pixels.data[to] = image.data[from]; pixels.data[to + 1] = image.data[from + 1]; pixels.data[to + 2] = image.data[from + 2]; pixels.data[to + 3] = 255
    }
  } else return null
  context.putImageData(pixels, 0, 0)
  return canvas
}

function snapshotImage(image) {
  if (!image?.width || !image?.height) return null
  const copy = { width: image.width, height: image.height, kind: image.kind, bitmap: image.bitmap || null }
  if (image.data) copy.data = new Uint8Array(image.data)
  return copy
}

async function imagesFromOperators(page, operators, pageHeight) {
  const stack = []
  let ctm = IDENTITY, alpha = 1, clip = null, pathRect = null
  const found = []
  for (let index = 0; index < operators.fnArray.length; index++) {
    const fn = operators.fnArray[index], args = operators.argsArray[index]
    if (fn === pdfApi.OPS.save) stack.push({ ctm: [...ctm], alpha, clip, pathRect })
    else if (fn === pdfApi.OPS.restore) {
      const previous = stack.pop()
      if (previous) { ctm = previous.ctm; alpha = previous.alpha; clip = previous.clip; pathRect = previous.pathRect }
    } else if (fn === pdfApi.OPS.transform && args?.length >= 6) ctm = multiply(ctm, args.slice(0, 6))
    else if (fn === pdfApi.OPS.setGState && Array.isArray(args?.[0])) {
      for (const entry of args[0]) if (Array.isArray(entry) && entry[0] === 'ca' && typeof entry[1] === 'number') alpha = entry[1]
    } else if (fn === pdfApi.OPS.rectangle && args?.length >= 4) pathRect = args.slice(0, 4)
    else if ((fn === pdfApi.OPS.clip || fn === pdfApi.OPS.eoClip) && pathRect) {
      const [x, y, w, h] = pathRect
      const corners = [applyPoint(ctm, x, y), applyPoint(ctm, x + w, y), applyPoint(ctm, x, y + h), applyPoint(ctm, x + w, y + h)].map(point => [point[0], pageHeight - point[1]])
      const xs = corners.map(point => point[0]), ys = corners.map(point => point[1])
      const left = Math.min(...xs), top = Math.min(...ys)
      clip = { rect: [left, top, Math.max(...xs) - left, Math.max(...ys) - top] }
    } else if (fn === pdfApi.OPS.paintImageXObject || fn === pdfApi.OPS.paintImageMaskXObject || fn === pdfApi.OPS.paintInlineImageXObject) {
      found.push({ args, inline: fn === pdfApi.OPS.paintInlineImageXObject, ctm: [...ctm], alpha, clip })
    }
  }
  const layers = []
  for (const image of found) {
    let data = image.inline ? image.args?.[0] : null
    if (!image.inline) {
      try { data = await pdfObject(page, image.args?.[0]) } catch { data = null }
    }
    const pixels = snapshotImage(data)
    if (!pixels) continue
    const placement = pdfImagePlacement(image.ctm, pixels.width, pixels.height, pageHeight)
    layers.push({ kind: 'image', name: `Image ${layers.length + 1}`, box: placement.box, localBox: placement.localBox, transform: placement.matrix, opacity: image.alpha, clip: image.clip, imageSource: 'embedded', sourceKind: 'embedded', embeddedImage: pixels })
  }
  return layers
}

export async function artworkFromPdf(data, file = 'artwork.pdf', pageNumber = 1) {
  await configurePdf()
  const bytes = data instanceof Uint8Array ? data.slice() : new Uint8Array(data)
  const pdf = await pdfApi.getDocument({ data: bytes, isEvalSupported: false, useSystemFonts: false, useWorkerFetch: false, useWasm: false, disableRange: true, disableStream: true, disableAutoFetch: true }).promise
  const safePage = Math.min(pdf.numPages, Math.max(1, pageNumber || 1))
  const page = await pdf.getPage(safePage)
  const viewport = page.getViewport({ scale: 1 })
  const width = Math.max(1, Math.round(viewport.width)), height = Math.max(1, Math.round(viewport.height))
  const layers = []
  const warnings = []
  let serial = 0
  const text = await page.getTextContent()
  for (const item of text.items || []) {
    if (!item.str?.trim()) continue
    const transform = item.transform || [1, 0, 0, 1, 0, 0]
    const size = Math.max(1, Math.hypot(transform[2], transform[3]) || item.height || 12)
    const boxWidth = item.width || item.str.length * size * 0.5
    const x = transform[4]
    const y = height - transform[5] - size
    layers.push({ id: `pdf${serial++}`, name: item.str.slice(0, 40), kind: 'text', text: item.str, font: item.fontName, size, box: [x, y, boxWidth, size], color: '#111', sourceKind: 'pdf-text' })
  }
  try {
    const operators = await page.getOperatorList()
    for (let index = 0; index < operators.fnArray.length; index++) {
      if (operators.fnArray[index] !== pdfApi.OPS.constructPath) continue
      const packed = operators.argsArray[index]?.[0]
      if (!Array.isArray(packed)) continue
      const path = pathFromDrawOps(packed)
      if (!path || !(path.box[2] > 0.5) || !(path.box[3] > 0.5)) continue
      layers.push({ id: `pdf${serial++}`, name: `Path ${serial}`, kind: 'shape', pathData: path.d, fill: '#222', box: flipBox(path.box, height), sourceKind: 'pdf-path', pdfFlip: true })
    }
    for (const image of await imagesFromOperators(page, operators, height)) {
      image.id = `pdf${serial++}`
      const source = rasterFromPdfImage(image.embeddedImage)
      if (source) {
        Object.defineProperty(image, 'pixelSource', { value: source, enumerable: false })
        image.embeddedImage = { width: image.embeddedImage.width, height: image.embeddedImage.height, kind: image.embeddedImage.kind }
      }
      layers.push(image)
    }
  } catch { warnings.push('Some PDF vectors or embedded images could not be read. Text that was found is kept.') }
  if (!layers.length && typeof document !== 'undefined') {
    const scale = Math.min(2, 4096 / Math.max(width, height))
    const rasterViewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.ceil(rasterViewport.width))
    canvas.height = Math.max(1, Math.ceil(rasterViewport.height))
    await page.render({ canvasContext: canvas.getContext('2d'), viewport: rasterViewport }).promise
    layers.push({ id: 'pdf-raster', name: 'Page raster', kind: 'image', box: [0, 0, width, height], sourceKind: 'raster', imageSource: 'embedded' })
    Object.defineProperty(layers[0], 'px', { value: canvas, enumerable: false })
  }
  const pageCount = pdf.numPages
  if (typeof pdf.destroy === 'function') await pdf.destroy()
  else { await pdf.cleanup?.(); await pdf.loadingTask?.destroy?.() }
  return { w: width, h: height, topFirst: true, layers, warnings, source: { format: 'pdf', file }, pdfPages: pageCount, pdfPage: safePage }
}

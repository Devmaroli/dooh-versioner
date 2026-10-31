import { resolveFont } from './fontResolve.js'

// Keep graphics-state/clip operators, but paint only one requested operation.
// pdf.js supplies PDF font encodings, glyph geometry and shading colour spaces.
export async function pdfPaintLayers(page, operators, api, width, height, warnings) {
  const layers = [], fonts = new Map(), stack = [], pathSources = new WeakMap()
  let fontId = ''

  const textOps = new Set(['showText', 'showSpacedText', 'nextLineShowText', 'nextLineSetSpacingShowText'].map(key => api.OPS[key]))
  for (let index = 0; index < operators.fnArray.length; index++) {
    const fn = operators.fnArray[index], args = operators.argsArray[index]
    if (fn === api.OPS.save) stack.push(fontId)
    else if (fn === api.OPS.restore) fontId = stack.pop() || fontId
    else if (fn === api.OPS.setFont) fontId = args[0]
    const isText = textOps.has(fn), isShading = fn === api.OPS.shadingFill
    if (!isText && !isShading) continue
    let font, status, content = ''
    if (isText) {
      if (!fonts.has(fontId)) {
        const original = page.commonObjs.get(fontId)
        const layer = { font: original.name || original.loadedName, fontData: original.missingFile ? null : original.data }
        await resolveFont(layer)
        if (layer.fontStatus === 'missing' && (!original.missingFile || original.isType3Font)) {
          // pdfjs-dist is pinned: ask its worker for source paths before
          // disabling the FontFace. Merely toggling this flag draws no glyphs.
          await page._transport.messageHandler.sendWithPromise('FontFallback', { id: fontId })
          layer.fontStatus = 'outlined'; original.disableFontFace = true
          const getPath = original.getPathGenerator.bind(original)
          original.getPathGenerator = (objects, character) => {
            const source = objects.get(`${original.loadedName}_path_${character}`)
            const path = getPath(objects, character)
            if (source?.path) pathSources.set(path, Array.from(source.path))
            return path
          }
        }
        if (layer.fontStatus === 'local') Object.defineProperty(original, 'systemFontInfo', { value: { css: JSON.stringify(layer.font) } })
        delete layer.fontData
        fonts.set(fontId, layer)
      }
      font = fonts.get(fontId); status = font.fontStatus
      content = (args?.[0] || []).filter(g => g && typeof g === 'object').map(g => g.unicode || '').join('')
      if (!content.trim()) continue
      if (status === 'missing') {
        warnings.push(`Font ${font.requestedFont} unavailable. Needs review. No substitute rendered.`)
        layers.push({ ...font, operatorIndex: index, kind: 'text', name: content.slice(0, 40), text: content, box: [0, 0, width, height], editable: false, sourceKind: 'pdf-text' })
        continue
      }
    }
    if (typeof document === 'undefined') continue
    const scale = Math.min(2, 4096 / Math.max(width, height)), viewport = page.getViewport({ scale })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height)
    const context = canvas.getContext('2d'), outlines = []
    let painting = false
    // Execute every text advance and clip. Suppress only paint calls, otherwise
    // skipping an earlier Tj would move all later glyphs to the wrong position.
    const methods = ['fill', 'stroke', 'fillText', 'strokeText', 'fillRect', 'strokeRect', 'drawImage']
    for (const method of methods) {
      const original = context[method].bind(context)
      context[method] = (...args) => {
        if (!painting) return
        if (status === 'outlined' && (method === 'fill' || method === 'stroke')) {
          const commands = pathSources.get(args[0])
          if (commands) {
            const m = context.getTransform()
            outlines.push({ commands, transform: [m.a / scale, m.b / scale, m.c / scale, m.d / scale, m.e / scale, m.f / scale], paint: method, color: method === 'fill' ? context.fillStyle : context.strokeStyle, opacity: context.globalAlpha, lineWidth: context.lineWidth })
          }
        }
        return original(...args)
      }
    }
    await page.render({ canvasContext: context, viewport, background: 'rgba(0,0,0,0)', operationsFilter: i => { painting = i === index; return true } }).promise
    const ctx = canvas.getContext('2d'), pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let left = canvas.width, top = canvas.height, right = -1, bottom = -1
    for (let y = 0; y < canvas.height; y++) for (let x = 0; x < canvas.width; x++) if (pixels.data[(y * canvas.width + x) * 4 + 3]) {
      left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y)
    }
    if (right < left) continue
    const cropped = document.createElement('canvas')
    cropped.width = right - left + 1; cropped.height = bottom - top + 1
    cropped.getContext('2d').drawImage(canvas, left, top, cropped.width, cropped.height, 0, 0, cropped.width, cropped.height)
    let shading = null
    if (isShading) {
      const id = args[0], store = String(id).startsWith('g_') ? page.commonObjs : page.objs
      if (store.has(id)) shading = store.get(id)
    }
    const layer = { ...(font || {}), operatorIndex: index, kind: isText ? 'text' : 'shape', name: isText ? content.slice(0, 40) : 'PDF gradient', text: content || undefined, box: [left / scale, top / scale, cropped.width / scale, cropped.height / scale], sourceKind: isText ? 'pdf-text' : 'pdf-shading', editable: isText && status !== 'outlined', ...(outlines.length ? { outlines } : {}), shading }
    if (status === 'outlined') warnings.push(`${layer.name}: text outlined, not editable. Needs review.`)
    Object.defineProperty(layer, 'px', { value: cropped, enumerable: false })
    layers.push(layer)
  }
  return layers
}

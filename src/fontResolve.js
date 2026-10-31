// Read family/full/PostScript names from sfnt name tables; font files stay local.
export function fontNames(buffer) {
  const view = new DataView(buffer), names = new Set()
  if (view.byteLength < 12) return []
  const count = view.getUint16(4)
  for (let i = 0; i < count && 12 + i * 16 + 16 <= view.byteLength; i++) {
    const at = 12 + i * 16
    if (view.getUint32(at) !== 0x6e616d65) continue
    const start = view.getUint32(at + 8)
    if (start + 6 > view.byteLength) continue
    const records = view.getUint16(start + 2), strings = start + view.getUint16(start + 4)
    for (let n = 0; n < records; n++) {
      const r = start + 6 + n * 12
      if (r + 12 > view.byteLength) break
      const platform = view.getUint16(r), id = view.getUint16(r + 6), length = view.getUint16(r + 8), offset = strings + view.getUint16(r + 10)
      if (![1, 4, 6, 16].includes(id) || offset + length > view.byteLength) continue
      let value = ''
      if (platform === 0 || platform === 3) for (let c = 0; c + 1 < length; c += 2) value += String.fromCharCode(view.getUint16(offset + c))
      else value = new TextDecoder('macintosh').decode(new Uint8Array(buffer, offset, length))
      if (value) names.add(value)
    }
  }
  return [...names]
}
const fileData = new WeakMap()
let serial = 0
export async function resolveFont(layer, files = []) {
  if (layer.fontStatus && layer.fontStatus !== 'unresolved') return layer.fontStatus
  const requested = (layer.font || '').replace(/^[A-Z]{6}\+/, '')
  layer.requestedFont = requested
  layer.editable = false
  if (typeof FontFace === 'undefined' || !globalThis.document?.fonts) return layer.fontStatus = 'missing'
  const descriptors = { weight: String(layer.fontWeight || 'normal'), style: layer.fontStyle || 'normal' }
  async function load(source, status) {
    const face = await new FontFace(`DOOH_${++serial}`, source, descriptors).load()
    document.fonts.add(face)
    layer.font = face.family; layer.fontStatus = status; layer.editable = true
    return status
  }
  if (layer.fontData) {
    try { return await load(layer.fontData, 'embedded') } catch { /* Try the named local font. */ }
  }
  for (const file of files) {
    if (!fileData.has(file)) fileData.set(file, file.arrayBuffer().then(bytes => ({ bytes, names: fontNames(bytes) })))
    const { bytes, names } = await fileData.get(file)
    if (!names.some(name => name.toLowerCase() === requested.toLowerCase())) continue
    try { return await load(bytes, 'provided') } catch { /* A corrupt supplied face remains unresolved. */ }
  }
  // local() rejects unavailable faces; document.fonts.check() accepts fallback.
  try { return await load(`local(${JSON.stringify(requested)})`, 'local') } catch { /* No silent fallback. */ }
  if (/^(sans-serif|serif|monospace|cursive|fantasy|system-ui)$/.test(requested)) {
    layer.fontStatus = 'generic'; layer.editable = true; return 'generic'
  }
  return layer.fontStatus = 'missing'
}

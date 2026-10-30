import { zlibSync } from 'fflate'

/** Lossless RGB image PDF with a soft alpha mask. One source pixel maps to one
 * PDF point, unless UserUnit is needed to stay within the PDF page-size limit. */
export function encodeArtworkPdf(width: number, height: number, rgba: Uint8ClampedArray): Uint8Array {
  if (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || rgba.length !== width * height * 4) throw new Error('Invalid PDF image dimensions.')
  const rgb = new Uint8Array(width * height * 3), alpha = new Uint8Array(width * height)
  let transparent = false
  for (let p = 0; p < alpha.length; p++) {
    rgb[p * 3] = rgba[p * 4]; rgb[p * 3 + 1] = rgba[p * 4 + 1]; rgb[p * 3 + 2] = rgba[p * 4 + 2]
    alpha[p] = rgba[p * 4 + 3]; transparent ||= alpha[p] !== 255
  }
  const text = (value: string) => new TextEncoder().encode(value), parts: Uint8Array[] = [], offsets = [0]
  let size = 0
  const append = (bytes: Uint8Array) => { parts.push(bytes); size += bytes.length }
  const object = (id: number, body: string, stream?: Uint8Array) => {
    offsets[id] = size
    append(text(`${id} 0 obj\n${body}${stream ? ` /Length ${stream.length} >>\nstream\n` : '\n'}`))
    if (stream) { append(stream); append(text('\nendstream\n')) }
    append(text('endobj\n'))
  }
  append(text('%PDF-1.7\n%')); append(new Uint8Array([226, 227, 207, 211, 10]))
  const unit = Math.max(1, Math.ceil(Math.max(width, height) / 14400)), w = width / unit, h = height / unit
  object(1, '<< /Type /Catalog /Pages 2 0 R >>')
  object(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  object(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${h}] /UserUnit ${unit} /Resources << /XObject << /Artwork 4 0 R >> >> /Contents 5 0 R >>`)
  object(4, `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Interpolate false /Filter /FlateDecode${transparent ? ' /SMask 6 0 R' : ''}`, zlibSync(rgb))
  object(5, '<<', text(`q\n${w} 0 0 ${h} 0 0 cm\n/Artwork Do\nQ\n`))
  if (transparent) object(6, `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceGray /BitsPerComponent 8 /Filter /FlateDecode`, zlibSync(alpha))
  const xref = size
  append(text(`xref\n0 ${offsets.length}\n0000000000 65535 f \n${offsets.slice(1).map(offset => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')}trailer\n<< /Size ${offsets.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`))
  const result = new Uint8Array(size)
  let position = 0
  for (const part of parts) { result.set(part, position); position += part.length }
  return result
}

export function canvasPdf(canvas: HTMLCanvasElement): Uint8Array {
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Not enough memory to export PDF.')
  return encodeArtworkPdf(canvas.width, canvas.height, context.getImageData(0, 0, canvas.width, canvas.height).data)
}

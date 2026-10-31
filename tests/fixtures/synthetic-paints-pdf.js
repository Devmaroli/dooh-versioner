import { syntheticFontBase64 } from './synthetic-font.js'

export function syntheticPaintsPdf() {
  const font = Buffer.from(syntheticFontBase64, 'base64').toString('latin1')
  const content = 'q 0 0 160 40 re W n /Ax sh Q\nq 160 0 80 80 re W n /Rad sh Q\n0 0.8 0 rg BT /F1 30 Tf 10 100 Td (A) Tj (B) Tj ET\n'
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 240 140] /Resources << /Font << /F1 4 0 R >> /Shading << /Ax 7 0 R /Rad 8 0 R >> >> /Contents 9 0 R >>',
    '<< /Type /Font /Subtype /TrueType /BaseFont /DOOHSyntheticTriangle-Regular /Encoding /WinAnsiEncoding /FirstChar 65 /LastChar 66 /Widths [600 600] /FontDescriptor 5 0 R >>',
    '<< /Type /FontDescriptor /FontName /DOOHSyntheticTriangle-Regular /Flags 32 /FontBBox [0 -200 600 800] /ItalicAngle 0 /Ascent 800 /Descent -200 /CapHeight 700 /StemV 80 /FontFile2 6 0 R >>',
    `<< /Length ${font.length} /Length1 ${font.length} >>\nstream\n${font}\nendstream`,
    '<< /ShadingType 2 /ColorSpace /DeviceRGB /Coords [0 0 160 0] /Function << /FunctionType 2 /Domain [0 1] /C0 [1 0 0] /C1 [0 0 1] /N 1 >> /Extend [true true] >>',
    '<< /ShadingType 3 /ColorSpace /DeviceRGB /Coords [200 40 0 200 40 40] /Function << /FunctionType 2 /Domain [0 1] /C0 [1 1 1] /C1 [0 0 1] /N 1 >> /Extend [true true] >>',
    `<< /Length ${content.length} >>\nstream\n${content}endstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((obj, i) => { offsets.push(pdf.length); pdf += `${i + 1} 0 obj\n${obj}\nendobj\n` })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach(n => { pdf += `${String(n).padStart(10, '0')} 00000 n \n` })
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  return Buffer.from(pdf, 'latin1')
}

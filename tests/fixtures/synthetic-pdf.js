/** Two-page PDF with Helvetica text and one DeviceRGB image on page 1. Synthetic only. */
export function syntheticPdf() {
  const image = String.fromCharCode(255, 0, 0, 0, 255, 0, 0, 0, 255, 255, 255, 255)
  const page1 = 'q\n/GS1 gs\n80 0 0 40 40 40 cm\n/Im1 Do\nQ\nBT\n/F1 24 Tf\n40 120 Td\n(Page one headline) Tj\nET\n'
  const page2 = 'BT\n/F1 24 Tf\n40 120 Td\n(Page two headline) Tj\nET\n'
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R 7 0 R] /Count 2 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 320 180] /Resources << /ExtGState << /GS1 << /ca 0.5 /CA 0.5 >> >> /Font << /F1 4 0 R >> /XObject << /Im1 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Type /XObject /Subtype /Image /Width 2 /Height 2 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Length ${image.length} >>\nstream\n${image}endstream`,
    `<< /Length ${page1.length} >>\nstream\n${page1}endstream`,
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 320 180] /Resources << /Font << /F1 4 0 R >> >> /Contents 8 0 R >>',
    `<< /Length ${page2.length} >>\nstream\n${page2}endstream`,
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (let index = 0; index < objects.length; index++) {
    offsets.push(pdf.length)
    pdf += `${index + 1} 0 obj\n${objects[index]}\nendobj\n`
  }
  const startxref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let index = 1; index <= objects.length; index++) pdf += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`
  return Buffer.from(pdf, 'latin1')
}

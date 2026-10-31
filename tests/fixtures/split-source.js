// Synthetic outlined words and a magenta diamond border, deliberately not rectangular.
export const splitPath = 'M10 70L110 10L210 70L110 130Z M15 70L110 15L205 70L110 125Z M60 50h14v40h-14Z M77 50h14v40h-14Z M130 50h14v40h-14Z M147 50h14v40h-14Z'
export const splitSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 140"><path id="source" fill="#dd44bb" fill-rule="evenodd" d="${splitPath}"/></svg>`
export function splitPdf() {
  const stream = '1 0 0 -1 0 140 cm 0.8666667 0.2666667 0.7333333 rg 10 70 m 110 10 l 210 70 l 110 130 l h 15 70 m 110 15 l 205 70 l 110 125 l h 60 50 14 40 re 77 50 14 40 re 130 50 14 40 re 147 50 14 40 re f*\n'
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>', '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 220 140] /Resources << >> /Contents 4 0 R >>', `<< /Length ${stream.length} >>\nstream\n${stream}endstream`]
  let pdf = '%PDF-1.4\n'; const offsets = [0]
  for (let i = 0; i < objects.length; i++) { offsets.push(pdf.length); pdf += `${i+1} 0 obj\n${objects[i]}\nendobj\n` }
  const xref = pdf.length; pdf += `xref\n0 ${objects.length+1}\n0000000000 65535 f \n`
  for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10,'0')} 00000 n \n`
  return Buffer.from(pdf+`trailer\n<< /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`)
}

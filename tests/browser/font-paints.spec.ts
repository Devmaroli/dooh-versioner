import { expect, test } from '@playwright/test'
import { syntheticPaintsPdf } from '../fixtures/synthetic-paints-pdf.js'
import { settleSave } from './helpers'
import { syntheticFontBase64 } from '../fixtures/synthetic-font.js'

test('dropped synthetic font is verified by its internal family name; local faces use local()', async ({ page }) => {
  await page.goto('/')
  const result = await page.evaluate(async base64 => {
    const { parseSvgArtwork } = await import('/src/svgDocument.js')
    const { materializeSvgArtwork } = await import('/src/svgMaterialize.js')
    const data = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
    const font = new File([data], 'unrelated-name.ttf')
    const art = await materializeSvgArtwork(parseSvgArtwork('<svg viewBox="0 0 100 100"><text x="10" y="40" font-size="30" font-family="DOOH Synthetic Triangle">AB</text></svg>', 'test.svg', new Map([['font.ttf', font]])))
    const l = art.layers[0]
    const { resolveFont } = await import('/src/fontResolve.js')
    const local = { font: 'Arial' }; await resolveFont(local)
    return { status: l.fontStatus, editable: l.editable, pixels: !!l.px, local: local.fontStatus }
  }, syntheticFontBase64)
  expect(result).toEqual({ status: 'provided', editable: true, pixels: true, local: 'local' })
})

test('PDF embedded font and axial/radial shadings preserve colour, clipping and sequential text advances', async ({ page }) => {
  await page.goto('/')
  const result = await page.evaluate(async bytes => {
    const { artworkFromPdf } = await import('/src/pdfImport.js')
    const art = await artworkFromPdf(new Uint8Array(bytes))
    const text = art.layers.filter(l => l.kind === 'text').sort((a, b) => a.box[0] - b.box[0])
    const gradients = art.layers.filter(l => l.sourceKind === 'pdf-shading').sort((a, b) => a.box[0] - b.box[0])
    const sample = (l, x, y) => Array.from(l.px.getContext('2d').getImageData(x, y, 1, 1).data)
    return { warnings: art.warnings, text: text.map(l => ({ text: l.text, font: l.fontStatus, pixels: !!l.px, box: l.box })), gradients: gradients.map(l => ({ box: l.box, ir: l.shading?.slice(0, 2), pixel: sample(l, Math.floor(l.px.width / 2), Math.floor(l.px.height / 2)) })) }
  }, Array.from(syntheticPaintsPdf()))
  expect(result.warnings).toEqual([])
  expect(result.text).toHaveLength(2)
  expect(result.text.every(t => t.font === 'embedded' && t.pixels)).toBe(true)
  expect(result.text[1].box[0] - result.text[0].box[0]).toBeCloseTo(18, 0)
  expect(result.gradients).toHaveLength(2)
  expect(result.gradients[0].ir).toEqual(['RadialAxial', 'axial'])
  expect(result.gradients[1].ir).toEqual(['RadialAxial', 'radial'])
  expect(result.gradients[0].box[2]).toBeLessThanOrEqual(160)
  expect(result.gradients[0].pixel[0]).toBeGreaterThan(100)
  expect(result.gradients[0].pixel[2]).toBeGreaterThan(100)
})

test('PDF font load failure uses source glyph outlines and records review status', async ({ page }) => {
  await page.goto('/')
  const result = await page.evaluate(async bytes => {
    const Original = globalThis.FontFace
    globalThis.FontFace = class extends Original { load() { return Promise.reject(new Error('Synthetic font load failure')) } }
    try {
      const { artworkFromPdf } = await import('/src/pdfImport.js')
      const art = await artworkFromPdf(new Uint8Array(bytes))
      return art.layers.filter(l => l.kind === 'text').map(l => ({ status: l.fontStatus, editable: l.editable, pixels: !!l.px, paths: l.outlines?.length, matrix: l.outlines?.[0].transform, commands: l.outlines?.[0].commands }))
    } finally { globalThis.FontFace = Original }
  }, Array.from(syntheticPaintsPdf()))
  expect(result).toHaveLength(2)
  expect(result.every(l => l.status === 'outlined' && !l.editable && l.pixels && l.paths > 0 && l.matrix.length === 6 && l.commands.length > 0)).toBe(true)
})


test('SVG and companion font picked together keep the verified font after project recovery', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Saved on this device')).toBeVisible()
  await page.locator('input[type=file]').setInputFiles([
    { name: 'font-check_EN.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg viewBox="0 0 100 100"><text x="10" y="40" font-size="30" font-family="DOOH Synthetic Triangle">AB</text></svg>') },
    { name: 'original.ttf', mimeType: 'font/ttf', buffer: Buffer.from(syntheticFontBase64, 'base64') },
  ])
  await expect(page.getByLabel('Language for font-check_EN.svg')).toBeVisible()
  await settleSave(page)
  await page.getByRole('button', { name: 'Continue to Analyse' }).click()
  await expect(page.getByText('Font: DOOH Synthetic Triangle · provided', { exact: false })).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Language for font-check_EN.svg')).toBeVisible()
  await page.getByRole('button', { name: 'Continue to Analyse' }).click()
  await expect(page.getByText('Font: DOOH Synthetic Triangle · provided', { exact: false })).toBeVisible()
})

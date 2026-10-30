import { test, expect, Page } from '@playwright/test'
import { initializeCanvas, readPsd, writePsdBuffer } from 'ag-psd'
import { unzipSync } from 'fflate'
import fs from 'node:fs'
import { encodeArtworkPdf } from '../../src/exportPdf'
import { approveGuides } from './helpers'

initializeCanvas(() => { throw new Error('The test must decode into image data, not a canvas.') }, (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4), colorSpace: 'srgb' }))

function pixels(rgb: number[], width = 64, height = 64) {
  const data = new Uint8ClampedArray(width * height * 4)
  for (let i = 0; i < data.length; i += 4) data.set([...rgb, 255], i)
  return { width, height, data }
}
async function download(page: Page, format: string) {
  await page.getByLabel('Export format', { exact: true }).selectOption(format)
  page.once('dialog', d => d.accept())
  const downloading = page.waitForEvent('download')
  await page.getByRole('button', { name: format === 'png' ? 'Export review ZIP' : `Export ${format.toUpperCase()} ZIP`, exact: true }).click()
  const zip = unzipSync(fs.readFileSync((await (await downloading).path())!))
  const names = Object.keys(zip); expect(names).toHaveLength(1); expect(names[0]).toMatch(new RegExp(`EN_Alshaheed_-_Mupi_1080x1920.*\\.${format}$`))
  fs.writeFileSync(`work/export-check.${format}`, zip[names[0]])
  return zip[names[0]]
}
async function pngPixels(page: Page, bytes: Uint8Array) {
  return page.evaluate(async values => {
    const bitmap = await createImageBitmap(new Blob([new Uint8Array(values)], { type: 'image/png' })), c = document.createElement('canvas'); c.width = bitmap.width; c.height = bitmap.height
    const g = c.getContext('2d')!; g.drawImage(bitmap, 0, 0); bitmap.close()
    return { w: c.width, h: c.height, outside: Array.from(g.getImageData(0, 0, 1, 1).data), inside: Array.from(g.getImageData(Math.floor(c.width * .2), Math.floor(c.height * .2), 1, 1).data) }
  }, Array.from(bytes))
}
test('lossless PNG/PDF and layered PSD preserve resolution, transparency, native sources and single-applied opacity', async ({ page }) => {
  test.setTimeout(180000)
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message))
  const embedded = encodeArtworkPdf(8, 8, pixels([1, 2, 3], 8, 8).data), id = '00000000-1111-2222-3333-444444444444'
  const psd = writePsdBuffer({ width: 64, height: 64, imageData: pixels([80, 120, 160]), linkedFiles: [{ id, name: 'Original.ai', data: embedded, type: 'PDF ', creator: 'ART5' }], children: [
    { name: 'Hidden native object', hidden: true, left: 0, top: 0, imageData: pixels([1, 2, 3], 8, 8), placedLayer: { id, type: 'vector', transform: [0, 0, 8, 0, 8, 8, 0, 8], width: 8, height: 8 } },
    { name: 'Base texture', left: 0, top: 0, imageData: pixels([80, 120, 160]) },
    { name: 'Top headline', left: 0, top: 0, imageData: pixels([160, 80, 40]), blendMode: 'screen', opacity: .5 },
  ] }, { generateThumbnail: false })
  await page.goto('/'); await expect(page.getByText('Saved on this device')).toBeVisible()
  await page.locator('input[type=file]').setInputFiles({ name: 'formats_EN.psd', mimeType: 'application/octet-stream', buffer: psd })
  await page.getByRole('button', { name: 'Continue to Analyse' }).click()
  for (const [name, role] of [['Top headline', 'Main headline'], ['Base texture', 'Original background texture']]) {
    await page.locator('.analyse-layer').filter({ hasText: name }).click(); await page.getByRole('button', { name: role, exact: true }).click()
  }
  await page.getByRole('button', { name: /3 · Adapt/ }).click(); await page.getByRole('button', { name: 'Edit Alshaheed - Mupi', exact: true }).click()
  await page.getByRole('button', { name: 'Select layer Top headline', exact: true }).click()
  for (const [label, value] of [['Width (%)', '50'], ['X position (%)', '10'], ['Y position (%)', '10']]) await page.getByLabel(label, { exact: true }).fill(value)
  await page.getByRole('button', { name: 'Back to layout previews', exact: false }).click(); await approveGuides(page)
  await page.getByRole('button', { name: /6 · Export/ }).click()
  // Export one real preset, never a test-only dimension.
  while (await page.locator('.screens input[type=checkbox]:checked').count()) await page.locator('.screens input[type=checkbox]:checked').first().uncheck()
  await page.locator('.screens label').filter({ hasText: 'Alshaheed - Mupi 1080×1920' }).getByRole('checkbox').check()
  const png = await download(page, 'png'), reference = await pngPixels(page, png)
  expect(reference).toEqual({ w: 1080, h: 1920, outside: [80, 120, 160, 255], inside: [135, 141, 167, 255] })
  const bytes = await download(page, 'psd'), decoded = readPsd(bytes, { useImageData: true }), original = decoded.children![0]
  expect([decoded.width, decoded.height]).toEqual([1080, 1920]); expect(original.hidden).toBe(true); expect(original.children).toHaveLength(3)
  expect(original.children![0].placedLayer?.id).toBe(id); expect(Array.from(decoded.linkedFiles![0].data!)).toEqual(Array.from(embedded))
  const headline = decoded.children!.find(layer => layer.name === 'Top headline')!
  expect(headline.blendMode).toBe('screen'); expect(headline.opacity).toBeCloseTo(.5, 2); expect(headline.imageData!.data[3]).toBe(255)
  expect(Array.from(decoded.imageData!.data.slice((384 * 1080 + 216) * 4, (384 * 1080 + 216) * 4 + 4))).toEqual(reference.inside)
  expect(bytes.length).toBeLessThan(1080 * 1920 * 4)
  const pdf = await download(page, 'pdf')
  await page.route('**/pdf-check.mjs', route => route.fulfill({ path: 'node_modules/pdfjs-dist/build/pdf.mjs', contentType: 'text/javascript' }))
  await page.route('**/pdf-check-worker.mjs', route => route.fulfill({ path: 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs', contentType: 'text/javascript' }))
  const checked = await page.evaluate(async values => {
    const pdf = await (new Function('return import("/pdf-check.mjs")')()), worker = `${location.origin}/pdf-check-worker.mjs`; pdf.GlobalWorkerOptions.workerSrc = worker
    const task = pdf.getDocument({ data: new Uint8Array(values), isEvalSupported: false }), doc = await task.promise, page = await doc.getPage(1), viewport = page.getViewport({ scale: 1 })
    const c = document.createElement('canvas'); c.width = viewport.width; c.height = viewport.height
    await page.render({ canvasContext: c.getContext('2d'), viewport }).promise
    const result = { w: c.width, h: c.height, pixel: Array.from(c.getContext('2d')!.getImageData(216, 384, 1, 1).data) }; await task.destroy(); return result
  }, Array.from(pdf))
  expect(checked).toEqual({ w: 1080, h: 1920, pixel: reference.inside }); expect(pdf.length).toBeLessThan(100000)
  await page.getByLabel('Export format', { exact: true }).selectOption('png'); await page.getByLabel('Transparent background', { exact: true }).check()
  const transparent = await pngPixels(page, await download(page, 'png'))
  expect(transparent.outside).toEqual([0, 0, 0, 0]); expect(transparent.inside[3]).toBeCloseTo(128, 0)
  expect(transparent.inside.slice(0, 3)).toEqual([159, 80, 40])
  await page.screenshot({ path: 'work/export-format-options.png' }); expect(errors).toEqual([])
})

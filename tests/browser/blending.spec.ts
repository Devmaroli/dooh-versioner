import { expect, test } from '@playwright/test'
import { writePsdBuffer } from 'ag-psd'
import fs from 'node:fs'
import { unzipSync } from 'fflate'
import { approveGuides } from './helpers'

function pixels(color: number[]) {
  const data = new Uint8ClampedArray(64 * 64 * 4)
  for (let i = 0; i < data.length; i += 4) data.set([...color, 255], i)
  return { width: 64, height: 64, data }
}

test('all 27 compositing modes render RGBA pixels, including native modes and custom tiled operations', async ({ page }) => {
  await page.goto('/')
  await page.addScriptTag({ type: 'module', content: fs.readFileSync('src/blending.js', 'utf8').replaceAll('export ', '') + '\nwindow.__blend = { BLEND_MODES, compositeDraw, blendPixel };' })
  await page.waitForFunction(() => !!(window as any).__blend)
  const failures = await page.evaluate(() => {
    const api = (window as any).__blend, failures: string[] = []
    for (const mode of api.BLEND_MODES) {
      const c = document.createElement('canvas'); c.width = 4; c.height = 4
      const g = c.getContext('2d')!; g.fillStyle = 'rgb(80,120,160)'; g.fillRect(0, 0, 4, 4)
      api.compositeDraw(g, (ctx: CanvasRenderingContext2D) => { ctx.fillStyle = 'rgb(160,80,40)'; ctx.fillRect(0, 0, 4, 4) }, { blend: mode, opacity: .5 }, { x: 0, y: 0, w: 4, h: 4 })
      const actual = Array.from(g.getImageData(0, 0, 1, 1).data), expected = api.blendPixel([80,120,160,255], [160,80,40,255], mode, .5)
      if (mode === 'dissolve') { if (![80,160].includes(actual[0])) failures.push(mode) }
      else if (actual.some((v, i) => Math.abs(v - expected[i]) > 2)) failures.push(`${mode}: ${actual} != ${expected}`)
    }
    return failures
  })
  expect(failures).toEqual([])
})

test('PSD appearance imports into controls, blends once against background, persists and matches PNG export', async ({ page }) => {
  test.setTimeout(180000)
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message))
  const psd = writePsdBuffer({ width: 64, height: 64, imageData: pixels([80,120,160]), children: [
    { name: 'Base texture', left: 0, top: 0, imageData: pixels([80,120,160]) },
    { name: 'Top headline', left: 0, top: 0, imageData: pixels([160,80,40]), blendMode: 'screen', opacity: .5 },
  ] }, { generateThumbnail: false })
  await page.goto('/'); await expect(page.getByText('Saved on this device')).toBeVisible()
  await page.locator('input[type=file]').setInputFiles({ name: 'blend_EN.psd', mimeType: 'application/octet-stream', buffer: psd })
  await page.getByRole('button', { name: 'Continue to Analyse' }).click()
  await page.locator('.analyse-layer').filter({ hasText: 'Top headline' }).click(); await page.getByRole('button', { name: 'Main headline', exact: true }).click()
  await page.locator('.analyse-layer').filter({ hasText: 'Base texture' }).click(); await page.getByRole('button', { name: 'Original background texture', exact: true }).click()
  await page.getByRole('button', { name: /3 · Adapt/ }).click(); await page.getByRole('button', { name: 'Edit Alshaheed - Mupi', exact: true }).click()
  await page.getByRole('button', { name: 'Select layer Top headline', exact: true }).click()
  const mode = page.getByLabel('Layer blend mode', { exact: true }), opacity = page.getByLabel('Layer opacity', { exact: true })
  await expect(mode).toHaveValue('screen'); await expect(opacity).toHaveValue('50')
  await expect(mode.locator('optgroup')).toHaveCount(6); await expect(mode.locator('option')).toHaveCount(27)
  await page.getByLabel('Width (%)', { exact: true }).fill('50'); await page.getByLabel('X position (%)', { exact: true }).fill('10'); await page.getByLabel('Y position (%)', { exact: true }).fill('10')
  const sample = () => page.locator('.calibration-canvas-frame canvas').evaluate((c: HTMLCanvasElement) => Array.from(c.getContext('2d')!.getImageData(Math.floor(c.width * .2), Math.floor(c.height * .2), 1, 1).data))
  const close = (actual: number[], expected: number[]) => actual.forEach((v, i) => expect(Math.abs(v - expected[i])).toBeLessThanOrEqual(2))
  close(await sample(), [135,141,168,255])
  await mode.selectOption('linear-dodge'); close(await sample(), [160,160,180,255])
  await opacity.focus(); await page.keyboard.press('Home'); close(await sample(), [80,120,160,255])
  await page.keyboard.press('End'); close(await sample(), [240,200,200,255])
  await page.getByRole('button', { name: 'Undo', exact: true }).click(); await expect(opacity).toHaveValue('50'); close(await sample(), [160,160,180,255])
  await page.getByRole('button', { name: 'Redo', exact: true }).click(); await expect(opacity).toHaveValue('100'); close(await sample(), [240,200,200,255])
  await page.screenshot({ path: 'work/layer-blending-controls.png' })
  await page.getByRole('button', { name: 'Back to five previews', exact: false }).click(); await expect(page.getByText('Saved on this device')).toBeVisible()
  await page.reload(); await page.getByRole('button', { name: /3 · Adapt/ }).click(); await page.getByRole('button', { name: 'Edit Alshaheed - Mupi', exact: true }).click()
  await page.getByRole('button', { name: 'Select layer Top headline', exact: true }).click()
  await expect(mode).toHaveValue('linear-dodge'); await expect(opacity).toHaveValue('100')
  await page.getByRole('button', { name: 'Reset to imported appearance', exact: true }).click()
  await expect(mode).toHaveValue('screen'); await expect(opacity).toHaveValue('50'); close(await sample(), [135,141,168,255])
  await mode.selectOption('linear-dodge')
  await page.getByRole('button', { name: 'Back to five previews', exact: false }).click(); await approveGuides(page)
  page.once('dialog', d => d.accept()); const downloading = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export review ZIP', exact: true }).click()
  const zip = unzipSync(fs.readFileSync((await (await downloading).path())!)), filename = Object.keys(zip).find(name => /1080x1920\.png$/.test(name))!
  expect(filename).toBeDefined()
  const pixel = await page.evaluate(async bytes => {
    const bitmap = await createImageBitmap(new Blob([new Uint8Array(bytes)], { type: 'image/png' })), c = document.createElement('canvas'); c.width = bitmap.width; c.height = bitmap.height
    const g = c.getContext('2d')!; g.drawImage(bitmap, 0, 0); return Array.from(g.getImageData(216, 384, 1, 1).data)
  }, Array.from(zip[filename]))
  close(pixel, [160,160,180,255]); expect(errors).toEqual([])
})

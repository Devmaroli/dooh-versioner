import { expect, test } from '@playwright/test'
import { initializeCanvas, readPsd } from 'ag-psd'
initializeCanvas(() => { throw new Error('Decode as image data') }, (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }))

test('SVG gradients survive the actual layered PSD export as coloured pixels', async ({ page }) => {
  await page.goto('/')
  const bytes = await page.evaluate(async () => {
    const { importSvgText, renderCalibration } = await import('/src/engine/render.js')
    const { exportLayeredPsd } = await import('/src/engine/exportPsd.js')
    const art = await importSvgText('<svg viewBox="0 0 100 100"><defs><linearGradient id="g"><stop stop-color="#ff0000"/><stop offset="1" stop-color="#0000ff"/></linearGradient></defs><rect id="gradient" x="10" y="10" width="80" height="80" fill="url(#g)"/></svg>', 'synthetic_EN.svg')
    const id = art.a.layers[0].id
    art.an.roles = [{ id, role: 'other', confidence: 1 }]
    const screen = { name: 'Synthetic square', w: 100, h: 100 }
    art.calibration = { enabled: true, proofs: { compact: { screen, frames: { [`layer:${id}`]: { x: .1, y: .1, w: .8, h: .8 } } } } }
    const rendered = renderCalibration(art, screen, 100, 100)
    await rendered.ready
    return Array.from(await exportLayeredPsd(art, screen, rendered.c))
  })
  const psd = readPsd(new Uint8Array(bytes), { useImageData: true })
  const layer = psd.children!.find(l => l.name === 'gradient')!
  expect(layer.imageData).toBeDefined()
  const { data, width, height } = layer.imageData!
  const pixel = x => Array.from(data.slice((Math.floor(height / 2) * width + x) * 4, (Math.floor(height / 2) * width + x) * 4 + 4))
  expect(pixel(2)[0]).toBeGreaterThan(240)
  expect(pixel(width - 3)[2]).toBeGreaterThan(240)
})

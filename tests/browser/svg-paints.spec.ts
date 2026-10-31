import { expect, test } from '@playwright/test'
import { svgPaints } from '../fixtures/svg-paints.js'

test('SVG class colours and native linear/radial gradient pixels survive materialization', async ({ page }) => {
  await page.goto('/')
  const pixels = await page.evaluate(async source => {
    const { parseSvgArtwork } = await import('/src/svgDocument.js')
    const { materializeSvgArtwork } = await import('/src/svgMaterialize.js')
    const artwork = await materializeSvgArtwork(parseSvgArtwork(source))
    const flat = nodes => nodes.flatMap(n => [n, ...flat(n.children || [])])
    const layers = flat(artwork.layers)
    const pixel = (name, x, y) => Array.from(layers.find(n => n.name === name).px.getContext('2d').getImageData(x, y, 1, 1).data)
    return { red: pixel('class', 10, 10), yellow: pixel('inline', 10, 10), linearStart: pixel('linear-box', 2, 10), linearEnd: pixel('linear-box', 97, 10), radialCentre: pixel('radial-box', 20, 20), radialEdge: pixel('radial-box', 1, 20) }
  }, svgPaints)
  expect(pixels.red).toEqual([255, 0, 0, 255])
  expect(pixels.yellow).toEqual([255, 255, 0, 255])
  expect(pixels.linearStart[0]).toBeGreaterThan(240)
  expect(pixels.linearEnd[2]).toBeGreaterThan(240)
  expect(pixels.radialCentre[0]).toBeGreaterThan(230)
  expect(pixels.radialEdge[2]).toBe(255)
  expect(pixels.radialEdge[0]).toBeLessThan(30)
})

test('defs PNG/JPEG images keep RGB channels and huge raster canvases are bounded', async ({ page }) => {
  await page.goto('/')
  const result = await page.evaluate(async () => {
    const { parseSvgArtwork } = await import('/src/svgDocument.js')
    const { materializeSvgArtwork } = await import('/src/svgMaterialize.js')
    const source = document.createElement('canvas'); source.width = 5000; source.height = 2
    const ctx = source.getContext('2d')!; ctx.fillStyle = '#20a0e0'; ctx.fillRect(0, 0, 5000, 2)
    const out = []
    for (const mime of ['image/png', 'image/jpeg']) {
      const art = parseSvgArtwork(`<svg viewBox="0 0 100 100"><defs><image id="image" width="5000" height="2" href="${source.toDataURL(mime)}"/></defs><use href="#image"/></svg>`)
      await materializeSvgArtwork(art)
      const px = art.layers[0].children[0].px
      out.push({ width: px.width, pixel: Array.from(px.getContext('2d').getImageData(10, 0, 1, 1).data) })
    }
    return out
  })
  for (const item of result) {
    expect(item.width).toBeLessThanOrEqual(4096)
    expect(item.pixel[0]).toBeLessThan(40)
    expect(item.pixel[1]).toBeGreaterThan(150)
    expect(item.pixel[2]).toBeGreaterThan(210)
  }
})

test('unavailable SVG fonts are explicit and never draw fallback text', async ({ page }) => {
  await page.goto('/')
  const result = await page.evaluate(async () => {
    const { parseSvgArtwork } = await import('/src/svgDocument.js')
    const { materializeSvgArtwork } = await import('/src/svgMaterialize.js')
    const art = await materializeSvgArtwork(parseSvgArtwork('<svg viewBox="0 0 100 100"><text x="2" y="20" font-family="SyntheticMissingFaceXYZ">No fallback</text></svg>'))
    return { status: art.layers[0].fontStatus, editable: art.layers[0].editable, pixels: !!art.layers[0].px, warnings: art.warnings }
  })
  expect(result.status).toBe('missing')
  expect(result.editable).toBe(false)
  expect(result.pixels).toBe(false)
  expect(result.warnings.join(' ')).toContain('no substitute rendered')
})

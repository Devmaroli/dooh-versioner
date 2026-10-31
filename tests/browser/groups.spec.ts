import { expect, test } from '@playwright/test'
import { writePsdBuffer } from 'ag-psd'

function pixels(rgb: number[]) {
  const data = new Uint8ClampedArray(32 * 32 * 4)
  for (let i = 0; i < data.length; i += 4) data.set([...rgb, 255], i)
  return { width: 32, height: 32, data }
}

test('analyse shows roles, artwork and a persistent layer tree side by side', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  const buffer = writePsdBuffer({ width: 64, height: 64, children: [{ name: 'Campaign folder', children: [{ name: 'Leaf red', left: 0, top: 0, imageData: pixels([180, 40, 40]) }, { name: 'Leaf blue', left: 32, top: 0, imageData: pixels([40, 80, 180]) }] }] }, { generateThumbnail: false })
  await page.goto('/')
  await expect(page.getByText('Saved on this device')).toBeVisible()
  await page.locator('input[type=file]').setInputFiles({ name: 'grouped_EN.psd', mimeType: 'application/octet-stream', buffer })
  await page.getByRole('button', { name: 'Continue to Analyse' }).click()
  const roles = page.getByRole('complementary', { name: 'Layer roles' })
  const art = page.getByRole('group', { name: 'Artwork background selection' })
  const layers = page.getByRole('complementary', { name: 'Artwork layers' })
  await expect(roles.getByRole('heading', { name: 'What is this layer?' })).toBeVisible()
  await expect(layers.getByRole('treeitem', { name: /Campaign folder/ })).toHaveAttribute('aria-expanded', 'true')
  const boxes = await Promise.all([roles, art, layers].map(locator => locator.boundingBox()))
  expect(boxes[0]!.x).toBeLessThan(boxes[1]!.x)
  expect(boxes[1]!.x + boxes[1]!.width).toBeLessThanOrEqual(boxes[2]!.x + 2)
  expect(boxes[0]!.y).toBeLessThan(900)
  expect(boxes[2]!.y).toBeLessThan(900)
  await page.screenshot({ path: 'work/analyse-three-columns.png' })
  await layers.getByRole('button', { name: 'Collapse Campaign folder', exact: true }).click()
  await expect(layers.getByRole('treeitem', { name: /Campaign folder/ })).toHaveAttribute('aria-expanded', 'false')
  await expect(layers.getByRole('treeitem', { name: /Leaf red/ })).toHaveCount(0)
  await expect(page.getByText('Saved on this device')).toBeVisible()
  await page.waitForTimeout(400)
  await page.reload()
  await page.getByRole('button', { name: 'Continue to Analyse' }).click()
  await expect(page.getByRole('treeitem', { name: /Campaign folder/ })).toHaveAttribute('aria-expanded', 'false')
  await page.setViewportSize({ width: 1280, height: 800 })
  const again = await Promise.all([roles, art, layers].map(locator => locator.boundingBox()))
  expect(again[0]!.x).toBeLessThan(again[1]!.x)
  expect(again[2]!.x).toBeGreaterThan(again[1]!.x)
})

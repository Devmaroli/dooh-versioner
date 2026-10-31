import { approveGuides } from './helpers'
import { expect, test } from '@playwright/test'
import fs from 'node:fs'
import { unzipSync } from 'fflate'

test('imports, corrects language, tags, recovers and removes only one duplicate-named asset', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', e => errors.push(e.message))
  await page.goto('/')
  await expect(page.getByText('Saved on this device')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Continue to Analyse' })).toBeDisabled()
  await expect(page.getByRole('button', { name: /4 · Review/ })).toBeDisabled()
  await page.getByRole('button', { name: 'Try sample PSD' }).click()
  await expect(page.getByLabel('Language for sample.psd')).toBeVisible()
  await page.getByLabel('Language for sample.psd').selectOption('EN')
  await page.getByRole('button', { name: 'Try sample PSD' }).click()
  await expect(page.getByLabel('Language for sample.psd')).toHaveCount(2)
  await page.getByLabel('Language for sample.psd').nth(1).selectOption('AR')
  await page.getByRole('button', { name: 'Continue to Analyse' }).click()
  await expect(page.getByRole('complementary', { name: 'Layers panel' })).toBeVisible()
  await page.getByRole('button', { name: 'Main headline', exact: true }).click()
  await expect(page.locator('.tagger-controls')).toContainText('1 of')
  await page.getByText('Placement & preservation', { exact: true }).click()
  await page.getByLabel('Required in every adaptation').uncheck()
  await expect(page.getByText('Saved on this device')).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Language for sample.psd')).toHaveCount(2)
  await expect(page.getByLabel('Language for sample.psd').nth(1)).toHaveValue('AR')
  await page.getByRole('button', { name: 'Continue to Analyse' }).click()
  await expect(page.getByRole('button', { name: 'Main headline', exact: true })).toHaveClass('chosen')
  await page.getByText('Placement & preservation', { exact: true }).click()
  await expect(page.getByLabel('Required in every adaptation')).not.toBeChecked()
  await page.getByRole('button', { name: 'Manage files' }).click()
  page.on('dialog', dialog => dialog.accept())
  await page.getByRole('button', { name: 'Remove sample.psd', exact: true }).first().click()
  await expect(page.getByLabel('Language for sample.psd')).toHaveCount(1)
  await expect(page.getByLabel('Language for sample.psd')).toHaveValue('AR')
  await expect(page.getByText('Saved on this device')).toBeVisible()
  await page.reload()
  await expect(page.getByLabel('Language for sample.psd')).toHaveCount(1)
  await approveGuides(page)
  const downloading = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export review ZIP', exact: true }).click()
  const download = await downloading
  const zip = unzipSync(fs.readFileSync((await download.path())!))
  expect(Object.keys(zip)).toHaveLength(6)
  for (const [filename, png] of Object.entries(zip)) {
    expect(filename).toMatch(/^AR_/)
    const match = filename.match(/_(\d+)x(\d+)\.png$/)!
    const header = new DataView(png.buffer, png.byteOffset, png.byteLength)
    expect(header.getUint32(16)).toBe(Number(match[1]))
    expect(header.getUint32(20)).toBe(Number(match[2]))
  }
  expect(errors).toEqual([])
})

test('one broken import does not prevent the following valid file; PNG stays flattened', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Saved on this device')).toBeVisible()
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=', 'base64')
  await page.locator('input[type=file]').setInputFiles([
    { name: 'bad.psd', mimeType: 'application/octet-stream', buffer: Buffer.from('bad') },
    { name: 'master_EN.png', mimeType: 'image/png', buffer: png },
  ])
  await expect(page.getByLabel('Language for master_EN.png')).toBeVisible()
  await expect(page.locator('.err')).toContainText('bad.psd')
  await expect(page.locator('.import-asset')).toContainText('Flattened')
  await page.getByRole('button', { name: 'Continue to Analyse' }).click()
  await expect(page.getByText('A flattened image needs a layered PSD', { exact: false })).toBeVisible()
  await expect(page.locator('.tiles .cap').filter({ hasText: /^AR/ })).toHaveCount(0)
})

test('IKEA PSD imports with off-canvas background and survives recovery', async ({ page }) => {
  const fixture = process.env.IKEA_PSD
  test.skip(!fixture || !fs.existsSync(fixture), 'Set IKEA_PSD to the private local fixture; artwork is never committed.')
  await page.goto('/')
  await expect(page.getByText('Saved on this device')).toBeVisible()
  await page.locator('input[type=file]').setInputFiles(fixture!)
  await expect(page.getByLabel('Language for ikea.psd')).toBeVisible()
  await page.getByLabel('Language for ikea.psd').selectOption('EN')
  await page.getByRole('button', { name: 'Continue to Analyse' }).click()
  await expect(page.locator('button.lp-name', { hasText: /^bg$/ })).toBeVisible()
  await page.locator('button.lp-name', { hasText: /^bg$/ }).click()
  await expect(page.locator('.tagger-visual')).toContainText('2964 × 1653')
  await page.getByRole('button', { name: 'Original background texture', exact: true }).click()
  await expect(page.getByText('Saved on this device')).toBeVisible()
  await page.screenshot({ path: 'work/ikea-analyse.png', fullPage: true })
  await page.reload()
  await expect(page.getByLabel('Language for ikea.psd')).toHaveValue('EN')
})

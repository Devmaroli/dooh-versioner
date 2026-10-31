import { expect, test } from '@playwright/test'
import { syntheticPdf } from '../fixtures/synthetic-pdf.js'

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=', 'base64')

function poster(link = 'photo.png') {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 100">
    <defs><clipPath id="crop"><rect x="90" y="30" width="20" height="20"/></clipPath></defs>
    <g id="lockup"><path id="mark" d="M10 10h20v20h-20z"/><text x="12" y="48" font-size="16">Weekend offer</text></g>
    <image id="embedded-photo" href="data:image/png;base64,${PNG.toString('base64')}" x="80" y="10" width="40" height="40" opacity="0.5" transform="translate(10,20)" clip-path="url(#crop)"/>
    <image xlink:href="photos/${link}" x="140" y="10" width="30" height="30"/>
  </svg>`)
}

test('svg and pdf imports keep vectors, embedded images and a relink for a missing file', async ({ page }) => {
  const remote: string[] = []
  page.on('request', request => {
    const url = new URL(request.url())
    if (url.protocol === 'blob:' && url.origin === 'http://127.0.0.1:4173') return
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') return
    remote.push(request.url())
  })
  await page.goto('/')
  await expect(page.getByText('Saved on this device')).toBeVisible()
  await page.locator('input[type=file]').setInputFiles({ name: 'poster_EN.svg', mimeType: 'image/svg+xml', buffer: poster('other.png') })
  await expect(page.getByLabel('Language for poster_EN.svg')).toBeVisible()
  await page.getByRole('button', { name: 'Continue to Analyse' }).click()
  await expect(page.getByRole('button', { name: 'Weekend offer', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'mark', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'lockup', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'embedded-photo', exact: true })).toBeVisible()
  await expect(page.getByRole('status').filter({ hasText: 'Missing linked image other.png. Needs review.' })).toBeVisible()
  await page.getByRole('button', { name: 'embedded-photo', exact: true }).click()
  await expect(page.locator('.tagger-visual')).toContainText('embedded')
  await page.getByLabel('Relink missing images').setInputFiles({ name: 'other.png', mimeType: 'image/png', buffer: PNG })
  await expect(page.getByText('Missing linked image other.png. Needs review.')).toHaveCount(0)
  await page.getByRole('button', { name: 'other.png', exact: true }).click()
  await expect(page.locator('.tagger-visual')).toContainText('linked')
  await page.getByRole('button', { name: /1 · Import/ }).click()
  await page.locator('input[type=file]').setInputFiles([
    { name: 'with-photo_EN.svg', mimeType: 'image/svg+xml', buffer: poster('photo.png') },
    { name: 'photo.png', mimeType: 'image/png', buffer: PNG },
  ])
  await expect(page.getByLabel('Language for with-photo_EN.svg')).toBeVisible()
  await page.getByRole('button', { name: 'Continue to Analyse' }).click()
  await page.getByLabel('Artwork to analyse').selectOption({ label: 'with-photo_EN.svg' })
  await expect(page.getByText('Missing linked image')).toHaveCount(0)
  await page.getByRole('button', { name: 'photo.png', exact: true }).click()
  await expect(page.locator('.tagger-visual')).toContainText('linked')
  await page.getByRole('button', { name: /1 · Import/ }).click()
  await page.locator('input[type=file]').setInputFiles({ name: 'pages_EN.pdf', mimeType: 'application/pdf', buffer: syntheticPdf() })
  await expect(page.getByLabel('Language for pages_EN.pdf')).toBeVisible()
  await expect(page.getByLabel('PDF page for pages_EN.pdf')).toHaveValue('1')
  await page.getByRole('button', { name: 'Continue to Analyse' }).click()
  await page.getByLabel('Artwork to analyse').selectOption({ label: 'pages_EN.pdf' })
  await expect(page.getByRole('button', { name: 'Page one headline', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Image 1', exact: true })).toBeVisible()
  await page.getByLabel('PDF page').selectOption('2')
  await expect(page.getByRole('button', { name: 'Page two headline', exact: true })).toBeVisible()
  expect(remote).toEqual([])
})

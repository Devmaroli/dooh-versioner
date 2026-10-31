import { test, expect, chromium, Page } from '@playwright/test'
import { readPsd, writePsdBuffer } from 'ag-psd'
import { unzipSync } from 'fflate'
import path from 'node:path'
import fs from 'node:fs'
import os from 'node:os'

async function onlyMupi(page: Page) {
  await page.getByText(/Choose target screens ·/).click()
  while (await page.locator('.screens input:checked').count()) await page.locator('.screens input:checked').first().uncheck()
  await page.locator('.screens label').filter({ hasText: 'Alshaheed - Mupi 1080×1920' }).getByRole('checkbox').check()
}
const profileRoot = path.resolve(process.env.STUDIO_EXTENSION_PROFILE_ROOT || path.join(os.tmpdir(), 'dooh-extension-profiles'))
function profile() { fs.mkdirSync(profileRoot,{recursive:true});return fs.mkdtempSync(path.join(profileRoot,'studio-')) }
function removeProfile(folder: string) { const target=path.resolve(folder);if(!target.startsWith(profileRoot+path.sep))throw new Error('Unexpected test profile path');fs.rmSync(target,{recursive:true,force:true}) }
function pixels(rgb: number[]) { const data = new Uint8ClampedArray(64 * 64 * 4); for (let i = 0; i < data.length; i += 4) data.set([...rgb, 255], i); return { width: 64, height: 64, data } }

test('actual MV3 origin works offline, escapes artwork names, persists, exports all formats and blocks external connections', async ({}, info) => {
  const extension = path.resolve('dist-extension'), manifest = JSON.parse(fs.readFileSync(path.join(extension, 'manifest.json'), 'utf8'))
  expect(manifest.permissions || []).toEqual([]); expect(manifest.host_permissions || []).toEqual([]); expect(manifest.content_scripts || []).toEqual([])
  const folder=profile(), context = await chromium.launchPersistentContext(folder, { channel: 'chromium', headless: true, acceptDownloads: true, args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`] })
  try {
    const requests: string[] = [], errors: string[] = []
    context.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()) })
    context.on('page', page => page.on('pageerror', error => errors.push(error.message)))
    const manager = await context.newPage(); await manager.goto('chrome://extensions')
    const item = manager.locator('extensions-item').filter({ hasText: 'DOOH Creative Studio' }); await expect(item).toHaveCount(1)
    const id = await item.getAttribute('id'), origin = `chrome-extension://${id}`; await manager.close()
    await context.setOffline(true)
    const popup = await context.newPage(); await popup.goto(`${origin}/popup.html`)
    await expect(popup.getByText(`v${manifest.version}`, { exact: false })).toBeVisible(); await expect(popup.locator('body')).not.toContainText('Kapildev')
    const opening = context.waitForEvent('page'); await popup.getByRole('link', { name: 'Open Studio', exact: true }).click()
    const page = await opening; await page.waitForURL(`${origin}/index.html`); await expect(page.getByText('Saved on this device')).toBeVisible()
    await expect(page).toHaveTitle('DOOH Creative Studio')
    await expect(page.getByLabel(`Version ${manifest.version}`, { exact: true })).toBeVisible(); await expect(page.locator('body')).not.toContainText('Kapildev')
    await page.evaluate(() => { const violations: string[] = []; document.addEventListener('securitypolicyviolation', event => violations.push(event.effectiveDirective)); Reflect.set(window, 'violations', violations) })
    await page.locator('input[type=file]').setInputFiles({ name: 'wasm-check_EN.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg viewBox="0 0 40 40"><rect id="WASM shape" width="40" height="40" fill="#ff0000"/></svg>') })
    await expect(page.getByLabel('Language for wasm-check_EN.svg')).toBeVisible()
    expect(await page.evaluate(() => Reflect.get(window, 'violations'))).toEqual([])
    await page.getByRole('button', { name: 'Remove wasm-check_EN.svg', exact: true }).click()
    const hostile = '<img src="https://invalid.example/leak" onerror="window.injected=true">'
    const psd = writePsdBuffer({ width: 64, height: 64, imageData: pixels([80, 120, 160]), children: [{ name: 'Base texture', left: 0, top: 0, imageData: pixels([80, 120, 160]) }, { name: hostile, left: 0, top: 0, imageData: pixels([160, 80, 40]), blendMode: 'screen', opacity: .5 }] }, { generateThumbnail: false })
    await page.locator('input[type=file]').setInputFiles({ name: 'secure_EN.psd', mimeType: 'application/octet-stream', buffer: psd }); await onlyMupi(page)
    await page.getByRole('button', { name: 'Continue to Analyse' }).click()
    for (const [name, role] of [[hostile, 'Main headline'], ['Base texture', 'Original background texture']]) { await page.locator('.analyse-layer').filter({ hasText: name }).click(); await page.getByRole('button', { name: role, exact: true }).click() }
    expect(await page.evaluate(() => Reflect.get(window, 'injected'))).toBeUndefined(); await expect(page.locator('img[src^="https:"]')).toHaveCount(0)
    await page.getByRole('button', { name: /3 · Adapt/ }).click(); await expect(page.locator('.calibration-card')).toHaveCount(1)
    await page.getByRole('button', { name: 'Edit Alshaheed - Mupi', exact: true }).click(); await page.getByRole('button', { name: 'Approve this guide', exact: true }).click(); await page.getByRole('button', { name: 'Back to layout previews', exact: false }).click()
    await page.getByRole('button', { name: 'Use these guides for full adaptation', exact: true }).click(); await page.getByRole('button', { name: /5 · Export/ }).click()
    for (const format of ['png', 'pdf', 'psd']) {
      await page.getByLabel('Export format', { exact: true }).selectOption(format); page.once('dialog', dialog => dialog.accept())
      const downloading = page.waitForEvent('download'); await page.getByRole('button', { name: format === 'png' ? 'Export review ZIP' : `Export ${format.toUpperCase()} ZIP`, exact: true }).click()
      const files = unzipSync(fs.readFileSync((await (await downloading).path())!)), key = Object.keys(files)[0]
      expect(Object.keys(files)).toHaveLength(1); expect(key).toContain(`1080x1920.${format}`)
      if (format === 'psd') { const decoded = readPsd(files[key], { skipLayerImageData: true, skipCompositeImageData: true, skipThumbnail: true }); expect([decoded.width, decoded.height]).toEqual([1080, 1920]); expect(decoded.children!.some(layer => layer.name === hostile && layer.blendMode === 'screen')).toBe(true) }
    }
    expect(await page.evaluate(() => Reflect.get(window, 'violations'))).toEqual([])
    await expect(page.getByText('Saved on this device')).toBeVisible(); await page.reload(); await expect(page.getByText('Saved on this device')).toBeVisible()
    await page.getByRole('button', { name: /5 · Export/ }).click(); await page.screenshot({ path: 'work/chrome-extension-offline.png' })
    const again = await context.newPage(); await again.goto(`${origin}/popup.html`); await again.getByRole('link', { name: 'Open Studio', exact: true }).click()
    expect(context.pages().filter(p => p.url() === `${origin}/index.html`)).toHaveLength(1)
    // A policy violation, rather than an offline network error, proves CSP blocks a connection before dispatch.
    const blocked = await page.evaluate(async () => { const violations: string[] = []; document.addEventListener('securitypolicyviolation', event => violations.push(event.effectiveDirective)); try { await fetch('https://invalid.example/security-probe') } catch {} await new Promise(resolve => setTimeout(resolve, 30)); return violations })
    expect(blocked).toContain('connect-src'); expect(requests).toEqual([]); expect(errors).toEqual([])
    fs.writeFileSync('work/extension-browser-version.txt', context.browser()!.version())
  } finally { await context.close();removeProfile(folder) }
})

test('private IKEA embedded Illustrator words render offline under the extension CSP', async ({}, info) => {
  const fixture = process.env.IKEA_PSD; test.skip(!fixture || !fs.existsSync(fixture), 'Private IKEA PSD required.')
  const extension = path.resolve('dist-extension'), folder=profile(), context = await chromium.launchPersistentContext(folder, { channel: 'chromium', headless: true, args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`] })
  try {
    const manager = await context.newPage(); await manager.goto('chrome://extensions'); const item = manager.locator('extensions-item').filter({ hasText: 'DOOH Creative Studio' }); await expect(item).toHaveCount(1)
    const id = await item.getAttribute('id'); await manager.close(); await context.setOffline(true)
    const page = await context.newPage(), errors: string[] = [], requests: string[] = []; page.on('pageerror', error => errors.push(error.message)); page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()) })
    await page.goto(`chrome-extension://${id}/index.html`); await expect(page.getByText('Saved on this device')).toBeVisible()
    await page.locator('input[type=file]').setInputFiles(fixture!); await page.getByLabel('Language for ikea.psd').selectOption('EN'); await onlyMupi(page)
    await page.getByRole('button', { name: 'Continue to Analyse' }).click(); await page.locator('button.lp-name', { hasText: /^Vector Smart Object$/ }).click(); await page.getByRole('button', { name: 'Main headline', exact: true }).click()
    await page.getByRole('button', { name: /3 · Adapt/ }).click(); await page.getByRole('button', { name: 'Edit Alshaheed - Mupi', exact: true }).click(); await page.getByRole('button', { name: 'Prepare headline words', exact: true }).click()
    await expect(page.locator('.lp-row').filter({ hasText: /Word [0-9]+ · embedded vector/ })).toHaveCount(5)
    await expect(page.locator('.calibration-canvas-frame .proof-canvas canvas')).toHaveAttribute('data-vector-words', '5'); await expect(page.getByRole('alert')).toHaveCount(0)
    await page.screenshot({ path: 'work/chrome-extension-ikea.png' }); expect(requests).toEqual([]); expect(errors).toEqual([])
  } finally { await context.close();removeProfile(folder) }
})

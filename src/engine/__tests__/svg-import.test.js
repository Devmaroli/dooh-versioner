import { expect, test } from 'vitest'
import fs from 'node:fs'
import { parseSvgArtwork, splitSubpaths } from '../../svgDocument.js'
import { relinkImages } from '../../svgMaterialize.js'
import { filesFromDataTransfer } from '../../fileDrop.js'

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII='

function svg(body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 100">${body}</svg>`
}

test('svg import keeps nested paths, groups, text and both image address forms', () => {
  const artwork = parseSvgArtwork(svg(`
    <defs><clipPath id="crop"><rect x="90" y="30" width="20" height="20"/></clipPath></defs>
    <g id="lockup" inkscape:label="Campaign lockup">
      <path id="mark" d="M10 10h20v20h-20z M40 10h10v10h-10z"/>
      <text id="headline" x="12" y="48" font-size="16" font-family="Cairo">Weekend offer</text>
    </g>
    <image id="embedded-photo" href="data:image/png;base64,${PNG}" x="80" y="10" width="40" height="40" opacity="0.5" transform="translate(10,20)" clip-path="url(#crop)"/>
    <image xlink:href="photos/photo.png" x="140" y="10" width="30" height="30"/>
    <image href='https://example.invalid/remote.png' x="0" y="0" width="8" height="8"/>
  `), 'poster_EN.svg', new Map([['photo.png', { name: 'photo.png' }]]))
  const group = artwork.layers.find(layer => layer.kind === 'group')
  expect(group.name).toBe('Campaign lockup')
  expect(group.children.map(layer => layer.kind).sort()).toEqual(['shape', 'text'])
  expect(group.children.find(layer => layer.kind === 'text').text).toBe('Weekend offer')
  expect(splitSubpaths(group.children.find(layer => layer.sourceKind === 'svg-path').pathData)).toHaveLength(2)
  const embedded = artwork.layers.find(layer => layer.name === 'embedded-photo')
  expect(embedded.imageSource).toBe('embedded')
  expect(embedded.sourceKind).toBe('embedded')
  expect(embedded.opacity).toBe(0.5)
  expect(embedded.transform).toEqual([1, 0, 0, 1, 10, 20])
  expect(embedded.box).toEqual([90, 30, 40, 40])
  expect(embedded.clip.rect).toEqual([90, 30, 20, 20])
  expect(embedded.embeddedImage.base64).toBe(PNG)
  const linked = artwork.layers.find(layer => layer.linkName === 'photo.png')
  expect(linked.imageSource).toBe('linked')
  expect(linked.sourceKind).toBe('linked')
  expect(linked.missingLink).toBeFalsy()
  expect(linked.linkedFile.name).toBe('photo.png')
  const remote = artwork.layers.find(layer => layer.remote)
  expect(remote.missingLink).toBe(true)
  expect(artwork.warnings.some(warning => warning.startsWith('Remote image was not downloaded'))).toBe(true)
  expect(artwork.warnings.some(warning => /https?:/.test(warning) && warning.includes('fetch'))).toBe(false)
})

test('a missing linked image warns and can be relinked by file name', async () => {
  const artwork = parseSvgArtwork(svg(`<image href="../assets/photo.png" x="4" y="6" width="20" height="10"/>`), 'poster.svg', new Map())
  const image = artwork.layers[0]
  expect(image.missingLink).toBe(true)
  expect(image.linkName).toBe('photo.png')
  expect(artwork.warnings).toContain('Missing linked image photo.png. Needs review.')
  const unresolved = await relinkImages(artwork, [{ name: 'Photo.PNG' }])
  expect(unresolved).toEqual([])
  expect(image.missingLink).toBe(false)
  expect(image.imageSource).toBe('linked')
  expect(artwork.warnings.some(warning => warning.startsWith('Missing linked image'))).toBe(false)
})

test('remote image addresses are never requested', () => {
  let called = 0
  const original = globalThis.fetch
  globalThis.fetch = () => { called += 1; return Promise.reject(new Error('network')) }
  try {
    parseSvgArtwork(svg(`<image href="http://example.invalid/a.png" x="0" y="0" width="4" height="4"/><image xlink:href="https://example.invalid/b.png" x="8" y="0" width="4" height="4"/>`), 'remote.svg')
    expect(called).toBe(0)
  } finally { globalThis.fetch = original }
})

test('a multi-megabyte embedded image stays a linear scan', () => {
  const payload = 'A'.repeat(16_000_000)
  const source = svg(`<image href="data:image/png;base64,${payload}" x="0" y="0" width="10" height="10"/><rect id="mark" x="1" y="1" width="2" height="2"/>`)
  const started = performance.now()
  const artwork = parseSvgArtwork(source, 'large.svg')
  expect(performance.now() - started).toBeLessThan(2500)
  expect(artwork.layers.find(layer => layer.kind === 'image').embeddedImage.base64.length).toBe(payload.length)
  expect(artwork.layers.some(layer => layer.kind === 'shape' && layer.name === 'mark')).toBe(true)
})

test('the sample svg still yields a group, shapes and text', () => {
  const artwork = parseSvgArtwork(fs.readFileSync(new URL('../../../samples/sample.svg', import.meta.url), 'utf8'), 'sample.svg')
  expect(artwork.w).toBe(1920)
  expect(artwork.h).toBe(1080)
  expect(artwork.layers.some(layer => layer.kind === 'group' && layer.children.length === 2)).toBe(true)
  expect(artwork.layers.some(layer => layer.kind === 'text' && layer.text.includes('Summer Sale'))).toBe(true)
  expect(artwork.layers.filter(layer => layer.kind === 'shape').length).toBeGreaterThan(1)
})

test('a dropped folder is read by file name without leaving the directory', async () => {
  const photo = { name: 'photo.png' }
  const svgFile = { name: 'poster.svg' }
  const directory = {
    isDirectory: true,
    createReader: () => ({
      batches: [[{ isFile: true, file: (ok) => ok(photo) }], []],
      readEntries(ok) { ok(this.batches.shift() || []) },
    }),
  }
  const files = await filesFromDataTransfer({
    items: [{ webkitGetAsEntry: () => ({ isFile: true, file: (ok) => ok(svgFile) }) }, { webkitGetAsEntry: () => directory }],
    files: [],
  })
  expect(files.map(file => file.name)).toEqual(['poster.svg', 'photo.png'])
})

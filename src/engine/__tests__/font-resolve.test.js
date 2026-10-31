import { expect, test, vi } from 'vitest'
import { fontNames, resolveFont } from '../../fontResolve.js'
import { syntheticFontBase64 } from '../../../tests/fixtures/synthetic-font.js'
const font = () => Uint8Array.from(Buffer.from(syntheticFontBase64, 'base64')).buffer

test('font matching uses sfnt family/full/PostScript names, not a guessed file name', () => {
  expect(fontNames(font())).toEqual(expect.arrayContaining(['DOOH Synthetic Triangle', 'DOOHSyntheticTriangle-Regular']))
  expect(fontNames(new ArrayBuffer(4))).toEqual([])
})
test('embedded fonts use a local FontFace buffer and system fonts require a successful local() load', async () => {
  const sources = []
  vi.stubGlobal('document', { fonts: { add() {} } })
  vi.stubGlobal('FontFace', class {
    constructor(family, source) { this.family = family; sources.push(source) }
    async load() { return this }
  })
  try {
    const embedded = { font: 'Synthetic', fontData: font() }
    expect(await resolveFont(embedded)).toBe('embedded')
    expect(embedded.editable).toBe(true)
    expect(sources[0]).toBe(embedded.fontData)
    const system = { font: 'Exact Name' }
    expect(await resolveFont(system)).toBe('local')
    expect(sources[1]).toBe('local("Exact Name")')
  } finally { vi.unstubAllGlobals() }
})
test('missing font does not claim editability or availability', async () => {
  vi.stubGlobal('document', { fonts: { add() { throw new Error('Must not register fallback') } } })
  vi.stubGlobal('FontFace', class { async load() { throw new Error('Unavailable') } })
  try {
    const layer = { font: 'Missing Face' }
    expect(await resolveFont(layer)).toBe('missing')
    expect(layer.editable).toBe(false)
    expect(layer.requestedFont).toBe('Missing Face')
    expect(layer.font).toBe('Missing Face')
  } finally { vi.unstubAllGlobals() }
})

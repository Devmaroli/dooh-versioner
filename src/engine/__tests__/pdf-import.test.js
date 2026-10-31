import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { expect, test } from 'vitest'
import * as legacyPdf from 'pdfjs-dist/legacy/build/pdf.mjs'
import { artworkFromPdf, pdfImagePlacement } from '../../pdfImport.js'
import { syntheticPdf } from '../../../tests/fixtures/synthetic-pdf.js'

legacyPdf.GlobalWorkerOptions.workerSrc = pathToFileURL(createRequire(import.meta.url).resolve('pdfjs-dist/legacy/build/pdf.worker.min.mjs')).href
globalThis.__DOOH_PDFJS__ = legacyPdf

test('pdf image placement keeps the content-stream rectangle in top-left page space', () => {
  const placement = pdfImagePlacement([80, 0, 0, 40, 40, 40], 2, 2, 180)
  expect(placement.box[0]).toBeCloseTo(40)
  expect(placement.box[1]).toBeCloseTo(100)
  expect(placement.box[2]).toBeCloseTo(80)
  expect(placement.box[3]).toBeCloseTo(40)
  expect(placement.localBox).toEqual([0, 0, 2, 2])
})

test('pdf import keeps text and an embedded image, and does not fetch', async () => {
  let called = 0
  const original = globalThis.fetch
  globalThis.fetch = () => { called += 1; return Promise.reject(new Error('network')) }
  try {
    const bytes = new Uint8Array(syntheticPdf())
    const first = await artworkFromPdf(bytes, 'poster_EN.pdf', 1)
    expect(first.w).toBe(320)
    expect(first.h).toBe(180)
    expect(first.pdfPages).toBe(2)
    expect(first.pdfPage).toBe(1)
    expect(first.layers.some(layer => layer.kind === 'text' && layer.text.includes('Page one headline'))).toBe(true)
    const image = first.layers.find(layer => layer.kind === 'image' && layer.imageSource === 'embedded')
    expect(image?.sourceKind).toBe('embedded')
    expect(image.embeddedImage.width).toBe(2)
    expect(image.embeddedImage.height).toBe(2)
    expect(image.box[2]).toBeGreaterThan(10)
    const second = await artworkFromPdf(bytes, 'poster_EN.pdf', 2)
    expect(second.pdfPage).toBe(2)
    expect(second.layers.some(layer => layer.text?.includes('Page two headline'))).toBe(true)
    expect(second.layers.some(layer => layer.kind === 'image' && layer.imageSource === 'embedded')).toBe(false)
    expect(called).toBe(0)
  } finally { globalThis.fetch = original }
})

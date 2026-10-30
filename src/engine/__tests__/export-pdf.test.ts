import { test, expect } from 'vitest'
import { unzlibSync } from 'fflate'
import { encodeArtworkPdf } from '../../exportPdf'

test('PDF losslessly preserves RGB, alpha and byte-correct cross references', () => {
  const bytes = encodeArtworkPdf(2, 1, new Uint8ClampedArray([10, 20, 30, 128, 40, 50, 60, 0]))
  const text = new TextDecoder('latin1').decode(bytes), start = Number(text.match(/startxref\n(\d+)/)![1])
  expect(new TextDecoder().decode(bytes.slice(start, start + 4))).toBe('xref')
  expect(text).toContain('/MediaBox [0 0 2 1]'); expect(text).toContain('/SMask 6 0 R')
  const stream = (id: number) => {
    const at = text.indexOf(`${id} 0 obj\n`), header = text.slice(at, text.indexOf('stream\n', at)), length = Number(header.match(/\/Length (\d+)/)![1]), offset = text.indexOf('stream\n', at) + 7
    return unzlibSync(bytes.slice(offset, offset + length))
  }
  expect(Array.from(stream(4))).toEqual([10, 20, 30, 40, 50, 60]); expect(Array.from(stream(6))).toEqual([128, 0])
  for (const [offset] of text.slice(start).matchAll(/(\d{10}) 00000 n /g)) {
    const position = Number(offset.slice(0, 10)); expect(new TextDecoder().decode(bytes.slice(position, position + 8))).toMatch(/^\d 0 obj\n/)
  }
})

test('opaque PDF omits alpha storage; ultra-wide page keeps exact pixels with UserUnit', () => {
  const data = new Uint8ClampedArray(20000 * 4); data.fill(255)
  const text = new TextDecoder().decode(encodeArtworkPdf(20000, 1, data))
  expect(text).toContain('/MediaBox [0 0 10000 0.5] /UserUnit 2'); expect(text).toContain('/Width 20000 /Height 1'); expect(text).not.toContain('/SMask')
})

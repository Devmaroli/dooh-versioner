import { test, expect } from 'vitest'
import fs from 'node:fs'
import { gunzipSync } from 'node:zlib'
import { createHash } from 'node:crypto'
import { initSync, svg_normalize } from '../../vendor/vectorcraft/vectorcraft_svg.js'

const root = new URL('../../vendor/vectorcraft/', import.meta.url)
const read = name => fs.readFileSync(new URL(name, root))
const build = JSON.parse(read('BUILD.json'))

test('vendored compressed WASM is valid and matches its recorded source artifact', () => {
  const packed = read('vectorcraft_svg_bg.wasm.bin'), module = gunzipSync(packed)
  expect(packed.length).toBe(build.gzipBytes)
  expect(module.length).toBe(build.rawBytes)
  expect(createHash('sha256').update(module).digest('hex')).toBe(build.rawSha256)
  expect(createHash('sha256').update(packed).digest('hex')).toBe(build.gzipSha256)
  expect(WebAssembly.validate(module)).toBe(true)
})

test('the shipped Rust module normalizes an actual styled SVG shape', () => {
  initSync({ module: gunzipSync(read('vectorcraft_svg_bg.wasm.bin')) })
  const result = JSON.parse(svg_normalize('<svg viewBox="0 0 40 40"><style>.cls-1 {fill:#123456}</style><rect class="cls-1" width="40" height="40"/></svg>'))
  expect(result.svg).toContain('fill="#123456"')
  expect(result.warnings).toEqual([])
})

test('upstream notices and every reachable Rust dependency have license text', () => {
  for (const file of ['LICENSE-MIT', 'LICENSE-APACHE', 'NOTICE']) expect(read(file).length).toBeGreaterThan(100)
  const dependencies = JSON.parse(read('DEPENDENCIES.json'))
  for (const dependency of dependencies) {
    expect(dependency.licenseFiles.length, dependency.name).toBeGreaterThan(0)
    for (const file of dependency.licenseFiles) expect(read(`licenses/${dependency.name}-${dependency.version}/${file}`).length).toBeGreaterThan(0)
  }
})

import { expect, test } from 'vitest'
import 'fake-indexeddb/auto'
import { availableRows, metadataFor, restoreMetadata, validateFile, validateDimensions, workflowStatus } from '../../project.js'
import { readProject, saveProject } from '../../storage.js'

test('file and memory boundaries reject invalid input', () => {
  for (const file of [{ name: 'bad.exe', size: 100 }, { name: 'empty.psd', size: 0 }, { name: 'huge.psd', size: 129 * 1024 * 1024 }]) expect(() => validateFile(file)).toThrow()
  expect(() => validateFile({ name: 'campaign.PSB', size: 1024 })).not.toThrow()
  for (const size of [[0, 10], [NaN, 10], [20000, 10], [10000, 10000]]) expect(() => validateDimensions(...size)).toThrow()
  expect(() => validateDimensions(1920, 1080)).not.toThrow()
})
test('missing languages never create export rows', () => {
  const rows = [{ lang: 'EN' }, { lang: 'AR' }]
  expect(availableRows([{ lang: 'EN' }], rows)).toEqual([rows[0]])
  expect(availableRows([{ lang: '' }], rows)).toEqual([])
  expect(availableRows([], rows)).toEqual([])
})
test('visiting a stage cannot complete it or enable the unimplemented editor', () => {
  expect(workflowStatus('analyse', [], 6)).toBe('Not ready')
  expect(workflowStatus('import', [{ lang: '' }], 6)).toBe('Needs attention')
  expect(workflowStatus('import', [{ lang: 'AR' }], 6)).toBe('Complete')
  expect(workflowStatus('refine', [{ lang: 'AR' }], 6)).toBe('Not implemented')
  expect(workflowStatus('export', [{ lang: 'AR' }], 0)).toBe('Not ready')
  expect(workflowStatus('export', [{ lang: 'AR' }], 1)).toBe('Manual review required')
})
test('metadata round trip preserves identity, tags and constraints; clears pixel caches', () => {
  const original = { id: 'asset-1', name: 'same.psd', lang: 'EN', an: { roles: [{ id: 'p1', role: 'legal', confidence: 1 }] }, layerConstraints: { p1: { required: true, anchor: 'right' } } }
  const restored = { id: 'temporary', an: { roles: [{ id: 'p1', role: 'ignore' }] }, U: {}, BG: {} }
  restoreMetadata(restored, metadataFor(original))
  expect(restored.id).toBe('asset-1')
  expect(restored.an.roles[0].role).toBe('legal')
  expect(restored.layerConstraints.p1.anchor).toBe('right')
  expect(restored.U).toBeUndefined()
  expect(restored.BG).toBeUndefined()
})
test('IndexedDB replaces the complete project atomically and preserves duplicate names by ID', async () => {
  const assets = [{ metadata: { id: 'one', name: 'same.psd' }, file: new Blob(['one']) }, { metadata: { id: 'two', name: 'same.psd' }, file: new Blob(['two']) }]
  await saveProject({ assets, picked: ['1.7HD'] })
  expect((await readProject()).assets.map(a => a.metadata.id)).toEqual(['one', 'two'])
  await saveProject({ assets: [assets[1]], picked: [] })
  const saved = await readProject()
  expect(saved.assets.map(a => a.metadata.id)).toEqual(['two'])
  expect(saved.picked).toEqual([])
  expect(saved.version).toBe(1)
})

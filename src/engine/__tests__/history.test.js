import { expect, test } from 'vitest'
import { editorSnapshot, editorHistory, commitEditorAction, finishEditorAction, travelEditorHistory } from '../../editorHistory.js'

function fixture() { return { an: { roles: [{ id: 'h', role: 'headline' }] }, calibration: { proofs: {} } } }
function edit(art, n) {
  editorHistory(art); const before = editorSnapshot(art)
  art.calibration.proofs.landscape = { frames: { h: { x: n } } }
  commitEditorAction(art, before, `Edit ${n}`, 'Landscape')
}

test('seven complete actions can undo and redo; a new edit clears redo and history persists as metadata', () => {
  const art = fixture()
  for (let n = 1; n <= 9; n++) edit(art, n)
  expect(editorHistory(art).past).toHaveLength(7)
  for (let n = 0; n < 7; n++) travelEditorHistory(art, 'undo')
  expect(art.calibration.proofs.landscape.frames.h.x).toBe(2)
  expect(travelEditorHistory(art, 'undo')).toBeNull()
  for (let n = 0; n < 7; n++) travelEditorHistory(art, 'redo')
  expect(art.calibration.proofs.landscape.frames.h.x).toBe(9)
  const restored = structuredClone(art)
  expect(editorHistory(restored).past).toHaveLength(7)
  travelEditorHistory(restored, 'undo'); edit(restored, 42)
  expect(editorHistory(restored).future).toHaveLength(0)
})

test('source preparation undo removes derived roles/crops/border and redo restores them without pixel snapshots', () => {
  const art = fixture(); editorHistory(art); const before = editorSnapshot(art)
  art.wordPieces = [{ id: 'word', parentId: 'h', crop: { x: 1 } }]
  art.an.roles.push({ id: 'word', role: 'headline' }); art.originalBorder = { sourceLayerId: 'h' }; art.layerCrops = { h: { x: 2 } }
  commitEditorAction(art, before, 'Prepare headline', 'Portrait')
  art.GU = { stale: true }; travelEditorHistory(art, 'undo')
  expect(art.wordPieces).toEqual([]); expect(art.originalBorder).toBeNull(); expect(art.an.roles).toHaveLength(1); expect(art.GU).toBeUndefined()
  travelEditorHistory(art, 'redo')
  expect(art.wordPieces).toHaveLength(1); expect(art.originalBorder.sourceLayerId).toBe('h')
  finishEditorAction(art)
  expect(editorHistory(art).past).toHaveLength(1)
})

test('untracked source changes clear stale history instead of undoing unrelated analysis', () => {
  const art = fixture(); edit(art, 1); art.an.roles[0].role = 'logo'
  expect(editorHistory(art).past).toHaveLength(0)
})

test('no-op input changes do not consume history or clear an existing redo branch', () => {
  const art = fixture(); edit(art, 1); travelEditorHistory(art, 'undo')
  expect(commitEditorAction(art, editorSnapshot(art), 'No change', 'Landscape')).toBe(false)
  expect(editorHistory(art).future).toHaveLength(1)
  expect(editorHistory(art).past).toHaveLength(0)
})

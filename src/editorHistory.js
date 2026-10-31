import { invalidateBackground } from './background.js'

const defaults = { layerConstraints: {}, backgroundRegion: null, layerVisibility: {}, layerLinks: [], layerCrops: {}, originalBorder: null, wordPieces: [], calibration: null, layerPanel: null, groupExpanded: null, preparationGroups: null }
const fields = Object.keys(defaults)
export function editorSnapshot(art) {
  return structuredClone({ roles: art.an.roles, ...Object.fromEntries(fields.map(key => [key, art[key] ?? defaults[key]])) })
}
function fingerprint(snapshot) { return JSON.stringify(snapshot) }
export function editorHistory(art) {
  const current = fingerprint(editorSnapshot(art))
  if (!art.editorHistory || art.editorHistory.head !== current) art.editorHistory = { past: [], future: [], head: current }
  return art.editorHistory
}
export function commitEditorAction(art, before, label, screen, context = {}) {
  const after = editorSnapshot(art), head = fingerprint(after)
  const history = art.editorHistory || { past: [], future: [] }
  const changed = fingerprint(before) !== head
  if (changed) {
    history.past = [...history.past, { snapshot: before, label, screen, ...context }].slice(-7)
    history.future = []
  }
  history.head = head; art.editorHistory = history
  return changed
}
export function finishEditorAction(art) {
  if (art.editorHistory) art.editorHistory.head = fingerprint(editorSnapshot(art))
}
export function restoreEditorSnapshot(art, snapshot) {
  art.an.roles = structuredClone(snapshot.roles)
  for (const key of fields) art[key] = structuredClone(snapshot[key])
  invalidateBackground(art)
}
export function travelEditorHistory(art, direction, context = {}) {
  const history = editorHistory(art), from = direction === 'undo' ? history.past : history.future
  if (!from.length) return null
  const entry = from.pop(), current = { ...entry, ...context, snapshot: editorSnapshot(art) }
  if (direction === 'undo') history.future.push(current)
  else history.past = [...history.past, current].slice(-7)
  restoreEditorSnapshot(art, entry.snapshot)
  history.head = fingerprint(editorSnapshot(art)); art.editorHistory = history
  return entry
}

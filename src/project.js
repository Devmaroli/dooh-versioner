import { migrateMetadata } from './tagging.js'

// Metadata is serializable; original files live in IndexedDB, never localStorage.
export const STEPS = ['import', 'analyse', 'adapt', 'review', 'export']
export const STEP_LABELS = { import: 'Import', analyse: 'Analyse', adapt: 'Adapt', review: 'Review & edit', export: 'Export' }
export const MAX_FILE_BYTES = 128 * 1024 * 1024
export function validateFile(file) {
  if (!/\.(psd|psb|svg|pdf|ai|png|jpe?g|webp|gif)$/i.test(file.name)) throw new Error('Unsupported format. Use PSD, PSB, SVG, PDF, AI, PNG, JPEG, GIF or WebP.')
  if (!file.size) throw new Error('This file is empty.')
  if (file.size > MAX_FILE_BYTES) throw new Error('This file exceeds the 128 MB import limit. Save a smaller master and retry.')
}
export function validateDimensions(w, h) {
  if (!(w > 0 && h > 0 && Number.isFinite(w) && Number.isFinite(h))) throw new Error('Artwork has invalid dimensions.')
  if (w > 16384 || h > 16384 || w * h > 40_000_000) throw new Error('Artwork exceeds the supported 40 megapixel / 16,384 pixel import limit.')
}
export function availableRows(assets, rows) {
  return rows.filter(row => assets.some(asset => asset.lang === row.lang))
}
export function workflowStatus(step, assets, selectedCount) {
  const mapped = assets.length > 0 && assets.every(a => a.lang === 'EN' || a.lang === 'AR')
  if (step === 'import') return mapped ? 'Complete' : assets.length ? 'Needs attention' : 'Ready'
  if (!mapped) return 'Not ready'
  if (step === 'analyse') {
    const unresolved = assets.some(asset => asset.a?.source?.format !== 'image' && !(asset.an?.roles || []).some(role => role.role === 'headline' && (role.confidence === 1 || role.confirmed)))
    return unresolved ? 'Needs attention' : 'Complete'
  }
  if (step === 'adapt') return 'Ready'
  // Review and export stay incomplete until outputs are actually approved. Opening the stage does not complete it.
  if (step === 'review' || step === 'export') return selectedCount > 0 ? 'Needs attention' : 'Not ready'
  return 'Not ready'
}
export function metadataFor(art) {
  return { schemaVersion: 2, editorHistory: art.editorHistory || null, id: art.id, name: art.name, lang: art.lang, roles: art.an.roles, layerConstraints: art.layerConstraints || {}, backgroundRegion: art.backgroundRegion || null, layerVisibility: art.layerVisibility || {}, layerLinks: art.layerLinks || [], previewSettings: art.previewSettings || {}, calibration: art.calibration || null, originalBorder: art.originalBorder || null, layerCrops: art.layerCrops || {}, wordPieces: art.wordPieces || [], exportAcknowledgement: art.exportAcknowledgement || null, layerPanel: art.layerPanel || null, groupExpanded: art.groupExpanded || null, preparationGroups: art.preparationGroups || null }
}
export function restoreMetadata(art, metadata) {
  const saved = migrateMetadata(metadata)
  art.editorHistory = saved.editorHistory || null
  art.id = saved.id
  art.lang = saved.lang
  art.layerConstraints = saved.layerConstraints || {}
  art.backgroundRegion = saved.backgroundRegion || null
  art.layerVisibility = saved.layerVisibility || {}
  art.layerLinks = saved.layerLinks || []
  art.previewSettings = saved.previewSettings || {}
  art.calibration = saved.calibration || null
  art.originalBorder = saved.originalBorder || null
  art.layerCrops = saved.layerCrops || {}
  art.wordPieces = saved.wordPieces || []
  art.exportAcknowledgement = saved.exportAcknowledgement || null
  art.layerPanel = saved.layerPanel || null
  art.groupExpanded = saved.groupExpanded || null
  art.preparationGroups = saved.preparationGroups || null
  const ids = new Set([...art.an.roles.map(r => r.id), ...art.wordPieces.map(p => p.id)])
  // Re-run automatic suggestions on recovery; only designer/source-confirmed roles override them.
  for (const role of saved.roles.filter(r => ids.has(r.id) && (r.confidence === 1 || r.confirmed))) {
    const index = art.an.roles.findIndex(r => r.id === role.id)
    if (index < 0) art.an.roles.push(role)
    else art.an.roles[index] = role
  }
  delete art.U
  delete art.BG
}

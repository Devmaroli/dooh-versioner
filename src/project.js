// Metadata is serializable; original files live in IndexedDB, never localStorage.
export const STEPS = ['import', 'analyse', 'adapt', 'review', 'refine', 'export']
export const MAX_FILE_BYTES = 128 * 1024 * 1024
export function validateFile(file) {
  if (!/\.(psd|psb|svg|png|jpe?g|webp)$/i.test(file.name)) throw new Error('Unsupported format. Use PSD, PSB, SVG, PNG, JPEG or WebP.')
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
  if (step === 'analyse') return mapped ? 'Ready' : 'Not ready'
  if (step === 'adapt') return mapped ? 'Ready' : 'Not ready'
  if (step === 'review' || step === 'export') return mapped && selectedCount > 0 ? 'Manual review required' : 'Not ready'
  return 'Not implemented'
}
export function metadataFor(art) {
  return { editorHistory: art.editorHistory || null, id: art.id, name: art.name, lang: art.lang, roles: art.an.roles, layerConstraints: art.layerConstraints || {}, backgroundRegion: art.backgroundRegion || null, layerVisibility: art.layerVisibility || {}, layerLinks: art.layerLinks || [], previewSettings: art.previewSettings || {}, calibration: art.calibration || null, originalBorder: art.originalBorder || null, layerCrops: art.layerCrops || {}, wordPieces: art.wordPieces || [] }
}
export function restoreMetadata(art, metadata) {
  art.editorHistory = metadata.editorHistory || null
  art.id = metadata.id
  art.lang = metadata.lang
  art.layerConstraints = metadata.layerConstraints || {}
  art.backgroundRegion = metadata.backgroundRegion || null
  art.layerVisibility = metadata.layerVisibility || {}
  art.layerLinks = metadata.layerLinks || []
  art.previewSettings = metadata.previewSettings || {}
  art.calibration = metadata.calibration || null
  art.originalBorder = metadata.originalBorder || null
  art.layerCrops = metadata.layerCrops || {}
  art.wordPieces = metadata.wordPieces || []
  const ids = new Set([...art.an.roles.map(r => r.id), ...art.wordPieces.map(p => p.id)])
  // Re-run automatic suggestions on recovery; only designer/source-confirmed roles override them.
  for (const role of metadata.roles.filter(r => ids.has(r.id) && (r.confidence === 1 || r.confirmed))) {
    const index = art.an.roles.findIndex(r => r.id === role.id)
    if (index < 0) art.an.roles.push(role)
    else art.an.roles[index] = role
  }
  delete art.U
  delete art.BG
}

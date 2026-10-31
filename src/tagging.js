// Universal creative tags. Engine role ids stay stable so guides, exports and saved projects keep working.
export const ROLE_CATALOG = [
  { id: 'unassigned', label: 'Not sure' },
  { id: 'headline', label: 'Headline' },
  { id: 'supporting', label: 'Supporting text' },
  { id: 'offer', label: 'Offer' },
  { id: 'price', label: 'Price' },
  { id: 'logo', label: 'Logo' },
  { id: 'product', label: 'Key visual' },
  { id: 'cta', label: 'Contact' },
  { id: 'legal', label: 'Legal' },
  { id: 'regulatory', label: 'Regulatory' },
  { id: 'bg', label: 'Background' },
  { id: 'stamp', label: 'Graphic' },
  { id: 'border', label: 'Graphic' },
  { id: 'ignore', label: 'Other' },
  { id: 'other', label: 'Other' },
]

// Labels already used by the designer-facing controls and acceptance tests.
export const ROLE_CONTROL_LABELS = {
  unassigned: 'Not sure',
  headline: 'Main headline',
  supporting: 'Supporting text',
  offer: 'Offer / secondary message',
  price: 'Price',
  logo: 'Brand logo',
  product: 'Product / key visual',
  cta: 'Contact / call to action',
  legal: 'Legal / fine print',
  regulatory: 'Regulatory',
  bg: 'Original background texture',
  stamp: 'Campaign stamp / label',
  border: 'Original border (separate layer)',
  ignore: 'Do not adapt / decorative',
  other: 'Other',
}

const ROLE_ALIASES = {
  background: 'bg',
  'key-visual': 'product',
  keyvisual: 'product',
  kv: 'product',
  contact: 'cta',
  graphic: 'stamp',
  'not-sure': 'unassigned',
  exclude: 'ignore',
}

export function canonicalRole(role) {
  if (!role) return 'unassigned'
  return ROLE_ALIASES[role] || role
}

export function roleLabel(role) {
  const id = canonicalRole(role)
  return ROLE_CONTROL_LABELS[id] || ROLE_CATALOG.find(item => item.id === id)?.label || 'Not identified'
}

export function isBackgroundRole(role) {
  return canonicalRole(role) === 'bg'
}

export function isExcludedRole(role) {
  return canonicalRole(role) === 'ignore'
}

export function layoutRole(role) {
  const id = canonicalRole(role)
  if (id === 'supporting') return 'offer'
  if (id === 'regulatory') return 'legal'
  if (id === 'other' || id === 'unassigned') return 'other'
  return id
}

export function emptyConstraint(partial = {}) {
  return {
    required: false,
    anchor: 'free',
    orientation: 'preserve',
    priority: 'medium',
    inclusion: 'include',
    graphicSubtype: null,
    integrity: { proportions: true, appearance: true, reflow: false, wordArrange: false },
    ...partial,
    integrity: { proportions: true, appearance: true, reflow: false, wordArrange: false, ...partial.integrity },
  }
}

/** Copy only keys present on `patch`. Other layers and other fields stay as they are. */
export function patchConstraints(constraints = {}, ids, patch) {
  const next = { ...constraints }
  for (const id of ids) next[id] = { ...next[id], ...patch }
  return next
}

export function mixedValue(items, read) {
  if (!items.length) return { mixed: false, value: undefined }
  const value = read(items[0])
  return { mixed: items.some(item => read(item) !== value), value }
}

export function migrateMetadata(metadata = {}) {
  // Keep stored constraints byte-for-byte. Adding default keys would change the guide signature and clear approvals.
  const roles = (metadata.roles || []).map(role => ({
    ...role,
    role: canonicalRole(role.role),
    confirmed: !!(role.confirmed || role.confidence === 1),
  }))
  return {
    ...metadata,
    schemaVersion: 2,
    roles,
    layerConstraints: metadata.layerConstraints || {},
    layerLinks: metadata.layerLinks || [],
    layerVisibility: metadata.layerVisibility || {},
    editorHistory: metadata.editorHistory || null,
  }
}

export function readinessStatus({ guideReady, outputExists, approved, blocked, reviewCount }) {
  if (!guideReady || blocked || (outputExists && !approved)) return 'Blocked'
  if (!approved || reviewCount > 0) return 'Needs review'
  return 'Ready'
}

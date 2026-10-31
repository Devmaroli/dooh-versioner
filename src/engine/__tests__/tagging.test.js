import { expect, test } from 'vitest'
import { canonicalRole, migrateMetadata, mixedValue, patchConstraints, readinessStatus, roleLabel } from '../../tagging.js'
import { metadataFor, restoreMetadata } from '../../project.js'
import { GUIDE_PRESETS, initialProof, layoutFamily, outputReadiness } from '../../layoutGuides.js'

test('role, placement and inclusion stay independent and aliases canonicalise', () => {
  expect(canonicalRole('background')).toBe('bg')
  expect(canonicalRole('key-visual')).toBe('product')
  expect(canonicalRole('contact')).toBe('cta')
  expect(roleLabel('headline')).toBe('Main headline')
  const constraints = patchConstraints({ a: { anchor: 'left', required: true }, b: { anchor: 'bottom', priority: 'low' } }, ['a', 'b'], { priority: 'high' })
  expect(constraints.a).toEqual({ anchor: 'left', required: true, priority: 'high' })
  expect(constraints.b.anchor).toBe('bottom')
  expect(mixedValue([{ role: 'logo' }, { role: 'legal' }], item => item.role).mixed).toBe(true)
})

test('version 1 metadata migrates without dropping confirmed roles, links or edits', () => {
  const legacy = { id: 'asset-1', roles: [{ id: 'p1', role: 'legal', confidence: 1 }, { id: 'p2', role: 'product', confidence: 0.5 }], layerConstraints: { p1: { required: true, anchor: 'right' } }, layerLinks: [{ id: 'link', layerIds: ['p1'] }], calibration: { enabled: true }, editorHistory: { past: [{ label: 'Move' }], future: [] } }
  const art = { id: 'temporary', an: { roles: [{ id: 'p1', role: 'ignore' }, { id: 'p2', role: 'bg' }] }, wordPieces: [] }
  restoreMetadata(art, legacy)
  expect(art.id).toBe('asset-1')
  expect(art.an.roles.find(role => role.id === 'p1').role).toBe('legal')
  expect(art.an.roles.find(role => role.id === 'p2').role).toBe('bg')
  expect(art.layerConstraints.p1).toEqual({ required: true, anchor: 'right' })
  expect(art.layerLinks).toEqual(legacy.layerLinks)
  expect(art.editorHistory.past).toHaveLength(1)
  expect(metadataFor(art).schemaVersion).toBe(2)
  expect(migrateMetadata({ roles: [{ id: 'x', role: 'background', confirmed: true }] }).roles[0].role).toBe('bg')
})

test('representative presets keep their families and portrait slots give the logo and offer readable room', () => {
  expect(GUIDE_PRESETS).toEqual(['2.6 Screen', 'Al Salam Mall', 'Al Nassar Tower Vertical', 'Alshaheed - Mupi', 'The Gate Mall Outdoor'])
  expect(layoutFamily({ w: 1536, h: 576 })).toBe('landscape')
  expect(layoutFamily({ w: 7680, h: 1152 })).toBe('ultrawide')
  expect(layoutFamily({ w: 960, h: 5328 })).toBe('ultratall')
  expect(layoutFamily({ w: 1080, h: 1920 })).toBe('vertical')
  expect(layoutFamily({ w: 948, h: 648 })).toBe('compact')
  const layers = [{ id: 'h', name: 'Headline', box: [40, 40, 400, 180] }, { id: 'o', name: 'Offer', box: [40, 300, 300, 80] }, { id: 'logo', name: 'Logo', box: [700, 40, 200, 80] }]
  layers.forEach(layer => Object.defineProperty(layer, 'px', { value: {} }))
  const art = { a: { w: 1000, h: 600, layers }, an: { roles: [{ id: 'h', role: 'headline', confidence: 1 }, { id: 'o', role: 'offer', confidence: 1, confirmed: true }, { id: 'logo', role: 'logo', confidence: 1 }] }, layerConstraints: { o: { priority: 'critical', anchor: 'free' }, logo: { required: false, anchor: 'free' } }, layerLinks: [] }
  const proof = initialProof(art, { name: 'Alshaheed - Mupi', w: 1080, h: 1920 })
  expect(proof.frames['layer:o'].h).toBeGreaterThanOrEqual(.1)
  expect(proof.frames['layer:logo'].h).toBeGreaterThanOrEqual(.05)
})

test('readiness distinguishes blocked, review-only and ready outputs', () => {
  expect(readinessStatus({ guideReady: false, outputExists: false, approved: false, blocked: false, reviewCount: 0 })).toBe('Blocked')
  expect(readinessStatus({ guideReady: true, outputExists: true, approved: false, blocked: false, reviewCount: 0 })).toBe('Blocked')
  expect(readinessStatus({ guideReady: true, outputExists: false, approved: false, blocked: false, reviewCount: 2 })).toBe('Needs review')
  expect(readinessStatus({ guideReady: true, outputExists: true, approved: true, blocked: false, reviewCount: 0 })).toBe('Ready')
  const layers = [{ id: 'h', name: 'Headline', box: [10, 10, 100, 40] }]
  Object.defineProperty(layers[0], 'px', { value: {} })
  const art = { a: { w: 200, h: 100, source: { format: 'psd' }, layers }, an: { roles: [{ id: 'h', role: 'legal', confidence: 1 }] }, layerConstraints: {}, calibration: { enabled: false, proofs: {} } }
  expect(outputReadiness(art, { name: 'Mupi', w: 1080, h: 1920 }).status).toBe('Blocked')
})

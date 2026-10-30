import { expect, test } from 'vitest'
import { allLayers, selectLayers, linkLayers, unlinkLayers, setLayerVisibility } from '../../artwork.js'
import { backgroundCrop, rectangleBetween } from '../../background.js'
import { FAMILIES, GUIDE_PRESETS, calibrationReady, requiredFamilies, contentUnits, initialProof, layoutFamily, guideLayout, guideFindings, sourceSignature } from '../../layoutGuides.js'
import { metadataFor, restoreMetadata } from '../../project.js'
import { borderGeometry, drawOriginalBorder, detectSourceBorder } from '../../border.js'
import { arrangeFrames, splitSourceWords } from '../../words.js'

function fixture() {
  const layers = [{ id: 'h', name: 'Headline', box: [50, 50, 400, 200] }, { id: 'yellow', name: 'Highlight', box: [40, 50, 440, 200] }, { id: 'o', name: 'Offer', box: [600, 400, 200, 60] }]
  layers.forEach(l => Object.defineProperty(l, 'px', { value: {} }))
  return { id: 'asset', a: { w: 1000, h: 600, layers }, an: { roles: [{ id: 'h', role: 'headline', confidence: 1 }, { id: 'yellow', role: 'headline', confidence: 1 }, { id: 'o', role: 'offer', confidence: 1 }] }, layerConstraints: {}, layerLinks: [] }
}

test('only selected layout families require approval; expanding targets or changing source invalidates readiness', () => {
  const art = fixture(), mupi = { w: 1080, h: 1920 }, ribbon = { w: 7680, h: 1152 }
  art.calibration = { enabled: true, proofs: { vertical: { approved: true, sourceSignature: sourceSignature(art) } } }
  expect(requiredFamilies([mupi, mupi])).toEqual(['vertical'])
  expect(layoutFamily({ w: 1920, h: 1080 })).toBe('landscape')
  expect(calibrationReady(art, [mupi])).toBe(true)
  expect(calibrationReady(art, [])).toBe(false)
  expect(calibrationReady(art, [mupi, ribbon])).toBe(false)
  expect(calibrationReady(art)).toBe(false)
  art.layerConstraints.h = { required: true }
  expect(calibrationReady(art, [mupi])).toBe(false)
})

test('matching semantic roles never link unrelated source layers and legacy cluster frames are separated', () => {
  const art = fixture(), screen = { w: 1080, h: 1920 }
  const units = contentUnits(art)
  expect(units.filter(u => u.role === 'headline')).toHaveLength(2)
  expect(units.every(u => u.layerIds.length === 1)).toBe(true)
  const proof = { frames: { 'headline:free:2': { x: .1, y: .1, w: .6, h: .4 } } }
  const layout = guideLayout(art, screen, proof)
  expect(layout.find(u => u.id === 'layer:h').frame.w).toBeGreaterThan(.1)
  expect(layout.find(u => u.id === 'layer:yellow').sourceLink).toBe(false)
})

test('manual free transforms retain off-canvas positions and block approval for clipped required content', () => {
  const art = fixture(), screen = { w: 1000, h: 600 }
  art.layerConstraints.h = { required: true, anchor: 'right' }
  const proof = initialProof(art, screen)
  proof.freeUnitIds = ['layer:h']
  proof.frames['layer:h'] = { x: -.2, y: .4, w: .8, h: 2 / 3 }
  const layout = guideLayout(art, screen, proof), headline = layout.find(u => u.id === 'layer:h')
  expect(headline.frame.x).toBe(-.2)
  expect(headline.frame.w).toBeCloseTo(.8)
  expect(guideFindings(art, screen, layout).some(i => i.blocked && /outside the canvas/.test(i.message))).toBe(true)
  expect(art.layerConstraints.h.anchor).toBe('right')
})

test('editor links can override edge anchors locally and source links can be detached per guide', () => {
  const art = fixture(), screen = { w: 1080, h: 1920 }
  art.layerConstraints.h = { anchor: 'top' }
  const proof = initialProof(art, screen)
  proof.groups = [{ id: 'local', kind: 'link', unitIds: ['layer:h', 'layer:o'] }]
  const layout = guideLayout(art, screen, proof)
  expect(layout.find(u => u.id === 'layer:h').constraint.anchor).toBe('free')
  expect(art.layerConstraints.h.anchor).toBe('top')
  art.layerLinks = [{ id: 'source', layerIds: ['h', 'yellow'] }]
  expect(contentUnits(art).some(u => u.id === 'source')).toBe(true)
  expect(contentUnits(art, ['source']).some(u => u.id === 'source')).toBe(false)
  expect(art.layerLinks).toHaveLength(1)
})
test('five requested presets route extreme vertical and Mupi into different families', () => {
  expect(GUIDE_PRESETS).toEqual(['2.6 Screen', 'Al Salam Mall', 'Al Nassar Tower Vertical', 'Alshaheed - Mupi', 'The Gate Mall Outdoor'])
  expect([{ w: 1536, h: 576 }, { w: 7680, h: 1152 }, { w: 960, h: 5328 }, { w: 1080, h: 1920 }, { w: 948, h: 648 }].map(layoutFamily)).toEqual(FAMILIES)
})
test('source pixel references survive non-enumerable PSD properties; hidden ancestors can be shown', () => {
  const art = fixture(), child = art.a.layers[0]
  art.a.layers = [{ id: 'group', hidden: true, children: [child] }]
  expect(allLayers(art)[1].px).toBe(child.px)
  expect(allLayers(art)[1].effectiveHidden).toBe(true)
  setLayerVisibility(art, ['h'], true)
  expect(allLayers(art)[1].effectiveHidden).toBe(false)
})
test('Ctrl/Cmd selection toggles and Shift selects ranges', () => {
  const layers = fixture().a.layers
  expect(selectLayers(['h'], 1, layers, { ctrlKey: true }, 0)).toEqual(['h', 'yellow'])
  expect(selectLayers(['h', 'yellow'], 0, layers, { metaKey: true }, 1)).toEqual(['yellow'])
  expect(selectLayers(['h'], 2, layers, { shiftKey: true }, 0)).toEqual(['h', 'yellow', 'o'])
})
test('linking merges transitive links; unlinking preserves unrelated linked layers', () => {
  const links = [{ id: 'a', layerIds: ['h', 'yellow'] }, { id: 'b', layerIds: ['o', 'logo'] }]
  expect(linkLayers(links, ['yellow', 'o'], 'c')).toEqual([{ id: 'c', layerIds: ['yellow', 'o', 'h', 'logo'] }])
  expect(unlinkLayers(links, ['h'])).toEqual([links[1]])
  const art = fixture(); art.layerLinks = [links[0]]
  expect(contentUnits(art).find(u => u.id === 'a').layerIds).toEqual(['h', 'yellow'])
})
test('full-layer rectangle supports negative coordinates while old artboard samples remain bounded', () => {
  const layer = { id: 'bg', box: [-521, -286, 2964, 1653] }
  const region = { layerId: 'bg', scope: 'layer', x: -400, y: -200, w: 300, h: 100 }
  expect(backgroundCrop(region, layer, 1920, 1080)).toEqual({ x: -400, y: -200, w: 300, h: 100 })
  expect(backgroundCrop({ ...region, scope: 'artboard' }, layer, 1920, 1080)).toBeNull()
  expect(rectangleBetween({ x: -300, y: -100 }, { x: -400, y: -200 }, 2964, 1653, { x: -521, y: -286 })).toEqual({ x: -400, y: -200, w: 100, h: 100 })
})
test('edge placement applies to headline links, preserves aspect and transfers to other targets', () => {
  const art = fixture(); art.layerLinks = [{ id: 'pair', layerIds: ['h', 'yellow'] }]
  art.layerConstraints.h = { anchor: 'right', margin: 3 }
  const screen = { w: 960, h: 5328 }, proof = initialProof(art, screen)
  for (const target of [screen, { w: 1008, h: 5184 }]) {
    const unit = guideLayout(art, target, proof).find(u => u.id === 'pair'), f = unit.frame
    expect((1 - f.x - f.w) * target.w).toBeCloseTo(Math.min(target.w, target.h) * .03)
    expect(f.w * target.w / (f.h * target.h)).toBeCloseTo(unit.box.w / unit.box.h)
  }
})
test('calibration requires all five approvals and explicit enable; source edits invalidate, preview color does not', () => {
  const art = fixture(), signature = sourceSignature(art)
  art.calibration = { enabled: true, proofs: Object.fromEntries(FAMILIES.map(f => [f, { approved: true, sourceSignature: signature, frames: {} }])) }
  expect(calibrationReady(art)).toBe(true)
  art.previewSettings = { alpha: false, color: '#ff0000' }
  expect(calibrationReady(art)).toBe(true)
  setLayerVisibility(art, ['o'], false)
  expect(calibrationReady(art)).toBe(false)
  const restored = fixture(); restoreMetadata(restored, metadataFor(art))
  expect(restored.calibration).toEqual(art.calibration)
  expect(restored.layerVisibility.o).toBe(false)
})
test('hiding required content or conflicting linked anchors blocks approval', () => {
  const art = fixture(), screen = { w: 1536, h: 576 }
  art.layerConstraints.h = { required: true }
  setLayerVisibility(art, ['h'], false)
  expect(guideFindings(art, screen, guideLayout(art, screen)).some(i => i.blocked && /Required layer/.test(i.message))).toBe(true)
  art.layerLinks = [{ id: 'link', layerIds: ['h', 'o'] }]; art.layerConstraints.h.anchor = 'left'; art.layerConstraints.o = { anchor: 'right' }
  expect(guideFindings(art, screen, guideLayout(art, screen)).some(i => i.blocked && /conflicting/.test(i.message))).toBe(true)
})

test('original vector border scales thickness by short side and follows the stamp without stretching', () => {
  const art = fixture()
  art.originalBorder = { sourceLayerId: 'h', thickness: 6, color: '#231f20', margin: 4 }
  const frame = borderGeometry(art, { w: 960, h: 5328 }, [{ role: 'stamp', frame: { x: .1, y: .02, w: .5, h: .08 } }])
  expect(frame.thickness).toBeCloseTo(6 * 960 / 600)
  expect(frame.y).toBeGreaterThan(5328 * .1)
  expect(frame.x).toBeCloseTo(960 * .04 + frame.thickness / 2)
  expect(borderGeometry(art, { w: 7680, h: 1152 }, []).thickness).toBeCloseTo(6 * 1152 / 600)
  setLayerVisibility(art, ['h'], false)
  expect(borderGeometry(art, { w: 960, h: 5328 }, [])).toBeNull()
})

test('non-destructive interior crops shrink foreground bounds and persist with source border provenance', () => {
  const art = fixture()
  art.layerCrops = { h: { x: 100, y: 100, w: 200, h: 80 } }
  art.originalBorder = { sourceLayerId: 'h', sourceRect: { x: 50, y: 50, w: 400, h: 200 }, color: '#231f20', thickness: 6 }
  art.layerVisibility = { yellow: false }
  expect(contentUnits(art).find(u => u.role === 'headline').box).toEqual(art.layerCrops.h)
  const restored = fixture(); restoreMetadata(restored, metadataFor(art))
  expect(restored.layerCrops).toEqual(art.layerCrops)
  expect(restored.originalBorder.sourceLayerId).toBe('h')
})

test('align and distribute use selection or composition and do not mutate source frames', () => {
  const frames = { a: { x: .1, y: .1, w: .1, h: .1 }, b: { x: .4, y: .4, w: .1, h: .1 }, c: { x: .8, y: .8, w: .1, h: .1 } }
  expect(arrangeFrames(frames, ['a', 'b'], 'left', 'selection').b.x).toBe(.1)
  expect(arrangeFrames(frames, ['a'], 'center-x', 'canvas').a.x).toBe(.45)
  const result = arrangeFrames(frames, ['a', 'b', 'c'], 'distribute-y', 'selection')
  expect(result.b.y).toBeCloseTo(.45)
  expect(frames.b.y).toBe(.4)
})

test('separated words remain independent and the source parent cannot duplicate them', () => {
  const art = fixture()
  art.wordPieces = [{ id: 'w1', parentId: 'h', name: 'Word 1', crop: { x: 50, y: 50, w: 100, h: 80 } }, { id: 'w2', parentId: 'h', name: 'Word 2', crop: { x: 180, y: 50, w: 200, h: 80 } }]
  art.an.roles.push(...art.wordPieces.map(p => ({ id: p.id, role: 'headline', confidence: 1 })))
  const units = contentUnits(art)
  expect(units.filter(u => u.wordSourceId === 'h')).toHaveLength(2)
  expect(units.some(u => u.layerIds.includes('h'))).toBe(false)
  const proof = initialProof(art, { w: 1080, h: 1920 })
  expect(Object.keys(proof.frames).filter(id => id.startsWith('word:'))).toHaveLength(2)
  const restored = fixture(); restoreMetadata(restored, metadataFor(art))
  expect(restored.wordPieces).toEqual(art.wordPieces)
  expect(restored.an.roles.some(r => r.id === 'w2')).toBe(true)
})

test('logos and logo-containing mixed layers cannot be separated or reconstructed as borders', () => {
  const art = fixture(); art.an.roles[0].role = 'logo'
  art.wordPieces = [{ id: 'wrong', parentId: 'h', crop: { x: 50, y: 50, w: 100, h: 80 } }]
  const layer = allLayers(art).find(l => l.id === 'h')
  expect(layer.logoProtected).toBe(true)
  expect(allLayers(art).some(l => l.id === 'wrong')).toBe(false)
  expect(() => splitSourceWords(layer)).toThrow('Logo-protected')
  expect(detectSourceBorder(layer, { x: 50, y: 50, w: 400, h: 200 })).toBeNull()
  art.originalBorder = { sourceLayerId: 'h', thickness: 6 }
  expect(borderGeometry(art, { w: 1080, h: 1920 }, [])).toBeNull()
  art.an.roles[0].role = 'cta'; art.layerConstraints.h = { protectedLogo: true }
  expect(allLayers(art).find(l => l.id === 'h').logoProtected).toBe(true)
})

test('a calibration group preserves relative spacing when transferred to another screen ratio', () => {
  const art = fixture(), source = { w: 1536, h: 576 }, proof = initialProof(art, source)
  const units = contentUnits(art), ids = units.map(u => u.id)
  proof.frames[ids[0]] = { x: .1, y: .1, w: .3, h: .4 }
  proof.frames[ids[1]] = { x: .5, y: .4, w: .2, h: .2 }
  proof.groups = [{ id: 'scene-group', unitIds: ids }]
  const before = guideLayout(art, source, proof), target = { w: 2688, h: 1152 }, after = guideLayout(art, target, proof)
  const scaleX = after[0].frame.w * target.w / (before[0].frame.w * source.w)
  const scaleY = after[0].frame.h * target.h / (before[0].frame.h * source.h)
  expect(scaleX).toBeCloseTo(scaleY)
  expect((after[1].frame.x - after[0].frame.x) * target.w).toBeCloseTo((before[1].frame.x - before[0].frame.x) * source.w * scaleX)
})

test('border rendering uses saved guide geometry and thickness for preview and final composition', () => {
  const art = fixture(); art.originalBorder = { sourceLayerId: 'h', thickness: 6, color: '#231f20' }
  const proof = { borderFrame: { x: .1, y: .2, w: .5, h: .4 }, borderThickness: 11 }
  const calls = [], ctx = { save() {}, restore() {}, strokeRect(...args) { calls.push(args) } }
  drawOriginalBorder(ctx, art, { w: 1080, h: 1920 }, [], proof)
  expect(calls).toEqual([[108, 384, 540, 768]])
  expect(ctx.lineWidth).toBeCloseTo(11 * 1080 / 600)
  expect(ctx.strokeStyle).toBe('#231f20')
})

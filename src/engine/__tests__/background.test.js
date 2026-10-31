import { expect, test } from 'vitest'
import { backgroundCrop, invalidateBackground, rectangleBetween } from '../../background.js'
import { metadataFor, restoreMetadata } from '../../project.js'
import Adapt from '../adapt.js'

test('dragging in any direction and outside the canvas produces original-pixel coordinates', () => {
  expect(rectangleBetween({ x: 700, y: 400 }, { x: 100, y: 50 }, 1920, 1080)).toEqual({ x: 100, y: 50, w: 600, h: 350 })
  expect(rectangleBetween({ x: -20, y: 30 }, { x: 2500, y: 2000 }, 1920, 1080)).toEqual({ x: 0, y: 30, w: 1920, h: 1050 })
})

test('background bounds respect both the artboard and an oversized or partially intersecting layer', () => {
  const layer = { id: 'paper', box: [-521, -286, 2964, 1653] }
  const region = { layerId: 'paper', x: 100, y: 50, w: 600, h: 350 }
  expect(backgroundCrop(region, layer, 1920, 1080)).toEqual({ x: 100, y: 50, w: 600, h: 350 })
  expect(backgroundCrop({ ...region, x: -200, y: -300, w: 3000, h: 2000 }, layer, 1920, 1080)).toEqual({ x: 0, y: 0, w: 1920, h: 1080 })
  expect(backgroundCrop(region, { id: 'paper', box: [200, 100, 100, 100] }, 1920, 1080)).toEqual({ x: 200, y: 100, w: 100, h: 100 })
  for (const patch of [{ ...region, layerId: 'other' }, { ...region, w: 0 }, { ...region, x: NaN }, { ...region, x: 3000 }]) expect(backgroundCrop(patch, layer, 1920, 1080)).toBeNull()
})

test('background selection persists by source layer and invalidates derived canvases', () => {
  const art = { id: 'a', an: { roles: [] }, backgroundRegion: { layerId: 'paper', x: 100, y: 50, w: 600, h: 350 }, U: {}, BG: {} }
  const metadata = metadataFor(art)
  const restored = { an: { roles: [] } }
  restoreMetadata(restored, metadata)
  expect(restored.backgroundRegion).toEqual(art.backgroundRegion)
  invalidateBackground(art)
  expect(art.U).toBeUndefined()
  expect(art.BG).toBeUndefined()
})

test('an offer cannot become headline simply because it is the only editable text', () => {
  const a = { w: 1920, h: 1080, source: { file: 'test_EN.psd' }, layers: [{ id: 'offer', name: 'Offer extended until the end of the month', kind: 'text', text: 'Offer extended until the end of the month', size: 96, box: [1000, 400, 500, 200] }, { id: 'raster', name: 'Vector Smart Object', kind: 'image', box: [100, 200, 700, 600] }] }
  const an = Adapt.analyseArtwork(a)
  expect(an.roles.find(r => r.id === 'offer').role).toBe('offer')
  expect(an.roles.some(r => r.role === 'headline')).toBe(false)
  expect(an.roles.find(r => r.id === 'raster').role).toBe('unassigned')
})

test('named headline retains priority, and recovery preserves designer corrections over updated heuristics', () => {
  const a = { w: 1920, h: 1080, source: { file: 'test_EN.psd' }, layers: [{ id: 'main', name: 'Main headline', kind: 'text', text: 'A compelling offer', size: 96, box: [100, 200, 700, 200] }] }
  expect(Adapt.analyseArtwork(a).roles[0].role).toBe('headline')
  const art = { an: { roles: [{ id: 'p1', role: 'offer' }] } }
  restoreMetadata(art, { id: 'asset', roles: [{ id: 'p1', role: 'headline', confidence: .75 }] })
  expect(art.an.roles[0].role).toBe('offer')
  restoreMetadata(art, { id: 'asset', roles: [{ id: 'p1', role: 'headline', confidence: 1 }] })
  expect(art.an.roles[0].role).toBe('headline')
})


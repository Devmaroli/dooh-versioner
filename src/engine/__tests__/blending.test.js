import { expect, test } from 'vitest'
import Adapt from '../adapt.js'
import { BLEND_GROUPS, BLEND_MODES, blendRgb, blendPixel, layerStyle, normalizeBlend } from '../../blending.js'

test('27 modes are uniquely grouped and PSD space-separated names normalize', () => {
  expect(BLEND_GROUPS).toHaveLength(6); expect(BLEND_MODES).toHaveLength(27); expect(new Set(BLEND_MODES).size).toBe(27)
  expect(normalizeBlend('linear dodge')).toBe('linear-dodge'); expect(normalizeBlend('Linear Dodge (Add)')).toBe('linear-dodge')
  expect(normalizeBlend('pass through')).toBe('normal')
})

test('normal opacity, multiply, screen and clamped addition match numerical examples', () => {
  const bottom = [80, 120, 160, 255], top = [160, 80, 40, 255]
  expect(blendPixel(bottom, top, 'normal', .5)).toEqual([120, 100, 100, 255])
  expect(blendPixel(bottom, top, 'multiply')).toEqual([50, 38, 25, 255])
  expect(blendPixel(bottom, top, 'screen')).toEqual([190, 162, 175, 255])
  expect(blendPixel([200, 200, 200, 255], top, 'linear-dodge', .5)).toEqual([228, 228, 220, 255])
  expect(blendPixel([0,0,0,255], [255,255,255,255], 'hard-mix')).toEqual([255,255,255,255])
  expect(blendPixel(bottom, top, 'normal', 0)).toEqual(bottom)
  expect(blendPixel([0, 0, 0, 0], [255, 0, 0, 128], 'multiply', .5)).toEqual([255, 0, 0, 64])
})

test('every blend mode handles transparent and extreme channels without nonfinite or out-of-range pixels', () => {
  for (const mode of BLEND_MODES) for (const bottom of [[0,0,0,0], [0,255,128,100], [255,255,255,255]]) for (const top of [[255,0,128,255], [0,0,0,0], [255,255,255,128]]) {
    const pixel = blendPixel(bottom, top, mode, .7, .3)
    expect(pixel.every(v => Number.isFinite(v) && v >= 0 && v <= 255)).toBe(true)
  }
  expect(blendPixel([10,20,30,255],[200,100,50,255],'dissolve',.3,.2)).toEqual([200,100,50,255])
  expect(blendPixel([10,20,30,255],[200,100,50,255],'dissolve',.3,.4)).toEqual([10,20,30,255])
  expect(blendRgb([.1,.9,.3],[.5,.2,.3],'darker-color')).toEqual([.5,.2,.3])
})

test('PSD leaf and group blend/opacity metadata are retained and opacity zero survives', () => {
  const result = Adapt.fromAgPsd({ width: 10, height: 10, children: [{ name: 'Group', blendMode: 'pass through', opacity: .6, children: [{ name: 'Top', left: 0, top: 0, right: 10, bottom: 10, blendMode: 'linear dodge', opacity: 0 }] }] }, 'blend.psd')
  const group = result.layers[0], leaf = group.children[0]
  expect(group.sourceBlend).toBe('pass through'); expect(group.opacity).toBe(.6)
  expect(leaf.sourceBlend).toBe('linear dodge'); expect(leaf.opacity).toBe(0)
  expect(layerStyle(leaf)).toEqual({ blend: 'linear-dodge', opacity: 0 })
})

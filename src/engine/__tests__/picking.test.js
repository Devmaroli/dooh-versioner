import { expect, test } from 'vitest'
import { pickForeground } from '../../picking.js'
import { backgroundFrame } from '../../background.js'

test('visible foreground is picked through transparent overlapping bounds in source stack order', () => {
  const layout = [{ id: 'front', frame: { x: .1, y: .1, w: .8, h: .8 } }, { id: 'back', frame: { x: .2, y: .2, w: .6, h: .6 } }]
  expect(pickForeground(layout, .5, .5, unit => unit.id === 'front' ? 0 : 255)).toBe('back')
  expect(pickForeground(layout, .5, .5, () => 255)).toBe('front')
  expect(pickForeground(layout, 0, 0, () => 255)).toBeNull()
  expect(pickForeground(layout, .5, .5, () => 0)).toBeNull()
})

test('background zoom and positioning preserve aspect and complete canvas coverage', () => {
  const source = { width: 900, height: 300 }
  for (const screen of [{ w: 1080, h: 1920 }, { w: 7680, h: 1152 }]) for (const scale of [100, 200, 800]) for (const x of [0, 50, 100]) {
    const f = backgroundFrame(source, screen, { scale, x, y: x })
    expect(f.w / f.h).toBeCloseTo(3)
    expect(f.x).toBeLessThanOrEqual(0); expect(f.y).toBeLessThanOrEqual(0)
    expect(f.x + f.w).toBeGreaterThanOrEqual(screen.w - .00001)
    expect(f.y + f.h).toBeGreaterThanOrEqual(screen.h - .00001)
  }
})

test('background can shrink below cover and move outside the composition', () => {
  const screen = { w: 1000, h: 1000 }, source = { width: 500, height: 500 }
  const f = backgroundFrame(source, screen, { scale: 50, offsetX: -80, offsetY: 20 })
  expect(f).toEqual({ x: -550, y: 450, w: 500, h: 500 })
})

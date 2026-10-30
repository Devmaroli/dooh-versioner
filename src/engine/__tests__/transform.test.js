import { expect, test } from 'vitest'
import { scaleFrame, pointerScale } from '../../transform.js'

test('all nine anchors stay fixed and scaling preserves proportions', () => {
  const frame = { x: .2, y: .3, w: .4, h: .2 }
  for (const x of [0, .5, 1]) for (const y of [0, .5, 1]) {
    const after = scaleFrame(frame, 1.7, { x, y })
    expect(after.x + after.w * x).toBeCloseTo(frame.x + frame.w * x)
    expect(after.y + after.h * y).toBeCloseTo(frame.y + frame.h * y)
    expect(after.w / after.h).toBeCloseTo(frame.w / frame.h)
  }
})

test('pointer scaling uses canvas pixels for wide and tall targets without flipping', () => {
  const f = { x: .2, y: .3, w: .4, h: .2 }, anchor = { x: .5, y: .5 }, handle = { x: 1, y: 1 }
  for (const bounds of [{ width: 1000, height: 200 }, { width: 200, height: 1000 }]) {
    expect(pointerScale(f, anchor, handle, .2 * bounds.width, .1 * bounds.height, bounds)).toBeCloseTo(2)
    expect(pointerScale(f, anchor, handle, -10000, -10000, bounds)).toBe(.01)
  }
  expect(pointerScale(f, anchor, anchor, 20, 20, { width: 100, height: 100 })).toBe(1)
})

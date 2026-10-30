import { expect, test } from 'vitest'
import { moveStack, stackOrder, materialStackOrder } from '../../stack.js'

test('stack order preserves explicit placement, adds new layers, and drops removed IDs', () => {
  expect(stackOrder(['a', 'b', '__border', '__background'], ['__background', 'b', 'removed'])).toEqual(['__background', 'b', 'a', '__border'])
})

test('reordering moves selected linked members as a block and leaves other layers in order', () => {
  const ids = ['a', 'b', 'c', 'd', '__background']
  expect(moveStack(ids, ['b', 'd'], 'a')).toEqual(['b', 'd', 'a', 'c', '__background'])
  expect(moveStack(ids, ['a'], '__background', true)).toEqual(['b', 'c', 'd', '__background', 'a'])
  expect(moveStack(ids, ['b'], 'b')).toEqual(ids)
})

test('a newly generated border appears above an existing background stack, preserving explicit later reorders', () => {
  expect(materialStackOrder(['a', '__border', '__background'], ['a', '__background'])).toEqual(['a', '__border', '__background'])
  expect(materialStackOrder(['a', '__border', '__background'], ['a', '__background', '__border'])).toEqual(['a', '__background', '__border'])
})

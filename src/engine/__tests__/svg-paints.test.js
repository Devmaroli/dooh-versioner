import { expect, test } from 'vitest'
import { parseSvgArtwork } from '../../svgDocument.js'
import { svgPaints } from '../../../tests/fixtures/svg-paints.js'
const flat = layers => layers.flatMap(l => [l, ...flat(l.children || [])])
const svg = body => `<svg viewBox="0 0 100 100">${body}</svg>`

test('class, id, element, inline and important declarations cascade over presentation attributes', () => {
  const layers = flat(parseSvgArtwork(svgPaints).layers)
  expect(layers.find(l => l.name === 'class')).toMatchObject({ fill: '#ff0000', stroke: '#123456', strokeWidth: 2 })
  expect(layers.find(l => l.name === 'inline').fill).toBe('#ffff00')
  const art = parseSvgArtwork(svg('<style>.x { fill:red!important } #r {fill:blue}</style><rect id="r" class="x" style="fill:green" width="10" height="10"/>'))
  expect(art.layers[0].fill).toBe('red')
})
test('inheritance, currentColor, opacity, display and overridable visibility', () => {
  const art = parseSvgArtwork(svg('<g color="red" fill="currentColor" opacity=".4"><rect width="10" height="10"/></g><g display="none"><rect width="10" height="10"/></g><g visibility="hidden"><rect width="10" height="10"/><rect visibility="visible" width="10" height="10"/></g>'))
  expect(art.layers).toHaveLength(2)
  expect(art.layers.find(l => l.opacity === .4)).toMatchObject({ opacity: .4, children: [{ fill: 'red', opacity: 1 }] })
  expect(art.layers.every(l => l.children.length === 1)).toBe(true)
})
test('gradient model keeps CSS stops, inherited geometry, transform, spread and paint references', () => {
  const layers = flat(parseSvgArtwork(svgPaints).layers)
  expect(layers.find(l => l.name === 'linear-box').fillGradient).toMatchObject({ type: 'linearGradient', attrs: { gradientUnits: 'userSpaceOnUse', spreadMethod: 'reflect', x2: '100', gradientTransform: 'translate(0 0)' }, stops: [{ 'stop-color': '#ff0000' }, { 'stop-color': '#0000ff', 'stop-opacity': '1' }] })
  expect(layers.find(l => l.name === 'radial-box').fillGradient.type).toBe('radialGradient')
  const stroke = parseSvgArtwork(svg('<defs><linearGradient id="g"><stop stop-color="red"/></linearGradient></defs><rect width="10" height="10" stroke="url(#g)"/>')).layers[0]
  expect(stroke.strokeGradient.stops[0]['stop-color']).toBe('red')
})
test('use resolves defs images, paths, groups and symbol viewport, and terminates cycles', () => {
  const art = parseSvgArtwork(svg('<defs><image id="im" href="data:image/png;base64,AAAA" width="10" height="20"/><g id="cycle"><use href="#cycle"/></g></defs><use xlink:href="#im" x="30" y="40"/><use href="#cycle"/>'))
  expect(art.layers[0].children[0]).toMatchObject({ kind: 'image', box: [30, 40, 10, 20], embeddedImage: { base64: 'AAAA' } })
  expect(art.warnings.join(' ')).toContain('cyclic')
  const layers = flat(parseSvgArtwork(svgPaints).layers)
  expect(layers.find(l => l.name === 'path' && l.box[1] === 80).box).toEqual([0, 80, 10, 10])
  expect(layers.some(l => l.box[0] === 40 && l.box[1] === 80 && l.box[2] === 20)).toBe(true)
})
test('root inherited styles and nonzero viewBox origin reach leaf layers', () => {
  const art = parseSvgArtwork('<svg viewBox="10 20 100 100" fill="red"><rect x="10" y="20" width="10" height="10"/></svg>')
  expect(art.layers[0]).toMatchObject({ fill: 'red', box: [0, 0, 10, 10] })
})

test('inherited currentColor uses each descendant colour and paint opacity stays separate from group opacity', () => {
  const art = parseSvgArtwork(svg('<g color="red" fill="currentColor" opacity="50%"><rect color="blue" width="10" height="10"/></g>'))
  expect(art.layers[0].opacity).toBe(.5)
  expect(art.layers[0].children[0].fill).toBe('blue')
})

test('descendant/child selectors and source order participate in the same cascade', () => {
  const art = parseSvgArtwork(svg('<style>g > rect.x {fill:red} g rect {fill:blue} .x {fill:green} g > rect.x {fill:purple}</style><g><rect class="x" width="10" height="10"/></g>'))
  expect(art.layers[0].children[0].fill).toBe('purple')
})

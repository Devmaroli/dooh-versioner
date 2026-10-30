export const BLEND_GROUPS = [
  ['Normal', ['normal', 'dissolve']],
  ['Darken', ['darken', 'multiply', 'color-burn', 'linear-burn', 'darker-color']],
  ['Lighten', ['lighten', 'screen', 'color-dodge', 'linear-dodge', 'lighter-color']],
  ['Contrast', ['overlay', 'soft-light', 'hard-light', 'vivid-light', 'linear-light', 'pin-light', 'hard-mix']],
  ['Comparative', ['difference', 'exclusion', 'subtract', 'divide']],
  ['Component', ['hue', 'saturation', 'color', 'luminosity']],
]
export const BLEND_MODES = BLEND_GROUPS.flatMap(([, modes]) => modes)
export const blendLabel = mode => mode === 'linear-dodge' ? 'Linear Dodge (Add)' : mode.replace(/(^|-)(\w)/g, (_, dash, c) => (dash ? ' ' : '') + c.toUpperCase())
export function normalizeBlend(mode = 'normal') {
  const key = mode.toLowerCase().replace(/\s*\(add\)/, '').trim().replace(/\s+/g, '-')
  return key === 'pass-through' ? 'normal' : key
}
export const clamp01 = value => Math.max(0, Math.min(1, value))
const burn = (b, s) => b === 1 ? 1 : s === 0 ? 0 : 1 - Math.min(1, (1 - b) / s)
const dodge = (b, s) => b === 0 ? 0 : s === 1 ? 1 : Math.min(1, b / (1 - s))
const lum = c => .3 * c[0] + .59 * c[1] + .11 * c[2]
const sat = c => Math.max(...c) - Math.min(...c)
function setLum(c, value) {
  const result = c.map(v => v + value - lum(c)), l = lum(result), n = Math.min(...result), x = Math.max(...result)
  if (n < 0) for (let i = 0; i < 3; i++) result[i] = l + (result[i] - l) * l / (l - n)
  if (x > 1) for (let i = 0; i < 3; i++) result[i] = l + (result[i] - l) * (1 - l) / (x - l)
  return result
}
function setSat(c, value) {
  const order = [0, 1, 2].sort((a, b) => c[a] - c[b]), [lo, mid, hi] = order, result = [0, 0, 0]
  if (c[hi] > c[lo]) { result[mid] = (c[mid] - c[lo]) * value / (c[hi] - c[lo]); result[hi] = value }
  return result
}
export function blendRgb(bottom, top, mode) {
  if (mode === 'darker-color' || mode === 'lighter-color') return (mode === 'darker-color' ? top.reduce((a, b) => a + b, 0) < bottom.reduce((a, b) => a + b, 0) : top.reduce((a, b) => a + b, 0) > bottom.reduce((a, b) => a + b, 0)) ? top : bottom
  if (mode === 'hue') return setLum(setSat(top, sat(bottom)), lum(bottom))
  if (mode === 'saturation') return setLum(setSat(bottom, sat(top)), lum(bottom))
  if (mode === 'color') return setLum(top, lum(bottom))
  if (mode === 'luminosity') return setLum(bottom, lum(top))
  return bottom.map((b, i) => {
    const s = top[i]
    switch (mode) {
      case 'normal': case 'dissolve': return s
      case 'darken': return Math.min(b, s)
      case 'multiply': return b * s
      case 'color-burn': return burn(b, s)
      case 'linear-burn': return Math.max(0, b + s - 1)
      case 'lighten': return Math.max(b, s)
      case 'screen': return b + s - b * s
      case 'color-dodge': return dodge(b, s)
      case 'linear-dodge': return Math.min(1, b + s)
      case 'overlay': return b <= .5 ? 2 * b * s : 1 - 2 * (1 - b) * (1 - s)
      case 'hard-light': return s <= .5 ? 2 * b * s : 1 - 2 * (1 - b) * (1 - s)
      case 'soft-light': { const d = b <= .25 ? ((16 * b - 12) * b + 4) * b : Math.sqrt(b); return s <= .5 ? b - (1 - 2 * s) * b * (1 - b) : b + (2 * s - 1) * (d - b) }
      case 'vivid-light': return s < .5 ? burn(b, 2 * s) : dodge(b, 2 * s - 1)
      case 'linear-light': return clamp01(b + 2 * s - 1)
      case 'pin-light': return s < .5 ? Math.min(b, 2 * s) : Math.max(b, 2 * s - 1)
      case 'hard-mix': return b + s >= 1 - 1e-12 ? 1 : 0
      case 'difference': return Math.abs(b - s)
      case 'exclusion': return b + s - 2 * b * s
      case 'subtract': return Math.max(0, b - s)
      case 'divide': return s === 0 ? 1 : Math.min(1, b / s)
      default: throw new Error(`Unsupported blend mode: ${mode}`)
    }
  })
}
export function blendPixel(bottom, top, mode = 'normal', opacity = 1, noise = .5) {
  let as = top[3] / 255 * clamp01(opacity)
  if (mode === 'dissolve') as = noise < as ? 1 : 0
  const ab = bottom[3] / 255, alpha = as + ab * (1 - as)
  if (!alpha) return [0, 0, 0, 0]
  const cb = bottom.slice(0, 3).map(v => v / 255), cs = top.slice(0, 3).map(v => v / 255), blend = blendRgb(cb, cs, mode)
  return [...cb.map((b, i) => Math.round(clamp01((as * ((1 - ab) * cs[i] + ab * blend[i]) + (1 - as) * ab * b) / alpha) * 255 + 1e-10)), Math.round(alpha * 255)]
}
const native = new Set(['normal', 'darken', 'multiply', 'color-burn', 'lighten', 'screen', 'color-dodge', 'overlay', 'soft-light', 'hard-light', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'])
export function layerStyle(layer, overrides = {}) {
  return { blend: normalizeBlend(overrides.blend ?? layer?.blend ?? layer?.sourceBlend ?? 'normal'), opacity: clamp01(overrides.opacity ?? layer?.opacity ?? 1) * (layer?.parentOpacity ?? 1) }
}
// Native modes use the browser compositor. Unsupported modes use bounded device-pixel tiles.
export function compositeDraw(ctx, draw, style = {}, bounds) {
  const mode = normalizeBlend(style.blend), opacity = clamp01(style.opacity ?? 1)
  if (!BLEND_MODES.includes(mode)) throw new Error(`Unsupported blend mode: ${mode}`)
  if (opacity === 0) return
  if (native.has(mode)) {
    ctx.save(); ctx.globalAlpha *= opacity; ctx.globalCompositeOperation = mode === 'normal' ? 'source-over' : mode
    draw(ctx); ctx.restore(); return
  }
  const m = ctx.getTransform(), area = bounds || { x: 0, y: 0, w: ctx.canvas.width / m.a, h: ctx.canvas.height / m.d }
  const corners = [[area.x, area.y], [area.x + area.w, area.y], [area.x, area.y + area.h], [area.x + area.w, area.y + area.h]].map(([x, y]) => ({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f }))
  const left = Math.max(0, Math.floor(Math.min(...corners.map(p => p.x)))), top = Math.max(0, Math.floor(Math.min(...corners.map(p => p.y))))
  const right = Math.min(ctx.canvas.width, Math.ceil(Math.max(...corners.map(p => p.x)))), bottom = Math.min(ctx.canvas.height, Math.ceil(Math.max(...corners.map(p => p.y))))
  const tile = document.createElement('canvas')
  for (let y = top; y < bottom; y += 128) for (let x = left; x < right; x += 256) {
    tile.width = Math.min(256, right - x); tile.height = Math.min(128, bottom - y)
    const g = tile.getContext('2d'); g.setTransform(m.a, m.b, m.c, m.d, m.e - x, m.f - y); draw(g)
    const source = g.getImageData(0, 0, tile.width, tile.height).data, dest = ctx.getImageData(x, y, tile.width, tile.height)
    for (let i = 0; i < source.length; i += 4) {
      if (!source[i + 3]) continue
      const px = x + (i / 4) % tile.width, py = y + Math.floor(i / 4 / tile.width)
      let hash = Math.imul(px + 1, 374761393) ^ Math.imul(py + 1, 668265263); hash = Math.imul(hash ^ hash >>> 13, 1274126177)
      const result = blendPixel(Array.from(dest.data.subarray(i, i + 4)), Array.from(source.subarray(i, i + 4)), mode, opacity * ctx.globalAlpha, (hash >>> 0) / 4294967296)
      dest.data.set(result, i)
    }
    ctx.putImageData(dest, x, y)
  }
}

import { allLayers } from './artwork.js'
// A vector outline must refer to a detected original source border, never a new decoration.
export function borderGeometry(art, screen, layout, proof) {
  const border = art.originalBorder
  if (!border || !allLayers(art).some(l => l.id === border.sourceLayerId && !l.effectiveHidden && !l.logoProtected)) return null
  const short = Math.min(screen.w, screen.h), sourceShort = Math.min(art.a.w, art.a.h)
  const thickness = Math.max(1, (proof?.borderThickness ?? border.thickness) * short / sourceShort)
  if (proof?.borderFrame) { const f = proof.borderFrame; return { x: f.x * screen.w, y: f.y * screen.h, w: f.w * screen.w, h: f.h * screen.h, thickness } }
  const inset = (border.margin ?? 4) / 100 * short + thickness / 2
  const stampBottom = Math.max(0, ...layout.filter(u => u.role === 'stamp').map(u => (u.frame.y + u.frame.h) * screen.h))
  const top = Math.max(inset, stampBottom ? stampBottom + short * .025 + thickness / 2 : inset)
  return { x: inset, y: top, w: Math.max(0, screen.w - inset * 2), h: Math.max(0, screen.h - inset - top), thickness }
}

export function drawOriginalBorder(ctx, art, screen, layout, proof) {
  const frame = borderGeometry(art, screen, layout, proof)
  if (!frame || frame.w <= 0 || frame.h <= 0) return
  ctx.save(); ctx.strokeStyle = art.originalBorder.color; ctx.lineWidth = frame.thickness
  ctx.strokeRect(frame.x, frame.y, frame.w, frame.h); ctx.restore()
}

export function detectSourceBorder(layer, rect) {
  if (layer.logoProtected || !layer.px || rect.w < 32 || rect.h < 32) return null
  const c = document.createElement('canvas'); c.width = 128; c.height = 128
  const g = c.getContext('2d'), [x, y, w, h] = layer.box
  // A small band on either side tolerates an imprecise mouse trace.
  const pad = 12
  g.drawImage(layer.px, (rect.x - pad - x) * layer.px.width / w, (rect.y - pad - y) * layer.px.height / h, (rect.w + pad * 2) * layer.px.width / w, (rect.h + pad * 2) * layer.px.height / h, 0, 0, 128, 128)
  const d = g.getImageData(0, 0, 128, 128).data, colors = [], sides = [0, 0, 0, 0]
  const bandX = Math.max(2, Math.ceil(pad * 2 / (rect.w + pad * 2) * 128)), bandY = Math.max(2, Math.ceil(pad * 2 / (rect.h + pad * 2) * 128))
  for (let py = 0; py < 128; py++) for (let px = 0; px < 128; px++) {
    const i = (py * 128 + px) * 4
    if (d[i + 3] < 70 || .2126 * d[i] + .7152 * d[i + 1] + .0722 * d[i + 2] > 120) continue
    const near = [px <= bandX, px >= 127 - bandX, py <= bandY, py >= 127 - bandY]
    near.forEach((yes, side) => { if (yes) sides[side]++ })
    if (near.some(Boolean)) colors.push([d[i], d[i + 1], d[i + 2]])
  }
  if (sides.some(count => count < 35) || !colors.length) return null
  const median = index => colors.map(c => c[index]).sort((a, b) => a - b)[colors.length >> 1]
  return '#' + [median(0), median(1), median(2)].map(v => v.toString(16).padStart(2, '0')).join('')
}

export function borderInterior(layer, rect, thickness) {
  if (layer.logoProtected) return null
  const pad = Math.max(12, thickness * 2), crop = { x: rect.x + pad, y: rect.y + pad, w: rect.w - pad * 2, h: rect.h - pad * 2 }
  if (crop.w < 8 || crop.h < 8) return null
  const c = document.createElement('canvas'); c.width = Math.ceil(crop.w); c.height = Math.ceil(crop.h)
  const g = c.getContext('2d'), [x, y, w, h] = layer.box
  g.drawImage(layer.px, (crop.x - x) * layer.px.width / w, (crop.y - y) * layer.px.height / h, crop.w * layer.px.width / w, crop.h * layer.px.height / h, 0, 0, c.width, c.height)
  const d = g.getImageData(0, 0, c.width, c.height).data
  let left = c.width, top = c.height, right = -1, bottom = -1
  for (let py = 0; py < c.height; py++) for (let px = 0; px < c.width; px++) if (d[(py * c.width + px) * 4 + 3] > 0) {
    left = Math.min(left, px); top = Math.min(top, py); right = Math.max(right, px); bottom = Math.max(bottom, py)
  }
  // All existing interior pixels are preserved; only transparent margins are trimmed.
  return right < left ? null : { x: crop.x + left, y: crop.y + top, w: right - left + 1, h: bottom - top + 1 }
}

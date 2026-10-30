// Pixel segmentation only. This does not recreate fonts or claim to recover vector paths.
export function splitSourceWords(layer) {
  if (layer.logoProtected) throw new Error('Logo-protected artwork must remain whole. Word separation is unavailable.')
  const [lx, ly, lw, lh] = layer.box, crop = layer.crop || { x: lx, y: ly, w: lw, h: lh }
  const c = document.createElement('canvas'); c.width = Math.ceil(crop.w); c.height = Math.ceil(crop.h)
  const g = c.getContext('2d')
  g.drawImage(layer.px, (crop.x - lx) * layer.px.width / lw, (crop.y - ly) * layer.px.height / lh, crop.w * layer.px.width / lw, crop.h * layer.px.height / lh, 0, 0, c.width, c.height)
  const data = g.getImageData(0, 0, c.width, c.height).data
  const occupied = (x, y) => data[(y * c.width + x) * 4 + 3] > 0
  function bands(flags, gap) {
    const spans = []; let start = -1, last = -1
    for (let i = 0; i <= flags.length + gap; i++) {
      if (flags[i]) { if (start < 0) start = i; last = i }
      else if (start >= 0 && i - last >= gap) { spans.push([start, last + 1]); start = -1 }
    }
    return spans
  }
  const rows = Array.from({ length: c.height }, (_, y) => { for (let x = 0; x < c.width; x++) if (occupied(x, y)) return true; return false })
  const lines = bands(rows, 4), pieces = []
  for (const [top, bottom] of lines) {
    const cols = Array.from({ length: c.width }, (_, x) => { for (let y = top; y < bottom; y++) if (occupied(x, y)) return true; return false })
    for (const [left, right] of bands(cols, Math.max(4, Math.round((bottom - top) * .3)))) pieces.push({ x: crop.x + Math.max(0, left - 1), y: crop.y + Math.max(0, top - 1), w: Math.min(c.width, right + 1) - Math.max(0, left - 1), h: Math.min(c.height, bottom + 1) - Math.max(0, top - 1) })
  }
  if (pieces.length < 2 || pieces.length > 40) throw new Error('No reliable word gaps found. Remove the shared border first, or use a source with separate text layers. Opaque or connected lettering cannot be split safely.')
  return pieces
}

export function arrangeFrames(frames, ids, action, reference, screen) {
  if (!ids.length) return frames
  const next = structuredClone(frames), chosen = ids.map(id => next[id]).filter(Boolean)
  if (!chosen.length) return frames
  const target = reference === 'canvas' ? { x: 0, y: 0, w: 1, h: 1 } : {
    x: Math.min(...chosen.map(f => f.x)), y: Math.min(...chosen.map(f => f.y)),
    w: Math.max(...chosen.map(f => f.x + f.w)) - Math.min(...chosen.map(f => f.x)),
    h: Math.max(...chosen.map(f => f.y + f.h)) - Math.min(...chosen.map(f => f.y)),
  }
  if (action.startsWith('distribute')) {
    if (chosen.length < 3) return frames
    const axis = action === 'distribute-x' ? 'x' : 'y', size = axis === 'x' ? 'w' : 'h'
    const ordered = chosen.slice().sort((a, b) => a[axis] - b[axis])
    const gap = (target[size] - ordered.reduce((total, f) => total + f[size], 0)) / (ordered.length - 1)
    let cursor = target[axis]
    ordered.forEach(f => { f[axis] = cursor; cursor += f[size] + gap })
    return next
  }
  chosen.forEach(f => {
    if (action === 'left') f.x = target.x
    if (action === 'right') f.x = target.x + target.w - f.w
    if (action === 'center-x') f.x = target.x + (target.w - f.w) / 2
    if (action === 'top') f.y = target.y
    if (action === 'bottom') f.y = target.y + target.h - f.h
    if (action === 'center-y') f.y = target.y + (target.h - f.h) / 2
  })
  return next
}


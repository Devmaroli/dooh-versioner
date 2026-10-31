// Pixel segmentation only. This does not recreate fonts or claim to recover vector paths.
export function splitSourceWords(layer, { allowSingle = false } = {}) {
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
  if (pieces.length < (allowSingle ? 1 : 2) || pieces.length > 40) throw new Error('No reliable word gaps found. Remove the shared border first, or use a source with separate text layers. Opaque or connected lettering cannot be split safely.')
  return pieces
}

// Separate disconnected source ink first, so an enclosing border cannot join every word.
// Masks select existing ink; the original SVG/PDF remains the rendering source.
export function splitSourceParts(layer) {
  if (layer.logoProtected) throw new Error('Logo-protected artwork must remain whole.')
  const [lx, ly, lw, lh] = layer.box, region = layer.crop || { x: lx, y: ly, w: lw, h: lh }
  const scale = Math.min(1, 2048 / Math.max(region.w, region.h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.ceil(region.w * scale)); canvas.height = Math.max(1, Math.ceil(region.h * scale))
  const ctx = canvas.getContext('2d')
  ctx.drawImage(layer.px, (region.x-lx)*layer.px.width/lw, (region.y-ly)*layer.px.height/lh, region.w*layer.px.width/lw, region.h*layer.px.height/lh, 0, 0, canvas.width, canvas.height)
  const { width, height } = canvas, image = ctx.getImageData(0, 0, width, height), labels = new Int32Array(width*height), queue = new Int32Array(width*height), components = []
  for (let start = 0; start < labels.length; start++) {
    if (labels[start] || !image.data[start*4+3]) continue
    const id = components.length+1, component = { id, left: width, top: height, right: 0, bottom: 0 }
    let head = 0, tail = 1; queue[0] = start; labels[start] = id
    while (head < tail) {
      const pixel = queue[head++], x = pixel%width, y = Math.floor(pixel/width)
      component.left = Math.min(component.left,x); component.top = Math.min(component.top,y)
      component.right = Math.max(component.right,x+1); component.bottom = Math.max(component.bottom,y+1)
      for (let yy = Math.max(0,y-1); yy <= Math.min(height-1,y+1); yy++) for (let xx = Math.max(0,x-1); xx <= Math.min(width-1,x+1); xx++) {
        const next = yy*width+xx
        if (!labels[next] && image.data[next*4+3]) { labels[next] = id; queue[tail++] = next }
      }
    }
    components.push(component)
    if (components.length > 4096) throw new Error('Too many disconnected marks to split safely. Select a smaller source layer.')
  }
  const surrounds = (a,b) => a.left < b.left && a.top < b.top && a.right > b.right && a.bottom > b.bottom
  const borders = components.filter(a => components.some(b => surrounds(a,b)))
  const borderIds = new Set(borders.map(c => c.id))
  const remaining = components.filter(c => !borderIds.has(c.id))
  const interior = document.createElement('canvas'); interior.width = width; interior.height = height
  const pixels = new ImageData(new Uint8ClampedArray(image.data),width,height)
  for (let i = 0; i < labels.length; i++) if (borderIds.has(labels[i])) pixels.data[i*4+3] = 0
  interior.getContext('2d').putImageData(pixels,0,0)
  const crops = remaining.length ? splitSourceWords({ ...layer, logoProtected: false, px: interior, box: [0,0,width,height], crop: null }, { allowSingle: true }) : []
  const groups = [...borders.map(c => ({ bounds: c, ids: new Set([c.id]), isBorder: true })), ...crops.map(crop => ({ bounds: { left:crop.x,top:crop.y,right:crop.x+crop.w,bottom:crop.y+crop.h }, ids:new Set(remaining.filter(c => c.left < crop.x+crop.w && c.right > crop.x && c.top < crop.y+crop.h && c.bottom > crop.y).map(c => c.id)), isBorder:false }))]
  if (groups.length < 2 || groups.length > 80) throw new Error('No separate words or components found. This source is opaque or its shapes touch; keep it intact or use separate original objects.')
  const sx = region.w/width, sy = region.h/height
  return groups.map(group => {
    const b = group.bounds, crop = { x:region.x+b.left*sx,y:region.y+b.top*sy,w:(b.right-b.left)*sx,h:(b.bottom-b.top)*sy }
    // A one-pixel margin keeps the source's antialiased curves inside the mask.
    // Only overlapping component bounds need masking (e.g. a border around words).
    const overlaps = components.some(c => !group.ids.has(c.id) && c.left < b.right && c.right > b.left && c.top < b.bottom && c.bottom > b.top)
    let sourceClip = ''
    if (overlaps) for (let y = b.top; y < b.bottom; y++) {
      let start = -1
      for (let x = b.left; x <= b.right; x++) {
        const occupied = x < b.right && group.ids.has(labels[y*width+x])
        if (occupied && start < 0) start = x
        if (!occupied && start >= 0) {
          const left = Math.max(b.left,start-1), top = Math.max(b.top,y-1), right = Math.min(b.right,x+1), bottom = Math.min(b.bottom,y+2)
          sourceClip += `M${region.x+left*sx} ${region.y+top*sy}h${(right-left)*sx}v${(bottom-top)*sy}h${-(right-left)*sx}Z`
          start = -1
        }
      }
    }
    return { crop, sourceClip: sourceClip || undefined, isBorder:group.isBorder }
  })
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


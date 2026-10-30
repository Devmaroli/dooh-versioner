// Regions use original artboard pixels, never CSS pixels or layer-local coordinates.
export function rectangleBetween(start, end, width, height, origin = { x: 0, y: 0 }) {
  const clamp = (v, min, size) => Math.round(Math.max(min, Math.min(min + size, v)))
  const x1 = clamp(start.x, origin.x, width), y1 = clamp(start.y, origin.y, height)
  const x2 = clamp(end.x, origin.x, width), y2 = clamp(end.y, origin.y, height)
  return { x: Math.min(x1, x2), y: Math.min(y1, y2), w: Math.abs(x2 - x1), h: Math.abs(y2 - y1) }
}

export function backgroundCrop(region, layer, width, height) {
  if (!region || region.layerId !== layer.id || !layer.box) return null
  const { x, y, w, h } = region
  if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return null
  const [lx, ly, lw, lh] = layer.box
  const extended = region.scope === 'layer'
  const left = Math.max(extended ? lx : 0, x, lx), top = Math.max(extended ? ly : 0, y, ly)
  const right = Math.min(extended ? lx + lw : width, x + w, lx + lw), bottom = Math.min(extended ? ly + lh : height, y + h, ly + lh)
  if (right <= left || bottom <= top) return null
  return { x: left, y: top, w: right - left, h: bottom - top }
}

export function invalidateBackground(art) {
  delete art.BG
  delete art.GU
  delete art.PA
  delete art.U
}

export function backgroundFrame(source, screen, settings = {}) {
  const zoom = Math.max(.01, Math.min(8, (settings.scale ?? 100) / 100))
  const scale = Math.max(screen.w / source.width, screen.h / source.height) * zoom
  const w = source.width * scale, h = source.height * scale
  return { x: (settings.offsetX || 0) / 100 * screen.w + (screen.w - w) * Math.max(0, Math.min(1, (settings.x ?? 50) / 100)), y: (settings.offsetY || 0) / 100 * screen.h + (screen.h - h) * Math.max(0, Math.min(1, (settings.y ?? 50) / 100)), w, h }
}

// Layout order matches the source stack: first is frontmost. Ignore transparent pixels.
export function pickForeground(layout, x, y, alphaAt) {
  for (const unit of layout) {
    const f = unit.frame
    if (x < f.x || y < f.y || x >= f.x + f.w || y >= f.y + f.h) continue
    if (alphaAt(unit, (x - f.x) / f.w, (y - f.y) / f.h) > 16) return unit.id
  }
  return null
}

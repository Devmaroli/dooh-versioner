// Frames use normalized canvas coordinates. Uniform scale preserves source proportions.
export function scaleFrame(frame, factor, anchor) {
  const scale = Math.max(.01, Math.min(100, factor))
  const w = frame.w * scale, h = frame.h * scale
  return { x: frame.x + (frame.w - w) * anchor.x, y: frame.y + (frame.h - h) * anchor.y, w, h }
}

export function pointerScale(frame, anchor, handle, dx, dy, bounds) {
  const vx = (handle.x - anchor.x) * frame.w * bounds.width
  const vy = (handle.y - anchor.y) * frame.h * bounds.height
  const length = vx * vx + vy * vy
  return length ? Math.max(.01, 1 + (dx * vx + dy * vy) / length) : 1
}

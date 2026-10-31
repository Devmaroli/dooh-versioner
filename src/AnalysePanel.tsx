import { useRef, type ReactNode } from 'react'

export function AnalysePanel({ title, className, width, collapsed, onResize, onCollapse, children }: {
  title: string; className: string; width: number; collapsed: boolean
  onResize: (width: number, commit: boolean) => void; onCollapse: () => void; children: ReactNode
}) {
  const drag = useRef<{ x: number; width: number } | null>(null)
  const clamp = (value: number) => Math.max(240, Math.min(440, value))
  return <aside className={`${className} analyse-panel ${collapsed ? 'is-collapsed' : ''}`} aria-label={`${title} panel`}>
    {!collapsed && <div className="analyse-panel-resize" role="separator" aria-label={`Resize ${title.toLowerCase()} panel`} aria-orientation="vertical" aria-valuemin={240} aria-valuemax={440} aria-valuenow={width} tabIndex={0}
      onKeyDown={e => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); onResize(clamp(width + (e.key === 'ArrowLeft' ? 10 : -10)), true) } }}
      onPointerDown={e => { e.preventDefault(); drag.current = { x: e.clientX, width }; e.currentTarget.setPointerCapture(e.pointerId) }}
      onPointerMove={e => { if (drag.current) onResize(clamp(drag.current.width + drag.current.x - e.clientX), false) }}
      onPointerUp={e => { if (drag.current) { onResize(clamp(drag.current.width + drag.current.x - e.clientX), true); drag.current = null; e.currentTarget.releasePointerCapture(e.pointerId) } }}
      onPointerCancel={() => { drag.current = null; onResize(width, true) }} />}
    <header className="analyse-panel-heading"><strong>{title}</strong><button type="button" className="ghost" aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${title.toLowerCase()} panel`} aria-expanded={!collapsed} onClick={onCollapse}>{collapsed ? '‹' : '›'}</button></header>
    <div className="analyse-panel-content" hidden={collapsed}>{children}</div>
  </aside>
}

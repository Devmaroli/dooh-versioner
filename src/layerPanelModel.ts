export type LayerType = 'pixel' | 'text' | 'vector' | 'adjustment' | 'group'
export type LayerLocks = { transparency: boolean; pixels: boolean; position: boolean; artboards: boolean; all: boolean }
export type LayerMask = { kind: 'path' | 'bitmap'; reference?: string; pathData?: string; rect?: { x: number; y: number; w: number; h: number }; enabled: boolean; linked: boolean; canvasRect?: { x: number; y: number; w: number; h: number } }
export type LayerRecord = {
  id: string; name: string; type: LayerType; visible: boolean; blendMode: string; opacity: number; fill: number; parentId: string | null
  locks: LayerLocks; mask: LayerMask | null
  sourceIds: string[]; memberIds: string[]; importedGroup?: boolean; importedEffects?: Record<string, unknown> | null
  fx?: { stroke?: { enabled: boolean; color: string; width: number; opacity: number } }
  adjustment?: { brightness: number; contrast: number }; empty?: boolean; deleted?: boolean
  originId?: string; role?: string; roleSuggested?: boolean; sourceKind?: string; linkId?: string; sourceLink?: boolean
  fontStatus?: string; requestedFont?: string
  expanded?: boolean
}
export type LayerPanelState = { version: 1; nodes: LayerRecord[] }
export type LayerPanelAction =
  | { type: 'patch'; ids: string[]; patch: Partial<LayerRecord> }
  | { type: 'lock'; ids: string[]; key: keyof LayerLocks; value: boolean }
  | { type: 'move'; ids: string[]; target: string; placement: 'before' | 'after' | 'inside' }
  | { type: 'group'; ids: string[]; id: string }
  | { type: 'ungroup'; ids: string[] }
  | { type: 'create'; layer: LayerRecord }
  | { type: 'delete'; ids: string[] }

export const unlocked = (): LayerLocks => ({ transparency: false, pixels: false, position: false, artboards: false, all: false })
export function descendants(state: LayerPanelState, id: string): string[] {
  return state.nodes.filter(n => !n.deleted && n.parentId === id).flatMap(n => [n.id, ...descendants(state, n.id)])
}
export function ancestors(state: LayerPanelState, id: string): LayerRecord[] {
  const result: LayerRecord[] = [], seen = new Set<string>(); let item = state.nodes.find(n => n.id === id)
  while (item?.parentId && !seen.has(item.parentId)) { seen.add(item.parentId); item = state.nodes.find(n => n.id === item!.parentId); if (item) result.push(item) }
  return result
}
export function effectiveLocks(state: LayerPanelState, id: string): LayerLocks {
  const own = state.nodes.find(n => n.id === id), chain = own ? [own, ...ancestors(state, id)] : []
  return Object.fromEntries(Object.keys(unlocked()).map(key => [key, chain.some(n => n.locks?.all || n.locks?.[key])])) as LayerLocks
}
export function effectiveVisible(state: LayerPanelState, id: string) {
  const node = state.nodes.find(n => n.id === id)
  return !node || !node.deleted && node.visible && ancestors(state, id).every(p => !p.deleted && p.visible)
}
export function orderedNodes(state: LayerPanelState, parentId: string | null = null, depth = 0): Array<{ layer: LayerRecord; depth: number }> {
  return state.nodes.filter(n => !n.deleted && n.parentId === parentId).flatMap(layer => [{ layer, depth }, ...orderedNodes(state, layer.id, depth + 1)])
}
export function normalizePanel(state: LayerPanelState): LayerPanelState {
  const ids = new Set(state.nodes.map(n => n.id))
  if (ids.size !== state.nodes.length) throw new Error('Layer identifiers must be unique.')
  const nodes = state.nodes.map(n => ({ ...n, parentId: n.parentId && ids.has(n.parentId) ? n.parentId : null }))
  for (const n of nodes) {
    const seen = new Set([n.id]); let parent = n.parentId
    while (parent) { if (seen.has(parent)) throw new Error('A layer cannot be its own ancestor.'); seen.add(parent); parent = nodes.find(p => p.id === parent)?.parentId || null }
    if (n.parentId && nodes.find(p => p.id === n.parentId)?.type !== 'group') throw new Error('Only groups can contain layers.')
  }
  return { version: 1, nodes }
}
export function reconcilePanel(saved: LayerPanelState | undefined, templates: LayerRecord[]): LayerPanelState {
  if (!saved) return normalizePanel({ version: 1, nodes: templates })
  const map = new Map(templates.map(n => [n.id, n]))
  const nodes: LayerRecord[] = saved.nodes.filter(n => map.has(n.id) || n.empty || n.type === 'group' && !n.importedGroup || n.type === 'adjustment').map(n => ({ ...map.get(n.id), ...n, role:map.get(n.id)?.role, roleSuggested:map.get(n.id)?.roleSuggested, fontStatus:map.get(n.id)?.fontStatus, requestedFont:map.get(n.id)?.requestedFont, linkId:map.get(n.id)?.linkId }))
  let wordOffset=0
  for (const node of templates) if (!nodes.some(n => n.id === node.id)) {
    const previous=node.originId?saved.nodes.find(n=>n.sourceIds.includes(node.originId!)):null
    if(previous){nodes.splice(Math.min(saved.nodes.indexOf(previous)+wordOffset++,nodes.length),0,{...node,parentId:previous.parentId,fill:previous.fill,fx:previous.fx})}
    else if(node.id==='__border'&&nodes.some(n=>n.id==='__background'))nodes.splice(nodes.findIndex(n=>n.id==='__background'),0,node)
    else nodes.push(node)
  }
  return normalizePanel({ version: 1, nodes })
}
export function reducePanel(state: LayerPanelState, action: LayerPanelAction): LayerPanelState {
  let nodes = state.nodes.map(n => ({ ...n, locks: { ...unlocked(), ...n.locks } }))
  const ids = 'ids' in action ? new Set(action.ids) : new Set<string>()
  if (action.type === 'patch') nodes = nodes.map(n => {
    if (!ids.has(n.id)) return n
    const locks = effectiveLocks(state, n.id), patch = { ...action.patch }
    if (locks.all) {
      if (Object.keys(patch).every(key => key === 'expanded')) return { ...n, expanded: patch.expanded }
      return n
    }
    if (locks.pixels) for (const key of ['blendMode', 'opacity', 'fill', 'mask', 'fx', 'adjustment']) delete patch[key]
    if (locks.transparency) for (const key of ['opacity', 'fill', 'mask']) delete patch[key]
    return { ...n, ...patch, id: n.id, type: n.type, opacity: Math.max(0, Math.min(1, patch.opacity ?? n.opacity)), fill: Math.max(0, Math.min(1, patch.fill ?? n.fill)) }
  })
  if (action.type === 'lock') nodes = nodes.map(n => ids.has(n.id) ? { ...n, locks: { ...n.locks, [action.key]: action.value } } : n)
  if (action.type === 'delete') {
    const removed = new Set([...ids].flatMap(id => [id, ...descendants(state, id)]))
    if([...removed].some(id=>effectiveLocks(state,id).all))return state
    nodes = nodes.map(n => removed.has(n.id) && !effectiveLocks(state, n.id).all ? { ...n, deleted: true, visible: false } : n)
  }
  if (action.type === 'create') { if(action.layer.parentId && effectiveLocks(state,action.layer.parentId).all)return state; nodes.unshift(action.layer) }
  if (action.type === 'group') {
    const outer = nodes.filter(n => ids.has(n.id) && !ancestors(state, n.id).some(p => ids.has(p.id)))
    if (!outer.length || outer.some(n => effectiveLocks(state, n.id).all || effectiveLocks(state, n.id).artboards)) return state
    const parentId = outer.every(n => n.parentId === outer[0].parentId) ? outer[0].parentId : null
    const at = Math.min(...outer.map(n => nodes.findIndex(x => x.id === n.id)))
    nodes = nodes.map(n => outer.some(o => o.id === n.id) ? { ...n, parentId: action.id } : n)
    nodes.splice(at, 0, { id: action.id, name: 'Group', type: 'group', parentId, visible: true, blendMode: 'pass-through', opacity: 1, fill: 1, mask: null, locks: unlocked(), sourceIds: [], memberIds: outer.flatMap(n => n.memberIds), expanded: true })
  }
  if (action.type === 'ungroup') {
    const groups = nodes.filter(n => ids.has(n.id) && n.type === 'group' && !effectiveLocks(state, n.id).all)
    const nextParent = new Map(groups.map(group => [group.id, group.parentId]))
    nodes = nodes.map(n => nextParent.has(n.parentId || '') ? { ...n, parentId: nextParent.get(n.parentId!) ?? null } : n)
    nodes = nodes.map(n => nextParent.has(n.id) ? { ...n, deleted: true, visible: false } : n)
  }
  if (action.type === 'move') {
    const target = nodes.find(n => n.id === action.target)
    const outer = nodes.filter(n => ids.has(n.id) && !ancestors(state, n.id).some(p => ids.has(p.id)))
    if (!target || outer.some(n => n.id === target.id || descendants(state, n.id).includes(target.id) || effectiveLocks(state, n.id).all)) return state
    const parentId = action.placement === 'inside' && target.type === 'group' ? target.id : target.parentId
    if (outer.some(n=>effectiveLocks(state,n.id).artboards&&n.parentId!==parentId))return state
    if (parentId && effectiveLocks(state, parentId).all) return state
    const movingIds = new Set(outer.flatMap(n => [n.id, ...descendants(state, n.id)])), moving = nodes.filter(n => movingIds.has(n.id)).map(n => outer.some(o => o.id === n.id) ? { ...n, parentId } : n)
    const rest = nodes.filter(n => !movingIds.has(n.id)), at = rest.findIndex(n => n.id === target.id)
    const after = action.placement === 'after' ? descendants({ version: 1, nodes: rest }, target.id).length + 1 : action.placement === 'inside' ? 1 : 0
    nodes = [...rest.slice(0, at + after), ...moving, ...rest.slice(at + after)]
  }
  return normalizePanel({ version: 1, nodes })
}

export function moveTreeFocus(order: string[], current: string | undefined, key: string): string | null {
  if (!order.length) return null
  const index = Math.max(0, order.indexOf(current || order[0]))
  if (key === 'ArrowDown') return order[Math.min(order.length - 1, index + 1)]
  if (key === 'ArrowUp') return order[Math.max(0, index - 1)]
  if (key === 'Home') return order[0]
  if (key === 'End') return order[order.length - 1]
  return null
}
export function cascadedOpacity(state: LayerPanelState, id: string) {
  const node = state.nodes.find(n => n.id === id)
  if (!node) return 1
  return [node, ...ancestors(state, id)].reduce((opacity, item) => opacity * (item.opacity ?? 1), 1)
}
export function selectPanelLayers(current: string[], id: string, order: string[], anchor: string | null, modifiers: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }): string[] {
  if (modifiers.shiftKey && anchor && order.includes(anchor)) { const a = order.indexOf(anchor), b = order.indexOf(id); const range = order.slice(Math.min(a,b), Math.max(a,b)+1); return modifiers.ctrlKey || modifiers.metaKey ? [...new Set([...current, ...range])] : range }
  return modifiers.ctrlKey || modifiers.metaKey ? current.includes(id) ? current.filter(x => x !== id) : [...current,id] : [id]
}

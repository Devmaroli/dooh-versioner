import { allLayers } from './artwork.js'
import { normalizeBlend } from './blending.js'
import { LayerRecord, LayerPanelState, reconcilePanel, unlocked, orderedNodes, descendants } from './layerPanelModel'

export function panelForArtwork(art: any, layout: any[], proof: any): LayerPanelState {
  const sources = allLayers(art), byId = new Map<string, any>(sources.map(l => [l.id,l])), templates: LayerRecord[] = []
  const styleFor = (source: any, key: string) => ({ blendMode: normalizeBlend(proof?.layerStyles?.[source?.id]?.blend ?? proof?.layerStyles?.[key]?.blend ?? source?.blend ?? source?.sourceBlend ?? 'normal'), opacity: proof?.layerStyles?.[source?.id]?.opacity ?? proof?.layerStyles?.[key]?.opacity ?? source?.opacity ?? 1 })
  const parent = (source: any) => source?.parentGroups?.length ? `psd:${source.parentGroups[source.parentGroups.length-1].id}` : null
  const base = (id: string, name: string, source: any, type: LayerRecord['type'], memberIds: string[], sourceIds: string[]): LayerRecord => ({
    id,name,type,parentId:parent(source),visible:!source?.effectiveHidden,...styleFor(source,id),fill:source?.fillOpacity??1,
    locks:{...unlocked(),...source?.locks},mask:source?.mask || null,sourceIds,memberIds,importedEffects:source?.effects || null,
  })
  for (const source of sources.filter(l=>l.children?.length)) templates.push({ ...base(`psd:${source.id}`,source.name,source,'group',[],[source.id]), importedGroup:true, visible:!source.hidden, blendMode:source.sourceBlend==='pass through'?'pass-through':normalizeBlend(source.sourceBlend||'normal') })
  for (const unit of layout) {
    const source = byId.get(unit.layerIds[0]), type = source?.vectorWord?'vector':source?.kind==='text'?'text':source?.kind==='shape'?'vector':'pixel'
    templates.push({...base(unit.id,unit.name,source,type,[unit.id],unit.layerIds),originId:source?.wordSourceId,role:unit.role,sourceKind:source?.vectorWord?'vector-word':unit.sourceKind,sourceLink:unit.sourceLink,linkId:(proof?.groups||[]).find(g=>g.kind==='link'&&g.unitIds.includes(unit.id))?.id})
  }
  const represented = new Set(layout.flatMap(u=>u.layerIds)), background = sources.find(l=>art.an.roles.some(r=>r.id===l.id&&r.role==='bg')&&l.px)
  if (art.originalBorder) templates.push({ ...base('__border','Original border',null,'vector',[],[]),parentId:null })
  if (background) { represented.add(background.id); templates.push(base('__background',background.name,background,'pixel',[],[background.id])) }
  for (const source of sources.filter(l=>l.px&&!l.children?.length&&!l.splitIntoWords&&!represented.has(l.id))) {
    const id=source.wordSourceId?`word:${source.id}`:`layer:${source.id}`
    templates.push({...base(id,source.name,source,source.kind==='text'?'text':source.kind==='shape'?'vector':'pixel',[id],[source.id]),visible:false})
  }
  for (const group of (proof?.groups||[]).filter(g=>g.kind!=='link')) {
    templates.push({...base(group.id,`Group · ${group.unitIds.length} elements`,null,'group',group.unitIds,[]),parentId:null})
    templates.filter(n=>group.unitIds.includes(n.id)).forEach(n=>{n.parentId=group.id})
  }
  const order = proof?.layerOrder || layout.map(u=>u.id)
  templates.sort((a,b)=>{const ai=order.indexOf(a.id),bi=order.indexOf(b.id);return (ai<0?order.length:ai)-(bi<0?order.length:bi)})
  return reconcilePanel(proof?.panel,templates)
}

export function sourcePanel(art: any): LayerPanelState {
  const templates: LayerRecord[] = []
  const expanded = art.groupExpanded || {}
  const linked = new Set((art.layerLinks || []).flatMap((link: { layerIds: string[] }) => link.layerIds))
  function walk(layers: any[], parentId: string | null) {
    for (const layer of layers || []) {
      const group = !!layer.children?.length
      const id = group ? `psd:${layer.id}` : layer.id
      templates.push({
        id, name: layer.name || 'Layer', type: group ? 'group' : layer.kind === 'text' ? 'text' : layer.kind === 'shape' ? 'vector' : 'pixel',
        parentId, visible: art.layerVisibility?.[layer.id] !== false && !layer.hidden,
        blendMode: layer.sourceBlend === 'pass through' ? 'pass-through' : (layer.blend || layer.sourceBlend || 'normal'),
        opacity: layer.opacity ?? 1, fill: layer.fillOpacity ?? 1, locks: unlocked(), mask: null,
        sourceIds: [layer.id], memberIds: group ? [] : [layer.id], importedGroup: group || undefined,
        expanded: group ? expanded[id] !== false : undefined,
        role: art.an?.roles?.find((role: { id: string; role: string }) => role.id === layer.id)?.role,
        sourceLink: linked.has(layer.id),
      })
      if (group) walk(layer.children, id)
    }
  }
  walk(art.a?.layers || [], null)
  for (const piece of art.wordPieces || []) {
    templates.push({
      id: piece.id, name: piece.name, type: piece.vector ? 'vector' : 'pixel', parentId: null, visible: art.layerVisibility?.[piece.id] !== false,
      blendMode: 'normal', opacity: 1, fill: 1, locks: unlocked(), mask: null, sourceIds: [piece.id], memberIds: [piece.id],
      sourceKind: piece.vector ? 'vector-word' : 'raster-piece', role: art.an?.roles?.find((role: { id: string }) => role.id === piece.id)?.role,
    })
  }
  for (const group of art.preparationGroups || []) {
    if (templates.some(node => node.id === group.id)) continue
    templates.push({
      id: group.id, name: group.name, type: 'group', parentId: null, visible: true, blendMode: 'pass-through', opacity: 1, fill: 1,
      locks: unlocked(), mask: null, sourceIds: [], memberIds: group.layerIds, expanded: expanded[group.id] !== false,
    })
    for (const id of group.layerIds) {
      const node = templates.find(item => item.id === id)
      if (node) node.parentId = group.id
    }
  }
  return reconcilePanel(art.layerPanel, templates)
}

export function panelGroupProofs(panel: LayerPanelState) {
  return panel.nodes.filter(n=>!n.deleted&&n.type==='group').map(n=>({id:n.id,kind:'group',unitIds:panel.nodes.filter(child=>!child.deleted&&descendants(panel,n.id).includes(child.id)).flatMap(child=>child.type==='group'?[]:child.memberIds)})).filter(g=>g.unitIds.length)
}
export function panelOrder(panel: LayerPanelState) { return orderedNodes(panel).filter(({layer})=>layer.type!=='group').map(({layer})=>layer.id) }

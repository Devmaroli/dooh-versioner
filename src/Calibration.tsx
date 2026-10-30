import { verifyEmbeddedVector } from './embeddedVectors.js'
import { useEffect, useRef, useState } from 'react'
import { SCREENS } from './data/presets.js'
import { renderCalibration, pickArtwork, backgroundBounds } from './engine/render.js'
import { screenProofKey, createScreenProof, FAMILIES, GUIDE_PRESETS, contentUnits, guideLayout, guideFindings, initialProof, layoutFamily, sourceSignature } from './layoutGuides.js'
import { arrangeFrames } from './words.js'
import { allLayers, drawSourceLayers, unionBounds } from './artwork.js'
import { editorSnapshot, editorHistory, commitEditorAction, finishEditorAction, travelEditorHistory, restoreEditorSnapshot } from './editorHistory.js'
import { LayersPanel } from './LayersPanel'
import { panelForArtwork, panelGroupProofs, panelOrder } from './layerPanelAdapter'
import { reducePanel, effectiveLocks, descendants, LayerPanelAction, LayerRecord } from './layerPanelModel'
import { normalizeBlend, clamp01 } from './blending.js'
import { borderGeometry } from './border.js'
import { prepareSourceText } from './sourceText.js'
import { scaleFrame, pointerScale } from './transform.js'
import './calibration.css'

const ANCHORS = ['Top left', 'Top centre', 'Top right', 'Middle left', 'Centre', 'Middle right', 'Bottom left', 'Bottom centre', 'Bottom right'].map((name, i) => ({ name, x: (i % 3) / 2, y: Math.floor(i / 3) / 2 }))

const PRESETS = GUIDE_PRESETS.map(name => SCREENS.find(s => s.name === name)).filter(Boolean)

function ProofCanvas({ art, screen, proof, large = false }: any) {
  const host = useRef<HTMLDivElement>(null)
  const [vectorError,setVectorError]=useState('')
  useEffect(() => {
    const result = renderCalibration(art, screen, large ? 1600 : 460, large ? 2200 : 280, proof)
    let active=true;host.current?.replaceChildren(result.c);result.ready?.then(()=>{if(active)setVectorError('')}).catch(error=>{if(active)setVectorError(`Vector preview unavailable: ${error.message}`)});return()=>{active=false}
  })
  return <><div className="proof-canvas" ref={host} />{vectorError&&<p role="alert">{vectorError}</p>}</>
}

function LayerThumbnail({ layers, large = false }: any) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = canvas.current, box = unionBounds(layers)
    if (!c || !box) return
    const g = c.getContext('2d')!; g.clearRect(0, 0, c.width, c.height)
    const scale = Math.min(c.width / box.w, c.height / box.h)
    g.save(); g.translate((c.width - box.w * scale) / 2, (c.height - box.h * scale) / 2); g.scale(scale, scale); g.translate(-box.x, -box.y); drawSourceLayers(g, layers); g.restore()
  }, [layers])
  return <canvas ref={canvas} width={large ? 600 : 100} height={large ? 600 : 100} aria-hidden="true" />
}

export function Calibration({ art, onChange, onBatch, targetScreen, onClose }: any) {
  const [headlineSourceId, setHeadlineSourceId] = useState('')
  const [preparing,setPreparing]=useState(false)
  const currentArt=useRef<any>(art);currentArt.current=art
  useEffect(()=>()=>{currentArt.current=null},[])
  const pendingHistory = useRef<any>(null)
  const historyGesture = useRef<any>(null)
  const [active, setActive] = useState<string | null>(null)
  const [selected, setSelected] = useState<string[]>([])
  const [alignReference, setAlignReference] = useState('selection')
  const [zoom, setZoom] = useState(1)
  const [sourceMessage, setSourceMessage] = useState('')
  const [special, setSpecial] = useState<string | null>(null)
  const [tool, setTool] = useState('move')
  const [anchorIndex, setAnchorIndex] = useState(0)
  const anchor = ANCHORS[anchorIndex]
  const dialog = useRef<HTMLDivElement>(null)
  const canvasHost = useRef<HTMLDivElement>(null)
  const drag = useRef<any>(null)
  const outputMode=!!targetScreen, storeName=outputMode?'outputs':'proofs', proofKey=(s:any)=>outputMode?screenProofKey(s):layoutFamily(s)
  const screen = (outputMode?SCREENS:PRESETS).find(s => s.name === active)
  const signature = sourceSignature(art)
  const getProof = (s: any) => art.calibration?.[storeName]?.[proofKey(s)] || (outputMode?createScreenProof(art,s):initialProof(art,s))
  const closeEditor=()=>{setActive(null);onClose?.()}
  useEffect(()=>{if(targetScreen)open(targetScreen)},[targetScreen?.name])
  const approvedCount = FAMILIES.filter(f => art.calibration?.proofs?.[f]?.approved && art.calibration.proofs[f].sourceSignature === signature).length
  const proof = screen ? getProof(screen) : null
  const layout = screen ? guideLayout(art, screen, proof) : []
  const panel = screen ? panelForArtwork(art, layout, proof) : { version: 1 as const, nodes: [] }
  const issues = screen ? guideFindings(art, screen, layout, proof) : []
  const history = editorHistory(art)
  function beginAction(label: string) {
    if (pendingHistory.current || historyGesture.current?.recorded) return
    editorHistory(art); pendingHistory.current = { before: editorSnapshot(art), label, selected: [...selected], special }
  }
  function changed() {
    const pending = pendingHistory.current
    if (pending) { const committed = commitEditorAction(art, pending.before, pending.label, active, { selected: pending.selected, special: pending.special, scope: outputMode?'output':'guide' }); pendingHistory.current = null; if (historyGesture.current && committed) historyGesture.current.recorded = true }
    else finishEditorAction(art)
    onChange()
  }
  function canTravel(direction:string){const entries=direction==='undo'?history.past:history.future,entry=entries[entries.length-1];return !!entry&&(entry.scope||'guide')===(outputMode?'output':'guide')&&(!outputMode||entry.screen===active)}
  function travel(direction: string) {
    if(!canTravel(direction))return
    pendingHistory.current = null; historyGesture.current = null; drag.current = null
    const entry = travelEditorHistory(art, direction, { selected, special })
    if (!entry) return
    if (entry.screen) setActive(entry.screen)
    setSelected(entry.selected || []); setSpecial(entry.special || null); setSourceMessage(`${direction === 'undo' ? 'Undid' : 'Redid'}: ${entry.label}`); changed()
  }
  function union(items: any[]) {
    if (!items.length) return { x: 0, y: 0, w: 1, h: 1 }
    const x = Math.min(...items.map(i => i.frame.x)), y = Math.min(...items.map(i => i.frame.y))
    return { x, y, w: Math.max(...items.map(i => i.frame.x + i.frame.w)) - x, h: Math.max(...items.map(i => i.frame.y + i.frame.h)) - y }
  }
  const sourceLayers = allLayers(art)
  const backgrounds = sourceLayers.filter(l => art.an.roles.some(r => r.id === l.id && r.role === 'bg') && l.px)
  const grouped = new Set<string>()
  const editorItems: any[] = []
  for (const group of proof?.groups || []) {
    const members = layout.filter(u => group.unitIds.includes(u.id))
    if (!members.length) continue
    if (group.kind === 'link') {
      members.forEach(unit => { grouped.add(unit.id); editorItems.push({ ...unit, linkId: group.id, memberIds: [unit.id] }) }); continue
    }
    members.forEach(u => grouped.add(u.id))
    const frame = union(members)
    editorItems.push({ id: group.id, name: `${group.kind === 'link' ? 'Linked' : 'Group'} · ${members.length} elements`, kind: group.kind || 'group', memberIds: members.map(u => u.id), layerIds: members.flatMap(u => u.layerIds), frame, box: { w: frame.w * screen.w, h: frame.h * screen.h }, constraint: {} })
  }
  for (const unit of layout) if (!editorItems.some(item => item.id === unit.id)) editorItems.push({ ...unit, memberIds: [unit.id] })
  for (const folder of panel.nodes.filter(n => n.type === 'group' && !n.deleted && !editorItems.some(i => i.id === n.id))) {
    const memberIds = panel.nodes.filter(n => descendants(panel,folder.id).includes(n.id)).flatMap(n => n.type === 'group' ? [] : n.memberIds), members = layout.filter(u => memberIds.includes(u.id))
    if (members.length) { const frame = union(members); editorItems.push({ id:folder.id,name:folder.name,memberIds,layerIds:members.flatMap(u=>u.layerIds),frame,box:{w:frame.w*screen.w,h:frame.h*screen.h},constraint:{} }) }
  }
  const pickedItems = editorItems.filter(u => selected.includes(u.id))
  const currentItems = special ? [] : pickedItems
  const unlinkMode = !!currentItems.length && (currentItems.every(i => i.linkId && i.linkId === currentItems[0].linkId) || currentItems.length === 1 && currentItems[0].sourceLink)
  const linkBlocked = currentItems.length < 2
  const chosen = currentItems.length > 1 ? { id: 'selection', name: 'Selected elements', frame: union(currentItems), box: { w: union(currentItems).w * screen.w, h: union(currentItems).h * screen.h }, layerIds: currentItems.flatMap(i => i.layerIds), constraint: {} } : currentItems[0]


  const sourceLayer = currentItems.length === 1 && currentItems[0].layerIds.length === 1 ? sourceLayers.find(l => l.id === currentItems[0].layerIds[0]) : null
  const preparationCandidates = sourceLayers.filter(l => l.px && !l.children?.length && !l.wordSourceId && !l.logoProtected)
  const preparationSource = preparationCandidates.find(l => l.id === headlineSourceId) || preparationCandidates.find(l => art.an.roles.some(r => r.id === l.id && r.role === 'headline'))
  const preparedWords = preparationSource ? (art.wordPieces || []).filter(p => p.parentId === preparationSource.id) : []
  const border = screen ? borderGeometry(art, screen, layout, proof) : null
  const borderFrame = border ? { x: border.x / screen.w, y: border.y / screen.h, w: border.w / screen.w, h: border.h / screen.h } : null
  function panelSelect(ids: string[]) {
    if (ids.length === 1 && (ids[0] === '__background' || ids[0] === '__border')) { setSpecial(ids[0] === '__background' ? 'background' : 'border'); setSelected([]) }
    else { setSpecial(null); setSelected(ids) }
  }
  const panelSelected = special ? [special === 'background' ? '__background' : '__border'] : selected
  function panelAction(action: LayerPanelAction, label: string) {
    beginAction(label)
    let nextPanel = reducePanel(panel, action)
    if (action.type === 'patch' && action.patch.mask && !action.patch.mask.linked) {
      nextPanel = { ...nextPanel, nodes: nextPanel.nodes.map(node => {
        if (!action.ids.includes(node.id) || !node.mask || node.mask.canvasRect) return node
        const unit = layout.find(u => u.id === node.id), f = unit?.frame || (node.id === '__border' ? borderFrame : {x:0,y:0,w:1,h:1}), r = node.mask.rect || {x:0,y:0,w:1,h:1}
        return { ...node, mask:{...node.mask, canvasRect:{x:f.x+r.x*f.w,y:f.y+r.y*f.h,w:r.w*f.w,h:r.h*f.h}} }
      }) }
    }
    const styles = { ...getProof(screen).layerStyles }
    if (action.type === 'patch' && ('opacity' in action.patch || 'blendMode' in action.patch)) for (const node of nextPanel.nodes.filter(n => action.ids.includes(n.id) && n.type !== 'group' && n.type !== 'adjustment')) {
      const keys = node.id.startsWith('__') || node.id === 'flattened' ? [node.id] : node.sourceIds
      for (const key of keys) styles[key] = { ...styles[key], ...('opacity' in action.patch ? {opacity:node.opacity}:{}), ...('blendMode' in action.patch ? {blend:node.blendMode}:{}) }
    }
    const groups = [...(getProof(screen).groups || []).filter(g => g.kind === 'link'), ...panelGroupProofs(nextPanel).filter(g => !nextPanel.nodes.find(n=>n.id===g.id)?.importedGroup)]
    const next = { ...getProof(screen), approved:false, panel:nextPanel, layerStyles:styles, layerOrder:panelOrder(nextPanel), groups }
    art.calibration = { ...art.calibration, enabled:outputMode?art.calibration.enabled:false, [storeName]:{...art.calibration[storeName],[proofKey(screen)]:next} }; changed()
  }
  function movementLocked(ids: string[]) {
    return ids.some(id => { const item=editorItems.find(i=>i.id===id), members=item?.memberIds || [id]; return [id,...members].some(key=>{const locks=effectiveLocks(panel,key);return locks.all||locks.position}) })
  }
  function resetPanelAppearance() {
    beginAction('Reset imported appearance')
    const styles={...getProof(screen).layerStyles},nodes=panel.nodes.map(node=>{
      if(!panelSelected.includes(node.id))return node
      const source=sourceLayers.find(l=>node.sourceIds.includes(l.id)),blendMode=node.importedGroup&&source?.sourceBlend==='pass through'?'pass-through':normalizeBlend(source?.blend??source?.sourceBlend??'normal'),opacity=source?.opacity??1
      for(const key of node.id.startsWith('__')||node.id==='flattened'?[node.id]:node.sourceIds)styles[key]={blend:blendMode,opacity}
      return {...node,blendMode,opacity,fill:source?.fillOpacity??1}
    })
    const next={...getProof(screen),approved:false,layerStyles:styles,panel:{...panel,nodes}}
    art.calibration={...art.calibration,enabled:outputMode?art.calibration.enabled:false,[storeName]:{...art.calibration[storeName],[proofKey(screen)]:next}};changed()
  }

  const scaleTarget = special === 'background' ? { frame: { x: 0, y: 0, w: 1, h: 1 } } : special === 'border' && borderFrame ? { frame: borderFrame } : chosen
  const scaleAnchor = special === 'background' ? ANCHORS[4] : anchor

  useEffect(() => {
    if (!active) return
    const previous = document.activeElement as HTMLElement
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus()
    return () => previous?.focus()
  }, [active])

  function pickIds(id: string) {
    const item = editorItems.find(i => i.id === id)
    return item?.linkId ? editorItems.filter(i => i.linkId === item.linkId).map(i => i.id) : [id]
  }
  async function setupSource(action: string, target = sourceLayer) {
    if (!target||preparing) return
    const node=panel.nodes.find(n=>n.sourceIds.includes(target.id)); if(node){const locks=effectiveLocks(panel,node.id);if(locks.all||locks.pixels||locks.transparency){setSourceMessage('Unlock the source or its parent before preparing pixels.');return}}

    setPreparing(true)
    try {
      if(target.vectorPdf&&action!=='border'){setSourceMessage('Checking embedded Illustrator vector source…');await verifyEmbeddedVector(target)}
      if(currentArt.current!==art)return
      beginAction(action === 'prepare' ? 'Prepare headline: border and words' : action === 'border' ? 'Rebuild vector border' : 'Split headline words')
      if(action==='upgrade'){art.wordPieces=art.wordPieces.map(p=>p.parentId===target.id?{...p,vector:true,name:p.name.replace('· source pixels','· embedded vector')}:p);art.calibration={...art.calibration,enabled:false};for(const bucket of ['proofs','outputs'])art.calibration[bucket]=Object.fromEntries(Object.entries(art.calibration[bucket]||{}).map(([family,p]:any)=>[family,{...p,panel:p.panel?{...p.panel,nodes:p.panel.nodes.map(n=>art.wordPieces.some(w=>w.parentId===target.id&&n.sourceIds.includes(w.id))?{...n,type:'vector',sourceKind:'vector-word',name:n.name.replace('· source pixels','· embedded vector')}:n)}:p.panel}]));setSourceMessage('Embedded Illustrator vector source enabled for these words. Preview and PNG export render it at the requested resolution.');changed();return}
      const before = Object.fromEntries(['proofs','outputs'].flatMap(bucket=>Object.entries(art.calibration?.[bucket]||{}).map(([key,p]:any)=>[JSON.stringify([bucket,key]),{bucket,key,proof:p,layout:p.screen?guideLayout(art,p.screen,p):[]}])))
      let result
      if (action === 'prepare') {
        const role = art.an.roles.find(r => r.id === target.id)
        if (role) Object.assign(role, { role: 'headline', confidence: 1, why: 'Designer-confirmed headline preparation' })
        else art.an.roles.push({ id: target.id, role: 'headline', confidence: 1 })
        if (!art.originalBorder) prepareSourceText(art, target.id, 'border')
        result = prepareSourceText(art, target.id, 'words')
      } else result = prepareSourceText(art, target.id, action)
      if (result.pieces.length) for (const [family, state] of Object.entries(before) as any) {
        const parent = state.layout.find(u => u.layerIds.includes(target.id))
        if (!parent) continue
        const frames = { ...state.proof.frames }, newUnits = contentUnits(art, state.proof.detachedSourceLinks).filter(u => u.layerIds.some(id => result.pieces.some(p => p.id === id)) || u.layerIds.length && u.layerIds.every(id => parent.layerIds.includes(id) && id !== target.id)), ids = newUnits.map(u => u.id)
        for (const unit of newUnits) frames[unit.id] = { x: parent.frame.x + (unit.box.x - parent.box.x) / parent.box.w * parent.frame.w, y: parent.frame.y + (unit.box.y - parent.box.y) / parent.box.h * parent.frame.h, w: unit.box.w / parent.box.w * parent.frame.w, h: unit.box.h / parent.box.h * parent.frame.h }
        const replace = (entries = []) => entries.flatMap(id => id === parent.id ? ids : [id])
        art.calibration[state.bucket][state.key] = { ...state.proof, approved: false, frames, layerOrder: replace(state.proof.layerOrder), freeUnitIds: replace(state.proof.freeUnitIds), groups: (state.proof.groups || []).filter(g => !g.unitIds.includes(parent.id)) }
      }
      for(const bucket of ['proofs','outputs'])for(const [family,p] of Object.entries(art.calibration?.[bucket] || {}) as any)if(p.panel&&p.screen) { const updated=panelForArtwork(art,guideLayout(art,p.screen,p),p);art.calibration[bucket][family]={...p,panel:updated,layerOrder:panelOrder(updated)} }
      art.calibration = { ...art.calibration, enabled: false }; setSourceMessage(result.message)
      if (result.pieces.length) setSelected(result.pieces.map(p => `word:${p.id}`))
      changed()
    } catch (error) { if (pendingHistory.current) restoreEditorSnapshot(art, pendingHistory.current.before); setSourceMessage(`Not prepared: ${error instanceof Error ? error.message : String(error)} No source changes applied.`); changed() } finally {setPreparing(false)}
  }
  function setBorderFrame(frame: any) {
    if (movementLocked(['__border'])) return
    beginAction('Transform vector border')
    const next = { ...getProof(screen), approved: false, sourceSignature: signature, borderFrame: frame }
    art.calibration = { ...art.calibration, enabled: outputMode?art.calibration.enabled:false, [storeName]: { ...art.calibration[storeName], [proofKey(screen)]: next } }; changed()
  }
  function setBackground(patch: any) {
    if (movementLocked(['__background'])) return
    beginAction('Background transform')
    const next = { ...getProof(screen), approved: false, sourceSignature: signature, backgroundTransform: { scale: 100, x: 50, y: 50, ...getProof(screen).backgroundTransform, ...patch } }
    art.calibration = { ...art.calibration, enabled: outputMode?art.calibration.enabled:false, [storeName]: { ...art.calibration[storeName], [proofKey(screen)]: next } }; changed()
  }
  function open(s: any) {
    const saved = getProof(s), units: any[] = contentUnits(art, saved.detachedSourceLinks)
    let next = { ...saved, groups: (saved.groups || []).map(g => ({ ...g, unitIds: [...new Set(g.unitIds.flatMap(id => units.filter(u => u.id === id || u.legacyId === id).map(u => u.id)))] })) }
    next = { ...next, panel: panelForArtwork(art, guideLayout(art, s, next), next) }
    art.calibration = { ...art.calibration, [storeName]: { ...art.calibration?.[storeName], [proofKey(s)]: next } }
    setActive(s.name); setSpecial(null); setSelected(next.groups.find(g => g.unitIds.includes(units[0]?.id))?.kind === 'link' ? next.groups.find(g => g.unitIds.includes(units[0]?.id)).unitIds : [next.groups.find(g => g.unitIds.includes(units[0]?.id))?.id || units[0]?.id].filter(Boolean)); setZoom(1); changed()
  }
  function saveFrames(frames: any, groups = getProof(screen).groups, freeUnitIds = getProof(screen).freeUnitIds) {
    beginAction('Edit layout')
    const next = { ...getProof(screen), approved: false, sourceSignature: signature, frames, groups, freeUnitIds }
    art.calibration = { ...art.calibration, enabled: outputMode?art.calibration.enabled:false, [storeName]: { ...art.calibration?.[storeName], [proofKey(screen)]: next } }; changed()
  }
  function transformItems(ids: string[], patch: any, sourceLayout = layout, sourceItems = editorItems) {
    if (!screen) return
    if (movementLocked(ids)) { setSourceMessage('Position is locked. Unlock the selected layer or its parent to move or scale it.'); return }
    const items = sourceItems.filter(i => ids.includes(i.id)), before = union(items), after = { ...before, ...patch }
    const members = new Set(items.flatMap(i => i.memberIds)), frames = { ...getProof(screen).frames }
    for (const unit of sourceLayout.filter(u => members.has(u.id))) {
      const f = unit.frame
      frames[unit.id] = { x: after.x + (f.x - before.x) / before.w * after.w, y: after.y + (f.y - before.y) / before.h * after.h, w: f.w / before.w * after.w, h: f.h / before.h * after.h }
    }
    saveFrames(frames, getProof(screen).groups, [...new Set([...(getProof(screen).freeUnitIds || []), ...members])])
  }
  function changeFrame(_id: string, patch: any) { transformItems(currentItems.map(i => i.id), patch) }
  function groupSelected(kind = 'group') {
    if(kind==='group'){if(currentItems.length<2)return;const id=crypto.randomUUID();panelAction({type:'group',ids:selected,id},'Group layers');setSelected([id]);return}
    if(currentItems.some(i=>{const locks=effectiveLocks(panel,i.id);return locks.all||locks.artboards}))return
    beginAction(kind === 'link' ? 'Link layers' : 'Group layers')
    if (currentItems.length < 2) return
    const ids = currentItems.flatMap(i => i.memberIds), id = crypto.randomUUID()
    const groups = [...(proof.groups || []).filter(g => !g.unitIds.some(x => ids.includes(x))), { id, kind, unitIds: ids }]
    saveFrames(Object.fromEntries(layout.map(u => [u.id, u.frame])), groups); setSelected(kind === 'link' ? ids : [id])
  }
  function ungroupSelected() {
    beginAction('Unlink or ungroup layers')
    if (currentItems.length === 1 && currentItems[0].sourceLink) {
      beginAction('Unlink source layers')
      const item = currentItems[0], next = { ...proof, approved: false, detachedSourceLinks: [...new Set([...(proof.detachedSourceLinks || []), item.id])], frames: Object.fromEntries(layout.map(u => [u.id, u.frame])) }
      art.calibration = { ...art.calibration, enabled: outputMode?art.calibration.enabled:false, [storeName]: { ...art.calibration[storeName], [proofKey(screen)]: next } }; setSelected(item.layerIds.map(id => `layer:${id}`)); changed(); return
    }
    const groups = (proof.groups || []).filter(g => !selected.includes(g.id) && !(g.kind === 'link' && g.unitIds.some(id => selected.includes(id)))), ids = currentItems.flatMap(i => i.memberIds)
    const removed=panel.nodes.filter(n=>n.type==='group'&&selected.includes(n.id)), removedIds=new Set(removed.map(n=>n.id))
    if(removed.length){const nextPanel={...panel,nodes:panel.nodes.filter(n=>!removedIds.has(n.id)).map(n=>removedIds.has(n.parentId)?{...n,parentId:removed.find(p=>p.id===n.parentId)?.parentId||null}:n)};art.calibration[storeName][proofKey(screen)]={...proof,panel:nextPanel,layerOrder:panelOrder(nextPanel)}}
    saveFrames(Object.fromEntries(layout.map(u => [u.id, u.frame])), groups); setSelected(ids)
  }
  function arrange(action: string) {
    if (movementLocked(currentItems.map(i=>i.id))) return
    beginAction(`Arrange: ${action}`)
    const frames = Object.fromEntries(editorItems.map(i => [i.id, i.frame])), ids = currentItems.map(i => i.id)
    const arranged = arrangeFrames(frames, ids, action, alignReference, screen), next = { ...proof.frames }
    for (const item of currentItems) {
      const before = item.frame, after = arranged[item.id]
      for (const unit of layout.filter(u => item.memberIds.includes(u.id))) next[unit.id] = { ...unit.frame, x: unit.frame.x + after.x - before.x, y: unit.frame.y + after.y - before.y }
    }
    saveFrames(next)
  }
  function resize(width: number) {
    if (movementLocked(currentItems.map(i=>i.id))) return
    beginAction('Scale selection')
    if (!chosen || !screen) return
    const w = Math.max(.01, Math.min(10, width))
    changeFrame(chosen.id, scaleFrame(chosen.frame, w / chosen.frame.w, anchor))
  }
  function approve() {
    beginAction('Approve guide')
    if (!screen || issues.some(i => i.blocked)) return
    art.calibration = { ...art.calibration, enabled: outputMode?art.calibration.enabled:false, [storeName]: { ...art.calibration[storeName], [proofKey(screen)]: { ...getProof(screen), approved: true, sourceSignature: signature } } }; changed()
  }
  function reset() {
    beginAction('Reset layout')
    if (!screen) return
    art.calibration = { ...art.calibration, enabled: outputMode?art.calibration.enabled:false, [storeName]: { ...art.calibration[storeName], [proofKey(screen)]: outputMode?createScreenProof(art,screen):initialProof(art, screen) } }; changed()
  }
  function applyGuides() {
    beginAction('Enable batch guides')
    if (approvedCount !== FAMILIES.length) return
    art.calibration = { ...art.calibration, enabled: true }; changed(); onBatch()
  }
  function trapKeys(event: React.KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement)) { event.preventDefault(); travel(event.shiftKey ? 'redo' : 'undo'); return }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y' && !(event.target instanceof HTMLInputElement)) { event.preventDefault(); travel('redo'); return }
    if (event.key === 'Escape') { closeEditor(); return }
    if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (screen && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault(); const step = event.shiftKey ? 10 : 1, dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0, dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0
        if (special === 'background') setBackground({ offsetX: (proof.backgroundTransform?.offsetX || 0) + dx / screen.w * 100, offsetY: (proof.backgroundTransform?.offsetY || 0) + dy / screen.h * 100 })
        else if (special === 'border' && borderFrame) setBorderFrame({ ...borderFrame, x: borderFrame.x + dx / screen.w, y: borderFrame.y + dy / screen.h })
        else if (chosen) changeFrame(chosen.id, { x: chosen.frame.x + dx / screen.w, y: chosen.frame.y + dy / screen.h })
      }
      if (event.key.toLowerCase() === 'v') { event.preventDefault(); setTool('move') }
      if (event.key.toLowerCase() === 's') { event.preventDefault(); setTool('scale') }
    }
    if (event.key !== 'Tab') return
    const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]') || [])
    const first = controls[0], last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }
  return <section className={outputMode?'output-refinement':'calibration'} aria-label={outputMode?'Adaptation refinement':'Five calibration previews'}>
    {!outputMode&&<><div className="calibration-heading"><div><h2>Calibrate five layouts first</h2><p>Double-click a preview to edit it full screen. Linked layers move together. Approve each guide before batch adaptation.</p></div><span>{approvedCount} / {FAMILIES.length} guides approved</span></div>
    <div className="calibration-gallery">{PRESETS.map(s => {
      const p = getProof(s), approved = p.approved && p.sourceSignature === signature
      return <article className="calibration-card" key={s.name}>
        <div className="calibration-thumbnail" onDoubleClick={() => open(s)} title="Double-click to edit this layout"><div style={{ aspectRatio: `${s.w}/${s.h}`, height: '100%', maxWidth: '100%' }}><ProofCanvas art={art} screen={s} proof={p} /></div></div>
        <h3>{s.name}</h3><p>{s.w} × {s.h} · {layoutFamily(s)}</p><span className="proof-status">{approved ? 'Guide approved' : 'Needs your adjustment'}</span>
        <button type="button" className="ghost" onClick={() => open(s)}>Edit {s.name}</button>
      </article>
    })}</div>
    <div className="calibration-batch"><p>Guides belong to this master. Source, visibility, links, tags or edge changes require guide review again.</p><button type="button" disabled={approvedCount !== FAMILIES.length} onClick={applyGuides}>Use these guides for full adaptation</button></div></>}
    {active && screen && <div className="calibration-focus" ref={dialog} role="dialog" aria-modal="true" aria-label={`Edit ${screen.name}`} onKeyDown={trapKeys} onFocusCapture={e => { if (e.target instanceof HTMLInputElement) historyGesture.current = { recorded: false } }} onBlurCapture={e => { if (e.target instanceof HTMLInputElement) historyGesture.current = null }}>
      <header><button type="button" className="ghost" onClick={closeEditor}>{outputMode?'← Back to adaptations':'← Back to five previews'}</button><strong>{screen.name} · {screen.w} × {screen.h}{outputMode?` · ${art.lang}`:''}</strong><button type="button" className="ghost" disabled={!canTravel('undo')} onClick={() => travel('undo')}>Undo</button><button type="button" className="ghost" disabled={!canTravel('redo')} onClick={() => travel('redo')}>Redo</button><span className="spacer" /><label>Zoom<select aria-label="Calibration zoom" value={zoom} onChange={e => setZoom(Number(e.target.value))}><option value={1}>Fit</option><option value={2}>200%</option><option value={3}>300%</option></select></label><button type="button" disabled={issues.some(i => i.blocked)} onClick={approve}>{proof.approved && proof.sourceSignature === signature ? (outputMode?'Adaptation approved':'Guide approved') : (outputMode?'Approve this adaptation':'Approve this guide')}</button></header>
      <div className="calibration-edit-layout" style={{'--inspector-width': `${art.previewSettings?.layerThumbnailSize === 300 ? 440 : art.previewSettings?.layerThumbnailSize === 200 ? 380 : 340}px`} as React.CSSProperties}><div className="calibration-stage-area"><div className="editor-toolbox" role="toolbar" aria-label="Editing tools"><button type="button" aria-pressed={tool === 'move'} onClick={() => setTool('move')}>Move <kbd>V</kbd></button><button type="button" aria-pressed={tool === 'scale'} onClick={() => setTool('scale')}>Scale <kbd>S</kbd></button><span>{tool === 'scale' ? 'Drag a handle to scale around the chosen anchor' : 'Inside box: move · Edge handles: scale'}</span></div><div className="calibration-stage"><div className="calibration-canvas-frame" ref={canvasHost} onPointerDown={event => {
          if (event.button !== 0 || (event.target as HTMLElement).closest('.scale-handle')) return
          historyGesture.current = { recorded: false }
          event.preventDefault()
          const bounds = event.currentTarget.getBoundingClientRect(); let hit = pickArtwork(art, screen, proof, (event.clientX - bounds.left) / bounds.width, (event.clientY - bounds.top) / bounds.height, (event.currentTarget.querySelector('canvas')?.width||screen.w)/screen.w, (event.currentTarget.querySelector('canvas')?.height||screen.h)/screen.h)
          const u = (event.clientX - bounds.left) / bounds.width, v = (event.clientY - bounds.top) / bounds.height
          if (chosen && (!hit || hit.type === 'background') && u >= chosen.frame.x && u <= chosen.frame.x + chosen.frame.w && v >= chosen.frame.y && v <= chosen.frame.y + chosen.frame.h) hit = { type: 'foreground', id: currentItems[0].memberIds[0] }
          if (special === 'border' && borderFrame && (!hit || hit.type === 'background') && u >= borderFrame.x && u <= borderFrame.x + borderFrame.w && v >= borderFrame.y && v <= borderFrame.y + borderFrame.h) hit = { type: 'border' }
          if (!hit) { if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey){setSelected([]); setSpecial(null)} return }
          event.currentTarget.setPointerCapture(event.pointerId)
          if (hit.type !== 'foreground') {
            setSpecial(hit.type); setSelected([])
            if (hit.type === 'border' && tool === 'move' && borderFrame && !movementLocked(['__border'])) drag.current = { border: true, pointer: event.pointerId, x: event.clientX, y: event.clientY, frame: { ...borderFrame } }
            if (hit.type === 'background' && tool === 'move' && !movementLocked(['__background'])) drag.current = { background: true, pointer: event.pointerId, x: event.clientX, y: event.clientY, settings: { scale: 100, x: 50, y: 50, ...proof.backgroundTransform }, bounds: backgroundBounds(art, screen, proof) }
            return
          }
          const unit = (event.ctrlKey||event.metaKey||event.shiftKey ? editorItems.find(i=>i.id===hit.id) : null) || currentItems.find(i => i.memberIds.includes(hit.id)) || editorItems.find(i => i.memberIds.includes(hit.id)); if (!unit) return
          const ids = event.ctrlKey || event.metaKey || event.shiftKey ? selected.includes(unit.id) ? selected.filter(id => !pickIds(unit.id).includes(id)) : [...new Set([...selected, ...pickIds(unit.id)])] : currentItems.some(i => i.id === unit.id) ? currentItems.map(i => i.id) : pickIds(unit.id)
          setSpecial(null); setSelected(ids)
          if (tool === 'move' && !event.ctrlKey && !event.metaKey && !event.shiftKey && ids.length && !movementLocked(ids)) drag.current = { x: event.clientX, y: event.clientY, frame: union(editorItems.filter(i => ids.includes(i.id))), ids, pointer: event.pointerId }
        }} onPointerMove={event => {
          const d = drag.current; if (!d || d.handle || d.pointer !== event.pointerId) return
          const bounds = event.currentTarget.getBoundingClientRect()
          if (d.border) { setBorderFrame({ ...d.frame, x: d.frame.x + (event.clientX - d.x) / bounds.width, y: d.frame.y + (event.clientY - d.y) / bounds.height }); return }
          if (d.background) {
            const dx = (event.clientX - d.x) / bounds.width * screen.w, dy = (event.clientY - d.y) / bounds.height * screen.h
            setBackground({ offsetX: (d.settings.offsetX || 0) + dx / screen.w * 100, offsetY: (d.settings.offsetY || 0) + dy / screen.h * 100 }); return
          }
          transformItems(d.ids, { x: d.frame.x + (event.clientX - d.x) / bounds.width, y: d.frame.y + (event.clientY - d.y) / bounds.height })
        }} onPointerUp={event => { if ((event.target as HTMLElement).closest('.scale-handle')) return; drag.current = null; historyGesture.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }} onPointerCancel={() => { drag.current = null; historyGesture.current = null }} style={{ aspectRatio: `${screen.w}/${screen.h}`, width: `min(100%, ${70 * screen.w / screen.h * zoom}vh)` }}>
        <ProofCanvas art={art} screen={screen} proof={proof} large />
        {editorItems.map(unit => <button key={unit.id} type="button" className={`guide-object ${currentItems.some(i => i.id === unit.id) ? 'selected' : ''}`} aria-label={`Move ${unit.name}`} style={{ left: `${unit.frame.x * 100}%`, top: `${unit.frame.y * 100}%`, width: `${unit.frame.w * 100}%`, height: `${unit.frame.h * 100}%` }} onClick={event => { if (event.detail === 0) { setSpecial(null); setSelected(pickIds(unit.id)) } }}
><span>{unit.name}</span></button>)}
        {scaleTarget && <div className="scale-selection" style={{ left: `${scaleTarget.frame.x * 100}%`, top: `${scaleTarget.frame.y * 100}%`, width: `${scaleTarget.frame.w * 100}%`, height: `${scaleTarget.frame.h * 100}%` }}>
          <span className="scale-pivot" aria-label="Scale anchor" style={{ left: `${scaleAnchor.x * 100}%`, top: `${scaleAnchor.y * 100}%` }} />
          {!movementLocked(special ? [special === 'background' ? '__background' : '__border'] : currentItems.map(i=>i.id)) && ANCHORS.filter(h => (h.x !== .5 || h.y !== .5) && (h.x !== scaleAnchor.x || h.y !== scaleAnchor.y)).map(handle => <button key={handle.name} type="button" className="scale-handle" aria-label={`Scale from ${handle.name.toLowerCase()}`} style={{ left: `${handle.x * 100}%`, top: `${handle.y * 100}%` }}
            onPointerDown={event => { if (event.button !== 0) return; event.preventDefault(); historyGesture.current = { recorded: false }; event.currentTarget.setPointerCapture(event.pointerId); drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, frame: { ...scaleTarget.frame }, anchor: scaleAnchor, backgroundScale: special === 'background', borderScale: special === 'border', startScale: proof.backgroundTransform?.scale ?? 100, handle, ids: currentItems.map(i => i.id), layout, items: editorItems } }}
            onPointerMove={event => { const d = drag.current; if (!d?.handle || d.pointer !== event.pointerId) return; const bounds = canvasHost.current!.getBoundingClientRect(); const factor = pointerScale(d.frame, d.anchor, d.handle, event.clientX - d.x, event.clientY - d.y, bounds); if (d.borderScale) { setBorderFrame(scaleFrame(d.frame, factor, d.anchor)); return }; if (d.backgroundScale) { setBackground({ scale: Math.max(1, Math.min(800, d.startScale * factor)) }); return }; transformItems(d.ids, scaleFrame(d.frame, factor, d.anchor), d.layout, d.items) }}
            onPointerUp={event => { drag.current = null; if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) }} onPointerCancel={() => { drag.current = null }} />)}
        </div>}
      </div></div></div><aside className="calibration-controls" aria-label="Calibration adjustments">
        <LayersPanel preparation={{label:preparedWords.length?(preparedWords.some(p=>!p.vector)&&preparationSource?.vectorPdf?'Use embedded Illustrator vectors':'Headline words ready'):'Prepare headline words',disabled:preparing||!preparationSource||preparedWords.length>0&&!(preparedWords.some(p=>!p.vector)&&preparationSource?.vectorPdf),run:()=>setupSource(preparedWords.length?'upgrade':'prepare',preparationSource),status:sourceMessage|| (preparedWords.length?`${preparedWords.length} separate words · ${preparedWords.every(p=>p.vector)?'embedded Illustrator vector source':'original pixels'}`:'Select the confirmed headline below, then prepare its words. Logos remain intact.')}} state={panel} selected={panelSelected} onSelect={panelSelect} onAction={panelAction} thumbnailSize={art.previewSettings?.layerThumbnailSize || 100} onThumbnailSize={size => { art.previewSettings={...art.previewSettings,layerThumbnailSize:size}; changed() }} onResetAppearance={resetPanelAppearance} canLink={unlinkMode || currentItems.length > 1} linked={unlinkMode} onLink={() => { if(unlinkMode)ungroupSelected();else groupSelected('link') }} renderThumbnail={node => {
          if(node.type==='group')return <span>▱</span>
          if(node.type==='adjustment')return <span>◐</span>
          if(node.id==='__border')return <svg viewBox="0 0 100 100" aria-hidden="true"><rect x="8" y="8" width="84" height="84" fill="none" stroke={art.originalBorder?.color || '#000'} strokeWidth="3"/></svg>
          return <LayerThumbnail layers={sourceLayers.filter(l=>node.sourceIds.includes(l.id))} large />
        }} />
        <details className="editor-history"><summary>History · {history.past.length} / 7 undo steps</summary>{history.past.length || history.future.length ? <ol>{history.past.map((entry, index) => <li key={index}>{entry.label}<small>{entry.screen || 'Source artwork'}</small></li>)}{history.future.slice().reverse().map((entry, index) => <li className="history-undone" key={`redo-${index}`}>Undone: {entry.label}</li>)}</ol> : <p>No edits yet. Your next seven actions will be undoable.</p>}<small>Ctrl/Cmd+Z: Undo · Ctrl/Cmd+Shift+Z: Redo. Source operations restore all affected guides.</small></details>
        <details className="headline-preparation" open={!art.originalBorder || !(art.wordPieces || []).length}><summary>Headline preparation · {art.originalBorder ? 'Border ready' : 'Border missing'} · {(art.wordPieces || []).length} word pieces</summary><p>Select the original headline here, including one inside a linked source. Preparing detaches its word pieces; logos stay intact.</p><label>Main headline source<select aria-label="Main headline source" value={preparationSource?.id || ''} onChange={e => setHeadlineSourceId(e.target.value)}><option value="">Choose original headline layer…</option>{preparationCandidates.map((l, index) => <option key={l.id} value={l.id}>{index + 1}. {l.name} · {Math.round(l.box[2])} × {Math.round(l.box[3])}</option>)}</select></label>{preparationSource && <div className="headline-source-preview"><LayerThumbnail layers={[{ ...preparationSource, effectiveHidden: false }]} large /><small>{preparationSource.name}</small></div>}<button type="button" disabled={preparing || !preparationSource || preparedWords.length > 0} onClick={() => setupSource('prepare', preparationSource)}>Prepare border + words</button><small>Changes source tagging and all five guides. Review the result; Undo restores the previous state.</small><p className="preparation-result" role="status">{sourceMessage}</p></details>
        <p>Ctrl/Cmd-click to select several. Link layers to move and scale them together in this layout.</p>
        <label>Element<select aria-label="Element" value={special || currentItems[0]?.id || ''} onChange={e => { if (e.target.value === 'background' || e.target.value === 'border') { setSpecial(e.target.value); setSelected([]) } else { setSpecial(null); setSelected(pickIds(e.target.value)) } }}>{backgrounds.length > 0 && <option value="background">Background</option>}{art.originalBorder && <option value="border">Original border</option>}{editorItems.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
        {!special && <>{sourceLayer && !sourceLayer.wordSourceId && !sourceLayer.splitIntoWords && <div className="source-text-tools"><h3>Headline source tools</h3>{sourceLayer.logoProtected ? <p>Logo-protected source stays intact.</p> : <>{currentItems[0]?.role !== 'headline' && <button type="button" className="ghost" onClick={() => { beginAction('Confirm main headline'); const r = art.an.roles.find(r => r.id === sourceLayer.id); if (r) Object.assign(r, { role: 'headline', confidence: 1, why: 'Designer-confirmed headline in editor' }); else art.an.roles.push({ id: sourceLayer.id, role: 'headline', confidence: 1 }); setSourceMessage('Main headline confirmed. You can now detect its original border and separate its words.'); changed() }}>Use selected source as main headline</button>}<button type="button" className="ghost" disabled={preparing || currentItems[0]?.role !== 'headline' || !!art.originalBorder} onClick={() => setupSource('border')}>Detect original border</button><button type="button" className="ghost" disabled={currentItems[0]?.role !== 'headline'} onClick={() => setupSource('words')}>Split headline into words</button><small>These source operations affect all five guides. Detect a shared border before splitting. Logos stay intact.</small></>}</div>}<p role="status" className="source-tool-status">{sourceMessage}</p></>}
        <small>Background / border settings shortcuts</small>
        <div className="editor-fixed-layers">
        {art.originalBorder && <button type="button" className={`editor-special-layer ${special === 'border' ? 'selected' : ''}`} onClick={() => { setSpecial('border'); setSelected([]) }}><span className="border-layer-symbol">▭</span><span><strong>Original border</strong><small>Vector rectangle · source traced</small></span></button>}
        {backgrounds.map(layer => <button key={layer.id} type="button" className={`editor-special-layer ${special === 'background' ? 'selected' : ''}`} onClick={() => { setSpecial('background'); setSelected([]) }}><LayerThumbnail layers={[layer]} /><span><strong>{layer.name}</strong><small>Background · original source texture</small></span></button>)}
        {!backgrounds.length && <p className="layer-empty-note">No background tagged. Identify its source layer in Analyse.</p>}
        </div>

        {special === 'background' && <div className="special-layer-inspector"><h3>Original background</h3><p>{art.backgroundRegion ? `Selected texture: ${art.backgroundRegion.w} × ${art.backgroundRegion.h} px at ${art.backgroundRegion.x}, ${art.backgroundRegion.y}` : 'Uses the tagged original background. Draw a safe texture area in Analyse to change the material used for extension.'}</p><label>Background scale (%)<input type="number" min={1} max={800} step={5} value={proof.backgroundTransform?.scale ?? 100} onChange={e => setBackground({ scale: Math.max(1, Math.min(800, Number(e.target.value))) })} /></label><label>Background horizontal position (%)<input type="range" min={0} max={100} value={proof.backgroundTransform?.x ?? 50} onChange={e => setBackground({ x: Number(e.target.value) })} /></label><label>Background vertical position (%)<input type="range" min={0} max={100} value={proof.backgroundTransform?.y ?? 50} onChange={e => setBackground({ y: Number(e.target.value) })} /></label><label>Background X offset (%)<input type="number" step={1} value={proof.backgroundTransform?.offsetX ?? 0} onChange={e => setBackground({ offsetX: Number(e.target.value) })} /></label><label>Background Y offset (%)<input type="number" step={1} value={proof.backgroundTransform?.offsetY ?? 0} onChange={e => setBackground({ offsetY: Number(e.target.value) })} /></label><button type="button" className="ghost" onClick={() => setBackground({ scale: 100, x: 50, y: 50, offsetX: 0, offsetY: 0 })}>Reset background transform</button><p>Move and scale freely, including beyond canvas edges. 100% covers the canvas; smaller sizes or offsets can expose transparency. Applies only to this layout. Full source bounds and texture selection are in Analyse.</p></div>}
        {special === 'border' && <div className="special-layer-inspector"><h3>Vector border</h3>{borderFrame && <>{[['x','Border X (%)'],['y','Border Y (%)'],['w','Border width (%)'],['h','Border height (%)']].map(([key,label]) => <label key={key}>{label}<input type="number" step={.5} min={key === 'w' || key === 'h' ? .1 : undefined} value={+(borderFrame[key] * 100).toFixed(2)} onChange={e => setBorderFrame({ ...borderFrame, [key]: key === 'w' || key === 'h' ? Math.max(.001, Number(e.target.value) / 100) : Number(e.target.value) / 100 })} /></label>)}<button type="button" className="ghost" onClick={() => { beginAction('Reset adaptive border'); const next = { ...getProof(screen), approved: false }; delete next.borderFrame; art.calibration = { ...art.calibration, enabled: outputMode?art.calibration.enabled:false, [storeName]: { ...art.calibration[storeName], [proofKey(screen)]: next } }; changed() }}>Reset adaptive border</button></>}<label>Border thickness (this layout, source px)<input type="number" min={1} max={40} value={proof.borderThickness ?? art.originalBorder.thickness} onChange={e => { beginAction('Border thickness'); const next = { ...proof, borderThickness: Math.max(1, Math.min(40, Number(e.target.value))), approved: false }; art.calibration = { ...art.calibration, enabled: outputMode?art.calibration.enabled:false, [storeName]: { ...art.calibration[storeName], [proofKey(screen)]: next } }; changed() }} /></label><p>Reconstructed from your traced source border. Drag inside its box to move, or use its handles to scale. Manual changes apply to this guide; Reset restores the screen/stamp frame. Thickness scales with the short side.</p></div>}
        {!special && <><h3 className="transform-heading">Transform</h3><fieldset className="scale-anchor"><legend>Scale anchor point</legend><div role="group" aria-label="Scale anchor point">{ANCHORS.map((point, index) => <button key={point.name} type="button" aria-label={`Anchor ${point.name.toLowerCase()}`} aria-pressed={anchorIndex === index} onClick={() => setAnchorIndex(index)} title={point.name}>•</button>)}</div><small>{anchor.name} stays fixed during scaling. Manual transforms override placement anchors for this layout.</small></fieldset>
        {chosen && <><label>X position (%)<input type="number" step={.5} disabled={movementLocked(currentItems.map(i=>i.id))} value={+(chosen.frame.x * 100).toFixed(2)} onChange={e => changeFrame(chosen.id, { x: Number(e.target.value) / 100 })} /></label><label>Y position (%)<input type="number" step={.5} disabled={movementLocked(currentItems.map(i=>i.id))} value={+(chosen.frame.y * 100).toFixed(2)} onChange={e => changeFrame(chosen.id, { y: Number(e.target.value) / 100 })} /></label><label>Width (%)<input type="number" min={1} max={1000} step={.5} disabled={movementLocked(currentItems.map(i=>i.id))} value={+(chosen.frame.w * 100).toFixed(2)} onChange={e => resize(Number(e.target.value) / 100)} /></label><p>{chosen.layerIds.length} source layer(s) · proportional scaling · {chosen.constraint.anchor && chosen.constraint.anchor !== 'free' ? `Anchored: ${chosen.constraint.anchor}` : 'Free placement'}</p></>}
        <div className="editor-arrangement"><span>{currentItems.length} selected</span><button type="button" className="ghost" disabled={currentItems.length < 2 || layout.filter(u => currentItems.some(i => i.memberIds.includes(u.id))).some(u => u.constraint.anchor && u.constraint.anchor !== 'free')} onClick={() => groupSelected()}>Group selected elements</button><button type="button" className="ghost" disabled={!(proof.groups || []).some(g => selected.includes(g.id))} onClick={ungroupSelected}>Ungroup selected elements</button><label>Align relative to<select aria-label="Alignment reference" value={alignReference} onChange={e => setAlignReference(e.target.value)}><option value="selection">Selection bounds</option><option value="canvas">Composition (safe area)</option></select></label><div className="alignment-buttons">{[['left','Left'],['center-x','Horizontal center'],['right','Right'],['top','Top'],['center-y','Vertical center'],['bottom','Bottom'],['distribute-x','Distribute horizontally'],['distribute-y','Distribute vertically']].map(([id,label])=><button type="button" className="ghost" key={id} disabled={!currentItems.length || (id.startsWith('distribute') ? currentItems.length < 3 : alignReference === 'selection' && currentItems.length < 2)} onClick={()=>arrange(id)}>{label}</button>)}</div><small>Edge anchors take precedence. Clear anchors in Analyse before grouping freely moving elements.</small></div>
        </>}<button type="button" className="ghost" onClick={reset}>Reset this layout</button>
        <div className="calibration-findings" aria-live="polite"><h3>Review findings</h3>{issues.length ? issues.map((issue, index) => <p key={index}><strong>{issue.blocked ? 'Blocked' : 'Review'}:</strong> {issue.message}</p>) : <p>No geometry blockers detected. Check creative quality before approving.</p>}</div>
        <small>Approval records your layout guide, not a guarantee that every target screen is production-ready. Recheck extreme and combined screens.</small>
      </aside></div>
    </div>}
  </section>
}

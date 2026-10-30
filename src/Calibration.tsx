import { AffineMatrix, UNIT_BOUNDS, apply, inverse, multiply, transformedBounds, matrixForBounds, frameMatrix, translation, rotateAt, around, cssLocalTransform } from './graphics/affine'
import { TransformHandle, RESIZE_HANDLES, beginGesture, updateGesture } from './graphics/freeTransform'
import { useFreeTransform } from './graphics/useFreeTransform'
import { TransformTarget, TransformTransaction, targetMatrix, transformedTargets } from './graphics/transformTargets'
import { verifyEmbeddedVector } from './embeddedVectors.js'
import { useEffect, useRef, useState } from 'react'
import { SCREENS } from './data/presets.js'
import { renderCalibration, drawCalibrationInto, cancelCalibrationPreview, pickArtwork, backgroundBounds } from './engine/render.js'
import { screenProofKey, createScreenProof, requiredFamilies, GUIDE_PRESETS, contentUnits, guideLayout, guideFindings, initialProof, layoutFamily, sourceSignature } from './layoutGuides.js'
import { arrangeFrames } from './words.js'
import { allLayers, drawSourceLayers, unionBounds } from './artwork.js'
import { editorSnapshot, editorHistory, commitEditorAction, finishEditorAction, travelEditorHistory, restoreEditorSnapshot } from './editorHistory.js'
import { LayersPanel } from './LayersPanel'
import { panelForArtwork, panelGroupProofs, panelOrder } from './layerPanelAdapter'
import { reducePanel, effectiveLocks, descendants, LayerPanelAction, LayerRecord } from './layerPanelModel'
import { normalizeBlend, clamp01 } from './blending.js'
import { borderGeometry } from './border.js'
import { prepareSourceText } from './sourceText.js'
import './calibration.css'

const ANCHORS = ['Top left', 'Top centre', 'Top right', 'Middle left', 'Centre', 'Middle right', 'Bottom left', 'Bottom centre', 'Bottom right'].map((name, i) => ({ name, x: (i % 3) / 2, y: Math.floor(i / 3) / 2 }))

const PRESETS = GUIDE_PRESETS.map(name => SCREENS.find(s => s.name === name)).filter(Boolean)

function ProofCanvas({ art, screen, proof, large = false, interaction }: any) {
  const host = useRef<HTMLDivElement>(null)
  const [vectorError,setVectorError]=useState('')
  useEffect(() => {
    if(interaction?.current)return
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

export function Calibration({ art, onChange, onBatch, targetScreen, onClose, targetScreens }: any) {
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
  const [customAnchor,setCustomAnchor]=useState(false)
  const gizmoCanvas=useRef<HTMLCanvasElement>(null)
  const handleButtons=useRef(new Map<string,HTMLButtonElement>())
  const requestedTargets=useRef<readonly TransformTarget[]|null>(null)
  const transformSession=useRef<{transaction:TransformTransaction;proof:Record<string,unknown>;canvas?:HTMLCanvasElement|null}|null>(null)
  const anchor = ANCHORS[anchorIndex]
  const dialog = useRef<HTMLDivElement>(null)
  const canvasHost = useRef<HTMLDivElement>(null)
  const outputMode=!!targetScreen, storeName=outputMode?'outputs':'proofs', proofKey=(s:any)=>outputMode?screenProofKey(s):layoutFamily(s)
  const screen = (outputMode?SCREENS:PRESETS).find(s => s.name === active)
  const families = requiredFamilies(targetScreens), presets = PRESETS.filter(s=>families.includes(layoutFamily(s)))
  const signature = sourceSignature(art)
  const getProof = (s: any) => art.calibration?.[storeName]?.[proofKey(s)] || (outputMode?createScreenProof(art,s):initialProof(art,s))
  const closeEditor=()=>{setActive(null);onClose?.()}
  useEffect(()=>{if(targetScreen)open(targetScreen)},[targetScreen?.name])
  const approvedCount = families.filter(f => art.calibration?.proofs?.[f]?.approved && art.calibration.proofs[f].sourceSignature === signature).length
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
    pendingHistory.current = null; historyGesture.current = null; 
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
  const borderMatrix=border?targetMatrix(matrixForBounds({x:border.x,y:border.y,width:border.w,height:border.h}),proof?.transforms?.__border):null
  const borderFrame=borderMatrix?{x:borderMatrix.tx/screen.w,y:borderMatrix.ty/screen.h,w:Math.hypot(borderMatrix.a,borderMatrix.b)/screen.w,h:Math.hypot(borderMatrix.c,borderMatrix.d)/screen.h}:null
  function fitTargets(ids:readonly string[]){
    const matrix=selectionMatrix(targetsFor(ids)),host=canvasHost.current;if(!matrix||!host||!screen)return
    const box=transformedBounds(matrix),frame=host.getBoundingClientRect(),stage=host.parentElement?.getBoundingClientRect();if(!stage)return
    const width=2*Math.max(Math.abs(box.x-screen.w/2),Math.abs(box.x+box.width-screen.w/2))*frame.width/screen.w,height=2*Math.max(Math.abs(box.y-screen.h/2),Math.abs(box.y+box.height-screen.h/2))*frame.height/screen.h
    const factor=Math.min(1,(stage.width-96)/Math.max(1,width),(stage.height-96)/Math.max(1,height));if(factor<1)setZoom(Math.max(.05,zoom*factor*.95))
  }
  function panelSelect(ids: string[]) {
    if (ids.length === 1 && (ids[0] === '__background' || ids[0] === '__border')) { setSpecial(ids[0] === '__background' ? 'background' : 'border'); setSelected([]);fitTargets(ids) }
    else { setSpecial(null); setSelected(ids) }
  }
  const panelSelected = special ? [special === 'background' ? '__background' : '__border'] : selected
  function targetsFor(ids:readonly string[]):TransformTarget[] {
    if(!screen)return []
    const keys=new Set<string>()
    for(const id of ids){if(id.startsWith('__'))keys.add(id);else{const item=editorItems.find(i=>i.id===id);for(const key of item?.memberIds||[id])keys.add(key);for(const child of descendants(panel,id)){const n=panel.nodes.find(n=>n.id===child);if(n&&n.type!=='group')keys.add(child)}}}
    const result:TransformTarget[]=[]
    for(const id of keys){
      const unit=layout.find(u=>u.id===id),rect=unit?{x:unit.frame.x*screen.w,y:unit.frame.y*screen.h,width:unit.frame.w*screen.w,height:unit.frame.h*screen.h}:id==='__background'?(()=>{const b=backgroundBounds(art,screen,proof);return b?{x:b.x,y:b.y,width:b.w,height:b.h}:null})():id==='__border'&&border?{x:border.x,y:border.y,width:border.w,height:border.h}:null
      if(!rect||rect.width<=0||rect.height<=0)continue
      const base=matrixForBounds(rect),layers=unit?sourceLayers.filter(l=>unit.layerIds.includes(l.id)):[],preserveAspect=!!unit&&(layers.some(l=>l.logoProtected||l.kind==='text')||['headline','subheadline','offer','price','logo','contact','legal','regulatory','product'].includes(unit.role))
      result.push({id,base,matrix:targetMatrix(base,proof?.transforms?.[id]),preserveAspect})
    }
    return result
  }
  function selectionMatrix(targets:readonly TransformTarget[]):AffineMatrix|null {
    if(!targets.length)return null;if(targets.length===1)return targets[0].matrix
    const boxes=targets.map(t=>transformedBounds(t.matrix)),x=Math.min(...boxes.map(b=>b.x)),y=Math.min(...boxes.map(b=>b.y))
    return matrixForBounds({x,y,width:Math.max(...boxes.map(b=>b.x+b.width))-x,height:Math.max(...boxes.map(b=>b.y+b.height))-y})
  }
  const selectedTargets=targetsFor(panelSelected),selectedMatrix=selectionMatrix(selectedTargets)
  const geometry=selectedMatrix?{matrix:selectedMatrix,bounds:UNIT_BOUNDS}:null
  const protectedAspect=selectedTargets.some(t=>t.preserveAspect)
  const selectionLocked=!selectedTargets.length||movementLocked([...panelSelected,...selectedTargets.map(t=>t.id)])
  function paintDraft(matrix:AffineMatrix){const session=transformSession.current,canvas=session?.canvas;if(session&&canvas)drawCalibrationInto(canvas,art,screen,{...session.proof,transforms:transformedTargets(session.transaction,matrix)})}
  function commitMatrix(matrix:AffineMatrix,session=transformSession.current){
    if(!session||!screen)return
    const next={...session.proof,transforms:transformedTargets(session.transaction,matrix),approved:false,sourceSignature:signature}
    art.calibration={...art.calibration,enabled:outputMode?art.calibration.enabled:false,[storeName]:{...art.calibration[storeName],[proofKey(screen)]:next}}
    transformSession.current=null;changed();historyGesture.current=null
  }
  const freeTransform=useFreeTransform({canvas:gizmoCanvas,world:screen||{w:1,h:1},geometry,locked:selectionLocked,preserveAspect:protectedAspect,viewport:()=>{const box=canvasHost.current?.getBoundingClientRect(),overlay=gizmoCanvas.current?.getBoundingClientRect();return box&&overlay&&screen?{a:box.width/screen.w,b:0,c:0,d:box.height/screen.h,tx:box.left-overlay.left,ty:box.top-overlay.top}:{a:1,b:0,c:0,d:1,tx:0,ty:0}},anchor:customAnchor?anchor:undefined,
    onBegin:({geometry,handle})=>{const targets=requestedTargets.current||selectedTargets;requestedTargets.current=null;historyGesture.current={recorded:false};beginAction(handle==='body'?'Move selection':handle==='rotate'?'Rotate selection':'Scale selection');transformSession.current={transaction:{start:geometry.matrix,targets,original:proof?.transforms||{}},proof:{...getProof(screen)},canvas:canvasHost.current?.querySelector<HTMLCanvasElement>('.proof-canvas canvas')};const canvas=transformSession.current.canvas;if(canvas)cancelCalibrationPreview(canvas)},
    onPreview:paintDraft,onCommit:commitMatrix,onError:error=>setSourceMessage(`Transform cancelled: ${error.message}`),onCancel:()=>{transformSession.current=null;pendingHistory.current=null;historyGesture.current=null;const canvas=canvasHost.current?.querySelector<HTMLCanvasElement>('.proof-canvas canvas');if(canvas)drawCalibrationInto(canvas,art,screen,proof)},
    onHandles:(handles,viewport)=>{for(const handle of handles){const button=handleButtons.current.get(handle.id);if(button){button.style.left=`${handle.point.x-viewport.tx}px`;button.style.top=`${handle.point.y-viewport.ty}px`}}}
  })
  function beginTransform(event:PointerEvent,ids:readonly string[],handle:TransformHandle='body'){
    const targets=targetsFor(ids),matrix=selectionMatrix(targets);if(!matrix||movementLocked([...ids,...targets.map(t=>t.id)]))return
    requestedTargets.current=targets;freeTransform.beginPointer(event,{geometry:{matrix,bounds:UNIT_BOUNDS},handle,locked:false,preserveAspect:targets.some(t=>t.preserveAspect)})
  }
  function setSelectionMatrix(matrix:AffineMatrix,label:string){if(!selectedMatrix||selectionLocked)return;beginAction(label);commitMatrix(matrix,{transaction:{start:selectedMatrix,targets:selectedTargets,original:proof?.transforms||{}},proof:{...getProof(screen)}})}
  const transformDisplay=selectedMatrix&&screen?{x:selectedMatrix.tx/screen.w,y:selectedMatrix.ty/screen.h,w:Math.hypot(selectedMatrix.a,selectedMatrix.b)/screen.w,angle:Math.atan2(selectedMatrix.b,selectedMatrix.a)*180/Math.PI}:null
  function setTransformValue(key:'x'|'y'|'w'|'angle',value:number){
    if(!selectedMatrix||!screen||!transformDisplay)return
    if(key==='x'||key==='y')setSelectionMatrix({...selectedMatrix,[key==='x'?'tx':'ty']:value*(key==='x'?screen.w:screen.h)},'Move selection')
    else if(key==='w'){const scale=Math.max(.01,value/transformDisplay.w);setSelectionMatrix(multiply(selectedMatrix,around(anchor,{a:scale,b:0,c:0,d:scale,tx:0,ty:0})),'Scale selection')}
    else setSelectionMatrix(rotateAt(selectedMatrix,apply(selectedMatrix,{x:.5,y:.5}),(value-transformDisplay.angle)*Math.PI/180),'Rotate selection')
  }
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
        const transforms={...state.proof.transforms},parentTransform=transforms[parent.id]
        if(parentTransform&&state.proof.screen){const base=frameMatrix(parent.frame,state.proof.screen),delta=multiply(multiply(base,parentTransform),inverse(base));for(const unit of newUnits){const child=frameMatrix(frames[unit.id],state.proof.screen);transforms[unit.id]=multiply(inverse(child),multiply(delta,child))}delete transforms[parent.id]}
        const replace = (entries = []) => entries.flatMap(id => id === parent.id ? ids : [id])
        art.calibration[state.bucket][state.key] = { ...state.proof, approved: false, frames, transforms, layerOrder: replace(state.proof.layerOrder), freeUnitIds: replace(state.proof.freeUnitIds), groups: (state.proof.groups || []).filter(g => !g.unitIds.includes(parent.id)) }
      }
      for(const bucket of ['proofs','outputs'])for(const [family,p] of Object.entries(art.calibration?.[bucket] || {}) as any)if(p.panel&&p.screen) { const updated=panelForArtwork(art,guideLayout(art,p.screen,p),p);art.calibration[bucket][family]={...p,panel:updated,layerOrder:panelOrder(updated)} }
      art.calibration = { ...art.calibration, enabled: false }; setSourceMessage(result.message)
      if (result.pieces.length) setSelected(result.pieces.map(p => `word:${p.id}`))
      changed()
    } catch (error) { if (pendingHistory.current) restoreEditorSnapshot(art, pendingHistory.current.before); setSourceMessage(`Not prepared: ${error instanceof Error ? error.message : String(error)} No source changes applied.`); changed() } finally {setPreparing(false)}
  }
  const backgroundTarget=selectedTargets.find(t=>t.id==='__background'),backgroundCover=screen?backgroundBounds(art,screen,{...proof,backgroundTransform:{scale:100,x:50,y:50,offsetX:0,offsetY:0}}):null
  const backgroundCentre=backgroundTarget?apply(backgroundTarget.matrix,{x:.5,y:.5}):null
  const backgroundDisplay=backgroundTarget&&backgroundCover&&backgroundCentre?{scale:Math.hypot(backgroundTarget.matrix.a,backgroundTarget.matrix.b)/backgroundCover.w*100,offsetX:(backgroundCentre.x-screen.w/2)/screen.w*100,offsetY:(backgroundCentre.y-screen.h/2)/screen.h*100}:null
  function setBorderFrame(frame:{x:number;y:number;w:number;h:number}) {
    if(!borderMatrix||!borderFrame||selectionLocked)return
    const sx=frame.w/borderFrame.w,sy=frame.h/borderFrame.h
    setSelectionMatrix({...borderMatrix,a:borderMatrix.a*sx,b:borderMatrix.b*sx,c:borderMatrix.c*sy,d:borderMatrix.d*sy,tx:frame.x*screen.w,ty:frame.y*screen.h},'Transform vector border')
  }
  function setBackground(patch:{scale?:number;x?:number;y?:number;offsetX?:number;offsetY?:number}) {
    if(!backgroundTarget||!backgroundDisplay||!backgroundCentre||selectionLocked)return
    if(patch.scale===100&&patch.x===50&&patch.y===50&&patch.offsetX===0&&patch.offsetY===0){beginAction('Reset background transform');const transforms={...proof.transforms};delete transforms.__background;const next={...getProof(screen),transforms,backgroundTransform:{...patch},approved:false};art.calibration={...art.calibration,enabled:outputMode?art.calibration.enabled:false,[storeName]:{...art.calibration[storeName],[proofKey(screen)]:next}};changed();return}
    const m=backgroundTarget.matrix
    if(patch.scale!==undefined){const scale=patch.scale/backgroundDisplay.scale;setSelectionMatrix(multiply(m,around({x:.5,y:.5},{a:scale,b:0,c:0,d:scale,tx:0,ty:0})),'Scale original background');return}
    if(patch.offsetX!==undefined||patch.offsetY!==undefined){setSelectionMatrix(multiply(translation(((patch.offsetX??backgroundDisplay.offsetX)-backgroundDisplay.offsetX)/100*screen.w,((patch.offsetY??backgroundDisplay.offsetY)-backgroundDisplay.offsetY)/100*screen.h),m),'Move original background');return}
    const position={x:patch.x??proof.backgroundTransform?.x??50,y:patch.y??proof.backgroundTransform?.y??50},nextBounds=backgroundBounds(art,screen,{...proof,backgroundTransform:{scale:backgroundDisplay.scale,...position}}),nextBase=backgroundBounds(art,screen,{...proof,backgroundTransform:{...proof.backgroundTransform,...position}})
    if(nextBounds&&nextBase){beginAction('Position original background');const moved=multiply(translation(nextBounds.x+nextBounds.w/2-backgroundCentre.x,nextBounds.y+nextBounds.h/2-backgroundCentre.y),m),base=matrixForBounds({x:nextBase.x,y:nextBase.y,width:nextBase.w,height:nextBase.h}),next={...getProof(screen),backgroundTransform:{...proof.backgroundTransform,...position},transforms:{...proof.transforms,__background:multiply(inverse(base),moved)},approved:false};art.calibration={...art.calibration,enabled:outputMode?art.calibration.enabled:false,[storeName]:{...art.calibration[storeName],[proofKey(screen)]:next}};changed()}
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
  function arrange(action:string){
    if(selectionLocked||!screen)return
    const entries=currentItems.map(item=>{const targets=targetsFor([item.id]),matrix=selectionMatrix(targets);return {id:item.id,targets,matrix,box:matrix?transformedBounds(matrix):null}}).filter(entry=>entry.box&&entry.matrix)
    const frames=Object.fromEntries(entries.map(e=>[e.id,{x:e.box!.x/screen.w,y:e.box!.y/screen.h,w:e.box!.width/screen.w,h:e.box!.height/screen.h}])),arranged=arrangeFrames(frames,entries.map(e=>e.id),action,alignReference,screen)
    beginAction(`Arrange: ${action}`);let transforms={...proof.transforms}
    for(const entry of entries){const frame=frames[entry.id],after=arranged[entry.id];transforms=transformedTargets({start:entry.matrix!,targets:entry.targets,original:transforms},multiply(translation((after.x-frame.x)*screen.w,(after.y-frame.y)*screen.h),entry.matrix!))}
    const next={...getProof(screen),transforms,approved:false};art.calibration={...art.calibration,enabled:outputMode?art.calibration.enabled:false,[storeName]:{...art.calibration[storeName],[proofKey(screen)]:next}};changed()
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
    if (!families.length || approvedCount !== families.length) return
    art.calibration = { ...art.calibration, enabled: true }; changed(); onBatch()
  }
  function trapKeys(event: React.KeyboardEvent) {
    if(freeTransform.isDragging()&&!['Escape','Shift','Enter','Control','Meta','Alt'].includes(event.key)){event.preventDefault();return}
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement)) { event.preventDefault(); travel(event.shiftKey ? 'redo' : 'undo'); return }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y' && !(event.target instanceof HTMLInputElement)) { event.preventDefault(); travel('redo'); return }
    if (event.key === 'Escape') { if(freeTransform.isDragging()){event.preventDefault();freeTransform.cancel()}else closeEditor(); return }
    if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) && !event.ctrlKey && !event.metaKey && !event.altKey) {
      if (screen && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
        event.preventDefault(); const step = event.shiftKey ? 10 : 1, dx = event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0, dy = event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0
        if (selectedMatrix) setSelectionMatrix(multiply(translation(dx,dy),selectedMatrix),'Nudge selection')
      }
      if (event.key.toLowerCase() === 'v') { event.preventDefault(); setTool('move') }
      if (event.key.toLowerCase() === 's') { event.preventDefault(); setTool('scale');fitTargets(panelSelected) }
    }
    if (event.key !== 'Tab') return
    const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]') || [])
    const first = controls[0], last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }
  return <section className={outputMode?'output-refinement':'calibration'} aria-label={outputMode?'Adaptation refinement':'Layout calibration previews'}>
    {!outputMode&&<><div className="calibration-heading"><div><h2>Calibrate layouts for selected screens</h2><p>Double-click a preview to edit it full screen. Linked layers move together. Approve each guide before batch adaptation.</p></div><span>{approvedCount} / {families.length} guides approved</span></div>
    <div className="calibration-gallery">{presets.map(s => {
      const p = getProof(s), approved = p.approved && p.sourceSignature === signature
      return <article className="calibration-card" key={s.name}>
        <div className="calibration-thumbnail" onDoubleClick={() => open(s)} title="Double-click to edit this layout"><div style={{ aspectRatio: `${s.w}/${s.h}`, height: '100%', maxWidth: '100%' }}><ProofCanvas art={art} screen={s} proof={p} /></div></div>
        <h3>{s.name}</h3><p>{s.w} × {s.h} · {layoutFamily(s)}</p><span className="proof-status">{approved ? 'Guide approved' : 'Needs your adjustment'}</span>
        <button type="button" className="ghost" onClick={() => open(s)}>Edit {s.name}</button>
      </article>
    })}</div>
    <div className="calibration-batch"><p>Guides belong to this master. Source, visibility, links, tags or edge changes require guide review again.</p><button type="button" disabled={!families.length || approvedCount !== families.length} onClick={applyGuides}>Use these guides for full adaptation</button></div></>}
    {active && screen && <div className="calibration-focus" ref={dialog} role="dialog" aria-modal="true" aria-label={`Edit ${screen.name}`} onKeyDown={trapKeys} onFocusCapture={e => { if (e.target instanceof HTMLInputElement) historyGesture.current = { recorded: false } }} onBlurCapture={e => { if (e.target instanceof HTMLInputElement) historyGesture.current = null }}>
      <header><button type="button" className="ghost" onClick={closeEditor}>{outputMode?'← Back to adaptations':'← Back to layout previews'}</button><strong>{screen.name} · {screen.w} × {screen.h}{outputMode?` · ${art.lang}`:''}</strong><button type="button" className="ghost" disabled={!canTravel('undo')} onClick={() => travel('undo')}>Undo</button><button type="button" className="ghost" disabled={!canTravel('redo')} onClick={() => travel('redo')}>Redo</button><span className="spacer" /><label>Zoom<select aria-label="Calibration zoom" value={zoom} onChange={e => setZoom(Number(e.target.value))}>{![.25,.5,1,2,3].includes(zoom)&&<option value={zoom}>{Math.round(zoom*100)}%</option>}<option value={.25}>25%</option><option value={.5}>50%</option><option value={1}>Fit</option><option value={2}>200%</option><option value={3}>300%</option></select></label><button type="button" className="ghost" disabled={!selectedTargets.length} onClick={()=>fitTargets(panelSelected)}>Fit selection</button><button type="button" disabled={issues.some(i => i.blocked)} onClick={approve}>{proof.approved && proof.sourceSignature === signature ? (outputMode?'Adaptation approved':'Guide approved') : (outputMode?'Approve this adaptation':'Approve this guide')}</button></header>
      <div className="calibration-edit-layout" style={{'--inspector-width': `${art.previewSettings?.layerThumbnailSize === 300 ? 440 : art.previewSettings?.layerThumbnailSize === 200 ? 380 : 340}px`} as React.CSSProperties}><div className="calibration-stage-area"><canvas ref={gizmoCanvas} className="free-transform-gizmo" aria-hidden="true"/><div className="editor-toolbox" role="toolbar" aria-label="Editing tools"><button type="button" aria-pressed={tool === 'move'} onClick={() => setTool('move')}>Move <kbd>V</kbd></button><button type="button" aria-pressed={tool === 'scale'} onClick={() => {setTool('scale');fitTargets(panelSelected)}}>Scale <kbd>S</kbd></button><span>{tool === 'scale' ? 'Drag a handle to scale around the chosen anchor' : 'Inside box: move · Edge handles: scale'}</span></div><div className="calibration-stage"><div className="calibration-canvas-frame" ref={canvasHost} onPointerDown={event=>{
          if(event.button!==0||((event.target as HTMLElement).closest('[data-transform-handle]')&&!event.ctrlKey&&!event.metaKey))return
          const gizmoHit=freeTransform.hitPointer(event.nativeEvent)
          if(gizmoHit&&gizmoHit!=='body'&&!event.ctrlKey&&!event.metaKey){beginTransform(event.nativeEvent,panelSelected,gizmoHit);return}
          const bounds=event.currentTarget.getBoundingClientRect(),canvas=event.currentTarget.querySelector<HTMLCanvasElement>('.proof-canvas canvas')
          const hit=pickArtwork(art,screen,proof,(event.clientX-bounds.left)/bounds.width,(event.clientY-bounds.top)/bounds.height,(canvas?.width||screen.w)/screen.w,(canvas?.height||screen.h)/screen.h)
          if((!hit||hit.type==='background')&&gizmoHit==='body'&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey){beginTransform(event.nativeEvent,panelSelected);return}
          if(!hit){if(!event.ctrlKey&&!event.metaKey&&!event.shiftKey){setSelected([]);setSpecial(null)}return}
          if(hit.type!=='foreground'){setSpecial(hit.type);setSelected([]);beginTransform(event.nativeEvent,[hit.type==='border'?'__border':'__background']);return}
          const unit=(event.ctrlKey||event.metaKey||event.shiftKey?editorItems.find(i=>i.id===hit.id):null)||currentItems.find(i=>i.memberIds.includes(hit.id))||editorItems.find(i=>i.memberIds.includes(hit.id));if(!unit)return
          const toggle=event.ctrlKey||event.metaKey||event.shiftKey,ids=toggle?selected.includes(unit.id)?selected.filter(id=>!pickIds(unit.id).includes(id)):[...new Set([...selected,...pickIds(unit.id)])]:currentItems.some(i=>i.id===unit.id)?currentItems.map(i=>i.id):pickIds(unit.id)
          setSpecial(null);setSelected(ids);if(!toggle)beginTransform(event.nativeEvent,ids)
        }} style={{ aspectRatio: `${screen.w}/${screen.h}`, width: `min(${100*zoom}%, ${70 * screen.w / screen.h * zoom}vh)` }}>
        <ProofCanvas art={art} screen={screen} proof={proof} large interaction={transformSession} />
        {editorItems.map(unit => <button key={unit.id} type="button" className={`guide-object ${currentItems.some(i => i.id === unit.id) ? 'selected' : ''}`} aria-label={`Move ${unit.name}`} style={{ left: `${unit.frame.x * 100}%`, top: `${unit.frame.y * 100}%`, width: `${unit.frame.w * 100}%`, height: `${unit.frame.h * 100}%`,transform:proof?.transforms?.[unit.id]?cssLocalTransform(proof.transforms[unit.id],unit.frame,screen):undefined,transformOrigin:'0 0' }} onClick={event => { if (event.detail === 0) { setSpecial(null); setSelected(pickIds(unit.id)) } }}
><span>{unit.name}</span></button>)}
        {geometry&&!selectionLocked&&[...RESIZE_HANDLES,'rotate' as const].map(handle=><button key={handle} ref={element=>{if(element)handleButtons.current.set(handle,element);else handleButtons.current.delete(handle)}} type="button" data-transform-handle={handle} className={`scale-handle transform-hit-handle ${handle==='rotate'?'rotation-handle':''}`} aria-label={handle==='rotate'?'Rotate selection':`Scale from ${({nw:'top left',n:'top centre',ne:'top right',e:'middle right',se:'bottom right',s:'bottom centre',sw:'bottom left',w:'middle left'} as const)[handle]}`} onPointerDown={event=>{if(event.ctrlKey||event.metaKey)return;event.stopPropagation();beginTransform(event.nativeEvent,panelSelected,handle)}} onKeyDown={event=>{if(freeTransform.isDragging()||!selectedMatrix||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();event.stopPropagation();const p=handle==='rotate'?apply(selectedMatrix,{x:.5,y:-.1}):apply(selectedMatrix,({nw:{x:0,y:0},n:{x:.5,y:0},ne:{x:1,y:0},e:{x:1,y:.5},se:{x:1,y:1},s:{x:.5,y:1},sw:{x:0,y:1},w:{x:0,y:.5}} as const)[handle]);const d=event.shiftKey?10:1;setSelectionMatrix(updateGesture(beginGesture(geometry,handle,p,customAnchor?anchor:undefined),{x:p.x+(event.key==='ArrowRight'?d:event.key==='ArrowLeft'?-d:0),y:p.y+(event.key==='ArrowDown'?d:event.key==='ArrowUp'?-d:0)},{shift:false,preserveAspect:protectedAspect}),'Transform selection')}}/>)}
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
        {art.originalBorder && <button type="button" className={`editor-special-layer ${special === 'border' ? 'selected' : ''}`} onClick={()=>panelSelect(['__border'])}><span className="border-layer-symbol">▭</span><span><strong>Original border</strong><small>Vector rectangle · source traced</small></span></button>}
        {backgrounds.map(layer => <button key={layer.id} type="button" className={`editor-special-layer ${special === 'background' ? 'selected' : ''}`} onClick={()=>panelSelect(['__background'])}><LayerThumbnail layers={[layer]} /><span><strong>{layer.name}</strong><small>Background · original source texture</small></span></button>)}
        {!backgrounds.length && <p className="layer-empty-note">No background tagged. Identify its source layer in Analyse.</p>}
        </div>

        {special === 'background' && <div className="special-layer-inspector"><h3>Original background</h3><p>{art.backgroundRegion ? `Selected texture: ${art.backgroundRegion.w} × ${art.backgroundRegion.h} px at ${art.backgroundRegion.x}, ${art.backgroundRegion.y}` : 'Uses the tagged original background. Draw a safe texture area in Analyse to change the material used for extension.'}</p><label>Background scale (%)<input type="number" min={1} max={800} step={5} value={backgroundDisplay?+backgroundDisplay.scale.toFixed(2):(proof.backgroundTransform?.scale??100)} onChange={e => setBackground({ scale: Math.max(1, Math.min(800, Number(e.target.value))) })} /></label><label>Background horizontal position (%)<input type="range" min={0} max={100} value={proof.backgroundTransform?.x ?? 50} onChange={e => setBackground({ x: Number(e.target.value) })} /></label><label>Background vertical position (%)<input type="range" min={0} max={100} value={proof.backgroundTransform?.y ?? 50} onChange={e => setBackground({ y: Number(e.target.value) })} /></label><label>Background X offset (%)<input type="number" step={1} value={backgroundDisplay?+backgroundDisplay.offsetX.toFixed(2):(proof.backgroundTransform?.offsetX??0)} onChange={e => setBackground({ offsetX: Number(e.target.value) })} /></label><label>Background Y offset (%)<input type="number" step={1} value={backgroundDisplay?+backgroundDisplay.offsetY.toFixed(2):(proof.backgroundTransform?.offsetY??0)} onChange={e => setBackground({ offsetY: Number(e.target.value) })} /></label><button type="button" className="ghost" onClick={() => setBackground({ scale: 100, x: 50, y: 50, offsetX: 0, offsetY: 0 })}>Reset background transform</button><p>Move and scale freely, including beyond canvas edges. 100% covers the canvas; smaller sizes or offsets can expose transparency. Applies only to this layout. Full source bounds and texture selection are in Analyse.</p></div>}
        {special === 'border' && <div className="special-layer-inspector"><h3>Vector border</h3>{borderFrame && <>{[['x','Border X (%)'],['y','Border Y (%)'],['w','Border width (%)'],['h','Border height (%)']].map(([key,label]) => <label key={key}>{label}<input type="number" step={.5} min={key === 'w' || key === 'h' ? .1 : undefined} value={+(borderFrame[key] * 100).toFixed(2)} onChange={e => setBorderFrame({ ...borderFrame, [key]: key === 'w' || key === 'h' ? Math.max(.001, Number(e.target.value) / 100) : Number(e.target.value) / 100 })} /></label>)}<button type="button" className="ghost" onClick={() => { beginAction('Reset adaptive border'); const next = { ...getProof(screen), approved: false }; delete next.borderFrame;next.transforms={...next.transforms};delete next.transforms.__border; art.calibration = { ...art.calibration, enabled: outputMode?art.calibration.enabled:false, [storeName]: { ...art.calibration[storeName], [proofKey(screen)]: next } }; changed() }}>Reset adaptive border</button></>}<label>Border thickness (this layout, source px)<input type="number" min={1} max={40} value={proof.borderThickness ?? art.originalBorder.thickness} onChange={e => { beginAction('Border thickness'); const next = { ...proof, borderThickness: Math.max(1, Math.min(40, Number(e.target.value))), approved: false }; art.calibration = { ...art.calibration, enabled: outputMode?art.calibration.enabled:false, [storeName]: { ...art.calibration[storeName], [proofKey(screen)]: next } }; changed() }} /></label><p>Reconstructed from your traced source border. Drag inside its box to move, or use its handles to scale. Manual changes apply to this guide; Reset restores the screen/stamp frame. Thickness scales with the short side.</p></div>}
        {transformDisplay&&<><label>Rotation (degrees)<input type="number" aria-label="Rotation (degrees)" step={1} disabled={selectionLocked} value={+transformDisplay.angle.toFixed(2)} onChange={e=>setTransformValue('angle',Number(e.target.value))}/></label><button type="button" className="ghost" disabled={selectionLocked} onClick={()=>{beginAction('Reset free transform');const transforms={...proof.transforms};for(const target of selectedTargets)delete transforms[target.id];const next={...getProof(screen),transforms,approved:false};art.calibration={...art.calibration,enabled:outputMode?art.calibration.enabled:false,[storeName]:{...art.calibration[storeName],[proofKey(screen)]:next}};changed()}}>Reset selected transform</button><p>{protectedAspect?'Proportions protected for text, logos and key visuals.':'Corners: proportional · Shift: free stretch · Edges: stretch'} · Rotation handle: rotate · Shift: 15° snap · Esc: cancel</p></>}
        {!special && <><h3 className="transform-heading">Transform</h3><fieldset className="scale-anchor"><legend>Scale anchor point</legend><div role="group" aria-label="Scale anchor point">{ANCHORS.map((point, index) => <button key={point.name} type="button" aria-label={`Anchor ${point.name.toLowerCase()}`} aria-pressed={customAnchor&&anchorIndex === index} onClick={() => {setAnchorIndex(index);setCustomAnchor(true)}} title={point.name}>•</button>)}</div><small>{customAnchor?`${anchor.name} stays fixed during scaling.`:'Pointer scaling pins the opposite handle. Numeric sizing uses the top-left reference.'} Manual transforms override placement anchors for this layout.</small>{customAnchor&&<button type="button" className="ghost" onClick={()=>setCustomAnchor(false)}>Use opposite handle anchors</button>}</fieldset>
        {chosen && <><label>X position (%)<input type="number" step={.5} disabled={movementLocked(currentItems.map(i=>i.id))} value={+((transformDisplay?.x??chosen.frame.x)*100).toFixed(2)} onChange={e => setTransformValue('x',Number(e.target.value)/100)} /></label><label>Y position (%)<input type="number" step={.5} disabled={movementLocked(currentItems.map(i=>i.id))} value={+((transformDisplay?.y??chosen.frame.y)*100).toFixed(2)} onChange={e => setTransformValue('y',Number(e.target.value)/100)} /></label><label>Width (%)<input type="number" min={1} max={1000} step={.5} disabled={movementLocked(currentItems.map(i=>i.id))} value={+((transformDisplay?.w??chosen.frame.w)*100).toFixed(2)} onChange={e => setTransformValue('w',Number(e.target.value)/100)} /></label><p>{chosen.layerIds.length} source layer(s) · proportional scaling · {chosen.constraint.anchor && chosen.constraint.anchor !== 'free' ? `Anchored: ${chosen.constraint.anchor}` : 'Free placement'}</p></>}
        <div className="editor-arrangement"><span>{currentItems.length} selected</span><button type="button" className="ghost" disabled={currentItems.length < 2 || layout.filter(u => currentItems.some(i => i.memberIds.includes(u.id))).some(u => u.constraint.anchor && u.constraint.anchor !== 'free')} onClick={() => groupSelected()}>Group selected elements</button><button type="button" className="ghost" disabled={!(proof.groups || []).some(g => selected.includes(g.id))} onClick={ungroupSelected}>Ungroup selected elements</button><label>Align relative to<select aria-label="Alignment reference" value={alignReference} onChange={e => setAlignReference(e.target.value)}><option value="selection">Selection bounds</option><option value="canvas">Composition (safe area)</option></select></label><div className="alignment-buttons">{[['left','Left'],['center-x','Horizontal center'],['right','Right'],['top','Top'],['center-y','Vertical center'],['bottom','Bottom'],['distribute-x','Distribute horizontally'],['distribute-y','Distribute vertically']].map(([id,label])=><button type="button" className="ghost" key={id} disabled={!currentItems.length || (id.startsWith('distribute') ? currentItems.length < 3 : alignReference === 'selection' && currentItems.length < 2)} onClick={()=>arrange(id)}>{label}</button>)}</div><small>Edge anchors take precedence. Clear anchors in Analyse before grouping freely moving elements.</small></div>
        </>}<button type="button" className="ghost" onClick={reset}>Reset this layout</button>
        <div className="calibration-findings" aria-live="polite"><h3>Review findings</h3>{issues.length ? issues.map((issue, index) => <p key={index}><strong>{issue.blocked ? 'Blocked' : 'Review'}:</strong> {issue.message}</p>) : <p>No geometry blockers detected. Check creative quality before approving.</p>}</div>
        <small>Approval records your layout guide, not a guarantee that every target screen is production-ready. Recheck extreme and combined screens.</small>
      </aside></div>
    </div>}
  </section>
}

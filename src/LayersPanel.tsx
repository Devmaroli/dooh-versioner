import { useEffect, useRef, useState } from 'react'
import { BLEND_GROUPS, blendLabel } from './blending.js'
import { LayerPanelState, LayerPanelAction, LayerRecord, orderedNodes, ancestors, descendants, effectiveLocks, selectPanelLayers, moveTreeFocus, unlocked } from './layerPanelModel'
import { roleLabel } from './tagging.js'
import './layersPanel.css'

const paths: Record<string, string> = {
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  lock: 'M6 10h12v11H6z M8 10V6a4 4 0 0 1 8 0v4',
  transparency: 'M3 3h18v18H3z M3 9h18M3 15h18M9 3v18M15 3v18',
  pixels: 'm4 16 11-11 4 4L8 20H4z M13 7l4 4', position: 'M12 2v20M2 12h20M8 6l4-4 4 4M8 18l4 4 4-4M6 8l-4 4 4 4M18 8l4 4-4 4',
  artboards: 'M5 2v20M19 2v20M2 5h20M2 19h20',
  link: 'm9 15 6-6M8 13l-3 3a3 3 0 0 0 4 4l4-4M11 8l4-4a3 3 0 0 1 4 4l-3 3',
  fx: 'M6 21 10 5c.6-3 4-3 6-2M5 9h10M14 13l7 8M21 13l-7 8',
  mask: 'M3 4h18v16H3zM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  adjustment: 'M12 3a9 9 0 1 0 0 18V3zM12 3a9 9 0 0 1 0 18',
  group: 'M2 6h8l2 3h10v12H2zM2 6V3h8l2 3',
  chevron: 'M9 5l7 7-7 7',
  new: 'M5 2h10l5 5v15H5zM15 2v6h5M9 14h7M12.5 10.5v7',
  delete: 'M3 6h18M8 6V3h8v3M5 6l1 16h12l1-16M10 10v8M14 10v8',
}
function Icon({ name }: { name: string }) { return <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name] || paths.lock} /></svg> }
type Props = {
  state: LayerPanelState; selected: string[]; onSelect: (ids: string[]) => void; onAction: (action: LayerPanelAction, label: string) => void
  renderThumbnail: (layer: LayerRecord) => React.ReactNode; thumbnailSize: 48 | 100 | 200 | 300; onThumbnailSize: (size: 48 | 100 | 200 | 300) => void
  preparation?: { label:string; disabled:boolean; run:()=>void; status:string }; onResetAppearance: () => void; onLink: () => void; canLink: boolean; linked: boolean
  rowClassName?: string; eyeLabel?: (layer: LayerRecord, index: number) => string
}

export function LayersPanel({ state, selected, onSelect, onAction, renderThumbnail, thumbnailSize, onThumbnailSize, onLink, canLink, linked, onResetAppearance, preparation, rowClassName = '', eyeLabel }: Props) {
  const [filterBy, setFilterBy] = useState('name'), [query, setQuery] = useState(''), [kind, setKind] = useState('all')
  const [editing, setEditing] = useState<string | null>(null), [draft, setDraft] = useState('')
  const [inspector, setInspector] = useState<'fx' | 'mask' | null>(null), [message, setMessage] = useState(''), [drop, setDrop] = useState<{ id: string; placement: 'before' | 'after' | 'inside' } | null>(null)
  const anchor = useRef<string | null>(null), drag = useRef<string[]>([]), list = useRef<HTMLDivElement>(null)
  const picked = state.nodes.filter(n => !n.deleted && selected.includes(n.id)), locks = picked.map(n => effectiveLocks(state, n.id))
  const disabledPixels = !picked.length || locks.some(l => l.all || l.pixels), disabledAlpha = disabledPixels || locks.some(l => l.transparency)
  const common = <K extends keyof LayerRecord>(key: K) => picked.length && picked.every(n => n[key] === picked[0][key]) ? picked[0][key] : null
  const blend = common('blendMode') as string | null, opacity = common('opacity') as number | null, fill = common('fill') as number | null
  const selectedLayer = picked.length === 1 ? picked[0] : null
  const allRows = orderedNodes(state)
  const filtering = filterBy === 'name' ? !!query.trim() : kind !== 'all'
  const matches = allRows.filter(({ layer }) => filterBy === 'name' ? layer.name.toLowerCase().includes(query.toLowerCase()) : kind === 'all' || layer.type === kind).map(r => r.layer.id)
  const collapsed = state.nodes.filter(node => node.type === 'group' && node.expanded === false).map(node => node.id)
  const rows = allRows.filter(({ layer }) => filtering ? matches.includes(layer.id) || matches.some(id => ancestors(state,id).some(p => p.id === layer.id)) : !ancestors(state,layer.id).some(p => collapsed.includes(p.id)))
  useEffect(()=>{
    const id=selected[0];if(!id)return;if(selected.length===1)anchor.current=id
    const parents=ancestors(state,id).map(n=>n.id),closed=collapsed.filter(item=>!parents.includes(item));if(closed.length){setExpanded(closed,true);return}
    const row=list.current?.querySelector<HTMLElement>(`[data-layer-id="${CSS.escape(id)}"]`)
    if(row&&list.current){const box=row.getBoundingClientRect(),area=list.current.getBoundingClientRect();if(box.top<area.top)list.current.scrollTop-=area.top-box.top;else if(box.bottom>area.bottom)list.current.scrollTop+=box.bottom-area.bottom}
  },[selected.join('|'),collapsed.join('|')])
  const patch = (changes: Partial<LayerRecord>, label: string) => onAction({ type: 'patch', ids: selected, patch: changes }, label)
  function select(id: string, e: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean }) {
    const hidden = new Set(rows.filter(row => row.layer.visible === false).map(row => row.layer.id))
    const order = rows.map(row => row.layer.id).filter(item => !hidden.has(item) || item === id)
    onSelect(selectPanelLayers(selected,id,order,anchor.current,e)); if (!e.shiftKey) anchor.current = id
  }
  function setExpanded(ids: string[], expanded: boolean) { onAction({ type: 'patch', ids, patch: { expanded } }, expanded ? 'Expand group' : 'Collapse group') }
  function rename(layer: LayerRecord) { if (effectiveLocks(state,layer.id).all) return; setEditing(layer.id); setDraft(layer.name) }
  function finishRename() { if (editing && draft.trim()) onAction({ type: 'patch', ids: [editing], patch: { name: draft.trim() } }, 'Rename layer'); setEditing(null) }
  function create(type: 'pixel' | 'adjustment') {
    const id = crypto.randomUUID()
    onAction({ type: 'create', layer: { id, name: type === 'pixel' ? 'Transparent layer' : 'Brightness / Contrast', type, parentId: selectedLayer?.type === 'group' ? selectedLayer.id : selectedLayer?.parentId || null, visible: true, blendMode: 'normal', opacity: 1, fill: 1, locks: unlocked(), mask: null, sourceIds: [], memberIds: [], empty: type === 'pixel', ...(type === 'adjustment' ? { adjustment: { brightness: 0, contrast: 0 } } : {}) } }, type === 'pixel' ? 'Create transparent layer' : 'Create adjustment layer')
    onSelect([id]); setMessage(type === 'pixel' ? 'Created an empty transparent layer. No artwork has been invented.' : 'Neutral adjustment created. Change Brightness or Contrast to affect layers below it.')
  }
  function addMask() { if (!selectedLayer || disabledAlpha) return; patch({ mask: { kind: 'path', pathData: 'M0 0H1V1H0Z', rect: { x: 0, y: 0, w: 1, h: 1 }, enabled: true, linked: true } }, 'Add reveal-all layer mask'); setInspector('mask'); setMessage('Reveal-all mask added. Adjust its rectangle to hide part of the source.') }
  const siblings = selectedLayer ? state.nodes.filter(n=>!n.deleted&&n.parentId===selectedLayer.parentId) : []
  const siblingIndex = siblings.findIndex(n=>n.id===selectedLayer?.id)
  function stepLayer(direction: number) { const target=siblings[siblingIndex+direction];if(selectedLayer&&target)onAction({type:'move',ids:[selectedLayer.id],target:target.id,placement:direction<0?'before':'after'},'Reorder layer tree') }
  const stroke = selectedLayer?.fx?.stroke || { enabled: false, color: '#000000', width: 3, opacity: 1 }
  function updateStroke(value: Partial<typeof stroke>) { patch({ fx: { ...selectedLayer?.fx, stroke: { ...stroke, ...value } } }, 'Edit inner stroke style') }
  return <section className="layers-panel" aria-label="Layers panel" style={{ '--layer-thumbnail-size': `${thumbnailSize}px` } as React.CSSProperties}>
    <header className="lp-heading"><h2>Layers</h2><label>Thumbnails<select aria-label="Layer thumbnail size" value={thumbnailSize} onChange={e => onThumbnailSize(Number(e.target.value) as 48 | 100 | 200 | 300)}>{[48,100,200,300].map(size => <option key={size} value={size}>{size === 48 ? 'Compact' : `${size} × ${size}`}</option>)}</select></label></header>
    {preparation&&<div className="lp-preparation"><button type="button" disabled={preparation.disabled} onClick={preparation.run}>{preparation.label}</button><p role="status">{preparation.status}</p></div>}<p className="lp-selection-help">Ctrl/Cmd-click: toggle layers · Shift-click: select a range.</p><div className="lp-filter"><label>Filter<select aria-label="Layer filter" value={filterBy} onChange={e => setFilterBy(e.target.value)}><option value="name">By name</option><option value="type">By type</option></select></label>{filterBy === 'name' ? <input aria-label="Filter layers by name" placeholder="Find a layer…" value={query} onChange={e => setQuery(e.target.value)} /> : <select aria-label="Filter layers by type" value={kind} onChange={e => setKind(e.target.value)}>{['all','pixel','text','vector','adjustment','group'].map(type => <option key={type} value={type}>{type}</option>)}</select>}</div>
    <div className="lp-appearance"><label>Blend mode<select aria-label="Layer blend mode" disabled={disabledPixels} value={blend || ''} onChange={e => patch({ blendMode: e.target.value }, 'Change blend mode')}>
      {!blend && <option value="" disabled>{picked.length ? 'Mixed' : 'Select a layer'}</option>}{picked.every(n => n.type === 'group') && picked.length > 0 && <option value="pass-through">Pass Through</option>}
      {BLEND_GROUPS.map(([group,modes]) => <optgroup key={group as string} label={group as string}>{(modes as string[]).map(mode => <option key={mode} value={mode}>{blendLabel(mode)}</option>)}</optgroup>)}
    </select></label>{[['opacity','Opacity',opacity,disabledAlpha],['fill','Fill',fill,disabledAlpha]].map(([key,label,value,disabled]) => <div className="lp-alpha" key={key as string}><label>{label as string}<input type="number" aria-label={`${label} percentage`} min={0} max={100} step={1} disabled={disabled as boolean} value={value === null ? '' : Math.round(Number(value)*100)} placeholder="Mixed" onChange={e => patch({ [key as string]: Number(e.target.value)/100 }, `Change ${label}`)} /></label><input type="range" aria-label={`Layer ${String(label).toLowerCase()}`} min={0} max={100} step={1} disabled={disabled as boolean} value={value === null ? 100 : Math.round(Number(value)*100)} aria-valuetext={value === null ? 'Mixed' : `${Math.round(Number(value)*100)}%`} onChange={e => patch({ [key as string]: Number(e.target.value)/100 }, `Change ${label}`)} /></div>)}</div>
    <button type="button" className="ghost lp-reset" disabled={disabledAlpha} onClick={onResetAppearance}>Reset to imported appearance</button>
    <div className="lp-locks" role="toolbar" aria-label="Layer locks"><span>Lock:</span>{[['transparency','Transparency','transparency'],['pixels','Pixels','pixels'],['position','Position','position'],['artboards','Artboards','artboards'],['all','All','lock']].map(([key,label,icon]) => <button key={key} type="button" aria-label={`Lock ${label}`} title={`Lock ${label}`} aria-pressed={picked.length > 0 && picked.every(n => n.locks[key])} disabled={!picked.length} onClick={() => onAction({ type:'lock',ids:selected,key:key as keyof LayerRecord['locks'],value:!picked.every(n=>n.locks[key]) },`Lock ${label}`)}><Icon name={icon} /></button>)}</div>
    <div className="lp-order"><button type="button" disabled={!selectedLayer||siblingIndex<=0||locks.some(l=>l.all)} onClick={()=>stepLayer(-1)}>Move layer up</button><button type="button" disabled={!selectedLayer||siblingIndex>=siblings.length-1||locks.some(l=>l.all)} onClick={()=>stepLayer(1)}>Move layer down</button><small>Drag rows to reorder or move into a folder.</small></div>
    <div className="lp-list editor-layer-list" ref={list} role="tree" aria-label="Layout layers" aria-multiselectable="true" onKeyDown={event => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'g') {
        event.preventDefault()
        if (event.shiftKey) onAction({ type: 'ungroup', ids: selected }, 'Ungroup')
        else if (selected.length) { const id = crypto.randomUUID(); onAction({ type: 'group', ids: selected, id }, 'Create group'); onSelect([id]) }
        return
      }
      const order = rows.map(row => row.layer.id)
      const next = moveTreeFocus(order, selected[0], event.key)
      if ((event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') && next && next !== selected[0]) { event.preventDefault(); onSelect([next]); anchor.current = next; return }
      const current = rows.find(row => row.layer.id === selected[0])
      if (event.key === 'ArrowRight' && current) {
        event.preventDefault()
        if (current.layer.type === 'group' && current.layer.expanded === false) setExpanded([current.layer.id], true)
        else if (current.layer.type === 'group') { const child = state.nodes.find(node => !node.deleted && node.parentId === current.layer.id); if (child) { onSelect([child.id]); anchor.current = child.id } }
      }
      if (event.key === 'ArrowLeft' && current) {
        event.preventDefault()
        if (current.layer.type === 'group' && current.layer.expanded !== false) setExpanded([current.layer.id], false)
        else if (current.layer.parentId) { onSelect([current.layer.parentId]); anchor.current = current.layer.parentId }
      }
    }}>
      {rows.map(({layer,depth}) => {
        const locked = effectiveLocks(state,layer.id), hasChildren = state.nodes.some(n=>!n.deleted&&n.parentId===layer.id), isSelected=selected.includes(layer.id)
        const open = layer.expanded !== false
        return <div key={layer.id} role="treeitem" tabIndex={isSelected || (!selected.length && layer.id === rows[0]?.layer.id) ? 0 : -1} aria-level={depth+1} aria-selected={isSelected} aria-expanded={layer.type==='group' ? open : undefined} data-layer-id={layer.id} className={`lp-row editor-layer-row ${rowClassName} ${isSelected?'selected':''} ${thumbnailSize>100?'large-thumbnail':''}`} data-drop={drop?.id===layer.id?drop.placement:undefined} style={{'--layer-depth':depth} as React.CSSProperties} onClick={e=>{if(!(e.target as HTMLElement).closest('button,input,summary,details'))select(layer.id,e)}} draggable={!locked.all&&editing!==layer.id} onDragStart={e=>{drag.current=isSelected?selected:[layer.id];e.dataTransfer.setData('text/plain',drag.current.join(','));e.dataTransfer.effectAllowed='move'}} onDragOver={e=>{e.preventDefault();const b=e.currentTarget.getBoundingClientRect(),y=(e.clientY-b.top)/b.height;setDrop({id:layer.id,placement:layer.type==='group'&&y>.25&&y<.75?'inside':y<.5?'before':'after'});const area=list.current?.getBoundingClientRect();if(area&&list.current){if(e.clientY<area.top+28)list.current.scrollTop-=12;if(e.clientY>area.bottom-28)list.current.scrollTop+=12}}} onDragLeave={e=>{if(!e.currentTarget.contains(e.relatedTarget as Node))setDrop(null)}} onDrop={e=>{e.preventDefault();if(drop)onAction({type:'move',ids:drag.current,target:drop.id,placement:drop.placement},'Reorder layer tree');setDrop(null)}} onDragEnd={()=>setDrop(null)}>
          <button type="button" className="lp-eye" aria-label={`${layer.visible?'Hide':'Show'} layer ${eyeLabel ? eyeLabel(layer, rows.indexOf(rows.find(row => row.layer.id === layer.id)!)) : layer.name}`} title={layer.visible?'Hide layer':'Show layer'} disabled={locked.all} onClick={()=>onAction({type:'patch',ids:[layer.id],patch:{visible:!layer.visible}},'Toggle layer visibility')}><Icon name="eye" />{!layer.visible&&<span className="lp-eye-slash" />}</button>
          <input type="checkbox" aria-label={`Select element ${layer.name}`} checked={isSelected} onChange={()=>{}} onClick={e=>{e.stopPropagation();select(layer.id,{...e,ctrlKey:!e.shiftKey||e.ctrlKey||e.metaKey})}} />
          <button type="button" className="lp-thumbnail" aria-label={`Select layer ${layer.name}`} onClick={e=>select(layer.id,e)}>{renderThumbnail(layer)}</button>
          <div className="lp-row-content"><div className="lp-name-line">{layer.type==='group'&&<button type="button" className={`lp-chevron${open?' is-open':''}`} aria-label={`${open?'Collapse':'Expand'} ${layer.name}`} aria-expanded={open} onClick={event=>{const ids=event.altKey?[layer.id,...descendants(state,layer.id).filter(id=>state.nodes.find(node=>node.id===id)?.type==='group')]:[layer.id];setExpanded(ids,!open)}}><Icon name="chevron" /></button>}{layer.type==='group'&&<span className="lp-folder"><Icon name="group" /></span>}{editing===layer.id?<input autoFocus aria-label="Layer name" value={draft} onChange={e=>setDraft(e.target.value)} onBlur={finishRename} onKeyDown={e=>{e.stopPropagation();if(e.key==='Enter')finishRename();if(e.key==='Escape')setEditing(null)}}/>:<button type="button" className="lp-name" onClick={e=>select(layer.id,e)} onDoubleClick={()=>rename(layer)} title="Double-click to rename">{layer.name}</button>}<button type="button" className="lp-rename" aria-label={`Rename ${layer.name}`} disabled={locked.all} onClick={()=>rename(layer)}>✎</button></div>
            {layer.role && <span className={`lp-role-tag ${layer.roleSuggested ? 'is-suggested' : ''}`}>{({headline:'Headline',supporting:'Body',offer:'Offer',price:'Price',logo:'Logo',product:'Key visual',cta:'Contact',legal:'Legal',regulatory:'Regulatory',bg:'Background',stamp:'Stamp',border:'Border',ignore:'Decorative',other:'Other',unassigned:'Unassigned'})[layer.role] || roleLabel(layer.role)}{layer.roleSuggested ? '?' : ''}</span>}
            <small>{layer.linkId||layer.sourceLink?'Linked · ':''}{layer.role?roleLabel(layer.role):layer.type} · {layer.sourceKind==='vector-word'?'Embedded Illustrator vector':layer.sourceKind==='raster-piece'?'raster':layer.sourceKind==='smart'?'Smart object pixels':layer.type}{layer.fontStatus?` · Font: ${layer.requestedFont || ''} · ${layer.fontStatus === 'outlined' ? 'text outlined, not editable · Needs review' : layer.fontStatus === 'missing' ? 'missing · Needs review' : layer.fontStatus}`:''}{layer.empty?' · empty transparent layer':''}{hasChildren?' · folder':''}{locked.all||locked.position||locked.pixels?' · locked':''}</small>
            {(layer.mask||layer.fx?.stroke?.enabled||layer.importedEffects)&&<details className="lp-submenu"><summary>fx / masks</summary>{layer.mask&&<button type="button" onClick={()=>{onSelect([layer.id]);setInspector('mask')}}>▣ {layer.mask.kind==='bitmap'?'Imported mask':'Vector mask'} · {layer.mask.linked?'linked':'unlinked'}</button>}{layer.fx?.stroke?.enabled&&<button type="button" onClick={()=>{onSelect([layer.id]);setInspector('fx')}}>fx Inner stroke</button>}{Object.entries(layer.importedEffects||{}).filter(([,v])=>v&&typeof v==='object').map(([name])=><small key={name}>fx {name} · imported source</small>)}</details>}
          </div>
        </div>
      })}
      {!rows.length&&<p className="lp-empty">No matching layers.</p>}
    </div>
    <footer className="lp-footer" role="toolbar" aria-label="Layer actions">{[
      ['link',linked?'Unlink selected layers':'Link selected layers',!canLink,onLink],
      ['fx','Layer styles',!selectedLayer||selectedLayer.type==='adjustment'||disabledPixels,()=>setInspector(inspector==='fx'?null:'fx')],
      ['mask','Add layer mask',!selectedLayer||disabledAlpha,addMask],
      ['adjustment','Add adjustment layer',locks.some(l=>l.all),()=>create('adjustment')],
      ['group','Create group',!picked.length||locks.some(l=>l.all||l.artboards),()=>{const id=crypto.randomUUID();onAction({type:'group',ids:selected,id},'Create layer group');onSelect([id])}],
      ['new','Create new layer',locks.some(l=>l.all),()=>create('pixel')],
      ['delete','Delete layer',!picked.length||locks.some(l=>l.all),()=>{onAction({type:'delete',ids:selected},'Delete layers');onSelect([])}],
    ].map(([icon,label,disabled,fn])=><button key={label as string} type="button" aria-label={label as string} title={disabled ? `${label}. Available when the selection supports it.` : label as string} aria-pressed={icon==='link'?linked:undefined} disabled={disabled as boolean} onClick={fn as ()=>void}><Icon name={icon as string}/></button>)}</footer>
    {selectedLayer?.type==='adjustment'&&<fieldset className="lp-inspector"><legend>Brightness / Contrast</legend>{(['brightness','contrast'] as const).map(key=><label key={key}>{key}<input type="range" aria-label={`Adjustment ${key}`} min={-100} max={100} value={selectedLayer.adjustment?.[key]||0} onChange={e=>patch({adjustment:{brightness:0,contrast:0,...selectedLayer.adjustment,[key]:Number(e.target.value)}},`Adjust ${key}`)} disabled={disabledPixels}/><output>{selectedLayer.adjustment?.[key]||0}</output></label>)}</fieldset>}
    {inspector==='fx'&&selectedLayer&&<fieldset className="lp-inspector" disabled={disabledPixels}><legend>Layer styles · inner stroke</legend><label><input type="checkbox" aria-label="Enable inner stroke" checked={stroke.enabled} onChange={e=>updateStroke({enabled:e.target.checked})}/>Enable</label><label>Colour<input type="color" aria-label="Inner stroke color" value={stroke.color} onChange={e=>updateStroke({color:e.target.value})}/></label><label>Width (source px)<input type="number" aria-label="Inner stroke width" min={1} max={30} value={stroke.width} onChange={e=>updateStroke({width:Math.max(1,Math.min(30,Number(e.target.value)))})}/></label><small>Fill affects source pixels; opacity affects pixels and this style. Imported baked styles remain part of the source.</small></fieldset>}
    {inspector==='mask'&&selectedLayer?.mask&&<fieldset className="lp-inspector" disabled={disabledAlpha}><legend>Layer mask</legend><label><input type="checkbox" aria-label="Enable layer mask" checked={selectedLayer.mask.enabled} onChange={e=>patch({mask:{...selectedLayer.mask!,enabled:e.target.checked}},'Toggle mask')}/>Enabled</label><button type="button" onClick={()=>patch({mask:{...selectedLayer.mask!,linked:!selectedLayer.mask!.linked}},'Link / unlink mask')}>{selectedLayer.mask.linked?'Unlink mask':'Link mask'}</button>{selectedLayer.mask.kind==='path'&&(['x','y','w','h'] as const).map(key=><label key={key}>Mask {key} (%)<input type="number" aria-label={`Mask ${key} (%)`} value={Math.round((selectedLayer.mask!.rect?.[key]??(key==='w'||key==='h'?1:0))*100)} onChange={e=>{const r={x:0,y:0,w:1,h:1,...selectedLayer.mask!.rect,[key]:Number(e.target.value)/100};patch({mask:{...selectedLayer.mask!,rect:r,pathData:`M${r.x} ${r.y}h${r.w}v${r.h}h${-r.w}Z`}},'Edit vector mask')}}/></label>)}<button type="button" onClick={()=>patch({mask:null},'Remove mask')}>Remove mask</button></fieldset>}
    <p className="lp-message" role="status">{message}</p>
  </section>
}

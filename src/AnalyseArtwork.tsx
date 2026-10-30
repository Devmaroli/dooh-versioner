import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import './analyse.css'
import { splitSourceWords } from './words.js'
import { detectSourceBorder, borderInterior } from './border.js'
import { allLayers, drawSourceLayers, unionBounds, selectLayers, linkLayers, unlinkLayers, setLayerVisibility } from './artwork.js'
import { backgroundCrop, invalidateBackground, rectangleBetween } from './background.js'

type Rect = { x: number; y: number; w: number; h: number }
type Layer = { id: string; name?: string; kind?: string; hidden?: boolean; box?: number[]; px?: HTMLCanvasElement; children?: Layer[] }
type Region = Rect & { layerId: string; scope?: string }
type Constraint = { required: boolean; anchor: string; orientation: string; margin?: number; protectedLogo?: boolean }
type Art = {
  a: { w: number; h: number; layers: Layer[]; composite?: HTMLCanvasElement; source?: { format?: string } }
  an: { roles: { id: string; role: string; why?: string; confidence?: number }[] }
  backgroundRegion?: Region | null
  layerConstraints?: Record<string, Constraint>
  wordPieces?: { id: string; parentId: string; name: string; crop: Rect }[]
  originalBorder?: any
  layerCrops?: Record<string, Rect>
  layerVisibility?: Record<string, boolean>
  layerLinks?: { id: string; layerIds: string[] }[]
  previewSettings?: { alpha?: boolean; color?: string }
}
const TAGS = [
  ['unassigned', 'Not sure / ask me later'], ['headline', 'Main headline'], ['offer', 'Offer / secondary message'],
  ['logo', 'Brand logo'], ['product', 'Product / key visual'], ['bg', 'Original background texture'],
  ['price', 'Price'], ['stamp', 'Campaign stamp / label'], ['border', 'Original border (separate layer)'], ['ignore', 'Do not adapt / decorative'], ['legal', 'Legal / fine print'], ['cta', 'Contact / call to action'],
] as const

function LayerThumbnail({ layer }: { layer: Layer }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current, source = layer.px
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (!source || !source.width || !source.height) return
    const region = (layer as any).crop, sourceBox = (layer as any).sourceBox || layer.box
    if (region && sourceBox) {
      const scale = Math.min(canvas.width / region.w, canvas.height / region.h), w = region.w * scale, h = region.h * scale
      ctx.drawImage(source, (region.x - sourceBox[0]) * source.width / sourceBox[2], (region.y - sourceBox[1]) * source.height / sourceBox[3], region.w * source.width / sourceBox[2], region.h * source.height / sourceBox[3], (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
    } else {
      const scale = Math.min(canvas.width / source.width, canvas.height / source.height), w = source.width * scale, h = source.height * scale
      ctx.drawImage(source, (canvas.width - w) / 2, (canvas.height - h) / 2, w, h)
    }
  }, [layer])
  return <canvas ref={ref} width={80} height={56} className="layer-thumbnail" aria-hidden="true" />
}

export function LayerTagger({ art, onChange }: { art: Art; onChange: () => void }) {
  const layers = useMemo(() => allLayers(art).filter(l => !l.children?.length && l.box && l.box[2] > 0 && l.box[3] > 0), [art, art.layerVisibility, art.layerCrops, art.wordPieces, art.layerConstraints])
  const [cursor, setCursor] = useState(0)
  const [selectedIds, setSelectedIds] = useState<string[]>([layers[0]?.id].filter(Boolean))
  const [extent, setExtent] = useState('layer')
  const [view, setView] = useState<'artwork' | 'layer'>('artwork')
  const [tool, setTool] = useState<'background' | 'border'>('background')
  const [sharedBorder, setSharedBorder] = useState(true)
  const [borderThickness, setBorderThickness] = useState(art.originalBorder?.thickness || 6)
  const [drawing, setDrawing] = useState(false)
  const [draft, setDraft] = useState<Rect | null>(null)
  const [message, setMessage] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const start = useRef<{ x: number; y: number; pointer: number } | null>(null)
  const layer = layers.find(l => l.id === selectedIds[selectedIds.length - 1]) || layers[Math.min(cursor, layers.length - 1)]
  const currentIndex = Math.max(0, layers.findIndex(l => l.id === layer?.id))
  const selectedLayers = layers.filter(l => selectedIds.includes(l.id))
  const bounds = view === 'layer' && extent === 'layer' ? unionBounds(selectedLayers, { x: 0, y: 0, w: art.a.w, h: art.a.h }) : { x: 0, y: 0, w: art.a.w, h: art.a.h }
  const preview = art.previewSettings || { alpha: true, color: '#ffffff' }
  const role = art.an.roles.find(r => r.id === layer?.id)
  const placement = (layer && art.layerConstraints?.[layer.id]) || {
    required: role?.role === 'headline' || role?.role === 'legal', anchor: role?.role === 'legal' ? 'nearest' : 'free', orientation: 'preserve',
  }
  const region = art.backgroundRegion
  const shownRegion = draft || region
  const canDraw = !layer?.logoProtected && !layer?.wordSourceId && selectedLayers.length === 1 && !!layer?.px && !layer.effectiveHidden && art.a.source?.format !== 'image'
  const assigned = layers.filter(l => art.an.roles.some(r => r.id === l.id && r.confidence === 1)).length

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Preview resolution is independent of the original-pixel selection coordinates.
    const scale = Math.min(1, 1600 / Math.max(bounds.w, bounds.h))
    canvas.width = Math.max(1, Math.round(bounds.w * scale))
    canvas.height = Math.max(1, Math.round(bounds.h * scale))
    const ctx = canvas.getContext('2d')!
    ctx.scale(canvas.width / bounds.w, canvas.height / bounds.h)
    ctx.translate(-bounds.x, -bounds.y)
    if (view === 'artwork' && art.a.composite && !Object.keys(art.layerVisibility || {}).length) ctx.drawImage(art.a.composite, 0, 0, art.a.w, art.a.h)
    else drawSourceLayers(ctx, view === 'artwork' ? layers : selectedLayers, view === 'layer' && selectedLayers.length === 1 && selectedLayers[0].splitIntoWords)
  }, [art, layers, selectedIds, view, bounds.x, bounds.y, bounds.w, bounds.h])

  function choose(index: number, modifiers = { ctrlKey: false, metaKey: false, shiftKey: false }) {
    setSelectedIds(selectLayers(selectedIds, index, layers, modifiers, cursor))
    setCursor(index); setDraft(null); setDrawing(false); start.current = null; setMessage('')
  }
  function updatePlacement(patch: Partial<Constraint>) {
    const next = { ...art.layerConstraints }
    for (const item of selectedLayers) next[item.id] = { required: false, anchor: 'free', orientation: 'preserve', ...next[item.id], ...patch }
    art.layerConstraints = next; invalidateBackground(art); onChange()
  }
  function assignRole(next: string) {
    const parentIds = selectedLayers.map(l => l.wordSourceId || l.id)
    const targets = next === 'logo' ? layers.filter(l => parentIds.includes(l.id)) : selectedLayers
    if (next === 'logo') {
      if ((art.wordPieces || []).some(p => parentIds.includes(p.parentId))) restoreWords()
      if (parentIds.includes(art.originalBorder?.sourceLayerId)) clearBorder()
      art.layerConstraints = { ...art.layerConstraints, ...Object.fromEntries(parentIds.map(id => [id, { required: false, anchor: 'free', orientation: 'preserve', ...art.layerConstraints?.[id], protectedLogo: true }])) }
    }
    for (const item of targets) {
      const current = art.an.roles.find(r => r.id === item.id)
      if (current) Object.assign(current, { role: next, why: 'Designer-confirmed layer tag', confidence: 1 })
      else art.an.roles.push({ id: item.id, role: next, why: 'Designer-confirmed layer tag', confidence: 1 })
      if (next !== 'bg' && art.backgroundRegion?.layerId === item.id) art.backgroundRegion = null
    }
    if (next === 'stamp') updatePlacement({ anchor: 'top', margin: 2 })
    if (next === 'legal') updatePlacement({ required: true, anchor: 'nearest' })
    invalidateBackground(art); onChange()
  }
  function visibility(ids: string[], visible: boolean) {
    setLayerVisibility(art, ids, visible)
    invalidateBackground(art); onChange()
  }
  function updatePreview(patch: Partial<typeof preview>) { art.previewSettings = { ...preview, ...patch }; onChange() }
  function linkSelection() {
    art.layerLinks = linkLayers(art.layerLinks || [], selectedIds, crypto.randomUUID())
    invalidateBackground(art); setMessage('All selected layers are linked. They move and scale together in calibration and batch outputs.'); onChange()
  }
  function unlinkSelection() {
    art.layerLinks = unlinkLayers(art.layerLinks || [], selectedIds)
    invalidateBackground(art); setMessage('Selected layers unlinked.'); onChange()
  }
  function separateWords() {
    if (selectedLayers.length !== 1 || !layer.px || layer.logoProtected) return
    try {
      const boxes = splitSourceWords(layer)
      const pieces = boxes.map((crop, index) => ({ id: crypto.randomUUID(), parentId: layer.id, name: `Word ${index + 1} · source pixels`, crop }))
      art.wordPieces = [...(art.wordPieces || []).filter(p => p.parentId !== layer.id), ...pieces]
      const nextConstraints = { ...art.layerConstraints }
      for (const piece of pieces) {
        art.an.roles.push({ id: piece.id, role: role?.role === 'headline' ? 'headline' : 'other', confidence: 1, why: 'Designer-requested source-pixel word separation' })
        nextConstraints[piece.id] = { required: true, anchor: 'free', orientation: 'preserve' }
      }
      art.layerConstraints = nextConstraints
      art.layerLinks = (art.layerLinks || []).map(link => ({ ...link, layerIds: link.layerIds.flatMap(id => id === layer.id ? pieces.map(p => p.id) : [id]) }))
      setSelectedIds(pieces.map(p => p.id)); invalidateBackground(art); setMessage(`Separated ${pieces.length} source-pixel pieces. Inspect every word. These are original pixels, not editable vector text.`); onChange()
    } catch (error) { setMessage(error instanceof Error ? error.message : String(error)) }
  }
  function restoreWords() {
    const parents = new Set<string>(selectedLayers.map(l => String(l.wordSourceId || l.id))), removed = (art.wordPieces || []).filter(p => parents.has(p.parentId)).map(p => p.id)
    art.wordPieces = (art.wordPieces || []).filter(p => !removed.includes(p.id))
    art.an.roles = art.an.roles.filter(r => !removed.includes(r.id))
    art.layerConstraints = Object.fromEntries(Object.entries(art.layerConstraints || {}).filter(([id]) => !removed.includes(id)))
    art.layerLinks = unlinkLayers(art.layerLinks || [], removed)
    art.layerVisibility = Object.fromEntries(Object.entries(art.layerVisibility || {}).filter(([id]) => !removed.includes(id)))
    setSelectedIds([...parents]); invalidateBackground(art); setMessage('Original combined word artwork restored.'); onChange()
  }
  function beginSelection() {
    setTool('background'); setView('layer'); setDraft(null); setDrawing(true); setMessage('Drag across clean background texture. Avoid text, logos, objects and decorative edges.')
  }
  function point(event: PointerEvent<HTMLDivElement>) {
    const element = event.currentTarget.getBoundingClientRect()
    return { x: (event.clientX - element.left) / element.width * bounds.w + bounds.x, y: (event.clientY - element.top) / element.height * bounds.h + bounds.y }
  }
  function pointerDown(event: PointerEvent<HTMLDivElement>) {
    if (!drawing || event.button !== 0) return
    event.preventDefault()
    event.currentTarget.focus()
    event.currentTarget.setPointerCapture(event.pointerId)
    start.current = { ...point(event), pointer: event.pointerId }
    setDraft(null)
  }
  function pointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!start.current || event.pointerId !== start.current.pointer) return
    setDraft(rectangleBetween(start.current, point(event), bounds.w, bounds.h, bounds))
  }
  function pointerUp(event: PointerEvent<HTMLDivElement>) {
    if (!start.current || event.pointerId !== start.current.pointer) return
    const rect = rectangleBetween(start.current, point(event), bounds.w, bounds.h, bounds)
    start.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
    setDraft(rect.w >= 8 && rect.h >= 8 ? rect : null)
    setMessage(rect.w >= 8 && rect.h >= 8 ? 'Check the outlined area, then confirm the selection below.' : 'Select an area at least 8 × 8 source pixels.')
  }
  function cancelSelection() {
    start.current = null; setDrawing(false); setDraft(null); setMessage('Selection cancelled. Your saved background area is unchanged.')
  }
  function applySelection() {
    if (!draft || !layer.px) return
    const cropped = backgroundCrop({ ...draft, layerId: layer.id, scope: extent === 'layer' ? 'layer' : 'artboard' }, layer, art.a.w, art.a.h)
    if (!cropped || cropped.w < 8 || cropped.h < 8) { setMessage('This area does not contain enough pixels from the selected layer.'); return }
    const region: Region = { ...cropped, layerId: layer.id, scope: extent === 'layer' ? 'layer' : 'artboard' }
    // Verify opaque source pixels; transparent samples would create holes in the output.
    const probe = document.createElement('canvas'); probe.width = 64; probe.height = 64
    const ctx = probe.getContext('2d')!, [x, y, w, h] = layer.box!
    ctx.drawImage(layer.px, (region.x - x) * layer.px.width / w, (region.y - y) * layer.px.height / h, region.w * layer.px.width / w, region.h * layer.px.height / h, 0, 0, 64, 64)
    const pixels = ctx.getImageData(0, 0, 64, 64).data
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] < 250) { setMessage('This patch includes transparency. Select an opaque area of the background layer.'); return }
    assignRole('bg')
    art.backgroundRegion = region; invalidateBackground(art)
    setDraft(null); setDrawing(false); setMessage('Background area saved. Adaptations now sample only this patch.'); onChange()
  }
  function beginBorder() {
    if (layer.logoProtected || !['headline','offer','legal','cta','border'].includes(role?.role || '')) return
    setTool('border'); setView('layer'); setExtent('layer'); setDraft(null); setDrawing(true)
    setMessage('Trace the existing rectangular border on this layer. Dark source pixels must be present on all four sides.')
  }
  function clearBorder() {
    const previous = art.originalBorder
    if (!previous) return
    const crops = { ...art.layerCrops }
    if (previous.previousCrop) crops[previous.sourceLayerId] = previous.previousCrop
    else delete crops[previous.sourceLayerId]
    art.layerCrops = crops
    if (!previous.shared && previous.previousRole) Object.assign(art.an.roles.find(r => r.id === previous.sourceLayerId)!, previous.previousRole)
    art.originalBorder = null; invalidateBackground(art); onChange()
  }
  function applyBorder() {
    if (!draft || !layer.px || layer.logoProtected) return
    const rect = backgroundCrop({ ...draft, layerId: layer.id, scope: 'layer' }, layer, art.a.w, art.a.h)
    if (!rect) return
    const color = detectSourceBorder(layer, rect)
    if (!color) { setMessage('No continuous dark border found on all four sides. Select its source layer and trace the original outline more closely.'); return }
    const crop = sharedBorder ? borderInterior(layer, rect, borderThickness) : null
    if (sharedBorder && !crop) { setMessage('No interior content was found. Turn off the shared-content option for a separate border-only layer.'); return }
    const previousCrop = art.originalBorder?.sourceLayerId === layer.id ? art.originalBorder.previousCrop : art.layerCrops?.[layer.id] || null
    const previousRole = { ...art.an.roles.find(r => r.id === layer.id) }
    if (art.originalBorder?.sourceLayerId && art.originalBorder.sourceLayerId !== layer.id) clearBorder()
    art.originalBorder = { sourceLayerId: layer.id, sourceRect: rect, color, thickness: borderThickness, margin: 4, shared: sharedBorder, previousCrop, previousRole }
    if (crop) art.layerCrops = { ...art.layerCrops, [layer.id]: crop }
    else assignRole('border')
    invalidateBackground(art); setDrawing(false); setDraft(null); setMessage('Original border rebuilt. Its vector frame scales to each target; the stamp stays above it.'); onChange()
  }
  function clearSelection() {
    art.backgroundRegion = null; invalidateBackground(art)
    setDraft(null); setDrawing(false); setMessage('Background area cleared. The engine will use its original background detection.'); onChange()
  }
  const overlayStyle = (rect: Rect) => ({ left: `${(rect.x - bounds.x) / bounds.w * 100}%`, top: `${(rect.y - bounds.y) / bounds.h * 100}%`, width: `${rect.w / bounds.w * 100}%`, height: `${rect.h / bounds.h * 100}%` })
  const layerBounds = layer?.box && backgroundCrop({ layerId: layer.id, x: 0, y: 0, w: art.a.w, h: art.a.h }, layer, art.a.w, art.a.h)

  if (art.a.source?.format === 'image' || !layers.length) return <p>No editable layers were detected. A flattened image needs a layered PSD for individual tagging.</p>
  return <section className="analyse-editor" aria-label="Layer identification">
    <div className="analyse-main">
      {!art.an.roles.some(r => r.role === 'headline') && <p className="analyse-attention" role="status">Main headline not identified. Select its original layers and tag them Main headline. The offer will stay secondary.</p>}
      <div className="analyse-toolbar">
        <div className="analyse-view" aria-label="Preview mode">
          <button type="button" aria-pressed={view === 'artwork'} onClick={() => { setView('artwork'); setDrawing(false); setDraft(null) }}>Full artwork</button>
          <button type="button" aria-pressed={view === 'layer'} onClick={() => setView('layer')}>Selected layer</button>
        </div>
        <span>{bounds.w} × {bounds.h} px · Origin {bounds.x}, {bounds.y}</span>
        {view === 'layer' && <label>View bounds<select aria-label="View bounds" value={extent} onChange={e => { setExtent(e.target.value); cancelSelection() }}><option value="layer">Entire selected layers</option><option value="artboard">Original artboard</option></select></label>}
        <label><input type="checkbox" checked={preview.alpha !== false} onChange={e => updatePreview({ alpha: e.target.checked })} />Alpha checkerboard</label>
        <label>Preview color<input type="color" aria-label="Preview background color" value={preview.color || '#ffffff'} onChange={e => updatePreview({ color: e.target.value, alpha: false })} /></label>
        <button type="button" className="ghost" disabled={!canDraw} aria-pressed={drawing && tool === 'background'} onClick={beginSelection}>Draw background area</button><button type="button" className="ghost" disabled={!canDraw || layer.logoProtected || !['headline','offer','legal','cta','border'].includes(role?.role || '')} onClick={beginBorder}>Trace original border</button>
      </div>
      <div className="analyse-artboard-well">
        <div className={`analyse-artboard ${drawing ? 'is-drawing' : ''}`} style={{ aspectRatio: `${bounds.w} / ${bounds.h}`, width: `min(100%, ${65 * bounds.w / bounds.h}vh)`, background: preview.alpha === false ? preview.color || '#ffffff' : undefined }}
          tabIndex={0} role="group" aria-label="Artwork background selection" aria-describedby="background-help"
          onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp}
          onPointerCancel={cancelSelection} onLostPointerCapture={() => { start.current = null }}
          onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); cancelSelection() } }}>
          {view === 'layer' && extent === 'layer' && <div className="original-artboard-bounds" style={overlayStyle({ x: 0, y: 0, w: art.a.w, h: art.a.h })}><span>{art.a.w} × {art.a.h} artboard</span></div>}
          <canvas ref={canvasRef} aria-label={view === 'artwork' ? 'Original artwork' : `Selected layer: ${layer.name}`} />
          {!drawing && !draft && layerBounds && <div className="selected-layer-bounds" style={overlayStyle(layerBounds)}><span>Selected layer</span></div>}
          {shownRegion && (draft || view === 'artwork' || region?.layerId === layer.id) && <div className={`background-marquee ${draft ? 'is-draft' : ''}`} style={overlayStyle(shownRegion)}><span>{draft ? tool === 'border' ? 'Original border trace' : 'New background area' : 'Reusable background'}</span></div>}
        </div>
      </div>
      <div className="background-selection-controls">
        <div><strong>Reusable background</strong><p id="background-help">Pick the background layer on the right, then draw over clean texture. Entire selected layers reveals off-artboard pixels. Choose one visible background layer to draw a reusable patch.</p></div>
        <div className="background-actions">
          {draft && (tool === 'background' ? <button type="button" onClick={applySelection}>Use this background area</button> : <button type="button" onClick={applyBorder}>Use original border</button>)}
          {(drawing || draft) && <button type="button" className="ghost" onClick={cancelSelection}>Cancel selection</button>}
          {region && <button type="button" className="ghost" onClick={clearSelection}>Clear background area</button>}
        </div>
        <div role="status" className="background-status">{message || (region ? `Saved area: ${region.w} × ${region.h} px at ${region.x}, ${region.y}.` : 'No background area selected.')}</div>
        {((drawing && tool === 'border') || art.originalBorder) && <div className="border-options"><label>Border thickness (source px)<input type="number" min={1} max={40} value={art.originalBorder?.thickness ?? borderThickness} onChange={e => { const value = Math.max(1, Math.min(40, Number(e.target.value))); setBorderThickness(value); if (art.originalBorder) { art.originalBorder = { ...art.originalBorder, thickness: value }; invalidateBackground(art); onChange() } }} /></label>{drawing && tool === 'border' && <label><input type="checkbox" checked={sharedBorder} onChange={e => setSharedBorder(e.target.checked)} />Border shares this layer with headline/content — keep and trim the interior</label>}{art.originalBorder && <button type="button" className="ghost" onClick={clearBorder}>Restore original raster border</button>}<small>Rebuilds a source-verified rectangle only. Shared content keeps its original pixels; the old outline is removed non-destructively. Stroke width scales with the target short side.</small></div>}
        {(drawing || draft) && <div className="background-coordinates" aria-label="Background area coordinates">
          {(['x', 'y', 'w', 'h'] as const).map(key => <label key={key}>{({ x: 'X', y: 'Y', w: 'Width', h: 'Height' })[key]}<input type="number" min={key === 'x' ? bounds.x : key === 'y' ? bounds.y : 0} max={key === 'x' ? bounds.x + bounds.w : key === 'y' ? bounds.y + bounds.h : key === 'w' ? bounds.w : bounds.h} value={draft?.[key] ?? 0} onChange={e => setDraft({ ...(draft || { x: 0, y: 0, w: 0, h: 0 }), [key]: Number(e.target.value) })} /></label>)}
          <small>Original pixels · Escape cancels · Selection uses layer pixels; PSD adjustments may differ from the composite.</small>
        </div>}
      </div>
      <div className="analyse-inspector">
        <div className="tagger-visual"><LayerThumbnail layer={layer} /><div><strong>{layer.name || 'Unnamed layer'}</strong><small>{layer.kind || 'Layer'} · {layer.box?.[2]} × {layer.box?.[3]} px · Position {layer.box?.[0]}, {layer.box?.[1]}</small></div></div>
        <div className="tagger-question"><h3>{selectedLayers.length > 1 ? `Identify ${selectedLayers.length} selected layers` : 'What is this layer?'}</h3><p>{role?.confidence === 1 ? 'Confirmed' : 'Suggested'}: {TAGS.find(t => t[0] === role?.role)?.[1] || 'Not identified'}</p>
          <div className="tag-options">{TAGS.map(([id, label]) => <button type="button" key={id} disabled={!selectedIds.length} className={selectedLayers.every(l => art.an.roles.find(r => r.id === l.id)?.role === id) ? 'chosen' : ''} aria-pressed={selectedLayers.length > 0 && selectedLayers.every(l => art.an.roles.find(r => r.id === l.id)?.role === id)} onClick={() => assignRole(id)}>{label}</button>)}</div>
          <div className="analyse-selection-actions"><span>{selectedIds.length} selected · Ctrl/Cmd-click to add · Shift-click for a range</span><button type="button" className="ghost" disabled={selectedLayers.length !== 1 || !layer?.px || layer.wordSourceId || layer.splitIntoWords || layer.logoProtected || role?.role !== 'headline'} onClick={separateWords}>Separate words (source pixels)</button><button type="button" className="ghost" disabled={!selectedLayers.some(l => l.wordSourceId || l.splitIntoWords)} onClick={restoreWords}>Restore combined words</button><button type="button" className="ghost" disabled={selectedIds.length < 2 || selectedLayers.some(l => art.an.roles.find(r => r.id === l.id)?.role === 'bg')} onClick={linkSelection}>Link selected</button><button type="button" className="ghost" disabled={!(art.layerLinks || []).some(link => link.layerIds.some(id => selectedIds.includes(id)))} onClick={unlinkSelection}>Unlink selected</button><button type="button" className="ghost" disabled={!selectedIds.length} onClick={() => visibility(selectedIds, true)}>Show selected</button><button type="button" className="ghost" disabled={!selectedIds.length} onClick={() => visibility(selectedIds, false)}>Hide selected</button></div>
          <label className="logo-protection"><input type="checkbox" checked={selectedLayers.some(l => l.logoProtected)} disabled={selectedLayers.some(l => art.an.roles.find(r => r.id === l.id)?.role === 'logo')} onChange={e => {
            const ids = selectedLayers.map(l => l.wordSourceId || l.id)
            if (e.target.checked) { if ((art.wordPieces || []).some(p => ids.includes(p.parentId))) restoreWords(); if (ids.includes(art.originalBorder?.sourceLayerId)) clearBorder() }
            art.layerConstraints = { ...art.layerConstraints, ...Object.fromEntries(ids.map(id => [id, { required: false, anchor: 'free', orientation: 'preserve', ...art.layerConstraints?.[id], protectedLogo: e.target.checked }])) }; invalidateBackground(art); onChange()
          }} />Contains a logo — preserve as one</label>
          <div className="edge-placement"><label><input type="checkbox" checked={placement.anchor !== 'free'} disabled={!selectedIds.length} onChange={e => updatePlacement({ anchor: e.target.checked ? 'nearest' : 'free' })} />Keep to edge</label>{placement.anchor !== 'free' && <><label>Edge<select aria-label="Edge" value={placement.anchor} onChange={e => updatePlacement({ anchor: e.target.value })}>{[['nearest', 'Nearest original edge'], ['top', 'Top'], ['bottom', 'Bottom'], ['left', 'Left'], ['right', 'Right'], ['locked', 'Locked relative position']].map(([id, text]) => <option key={id} value={id}>{text}</option>)}</select></label><label>Edge margin (% of short side)<input type="number" min={0} max={20} step={.5} value={placement.margin ?? 2} onChange={e => updatePlacement({ margin: Math.max(0, Math.min(20, Number(e.target.value))) })} /></label></>}</div>
          <details className="analyse-preservation"><summary>Placement & preservation</summary><div className="layer-behavior">
            <label><input type="checkbox" checked={placement.required} onChange={e => updatePlacement({ required: e.target.checked })} />Required in every adaptation</label>
            <label>Position<select value={placement.anchor} onChange={e => updatePlacement({ anchor: e.target.value })}>{[['free', 'Adapt freely'], ['nearest', 'Stay near original edge'], ['top', 'Top edge'], ['right', 'Right edge'], ['bottom', 'Bottom edge'], ['left', 'Left edge'], ['locked', 'Keep original position']].map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            <label>Orientation<select value={placement.orientation} onChange={e => updatePlacement({ orientation: e.target.value })}><option value="preserve">Preserve original</option><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option></select></label>
            <small>Edge placement applies to every role in calibration and batch layouts. Raster text retains its original orientation.</small>
          </div></details>
          <div className="tagger-controls"><button type="button" className="ghost" disabled={currentIndex === 0} onClick={() => choose(currentIndex - 1)}>← Previous</button><span>{currentIndex + 1} of {layers.length}</span><button type="button" className="ghost" disabled={currentIndex === layers.length - 1} onClick={() => choose(currentIndex + 1)}>Next →</button></div>
        </div>
      </div>
    </div>
    <aside className="analyse-layers" aria-label="Artwork layers">
      <div className="analyse-layers-heading"><h2>Layers</h2><span>{assigned} / {layers.length} confirmed</span></div>
      <div className="analyse-layer-list">{layers.map((item, index) => <div key={item.id} className="analyse-layer-row">
        <input type="checkbox" aria-label={`Select ${item.name}`} checked={selectedIds.includes(item.id)} onChange={() => choose(index, { ctrlKey: true, metaKey: false, shiftKey: false })} />
        <button type="button" aria-pressed={selectedIds.includes(item.id)} className={`analyse-layer ${selectedIds.includes(item.id) ? 'selected' : ''} ${item.effectiveHidden ? 'is-hidden' : ''}`} onClick={e => choose(index, e)}>
          <LayerThumbnail layer={item} /><span className="analyse-layer-label"><strong>{item.name || 'Unnamed layer'}</strong><small>{TAGS.find(t => t[0] === art.an.roles.find(r => r.id === item.id)?.role)?.[1] || 'Unassigned'}{region?.layerId === item.id ? ' · Background area saved' : ''}{art.layerLinks?.some(link => link.layerIds.includes(item.id)) ? ' · Linked' : ''}</small></span>
        </button>
        <button type="button" className="layer-eye ghost" aria-label={`${item.effectiveHidden ? 'Show' : 'Hide'} layer ${index + 1}`} title={item.effectiveHidden ? 'Show layer' : 'Hide layer'} onClick={() => visibility([item.id], item.effectiveHidden)}>{item.effectiveHidden ? 'Show' : 'Hide'}</button>
      </div>)}</div>
    </aside>
  </section>
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { zipSync } from 'fflate'
import { DEFAULT_ON, SCREENS } from './data/presets.js'
import Adapt from './engine/adapt.js'
import {
  ARTS,
  SHEET,
  importPsdBuffer,
  importRasterCanvas,
  importSvgText,
  loadSamplePsd,
  loadSampleSvg,
  masterFor,
  renderFull,
  renderTile,
  removeMaster,
} from './engine/render.js'

type Row = (typeof SHEET)[number]
type Screen = (typeof SCREENS)[number]

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('image failed'))
    img.src = url
  })
}

function TileView({
  row,
  screen,
  maxW,
  maxH,
  onClick,
}: {
  row: Row
  screen: Screen
  maxW: number
  maxH: number
  onClick?: () => void
}) {
  const host = useRef<HTMLDivElement>(null)
  const master = masterFor(screen, row)
  useEffect(() => {
    const el = host.current
    if (!el) return
    el.replaceChildren()
    const { c } = renderTile(row, screen, maxW, maxH)
    el.appendChild(c)
  })
  const body = (
    <>
      <div ref={host} />
      <div className="cap">
        {row.lang} · {screen.name} {screen.w}×{screen.h}
        {master ? ` · ${master.name} (${master.lang || 'lang?'})` : ''}
      </div>
    </>
  )
  if (!onClick) return <div className="tile">{body}</div>
  return (
    <button type="button" className="tile" onClick={onClick}>
      {body}
    </button>
  )
}

type Artwork = (typeof ARTS)[number]
type ArtworkLayer = { id: string; name?: string; kind?: string; hidden?: boolean; box?: number[]; px?: HTMLCanvasElement; children?: ArtworkLayer[] }
const TAGS = [
  ['unassigned','Not sure / ask me later'],['headline','Main headline'],['offer','Offer / secondary message'],
  ['logo','Brand logo'],['product','Product / key visual'],['bg','Original background texture'],
  ['price','Price'],['ignore','Do not adapt / decorative'],['legal','Legal / fine print'],
  ['cta','Contact / call to action']
] as const
function leafLayers(layers: ArtworkLayer[]): ArtworkLayer[] {
  return layers.flatMap(layer=>layer.children?.length ? leafLayers(layer.children) : [layer])
}
function LayerPreview({layer}: {layer: ArtworkLayer}) {
  const ref=useRef<HTMLCanvasElement>(null)
  useEffect(()=>{
    const c=ref.current;if(!c)return
    const g=c.getContext('2d');if(!g)return
    g.clearRect(0,0,c.width,c.height)
    if(!layer.px)return
    const f=Math.min(c.width/layer.px.width,c.height/layer.px.height)
    const w=layer.px.width*f,h=layer.px.height*f
    g.drawImage(layer.px,(c.width-w)/2,(c.height-h)/2,w,h)
  },[layer])
  return <canvas ref={ref} width={240} height={135} className="layer-preview" aria-label={layer.name||'Layer preview'}/>
}
function LayerTagger({art,onChange}: {art:Artwork;onChange:()=>void}) {
  const layers=useMemo(()=>leafLayers(art.a.layers as ArtworkLayer[]).filter(l=>!l.hidden&&!!l.box),[art])
  const [cursor,setCursor]=useState(0)
  const [details,setDetails]=useState<Record<string,{required:boolean;anchor:string;orientation:string}>>({})
  useEffect(()=>setCursor(0),[art])
  const layer=layers[Math.min(cursor,Math.max(0,layers.length-1))]
  const role=art.an.roles.find((r:{id:string;role:string})=>r.id===layer?.id)
  const placement=layer ? (details[layer.id]||{required:role?.role==='headline'||role?.role==='legal',anchor:role?.role==='legal'?'nearest':'free',orientation:'preserve'}) : {required:false,anchor:'free',orientation:'preserve'}
  function updatePlacement(patch:Partial<typeof placement>){if(!layer)return;const next={...placement,...patch};setDetails(prev=>({...prev,[layer.id]:next}));const metadata=art as Artwork & {layerConstraints?:Record<string,typeof placement>};metadata.layerConstraints={...metadata.layerConstraints,[layer.id]:next};onChange()}
  const assigned=layers.filter(l=>art.an.roles.some((r:{id:string;role:string})=>r.id===l.id&&r.role!=='ignore'&&r.role!=='unassigned')).length
  function tag(next:string){
    if(!layer)return
    if(role){role.role=next;role.why='Designer-confirmed layer tag';role.confidence=1}
    else art.an.roles.push({id:layer.id,role:next,why:'Designer-confirmed layer tag',confidence:1})
    // Pixel units are cached by semantic role; changing a tag must rebuild them.
    delete (art as Artwork & {U?:unknown}).U
    delete (art as Artwork & {BG?:unknown}).BG
    if(next==='legal')updatePlacement({required:true,anchor:'nearest'});
    onChange()
    if(cursor<layers.length-1)setCursor(cursor+1)
  }
  if(!layers.length)return <p>No editable layers were detected. A flattened image needs a layered PSD for individual tagging.</p>
  return <section className="tagger" aria-label="Layer identification">
    <div className="tagger-heading"><div><h2>Help identify the artwork</h2><p>What is this layer? Your answer controls how the adaptation engine treats it.</p></div><span className="chip">{assigned} / {layers.length} classified</span></div>
    <div className="tagger-body"><div className="tagger-visual"><LayerPreview layer={layer}/><strong>{layer.name||'Unnamed layer'}</strong><small>{layer.kind||'Layer'} · {layer.box?.[2]} × {layer.box?.[3]} px</small></div>
      <div className="tagger-question"><h3>What is this layer?</h3><p>Suggested: <b>{role?.role||'Not identified'}</b> — confirm or correct it.</p>
        <div className="tag-options">{TAGS.map(([id,label])=><button key={id} type="button" className={role?.role===id?'chosen':''} onClick={()=>tag(id)}>{label}</button>)}</div>
        <div className="layer-behavior"><h4>Placement & preservation</h4><label><input type="checkbox" checked={placement.required} onChange={e=>updatePlacement({required:e.target.checked})}/> Required in every adaptation</label><label>Position<select value={placement.anchor} onChange={e=>updatePlacement({anchor:e.target.value})}><option value="free">Adapt freely</option><option value="nearest">Stay near original edge</option><option value="top">Top edge</option><option value="right">Right edge</option><option value="bottom">Bottom edge</option><option value="left">Left edge</option><option value="locked">Keep original position</option></select></label><label>Orientation<select value={placement.orientation} onChange={e=>updatePlacement({orientation:e.target.value})}><option value="preserve">Preserve original</option><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option></select></label><small>These preferences are recorded for the future constraint-based renderer; they do not yet reposition artwork.</small></div><div className="tagger-controls"><button className="ghost" type="button" disabled={cursor===0} onClick={()=>setCursor(cursor-1)}>← Previous</button><span>{cursor+1} of {layers.length}</span><button className="ghost" type="button" disabled={cursor===layers.length-1} onClick={()=>setCursor(cursor+1)}>Skip / Next →</button></div>
      </div></div>
    <div className="tagger-list">{layers.map((l,i)=><button type="button" key={l.id} className={i===cursor?'selected':''} onClick={()=>setCursor(i)}>{i+1}. {l.name||'Unnamed'} <span>{art.an.roles.find((r:{id:string;role:string})=>r.id===l.id)?.role||'unassigned'}</span></button>)}</div>
  </section>
}
export function App() {
  const [workspace, setWorkspace] = useState<'import' | 'analyse' | 'adapt' | 'review' | 'refine' | 'export'>('import')
  const [tick, setTick] = useState(0)
  const [query, setQuery] = useState('')
  const [analysisIndex,setAnalysisIndex] = useState(0)
  const [picked, setPicked] = useState<string[]>(DEFAULT_ON)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [focus, setFocus] = useState<{ row: Row; screen: Screen } | null>(null)

  const selected = useMemo(
    () => SCREENS.filter((screen) => picked.includes(screen.name)),
    [picked],
  )
  const visible = useMemo(
    () => SCREENS.filter((screen) => Adapt.screenMatchesFilter(screen, query)),
    [query],
  )

  async function takeFiles(files: FileList | File[]) {
    setErr('')
    try {
      for (const file of files) {
        setProgress(`Importing ${file.name}…`)
        const ext = (file.name.split('.').pop() || '').toLowerCase()
        if (ext === 'svg') importSvgText(await file.text(), file.name)
        else if (ext === 'psd' || ext === 'psb') importPsdBuffer(await file.arrayBuffer(), file.name)
        else if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp') {
          const url = URL.createObjectURL(file)
          try {
            const img = await loadImage(url)
            const canvas = document.createElement('canvas')
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            canvas.getContext('2d')?.drawImage(img, 0, 0)
            importRasterCanvas(canvas, file.name)
          } finally {
            URL.revokeObjectURL(url)
          }
        } else setErr(`Skipped ${file.name} (use PNG, JPG, SVG, or PSD)`)
      }
      setTick((n) => n + 1)
      setProgress('')
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
      setProgress('')
    }
  }

  async function exportZip() {
    setBusy(true)
    setErr('')
    try {
      const files: Record<string, Uint8Array> = {}
      for (const screen of selected) {
        for (const row of SHEET) {
          const canvas = renderFull(row, screen)
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
          if (!blob) continue
          const name = `${row.lang}_${screen.name.replace(/[^\w.-]+/g, '_')}_${screen.w}x${screen.h}.png`
          files[name] = new Uint8Array(await blob.arrayBuffer())
        }
      }
      const zipped = zipSync(files)
      const url = URL.createObjectURL(new Blob([zipped], { type: 'application/zip' }))
      const a = document.createElement('a')
      a.href = url
      a.download = 'dooh-versions.zip'
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <header>
        <b>DOOH Creative Studio</b>
        <nav className="workspace-tabs" aria-label="Creative workflow">{(['import','analyse','adapt','review','refine','export'] as const).map((step,i)=><button key={step} type="button" className={workspace===step?'active':''} onClick={()=>setWorkspace(step)} aria-current={workspace===step?'step':undefined}>{i+1} · {step[0].toUpperCase()+step.slice(1)}</button>)}</nav>
        <span className="chip">Creative Studio</span>
        <span className="spacer" />
        <button type="button" className="ghost" disabled={!selected.length || busy} onClick={exportZip}>
          {busy ? 'Exporting…' : 'Export PNG zip'}
        </button>
      </header>
      {workspace === "import" ? <section className="import-studio"><div className="import-heading"><span className="eyebrow">STEP 01 / CREATIVE PREPARATION</span><h1>Start with a great master.</h1><p>Bring English and Arabic artwork together. Check what was imported before adapting to any screen.</p></div><div className="import-columns"><div className="import-card import-upload" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {e.preventDefault(); if(e.dataTransfer.files.length) void takeFiles(e.dataTransfer.files)}}><div className="import-icon">↑</div><h2>Drop your creative masters</h2><p>PSD, PSB, SVG, PNG, JPG or WebP · Multiple files supported</p><label className="import-file-button">Choose artwork<input type="file" multiple accept=".png,.jpg,.jpeg,.webp,.svg,.psd,.psb" onChange={(e) => {if(e.target.files?.length) void takeFiles(e.target.files); e.target.value=""}} /></label><p className="import-tip">Tip: Name files with _EN or _AR to map languages automatically.</p><div className="sample-actions"><button type="button" className="ghost" onClick={() => {loadSampleSvg();setTick(n=>n+1)}}>Try sample SVG</button><button type="button" className="ghost" onClick={() => {loadSamplePsd();setTick(n=>n+1)}}>Try sample PSD</button></div></div><div className="import-card"><div className="import-card-top"><h2>Imported masters</h2><span className="chip">{ARTS.length} assets</span></div>{ARTS.length ? <div className="import-assets">{ARTS.map((art,i)=><div className="import-asset" key={i}><span className="asset-mark">▧</span><div><strong>{art.name}</strong><small>{art.a.w} × {art.a.h} px</small></div><span className={"chip "+(art.lang||"")}>{art.lang || "Unmapped"}</span><button type="button" className="remove-master" aria-label={`Remove ${art.name}`} title={`Remove ${art.name}`} onClick={()=>{if(window.confirm(`Remove ${art.name} and its generated previews?`)){removeMaster(i);setTick(n=>n+1)}}}>✕ Remove</button></div>)}</div> : <div className="import-empty">No artwork imported yet. Your files will appear here for review.</div>}<div className="import-checks"><h3>Preflight</h3><p>✓ Supported formats: PSD / PSB / SVG / raster</p><p>{ARTS.some(a=>a.lang==="EN")?"✓":"○"} English master {ARTS.some(a=>a.lang==="EN")?"detected":"not detected"}</p><p>{ARTS.some(a=>a.lang==="AR")?"✓":"○"} Arabic master {ARTS.some(a=>a.lang==="AR")?"detected":"not detected"}</p><small>Language is inferred from filenames; semantic layer detection is not yet available.</small></div></div></div>{progress&&<p role="status" className="progress-status">{progress}</p>}{err && <p className="err">{err}</p>}<div className="import-footer"><span>{ARTS.length ? `${ARTS.length} master(s) ready to preview` : "You can also continue with the built-in template"}</span><button type="button" onClick={() => setWorkspace("analyse")}>Continue to Analyse →</button></div></section> : <div className="studio-workspace"><section className="studio-intro"><span className="eyebrow">CREATIVE WORKFLOW / {workspace.toUpperCase()}</span><h1>{workspace==='analyse'?'Understand the original artwork':workspace==='adapt'?'Adapt to every screen':workspace==='review'?'Review every composition':workspace==='refine'?'Refine with original assets only':'Export selected creatives'}</h1><p>{workspace==='analyse'?'Inspect detected source masters and their languages before adapting.':workspace==='adapt'?'Select screens and inspect generated compositions.':workspace==='review'?'Open each preview to check hierarchy, clipping and readability.':workspace==='refine'?'Select a creative to inspect it. Automated layer editing is not available yet; no new artwork will be generated.':'Download PNG versions for the selected screens.'}</p>{workspace==='analyse'&&ARTS.length>0&&<div className="analysis-picker"><label htmlFor="artwork-to-tag">Artwork to analyse</label><select id="artwork-to-tag" value={Math.min(analysisIndex,ARTS.length-1)} onChange={e=>setAnalysisIndex(Number(e.target.value))}>{ARTS.map((art,i)=><option value={i} key={i}>{art.name}</option>)}</select><LayerTagger key={Math.min(analysisIndex,ARTS.length-1)} art={ARTS[Math.min(analysisIndex,ARTS.length-1)]} onChange={()=>setTick(n=>n+1)}/></div>}{workspace==='analyse'&&<div className="analysis-summary">{ARTS.map((art,i)=><div key={i} className="analysis-card"><strong>{art.name}</strong><span>{art.a.w} × {art.a.h} · {art.lang||'Language unknown'}</span><span>{art.an?.roles?.length||0} classified layer roles</span><span>{art.an?.warnings?.length||0} analysis warnings</span></div>)}</div>}{workspace==='export'&&<button type="button" disabled={!selected.length||busy} onClick={exportZip}>{busy?'Exporting…':'Export selected PNGs as ZIP'}</button>}<div className="workflow-actions"><button type="button" className="ghost" onClick={()=>setWorkspace('import')}>← Manage files</button><button type="button" onClick={()=>setWorkspace(workspace==='analyse'?'adapt':workspace==='adapt'?'review':workspace==='review'?'refine':'export')}>Next step →</button></div></section><div className="layout">
        <aside>
          <div
            className="drop"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              if (e.dataTransfer.files.length) void takeFiles(e.dataTransfer.files)
            }}
          >
            <b>Drop masters</b>
            <div>PNG, JPG, SVG, or PSD. Language comes from the filename suffix (_EN, _AR, عربي).</div>
            <input
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.webp,.svg,.psd,.psb"
              onChange={(e) => {
                if (e.target.files?.length) void takeFiles(e.target.files)
                e.target.value = ''
              }}
            />
            <div style={{ marginTop: 8, display: 'flex', gap: 6, justifyContent: 'center' }}>
              <button type="button" className="ghost" onClick={() => { loadSampleSvg(); setTick((n) => n + 1) }}>
                Sample SVG
              </button>
              <button type="button" className="ghost" onClick={() => { loadSamplePsd(); setTick((n) => n + 1) }}>
                Sample PSD
              </button>
            </div>
          </div>
          {err ? <p className="err">{err}</p> : null}
          <h2>Masters ({ARTS.length})</h2>
          <div className="masters" data-tick={tick}>
            {ARTS.length === 0 ? <div className="cap">No master yet. Tiles use the built-in template until you upload.</div> : null}
            {ARTS.map((art) => (
              <div className="master" key={art.name + art.a.w + String(art.lang)}>
                <div>{art.name}</div>
                <span className={'chip ' + (art.lang || '')}>{art.lang || 'no suffix'}</span>
                <span className="chip">
                  {art.a.w}×{art.a.h}
                </span>
              </div>
            ))}
          </div>
          <h2>Screens</h2>
          <input
            type="search"
            placeholder="Search name or size"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="screens">
            {visible.map((screen) => (
              <label key={screen.name + screen.w + screen.h}>
                <input
                  type="checkbox"
                  checked={picked.includes(screen.name)}
                  onChange={() =>
                    setPicked((cur) =>
                      cur.includes(screen.name) ? cur.filter((n) => n !== screen.name) : [...cur, screen.name],
                    )
                  }
                />
                <span>
                  {screen.name} {screen.w}×{screen.h}
                  {screen.kind === 'combined' ? ' · combined' : ''}
                </span>
              </label>
            ))}
          </div>
        </aside>
        <main>
          <div className="grid">
            {selected.map((screen) => (
              <div className="pair" key={screen.name}>
                <h3>
                  {screen.name} {screen.w}×{screen.h}
                </h3>
                <div className="tiles">
                  {SHEET.map((row) => (
                    <TileView
                      key={row.version_id}
                      row={row}
                      screen={screen}
                      maxW={300}
                      maxH={180}
                      onClick={() => setFocus({ row, screen })}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div></div>
      }
      {focus ? (
        <div className="focus" role="dialog" onClick={() => setFocus(null)}>
          <header onClick={(e) => e.stopPropagation()}>
            <b>
              {focus.screen.name} · {focus.row.lang}
            </b>
            <span className="spacer" />
            <button type="button" onClick={() => setFocus(null)}>
              Close
            </button>
          </header>
          <div className="stage" onClick={(e) => e.stopPropagation()}>
            <TileView row={focus.row} screen={focus.screen} maxW={1100} maxH={720} />
          </div>
        </div>
      ) : null}
    </>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { zipSync } from 'fflate'
import { Calibration } from './Calibration'
import { calibrationReady, screenProofKey, sourceSignature } from './layoutGuides.js'
import { LayerTagger } from './AnalyseArtwork'
import { availableRows, metadataFor, restoreMetadata, STEPS, validateFile, validateDimensions, workflowStatus } from './project.js'
import { readProject, saveProject } from './storage.js'
import { DEFAULT_ON, SCREENS } from './data/presets.js'
import Adapt from './engine/adapt.js'
import {
  ARTS,
  SHEET,
  SAMPLE_SVG,
  SAMPLE_PSD_B64,
  importPsdBuffer,
  importRasterCanvas,
  importSvgText,
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

function TileView({row,screen,maxW,maxH,onClick}:{row:Row;screen:Screen;maxW:number;maxH:number;onClick?:()=>void}) {
  const host=useRef<HTMLDivElement>(null),[renderError,setRenderError]=useState(''),master=masterFor(screen,row)
  useEffect(()=>{
    if(!host.current)return
    let active=true
    const {c,ready}=renderTile(row,screen,maxW,maxH);host.current.replaceChildren(c)
    ready?.then(()=>{if(active)setRenderError('')}).catch(error=>{if(active)setRenderError(error.message)})
    return()=>{active=false}
  })
  const body=<><div ref={host}/>{renderError&&<p role="alert">{renderError}</p>}<div className="cap">{row.lang} · {screen.name} {screen.w}×{screen.h}{master?` · ${master.name} (${master.lang||'lang?'})`:''}</div></>
  if(!onClick)return <div className="tile">{body}</div>
  const output=master?.calibration?.outputs?.[screenProofKey(screen)]
  return <div className="adaptation-tile"><button type="button" className="tile" aria-label={`Artwork ${screen.name} ${row.lang}; double-click to refine`} onDoubleClick={onClick} onClick={e=>{if(e.detail===0)onClick()}}>{body}</button><button type="button" className="ghost" onClick={onClick}>Refine {screen.name} {row.lang}</button>{output&&<small>{output.approved&&output.sourceSignature===sourceSignature(master)?'Refinement approved':'Refinement needs approval'}</small>}</div>
}

type Artwork = (typeof ARTS)[number]
export function App() {
  const [workspace, setWorkspace] = useState<'import' | 'analyse' | 'adapt' | 'review' | 'refine' | 'export'>('import')
  const [tick, setTick] = useState(0)
  const [batchActive, setBatchActive] = useState(false)
  const [query, setQuery] = useState('')
  const [analysisIndex,setAnalysisIndex] = useState(0)
  const [picked, setPicked] = useState<string[]>(DEFAULT_ON)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [transparentPng, setTransparentPng] = useState(false)
  const [exportFormat, setExportFormat] = useState<'png' | 'pdf' | 'psd'>('png')
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

  const importing = useRef(false)
  const cancelled = useRef(false)
  const sourceFiles = useRef(new Map<string, File>())
  const [importingNow, setImportingNow] = useState(false)
  const [restored, setRestored] = useState(false)
  const [recoveryFailed, setRecoveryFailed] = useState(false)
  const [saveStatus, setSaveStatus] = useState('Loading local project…')
  const rows = availableRows(ARTS, SHEET)
  const guidesReady = ARTS.length > 0 && ARTS.every(calibrationReady)

  async function importOne(file: File) {
    validateFile(file)
    const ext = file.name.split('.').pop()!.toLowerCase()
    setProgress(`Reading ${file.name}…`)
    const buffer = await file.arrayBuffer()
    if (cancelled.current) return null
    // Yield before synchronous PSD parsing; queued files can be stopped between imports.
    setProgress(`${ext === 'psd' || ext === 'psb' ? 'Parsing PSD and extracting layers' : 'Building preview'}: ${file.name}…`)
    await new Promise(resolve => setTimeout(resolve, 0))
    if (cancelled.current) return null
    if (ext === 'svg') importSvgText(new TextDecoder().decode(buffer), file.name)
    else if (ext === 'psd' || ext === 'psb') {
      if (buffer.byteLength < 26) throw new Error('This PSD is incomplete or corrupt.')
      const header = new DataView(buffer)
      validateDimensions(header.getUint32(18), header.getUint32(14))
      importPsdBuffer(buffer, file.name)
    }
    else {
      const url = URL.createObjectURL(file)
      try {
        const img = await loadImage(url)
        if (cancelled.current) return null
        validateDimensions(img.naturalWidth, img.naturalHeight)
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Not enough memory to prepare this image.')
        context.drawImage(img, 0, 0)
        importRasterCanvas(canvas, file.name)
      } finally { URL.revokeObjectURL(url) }
    }
    return ARTS[ARTS.length - 1]
  }

  async function takeFiles(files: FileList | File[]) {
    if (busy || importing.current || !restored) return
    importing.current = true; cancelled.current = false; setImportingNow(true); setErr('')
    const errors: string[] = []
    try {
      for (const file of Array.from(files)) {
        if (cancelled.current) break
        try {
          const art = await importOne(file)
          if (art) { sourceFiles.current.set(art.id, file); setTick(n => n + 1) }
        } catch (error) { errors.push(`${file.name}: ${error instanceof Error ? error.message : String(error)}`) }
      }
    } finally {
      importing.current = false; setImportingNow(false)
      setProgress(cancelled.current ? 'Stopped. Completed imports kept; remaining files were not imported.' : '')
      setErr(errors.join(' / '))
    }
  }

  async function sample(kind: 'svg' | 'psd') {
    const content = kind === 'svg' ? SAMPLE_SVG : Uint8Array.from(atob(SAMPLE_PSD_B64), c => c.charCodeAt(0))
    await takeFiles([new File([content], `sample.${kind}`)])
  }

  useEffect(() => {
    let alive = true
    void (async () => {
      try {
        const saved: any = await readProject()
        if (!alive) return
        if (saved && saved.version !== 1) throw new Error('This project was saved by an unsupported version.')
        if (saved) {
          const failures: string[] = []
          for (const item of saved.assets) {
            try {
              const art = await importOne(item.file)
              if (art) { restoreMetadata(art, item.metadata); sourceFiles.current.set(art.id, item.file) }
            } catch { failures.push(item.metadata.name) }
          }
          setPicked(saved.picked || DEFAULT_ON)
          if (failures.length) { setRecoveryFailed(true); setErr(`Could not restore: ${failures.join(', ')}. Saved project kept intact; autosave paused.`) }
        }
      } catch (error) { setRecoveryFailed(true); setErr(`Local recovery unavailable: ${String(error)}. Saved data kept intact; autosave paused.`) }
      finally { if (alive) { setProgress(''); setRestored(true); setTick(n => n + 1) } }
    })()
    return () => { alive = false }
  }, [])

  useEffect(() => {
    if (!restored || importingNow) return
    if (recoveryFailed) { setSaveStatus('Autosave paused after recovery failure'); return }
    setSaveStatus('Saving locally…')
    const timer = setTimeout(() => {
      void saveProject({ assets: ARTS.map(art => ({ metadata: metadataFor(art), file: sourceFiles.current.get(art.id) })), picked })
        .then(() => setSaveStatus('Saved on this device'))
        .catch(() => setSaveStatus('Local save failed. Keep this tab open; browser storage may be full or unavailable.'))
    }, 250)
    return () => clearTimeout(timer)
  }, [tick, picked, restored, importingNow, recoveryFailed])

  function removeArtwork(art: Artwork) {
    if (workspace !== 'import' && !window.confirm(`Remove ${art.name} and its associated work?`)) return
    if (art.an.roles.some((r: any) => r.confidence === 1) && !window.confirm(`Remove ${art.name} and its confirmed tags?`)) return
    removeMaster(art.id); sourceFiles.current.delete(art.id)
    setFocus(null); setAnalysisIndex(0); setTick(n => n + 1)
  }

  async function exportZip() {
    if (!guidesReady) { setErr('Approve the five layout guides for every source before batch export.'); setWorkspace('adapt'); return }
    if (!window.confirm('Export for review? Inspect every generated screen; guide approval does not guarantee production quality.')) return
    setBusy(true)
    setErr('')
    try {
      const files: Record<string, Uint8Array> = {}
      for (const screen of selected) {
        for (const row of rows) {
          setProgress(`Rendering ${screen.name} · ${row.lang} · ${exportFormat.toUpperCase()}…`)
          await new Promise(resolve => setTimeout(resolve, 0))
          const canvas = await renderFull(row, screen, {transparentBackground:exportFormat==='png'&&transparentPng})
          try {
            const name = `${row.lang}_${screen.name.replace(/[^\w.-]+/g, '_')}_${screen.w}x${screen.h}${exportFormat==='png'&&transparentPng?'_transparent':''}.${exportFormat}`
            if (exportFormat === 'pdf') {
              const { canvasPdf } = await import('./exportPdf')
              files[name] = canvasPdf(canvas)
            } else if (exportFormat === 'psd') {
              const { exportLayeredPsd } = await import('./engine/exportPsd.js')
              files[name] = await exportLayeredPsd(masterFor(screen, row), screen, canvas)
            } else {
              const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
              if (!blob) throw new Error(`PNG encoding failed for ${screen.name}.`)
              files[name] = new Uint8Array(await blob.arrayBuffer())
            }
          } finally { canvas.width = 1; canvas.height = 1 }
        }
      }
      const zipped = zipSync(files, {level:6})
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
      setProgress('')
    }
  }

  return (
    <>
      <header>
        <b>DOOH Creative Studio</b>
        <nav className="workspace-tabs" aria-label="Creative workflow">{STEPS.map((step,i)=><button key={step} type="button" className={workspace===step?'active':''} disabled={busy || importingNow || !restored || (['review','refine','export'].includes(step) && !guidesReady) || ['Not ready','Not implemented'].includes(workflowStatus(step,ARTS,selected.length))} title={workflowStatus(step,ARTS,selected.length)} onClick={()=>setWorkspace(step as typeof workspace)} aria-current={workspace===step?'step':undefined}>{i+1} · {step[0].toUpperCase()+step.slice(1)} {workflowStatus(step,ARTS,selected.length)==='Complete'?'✓':workflowStatus(step,ARTS,selected.length)==='Needs attention'?'!':''}</button>)}</nav>
        <span className="chip" role="status">{saveStatus}</span>
        <span className="spacer" />
        <button type="button" className="ghost" disabled={!guidesReady || !selected.length || !rows.length || busy || importingNow || !restored} onClick={exportZip}>
          {busy ? 'Exporting…' : exportFormat==='png' ? 'Export review ZIP' : `Export ${exportFormat.toUpperCase()} ZIP`}
        </button>
      </header>
      {workspace === "import" ? <section className="import-studio"><div className="import-heading"><span className="eyebrow">STEP 01 / CREATIVE PREPARATION</span><h1>Start with a great master.</h1><p>Bring English and Arabic artwork together. Check what was imported before adapting to any screen.</p></div><div className="import-columns"><div className="import-card import-upload" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {e.preventDefault(); if(e.dataTransfer.files.length) void takeFiles(e.dataTransfer.files)}}><div className="import-icon">↑</div><h2>Drop your creative masters</h2><p>PSD, PSB, SVG, PNG, JPG or WebP · Multiple files supported</p><label className="import-file-button">Choose artwork<input disabled={busy || importingNow || !restored} type="file" multiple accept=".png,.jpg,.jpeg,.webp,.svg,.psd,.psb" onChange={(e) => {if(e.target.files?.length) void takeFiles(e.target.files); e.target.value=""}} /></label><p className="import-tip">Tip: Name files with _EN or _AR to map languages automatically.</p><div className="sample-actions"><button type="button" className="ghost" disabled={busy || importingNow || !restored} onClick={() => void sample('svg')}>Try sample SVG</button><button type="button" className="ghost" disabled={busy || importingNow || !restored} onClick={() => void sample('psd')}>Try sample PSD</button></div></div><div className="import-card"><div className="import-card-top"><h2>Imported masters</h2><span className="chip">{ARTS.length} assets</span></div>{ARTS.length ? <div className="import-assets">{ARTS.map((art,i)=><div className="import-asset" key={art.id}><span className="asset-mark">▧</span><div><strong>{art.name}</strong><small>{art.a.w} × {art.a.h} px · {art.a.source?.format?.toUpperCase()} · {art.a.source?.format === "image" ? "Flattened" : "Layered"} · Imported</small></div><select aria-label={`Language for ${art.name}`} value={art.lang} onChange={e=>{art.lang=e.target.value;setFocus(null);setTick(n=>n+1)}}><option value="">Assign language</option><option value="EN">English</option><option value="AR">Arabic</option></select><button type="button" className="remove-master" aria-label={`Remove ${art.name}`} title={`Remove ${art.name}`} disabled={busy || importingNow || !restored} onClick={()=>removeArtwork(art)}>✕ Remove</button></div>)}</div> : <div className="import-empty">No artwork imported yet. Your files will appear here for review.</div>}<div className="import-checks"><h3>Preflight</h3><p>✓ Supported formats: PSD / PSB / SVG / raster</p><p>{ARTS.some(a=>a.lang==="EN")?"✓":"○"} English master {ARTS.some(a=>a.lang==="EN")?"detected":"not detected"}</p><p>{ARTS.some(a=>a.lang==="AR")?"✓":"○"} Arabic master {ARTS.some(a=>a.lang==="AR")?"detected":"not detected"}</p><small>Language suggestions may be wrong. Confirm each assignment above. Missing languages will not be exported.</small></div></div></div>{progress&&<p role="status" className="progress-status">{progress}</p>}{importingNow&&<button type="button" className="ghost" onClick={()=>{cancelled.current=true;setProgress("Stopping after current synchronous operation…")}}>Stop remaining imports</button>}{err && <p className="err">{err}</p>}<div className="import-footer"><span>{ARTS.length ? `${ARTS.length} master(s) ready to preview` : "Import artwork to begin"}</span><button type="button" disabled={importingNow || workflowStatus("analyse",ARTS,selected.length)==="Not ready"} onClick={() => setWorkspace("analyse")}>Continue to Analyse →</button></div></section> : <div className="studio-workspace"><section className="studio-intro"><span className="eyebrow">CREATIVE WORKFLOW / {workspace.toUpperCase()}</span><h1>{workspace==='analyse'?'Understand the original artwork':workspace==='adapt'?'Adapt to every screen':workspace==='review'?'Review every composition':workspace==='refine'?'Refine with original assets only':'Export selected creatives'}</h1><p>{workspace==='analyse'?'Inspect detected source masters and their languages before adapting.':workspace==='adapt'?'Adjust five representative layouts, then use their guides across your selected screens.':workspace==='review'?'Double-click each preview to refine its layers, then check hierarchy, clipping and readability.':workspace==='refine'?'Double-click an adaptation, or choose Refine, to edit its layers, placement and appearance. Changes belong only to that screen and source master.':'Export exact-resolution PNG, PDF or layered PSD files for the selected screens.'}</p>{workspace==='analyse'&&ARTS.length>0&&<div className="analysis-picker"><label htmlFor="artwork-to-tag">Artwork to analyse</label><select id="artwork-to-tag" value={Math.min(analysisIndex,ARTS.length-1)} onChange={e=>setAnalysisIndex(Number(e.target.value))}>{ARTS.map((art,i)=><option value={i} key={i}>{art.name}</option>)}</select><LayerTagger key={ARTS[Math.min(analysisIndex,ARTS.length-1)].id} art={ARTS[Math.min(analysisIndex,ARTS.length-1)]} onChange={()=>setTick(n=>n+1)}/></div>}{workspace==='analyse'&&<div className="analysis-summary">{ARTS.map((art,i)=><div key={i} className="analysis-card"><strong>{art.name}</strong><span>{art.a.w} × {art.a.h} · {art.lang||'Language unknown'}</span><span>{art.an?.roles?.length||0} classified layer roles</span><span>{art.an?.warnings?.length||0} analysis warnings</span></div>)}</div>}{workspace==='export'&&<div className="export-options"><label>Export format<select aria-label="Export format" value={exportFormat} disabled={busy} onChange={e=>setExportFormat(e.target.value as typeof exportFormat)}><option value="png">PNG</option><option value="pdf">PDF · full-resolution image</option><option value="psd">PSD · layers + original source</option></select></label>
        {exportFormat==='png'&&<label><input type="checkbox" checked={transparentPng} disabled={busy} onChange={e=>setTransparentPng(e.target.checked)}/>Transparent background</label>}</div>}{workspace==='export'&&<p>{exportFormat==='psd'?'Adapted layers retain blend modes and opacity. Masks, fill and effects are baked into adapted pixels. Native PSD layers and embedded Illustrator objects remain in a hidden original-source folder. Check the file in Photoshop before production.':exportFormat==='pdf'?'PDF embeds a lossless full-resolution image per screen. Page units map pixels at 72 ppi; physical print dimensions are not specified.':'PNG uses lossless compression and exact screen dimensions. Transparent background hides only the identified background layer.'}</p>}{workspace==='export'&&<button type="button" disabled={!guidesReady||!selected.length||!rows.length||busy||importingNow||!restored} onClick={exportZip}>{busy?'Exporting…':`Export review ${exportFormat.toUpperCase()}s as ZIP`}</button>}<div className="workflow-actions"><button type="button" className="ghost" onClick={()=>setWorkspace('import')}>← Manage files</button>{workspace!=='export'&&<button type="button" disabled={busy || importingNow || !selected.length || (workspace==='adapt' && !guidesReady)} onClick={()=>setWorkspace(workspace==='analyse'?'adapt':workspace==='adapt'?'review':workspace==='review'?'refine':'export')}>{workspace==='review'?'Refine adaptations →':'Next step →'}</button>}</div></section>{workspace==='adapt'&&ARTS.length>0&&<><div className="calibration-master"><label>Master to calibrate<select aria-label="Master to calibrate" value={Math.min(analysisIndex,ARTS.length-1)} onChange={e=>setAnalysisIndex(Number(e.target.value))}>{ARTS.map((art,i)=><option key={art.id} value={i}>{art.name} · {art.lang}</option>)}</select></label></div><Calibration key={ARTS[Math.min(analysisIndex,ARTS.length-1)].id} art={ARTS[Math.min(analysisIndex,ARTS.length-1)]} onChange={()=>setTick(n=>n+1)} onBatch={()=>setBatchActive(true)}/></>}{workspace!=='analyse'&&(workspace!=='adapt'||batchActive&&guidesReady)&&<div className="layout">
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
              <button type="button" className="ghost" disabled={busy || importingNow || !restored} onClick={() => void sample('svg')}>
                Sample SVG
              </button>
              <button type="button" className="ghost" disabled={busy || importingNow || !restored} onClick={() => void sample('psd')}>
                Sample PSD
              </button>
            </div>
          </div>
          {err ? <p className="err">{err}</p> : null}
          <h2>Masters ({ARTS.length})</h2>
          <div className="masters" data-tick={tick}>
            {ARTS.length === 0 ? <div className="cap">No master yet. Tiles use the built-in template until you upload.</div> : null}
            {ARTS.map((art) => (
              <div className="master" key={art.id}>
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
                  {rows.map((row) => (
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
      </div>}</div>
      }
      {busy&&progress&&<p role="status" className="progress-status">{progress}</p>}
      {focus && masterFor(focus.screen,focus.row) ? <Calibration key={masterFor(focus.screen,focus.row).id+screenProofKey(focus.screen)} art={masterFor(focus.screen,focus.row)} targetScreen={focus.screen} onClose={()=>setFocus(null)} onChange={()=>setTick(n=>n+1)} /> : null}
    </>
  )
}

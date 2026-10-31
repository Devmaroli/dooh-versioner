import { useEffect, useMemo, useRef, useState } from 'react'
import { APP_VERSION } from './version'
import { zipSync } from 'fflate'
import { Calibration } from './Calibration'
import { calibrationReady, screenProofKey, sourceSignature } from './layoutGuides.js'
import { LayerTagger } from './AnalyseArtwork'
import { availableRows, metadataFor, restoreMetadata, STEP_LABELS, STEPS, validateFile, validateDimensions, workflowStatus } from './project.js'
import { outputReadiness } from './layoutGuides.js'
import { readProject, saveProject } from './storage.js'
import { DEFAULT_ON, SCREENS } from './data/presets.js'
import Adapt from './engine/adapt.js'
import { filesFromDataTransfer } from './fileDrop.js'
import {
  ARTS,
  SHEET,
  SAMPLE_SVG,
  SAMPLE_PSD_B64,
  importPsdBuffer,
  importRasterCanvas,
  importSvgText,
  importPdfBuffer,
  reloadPdfPage,
  relinkImages,
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

function TileView({row,screen,maxW,maxH,onClick,disabled}:{row:Row;screen:Screen;maxW:number;maxH:number;onClick?:()=>void;disabled?:boolean}) {
  const host=useRef<HTMLDivElement>(null),[renderError,setRenderError]=useState(''),master=masterFor(screen,row),guideReady=!!master&&calibrationReady(master,[screen])
  useEffect(()=>{
    if(!host.current)return
    if(!guideReady){host.current.replaceChildren();return}
    let active=true
    const {c,ready}=renderTile(row,screen,maxW,maxH);host.current.replaceChildren(c)
    ready?.then(()=>{if(active)setRenderError('')}).catch(error=>{if(active)setRenderError(error.message)})
    return()=>{active=false}
  })
  const body=<><div ref={host}/>{!guideReady&&<p>Approve the layout guide for this screen in Adapt.</p>}{renderError&&<p role="alert">{renderError}</p>}<div className="cap">{row.lang} · {screen.name} {screen.w}×{screen.h}{master?` · ${master.name} (${master.lang||'lang?'})`:''}</div></>
  if(!onClick)return <div className="tile">{body}</div>
  const output=master?.calibration?.outputs?.[screenProofKey(screen)]
  const readiness = master ? outputReadiness(master, screen) : null
  return <div className="adaptation-tile"><button type="button" className="tile" disabled={disabled||!guideReady} aria-label={`Artwork ${screen.name} ${row.lang}; double-click to refine`} onDoubleClick={onClick} onClick={e=>{if(e.detail===0)onClick()}}>{body}</button><button type="button" className="ghost" disabled={disabled||!guideReady} onClick={onClick}>Edit {screen.name} {row.lang}</button>{readiness&&<small className={`output-status status-${readiness.status === 'Needs review' ? 'review' : readiness.status.toLowerCase()}`}>{readiness.status}{readiness.issues.length ? ` · ${readiness.issues.length} ${readiness.issues.length === 1 ? 'finding' : 'findings'}` : ''}{output ? (output.approved && output.sourceSignature === sourceSignature(master) ? ' · output approved' : ' · output approval cleared') : ' · guide approval'}</small>}</div>
}

type Artwork = (typeof ARTS)[number]
export function App() {
  const [workspace, setWorkspace] = useState<'import' | 'analyse' | 'adapt' | 'review' | 'export'>('import')
  const [outputFilter, setOutputFilter] = useState<'all' | 'Ready' | 'Needs review' | 'Blocked'>('all')
  const [selectionNoted, setSelectionNoted] = useState(false)
  const [tick, setTick] = useState(0)
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
  const linkedFiles = useRef(new Map<string, File>())
  const [importingNow, setImportingNow] = useState(false)
  const [restored, setRestored] = useState(false)
  const [recoveryFailed, setRecoveryFailed] = useState(false)
  const [saveStatus, setSaveStatus] = useState('Loading local project…')
  const rows = availableRows(ARTS, SHEET)
  const guidesReady = ARTS.length > 0 && ARTS.every(art=>calibrationReady(art,selected))

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
    const head = new Uint8Array(buffer.slice(0, 5))
    const pdf = ext === 'pdf' || ext === 'ai' || (head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46)
    const svg = ext === 'svg' || (!pdf && (ext === 'xml' || new TextDecoder().decode(buffer.slice(0, 180)).includes('<svg')))
    if (svg) await importSvgText(new TextDecoder().decode(buffer), file.name, linkedFiles.current)
    else if (pdf) {
      if (ext === 'ai' && head[0] !== 0x25) throw new Error('This AI file is not a PDF-compatible Illustrator file. Export a PDF or SVG instead.')
      await importPdfBuffer(buffer, file.name, 1)
    }
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
    const list = Array.from(files)
    const hasDocument = list.some(file => /\.(svg|pdf|ai)$/i.test(file.name))
    for (const file of list) if (/\.(png|jpe?g|webp|gif|otf|ttf)$/i.test(file.name)) linkedFiles.current.set(file.name.toLowerCase(), file)
    const queue = list.filter(file => !/\.(otf|ttf)$/i.test(file.name) && (!hasDocument || !/\.(png|jpe?g|webp|gif)$/i.test(file.name)))
    importing.current = true; cancelled.current = false; setImportingNow(true); setErr('')
    const errors: string[] = []
    try {
      for (const file of queue) {
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

  function pickFolder() {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.setAttribute('webkitdirectory', '')
    input.setAttribute('directory', '')
    input.onchange = () => { if (input.files?.length) void takeFiles(input.files) }
    input.click()
  }

  async function changePdfPage(art: Artwork, page: number) {
    const file = sourceFiles.current.get(art.id)
    if (!file) { setErr('The original PDF is not available to change pages.'); return }
    setImportingNow(true); setErr('')
    try {
      await reloadPdfPage(art, await file.arrayBuffer(), page)
      setTick(n => n + 1)
    } catch (error) { setErr(error instanceof Error ? error.message : String(error)) }
    finally { setImportingNow(false) }
  }

  async function relinkCurrent(files: FileList | File[]) {
    const art = ARTS[Math.min(analysisIndex, Math.max(0, ARTS.length - 1))]
    if (!art) return
    for (const file of Array.from(files)) linkedFiles.current.set(file.name.toLowerCase(), file)
    await relinkImages(art.a, files)
    art.an.warnings = [...new Set([...(art.an.warnings || []).filter((warning: string) => !warning.startsWith('Missing linked image')), ...(art.a.warnings || [])])]
    setTick(n => n + 1)
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
        if (saved && saved.version !== 1 && saved.version !== 2) throw new Error('This project was saved by an unsupported version.')
        if (saved) {
          for (const file of saved.companions || []) linkedFiles.current.set(file.name.toLowerCase(), file)
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
      void saveProject({ assets: ARTS.map(art => ({ metadata: metadataFor(art), file: sourceFiles.current.get(art.id) })), companions: [...linkedFiles.current.values()], picked })
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
    if (!guidesReady) { setErr('Approve the selected layout families for every source before batch export.'); setWorkspace('adapt'); return }
    const plan: { screen: Screen; row: Row; ready: ReturnType<typeof outputReadiness> }[] = []
    for (const screen of selected) for (const row of rows) {
      const master = masterFor(screen, row)
      if (!master) continue
      const ready = outputReadiness(master, screen)
      const output = master.calibration?.outputs?.[screenProofKey(screen)]
      if (output && (!output.approved || output.sourceSignature !== sourceSignature(master))) { setErr(`${screen.name}: approve this refined adaptation before exporting.`); return }
      if (ready.status === 'Blocked') { setErr(`${screen.name} · ${row.lang} is blocked. ${ready.issues.find(issue => issue.blocked)?.message || 'Resolve the blocking finding before export.'}`); return }
      plan.push({ screen, row, ready })
    }
    const reviewOnly = plan.filter(item => item.ready.status === 'Needs review')
    const summary = plan.map(item => `${item.row.lang} ${item.screen.name} ${item.screen.w}×${item.screen.h}: ${item.ready.status}${item.ready.reviewCount ? ` (${item.ready.reviewCount} review)` : ''}`).join('\n')
    if (!window.confirm(`${reviewOnly.length ? `${reviewOnly.length} output(s) still need visual review. Continuing records that acknowledgment.\n` : ''}${summary || 'No outputs to export.'}`)) return
    for (const item of plan) { const art = masterFor(item.screen, item.row); if (art) art.exportAcknowledgement = { at: new Date().toISOString(), status: item.ready.status, findings: item.ready.issues.map(issue => issue.message) } }
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

  const screenPicker = <section aria-label="Target screens"><h2>Screens</h2>
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
                  disabled={busy||importingNow}
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
          </div></section>
  const selectionNotice = <div className={`selection-notice${selectionNoted ? ' is-noted' : ''}`} role="status"><strong>{selected.length ? `${selected.length} ${selected.length === 1 ? 'screen' : 'screens'} selected for this job.` : 'No screens selected'}</strong><p>{selected.length ? 'Only these sizes will be adapted and exported.' : 'Choose at least one screen to adapt.'}</p><details><summary>Check selected sizes ({selected.length})</summary><ul>{selected.map(s=><li key={s.name}>{s.name} · {s.w} × {s.h}</li>)}</ul></details><small>Available languages: {rows.map(r=>r.lang).join(', ')||'None assigned'}. Only matching source masters are used. A subset is a valid job.</small>{selected.length > 0 && selected.length !== SCREENS.length && <button type="button" className="ghost" onClick={() => setSelectionNoted(true)}>{selectionNoted ? 'Selection acknowledged' : 'Acknowledge selection'}</button>}</div>
  return (
    <>
      <header>
        <b>DOOH Creative Studio</b>
        <span className="app-version" aria-label={`Version ${APP_VERSION}`}>v{APP_VERSION}</span>
        <nav className="workspace-tabs" aria-label="Creative workflow">{STEPS.map((step,i)=><button key={step} type="button" className={workspace===step?'active':''} disabled={busy || importingNow || !restored || (['review','export'].includes(step) && !guidesReady) || ['Not ready','Not implemented'].includes(workflowStatus(step,ARTS,selected.length))} title={workflowStatus(step,ARTS,selected.length)} onClick={()=>setWorkspace(step as typeof workspace)} aria-current={workspace===step?'step':undefined}>{i+1} · {STEP_LABELS[step as keyof typeof STEP_LABELS]} {workflowStatus(step,ARTS,selected.length)==='Complete'?'✓':workflowStatus(step,ARTS,selected.length)==='Needs attention'?'!':''}</button>)}</nav>
        <span className="chip" role="status">{saveStatus}</span>
        <span className="spacer" />
        <button type="button" className="ghost" disabled={!guidesReady || !selected.length || !rows.length || busy || importingNow || !restored} onClick={exportZip}>
          {busy ? 'Exporting…' : exportFormat==='png' ? 'Export review ZIP' : `Export ${exportFormat.toUpperCase()} ZIP`}
        </button>
      </header>
      {workspace === "import" ? <section className="import-studio"><div className="import-heading"><span className="eyebrow">STEP 01 / CREATIVE PREPARATION</span><h1>Start with a great master.</h1><p>Bring English and Arabic artwork together. Check what was imported before adapting to any screen.</p></div><div className="import-columns"><div className="import-card import-upload" onDragOver={(e) => e.preventDefault()} onDrop={(e) => {e.preventDefault(); void filesFromDataTransfer(e.dataTransfer).then(files => { if (files.length) void takeFiles(files) })}}><div className="import-icon">↑</div><h2>Drop your creative masters</h2><p>PSD, PSB, SVG, PDF, AI, PNG, JPG, GIF or WebP. Drop an SVG with its images and original .otf/.ttf fonts, or a folder. Linked images match by file name. Web addresses are never downloaded.</p><label className="import-file-button">Choose artwork<input disabled={busy || importingNow || !restored} type="file" multiple accept=".png,.jpg,.jpeg,.webp,.gif,.svg,.pdf,.ai,.psd,.psb,.otf,.ttf" onChange={(e) => {if(e.target.files?.length) void takeFiles(e.target.files); e.target.value=""}} /></label><button type="button" className="ghost" disabled={busy || importingNow || !restored} onClick={pickFolder}>Choose folder</button><p className="import-tip">Tip: Name files with _EN or _AR to map languages automatically.</p><div className="sample-actions"><button type="button" className="ghost" disabled={busy || importingNow || !restored} onClick={() => void sample('svg')}>Try sample SVG</button><button type="button" className="ghost" disabled={busy || importingNow || !restored} onClick={() => void sample('psd')}>Try sample PSD</button></div></div><div className="import-card"><div className="import-card-top"><h2>Imported masters</h2><span className="chip">{ARTS.length} assets</span></div>{ARTS.length ? <div className="import-assets">{ARTS.map((art,i)=><div className="import-asset" key={art.id}><span className="asset-mark">▧</span><div><strong>{art.name}</strong><small>{art.a.w} × {art.a.h} px · {art.a.source?.format?.toUpperCase()} · {art.a.source?.format === "image" ? "Flattened" : "Layered"} · Imported</small>{(art.a as { pdfPages?: number; pdfPage?: number }).pdfPages! > 1 && <label>Page<select aria-label={`PDF page for ${art.name}`} value={(art.a as { pdfPage?: number }).pdfPage || 1} disabled={busy || importingNow} onChange={e => void changePdfPage(art, Number(e.target.value))}>{Array.from({ length: (art.a as { pdfPages: number }).pdfPages }, (_, page) => <option key={page + 1} value={page + 1}>{page + 1}</option>)}</select></label>}</div><select aria-label={`Language for ${art.name}`} value={art.lang} onChange={e=>{art.lang=e.target.value;setFocus(null);setTick(n=>n+1)}}><option value="">Assign language</option><option value="EN">English</option><option value="AR">Arabic</option></select><button type="button" className="remove-master" aria-label={`Remove ${art.name}`} title={`Remove ${art.name}`} disabled={busy || importingNow || !restored} onClick={()=>removeArtwork(art)}>✕ Remove</button></div>)}</div> : <div className="import-empty">No artwork imported yet. Your files will appear here for review.</div>}<div className="import-checks"><h3>Preflight</h3><p>✓ Supported formats: PSD / PSB / SVG / PDF / AI / raster</p><p>{ARTS.some(a=>a.lang==="EN")?"✓":"○"} English master {ARTS.some(a=>a.lang==="EN")?"detected":"not detected"}</p><p>{ARTS.some(a=>a.lang==="AR")?"✓":"○"} Arabic master {ARTS.some(a=>a.lang==="AR")?"detected":"not detected"}</p><small>Language suggestions may be wrong. Confirm each assignment above. Missing languages will not be exported.</small></div></div></div>{progress&&<p role="status" className="progress-status">{progress}</p>}{importingNow&&<button type="button" className="ghost" onClick={()=>{cancelled.current=true;setProgress("Stopping after current synchronous operation…")}}>Stop remaining imports</button>}{err && <p className="err">{err}</p>}<details className="import-targets"><summary>Choose target screens · {selected.length} selected</summary>{screenPicker}</details>{selectionNotice}<div className="import-footer"><span>{ARTS.length ? `${ARTS.length} master(s) ready to preview` : "Import artwork to begin"}</span><button type="button" className="ghost" disabled={busy||importingNow||!restored||!selected.length||workflowStatus("adapt",ARTS,selected.length)==="Not ready"} onClick={()=>setWorkspace("adapt")}>Go ahead and adapt →</button><button type="button" disabled={importingNow || workflowStatus("analyse",ARTS,selected.length)==="Not ready"} onClick={() => setWorkspace("analyse")}>Continue to Analyse →</button></div></section> : <div className="studio-workspace"><section className="studio-intro"><span className="eyebrow">CREATIVE WORKFLOW / {workspace.toUpperCase()}</span><h1>{workspace==='analyse'?'Understand the original artwork':workspace==='adapt'?'Adapt the selected screens':workspace==='review'?'Review and edit outputs':'Export selected creatives'}</h1><p>{workspace==='analyse'?'Confirm what each layer is. Suggestions stay unconfirmed until you choose a role.':workspace==='adapt'?'Approve a guide only for the families your selected screens need.':workspace==='review'?'One stage for every output. Double-click or choose Edit. Saving an edit does not approve it, and editing an approved output clears that approval.':'Choose PNG, PDF or layered PSD. Blocked outputs stay here. Review-only findings need an explicit acknowledgment.'}</p>{workspace==='analyse'&&ARTS.length>0&&<div className="analysis-picker"><label htmlFor="artwork-to-tag">Artwork to analyse</label><select id="artwork-to-tag" value={Math.min(analysisIndex,ARTS.length-1)} onChange={e=>setAnalysisIndex(Number(e.target.value))}>{ARTS.map((art,i)=><option value={i} key={i}>{art.name}</option>)}</select>{(ARTS[Math.min(analysisIndex,ARTS.length-1)].a as { pdfPages?: number; pdfPage?: number }).pdfPages! > 1 && <label>Page<select aria-label="PDF page" value={(ARTS[Math.min(analysisIndex,ARTS.length-1)].a as { pdfPage?: number }).pdfPage || 1} disabled={importingNow} onChange={e => void changePdfPage(ARTS[Math.min(analysisIndex,ARTS.length-1)], Number(e.target.value))}>{Array.from({ length: (ARTS[Math.min(analysisIndex,ARTS.length-1)].a as { pdfPages: number }).pdfPages }, (_, page) => <option key={page + 1} value={page + 1}>{page + 1}</option>)}</select></label>}<LayerTagger key={ARTS[Math.min(analysisIndex,ARTS.length-1)].id} art={ARTS[Math.min(analysisIndex,ARTS.length-1)]} onChange={()=>setTick(n=>n+1)} onRelink={files => void relinkCurrent(files)}/></div>}{workspace==='analyse'&&<div className="analysis-summary">{ARTS.map((art,i)=><div key={i} className="analysis-card"><strong>{art.name}</strong><span>{art.a.w} × {art.a.h} · {art.lang||'Language unknown'}</span><span>{art.an?.roles?.length||0} classified layer roles</span><span>{art.an?.warnings?.length||0} analysis warnings</span></div>)}</div>}{(workspace==='adapt'||workspace==='export')&&selectionNotice}{workspace==='adapt'&&<details className="adapt-targets"><summary>Change target screens</summary>{screenPicker}</details>}{workspace==='export'&&<div className="export-options"><label>Export format<select aria-label="Export format" value={exportFormat} disabled={busy} onChange={e=>setExportFormat(e.target.value as typeof exportFormat)}><option value="png">PNG</option><option value="pdf">PDF · full-resolution image</option><option value="psd">PSD · layers + original source</option></select></label>
        {exportFormat==='png'&&<label><input type="checkbox" checked={transparentPng} disabled={busy} onChange={e=>setTransparentPng(e.target.checked)}/>Transparent background</label>}</div>}{workspace==='export'&&<p>{exportFormat==='psd'?'Adapted layers retain blend modes and opacity. Masks, fill and effects are baked into adapted pixels. Native PSD layers and embedded Illustrator objects remain in a hidden original-source folder. Check the file in Photoshop before production.':exportFormat==='pdf'?'PDF embeds a lossless full-resolution image per screen. Page units map pixels at 72 ppi; physical print dimensions are not specified.':'PNG uses lossless compression and exact screen dimensions. Transparent background hides only the identified background layer.'}</p>}{workspace==='export'&&err&&<p className="err" role="alert">{err}</p>}<div className="workflow-actions"><button type="button" className="ghost" onClick={()=>setWorkspace('import')}>← Manage files</button>{workspace!=='export'&&<button type="button" disabled={busy || importingNow || !selected.length || (workspace==='adapt' && !guidesReady) || (workspace==='review' && !guidesReady)} onClick={()=>setWorkspace(workspace==='analyse'?'adapt':workspace==='adapt'?'review':'export')}>{workspace==='review'?'Export →':'Next step →'}</button>}</div></section>{workspace==='adapt'&&ARTS.length>0&&<><div className="calibration-master"><label>Master to calibrate<select aria-label="Master to calibrate" value={Math.min(analysisIndex,ARTS.length-1)} onChange={e=>setAnalysisIndex(Number(e.target.value))}>{ARTS.map((art,i)=><option key={art.id} value={i}>{art.name} · {art.lang}</option>)}</select></label></div><Calibration key={ARTS[Math.min(analysisIndex,ARTS.length-1)].id} art={ARTS[Math.min(analysisIndex,ARTS.length-1)]} onChange={()=>setTick(n=>n+1)} onBatch={()=>setWorkspace('review')} targetScreens={selected}/></>}{workspace==='export'&&<div className="export-readiness" aria-live="polite">{selected.flatMap(screen => rows.map(row => { const master = masterFor(screen, row); const ready = master ? outputReadiness(master, screen) : null; return <p key={screen.name + row.lang}>{!master || !ready?.guideReady ? 'Approve the layout guide for this screen in Adapt.' : `${ready.status} · ${row.lang} · ${screen.name} ${screen.w}×${screen.h}${ready.issues.length ? ` · ${ready.issues.length} findings` : ''}`}</p> }))}{screenPicker}</div>}{workspace==='review'&&<div className="layout review-layout">
        <aside>
          {err ? <p className="err">{err}</p> : null}
          <h2>Outputs</h2>
          <label>Status<select aria-label="Output status filter" value={outputFilter} onChange={e => setOutputFilter(e.target.value as typeof outputFilter)}><option value="all">All statuses</option><option value="Ready">Ready</option><option value="Needs review">Needs review</option><option value="Blocked">Blocked</option></select></label>
          <p className="cap">Guide approval and output approval are separate. Back returns here with this filter intact.</p>
          <div className="masters" data-tick={tick}>{ARTS.map(art => <div className="master" key={art.id}><div>{art.name}</div><span className={'chip ' + (art.lang || '')}>{art.lang || 'no suffix'}</span></div>)}</div>
        </aside>
        <main>
          <div className="grid">
            {selected.map((screen) => (
              <div className="pair" key={screen.name}>
                <h3>
                  {screen.name} {screen.w}×{screen.h}
                </h3>
                <div className="tiles">
                  {rows.map((row) => {
                    const master = masterFor(screen, row)
                    const status = master ? outputReadiness(master, screen).status : 'Blocked'
                    if (outputFilter !== 'all' && status !== outputFilter) return null
                    return <TileView key={row.version_id} row={row} screen={screen} maxW={300} maxH={180} disabled={busy} onClick={() => setFocus({ row, screen })} />
                  })}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>}</div>
      }
      {busy&&progress&&<p role="status" className="progress-status">{progress}</p>}
      {focus && masterFor(focus.screen,focus.row) ? <Calibration key={masterFor(focus.screen,focus.row).id+screenProofKey(focus.screen)} art={masterFor(focus.screen,focus.row)} targetScreen={focus.screen} onClose={()=>setFocus(null)} onChange={()=>setTick(n=>n+1)} outputPosition={`${Math.max(0, selected.flatMap(screen => rows.map(row => screen.name + row.lang)).indexOf(focus.screen.name + focus.row.lang)) + 1} of ${selected.length * rows.length}`} onPrevious={() => { const entries = selected.flatMap(screen => rows.map(row => ({ screen, row }))); const index = entries.findIndex(entry => entry.screen.name === focus.screen.name && entry.row.lang === focus.row.lang); if (index > 0) setFocus(entries[index - 1]) }} onNext={() => { const entries = selected.flatMap(screen => rows.map(row => ({ screen, row }))); const index = entries.findIndex(entry => entry.screen.name === focus.screen.name && entry.row.lang === focus.row.lang); if (index >= 0 && index < entries.length - 1) setFocus(entries[index + 1]) }} /> : null}
    </>
  )
}

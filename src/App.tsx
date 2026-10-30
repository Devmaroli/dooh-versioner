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

export function App() {
  const [tick, setTick] = useState(0)
  const [query, setQuery] = useState('')
  const [picked, setPicked] = useState<string[]>(DEFAULT_ON)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
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
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e))
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
        <b>DOOH versioner</b>
        <span className="chip">v1.5 engine</span>
        <span className="spacer" />
        <button type="button" className="ghost" disabled={!selected.length || busy} onClick={exportZip}>
          {busy ? 'Exporting…' : 'Export PNG zip'}
        </button>
      </header>
      <div className="layout">
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
      </div>
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

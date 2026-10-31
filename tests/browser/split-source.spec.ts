import { expect, test } from '@playwright/test'
import { initializeCanvas, readPsd } from 'ag-psd'
initializeCanvas(() => { throw new Error('Decode as image data') }, (width,height) => ({width,height,data:new Uint8ClampedArray(width*height*4)}))
import { splitSvg, splitPdf } from '../fixtures/split-source.js'

test('split isolates a nonrectangular vector border and two word parts, preserving masks, pixels and recovery', async ({ page }) => {
  await page.goto('/')
  const results = await page.evaluate(async ({ svg, pdf }) => {
    const { importSvgText, renderCalibration } = await import('/src/engine/render.js')
    const { exportLayeredPsd } = await import('/src/engine/exportPsd.js')
    const { prepareAnyLayer } = await import('/src/sourceText.js')
    const { allLayers, drawSourceLayers } = await import('/src/artwork.js')
    const { renderVectorCrop } = await import('/src/embeddedVectors.js')
    const { metadataFor, restoreMetadata } = await import('/src/project.js')
    const { editorSnapshot, restoreEditorSnapshot } = await import('/src/editorHistory.js')
    const results = []
    for (const embedded of [false, true]) {
      const art = await importSvgText(svg, 'synthetic_EN.svg')
      const source = art.a.layers[0]
      if (embedded) { source.vectorPdf = { data: new Uint8Array(pdf), page:1 }; delete source.svgShape }
      art.an.roles = [{id:source.id,role:'other',confidence:1}]
      const before = editorSnapshot(art)
      const split = prepareAnyLayer(art, source.id)
      const parts = allLayers(art).filter(l => l.wordSourceId)
      const border = parts.find(l => l.name.startsWith('Border'))!
      const read = (c,x,y) => Array.from(c.getContext('2d').getImageData(x,y,1,1).data)
      const vector = await renderVectorCrop(border,{x:10,y:10,w:200,h:120},800,480)
      const word = parts.find(l => !l.name.startsWith('Border'))!
      const wordVector = await renderVectorCrop(word,word.crop,word.crop.w*4,word.crop.h*4)
      const composite = document.createElement('canvas'); composite.width=220; composite.height=140
      drawSourceLayers(composite.getContext('2d'),parts,true)
      const original = document.createElement('canvas'); original.width=220; original.height=140
      drawSourceLayers(original.getContext('2d'),[source],true)
      const a = composite.getContext('2d').getImageData(0,0,220,140).data, b = original.getContext('2d').getImageData(0,0,220,140).data
      let difference=0; for(let i=0;i<a.length;i++) difference+=Math.abs(a[i]-b[i])
      const screen={name:'Synthetic square',w:220,h:140}
      art.calibration={enabled:true,proofs:{compact:{screen,frames:Object.fromEntries(parts.map(p=>[`word:${p.id}`,{x:p.crop.x/220,y:p.crop.y/140,w:p.crop.w/220,h:p.crop.h/140}]))}}}
      const preview=renderCalibration(art,screen,220,140);await preview.ready
      const psd=Array.from(await exportLayeredPsd(art,screen,preview.c))
      const saved = metadataFor(art); restoreEditorSnapshot(art,before)
      const undoCount=art.wordPieces.length
      restoreMetadata(art,JSON.parse(JSON.stringify(saved)))
      const restored = allLayers(art).filter(l => l.wordSourceId)
      results.push({ embedded, count:split.pieces.length, borders:split.pieces.filter(p=>p.isBorder).length, role:art.an.roles.find(r=>r.id===source.id).role, originalBorder:!!art.originalBorder, borderInterior:read(vector,220,240)[3], borderInk:read(vector,400,8), wordInk:read(wordVector,8,8)[3], vectorCount:parts.filter(p=>p.vectorWord).length, difference, undoCount, restored:restored.length, psd, maskRestored:!!restored.find(p=>p.name.startsWith('Border')).sourceClip })
    }
    return results
  }, { svg:splitSvg, pdf:Array.from(splitPdf()) })
  for (const result of results) {
    expect(result.count).toBe(3); expect(result.borders).toBe(1)
    expect(result.role).toBe('other'); expect(result.originalBorder).toBe(false)
    expect(result.borderInterior).toBe(0); expect(result.borderInk[3]).toBeGreaterThan(200)
    expect(result.borderInk[0]).toBeGreaterThan(180); expect(result.wordInk).toBeGreaterThan(200)
    expect(result.vectorCount).toBe(3); expect(result.difference).toBe(0)
    const psd=readPsd(new Uint8Array(result.psd),{useImageData:true})
    const border=psd.children!.find(l=>l.name.startsWith('Border'))!
    expect(border.imageData).toBeDefined()
    const x=65-(border.left||0), y=70-(border.top||0), offset=(y*border.imageData!.width+x)*4
    expect(border.imageData!.data[offset+3]).toBe(0)
    expect(result.undoCount).toBe(0); expect(result.restored).toBe(3); expect(result.maskRestored).toBe(true)
  }
})

test('Split selected layer works from the editor without a headline role or border precondition', async ({ page }) => {
  await page.goto('/'); await expect(page.getByText('Saved on this device')).toBeVisible()
  await page.locator('input[type=file]').setInputFiles({name:'split_EN.svg',mimeType:'image/svg+xml',buffer:Buffer.from(splitSvg)})
  await page.getByRole('button',{name:'Continue to Analyse'}).click()
  await page.getByRole('button',{name:'source',exact:true}).click()
  await page.getByRole('button',{name:'Other',exact:true}).click()
  await page.getByRole('button',{name:/3 · Adapt/}).click()
  await page.getByRole('button',{name:'Edit Alshaheed - Mupi',exact:true}).click()
  await page.getByRole('button',{name:'Select layer source',exact:true}).click()
  await page.getByRole('button',{name:'Split selected layer',exact:true}).click()
  await expect(page.locator('.lp-row').filter({hasText:/Border 1 · embedded vector/})).toHaveCount(1)
  await expect(page.locator('.lp-row').filter({hasText:/Part [23] · embedded vector/})).toHaveCount(2)
  await expect(page.locator('.calibration-canvas-frame canvas')).toHaveAttribute('data-vector-ready','true')
  await expect(page.getByRole('alert')).toHaveCount(0)
  await page.getByRole('button',{name:'Undo',exact:true}).click()
  await expect(page.getByRole('button',{name:'Select layer source',exact:true})).toBeVisible()
  await expect(page.locator('.lp-row').filter({hasText:/Part [23] · embedded vector/})).toHaveCount(0)
  await page.getByRole('button',{name:'Redo',exact:true}).click()
  await expect(page.locator('.lp-row').filter({hasText:/Part [23] · embedded vector/})).toHaveCount(2)
})

test('plain words split without a border, while connected or empty sources fail without mutation', async ({ page }) => {
  await page.goto('/')
  const result = await page.evaluate(async () => {
    const { prepareAnyLayer } = await import('/src/sourceText.js')
    const px=document.createElement('canvas'); px.width=120; px.height=40
    const g=px.getContext('2d');g.fillStyle='#128cff';g.fillRect(5,5,20,30);g.fillRect(70,5,20,30)
    const make=()=>({a:{layers:[{id:'source',box:[0,0,120,40],px}]},an:{roles:[{id:'source',role:'supporting',confidence:1}]},wordPieces:[]})
    const art=make(), split=prepareAnyLayer(art,'source')
    const roles=art.an.roles.map(r=>r.role)
    const failures=[]
    for(const opaque of [true,false]) {
      g.clearRect(0,0,120,40);if(opaque)g.fillRect(0,0,120,40)
      const target=make(), before=JSON.stringify(target)
      try {prepareAnyLayer(target,'source')} catch(error) {failures.push({message:error.message,unchanged:JSON.stringify(target)===before})}
    }
    return {count:split.pieces.length,borders:split.pieces.some(p=>p.isBorder),roles,failures}
  })
  expect(result.count).toBe(2);expect(result.borders).toBe(false)
  expect(result.roles).toEqual(['supporting','supporting','supporting'])
  expect(result.failures).toHaveLength(2)
  for(const failure of result.failures){expect(failure.unchanged).toBe(true);expect(failure.message).toContain('No separate words or components')}
})

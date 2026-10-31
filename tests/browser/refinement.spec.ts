import {test,expect} from '@playwright/test'
import {writePsdBuffer} from 'ag-psd'
import {unzipSync} from 'fflate'
import fs from 'node:fs'
import {approveGuides} from './helpers'
function pixels(rgb:number[]){const data=new Uint8ClampedArray(64*64*4);for(let i=0;i<data.length;i+=4)data.set([...rgb,255],i);return {width:64,height:64,data}}
test('generated sizes open the complete editor, remain isolated, persist, and export their approved changes',async({page})=>{
  test.setTimeout(180000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  const buffer=writePsdBuffer({width:64,height:64,imageData:pixels([80,120,160]),children:[{name:'Base texture',left:0,top:0,imageData:pixels([80,120,160])},{name:'Top headline',left:0,top:0,imageData:pixels([160,80,40])}]},{generateThumbnail:false})
  await page.goto('/');await expect(page.getByText('Saved on this device')).toBeVisible();await page.locator('input[type=file]').setInputFiles({name:'refine_EN.psd',mimeType:'application/octet-stream',buffer})
  await page.getByRole('button',{name:'Continue to Analyse'}).click();await page.locator('.analyse-layer').filter({hasText:'Top headline'}).click();await page.getByRole('button',{name:'Main headline',exact:true}).click();await page.locator('.analyse-layer').filter({hasText:'Base texture'}).click();await page.getByRole('button',{name:'Original background texture',exact:true}).click()
  await approveGuides(page)
  const other=page.getByRole('button',{name:'Artwork Boulevard Bridge EN; double-click to refine',exact:true}).locator('canvas'),baseline=await other.evaluate((c:HTMLCanvasElement)=>c.toDataURL())
  const target=()=>page.getByRole('button',{name:'Artwork Al Salam Mall EN; double-click to refine',exact:true})
  await target().dblclick();await expect(page.getByRole('dialog',{name:'Edit Al Salam Mall',exact:true})).toBeVisible();await expect(page.getByRole('region',{name:'Layers panel',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Select layer Top headline',exact:true}).click();await page.getByLabel('Width (%)',{exact:true}).fill('5');await page.getByLabel('X position (%)',{exact:true}).fill('10');await page.getByLabel('Y position (%)',{exact:true}).fill('10');await page.getByLabel('Opacity percentage',{exact:true}).fill('50')
  const sample=()=>page.locator('.calibration-canvas-frame .proof-canvas canvas').evaluate((c:HTMLCanvasElement)=>Array.from(c.getContext('2d')!.getImageData(Math.floor(c.width*.12),Math.floor(c.height*.2),1,1).data))
  const close=(actual:number[],expected:number[])=>actual.forEach((v,i)=>expect(Math.abs(v-expected[i])).toBeLessThanOrEqual(2))
  close(await sample(),[120,100,100,255]);await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.getByLabel('Opacity percentage',{exact:true})).toHaveValue('100');await page.getByRole('button',{name:'Redo',exact:true}).click();close(await sample(),[120,100,100,255])
  await page.screenshot({path:'work/per-screen-refinement.png'});await page.getByRole('button',{name:'Back to adaptations',exact:false}).click();await expect(other).toBeVisible();expect(await other.evaluate((c:HTMLCanvasElement)=>c.toDataURL())).toBe(baseline)
  // The original wide guide has not inherited this size-specific appearance change.
  await page.getByRole('button',{name:/3 · Adapt/}).click();await page.getByRole('button',{name:'Edit Al Salam Mall',exact:true}).click();await page.getByRole('button',{name:'Select layer Top headline',exact:true}).click();await expect(page.getByLabel('Opacity percentage',{exact:true})).toHaveValue('100');await page.getByRole('button',{name:'Back to layout previews',exact:false}).click()
  await page.getByRole('button',{name:/4 · Review/}).click();await page.getByRole('button',{name:'Edit Al Salam Mall EN',exact:true}).click();await page.getByRole('button',{name:'Select layer Top headline',exact:true}).click();await expect(page.getByLabel('Opacity percentage',{exact:true})).toHaveValue('50');close(await sample(),[120,100,100,255]);await page.keyboard.press('Escape')
  await expect(page.getByText('Saved on this device')).toBeVisible();await page.reload();await page.getByRole('button',{name:/4 · Review/}).click();await target().dblclick();await page.getByRole('button',{name:'Select layer Top headline',exact:true}).click();await expect(page.getByLabel('Opacity percentage',{exact:true})).toHaveValue('50');close(await sample(),[120,100,100,255]);await page.getByRole('button',{name:'Back to adaptations',exact:false}).click()
  await page.getByRole('button',{name:'Export review ZIP',exact:true}).click();await expect(page.getByText('Al Salam Mall: approve this refined adaptation before exporting.',{exact:true})).toBeVisible()
  await target().dblclick();await page.getByRole('button',{name:'Approve this adaptation',exact:true}).click();await page.getByRole('button',{name:'Back to adaptations',exact:false}).click()
  const download=page.waitForEvent('download');page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Export review ZIP',exact:true}).click()
  const zip=unzipSync(fs.readFileSync((await(await download).path())!)),key=Object.keys(zip).find(k=>/Al_Salam_Mall_7680x1152\.png$/.test(k))!;expect(key).toBeDefined()
  const pixel=await page.evaluate(async bytes=>{const bitmap=await createImageBitmap(new Blob([new Uint8Array(bytes)],{type:'image/png'})),c=document.createElement('canvas');c.width=bitmap.width;c.height=bitmap.height;const g=c.getContext('2d')!;g.drawImage(bitmap,0,0);return Array.from(g.getImageData(Math.floor(c.width*.12),Math.floor(c.height*.2),1,1).data)},Array.from(zip[key]));close(pixel,[120,100,100,255]);expect(errors).toEqual([])
})

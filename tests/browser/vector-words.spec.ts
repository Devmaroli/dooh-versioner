import { unzipSync } from 'fflate'

import { test, expect } from '@playwright/test'
import fs from 'node:fs'

test('IKEA Illustrator smart-object words render from embedded vectors; Ctrl/Shift selection works on rows and canvas',async({page})=>{
  test.setTimeout(180000)
  const fixture=process.env.IKEA_PSD;test.skip(!fixture||!fs.existsSync(fixture),'Private IKEA PSD required.')
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  await page.goto('/');await expect(page.getByText('Saved on this device')).toBeVisible()
  await page.locator('input[type=file]').setInputFiles(fixture!)
  await page.getByRole('button',{name:'Continue to Analyse'}).click()
  await page.locator('button.lp-name',{hasText:/^Vector Smart Object$/}).click();await page.getByRole('button',{name:'Main headline',exact:true}).click()
  await page.getByRole('button',{name:/3 · Adapt/}).click();await page.getByRole('button',{name:'Edit Alshaheed - Mupi',exact:true}).click()
  await page.getByRole('button',{name:'Prepare headline words',exact:true}).click()
  const rows=page.locator('.lp-row').filter({hasText:/Word [0-9]+ · embedded vector/})
  await expect(rows).toHaveCount(5)
  const canvas=page.locator('.calibration-canvas-frame .proof-canvas canvas')
  await expect(canvas).toHaveAttribute('data-vector-ready','true');await expect(canvas).toHaveAttribute('data-vector-words','5')
  await expect(page.getByRole('alert')).toHaveCount(0)
  const word=(i:number)=>page.getByRole('button',{name:`Select layer Word ${i} · embedded vector`,exact:true})
  await word(1).click();await word(3).click({modifiers:['Control']})
  await expect(page.locator('.lp-row.selected')).toHaveCount(2)
  await word(3).click({modifiers:['Control']});await expect(page.locator('.lp-row.selected')).toHaveCount(1)
  await word(1).click();await word(4).click({modifiers:['Shift']});await expect(page.locator('.lp-row.selected')).toHaveCount(4)
  await word(1).click();await rows.nth(3).getByRole('checkbox').click({modifiers:['Shift']});await expect(page.locator('.lp-row.selected')).toHaveCount(4)
  // Place two words apart so canvas picking exercises actual pixels rather than UI boxes.
  for(const [i,x] of [[1,10],[2,55]]){await word(i).click();await page.getByLabel('Width (%)',{exact:true}).fill('30');await page.getByLabel('X position (%)',{exact:true}).fill(String(x));await page.getByLabel('Y position (%)',{exact:true}).fill('15')}
  await expect(canvas).toHaveAttribute('data-vector-ready','true')
  // Keyboard activation shares canvas selection semantics and remains accessible.
  await page.getByRole('button',{name:'Move Word 1 · embedded vector',exact:true}).focus();await page.keyboard.press('Enter')
  await expect(page.locator('.lp-row.selected')).toHaveCount(1)
  const inkPoint=async(i:number)=>{
    const handle=page.getByRole('button',{name:`Move Word ${i} · embedded vector`,exact:true})
    await expect(handle).toBeVisible()
    const box=(await handle.boundingBox())!,area=(await canvas.boundingBox())!
    const point=await canvas.evaluate((c:HTMLCanvasElement,r)=>{const g=c.getContext('2d')!,d=g.getImageData(0,0,c.width,c.height).data;const y0=Math.max(0,Math.ceil(r.y*c.height)+3),y1=Math.min(c.height,Math.floor((r.y+r.h)*c.height)-3),x0=Math.max(0,Math.ceil(r.x*c.width)+3),x1=Math.min(c.width,Math.floor((r.x+r.w)*c.width)-3);for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const k=(y*c.width+x)*4;if(d[k+3]>200&&Math.max(d[k],d[k+1],d[k+2])<180)return {x:x/c.width,y:y/c.height}}return null},{x:(box.x-area.x)/area.width,y:(box.y-area.y)/area.height,w:box.width/area.width,h:box.height/area.height})
    expect(point).not.toBeNull();return {x:area.x+point!.x*area.width,y:area.y+point!.y*area.height}
  }
  const second=await inkPoint(2);await page.keyboard.down('Shift');await page.mouse.click(second.x,second.y);await page.keyboard.up('Shift');await expect(page.locator('.lp-row.selected')).toHaveCount(2)
  const first=await inkPoint(1);await page.keyboard.down('Control');await page.mouse.click(first.x,first.y);await page.keyboard.up('Control');await expect(page.locator('.lp-row.selected')).toHaveCount(1)
  await page.getByRole('heading',{name:'Layers',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:'work/vector-words-selection.png'})
  await page.getByRole('button',{name:'Back to layout previews',exact:false}).click();await expect(page.getByText('Saved on this device')).toBeVisible();await page.reload()
  await page.getByRole('button',{name:/3 · Adapt/}).click();await page.getByRole('button',{name:'Edit Alshaheed - Mupi',exact:true}).click()
  await expect(rows).toHaveCount(5);await expect(canvas).toHaveAttribute('data-vector-ready','true');await expect(canvas).toHaveAttribute('data-vector-words','5');await expect(page.getByRole('alert')).toHaveCount(0)
  await page.getByRole('button',{name:'Back to layout previews',exact:false}).click()
  for(const name of await page.locator('.calibration-card h3').allTextContents()){
    await page.getByRole('button',{name:`Edit ${name}`,exact:true}).click()
    for(let i=1;i<=5;i++){await word(i).click();await page.getByLabel('Width (%)',{exact:true}).fill('10');await page.getByLabel('X position (%)',{exact:true}).fill(String(10+(i-1)*15));await page.getByLabel('Y position (%)',{exact:true}).fill('30')}
    await expect(page.locator('.calibration-canvas-frame .proof-canvas canvas')).toHaveAttribute('data-vector-words','5')
    await page.getByRole('button',{name:'Approve this guide',exact:true}).click();await page.getByRole('button',{name:'Back to layout previews',exact:false}).click()
  }
  await page.getByRole('button',{name:'Use these guides for full adaptation',exact:true}).click()
  const download=page.waitForEvent('download');page.once('dialog',d=>d.accept());await page.getByRole('button',{name:'Export review ZIP',exact:true}).click()
  const zip=unzipSync(fs.readFileSync((await(await download).path())!)),key=Object.keys(zip).find(k=>/1080x1920\.png$/.test(k))!
  expect(key).toBeDefined();const dimensions=await page.evaluate(async bytes=>{const image=await createImageBitmap(new Blob([new Uint8Array(bytes)],{type:'image/png'}));return [image.width,image.height]},Array.from(zip[key]));expect(dimensions).toEqual([1080,1920]);expect(errors).toEqual([])
})

test('existing pixel word pieces can be upgraded to their embedded Illustrator source without losing placements',async({page})=>{
  const fixture=process.env.IKEA_PSD;test.skip(!fixture||!fs.existsSync(fixture),'Private IKEA PSD required.')
  await page.goto('/');await expect(page.getByText('Saved on this device')).toBeVisible();await page.locator('input[type=file]').setInputFiles(fixture!)
  await page.getByRole('button',{name:'Continue to Analyse'}).click();await page.locator('button.lp-name',{hasText:/^Vector Smart Object$/}).click();await page.getByRole('button',{name:'Main headline',exact:true}).click()
  await page.getByRole('button',{name:'Trace original border',exact:true}).click()
  for(const [name,value] of [['X','99'],['Y','279'],['Width','1522'],['Height','732']])await page.getByRole('spinbutton',{name,exact:true}).fill(value)
  await page.getByRole('button',{name:'Use original border',exact:true}).click();await page.getByRole('button',{name:'Separate words (source pixels)',exact:true}).click()
  await page.getByRole('button',{name:/3 · Adapt/}).click();await page.getByRole('button',{name:'Edit Alshaheed - Mupi',exact:true}).click()
  await page.getByRole('button',{name:'Select layer Word 1 · source pixels',exact:true}).click();await page.getByLabel('Width (%)',{exact:true}).fill('40');await page.getByLabel('X position (%)',{exact:true}).fill('12')
  const before=await page.getByLabel('X position (%)',{exact:true}).inputValue()
  await page.getByRole('button',{name:'Use embedded Illustrator vectors',exact:true}).click()
  await expect(page.locator('.lp-row').filter({hasText:/Word [0-9]+ · embedded vector/})).toHaveCount(5)
  await expect(page.locator('.calibration-canvas-frame .proof-canvas canvas')).toHaveAttribute('data-vector-words','5');await expect(page.getByLabel('X position (%)',{exact:true})).toHaveValue(before)
  await page.getByRole('button',{name:'Undo',exact:true}).click();await expect(page.locator('.lp-row').filter({hasText:/Word [0-9]+ · source pixels/})).toHaveCount(5)
  await page.getByRole('button',{name:'Redo',exact:true}).click();await expect(page.locator('.calibration-canvas-frame .proof-canvas canvas')).toHaveAttribute('data-vector-words','5')
})

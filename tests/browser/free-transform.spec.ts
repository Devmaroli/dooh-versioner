import {test,expect,Page} from '@playwright/test'
import {writePsdBuffer} from 'ag-psd'
import {unzipSync} from 'fflate'
import fs from 'node:fs'
import {approveGuides} from './helpers'
const handle=(page:Page,name:string)=>page.getByRole('button',{name,exact:!name.startsWith('Back to')&&!name.startsWith('Continue to')})
async function drag(page:Page,name:string,dx:number,dy:number,shift=false){await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));const box=(await handle(page,name).boundingBox())!;if(shift)await page.keyboard.down('Shift');await page.mouse.move(box.x+box.width/2+2,box.y+box.height/2+1);await page.mouse.down();await page.mouse.move(box.x+box.width/2+2+dx,box.y+box.height/2+1+dy,{steps:8});await page.mouse.up();if(shift)await page.keyboard.up('Shift')}
test('native gizmo pins corners, stretches on Shift, rotates, cancels and coalesces window pointer inputs into one action',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await expect(page.getByText('Saved on this device')).toBeVisible()
  await page.locator('input[type=file]').setInputFiles({name:'matrix_EN.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=','base64')})
  await page.getByRole('button',{name:/3 · Adapt/}).click();await handle(page,'Edit Alshaheed - Mupi').click()
  const width=page.getByLabel('Width (%)',{exact:true}),x=page.getByLabel('X position (%)',{exact:true}),angle=page.getByLabel('Rotation (degrees)',{exact:true}),object=page.locator('.guide-object.selected')
  await width.fill('30');await x.fill('30');await page.getByLabel('Y position (%)',{exact:true}).fill('25')
  const initial=(await object.boundingBox())!;await drag(page,'Scale from bottom right',30,20);await expect.poll(async()=>Number(await width.inputValue())).toBeGreaterThan(30)
  const proportional=(await object.boundingBox())!;expect(proportional.x).toBeCloseTo(initial.x,1);expect(proportional.y).toBeCloseTo(initial.y,1);expect(proportional.width/proportional.height).toBeCloseTo(initial.width/initial.height,2)
  const previous=Number(await width.inputValue());await drag(page,'Scale from bottom right',30,0,true);await expect.poll(async()=>Number(await width.inputValue())).toBeGreaterThan(previous)
  const stretched=(await object.boundingBox())!;expect(stretched.x).toBeCloseTo(initial.x,1);expect(stretched.y).toBeCloseTo(initial.y,1);expect(stretched.width/stretched.height).toBeGreaterThan(proportional.width/proportional.height+0.1)
  const r=(await handle(page,'Rotate selection').boundingBox())!,centre={x:stretched.x+stretched.width/2,y:stretched.y+stretched.height/2},start={x:r.x+r.width/2,y:r.y+r.height/2}
  await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(centre.x-(start.y-centre.y),centre.y+(start.x-centre.x),{steps:8});await page.mouse.up();await expect.poll(async()=>Number(await angle.inputValue())).toBeCloseTo(90,1)
  const rotated=(await object.boundingBox())!;expect(rotated.x+rotated.width/2).toBeCloseTo(centre.x,1);expect(rotated.y+rotated.height/2).toBeCloseTo(centre.y,1)
  const savedX=await x.inputValue();await page.mouse.move(centre.x,centre.y);await page.mouse.down();await page.mouse.move(centre.x+30,centre.y+20,{steps:4});await page.keyboard.press('Escape');await page.mouse.up();await expect(x).toHaveValue(savedX);await expect(page.getByRole('dialog')).toBeVisible()
  // Record actual canvas clears, not React render counts. A burst must not paint synchronously.
  await page.evaluate(()=>{const canvas=document.querySelector<HTMLCanvasElement>('.calibration-canvas-frame .proof-canvas canvas')!,g=canvas.getContext('2d')!,clear=g.clearRect.bind(g);let paints=0;g.clearRect=(...args)=>{paints++;clear(...args)};(window as unknown as {matrixPaints:()=>number}).matrixPaints=()=>paints;window.addEventListener('pointerdown',e=>{(window as unknown as {matrixPointer:number}).matrixPointer=e.pointerId},{once:true})})
  await page.mouse.move(centre.x,centre.y);await page.mouse.down()
  const burst=await page.evaluate(async p=>{const state=window as unknown as {matrixPointer:number;matrixPaints:()=>number},before=state.matrixPaints();for(let i=1;i<=100;i++)window.dispatchEvent(new PointerEvent('pointermove',{pointerId:state.matrixPointer,clientX:p.x+i*.4,clientY:p.y+10,bubbles:true,buttons:1}));const sync=state.matrixPaints()-before;await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));return {sync,frames:state.matrixPaints()-before}},centre)
  expect(burst.sync).toBe(0);expect(burst.frames).toBeLessThanOrEqual(2)
  await page.mouse.move(centre.x+40,centre.y+10);await page.mouse.up();await expect.poll(async()=>Number(await x.inputValue())).toBeGreaterThan(Number(savedX))
  await handle(page,'Undo').click();await expect(x).toHaveValue(savedX);await handle(page,'Redo').click();await expect.poll(async()=>Number(await x.inputValue())).toBeGreaterThan(Number(savedX))
  await page.getByRole('heading',{name:'Layers',exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:'work/free-transform-gizmo.png'})
  await handle(page,'Back to layout previews').click();await expect(page.getByText('Saved on this device')).toBeVisible();await page.reload();await page.getByRole('button',{name:/3 · Adapt/}).click();await handle(page,'Edit Alshaheed - Mupi').click();await expect(angle).toHaveValue('90');expect(errors).toEqual([])
})
function pixels(rgb:number[],w:number,h:number){const data=new Uint8ClampedArray(w*h*4);for(let i=0;i<data.length;i+=4)data.set([...rgb,255],i);return {width:w,height:h,data}}
test('protected logos stay proportional; rotated screen edits are picked and exported at the same geometry',async({page})=>{
  test.setTimeout(180000);const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  const buffer=writePsdBuffer({width:64,height:64,imageData:pixels([80,120,160],64,64),children:[{name:'Base texture',left:0,top:0,imageData:pixels([80,120,160],64,64)},{name:'Headline',left:0,top:0,imageData:pixels([160,80,40],32,16)},{name:'Decoration',left:0,top:0,imageData:pixels([30,180,80],30,20)},{name:'Logo',left:0,top:0,imageData:pixels([230,180,20],20,10)}]},{generateThumbnail:false})
  await page.goto('/');await expect(page.getByText('Saved on this device')).toBeVisible();await page.locator('input[type=file]').setInputFiles({name:'rotation_EN.psd',mimeType:'application/octet-stream',buffer});await handle(page,'Continue to Analyse').click()
  for(const [name,role] of [['Base texture','Original background texture'],['Headline','Main headline'],['Decoration','Product / key visual'],['Logo','Brand logo']]){await page.locator('.analyse-layer').filter({hasText:name}).click();await handle(page,role).click()}
  await approveGuides(page);await page.getByRole('button',{name:'Artwork Alshaheed - Mupi EN; double-click to refine',exact:true}).dblclick()
  const choose=(name:string)=>handle(page,`Select layer ${name}`).click(),width=page.getByLabel('Width (%)',{exact:true}),x=page.getByLabel('X position (%)',{exact:true}),y=page.getByLabel('Y position (%)',{exact:true})
  await choose('Headline');await width.fill('10');await x.fill('5');await y.fill('5')
  await choose('Logo');await width.fill('10');await x.fill('5');await y.fill('60');const before=(await page.locator('.guide-object.selected').boundingBox())!,previous=Number(await width.inputValue());await drag(page,'Scale from bottom right',25,0,true);await expect.poll(async()=>Number(await width.inputValue())).toBeGreaterThan(previous);const after=(await page.locator('.guide-object.selected').boundingBox())!;expect(after.width/after.height).toBeCloseTo(before.width/before.height,2)
  await choose('Decoration');await width.fill('30');await x.fill('40');await y.fill('35');await page.getByLabel('Rotation (degrees)',{exact:true}).fill('90')
  const sample=()=>page.locator('.calibration-canvas-frame .proof-canvas canvas').evaluate((c:HTMLCanvasElement)=>Array.from(c.getContext('2d')!.getImageData(Math.floor(c.width*.48),Math.floor(c.height*.34),1,1).data));await expect.poll(sample).toEqual([30,180,80,255])
  const box=(await page.locator('.calibration-canvas-frame').boundingBox())!;await choose('Headline');await page.mouse.click(box.x+box.width*.48,box.y+box.height*.34);await expect(page.getByLabel('Element',{exact:true})).toHaveValue(/layer:/);await expect(handle(page,'Select layer Decoration').locator('..')).toHaveAttribute('aria-selected','true')
  await expect(page.getByLabel('Rotation (degrees)',{exact:true})).toHaveValue('90');await handle(page,'Approve this adaptation').click();await handle(page,'Back to adaptations').click()
  const download=page.waitForEvent('download');page.once('dialog',d=>d.accept());await handle(page,'Export review ZIP').click();const zip=unzipSync(fs.readFileSync((await(await download).path())!)),key=Object.keys(zip).find(k=>/1080x1920\.png$/.test(k))!;expect(key).toBeDefined()
  const pixel=await page.evaluate(async bytes=>{const image=await createImageBitmap(new Blob([new Uint8Array(bytes)],{type:'image/png'})),c=document.createElement('canvas');c.width=image.width;c.height=image.height;const g=c.getContext('2d')!;g.drawImage(image,0,0);return Array.from(g.getImageData(Math.floor(c.width*.48),Math.floor(c.height*.34),1,1).data)},Array.from(zip[key]));expect(pixel).toEqual([30,180,80,255]);expect(errors).toEqual([])
})

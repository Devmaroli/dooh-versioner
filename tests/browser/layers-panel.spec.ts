import { expect, test } from '@playwright/test'
import { writePsdBuffer } from 'ag-psd'

function pixels(rgb: number[]) {
  const data = new Uint8ClampedArray(64*64*4)
  for(let i=0;i<data.length;i+=4)data.set([...rgb,255],i)
  return {width:64,height:64,data}
}
test('layer thumbnails, locks, fill, masks, styles, groups and adjustments affect the canvas and persist', async ({ page }) => {
  test.setTimeout(180000)
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message))
  const buffer=writePsdBuffer({width:64,height:64,imageData:pixels([80,120,160]),children:[
    {name:'Base texture',left:0,top:0,imageData:pixels([80,120,160])},
    {name:'Top headline',left:0,top:0,imageData:pixels([160,80,40])}
  ]},{generateThumbnail:false})
  await page.goto('/');await expect(page.getByText('Saved on this device')).toBeVisible()
  await page.locator('input[type=file]').setInputFiles({name:'panel_EN.psd',mimeType:'application/octet-stream',buffer})
  await page.getByRole('button',{name:'Continue to Analyse'}).click()
  await page.locator('.analyse-layer').filter({hasText:'Top headline'}).click();await page.getByRole('button',{name:'Main headline',exact:true}).click()
  await page.locator('.analyse-layer').filter({hasText:'Base texture'}).click();await page.getByRole('button',{name:'Original background texture',exact:true}).click()
  await page.getByRole('button',{name:/3 · Adapt/}).click();await page.getByRole('button',{name:'Edit Alshaheed - Mupi',exact:true}).click()
  const select=()=>page.getByRole('button',{name:'Select layer Top headline',exact:true})
  await select().click()
  for(const size of [100,200,300]){
    await page.getByLabel('Layer thumbnail size').selectOption(String(size))
    const box=(await select().boundingBox())!;expect(box.width).toBe(size);expect(box.height).toBe(size)
    expect(await select().evaluate(e=>getComputedStyle(e).backgroundImage)).toContain('conic-gradient')
  }
  await page.getByRole('heading',{name:'Layers',exact:true}).scrollIntoViewIfNeeded()
  await page.screenshot({path:'work/layers-panel-300.png'})
  await page.getByLabel('Layer thumbnail size').selectOption('100')
  await page.getByRole('button',{name:'Lock Position',exact:true}).click()
  await expect(page.getByLabel('X position (%)',{exact:true})).toBeDisabled()
  await page.getByRole('button',{name:'Lock Position',exact:true}).click()
  await page.getByLabel('Width (%)',{exact:true}).fill('50');await page.getByLabel('X position (%)',{exact:true}).fill('10');await page.getByLabel('Y position (%)',{exact:true}).fill('10')
  const sample=(x=.2,y=.2)=>page.locator('.calibration-canvas-frame .proof-canvas canvas').evaluate((c:HTMLCanvasElement,p)=>Array.from(c.getContext('2d')!.getImageData(Math.floor(c.width*p.x),Math.floor(c.height*p.y),1,1).data),{x,y})
  expect(await sample()).toEqual([160,80,40,255])
  await page.getByRole('button',{name:'Hide layer Top headline',exact:true}).click();expect(await sample()).toEqual([80,120,160,255])
  await page.getByRole('button',{name:'Show layer Top headline',exact:true}).click()
  await page.getByRole('button',{name:'Lock Transparency',exact:true}).click();await expect(page.getByLabel('Layer fill',{exact:true})).toBeDisabled();await expect(page.getByRole('button',{name:'Add layer mask',exact:true})).toBeDisabled()
  await page.getByRole('button',{name:'Lock Transparency',exact:true}).click()
  await page.getByLabel('Fill percentage',{exact:true}).fill('0');expect(await sample()).toEqual([80,120,160,255])
  await page.getByRole('button',{name:'Layer styles',exact:true}).click();await page.getByLabel('Enable inner stroke').check()
  expect(await sample(.105,.105)).toEqual([0,0,0,255]);expect(await sample()).toEqual([80,120,160,255])
  await page.getByLabel('Enable inner stroke').uncheck();await page.getByLabel('Fill percentage',{exact:true}).fill('100')
  await page.getByRole('button',{name:'Add layer mask',exact:true}).click();await page.getByLabel('Mask w (%)',{exact:true}).fill('50')
  expect(await sample(.2,.2)).toEqual([160,80,40,255]);expect(await sample(.5,.2)).toEqual([80,120,160,255])
  await page.getByRole('button',{name:'Unlink mask',exact:true}).click();await expect(page.getByRole('button',{name:'Link mask',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Remove mask',exact:true}).click()
  await page.getByRole('button',{name:'Rename Top headline',exact:true}).click();await page.getByLabel('Layer name',{exact:true}).fill('Campaign headline');await page.getByLabel('Layer name',{exact:true}).press('Enter')
  await page.getByLabel('Filter layers by name').fill('Campaign');await expect(page.locator('.lp-row')).toHaveCount(1);await page.getByLabel('Filter layers by name').fill('')
  await page.getByRole('button',{name:'Create group',exact:true}).click();await expect(page.getByRole('button',{name:'Collapse Group',exact:true})).toBeVisible()
  await page.getByRole('button',{name:'Hide layer Group',exact:true}).click();expect(await sample()).toEqual([80,120,160,255])
  await page.getByRole('button',{name:'Show layer Group',exact:true}).click();expect(await sample()).toEqual([160,80,40,255])
  await page.getByRole('button',{name:'Lock All',exact:true}).click();await page.getByRole('button',{name:'Select layer Campaign headline',exact:true}).click();await expect(page.getByLabel('Layer opacity',{exact:true})).toBeDisabled();await expect(page.getByLabel('Width (%)',{exact:true})).toBeDisabled()
  await page.getByRole('button',{name:'Select layer Group',exact:true}).click();await page.getByRole('button',{name:'Lock All',exact:true}).click()
  await page.getByRole('button',{name:'Add adjustment layer',exact:true}).click();await page.getByLabel('Adjustment brightness').focus();await page.keyboard.press('Home');expect(await sample()).toEqual([0,0,0,255])
  await page.getByRole('button',{name:'Delete layer',exact:true}).click();expect(await sample()).toEqual([160,80,40,255])
  await page.getByRole('button',{name:'Create new layer',exact:true}).click();expect(await sample()).toEqual([160,80,40,255]);await page.getByRole('button',{name:'Delete layer',exact:true}).click()
  await page.getByLabel('Layer thumbnail size').selectOption('200');await page.screenshot({path:'work/layers-panel-200.png'})
  await page.getByRole('button',{name:'Back to five previews',exact:false}).click();await expect(page.getByText('Saved on this device')).toBeVisible();await page.reload()
  await page.getByRole('button',{name:/3 · Adapt/}).click();await page.getByRole('button',{name:'Edit Alshaheed - Mupi',exact:true}).click()
  await expect(page.getByLabel('Layer thumbnail size')).toHaveValue('200');await expect(page.getByRole('button',{name:'Select layer Campaign headline',exact:true})).toBeVisible();expect(await sample()).toEqual([160,80,40,255]);expect(errors).toEqual([])
})

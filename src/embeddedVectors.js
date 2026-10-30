// Embedded PDF-compatible Illustrator sources stay attached to the original PSD.
// Only explicitly prepared text pieces use this path; logos are never segmented.
const documents = new WeakMap()
let library
async function pdfLibrary() {
  if (!library) library = import('pdfjs-dist/build/pdf.mjs').then(async pdf => {
    const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url')
    pdf.GlobalWorkerOptions.workerSrc = worker.default
    return pdf
  })
  return library
}
function inkBounds(canvas) {
  const {width:w,height:h}=canvas,data=canvas.getContext('2d').getImageData(0,0,w,h).data
  let x=w,y=h,right=-1,bottom=-1
  for(let yy=0;yy<h;yy++)for(let xx=0;xx<w;xx++)if(data[(yy*w+xx)*4+3]>16){x=Math.min(x,xx);y=Math.min(y,yy);right=Math.max(right,xx);bottom=Math.max(bottom,yy)}
  if(right<0)throw new Error('The embedded Illustrator page contains no visible artwork.')
  return {x,y,w:right-x+1,h:bottom-y+1}
}
async function vectorDocument(layer) {
  const source=layer.vectorPdf
  if(!source)throw new Error('No PDF-compatible Illustrator source is embedded for this text.')
  if(!documents.has(source))documents.set(source,(async()=>{
    const t=source.transform
    if(t&&(Math.abs(t[1]-t[3])>.01||Math.abs(t[0]-t[6])>.01||t[2]<=t[0]||t[5]<=t[1]))throw new Error('This smart object has a rotated, mirrored or warped placement. Vector word mapping needs review.')
    const pdf=await pdfLibrary(),task=pdf.getDocument({data:source.data.slice(),isEvalSupported:false,useSystemFonts:false,useWorkerFetch:false,useWasm:false,maxImageSize:40000000,canvasMaxAreaInBytes:160000000})
    try {
      const pdfDoc=await task.promise,page=await pdfDoc.getPage(source.page||1),base=page.getViewport({scale:1}),viewport=page.getViewport({scale:Math.min(1,1600/Math.max(base.width,base.height))})
      const c=document.createElement('canvas');c.width=Math.ceil(viewport.width);c.height=Math.ceil(viewport.height)
      await page.render({canvasContext:c.getContext('2d'),viewport,background:'rgba(0,0,0,0)'}).promise
      const ink=inkBounds(c),cached=inkBounds(layer.px),ratio=(ink.w/ink.h)/(cached.w/cached.h)
      if(Math.abs(ratio-1)>.025)throw new Error('The embedded Illustrator bounds do not match the PSD preview. Keep the original pixels and review the smart object.')
      const size=128,a=document.createElement('canvas'),b=document.createElement('canvas');a.width=b.width=size;a.height=b.height=Math.max(1,Math.round(size*cached.h/cached.w))
      a.getContext('2d').drawImage(c,ink.x,ink.y,ink.w,ink.h,0,0,a.width,a.height);b.getContext('2d').drawImage(layer.px,cached.x,cached.y,cached.w,cached.h,0,0,b.width,b.height)
      const aa=a.getContext('2d').getImageData(0,0,a.width,a.height).data,bb=b.getContext('2d').getImageData(0,0,b.width,b.height).data;let difference=0
      for(let i=0;i<aa.length;i+=4){difference+=Math.abs(aa[i+3]-bb[i+3]);for(let k=0;k<3;k++)difference+=Math.abs(aa[i+k]*aa[i+3]/255-bb[i+k]*bb[i+3]/255)}
      if(difference/(aa.length*255)>.06)throw new Error('The embedded Illustrator artwork differs from the PSD preview. Review the source before replacing cached pixels.')
      return {page,task,base,ink:{x:ink.x/viewport.scale,y:ink.y/viewport.scale,w:ink.w/viewport.scale,h:ink.h/viewport.scale},cached}
    } catch(error){await task.destroy();throw error}
  })())
  return documents.get(source)
}
export async function verifyEmbeddedVector(layer) { await vectorDocument(layer);return true }
export function vectorRasterKey(layer,box,w,h) { return JSON.stringify([layer.wordSourceId||layer.id,box,Math.max(1,Math.ceil(w-1e-3)),Math.max(1,Math.ceil(h-1e-3))]) }
export async function renderVectorCrop(layer,box,w,h) {
  const {page,base,ink,cached}=await vectorDocument(layer),[lx,ly,lw,lh]=layer.sourceBox||layer.box
  const x=(box.x-lx)/lw*layer.px.width,y=(box.y-ly)/lh*layer.px.height,cw=box.w/lw*layer.px.width,ch=box.h/lh*layer.px.height
  const rect={x:ink.x+(x-cached.x)/cached.w*ink.w,y:ink.y+(y-cached.y)/cached.h*ink.h,w:cw/cached.w*ink.w,h:ch/cached.h*ink.h}
  const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h))
  if(c.width*c.height>40000000)throw new Error('This vector word exceeds the supported 40 megapixel render buffer.')
  await page.render({canvasContext:c.getContext('2d'),viewport:base,transform:[c.width/rect.w,0,0,c.height/rect.h,-rect.x*c.width/rect.w,-rect.y*c.height/rect.h],background:'rgba(0,0,0,0)'}).promise
  return c
}

export function releaseEmbeddedVectors(art) {
  function visit(layers){for(const layer of layers||[]){const doc=layer.vectorPdf&&documents.get(layer.vectorPdf);if(doc){documents.delete(layer.vectorPdf);doc.then(value=>value.task.destroy()).catch(()=>{})}visit(layer.children)}}
  visit(art.a.layers);art.VR?.clear()
}

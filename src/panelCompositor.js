import { compositeDraw, blendPixel, layerStyle } from './blending.js'
import { drawSourceLayers } from './artwork.js'
import { effectiveVisible } from './layerPanelModel'

export function clipPanelMask(ctx, mask, frame, screen) {
  if (!mask?.enabled || mask.kind !== 'path') return
  if(mask.pathData&&!mask.rect){const m=ctx.getTransform();ctx.translate(frame.x,frame.y);ctx.scale(frame.w,frame.h);ctx.clip(new Path2D(mask.pathData),'evenodd');ctx.setTransform(m);return}
  const r = mask.linked || !mask.canvasRect ? { x: frame.x + (mask.rect?.x || 0) * frame.w, y: frame.y + (mask.rect?.y || 0) * frame.h, w: (mask.rect?.w ?? 1) * frame.w, h: (mask.rect?.h ?? 1) * frame.h } : {x:mask.canvasRect.x*screen.w,y:mask.canvasRect.y*screen.h,w:mask.canvasRect.w*screen.w,h:mask.canvasRect.h*screen.h}
  ctx.beginPath(); ctx.rect(r.x,r.y,r.w,r.h); ctx.clip()
}
export function stylePixels(canvas, fill, fx) {
  const stroke=fx?.stroke, g=canvas.getContext('2d'), image=g.getImageData(0,0,canvas.width,canvas.height), data=image.data
  const alpha=stroke?.enabled?Uint8Array.from({length:data.length/4},(_,i)=>data[i*4+3]):null
  const color=stroke?.color || '#000000', rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)), radius=Math.max(1,Math.round(stroke?.width || 1))
  for(let p=0;p<data.length/4;p++) {
    const i=p*4, sourceAlpha=data[i+3]/255, baseAlpha=sourceAlpha*fill
    if(!sourceAlpha)continue
    let edge=0
    if(alpha){const x=p%canvas.width,y=Math.floor(p/canvas.width);let inside=alpha[p];for(const [dx,dy] of [[-radius,0],[radius,0],[0,-radius],[0,radius],[-radius,-radius],[radius,radius],[-radius,radius],[radius,-radius]]){const xx=x+dx,yy=y+dy;inside=Math.min(inside,xx<0||yy<0||xx>=canvas.width||yy>=canvas.height?0:alpha[yy*canvas.width+xx])}edge=(alpha[p]-inside)/255*(stroke.opacity??1)}
    const a=edge+baseAlpha*(1-edge)
    for(let k=0;k<3;k++)data[i+k]=a?Math.round((rgb[k]*edge+data[i+k]*baseAlpha*(1-edge))/a):0
    data[i+3]=Math.round(a*255)
  }
  g.putImageData(image,0,0)
}
export function preparedLayerSource(layer, box, node, cache) {
  if ((node?.fill ?? layer.fillOpacity ?? 1)===1 && !node?.fx?.stroke?.enabled && !(node?.mask?.enabled && node.mask.kind==='bitmap' && layer.maskPx)) return null
  const key=JSON.stringify([layer.id,box,node?.fill??layer.fillOpacity??1,node?.fx,node?.mask])
  if(cache.has(key))return cache.get(key)
  if(cache.size>32)cache.clear()
  const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(box.w));c.height=Math.max(1,Math.ceil(box.h))
  const g=c.getContext('2d');g.translate(-box.x,-box.y);drawSourceLayers(g,[layer],false,true);g.resetTransform()
  stylePixels(c,node?.fill??layer.fillOpacity??1,node?.fx)
  if(node?.mask?.enabled && node.mask.kind==='bitmap' && layer.maskPx){
    const mask=layer.maskPx, m=mask.getContext('2d').getImageData(0,0,mask.width,mask.height).data, r=layer.mask?.sourceRect || {x:layer.box[0],y:layer.box[1],w:mask.width,h:mask.height}, image=g.getImageData(0,0,c.width,c.height)
    for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){const xx=Math.floor((box.x+x-r.x)/r.w*mask.width),yy=Math.floor((box.y+y-r.y)/r.h*mask.height),value=xx<0||yy<0||xx>=mask.width||yy>=mask.height?(layer.mask?.defaultColor??255):m[(yy*mask.width+xx)*4];image.data[(y*c.width+x)*4+3]*=value/255}
    g.putImageData(image,0,0)
  }
  cache.set(key,c);return c
}
export function applyPanelAdjustment(ctx,node,screen) {
  const m=ctx.getTransform(), amount=node.opacity*node.fill, brightness=1+(node.adjustment?.brightness||0)/100, contrast=1+(node.adjustment?.contrast||0)/100
  if(!amount || brightness===1&&contrast===1)return
  for(let y=0;y<ctx.canvas.height;y+=128)for(let x=0;x<ctx.canvas.width;x+=256){const image=ctx.getImageData(x,y,Math.min(256,ctx.canvas.width-x),Math.min(128,ctx.canvas.height-y)), d=image.data
    for(let i=0;i<d.length;i+=4){if(!d[i+3])continue;const px=(x+i/4%image.width-m.e)/m.a,py=(y+Math.floor(i/4/image.width)-m.f)/m.d,r=node.mask?.rect
      if(node.mask?.enabled&&r&&(px<r.x*screen.w||py<r.y*screen.h||px>(r.x+r.w)*screen.w||py>(r.y+r.h)*screen.h))continue
      const top=[0,1,2].map(k=>Math.max(0,Math.min(255,((d[i+k]/255*brightness-.5)*contrast+.5)*255)))
      const result=blendPixel(Array.from(d.subarray(i,i+4)),[...top,255],node.blendMode,amount);result[3]=d[i+3];d.set(result,i)
    }ctx.putImageData(image,x,y)
  }
}
export function paintPanelTree(ctx, panel, screen, getBounds, paintLeaf) {
  const children=id=>panel.nodes.filter(n=>!n.deleted&&n.parentId===id)
  function bounds(node){if(node.type!=='group')return getBounds(node);const boxes=children(node.id).map(bounds).filter(Boolean);if(!boxes.length)return null;const x=Math.max(0,Math.min(...boxes.map(b=>b.x))),y=Math.max(0,Math.min(...boxes.map(b=>b.y))),right=Math.min(screen.w,Math.max(...boxes.map(b=>b.x+b.w))),bottom=Math.min(screen.h,Math.max(...boxes.map(b=>b.y+b.h)));return {x,y,w:right-x,h:bottom-y}}
  function paint(g,node){if(!effectiveVisible(panel,node.id))return
    if(node.type==='adjustment'){applyPanelAdjustment(g,node,screen);return}
    if(node.type!=='group'){paintLeaf(g,node);return}
    const kids=children(node.id).reverse(), box=bounds(node);if(!box||box.w<=0||box.h<=0)return
    if(node.blendMode==='pass-through'&&node.opacity===1&&node.fill===1&&!node.mask?.enabled&&!node.fx?.stroke?.enabled){kids.forEach(child=>paint(g,child));return}
    const m=g.getTransform(), c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(box.w*Math.abs(m.a)));c.height=Math.max(1,Math.ceil(box.h*Math.abs(m.d)))
    if(c.width*c.height>40000000)throw new Error('This isolated group exceeds the supported 40 megapixel compositing buffer.')
    const temp=c.getContext('2d');temp.setTransform(m.a,m.b,m.c,m.d,-box.x*m.a,-box.y*m.d);kids.forEach(child=>paint(temp,child));temp.resetTransform()
    if(node.fill!==1||node.fx?.stroke?.enabled)stylePixels(c,node.fill,node.fx)
    compositeDraw(g,t=>{t.save();clipPanelMask(t,node.mask,box,screen);t.drawImage(c,box.x,box.y,box.w,box.h);t.restore()},layerStyle(null,{blend:node.blendMode,opacity:node.opacity}),box)
  }
  children(null).reverse().forEach(node=>paint(ctx,node))
}

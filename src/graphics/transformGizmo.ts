import { AffineMatrix, Point, apply, corners, multiply } from './affine'
import { TransformGeometry, gizmoHandles } from './freeTransform'
export function drawTransformGizmo(ctx:CanvasRenderingContext2D,geometry:TransformGeometry,viewport:AffineMatrix,locked=false):void {
  const points=corners(multiply(viewport,geometry.matrix),geometry.bounds),handles=gizmoHandles(geometry,viewport)
  ctx.save();ctx.lineWidth=1;ctx.strokeStyle=locked?'#b1bed2':'#a6c6ff';ctx.fillStyle='#fff';ctx.shadowColor='#111c2e';ctx.shadowBlur=1
  ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.closePath();ctx.stroke()
  if(!locked){
    const top=handles.find(h=>h.id==='n')!,rotate=handles.find(h=>h.id==='rotate')!
    ctx.beginPath();ctx.moveTo(top.point.x,top.point.y);ctx.lineTo(rotate.point.x,rotate.point.y);ctx.stroke()
    for(const h of handles){ctx.beginPath();if(h.id==='rotate')ctx.arc(h.point.x,h.point.y,5,0,Math.PI*2);else ctx.rect(h.point.x-4,h.point.y-4,8,8);ctx.fill();ctx.stroke()}
  }
  const b=geometry.bounds,centre:Point=apply(multiply(viewport,geometry.matrix),{x:b.x+b.width/2,y:b.y+b.height/2})
  ctx.beginPath();ctx.moveTo(centre.x-4,centre.y);ctx.lineTo(centre.x+4,centre.y);ctx.moveTo(centre.x,centre.y-4);ctx.lineTo(centre.x,centre.y+4);ctx.stroke();ctx.restore()
}

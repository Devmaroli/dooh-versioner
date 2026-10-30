import { AffineMatrix, Bounds, Point, UNIT_BOUNDS, apply, inverse, multiply, around, rotateAt, translation } from './affine'
export const RESIZE_HANDLES = ['nw','n','ne','e','se','s','sw','w'] as const
export type ResizeHandle = typeof RESIZE_HANDLES[number]
export type TransformHandle = ResizeHandle | 'rotate' | 'body'
export interface HandlePoint { readonly id: TransformHandle; readonly point: Point }
export interface TransformGeometry { readonly matrix: AffineMatrix; readonly bounds: Bounds }
export interface Gesture { readonly geometry:TransformGeometry; readonly handle:TransformHandle; readonly down:Point; readonly anchor:Point; readonly handlePoint:Point; readonly offset:Point; readonly centre:Point }
export interface TransformModifiers { readonly shift:boolean; readonly preserveAspect:boolean }
const positions:Record<ResizeHandle,Point>={nw:{x:0,y:0},n:{x:.5,y:0},ne:{x:1,y:0},e:{x:1,y:.5},se:{x:1,y:1},s:{x:.5,y:1},sw:{x:0,y:1},w:{x:0,y:.5}}
export function localHandle(box:Bounds,id:ResizeHandle):Point {const p=positions[id];return {x:box.x+p.x*box.width,y:box.y+p.y*box.height}}
export function gizmoHandles(geometry:TransformGeometry,viewport:AffineMatrix):readonly HandlePoint[] {
  const matrix=multiply(viewport,geometry.matrix),resize=RESIZE_HANDLES.map(id=>({id,point:apply(matrix,localHandle(geometry.bounds,id))})),top=resize[1].point,first=resize[0].point,last=resize[2].point
  const centre=apply(matrix,{x:geometry.bounds.x+geometry.bounds.width/2,y:geometry.bounds.y+geometry.bounds.height/2})
  let nx=last.y-first.y,ny=first.x-last.x;const length=Math.hypot(nx,ny)||1
  if(nx*(top.x-centre.x)+ny*(top.y-centre.y)<0){nx=-nx;ny=-ny}
  return [...resize,{id:'rotate',point:{x:top.x+nx/length*28,y:top.y+ny/length*28}}]
}
/** Hit radii are CSS pixels, independent of zoom/DPR, rotation and object scale. */
export function hitTest(point:Point,geometry:TransformGeometry,viewport:AffineMatrix,radius=8):TransformHandle|null {
  const handles=gizmoHandles(geometry,viewport)
  for(const handle of handles)if(Math.hypot(point.x-handle.point.x,point.y-handle.point.y)<=radius)return handle.id
  const local=apply(inverse(multiply(viewport,geometry.matrix)),point),b=geometry.bounds
  return local.x>=b.x&&local.y>=b.y&&local.x<=b.x+b.width&&local.y<=b.y+b.height?'body':null
}
export function beginGesture(geometry:TransformGeometry,handle:TransformHandle,world:Point,customAnchor?:Point):Gesture {
  const b=geometry.bounds,centre=apply(geometry.matrix,{x:b.x+b.width/2,y:b.y+b.height/2}),p=handle==='body'||handle==='rotate'?{x:b.x+b.width/2,y:b.y+b.height/2}:localHandle(b,handle)
  const custom=customAnchor?{x:b.x+customAnchor.x*b.width,y:b.y+customAnchor.y*b.height}:null
  const anchor=custom&&Math.hypot(custom.x-p.x,custom.y-p.y)>1e-9?custom:{x:2*b.x+b.width-p.x,y:2*b.y+b.height-p.y}
  const local=apply(inverse(geometry.matrix),world)
  return {geometry,handle,down:world,anchor,handlePoint:p,offset:{x:local.x-p.x,y:local.y-p.y},centre}
}
/** Recompute from the pointerdown matrix, never accumulated frame deltas. */
export function updateGesture(g:Gesture,world:Point,modifiers:TransformModifiers):AffineMatrix {
  const start=g.geometry.matrix
  if(Math.hypot(world.x-g.down.x,world.y-g.down.y)<1e-9)return start
  if(g.handle==='body')return multiply(translation(world.x-g.down.x,world.y-g.down.y),start)
  if(g.handle==='rotate'){
    let angle=Math.atan2(world.y-g.centre.y,world.x-g.centre.x)-Math.atan2(g.down.y-g.centre.y,g.down.x-g.centre.x)
    if(modifiers.shift)angle=Math.round(angle/(Math.PI/12))*Math.PI/12
    return rotateAt(start,g.centre,angle)
  }
  // Subtract the cached pointer/handle offset before measuring either scale axis.
  const local=apply(inverse(start),world),p={x:local.x-g.offset.x,y:local.y-g.offset.y},dx=g.handlePoint.x-g.anchor.x,dy=g.handlePoint.y-g.anchor.y
  let sx=dx?(p.x-g.anchor.x)/dx:1,sy=dy?(p.y-g.anchor.y)/dy:1
  const corner=dx!==0&&dy!==0,uniform=modifiers.preserveAspect||(corner?!modifiers.shift:modifiers.shift)
  if(uniform){
    const a=apply(start,g.anchor),h=apply(start,g.handlePoint),target=apply(start,p),vx=h.x-a.x,vy=h.y-a.y,length=vx*vx+vy*vy
    sx=sy=length?((target.x-a.x)*vx+(target.y-a.y)*vy)/length:1
  }
  // Mirroring/singular matrices are excluded; logos and required text cannot flip.
  sx=Math.max(.01,Math.min(100,sx));sy=Math.max(.01,Math.min(100,sy))
  return multiply(start,around(g.anchor,{a:sx,b:0,c:0,d:sy,tx:0,ty:0}))
}
export const unitGeometry=(matrix:AffineMatrix):TransformGeometry=>({matrix,bounds:UNIT_BOUNDS})

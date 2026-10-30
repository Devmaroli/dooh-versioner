export interface Point { readonly x: number; readonly y: number }
export interface Bounds { readonly x: number; readonly y: number; readonly width: number; readonly height: number }
/** Column vectors: [a c tx; b d ty; 0 0 1]. All calculations use JS doubles. */
export interface AffineMatrix { readonly a: number; readonly b: number; readonly c: number; readonly d: number; readonly tx: number; readonly ty: number }
export interface NormalizedFrame { x: number; y: number; w: number; h: number }
export interface ScreenSize { w: number; h: number }
export const IDENTITY: AffineMatrix = {a:1,b:0,c:0,d:1,tx:0,ty:0}
export const UNIT_BOUNDS: Bounds = {x:0,y:0,width:1,height:1}
export function multiply(left:AffineMatrix,right:AffineMatrix):AffineMatrix {
  return {a:left.a*right.a+left.c*right.b,b:left.b*right.a+left.d*right.b,c:left.a*right.c+left.c*right.d,d:left.b*right.c+left.d*right.d,tx:left.a*right.tx+left.c*right.ty+left.tx,ty:left.b*right.tx+left.d*right.ty+left.ty}
}
export function inverse(m:AffineMatrix):AffineMatrix {
  const det=m.a*m.d-m.b*m.c
  if(!Number.isFinite(det)||Math.abs(det)<1e-12)throw new Error('The transform is singular.')
  return {a:m.d/det,b:-m.b/det,c:-m.c/det,d:m.a/det,tx:(m.c*m.ty-m.d*m.tx)/det,ty:(m.b*m.tx-m.a*m.ty)/det}
}
export function apply(m:AffineMatrix,p:Point):Point {return {x:m.a*p.x+m.c*p.y+m.tx,y:m.b*p.x+m.d*p.y+m.ty}}
export const translation=(x:number,y:number):AffineMatrix=>({...IDENTITY,tx:x,ty:y})
export function around(point:Point,operation:AffineMatrix):AffineMatrix {return multiply(translation(point.x,point.y),multiply(operation,translation(-point.x,-point.y)))}
export function rotateAt(m:AffineMatrix,p:Point,radians:number):AffineMatrix {
  const c=Math.cos(radians),s=Math.sin(radians)
  return multiply(around(p,{a:c,b:s,c:-s,d:c,tx:0,ty:0}),m)
}
export function corners(m:AffineMatrix,box:Bounds=UNIT_BOUNDS):readonly Point[] {
  return [{x:box.x,y:box.y},{x:box.x+box.width,y:box.y},{x:box.x+box.width,y:box.y+box.height},{x:box.x,y:box.y+box.height}].map(p=>apply(m,p))
}
export function transformedBounds(m:AffineMatrix,box:Bounds=UNIT_BOUNDS):Bounds {
  const points=corners(m,box),x=Math.min(...points.map(p=>p.x)),y=Math.min(...points.map(p=>p.y))
  return {x,y,width:Math.max(...points.map(p=>p.x))-x,height:Math.max(...points.map(p=>p.y))-y}
}
export function frameMatrix(frame:NormalizedFrame,screen:ScreenSize):AffineMatrix {return {a:frame.w*screen.w,b:0,c:0,d:frame.h*screen.h,tx:frame.x*screen.w,ty:frame.y*screen.h}}
export function placementMatrix(frame:NormalizedFrame,screen:ScreenSize,delta:AffineMatrix=IDENTITY):AffineMatrix {return multiply(frameMatrix(frame,screen),delta)}
export function matrixForBounds(box:Bounds):AffineMatrix {return {a:box.width,b:0,c:0,d:box.height,tx:box.x,ty:box.y}}
export function cssLocalTransform(delta:AffineMatrix,frame:NormalizedFrame,screen:ScreenSize):string {
  const w=frame.w*screen.w,h=frame.h*screen.h
  return `translate(${delta.tx*100}%,${delta.ty*100}%) matrix(${delta.a},${delta.b*h/w},${delta.c*w/h},${delta.d},0,0)`
}

export function sameMatrix(left:AffineMatrix,right:AffineMatrix):boolean {return (['a','b','c','d','tx','ty'] as const).every(key=>Math.abs(left[key]-right[key])<=1e-12*Math.max(1,Math.abs(left[key]),Math.abs(right[key])))}

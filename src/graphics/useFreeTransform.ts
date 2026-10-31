import { RefObject, useEffect, useRef } from 'react'
import { AffineMatrix, Point, ScreenSize, apply, inverse, sameMatrix } from './affine'
import { Gesture, HandlePoint, TransformGeometry, TransformHandle, beginGesture, gizmoHandles, hitTest, updateGesture } from './freeTransform'
import { drawTransformGizmo } from './transformGizmo'
export interface TransformStart { readonly geometry:TransformGeometry; readonly handle:TransformHandle }
export interface FreeTransformOptions {
  readonly canvas:RefObject<HTMLCanvasElement>; readonly world:ScreenSize; readonly geometry:TransformGeometry|null
  readonly locked?:boolean; readonly preserveAspect?:boolean; readonly anchor?:Point; readonly padding?:number
  readonly viewport?:()=>AffineMatrix
  readonly onHandles?:(handles:readonly HandlePoint[],viewport:AffineMatrix)=>void
  readonly onBegin?:(start:TransformStart)=>void
  readonly onPreview:(matrix:AffineMatrix)=>void; readonly onCommit:(matrix:AffineMatrix)=>void; readonly onCancel?:()=>void; readonly onError?:(error:Error)=>void
}
export interface BeginOverride { readonly geometry:TransformGeometry; readonly handle?:TransformHandle; readonly locked?:boolean; readonly preserveAspect?:boolean }
interface PointerSample { readonly clientX:number; readonly clientY:number; readonly shift:boolean }
interface Session { readonly gesture:Gesture; readonly pointerId:number; readonly preserveAspect:boolean; latest:PointerSample; matrix:AffineMatrix; painted:AffineMatrix; finish:boolean }
interface View { readonly matrix:AffineMatrix; readonly left:number; readonly top:number; readonly width:number; readonly height:number }
/** Pointer listeners only cache inputs. Matrix solving and both drawing callbacks run in RAF. */
export function useFreeTransform(options:FreeTransformOptions) {
  const live=useRef(options);live.current=options
  const session=useRef<Session|null>(null),frame=useRef<number|null>(null),removeListeners=useRef<()=>void>(()=>{})
  function view():View|null {
    const c=live.current.canvas.current;if(!c)return null
    const r=c.getBoundingClientRect(),world=live.current.world;if(!r.width||!r.height||!world.w||!world.h)return null
    const pad=live.current.padding||0
    return {matrix:live.current.viewport?.()||{a:(r.width-2*pad)/world.w,b:0,c:0,d:(r.height-2*pad)/world.h,tx:pad,ty:pad},left:r.left,top:r.top,width:r.width,height:r.height}
  }
  function paint(matrix:AffineMatrix|null,cachedView?:View):void {
    const c=live.current.canvas.current,v=cachedView||view();if(!c||!v)return
    const dpr=Math.min(window.devicePixelRatio||1,2),w=Math.max(1,Math.round(v.width*dpr)),h=Math.max(1,Math.round(v.height*dpr))
    if(c.width!==w)c.width=w;if(c.height!==h)c.height=h
    const ctx=c.getContext('2d');if(!ctx)return
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,v.width,v.height)
    const geometry=session.current?.gesture.geometry||live.current.geometry
    if(matrix&&geometry){const current={...geometry,matrix};drawTransformGizmo(ctx,current,v.matrix,!!live.current.locked);live.current.onHandles?.(gizmoHandles(current,v.matrix),v.matrix)}
  }
  function release():void {
    removeListeners.current();removeListeners.current=()=>{}
    const c=live.current.canvas.current,id=session.current?.pointerId
    if(c&&id!==undefined&&c.hasPointerCapture(id))c.releasePointerCapture(id)
  }
  function runFrame():void {
    frame.current=null
    const s=session.current,v=view()
    if(s&&v){
      const world=apply(inverse(v.matrix),{x:s.latest.clientX-v.left,y:s.latest.clientY-v.top})
      s.matrix=updateGesture(s.gesture,world,{shift:s.latest.shift,preserveAspect:s.preserveAspect})
      try{if(!sameMatrix(s.matrix,s.painted)){live.current.onPreview(s.matrix);s.painted=s.matrix}paint(s.matrix,v)}catch(error){cancel();live.current.onError?.(error instanceof Error?error:new Error(String(error)));return}
      if(s.finish){release();session.current=null;if(sameMatrix(s.matrix,s.gesture.geometry.matrix))live.current.onCancel?.();else live.current.onCommit(s.matrix)}
    } else paint(live.current.geometry?.matrix||null)
  }
  function schedule():void {if(frame.current===null)frame.current=requestAnimationFrame(runFrame)}
  function cancel():void {
    if(!session.current)return
    const start=session.current.gesture.geometry.matrix
    if(frame.current!==null)cancelAnimationFrame(frame.current);frame.current=null
    release();session.current=null;live.current.onCancel?.();paint(start)
  }
  function hitPointer(event:PointerEvent):TransformHandle|null {const v=view(),geometry=live.current.geometry;return v&&geometry?hitTest({x:event.clientX-v.left,y:event.clientY-v.top},geometry,v.matrix):null}
  function beginPointer(event:PointerEvent,override?:BeginOverride):boolean {
    if(session.current)return true
    if(event.button!==0||(override?.locked??live.current.locked))return false
    const v=view(),geometry=override?.geometry||live.current.geometry;if(!v||!geometry)return false
    const css={x:event.clientX-v.left,y:event.clientY-v.top},handle=override?.handle||hitTest(css,geometry,v.matrix)
    if(!handle)return false
    event.preventDefault()
    const world=apply(inverse(v.matrix),css)
    session.current={gesture:beginGesture(geometry,handle,world,live.current.anchor),pointerId:event.pointerId,preserveAspect:override?.preserveAspect??!!live.current.preserveAspect,latest:{clientX:event.clientX,clientY:event.clientY,shift:event.shiftKey},matrix:geometry.matrix,painted:geometry.matrix,finish:false}
    live.current.onBegin?.({geometry,handle})
    const c=live.current.canvas.current;c?.setPointerCapture(event.pointerId)
    const move=(e:PointerEvent)=>{const s=session.current;if(!s||s.finish||e.pointerId!==s.pointerId)return;e.preventDefault();s.latest={clientX:e.clientX,clientY:e.clientY,shift:e.shiftKey};schedule()}
    const up=(e:PointerEvent)=>{const s=session.current;if(!s||e.pointerId!==s.pointerId)return;s.latest={clientX:e.clientX,clientY:e.clientY,shift:e.shiftKey};s.finish=true;schedule()}
    const abort=(e:PointerEvent)=>{if(e.pointerId===session.current?.pointerId)cancel()}
    const blur=()=>{if(session.current){session.current.finish=true;schedule()}}
    const key=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.preventDefault();cancel()}else if(e.key==='Shift'&&session.current&&!session.current.finish){session.current.latest={...session.current.latest,shift:e.type==='keydown'};schedule()}else if(e.key==='Enter'&&session.current){session.current.finish=true;schedule()}}
    window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',up);window.addEventListener('pointercancel',abort);window.addEventListener('blur',blur);window.addEventListener('keydown',key);window.addEventListener('keyup',key)
    removeListeners.current=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',abort);window.removeEventListener('blur',blur);window.removeEventListener('keydown',key);window.removeEventListener('keyup',key)}
    schedule();return true
  }
  useEffect(()=>{schedule()})
  useEffect(()=>{const c=live.current.canvas.current,observer=new ResizeObserver(schedule);if(c){observer.observe(c);window.addEventListener('scroll',schedule,true)}return()=>{window.removeEventListener('scroll',schedule,true);observer.disconnect();removeListeners.current();if(frame.current!==null)cancelAnimationFrame(frame.current);frame.current=null;session.current=null}},[options.canvas,!!options.geometry])
  return {beginPointer,hitPointer,cancel,isDragging:()=>session.current!==null,refresh:schedule}
}

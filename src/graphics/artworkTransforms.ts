import { AffineMatrix, Bounds, ScreenSize, NormalizedFrame, IDENTITY, frameMatrix, inverse, multiply, transformedBounds, matrixForBounds } from './affine'
export type TransformMap = Readonly<Record<string,AffineMatrix|undefined>>
export interface PixelRect { readonly x:number; readonly y:number; readonly w:number; readonly h:number }
export function rectMatrix(rect:PixelRect):AffineMatrix {return matrixForBounds({x:rect.x,y:rect.y,width:rect.w,height:rect.h})}
export function worldDelta(rect:PixelRect,delta:AffineMatrix=IDENTITY):AffineMatrix {const base=rectMatrix(rect);return multiply(multiply(base,delta),inverse(base))}
export function rectBounds(rect:PixelRect,delta:AffineMatrix=IDENTITY):PixelRect {const b=transformedBounds(multiply(rectMatrix(rect),delta));return {x:b.x,y:b.y,w:b.width,h:b.height}}
export function frameBounds(frame:NormalizedFrame,screen:ScreenSize,delta:AffineMatrix=IDENTITY):NormalizedFrame {const b:Bounds=transformedBounds(multiply(frameMatrix(frame,screen),delta));return {x:b.x/screen.w,y:b.y/screen.h,w:b.width/screen.w,h:b.height/screen.h}}

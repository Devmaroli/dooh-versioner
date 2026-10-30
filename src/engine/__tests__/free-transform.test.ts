import { expect,test } from 'vitest'
import { AffineMatrix, IDENTITY, UNIT_BOUNDS, apply,inverse,multiply,rotateAt,transformedBounds,translation } from '../../graphics/affine'
import { RESIZE_HANDLES,beginGesture,updateGesture,gizmoHandles,hitTest,localHandle } from '../../graphics/freeTransform'
import { transformedTargets } from '../../graphics/transformTargets'
const base:AffineMatrix={a:400,b:0,c:0,d:200,tx:300,ty:120},geometry={matrix:base,bounds:UNIT_BOUNDS}
const near=(a:{x:number;y:number},b:{x:number;y:number})=>{expect(a.x).toBeCloseTo(b.x,8);expect(a.y).toBeCloseTo(b.y,8)}
test('all eight resize handles pin their opposite anchor under rotation, with pointer offsets',()=>{
  const matrix=rotateAt(base,{x:500,y:220},.73)
  for(const handle of RESIZE_HANDLES){const p=apply(matrix,localHandle(UNIT_BOUNDS,handle)),down={x:p.x+3.2,y:p.y-2.7},gesture=beginGesture({matrix,bounds:UNIT_BOUNDS},handle,down)
    const anchor=apply(matrix,gesture.anchor),same=updateGesture(gesture,down,{shift:false,preserveAspect:false});near(apply(same,gesture.anchor),anchor)
    expect(same.a).toBeCloseTo(matrix.a,8);expect(same.tx).toBeCloseTo(matrix.tx,8)
    for(let i=0;i<1000;i++){const m=updateGesture(gesture,{x:down.x+Math.sin(i)*100,y:down.y+Math.cos(i)*80},{shift:i%2===0,preserveAspect:false});near(apply(m,gesture.anchor),anchor)}
  }
})
test('corner scaling is proportional; Shift permits stretching, while protected content retains proportions',()=>{
  const start=apply(base,{x:1,y:1}),g=beginGesture(geometry,'se',start),p={x:start.x+100,y:start.y+10}
  const uniform=updateGesture(g,p,{shift:false,preserveAspect:false}),stretch=updateGesture(g,p,{shift:true,preserveAspect:false}),protectedM=updateGesture(g,p,{shift:true,preserveAspect:true})
  expect(uniform.a/base.a).toBeCloseTo(uniform.d/base.d);expect(stretch.a/base.a).not.toBeCloseTo(stretch.d/base.d);expect(protectedM.a/base.a).toBeCloseTo(protectedM.d/base.d)
  const flipped=updateGesture(g,{x:-1000,y:-1000},{shift:true,preserveAspect:false});expect(flipped.a*flipped.d-flipped.b*flipped.c).toBeGreaterThan(0)
})
test('move offsets do not jump; rotation fixes centre and Shift snaps to 15 degrees',()=>{
  const g=beginGesture(geometry,'body',{x:341.7,y:163.4}),same=updateGesture(g,g.down,{shift:false,preserveAspect:false});expect(same).toEqual(base)
  const moved=updateGesture(g,{x:361.7,y:143.4},{shift:false,preserveAspect:false});expect(moved.tx).toBeCloseTo(320);expect(moved.ty).toBeCloseTo(100)
  const r=beginGesture(geometry,'rotate',{x:500,y:80}),angle=.4,p={x:r.centre.x+140*Math.sin(angle),y:r.centre.y-140*Math.cos(angle)},rotated=updateGesture(r,p,{shift:false,preserveAspect:false}),snapped=updateGesture(r,p,{shift:true,preserveAspect:false})
  near(apply(rotated,{x:.5,y:.5}),r.centre);expect(Math.atan2(rotated.b,rotated.a)).toBeCloseTo(angle);expect(Math.atan2(snapped.b,snapped.a)/(Math.PI/12)).toBeCloseTo(2)
})
test('screen-space hit testing keeps an 8px radius at different zoom levels, including rotated objects',()=>{
  const matrix=rotateAt(base,{x:500,y:220},1.1),g={matrix,bounds:UNIT_BOUNDS}
  for(const scale of [.2,1,3]){const viewport={a:scale,b:0,c:0,d:scale,tx:40,ty:40},handles=gizmoHandles(g,viewport);expect(handles).toHaveLength(9)
    for(const h of handles)expect(hitTest({x:h.point.x+1,y:h.point.y+1},g,viewport)).toBe(h.id)
    expect(hitTest(apply(multiply(viewport,matrix),{x:.5,y:.5}),g,viewport)).toBe('body');expect(hitTest({x:-100,y:-100},g,viewport)).toBeNull()
  }
})
test('inverse roundtrips extreme coordinates and one delta preserves relative linked geometry',()=>{
  const matrix=rotateAt({...base,tx:7680,ty:5184},{x:500,y:220},.2);near(apply(inverse(matrix),apply(matrix,{x:.2,y:.7})),{x:.2,y:.7})
  const other={...base,tx:900},result=transformedTargets({start:base,targets:[{id:'a',base,matrix:base,preserveAspect:false},{id:'b',base:other,matrix:other,preserveAspect:false}],original:{}},multiply(translation(20,50),base))
  near(apply(multiply(base,result.a!),{x:0,y:0}),{x:base.tx+20,y:base.ty+50});near(apply(multiply(other,result.b!),{x:0,y:0}),{x:other.tx+20,y:other.ty+50})
  expect(transformedBounds(IDENTITY)).toEqual({x:0,y:0,width:1,height:1})
})

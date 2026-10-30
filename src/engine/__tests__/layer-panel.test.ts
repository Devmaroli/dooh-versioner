import { expect, test } from 'vitest'
import { LayerRecord, reducePanel, orderedNodes, unlocked, normalizePanel, selectPanelLayers, effectiveLocks, effectiveVisible, reconcilePanel } from '../../layerPanelModel'
const node=(id:string,parentId:string|null=null,type:LayerRecord['type']='pixel'):LayerRecord=>({id,name:id,type,parentId,visible:true,blendMode:'normal',opacity:1,fill:1,locks:unlocked(),mask:null,sourceIds:[id],memberIds:[id]})
test('typed layer tree groups, reparents, sorts and prevents cycles',()=>{
  let state={version:1 as const,nodes:[node('a'),node('b'),node('c')]}
  state=reducePanel(state,{type:'group',ids:['a','b'],id:'folder'})
  expect(orderedNodes(state).map(r=>[r.layer.id,r.depth])).toEqual([['folder',0],['a',1],['b',1],['c',0]])
  state=reducePanel(state,{type:'move',ids:['c'],target:'folder',placement:'inside'})
  expect(state.nodes.find(n=>n.id==='c')?.parentId).toBe('folder')
  expect(reducePanel(state,{type:'move',ids:['folder'],target:'a',placement:'inside'})).toBe(state)
  expect(()=>normalizePanel({version:1,nodes:[node('a','b','group'),node('b','a','group')]})).toThrow(/ancestor/)
})
test('locks enforce appearance, reparenting and parent visibility without corrupting source identity',()=>{
  let state={version:1 as const,nodes:[node('g',null,'group'),node('a','g'),node('b')]}
  state=reducePanel(state,{type:'lock',ids:['g'],key:'pixels',value:true})
  expect(effectiveLocks(state,'a').pixels).toBe(true)
  expect(reducePanel(state,{type:'patch',ids:['a'],patch:{opacity:.2,name:'Changed'}}).nodes.find(n=>n.id==='a')?.opacity).toBe(1)
  state=reducePanel(state,{type:'patch',ids:['g'],patch:{visible:false}})
  expect(effectiveVisible(state,'a')).toBe(false)
  state=reducePanel(state,{type:'lock',ids:['a'],key:'artboards',value:true})
  expect(reducePanel(state,{type:'move',ids:['a'],target:'b',placement:'before'})).toBe(state)
  state=reducePanel(state,{type:'lock',ids:['a'],key:'all',value:true})
  expect(reducePanel(state,{type:'delete',ids:['g']})).toBe(state)
})
test('Ctrl and Shift selection respect visible row order',()=>{
  expect(selectPanelLayers(['a'],'c',['a','b','c'],'a',{shiftKey:true})).toEqual(['a','b','c'])
  expect(selectPanelLayers(['a'],'c',['a','b','c'],'a',{ctrlKey:true})).toEqual(['a','c'])
})
test('new word layers preserve parent position in tree and a new border appears before background',()=>{
  const old={version:1 as const,nodes:[node('layer:h'),node('__background')]}
  old.nodes[0].fill=.4
  const templates=[{...node('word:1'),originId:'layer-source',sourceIds:['w']},node('__border'),node('__background')]
  old.nodes[0].sourceIds=['layer-source']
  const state=reconcilePanel(old,templates)
  expect(state.nodes.map(n=>n.id)).toEqual(['word:1','__border','__background'])
  expect(state.nodes[0].fill).toBe(.4)
})

test('new layers cannot be inserted into a locked folder',()=>{
  const group=node('g',null,'group');group.locks.all=true
  const state={version:1 as const,nodes:[group]}
  expect(reducePanel(state,{type:'create',layer:node('a','g')})).toBe(state)
})

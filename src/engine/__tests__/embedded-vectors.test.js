import { expect, test } from 'vitest'
import Adapt from '../adapt.js'
import { allLayers } from '../../artwork.js'

test('PDF-compatible vector smart objects retain the embedded original without serializing binary data',()=>{
  const bytes=new TextEncoder().encode('%PDF-1.6 test source')
  const a=Adapt.fromAgPsd({width:200,height:100,linkedFiles:[{id:'ai',data:bytes}],children:[{name:'Headline',left:0,top:0,right:200,bottom:100,placedLayer:{id:'ai',type:'vector',transform:[0,0,200,0,200,100,0,100]}}]})
  const source=a.layers[0]
  expect(source.vectorPdf.data).toBe(bytes)
  expect(JSON.stringify(a)).not.toContain('vectorPdf')
  const art={a,an:{roles:[]},wordPieces:[{id:'word',parentId:source.id,name:'word',vector:true,crop:{x:0,y:0,w:30,h:20}}]}
  const word=allLayers(art).find(l=>l.id==='word')
  expect(word.vectorWord).toBe(true);expect(word.vectorPdf).toBe(source.vectorPdf);expect(word.sourceBox).toEqual([0,0,200,100])
})

test('external, non-PDF and raster smart objects do not falsely advertise an embedded vector renderer',()=>{
  for(const [type,data] of [['raster',new TextEncoder().encode('%PDF-1.6')],['vector',new Uint8Array([1,2,3])],['vector',undefined]]){
    const a=Adapt.fromAgPsd({width:10,height:10,linkedFiles:[{id:'ai',data}],children:[{name:'Artwork',placedLayer:{id:'ai',type}}]})
    expect(a.layers[0].vectorPdf).toBeUndefined()
  }
})
import { vectorRasterKey } from '../../embeddedVectors.js'
test('vector raster lookup tolerates Canvas transform floating-point roundoff',()=>{
  const layer={id:'word'},box={x:0,y:0,w:100,h:50}
  expect(vectorRasterKey(layer,box,160,80)).toBe(vectorRasterKey(layer,box,160.00000002,79.99999997))
})

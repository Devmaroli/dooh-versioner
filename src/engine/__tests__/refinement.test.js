import { expect,test } from 'vitest'
import { initialProof,createScreenProof,proofForScreen,screenProofKey,guideLayout,sourceSignature } from '../../layoutGuides.js'
function fixture(){return {a:{w:100,h:100,layers:[{id:'h',name:'Headline',kind:'image',box:[0,0,100,100],px:{}}]},an:{roles:[{id:'h',role:'headline',confidence:1}]},calibration:{enabled:true,proofs:{},outputs:{}}}}
test('screen refinements clone the generated geometry and isolate screens of the same family',()=>{
  const art=fixture(),guide={name:'guide',w:400,h:100},a={name:'a',w:800,h:100},b={name:'b',w:900,h:100}
  art.calibration.proofs.ultrawide={...initialProof(art,guide),approved:true}
  const before=guideLayout(art,a),output=createScreenProof(art,a)
  expect(guideLayout(art,a,output).map(u=>u.frame)).toEqual(before.map(u=>u.frame))
  art.calibration.outputs[screenProofKey(a)]=output
  output.frames['layer:h'].x=.4
  expect(proofForScreen(art,a)).toBe(output)
  expect(proofForScreen(art,b)).toBe(art.calibration.proofs.ultrawide)
  expect(art.calibration.proofs.ultrawide.frames['layer:h'].x).not.toBe(.4)
  expect(output.approved).toBe(false);expect(output.sourceSignature).toBe(sourceSignature(art))
})
test('screen identity includes name and dimensions; source masters own their own refinements',()=>{
  const a={name:'Screen',w:100,h:200},b={...a,w:101},first=fixture(),second=fixture()
  first.calibration.outputs[screenProofKey(a)]=createScreenProof(first,a)
  expect(screenProofKey(a)).not.toBe(screenProofKey(b));expect(proofForScreen(first,b)).toBeUndefined();expect(proofForScreen(second,a)).toBeUndefined()
})

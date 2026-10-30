import { AffineMatrix, IDENTITY, inverse, multiply, sameMatrix } from './affine'
export interface TransformTarget { readonly id:string; readonly base:AffineMatrix; readonly matrix:AffineMatrix; readonly preserveAspect:boolean }
export interface TransformTransaction { readonly start:AffineMatrix; readonly targets:readonly TransformTarget[]; readonly original:Readonly<Record<string,AffineMatrix|undefined>> }
/** Apply one world-space delta to all linked/grouped targets, preserving internal offsets. */
export function transformedTargets(transaction:TransformTransaction,selection:AffineMatrix):Record<string,AffineMatrix|undefined> {
  if(sameMatrix(selection,transaction.start))return {...transaction.original}
  const delta=multiply(selection,inverse(transaction.start)),result={...transaction.original}
  for(const target of transaction.targets)result[target.id]=multiply(inverse(target.base),multiply(delta,target.matrix))
  return result
}
export const targetMatrix=(base:AffineMatrix,delta:AffineMatrix|undefined):AffineMatrix=>multiply(base,delta||IDENTITY)

import { test } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import A from '../adapt.js'
import { readPsd } from 'ag-psd'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const D = path.resolve(__dirname, '../../data/screens') + '/'
const agp = { readPsd }

test('masters.test', () => {
let f=0,p=0;const ok=(n,c)=>{if(!c){f++;console.log("FAIL "+n);}else p++;};
const M=[{w:1920,h:1080},{w:1080,h:1920},{w:3840,h:540},{w:1080,h:1080}];const P=(w,h)=>A.pickMaster(M,w,h).index;
ok("wide master serves 1920x1080",P(1920,1080)===0);
ok("ribbon master serves Kuwait Gate 4460x378",P(4460,378)===2);
ok("ribbon master serves Hawally 5832x432",P(5832,432)===2);
ok("tall master serves 1st Ring Road 1008x5184",P(1008,5184)===1);
ok("tall master serves Palm 240x960",P(240,960)===1);
ok("square master serves 960x960",P(960,960)===3);
ok("wide only → tall column falls back to closest",A.pickMaster([{w:1920,h:1080},{w:1080,h:1080}],1008,5184).index===1);
ok("tie → covering, higher res wins",A.pickMaster([{w:960,h:540},{w:3840,h:2160}],1920,1080).index===1);
ok("covers flag",A.pickMaster([{w:3840,h:2160}],1920,1080).covers===true);
ok("empty list",A.pickMaster([],10,10).index===-1);
console.log("masters: "+p+" pass, "+f+" fail");if (f) throw new Error("failed "+f);

})

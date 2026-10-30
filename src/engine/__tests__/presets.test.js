import { test } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import A from '../adapt.js'
import { readPsd } from 'ag-psd'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const D = path.resolve(__dirname, '../../data/screens') + '/'
const agp = { readPsd }

test('presets.test', () => {
let ran=0,fail=[];function ok(l,c){ran++;if(!c)fail.push(l);}
var P=[],sa=A.importScreenList(fs.readFileSync(D+'ScreenAdapter_Config.json',"utf8"),"ScreenAdapter_Config.json",P);
var ae=A.importScreenList(fs.readFileSync(D+"AE_ScreenManager_Config.json","utf8"),"AE_ScreenManager_Config.json",P);
var al=A.importScreenList(fs.readFileSync(D+"Alshaheed_Screens_ScreenManager.json","utf8"),"Alshaheed",P);
var all=A.mergePresets([ae,sa,al],P),cb=A.importCombiners(fs.readFileSync(D+"AE_ScreenManager_Combiners.json","utf8"),all,"Combiners",P);
ok("72 SA screens",sa.length===72);ok("AE 77 grouped",ae.length===77&&ae.every(x=>x.group));ok("trailing space kept",ae.some(x=>x.name==="Assima L1 & L2 "));ok("7 alshaheed",al.length===7&&al[0].group==="Al Shaheed");
ok("15 combiners",cb.length===15);
var g=function(n){return cb.find(c=>c.name===n);};
ok("Piccadilly compW 6080x720",g("Piccadilly_Sync").w===6080&&g("Piccadilly_Sync").h===720&&g("Piccadilly_Sync").faces.length===3);
ok("Murouj C v-dup 1680x1920",g("Mourouj_Wall_C").w===1680&&g("Mourouj_Wall_C").h===1920);
ok("Thuraya faces 2624x608 + 960x540",g("Thuraya_Full").faces[0].w===2624&&g("Thuraya_Full").faces[0].h===608&&g("Thuraya_Full").faces[1].w===960&&g("Thuraya_Full").faces[1].h===540);ok("Piccadilly crop not scale",g("Piccadilly_Sync").faces.map(f=>f.w).join()==="2027,2027,2026"&&/crop 1px/.test(g("Piccadilly_Sync").notes.join()));ok("Thuraya 3584x608, side top",g("Thuraya_Full").w===3584&&g("Thuraya_Full").h===608&&g("Thuraya_Full").faces[1].y===0);
ok("Palms 960x960 4 faces",g("Marina_Palms_Full").w===960&&g("Marina_Palms_Full").faces.length===4);
ok("names verbatim",sa.some(s=>s.name==="Marina - Palm Trees (6 screens)"));
console.log(cb.map(c=>c.name+" "+c.w+"x"+c.h+" faces="+c.faces.length+(c.notes?" | "+c.notes.join("; "):"")).join("\n"));console.log(P,"merged",all.length);
if(fail.length){console.log(fail);throw new Error("check failed");}console.log("ok — "+ran+" checks");

})

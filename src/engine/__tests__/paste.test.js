import { test } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import A from '../adapt.js'
import { readPsd } from 'ag-psd'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const D = path.resolve(__dirname, '../../data/screens') + '/'
const agp = { readPsd }

test('paste.test', () => {
let ran=0,fail=[];function ok(l,c){ran++;if(!c){fail.push(l);}}
var ae=A.importScreenList(fs.readFileSync(D+"AE_ScreenManager_Config.json","utf8"),"ae"),sa=A.importScreenList(fs.readFileSync(D+'ScreenAdapter_Config.json',"utf8"),"sa"),al=A.importScreenList(fs.readFileSync(D+"Alshaheed_Screens_ScreenManager.json","utf8"),"al");
var S=A.mergePresets([ae,sa,al]),C=A.importCombiners(fs.readFileSync(D+"AE_ScreenManager_Combiners.json","utf8"),S,"cb"),P=S.concat(C);
var nm=function(r){return r.selected.map(i=>P[i].name);};
ok("marker strip like JSX",A.stripPastedListMarker("3. Al Salam Mall")==="Al Salam Mall"&&A.stripPastedListMarker("1st Ring Road")==="1st Ring Road"&&A.stripPastedListMarker("1.7HD")==="1.7HD");
ok("split , ; newline",A.parsePastedScreenNames("a, b;c\nd").length===4);
var r=A.matchPastedScreens("- 1.7HD\n2) Boulevard Bridge\n• al salam mall",P);ok("exact names",nm(r).includes("1.7HD")&&nm(r).includes("Boulevard Bridge")&&nm(r).includes("Al Salam Mall"));
r=A.matchPastedScreens("Thuraya Combined",P);ok("alias → faces",nm(r).includes("Thuraya Screen 1 (Big)")&&nm(r).includes("Thuraya Screen 2 (Side)"));
r=A.matchPastedScreens("Thuraya_Full",P);ok("combined name → combined + faces",nm(r).includes("Thuraya_Full"));
r=A.matchPastedScreens("Mupi",P);ok("ambiguous partial → unmatched (JSX rule)",r.unmatched.length===1);r=A.matchPastedScreens("Ring Road",P);ok("unique partial",nm(r).length===1&&nm(r)[0]==="1st Ring Road");
r=A.matchPastedScreens("Boulevard Bridge\t3584 x 384",P);ok("excel row name+size",r.lines[0].how==="name"&&nm(r)[0]==="Boulevard Bridge");
r=A.matchPastedScreens("1008x5184",P);ok("unique size",r.lines[0].how==="size"&&nm(r)[0]==="1st Ring Road");
r=A.matchPastedScreens("1080x1920",P);ok("ambiguous size → unmatched w/ candidates",r.unmatched.length===1&&r.unmatched[0].candidates.length>1);
r=A.matchPastedScreens("Mystery Mall 1234x567\nNowhere",P);ok("unmatched keep size",r.unmatched.length===2&&r.unmatched[0].size[0]===1234&&!r.unmatched[1].size);
ok("aliases copied",Object.keys(A.PASTE_SELECTION_ALIASES).length===33);
if(fail.length){console.log(fail);throw new Error("check failed");}console.log("ok — "+ran+" checks");

})

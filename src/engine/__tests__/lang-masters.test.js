import { test } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import A from '../adapt.js'
import { readPsd } from 'ag-psd'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const D = path.resolve(__dirname, '../../data/screens') + '/'
const agp = { readPsd }

test('lang-masters.test', () => {
let f=0,p=0;const ok=(n,c)=>{if(!c){f++;console.log("FAIL "+n);}else p++;};
const art=(file,names,text)=>({source:{file},layers:names.map(n=>({name:n,kind:"pixel",text,children:[]}))});
ok("Rio_EN.psd -> EN",A.detectMasterLang(art("Rio_EN.psd",["1.7HD En"]))==="EN");
ok("Rio_AR.psd -> AR",A.detectMasterLang(art("Rio_AR.psd",["Arabic text"]))==="AR");
ok("Arabic live text -> AR",A.detectMasterLang(art("x.psd",["t"],"يغير نكهة يومك"))==="AR");
const M=[{w:1920,h:1080,lang:"EN"},{w:1920,h:1080,lang:"AR"}];
ok("EN screen uses EN master",A.pickMasterForLang(M,1080,1920,"EN").index===0);
ok("AR screen uses AR master",A.pickMasterForLang(M,1080,1920,"AR").index===1);
const M2=[{w:1920,h:1080,lang:"EN"},{w:3840,h:540}];
ok("untagged ribbon master still serves AR",A.pickMasterForLang(M2,4460,378,"AR").index===1);
ok("EN-only tagged master falls back for AR",A.pickMasterForLang([{w:1920,h:1080,lang:"EN"}],1920,1080,"AR").index===0);

const T=(n,l,b)=>{const r=A.langFromFilename(n);ok(`suffix ${n} -> ${l}${b!=null?" base "+b:""}`,r.lang===l&&(b==null||r.base===b));};
T("Rio_AR.psd","AR","Rio");T("Rio-ar.psd","AR","Rio");T("Rio Ar.psd","AR","Rio");T("RioAR.psd","AR","Rio");T("RioAr.psd","AR","Rio");
T("Rio Arabic.psd","AR","Rio");T("Rio_ARABIC.PSD","AR","Rio");T("Rio عربي.psd","AR","Rio");T("Rio_عربي.psd","AR","Rio");
T("Rio_EN.psd","EN","Rio");T("Rio-english.psd","EN","Rio");T("Rio.psd","EN","Rio");T("Qatar.psd","EN","Qatar");T("/x/y/Arabic_Rio.psd","EN","Arabic_Rio");
ok("no suffix = implicit",A.langFromFilename("Rio.psd").explicit===false);
ok("filename suffix beats layer names",A.detectMasterLang({source:{file:"Promo_AR.psd"},layers:[{name:"English copy",children:[]}]})==="AR");
console.log(`lang-masters (suffix): ${p} pass, ${f} fail`);if (f) throw new Error("failed "+f);

})

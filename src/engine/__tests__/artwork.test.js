import { test } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import A from '../adapt.js'
import { readPsd } from 'ag-psd'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const D = path.resolve(__dirname, '../../data/screens') + '/'
const agp = { readPsd }

test('artwork.test', () => {
let p=0,f=0;const ok=(n,c)=>{c?p++:(f++,console.log("FAIL",n));};
const svg=A.fromSVG(fs.readFileSync(__dirname+"/../../../samples/sample.svg","utf8"),"sample.svg");
ok("svg size",svg.w===1920&&svg.h===1080);ok("svg kv group kept",svg.layers.some(l=>l.kind==="group"&&l.children.length===2));
const an=A.analyseArtwork(svg,["Cairo"]);const r=k=>an.rules.find(x=>x.key===k);
ok("roles: kv",an.roles.some(x=>x.role==="kv"));ok("roles: logo",an.roles.some(x=>x.role==="logo"&&x.name==="Brand logo"));ok("roles: price",an.roles.some(x=>x.role==="price"));ok("roles: headline",an.roles.find(x=>x.role==="headline").name==="headline"&&an.roles.find(x=>x.name==="kvtext").role==="ignore");
ok("wide lockup 4:1",r("wideLockup")&&r("logoAspect").value===4);ok("lockKV",r("lockKV"));ok("long headline → more lines",r("headlineMaxLines").value>=3);ok("flat style",r("artStyle").value==="flat");ok("brand colour",r("brandColor").value==="#ffcc00"||r("brandColor").value==="#7a1f5c");
ok("all roles unconfirmed (user confirms)",an.roles.every(x=>!x.confirmed));
const missing=A.analyseArtwork(svg,["Arial"]);ok("missing font warned",missing.warnings.some(w=>/Missing font "Cairo"/.test(w)));
const base={tw:3584,th:384,texts:{headline:"Summer Sale",offer:"Up to 50% off"},measure:{headline:s=>s.length*.6,offer:s=>s.length*.55},productAspect:.9,logoAspect:2.7};
/* ag-psd from package */
{const psd=agp.readPsd(fs.readFileSync(__dirname+"/../../../samples/sample.psd"),{skipLayerImageData:true,skipThumbnail:true,skipCompositeImageData:true});const a=A.fromAgPsd(psd,"sample.psd"),b=A.analyseArtwork(a,["Montserrat"]),R=k=>b.rules.find(x=>x.key===k);
 ok("psd text font",a.layers.find(l=>l.name==="Headline").font==="Montserrat ExtraBold");ok("psd group",a.layers.find(l=>l.name==="Products").children.length===2);
 ok("multi product hero unit",R("heroUnit"));ok("photo style → scrim",R("artStyle").value==="photo");ok("legal role",b.roles.some(x=>x.role==="legal"));ok("psd missing font",b.missingFonts.includes("Montserrat ExtraBold"));
const ap=A.applyArtRules(base,b.rules);
 ok("override product aspect from art",Math.abs(ap.productAspect-(520/700))<.1);ok("override logo aspect",ap.logoAspect===4.2);ok("base untouched",base.logoAspect===2.7);ok("compose with overrides",A.compose(ap).rects.logo.w/A.compose(ap).rects.logo.h>4.1);}
const pdf=A.fromPdfText([{str:"Summer Sale",transform:[120,0,0,120,900,700],width:700,height:120,fontName:"g_d0_f1"}],1920,1080,"x.pdf");ok("pdf text layer",pdf.layers[1].text==="Summer Sale"&&pdf.layers[0].kind==="image");
const pc=A.fromPcraftManifest({format_version:1,generator:"t",document:{size:{width:1080,height:1920},layers:[{id:1,name:"BG",content:{kind:"raster"}},{id:2,name:"Headline",content:{kind:"text",text:"Hello",font_family:"Cairo",size_pt:90,transform:[1,0,0,1,100,200]}}]}});ok("pcraft text",pc.layers[0].text==="Hello"&&pc.w===1080);
ok("vectorcraft route pdf",A.vectorcraftRoute({format:"vectorcraft",pdf:{data:"AAA"}}).route==="pdf");ok("vectorcraft route svg",A.vectorcraftRoute({format:"vectorcraft"}).route==="svg");
const job=A.encodeCraftJob("/p/x.ecproj","Main",[{name:"Kuwait Gate",w:4460,h:378}]);ok("encodecraft schema",job.source.kind==="effectcraft"&&job.sizes[0].width===4460&&job.preset_id);
const ec=A.effectCraftComps([{id:"v01",lang:"EN",rtl:false}],[{name:"Kuwait Gate",w:4460,h:378}],(v,s)=>A.compose({...base,tw:s.w,th:s.h,rtl:v.rtl}));ok("effectcraft comps tagged",ec.comps[0].layers.some(l=>/@headline/.test(l.name)));
const lk=A.lookupLayout("1st Ring Road",1008,5184);ok("lib by name",lk.source==="name");ok("lib by size",A.lookupLayout("Unknown",1008,5184).source==="size");ok("lib class fallback",A.lookupLayout("x",1234,567).source==="class"&&A.lookupLayout("x",1234,567).libClass==="Wide");
ok("class map keeps both",A.CLASS_MAP.Tall.includes("xv")&&A.CLASS_MAP.Ribbon.includes("xw"));
const c=A.compose({...base,tw:1008,th:5184,libZones:{zones:lk.entry.zones,ribbon:false}});ok("lib zones conform",A.libConformance(lk.entry,1008,5184,false,{logo:c.rects.logo,headline:c.text.headline.r,product:c.rects.product,cta:c.rects.cta}).length===0);
const cr=A.compose({...base,tw:1008,th:5184,rtl:true,libZones:{zones:lk.entry.zones,ribbon:false}});ok("lib AR mirror logo right",cr.rects.logo.x+cr.rects.logo.w>1008/2);
console.log(`artwork: ${p} pass, ${f} fail`);if (f) throw new Error("failed "+f);

})

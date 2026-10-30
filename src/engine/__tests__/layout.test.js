import { test } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import A from '../adapt.js'
import { readPsd } from 'ag-psd'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const D = path.resolve(__dirname, '../../data/screens') + '/'
const agp = { readPsd }

test('layout.test', () => {
 var ran=0, fail=[];
function ok(l,c){ran++; if(!c) fail.push(l);}
var R=function(w,h){return {left:0,top:0,width:w,height:h};};
var F=function(x,y,w,h){return {x0:x/1920,y0:y/1080,wF:w/1920,hF:h/1080,cx:(x+w/2)/1920,cy:(y+h/2)/1080};};
var layers=[{name:"BG @bg",rect:R(1920,1080),frac:F(0,0,1920,1080)},
 {name:"Logo @logo.tr",rect:R(300,120),frac:F(1580,40,300,120)},
 {name:"Head @headline",rect:R(800,140),frac:F(80,300,800,140)},
 {name:"Panel @panel.clear",rect:R(600,400),frac:F(1300,0,600,400)},
 {name:"Wide only @cta @uw",rect:R(300,100),frac:F(80,900,300,100)}];
var a=A.layoutScreen(layers,1920,1080,1080,1920);
ok("portrait class v", a.orient==="v");
ok("bg covers", a.rects[0].w>=1080 && a.rects[0].h>=1920);
ok("logo pinned top-right inside margin", Math.abs(a.rects[1].x+a.rects[1].w-(1080-a.margin))<1e-6);
ok("@uw cta skipped on portrait", a.rects[4]===null && a.skipped.length===1);
var p=a.rects[3], l=a.rects[1]; ok("panel clear of logo", p.x+p.w<=l.x-a.margin+1e-6 || p.y>=l.y+l.h+a.margin-1e-6 || p.y+p.h<=l.y-a.margin+1e-6);
var w=A.layoutScreen(layers,1920,1080,3840,400); ok("extreme wide xw falls back to @uw variant", w.orient==="xw" && w.rects[4]!==null);
var r=A.layoutScreen(layers,1920,1080,1920,1080,{rtl:true});
ok("RTL mirrors logo to left", Math.abs(r.rects[1].x-r.margin)<1e-6);
ok("RTL mirrors headline box", Math.abs(r.rects[2].x+r.rects[2].w-(1920-80))<1e-6);
ok("mirrorAnchor", A.mirrorAnchor("br")==="bl" && A.mirrorAnchor("t")==="t");
if(fail.length){console.log(fail);throw new Error("check failed");} console.log("ok — "+ran+" checks");
// saliency crop: a hot spot at the right must be kept when cropping to portrait
(function(){ var W=160,H=90,s=new Float32Array(W*H); for(var y=30;y<60;y++)for(var x=125;x<150;x++)s[y*W+x]=1;
 var c=A.saliencyCrop(s,W,H,9/16); console.log(c.x+c.w>=149 && c.x<=125 ? "ok — saliency crop keeps subject" : "FAIL saliency crop "+JSON.stringify(c));
 var u=A.saliencyCrop(new Float32Array(W*H),W,H,9/16); console.log(Math.abs(u.x+u.w/2-W/2)<2 ? "ok — flat map crops centre" : "FAIL flat");})();

})

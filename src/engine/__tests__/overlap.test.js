import { test } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import A from '../adapt.js'
import { readPsd } from 'ag-psd'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const D = path.resolve(__dirname, '../../data/screens') + '/'
const agp = { readPsd }

test('overlap.test', () => {
let ran=0,fail=[];function ok(l,c){ran++;if(!c)fail.push(l);}
function hit(a,b){return a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;}
var P={x:100,y:400,w:800,h:800},G=20,inf={x:P.x-G,y:P.y-G,w:P.w+2*G,h:P.h+2*G};
var r=A.avoidRect({x:100,y:300,w:600,h:200},P,1000,2000,50,G);ok("tall: moved clear w/ gap",r.how==="move"&&!hit(r.r,inf)&&r.scale===1);
r=A.avoidRect({x:100,y:900,w:900,h:900},P,1000,2000,50,G);ok("too big: shrinks to fit, clear",!hit(r.r,inf)&&r.scale<1&&r.r.x>=50&&r.r.y>=50&&r.r.y+r.r.h<=1950);
r=A.avoidRect({x:100,y:50,w:300,h:100},P,1000,2000,50,G);ok("already clear untouched",r.how==="none");
r=A.avoidRect({x:60,y:60,w:880,h:1880},{x:0,y:0,w:1000,h:2000},1000,2000,50,G);ok("impossible reported",r.how==="impossible");
ok("gap distance",A.rectGap({x:0,y:0,w:10,h:10},{x:15,y:0,w:5,h:5})===5&&A.rectGap({x:0,y:0,w:10,h:10},{x:5,y:5,w:5,h:5})===0);
ok("overlap opt-in tag",A.allowsOverlap("Headline @headline.overlap")&&!A.allowsOverlap("Headline @headline")&&A.allowsOverlap("X",true));
var q=A.qaScore([{kind:"text",r:{x:0,y:0,w:10,h:10},fontPx:50},{kind:"product",r:{x:15,y:0,w:10,h:10}}],100,100,0,0,10);ok("QA flags gap",q.issues.includes("text closer than gap to product"));
if(fail.length){console.log(fail);throw new Error("check failed");}console.log("ok — "+ran+" checks");

})

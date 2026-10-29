import { test } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import A from '../adapt.js'
import { readPsd } from 'ag-psd'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const D = path.resolve(__dirname, '../../data/screens') + '/'
const agp = { readPsd }

test('skill-adapt.test', () => {
let p=0,f=0;const ok=(n,c)=>{c?p++:(f++,console.log("FAIL",n));};const m=k=>s=>s.length*k;
const C=(w,h,rtl,t)=>A.compose({tw:w,th:h,rtl,texts:t||{headline:rtl?"تخفيضات الصيف":"SUMMER SALE",offer:rtl?"خصم حتى ٥٠٪ على كل شيء":"Up to 50% off everything"},measure:{headline:m(.62),offer:m(.55)},productAspect:.9,logoAspect:2.7});
for(const [w,h] of [[3584,384],[4460,378]])for(const r of [false,true]){const c=C(w,h,r),H=c.text.headline,cap=H.font*.7/h,cx=(H.r.x+H.r.w/2)/w;
 ok(`${w} ribbon 1 line`,H.lines.length===1);ok(`${w} cap 40-50% (${cap.toFixed(2)})`,cap>=(w<4000&&r?.33:.38)&&cap<=.52);ok(`${w} touches central third`,(r?1-cx:cx)>.2&&(r?1-cx:cx)<.6);
 ok(`${w} margin ≥8% h`,Object.values(c.rects).every(R=>R.y>=.08*h-1&&R.y+R.h<=.92*h+1));
 const order=["logo","headline","product","cta"].map(k=>(k==="headline"?H.r:c.rects[k]).x);ok(`${w} zone order ${r?"mirrored":"LTR"}`,order.every((x,i)=>!i||(r?x<order[i-1]:x>order[i-1])));}
const u=C(7680,1152,false).text.headline;ok("7680 ≤2 lines",u.lines.length<=2);ok("7680 central third",Math.abs((u.r.x+u.r.w/2)/7680-.5)<1/6);
for(const r of [false,true]){const c=C(960,5328,r),h=5328,cy=R=>(R.y+R.h/2)/h;ok("tall logo top 20%",cy(c.rects.logo)<.25);ok("tall headline mid",cy(c.text.headline.r)>.2&&cy(c.text.headline.r)<.75);ok("tall product mid",cy(c.rects.product)>.2&&cy(c.rects.product)<.75);ok("tall cta lower",cy(c.rects.cta)>.7&&cy(c.rects.cta)<.97);ok("nothing at very top",c.rects.logo.y>.015*h);}
const base=w=>({id:"t",tw:1920,th:1080,cls:"h",rtl:true,arabic:true,headline:{r:{x:200,y:200,w:900,h:300},font:120,lines:["تخفيضات الصيف"],lead:1.4},offer:{r:{x:200,y:600,w:900,h:200},font:60,lines:w||["خصم حتى ٥٠٪"],lead:1.4}});
ok("clean AR passes #16",A.auditTile(base()).rows[15].pass);
ok("tracking flagged",!A.auditTile({...base(),tracking:2}).rows[15].pass);
ok("mirrored logo flagged",!A.auditTile({...base(),mirrored:["logo"]}).rows[15].pass);
ok("mixed numerals flagged",!A.auditTile({...base(["خصم حتى 50٪"]),price:"٩٫٩٠ د.ك"}).rows[15].pass);
ok("broken price flagged",!A.auditTile({...base(),arabic:false,rtl:false,headline:{r:{x:200,y:200,w:900,h:300},font:120,lines:["Now only KD","9.90 today"]}}).rows[13].pass);
ok("white glare flagged",!A.auditTile({...base(),whitePct:.4}).rows[14].pass);
ok("leading 1.6 now out of range",!A.auditTile({...base(),headline:{...base().headline,lead:1.6}}).rows[15].pass);
const xw={id:"x",tw:3584,th:384,cls:"xw",headline:{r:{x:100,y:60,w:600,h:260},font:100,lines:["SUMMER SALE"]}};ok("ribbon off-centre/small cap flagged",!A.auditTile(xw).rows[18].pass);
const pl=A.bgExtendPlan(16/9,3584,384);ok("bg non-AI first",pl.steps[0]==="reposition"&&!pl.steps.some(s=>/ai/.test(s)));ok("ai only opt-in & last",/ai/.test(A.bgExtendPlan(16/9,3584,384,true).steps.slice(-1)[0]));
ok("never mirror list",["logo","product","price","url","numerals"].every(k=>A.NEVER_MIRROR.includes(k)));
console.log(`skill-adapt: ${p} pass, ${f} fail`);if (f) throw new Error("failed "+f);
{let f=0;const z=A.refZoneRects("xw",4460,378,true);if(Math.abs(z.logo.x-(4460-430))>2)f++,console.log("FAIL rtl mirror x'=W-x");
for(const [w,h,cl] of [[4460,378,"xw"],[7680,1152,"uw"],[960,5328,"xv"]])for(const r of [false,true]){const c=A.compose({tw:w,th:h,rtl:r,texts:{headline:r?"تخفيضات الصيف":"SUMMER SALE",offer:r?"خصم حتى ٥٠٪ على كل شيء":"Up to 50% off everything"},measure:{headline:s=>s.length*.62,offer:s=>s.length*.55},productAspect:.9,logoAspect:2.7});
 const iss=A.zoneConformance(cl,w,h,r,{logo:c.rects.logo,headline:c.text.headline.r,product:c.rects.product,cta:c.rects.cta});if(iss.length)f++,console.log("FAIL zones",w,r,iss.join("; "));}
console.log(`ref-zones: ${f} fail`);if(f)throw new Error("check failed");}

})

const A=require("../build/adapt.cjs");let n=0;const ok=(m,c)=>{if(!c){console.error("FAIL",m);process.exit(1)}n++;};const m=k=>s=>s.length*k;
ok("20 criteria",A.AUDIT_CRITERIA.length===20);ok("u 1%",A.AUDIT.uPct===0.01&&A.AUDIT.marginU===6&&A.AUDIT.marginUExtreme===8&&A.AUDIT.clearU===2);
ok("scale",JSON.stringify(A.AUDIT.scale)==="[1,2,3,4,6,8,12]");ok("contrast",A.AUDIT.contrastBody===4.5&&A.AUDIT.contrastLarge===3);ok("fill",A.AUDIT.fill[0]===.35&&A.AUDIT.fill[1]===.8);ok("kashida 3",A.AUDIT.kashidaMax===3);
const tile=(w,h,rtl)=>{const c=A.compose({tw:w,th:h,rtl,texts:{headline:rtl?"تخفيضات الصيف":"SUMMER SALE",offer:rtl?"خصم حتى ٥٠٪ على كل شيء":"Up to 50% off everything"},measure:{headline:m(.62),offer:m(.55)},productAspect:.9,logoAspect:2.7});
 const L=A.leadingFor(rtl?"ع":"a"),T=k=>({r:c.text[k].r,font:c.text[k].font,lines:c.text[k].lines,lead:L,contrast:7});return {id:w+"x"+h+(rtl?"ar":""),group:w+"x"+h,tw:w,th:h,cls:c.cls,rtl,arabic:rtl,headline:T("headline"),offer:T("offer"),logo:c.rects.logo,product:c.rects.product,cta:c.rects.cta,palette:["#0b3d91","#fff","#ffcc00"],brandColor:"#0b3d91",logoContrast:5};};
const sizes=[[3584,384],[7680,1152],[1920,1080],[864,864],[1080,1920],[480,1440],[1008,5184]];
for(const [w,h] of sizes)for(const r of [false,true]){const a=A.auditTile(tile(w,h,r));ok("20 rows",a.rows.length===20);
 for(const k of [1,3,4,6,10,12,13,16])ok(`${w}x${h}${r?" ar":""} #${k} ${a.rows[k-1].name} pass (${a.rows[k-1].measured})`,a.rows[k-1].pass);}
// failures produce fixes
const bad=tile(1080,1920,false);bad.offer.contrast=2;bad.logo={...bad.logo,x:2,y:2};const ba=A.auditTile(bad);
ok("contrast fail",!ba.rows[8].pass&&ba.rows[8].fix.kind==="scrim");ok("margin fail",!ba.rows[0].pass&&ba.rows[0].fix);
const ar=tile(1920,1080,true);ar.headline.lead=1.12;ok("arabic leading flagged",!A.auditTile(ar).rows[15].pass);
const k4=tile(1920,1080,true);k4.headline.lines=["تخفيــــضات"];ok("kashida>3 flagged",!A.auditTile(k4).rows[15].pass);
const wd=tile(1920,1080,false);wd.offer.lines=["Up to 50% off","everything"];ok("widow flagged",!A.auditTile(wd).rows[13].pass);
const ty=tile(1920,1080,false);ty.offer.typeface="X";ty.headline.typeface="Y";ty.offer.lines=["a b"];const t3={...ty,extra:[]};t3.headline={...t3.headline};ok("2 typefaces ok",A.auditTile(t3).rows[13].pass);
const fl=tile(1080,1920,false);[fl.offer.r,fl.headline.r]=[{...fl.headline.r},{...fl.offer.r,y:fl.offer.r.y}];fl.offer.r.y=fl.headline.r.y-10-fl.offer.r.h;ok("flow fail when offer read first",!A.auditTile(fl).rows[12].pass);
// multi-face
const mf=tile(3584,608,false);mf.faces=[{x:0,y:0,w:1800,h:608},{x:1800,y:0,w:1784,h:608}];mf.cta={x:1700,y:200,w:200,h:200};ok("seam split flagged",!A.auditTile(mf).rows[17].pass);
// campaign
const C=A.auditCampaign(sizes.flatMap(([w,h])=>[tile(w,h,false),tile(w,h,true)]));ok("campaign avg",C.avg>=85);ok("csv rows",A.auditCSV(C).split("\n").length===1+C.tiles.length*20);
ok("consistency pass",C.tiles[0].rows[16].pass);
console.log("ok — "+n+" checks; campaign avg "+C.avg+", all-pass "+Math.round(C.passRate*100)+"%");

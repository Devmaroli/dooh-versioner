// Renderer lifted from proto/index.html (v1.5) and wired to proto/adapt.js.
// Tiles, PSD pixels, tagline reflow, language masters and multi-face handling stay the prototype's.
import Adapt from './adapt.js'
import { readPsd } from 'ag-psd'
import { PRESET_FILES, SAMPLE_PSD_B64, SAMPLE_SVG } from './presets.js'

const MW=1920,MH=1080;
const MASTER=[
 {id:"bg",name:"Background @bg",kind:"bg",box:[0,0,1920,1080]},
 {id:"product",name:"Product @product.40.l",kind:"product",box:[120,180,640,720]},
 {id:"logo",name:"Logo @logo.tr",kind:"logo",box:[1560,60,300,110]},
 {id:"headline",name:"Headline @headline",kind:"text",bind:"headline",size:120,weight:800,box:[860,300,0,0]},
 {id:"offer",name:"Offer @headline.clear",kind:"text",bind:"offer",size:56,weight:500,box:[860,470,0,0]},
 {id:"price",name:"Price badge",kind:"price",bind:"price",box:[1500,720,300,300]},
];
// ---- import real presets (names verbatim, sizes never invented) ----
const PROB=[];const F=PRESET_FILES;
const sa=Adapt.importScreenList(F["ScreenAdapter_Config.json"],"ScreenAdapter_Config.json",PROB);
const al=Adapt.importScreenList(F["Alshaheed_Screens_ScreenManager.json"],"Alshaheed_Screens_ScreenManager.json",PROB);
const ae=Adapt.importScreenList(F["AE_ScreenManager_Config.json"],"AE_ScreenManager_Config.json",PROB);
const screens=Adapt.mergePresets([ae,sa,al],PROB);
const combos=Adapt.importCombiners(F["AE_ScreenManager_Combiners.json"],screens,"AE_ScreenManager_Combiners.json",PROB);
const SIZES=[...screens,...combos].map(p=>({...p,on:false}));
["1.7HD","Alshaheed - Mupi","1st Ring Road","Al Salam Mall","Boulevard Bridge","Marina_Crescent_Sync"].forEach(n=>{const s=SIZES.find(x=>x.name===n);if(s)s.on=true;});
const SHEET=[
 {version_id:"v01",lang:"EN",dir:"ltr",headline:"SUMMER SALE",offer:"Up to 50% off everything",price:"KD 9.90",color:"#0b3d91"},
 {version_id:"v02",lang:"AR",dir:"rtl",headline:"تخفيضات الصيف",offer:"خصم حتى ٥٠٪ على كل شيء",price:"٩٫٩٠ د.ك",color:"#7a1f5c"},
];
const FONT='"Noto Sans Arabic","Segoe UI",Tahoma,system-ui,sans-serif';
const PHOTO=document.createElement("canvas");PHOTO.width=1920;PHOTO.height=1080;(function(){const c=PHOTO.getContext("2d");
 const g=c.createLinearGradient(0,0,0,1080);g.addColorStop(0,"#0d2a5c");g.addColorStop(.6,"#1f6f8b");g.addColorStop(1,"#0a2030");c.fillStyle=g;c.fillRect(0,0,1920,1080);
 c.fillStyle="#0a1a28";for(let x=0;x<1920;x+=60){const h=120+((x*37)%140);c.fillRect(x,1080-h,50,h);}
 const r=c.createRadialGradient(1580,330,10,1580,330,260);r.addColorStop(0,"#fff6c0");r.addColorStop(.3,"#ffb020");r.addColorStop(1,"rgba(255,140,0,0)");c.fillStyle=r;c.fillRect(1200,0,720,700);
 c.fillStyle="#ffd66b";c.fillRect(1640,380,90,700);c.fillStyle="#fff";for(let y=420;y<1060;y+=40)c.fillRect(1660,y,50,14);
 c.font="bold 40px sans-serif";c.fillStyle="#fff";c.fillText("SUBJECT",1600,1000);})();
const AI={W:160,H:90,sal:null};(function(){const s=document.createElement("canvas");s.width=AI.W;s.height=AI.H;const c=s.getContext("2d");c.drawImage(PHOTO,0,0,AI.W,AI.H);
 const d=c.getImageData(0,0,AI.W,AI.H).data,L=new Float32Array(AI.W*AI.H);for(let i=0;i<L.length;i++)L[i]=.299*d[i*4]+.587*d[i*4+1]+.114*d[i*4+2];
 c.filter="blur(12px)";c.drawImage(PHOTO,0,0,AI.W,AI.H);const b=c.getImageData(0,0,AI.W,AI.H).data;AI.sal=new Float32Array(L.length);
 for(let y=1;y<AI.H-1;y++)for(let x=1;x<AI.W-1;x++){const i=y*AI.W+x,bl=.299*b[i*4]+.587*b[i*4+1]+.114*b[i*4+2];
  AI.sal[i]=Math.pow(Math.abs(L[i]-bl)+.5*(Math.abs(L[i+1]-L[i-1])+Math.abs(L[i+AI.W]-L[i-AI.W]))+(L[i]>200?40:0),1.5);}})();
// ---- non-destructive state: master (const) → rules (computed) → AI decisions (status) → manual overrides (params) ----
const CFG={gap:Adapt.DEFAULT_PRODUCT_GAP,thr:.8},P_ROUTE={};function renderRQ(){const q=Object.entries(P_ROUTE).filter(([,v])=>v.route==="review");const el=document.getElementById("rq");if(el)el.innerHTML=q.length?q.map(([k,v])=>`<div>• ${k.replace("|"," · ")} p=${v.p.toFixed(2)} <span class=small>${v.notes.slice(0,2).join("; ")}</span></div>`).join(""):"Empty — all decisions above threshold.";}const P_rect=(res,i)=>res.rects[i];
var ART={a:null,an:null};
const ST={ai:{},manual:{},mov:{}},HIST=[];let SEL=null,P_TPL=null;
const keyOf=(row,s)=>row.version_id+"|"+s.name;
const aiOn=(k,id)=>((ST.ai[k]||{})[id]??"accepted")==="accepted";
const man=k=>Object.assign({hlScale:1,hlDx:0,hlDy:0},ST.manual[k]||{});
function renderAll() {}
function setState(label,mutate){const before=JSON.stringify(ST);mutate();HIST.push({label,before,t:new Date().toLocaleTimeString()});renderAll();}
function toggleAI(k,id,label){setState(`${aiOn(k,id)?"Revert":"Accept"} ${label} · ${k}`,()=>{(ST.ai[k]=ST.ai[k]||{})[id]=aiOn(k,id)?"reverted":"accepted";});}
const mctx=document.createElement("canvas").getContext("2d");
const meas=(font)=>s=>{mctx.font=font;return mctx.measureText(s).width;};
function masterLayers(row,tagsOn){
  return MASTER.map(L=>{let [x,y,w,h]=L.box;let name=L.name;
    if(L.kind==="text"){mctx.font=`${L.weight} ${L.size}px ${FONT}`;w=Math.max(mctx.measureText(row[L.bind]||" ").width,10);h=L.size*1.25;}
    const at=Adapt.autoTag(L.name,L.box,MW,MH);if(at&&tagsOn)name=L.name+" "+at.tag;
    return {L,name,at,rect:{left:0,top:0,width:w,height:h},frac:{x0:x/MW,y0:y/MH,wF:w/MW,hF:h/MH,cx:(x+w/2)/MW,cy:(y+h/2)/MH}};});
}
// Build the whole stack for one tile → {res, decisions, draw plan}
function plan(row,s,forceTpl){useMaster(s,row);
  const k=keyOf(row,s),tw=s.w,th=s.h,rtl=row.dir==="rtl",ml=masterLayers(row,aiOn("*","autotag"));
  const res=Adapt.layoutScreen(ml,MW,MH,tw,th,{rtl});const D=[];
  const tall=["v","uv","xv"].includes(res.orient),wide=["uw","xw"].includes(res.orient)||tw/th>=2.5;
  ml.forEach(m=>{if(m.at)D.push({id:"autotag",label:"auto-tag "+m.at.tag,why:`“${m.L.name}” → ${m.at.tag} (${m.at.why}) · heuristic`,global:true});});
  D.push({id:"crop",label:"smart crop",why:"Background crop window chosen by saliency (subject kept). Revert = centre crop."});
  const T={};ml.forEach((m,i)=>{const r=res.rects[i];if(!r||m.L.kind!=="text")return;T[m.L.id]={r,font:m.L.size*(r.h/m.rect.height),lines:[row[m.L.bind]]};});
  // Senior-designer composer (all classes + combined faces). Revert = v0.3 rules layout.
  const TPL=forceTpl??aiOn(k,"template"),RECTS=res.rects.slice(),EXTRA=[],idx=kind=>ml.findIndex(m=>m.L.kind===kind),arab=/[\u0600-\u06FF]/.test(row.headline);
  D.push({id:"template",label:"designer layout "+res.orient+(s.faces&&s.faces.length>1?" · "+s.faces.length+" faces":""),why:`Per-class composition template "${res.orient}" (hierarchy, fill, spacing scale, optical balance)${s.faces&&s.faces.length>1?"; hero on the largest face, brand + CTA + offer on the others":""}. Parameters editable in TEMPLATES (engine). Revert = rules-only layout.`});
  if(TPL){const Lw=id=>MASTER.find(x=>x.id===id).weight,mh=meas(`${Lw("headline")} 1px ${FONT}`),mo=meas(`${Lw("offer")} 1px ${FONT}`);
    const LB=Adapt.lookupLayout(s.name,tw,th);const out=Adapt.composeFaces(artIn({libZones:LB.entry&&!(s.faces&&s.faces.length>1)&&!(ST.noLib)?{zones:LB.entry.zones,ribbon:LB.entry.ribbon,source:LB.source}:undefined,tw,th,rtl,texts:{headline:row.headline,offer:row.offer},measure:{headline:mh,offer:mo},productAspect:640/720,logoAspect:300/110,pair:(OR=>OR?{texts:{headline:OR.headline,offer:OR.offer},measure:{headline:mh,offer:mo}}:undefined)(SHEET.find(r=>r.dir!==row.dir))}),s.faces);
    out.forEach(o=>{const c=o.c;if(o.hero){RECTS[idx("product")]=c.rects.product||null;RECTS[idx("logo")]=c.rects.logo||null;RECTS[idx("price")]=c.rects.cta||null;
        for(const id of ["headline","offer"]){const t=c.text[id];if(t)T[id]={r:t.r,box:t.box,font:t.font,lines:t.lines,center:t.align==="center"};else delete T[id];}
        P_TPL=c;}
      else{if(c.rects.logo)EXTRA.push({kind:"logo",r:c.rects.logo});if(c.rects.cta)EXTRA.push({kind:"price",r:c.rects.cta});if(c.text.offer)EXTRA.push({kind:"offer",t:{...c.text.offer,center:c.text.offer.align==="center"}});}});
    if(rtl&&arab&&P_TPL.tpl.kashida&&T.headline&&T.headline.lines.length===1&&Adapt.KASHIDA_CLASSES.includes(P_TPL.cls)){D.push({id:"kashida",label:"kashida",why:"Wide Arabic headline: tatweel (U+0640) at each word's last joining point stretches lines to the slot width (≤3 per word, engine-enforced) · port of vectorcraft kashida.rs"});
      if(aiOn(k,"kashida")){const h=T.headline,f=meas(`${Lw("headline")} ${h.font}px ${FONT}`);let add=0;h.lines=h.lines.map(l=>{const kf=Adapt.kashidaFit(l,h.box.w,f,3);add+=kf.added;return kf.text;});
        const w=Math.max(...h.lines.map(f));h.r={...h.r,x:h.r.x+h.r.w-w,w};h.kashida=add;}}}
  if(!TPL&&tall&&T.headline){D.push({id:"chunk",label:"word split",why:"Tall frame: headline/offer broken into balanced word chunks and placed in the larger free band above/below the product · heuristic stand-in for AI word-split"});
    if(aiOn(k,"chunk")){const mg=res.margin,bx=mg,bw=tw-2*mg;const pi=ml.findIndex(m=>m.L.kind==="product"),pr=pi>=0?res.rects[pi]:null;
      let band={y0:T.headline.r.y,y1:th-mg};if(pr){const above={y0:mg+th*.06,y1:pr.y-th*.01},below={y0:pr.y+pr.h+th*.01,y1:th-mg};band=(above.y1-above.y0)>=(below.y1-below.y0)?above:below;}
      const bandH=Math.max(0,band.y1-band.y0),need=th*((res.orient==="v"?.2:.26)+.12+.015),fit=Math.min(1,bandH/need);let y=band.y0;
      for(const id of ["headline","offer"]){const L=MASTER.find(x=>x.id===id);if(!T[id])continue;const bh=fit*th*(id==="headline"?(res.orient==="v"?.2:.26):.12);
        const c=Adapt.chunkToBox(row[L.bind],bw,bh,meas(`${L.weight} 1px ${FONT}`),id==="headline"?4:5);
        const font=Math.min(c.font,(id==="headline"?th*.09:th*.04)*fit);T[id]={r:{x:bx,y,w:bw,h:c.lines.length*font*1.12},font,lines:c.lines,center:true};y+=T[id].r.h+th*.015;}}}
  if(!TPL&&rtl&&wide&&Adapt.KASHIDA_CLASSES.includes(res.orient)&&T.headline&&/[\u0600-\u06FF]/.test(row.headline)){D.push({id:"kashida",label:"kashida",why:"Wide frame, Arabic: tatweel (U+0640) inserted at last joining point of each word so the headline fills its column · port of vectorcraft kashida.rs"});
    if(aiOn(k,"kashida")){const h=T.headline,L=MASTER.find(x=>x.id==="headline"),f=`${L.weight} ${h.font}px ${FONT}`;
      const target=Math.min(h.r.w*1.45,h.r.x+h.r.w-res.margin);const kf=Adapt.kashidaFit(row.headline,target,meas(f),3);h.lines=[kf.text];h.kashida=kf.added;h.r={...h.r,x:h.r.x+h.r.w-meas(f)(kf.text),w:meas(f)(kf.text)};}}
  const M=man(k);if(M.logoScale&&M.logoScale!==1){const li=idx("logo"),L0=RECTS[li];if(L0){const w=L0.w*M.logoScale,h=L0.h*M.logoScale,cx=L0.x+L0.w/2<tw/2?L0.x:L0.x+L0.w-w;RECTS[li]={x:cx,y:L0.y,w,h};}}
  if(T.headline&&(M.hlScale!==1||M.hlDx||M.hlDy)){const h=T.headline;h.font*=M.hlScale;h.r={x:h.r.x+M.hlDx*tw,y:h.r.y+M.hlDy*th,w:h.r.w*M.hlScale,h:h.r.h*M.hlScale};h.manual=true;}
  // HARD RULE: text never overlaps the product; keep GAP. Layout resolves it (move → shrink). Opt-out only per layer (allowOverlap / ".overlap").
  const gapPx=CFG.gap*Math.min(tw,th),pi2=ml.findIndex(m=>m.L.kind==="product"),prod=pi2>=0?RECTS[pi2]:null;
  const grp=Object.keys(T).filter(id=>{const L=MASTER.find(x=>x.id===id);return !Adapt.allowsOverlap(L.name,L.allowOverlap);});
  if(prod&&grp.length){const hows=[];
    // per text layer (a headline above and an offer below the product must not be merged into one block)
    grp.forEach(id=>{const t=T[id],av=Adapt.avoidRect(t.r,prod,tw,th,res.margin,gapPx);hows.push(av.how);
      if(av.how==="move"||av.how==="shrink"){t.r=av.r;t.font*=av.scale;}});
    const worst=["impossible","shrink","move","none"].find(h=>hows.includes(h));
    D.unshift({id:"rule-gap",rule:true,label:"clear of product: "+worst,why:`Hard rule: text keeps ≥${Math.round(gapPx)} px (${(CFG.gap*100).toFixed(1)}% of short side) from the product. Per layer: ${grp.map((g,i)=>g+" "+hows[i]).join(", ")}. Opt-out per layer only.`});}
  // HARD RULE 2: price circle (CTA) keeps the same gap from headline/offer/product/logo — the badge moves (then shrinks), text never does.
  {const ci=idx("price"),cr=ci>=0?RECTS[ci]:null;if(cr&&!(TPL&&s.faces&&s.faces.length>1)){const obs=Object.keys(T).map(id=>T[id].r).concat([prod,RECTS[idx("logo")]].filter(Boolean));
    const kc=Adapt.keepClear(cr,obs,tw,th,res.margin,gapPx);RECTS[ci]=kc.r;D.unshift({id:"rule-cta",rule:true,label:"price clear of text: "+kc.how,why:`Hard rule: price circle keeps ≥${Math.round(gapPx)} px from headline, offer, product and logo; resolved by ${kc.how} (badge moves first, then shrinks to ≥60%).`});}}
  const items=[];ml.forEach((m,i)=>{const r=RECTS[i];if(!r)return;if(m.L.kind==="logo")items.push({kind:"logo",r});if(m.L.kind==="price")items.push({kind:"cta",r});if(m.L.kind==="product")items.push({kind:"product",r});});
  Object.keys(T).forEach(id=>{const L=MASTER.find(x=>x.id===id),t=T[id];items.push({kind:"text",r:t.r,fontPx:t.font,allow:Adapt.allowsOverlap(L.name,L.allowOverlap)&&false});});
  const qa=Adapt.qaScore(items.filter(it=>!(it.kind==="text"&&it.allow)),tw,th,res.margin,.035,gapPx);D.push({id:"qa",label:"QA "+qa.score,why:"Auto QA: "+(qa.issues.join("; ")||"no issues")+" · heuristic",qa});
  const g=(id)=>RECTS[idx(id)]||undefined,ds=Adapt.designScore({tw,th,cls:res.orient,rtl,arabic:arab,kashidaUsed:!!(T.headline&&T.headline.kashida),margin:res.margin,headline:T.headline&&{...T.headline,box:T.headline.box},offer:T.offer,logo:g("logo"),product:g("product"),cta:g("price")});
  const pr=ds.total/100,route=Adapt.routeDecision(pr,CFG.thr??.8);P_ROUTE[k]={p:pr,route,notes:ds.notes};
  D.push({id:"route",rule:route==="review",label:(route==="auto"?"auto p=":"needs review p=")+pr.toFixed(2),why:`Decision routing (Jev AI Score/Noul stand-in = rubric/100): p ${route==="auto"?"≥":"<"} threshold ${(CFG.thr??.8)} → ${route==="auto"?"auto-applied with badge":"queued for review"}.`});
  D.push({id:"design",label:"Design "+ds.total,why:"AI critic rubric (heuristic stand-in): "+Object.entries(ds.scores).map(([a,b])=>a+" "+b.toFixed(2)).join(", ")+(ds.notes.length?" · "+ds.notes.join("; "):""),qa:{score:ds.total}});
  const PL={k,res,ml,T,D,M,RECTS,EXTRA,ds,TPL,SCRIM:{}};
  // auto contrast: scrim/gradient behind any text block that fails (headline ≥3:1, body ≥4.5:1) — reversible badge
  {const need={headline:3,offer:4.5},fix=[];Object.keys(T).forEach(id=>{const a=Adapt.scrimAlpha(lumOf(245,245,245),bgLum(row,s,PL,T[id].r),need[id]||4.5);if(a>0)fix.push([id,a]);});
   if(fix.length){D.push({id:"contrast",label:"auto scrim",why:"Contrast auto-fix: soft dark gradient behind "+fix.map(([i,a])=>`${i} (${Math.round(a*100)}%)`).join(", ")+" so text reaches ≥3:1 headline / ≥4.5:1 body. Revert = no scrim."});if(aiOn(k,"contrast"))fix.forEach(([i,a])=>PL.SCRIM[i]=a);}}
  return PL;
}
// ---------- Real artwork pixels (PSD layers via ag-psd). Layers stay separate; the tile places each role unit in its zone ----------
const flatL=ls=>ls.flatMap(l=>[l,...(l.children?flatL(l.children):[])]);
function roleLayers(m,role){const ids=new Set(m.an.roles.filter(r=>r.role===role).map(r=>r.id));return flatL(m.a.layers).filter(l=>ids.has(l.id)&&l.px&&!l.hidden);}
function unitCanvas(m,role){m.U=m.U||{};if(m.U[role]!==undefined)return m.U[role];const ls=role.split("+").flatMap(r=>roleLayers(m,r));if(!ls.length)return m.U[role]=null;
  const x0=Math.min(...ls.map(l=>l.box[0])),y0=Math.min(...ls.map(l=>l.box[1])),x1=Math.max(...ls.map(l=>l.box[0]+l.box[2])),y1=Math.max(...ls.map(l=>l.box[1]+l.box[3]));
  const c=document.createElement("canvas");c.width=Math.max(1,x1-x0);c.height=Math.max(1,y1-y0);const g=c.getContext("2d");const order=flatL(m.a.layers);
  ls.slice().sort((p,q)=>order.indexOf(q)-order.indexOf(p)).forEach(l=>{g.save();if(l.opacity!=null)g.globalAlpha=l.opacity;if(l.blend==="multiply")g.globalCompositeOperation="multiply";g.drawImage(l.px,l.box[0]-x0,l.box[1]-y0);g.restore();}); // bottom→top
  return m.U[role]={c,box:[x0,y0,x1-x0,y1-y0]};}
/** Use the original composite's neutral edge material when a flat PSD layer
 * is a decorative accent rather than the actual canvas background. */
function originalEdgeColor(m){
  const src=m.a.composite;if(!src)return null;
  const c=document.createElement('canvas');c.width=32;c.height=32;
  const g=c.getContext('2d');g.drawImage(src,0,0,32,32);
  const d=g.getImageData(0,0,32,32).data,colors=[];
  for(let y=0;y<32;y++)for(let x=0;x<32;x++){
    if(x>3&&x<28&&y>3&&y<28)continue;
    const i=(y*32+x)*4;if(d[i+3]<200)continue;
    const r=d[i],gr=d[i+1],b=d[i+2];
    // Ignore saturated brand accents and dark copy when extending canvas.
    if(Math.max(r,gr,b)-Math.min(r,gr,b)>55||Math.max(r,gr,b)<105)continue;
    colors.push([r,gr,b]);
  }
  if(colors.length<24)return null;
  const med=k=>colors.map(c=>c[k]).sort((a,b)=>a-b)[colors.length>>1];
  return [med(0),med(1),med(2)];
}
function bgInfo(m){if(m.BG!==undefined)return m.BG;const L=roleLayers(m,"bg")[0];if(!L)return m.BG=null;const q=document.createElement("canvas");q.width=32;q.height=18;const g=q.getContext("2d");g.drawImage(L.px,0,0,32,18);
  const d=g.getImageData(0,0,32,18).data;let r=0,gg=0,b=0,v=0;const n=d.length/4;for(let i=0;i<d.length;i+=4){r+=d[i];gg+=d[i+1];b+=d[i+2];}r/=n;gg/=n;b/=n;for(let i=0;i<d.length;i+=4)v+=(d[i]-r)**2+(d[i+1]-gg)**2+(d[i+2]-b)**2;
  return m.BG={L,flat:Math.sqrt(v/n)<6,color:`rgb(${r|0},${gg|0},${b|0})`,lum:(.2126*r+.7152*gg+.0722*b)/255};}
function pxFixStyle(a,an){if(!a.topFirst)return;const m={a,an};const bi=bgInfo(m);if(bi&&bi.flat){const r=an.rules.find(x=>x.key==="artStyle");if(r){r.value="flat";r.why="background pixels are one flat colour ("+bi.color+")";r.overrides="no scrim; extend the colour on any ratio";}}}
/** Rasterised text line → words by empty alpha columns (gap ≥ 22% of the line height), then re-flowed into the line count that best fits the zone. RTL keeps right-to-left order. */
function reflowRaster(c,za,rtl,maxN){maxN=maxN||4;c.__rf=c.__rf||{};const key=za.toFixed(2)+rtl+maxN;if(c.__rf[key])return c.__rf[key];const W=c.width,H=c.height,d=c.getContext("2d").getImageData(0,0,W,H).data,col=new Uint8Array(W);
  for(let x=0;x<W;x++){for(let y=0;y<H;y+=2)if(d[(y*W+x)*4+3]>40){col[x]=1;break;}}
  const words=[];let x=0;while(x<W){while(x<W&&!col[x])x++;if(x>=W)break;let s=x,gap=0,e=x;while(x<W){if(col[x]){gap=0;e=x;}else if(++gap>=H*.22)break;x++;}words.push([s,e+1]);}
  if(words.length<2)return c.__rf[key]={c,lines:1};
  let best=null;for(let n=1;n<=Math.min(maxN,words.length);n++){const per=Math.ceil(words.length/n),ls=[];for(let i=0;i<words.length;i+=per)ls.push(words.slice(i,i+per));
    const lw=ls.map(l=>l[l.length-1][1]-l[0][0]),w=Math.max(...lw),h=n*H*1.1,sc=Math.min(za>w/h?1:1,1),fit=Math.min(1/w*za,1/h);if(!best||fit>best.fit)best={n,ls,lw,w,h,fit};}
  if(best.n===1)return c.__rf[key]={c,lines:1};
  const o=document.createElement("canvas");o.width=best.w;o.height=Math.ceil(best.h);const g=o.getContext("2d");
  best.ls.forEach((l,i)=>{const x0=l[0][0],w=l[l.length-1][1]-x0;g.drawImage(c,x0,0,w,H,(best.w-w)/2,i*H*1.1,w,H);});
  if(rtl){/* RTL raster: rightmost words are read first, so lines must be taken from the right end */const o2=document.createElement("canvas");o2.width=o.width;o2.height=o.height;const g2=o2.getContext("2d");const rl=[];for(let i=words.length;i>0;i-=Math.ceil(words.length/best.n))rl.push(words.slice(Math.max(0,i-Math.ceil(words.length/best.n)),i));
    rl.forEach((l,i)=>{const x0=l[0][0],w=l[l.length-1][1]-x0;g2.drawImage(c,x0,0,w,H,(o2.width-w)/2,i*H*1.1,w,H);});return c.__rf[key]={c:o2,lines:best.n};}
  return c.__rf[key]={c:o,lines:best.n};}
function clipAway(Z,o,g){const ix=Math.max(0,Math.min(Z.x+Z.w,o.x+o.w)-Math.max(Z.x,o.x)),iy=Math.max(0,Math.min(Z.y+Z.h,o.y+o.h)-Math.max(Z.y,o.y));if(!ix||!iy)return Z;
  const c=[{x:Z.x,y:Z.y,w:o.x-g-Z.x,h:Z.h},{x:o.x+o.w+g,y:Z.y,w:Z.x+Z.w-(o.x+o.w+g),h:Z.h},{x:Z.x,y:Z.y,w:Z.w,h:o.y-g-Z.y},{x:Z.x,y:o.y+o.h+g,w:Z.w,h:Z.y+Z.h-(o.y+o.h+g)}].filter(r=>r.w>0&&r.h>0);
  return c.length?c.sort((a,b)=>b.w*b.h-a.w*a.h)[0]:Z;}
function contain(ctx,src,r,ax,ay){if(ctx.__rec)ctx.__rec.push(r);const q=Math.min(r.w/src.width,r.h/src.height);const w=src.width*q,h=src.height*q;ctx.drawImage(src,r.x+(r.w-w)*(ax??.5),r.y+(r.h-h)*(ay??.5),w,h);const o={x:r.x+(r.w-w)*(ax??.5),y:r.y+(r.h-h)*(ay??.5),w,h,q};(CPX||[]).push([src,o]);return o;}
let CPX=null;
function hasPx(){return !!(ART&&ART.a&&ART.a.topFirst&&ART.an&&flatL(ART.a.layers).some(l=>l.px));}
const MIN_HL_TALL=0.025;/* ASSUMED: tall roadside columns read at ~100 m+; headline line ≥2.5% of screen height */
/** Equal-size faces (h-dup / v-dup walls) with nothing for the secondary faces to carry (no logo / price in the art): repeat the hero face on every face. */
function dupFaces(ctx,s,P,empty){const F=s.faces;if(!F||F.length<2||!empty)return;if(!F.every(f=>Math.abs(f.w-F[0].w)<2&&Math.abs(f.h-F[0].h)<2))return;
  const z=P.PXR.copyZone||P.PXR.product;const hero=F.find(f=>z&&z.x>=f.x-1&&z.y>=f.y-1&&z.x<f.x+f.w&&z.y<f.y+f.h)||F[0];
  const M=ctx.getTransform(),t=document.createElement("canvas");t.width=Math.max(1,Math.round(hero.w*M.a));t.height=Math.max(1,Math.round(hero.h*M.d));t.getContext("2d").drawImage(ctx.canvas,hero.x*M.a+M.e,hero.y*M.d+M.f,t.width,t.height,0,0,t.width,t.height);F.forEach(f=>{if(f!==hero)ctx.drawImage(t,f.x,f.y,f.w,f.h);});P.PXMODE+=" · hero repeated on "+F.length+" equal faces";if(P.PXQ)P.PXQ.mode=P.PXMODE;}
/** Contrast from the rendered pixels: headline = its own text pixels (mask from the layer alpha) vs. the pixels right around them; offers = text inside each pill (10th vs 90th luminance percentile of the pill's own pixels). */
function pxContrast(ctx,m,P){const lum=(r,g,b)=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(r)+.7152*f(g)+.0722*f(b);},cr=(a,b)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05),med=a=>{a.sort((x,y)=>x-y);return a.length?a[a.length>>1]:0;};
  let hlC=null;const hm=P.PXR.hlMask;
  if(hm){const [src,o0]=hm,M=ctx.getTransform(),o={x:o0.x*M.a+M.e,y:o0.y*M.d+M.f,w:o0.w*M.a,h:o0.h*M.d,q:o0.q*M.a},W=ctx.canvas.width,H=ctx.canvas.height,pad=Math.max(4,o.h*.25),x0=Math.max(0,Math.floor(o.x-pad)),y0=Math.max(0,Math.floor(o.y-pad)),x1=Math.min(W,Math.ceil(o.x+o.w+pad)),y1=Math.min(H,Math.ceil(o.y+o.h+pad));
    if(x1>x0&&y1>y0){const T=ctx.getImageData(x0,y0,x1-x0,y1-y0).data,sk=src.getContext("2d").getImageData(0,0,src.width,src.height).data,st=Math.max(1,Math.floor(Math.sqrt((x1-x0)*(y1-y0)/40000)));const tx=[],bg=[];
      for(let y=y0;y<y1;y+=st)for(let x=x0;x<x1;x+=st){const sx=Math.floor((x-o.x)/o.q),sy=Math.floor((y-o.y)/o.q);const a=sx>=0&&sy>=0&&sx<src.width&&sy<src.height?sk[(sy*src.width+sx)*4+3]:0;const i=((y-y0)*(x1-x0)+(x-x0))*4;if(a===0)bg.push(lum(T[i],T[i+1],T[i+2]));}
      for(let i=0;i<sk.length;i+=4*Math.max(1,Math.floor(sk.length/4/20000)))if(sk[i+3]>200)tx.push(lum(sk[i],sk[i+1],sk[i+2])); /* text colour from the layer itself (exact, effects baked); background from the rendered tile around it */
      if(tx.length>10&&bg.length>10)hlC=+cr(med(tx),med(bg)).toFixed(2);}}
  let offC=null;const ou=unitCanvas(m,"offer");if(ou){const offs=roleLayers(m,"offer");let mins=[];offs.forEach(L=>{if(!L.px)return;const d=L.px.getContext("2d").getImageData(0,0,L.px.width,L.px.height).data,a=[];for(let i=0;i<d.length;i+=16)if(d[i+3]>200)a.push(lum(d[i],d[i+1],d[i+2]));if(a.length<20)return;a.sort((x,y)=>x-y);mins.push(cr(a[Math.floor(a.length*.03)],a[Math.floor(a.length*.6)]));});if(mins.length)offC=+Math.min(...mins).toFixed(2);}
  return {headline:hlC,offer:offC};}
/**
 * Detect content the semantic composer cannot place. A campaign PSD may have
 * multiple text groups (contact numbers, legal copy, etc.) beyond the four
 * built-in roles. Silently dropping those layers is worse than a safe fallback.
 */
function unplacedVisibleLayers(m){
  const visible=flatL(m.a.layers).filter(l=>l.px&&!l.hidden&&!(l.children&&l.children.length)&&l.box&&l.box[2]>0&&l.box[3]>0);
  const placed=new Set(['bg','product','headline','offer','logo','price'].flatMap(role=>roleLayers(m,role)));
  return visible.filter(l=>!placed.has(l));
}
function drawPx(ctx,row,s,P){const tw=s.w,th=s.h,m=ART,bi=bgInfo(m);CPX=[];
  const missing=unplacedVisibleLayers(m);
  if(missing.length&&m.a.composite){
    drawFlattenedMaster(ctx,s,m);
    P.PXMODE='safe composition: '+missing.length+' unmapped visible layer(s)';
    P.PXQ={hlPx:0,hlPct:0,overlapPx:0,outside:false,mode:P.PXMODE,needsReview:true};
    P.PXC=null;P.PXR={};
    return P;
  }
  if(Math.abs(Math.log((tw/th)/(m.a.w/m.a.h)))<=0.02&&m.a.composite&&!(s.faces&&s.faces.length>1)){ctx.drawImage(m.a.composite,0,0,tw,th);P.PXMODE="master as-is (same ratio, scaled)";const hu3=unitCanvas(m,"headline");P.PXR={};if(hu3){const f=tw/m.a.w;P.PXR.hlMask=[hu3.c,{x:hu3.box[0]*f,y:hu3.box[1]*f,w:hu3.c.width*f,h:hu3.c.height*f,q:f}];}P.PXC=pxContrast(ctx,m,P);P.PXQ={hlPx:Math.round((hu3?hu3.box[3]:0)*th/m.a.h),hlPct:+((hu3?hu3.box[3]:0)/m.a.h*100).toFixed(1),overlapPx:0,outside:false,mode:P.PXMODE};return P;}
  if(bi){if(bi.flat){const edge=originalEdgeColor(m);ctx.fillStyle=edge?`rgb(${edge.join(',')})`:bi.color;ctx.fillRect(0,0,tw,th);}else{const L=bi.L,f=Math.max(tw/L.px.width,th/L.px.height);const w=tw/f,h=th/f,fo=(m.an.rules.find(r=>r.key==="focal")||{}).value||[.5,.5];
    const x=Math.max(0,Math.min(L.px.width-w,fo[0]*L.px.width-w/2)),y=Math.max(0,Math.min(L.px.height-h,fo[1]*L.px.height-h/2));ctx.drawImage(L.px,x,y,w,h,0,0,tw,th);}}
  else{ctx.fillStyle="#333";ctx.fillRect(0,0,tw,th);}
  const rectOf=kind=>{const i=P.ml.findIndex(x=>x.L.kind===kind);return i>=0?P.RECTS[i]:null;};
  P.PXR={};P.PXHL=0;P.PXC=null;const pr=rectOf("product"),pu=unitCanvas(m,"product");if(pr&&pu)P.PXR.product=contain(ctx,pu.c,pr,.5,1);
  const zone=id=>P.T[id]?P.T[id].r:null,al=row.dir==="rtl"?1:0;const Zs=[zone("headline"),zone("offer"),rectOf("price")].filter(Boolean);
  const hu=unitCanvas(m,"headline"),ou=unitCanvas(m,"offer"),cu2=unitCanvas(m,"headline+offer");
  if(Zs.length&&cu2){const x0=Math.min(...Zs.map(r=>r.x)),y0=Math.min(...Zs.map(r=>r.y));let Z={x:x0,y:y0,w:Math.max(...Zs.map(r=>r.x+r.w))-x0,h:Math.max(...Zs.map(r=>r.y+r.h))-y0};
    if(P.PXR.product)Z=clipAway(Z,P.PXR.product,Math.min(tw,th)*.03);P.PXR.copyZone=Z;
    const az=Z.w/Z.h,au=cu2.c.width/cu2.c.height,k=Math.max(az/au,au/az);const tall=!!(hu&&ou)&&(az<au*0.75||hu.c.height*Math.min(Z.w/cu2.c.width,Z.h/cu2.c.height)<th*0.025);P.PXMODE=k<=2.2&&!tall?"copy unit":"split";
    if((k<=2.2&&!tall)||!(hu&&ou)){const o=contain(ctx,cu2.c,Z,al,.5);if(hu)P.PXR.hlMask=[hu.c,{x:o.x+(hu.box[0]-cu2.box[0])*o.q,y:o.y+(hu.box[1]-cu2.box[1])*o.q,w:hu.c.width*o.q,h:hu.c.height*o.q,q:o.q}];}
    else if(az>1&&!tall){const wH=Z.w*hu.c.width/(hu.c.width+ou.c.width*Z.h/ou.c.height*hu.c.height/Z.h||1);const gap=Z.h*.15,hw=Math.min(Z.w*.62,Z.h*hu.c.width/hu.c.height);
      const hr={x:al?Z.x+Z.w-hw:Z.x,y:Z.y,w:hw,h:Z.h},or={x:al?Z.x:Z.x+hw+gap,y:Z.y,w:Z.w-hw-gap,h:Z.h};P.PXR.hlMask=[hu.c,contain(ctx,hu.c,hr,al,.5)];contain(ctx,ou.c,or,al,.5);void wH;}
    else{/* Stacked: tagline re-flowed at word gaps, anchored to the bottom; pills above with ≥1U gap (U = ¼ headline line). Tall columns: min headline = MIN_HL_TALL of screen height (viewing distance, ASSUMED) — more lines / bigger share until met. */
      const rtl=row.dir==="rtl",tallCol=tw/th<0.5,minHl=th*(tallCol?MIN_HL_TALL:0.025);let best=null;
      for(const share of tallCol?[.35,.45,.55]:[.35])for(const n of tallCol?[4,6]:[4]){const hz={x:Z.x,y:Z.y+Z.h*(1-share),w:Z.w,h:Z.h*share},rf=reflowRaster(hu.c,hz.w/hz.h,rtl,n),q=Math.min(hz.w/rf.c.width,hz.h/rf.c.height),hl=hu.c.height*q;
        if(!best||(best.hl<minHl&&hl>best.hl)){best={hz,rf,hl};}if(hl>=minHl)break;}
      const {hz,rf}=best;if(rf.lines>1)P.PXMODE="split + baked tagline re-flowed into "+rf.lines+" lines (word gaps)";
      const oh=contain(ctx,rf.c,hz,.5,1);P.PXHL=hu.c.height*oh.q;P.PXR.hlMask=[rf.c,oh];const U=P.PXHL/4;P.PXR.gapU=U;
      const oz={x:Z.x,y:Z.y,w:Z.w,h:Math.max(1,oh.y-U-Z.y)};const oo=contain(ctx,ou.c,oz,.5,.5);P.PXR.offGapPx=Math.round(oh.y-(oo.y+oo.h));}}
  {const hu2=unitCanvas(m,"headline"),pl=CPX.filter(([c])=>c!==(pu&&pu.c));let hl=P.PXHL||0;if(!hl)pl.forEach(([c,o])=>{if(hu2&&(c===hu2.c))hl=hu2.box[3]*o.q;else if(c===(unitCanvas(m,"headline+offer")||{}).c&&hu2)hl=hu2.box[3]*o.q;});
   const pr2=P.PXR.product,ov=pr2?pl.reduce((a,[,o])=>a+Math.max(0,Math.min(o.x+o.w,pr2.x+pr2.w)-Math.max(o.x,pr2.x))*Math.max(0,Math.min(o.y+o.h,pr2.y+pr2.h)-Math.max(o.y,pr2.y)),0):0;
   const out=pl.some(([,o])=>o.x<-1||o.y<-1||o.x+o.w>tw+1||o.y+o.h>th+1);
   P.PXQ={hlPx:Math.round(hl),hlPct:+(hl/th*100).toFixed(1),overlapPx:Math.round(ov),outside:out,mode:P.PXMODE};}
  const lu=unitCanvas(m,"logo"),lr=rectOf("logo");if(lu&&lr)contain(ctx,lu.c,lr,.5,.5);
  const cu=unitCanvas(m,"price"),cr2=rectOf("price");if(cu&&cr2)contain(ctx,cu.c,cr2,.5,.5);
  dupFaces(ctx,s,P,!(lu&&lr)&&!(cu&&cr2));
  P.PXC=pxContrast(ctx,m,P);
  if(s.faces&&s.faces.length>1){ctx.save();ctx.strokeStyle="rgba(255,255,255,.7)";ctx.setLineDash([Math.max(tw,th)*.01,Math.max(tw,th)*.008]);ctx.lineWidth=Math.max(tw,th)*.003;s.faces.forEach(f=>ctx.strokeRect(f.x,f.y,f.w,f.h));ctx.restore();}
  return P;}
/**
 * Flattened PNG/JPG/WebP assets cannot be safely reflowed into new ratios.
 * Preserve every original pixel using contain, with a soft ambient extension.
 * The same drawing path powers both previews and PNG exports.
 */
function drawFlattenedMaster(ctx,s,m){
  const src=m.a.composite,tw=s.w,th=s.h,sw=src.width,sh=src.height;
  if(!(tw>0&&th>0&&sw>0&&sh>0))return;
  const cover=Math.max(tw/sw,th/sh),cw=sw*cover,ch=sh*cover;
  ctx.save();
  ctx.fillStyle='#17202b';ctx.fillRect(0,0,tw,th);
  if(typeof ctx.filter==='string')ctx.filter='blur('+Math.max(8,Math.round(Math.min(tw,th)*.035))+'px) brightness(0.55)';
  else ctx.globalAlpha=.35;
  ctx.drawImage(src,(tw-cw)/2,(th-ch)/2,cw,ch);
  ctx.restore();
  const margin=Math.min(tw,th)*.045;
  const fit=Math.min((tw-2*margin)/sw,(th-2*margin)/sh);
  const w=sw*fit,h=sh*fit;
  ctx.drawImage(src,(tw-w)/2,(th-h)/2,w,h);
}
function draw(ctx,row,s,P,forceTpl){const tw=s.w,th=s.h;
  if(!P)useMaster(s,row);
  if(ART&&ART.a&&ART.a.source&&ART.a.source.format==='image'&&ART.a.composite){
    drawFlattenedMaster(ctx,s,ART);return P||{PXMODE:'flattened artwork · full creative preserved'};
  }
  P=P||plan(row,s,forceTpl);if(hasPx())return drawPx(ctx,row,s,P);
  P.ml.forEach((m,i)=>{const r=P.RECTS[i];if(!r)return;if(m.L.kind==="text"&&!P.T[m.L.id])return;const L=m.L;ctx.save();
    if(L.kind==="bg"){let c;if(aiOn(P.k,"crop")){c=Adapt.saliencyCrop(AI.sal,AI.W,AI.H,tw/th);const q=PHOTO.width/AI.W;c={x:c.x*q,y:c.y*q,w:c.w*q,h:c.h*q};}
      else{const f=Math.max(tw/PHOTO.width,th/PHOTO.height);c={w:tw/f,h:th/f};c.x=(PHOTO.width-c.w)/2;c.y=(PHOTO.height-c.h)/2;}
      ctx.drawImage(PHOTO,c.x,c.y,c.w,c.h,0,0,tw,th);ctx.fillStyle=row.color||"#0b3d91";ctx.globalAlpha=.35;ctx.fillRect(0,0,tw,th);}
    else if(L.kind==="product"){ctx.fillStyle="rgba(255,255,255,.18)";rr(ctx,r.x,r.y,r.w,r.h,r.w*.06);ctx.fill();ctx.fillStyle="rgba(255,255,255,.85)";ctx.beginPath();ctx.ellipse(r.x+r.w/2,r.y+r.h*.55,r.w*.28,r.h*.3,0,0,7);ctx.fill();
      ctx.fillStyle="#0b3d91";ctx.font=`600 ${r.h*.06}px ${FONT}`;ctx.textAlign="center";ctx.fillText("PRODUCT",r.x+r.w/2,r.y+r.h*.57);}
    else if(L.kind==="logo"){ctx.fillStyle="#fff";rr(ctx,r.x,r.y,r.w,r.h,r.h*.12);ctx.fill();ctx.fillStyle="#0b3d91";ctx.font=`800 ${r.h*.45}px ${FONT}`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("LOGO",r.x+r.w/2,r.y+r.h/2);}
    else if(L.kind==="price"){ctx.fillStyle="#ffcc00";ctx.beginPath();ctx.arc(r.x+r.w/2,r.y+r.h/2,Math.min(r.w,r.h)/2,0,7);ctx.fill();ctx.fillStyle="#111";ctx.font=`800 ${Math.min(r.w,r.h)*.2}px ${FONT}`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.direction=row.dir;ctx.fillText(row.price,r.x+r.w/2,r.y+r.h/2,r.w*.85);}
    else{const t=P.T[L.id];const sa=P.SCRIM&&P.SCRIM[L.id];if(sa){const pd=t.font*.35;ctx.save();ctx.fillStyle=`rgba(0,0,0,${sa})`;ctx.shadowColor=`rgba(0,0,0,${sa})`;ctx.shadowBlur=pd*2;rr(ctx,t.r.x-pd,t.r.y-pd,t.r.w+2*pd,t.r.h+2*pd,pd);ctx.fill();ctx.restore();}if(P.M.scrim){ctx.fillStyle="rgba(0,0,0,.45)";const pd=t.font*.25;rr(ctx,t.r.x-pd,t.r.y-pd,t.r.w+2*pd,t.r.h+2*pd,pd);ctx.fill();}ctx.fillStyle="#F5F5F5";ctx.font=`${L.weight} ${t.font}px ${FONT}`;ctx.textBaseline="top";ctx.direction=row.dir;
      const LD=P.TPL?Adapt.leadingFor(row.headline+row.offer):1.12;t.lines.forEach((ln,j)=>{const y=t.r.y+j*t.font*LD+t.font*(LD-1)/2;
        if(t.center){ctx.textAlign="center";ctx.fillText(ln,t.r.x+t.r.w/2,y,t.r.w);}else if(row.dir==="rtl"){ctx.textAlign="right";ctx.fillText(ln,t.r.x+t.r.w,y,t.r.w);}else{ctx.textAlign="left";ctx.fillText(ln,t.r.x,y,t.r.w);}});}
    ctx.restore();});
  P.EXTRA.forEach(e=>{ctx.save();const r=e.r;
    if(e.kind==="logo"){ctx.fillStyle="#fff";rr(ctx,r.x,r.y,r.w,r.h,r.h*.12);ctx.fill();ctx.fillStyle="#0b3d91";ctx.font=`800 ${r.h*.45}px ${FONT}`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText("LOGO",r.x+r.w/2,r.y+r.h/2);}
    else if(e.kind==="price"){ctx.fillStyle="#ffcc00";ctx.beginPath();ctx.arc(r.x+r.w/2,r.y+r.h/2,r.w/2,0,7);ctx.fill();ctx.fillStyle="#111";ctx.font=`800 ${r.w*.2}px ${FONT}`;ctx.textAlign="center";ctx.textBaseline="middle";ctx.direction=row.dir;ctx.fillText(row.price,r.x+r.w/2,r.y+r.h/2,r.w*.85);}
    else{const t=e.t;ctx.fillStyle="#fff";ctx.font=`500 ${t.font}px ${FONT}`;ctx.textBaseline="top";ctx.direction=row.dir;const B=t.box||t.r;const LD=Adapt.leadingFor(row.headline+row.offer);t.lines.forEach((ln,j)=>{const y=t.r.y+j*t.font*LD+t.font*(LD-1)/2;if(t.center){ctx.textAlign="center";ctx.fillText(ln,B.x+B.w/2,y,B.w);}else if(row.dir==="rtl"){ctx.textAlign="right";ctx.fillText(ln,B.x+B.w,y,B.w);}else{ctx.textAlign="left";ctx.fillText(ln,B.x,y,B.w);}});}
    ctx.restore();});
  if(s.faces&&s.faces.length>1){ctx.save();ctx.strokeStyle="rgba(255,255,255,.7)";ctx.setLineDash([Math.max(tw,th)*.01,Math.max(tw,th)*.008]);ctx.lineWidth=Math.max(tw,th)*.003;s.faces.forEach(f=>ctx.strokeRect(f.x,f.y,f.w,f.h));ctx.restore();}
  return P;}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
const safe=s=>s.replace(/[^\w\u0600-\u06FF-]+/g,"_");
function exportPNG(row,s){const c=document.createElement("canvas");c.width=s.w;c.height=s.h;draw(c.getContext("2d"),row,s);
  c.toBlob(b=>{const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`SummerSale_${row.version_id}_${row.lang}_${safe(s.name)}_${s.w}x${s.h}.png`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);},"image/png");}
function badge(P,d){if(d.rule){const e=document.createElement("span");e.className="b qa"+(d.label.endsWith("impossible")?" bad":"");e.style.borderStyle="dashed";e.textContent="RULE · "+d.label;e.title=d.why;return e;}const k=d.global?"*":P.k,on=aiOn(k,d.id);const e=document.createElement("span");
  e.className="b"+(d.qa?" qa"+(d.qa.score<80?" bad":""):"")+(on?"":" off");e.textContent="AI · "+d.label;e.title=d.why+"\nClick to "+(on?"revert":"accept");
  e.onclick=ev=>{ev.stopPropagation();toggleAI(k,d.id,d.label);};return e;}
function tileCanvas(row,s,maxW,maxH){const q=Math.min(maxW/s.w,maxH/s.h),dpr=window.devicePixelRatio||1,c=document.createElement("canvas");
  c.width=Math.max(1,Math.round(s.w*q*dpr));c.height=Math.max(1,Math.round(s.h*q*dpr));c.style.width=s.w*q+"px";c.style.height=s.h*q+"px";
  const ctx=c.getContext("2d");ctx.scale(q*dpr,q*dpr);const P=draw(ctx,row,s);return {c,P};}

let ARTS=[],ACT=0;
function psdFromBuf(buf,file){const p=readPsd(new Uint8Array(buf),{skipLayerImageData:false,skipThumbnail:true,skipCompositeImageData:false});bakeOverlays(p.children);const a=Adapt.fromAgPsd(p,file);if(p.canvas)Object.defineProperty(a,"composite",{value:p.canvas,enumerable:false});return a;}
function autoIdx(s,row){if(!ARTS.length)return -1;const M=ARTS.map(a=>({w:a.a.w,h:a.a.h,lang:a.lang||""}));return row?Adapt.pickMasterForLang(M,s.w,s.h,row.lang).index:Adapt.pickMaster(M,s.w,s.h).index;}
function masterIdx(s,row){const o=ST.mov[s.name];if(o!=null&&ARTS[o]&&(!row||!ARTS[o].lang||ARTS[o].lang===row.lang))return o;return autoIdx(s,row);}
function useMaster(s,row){const i=masterIdx(s,row);ART=i>=0?ARTS[i]:{a:null,an:null};}
const lumOf=(r,g,b)=>{const f=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4;};return .2126*f(r)+.7152*f(g)+.0722*f(b);};
function bgLum(row,s,P,r,sa){const q=Math.min(1,240/Math.max(s.w,s.h)),c=document.createElement("canvas");c.width=Math.max(1,Math.round(s.w*q));c.height=Math.max(1,Math.round(s.h*q));const x=c.getContext("2d");x.scale(q,q);
  const bi=P.ml.findIndex(m=>m.L.kind==="bg");const P2={...P,ml:P.ml.filter((m,i)=>i===bi||m.L.kind==="product"),RECTS:P.RECTS.filter((_,i)=>i===bi||P.ml[i].L.kind==="product"),EXTRA:[],T:{}};draw(x,row,s,P2);
  if(P.M.scrim){x.fillStyle="rgba(0,0,0,.45)";x.fillRect(r.x,r.y,r.w,r.h);}if(sa){x.fillStyle=`rgba(0,0,0,${sa})`;x.fillRect(r.x,r.y,r.w,r.h);}
  const d=x.getImageData(Math.floor(r.x*q),Math.floor(r.y*q),Math.max(1,Math.ceil(r.w*q)),Math.max(1,Math.ceil(r.h*q))).data,L=[];for(let i=0;i<d.length;i+=4)L.push(lumOf(d[i],d[i+1],d[i+2]));L.sort((a,b)=>a-b);return L[Math.floor(L.length*.9)]||0;}
function artIn(base){if(!ART.an)return base;const r=ART.an.rules.filter(x=>x.on!==false);const o=Adapt.applyArtRules(base,r);return o;}
function fontOK(f){const c=document.createElement("canvas").getContext("2d"),t="mmmmmmmmmmlli 0123";return ["monospace","serif"].some(fb=>{c.font=`40px ${fb}`;const a=c.measureText(t).width;c.font=`40px "${f}",${fb}`;return c.measureText(t).width!==a;});}
function bakeOverlays(ls){for(const l of ls||[]){bakeOverlays(l.children);if(!l.canvas||!l.effects)continue;const en=k=>[].concat(l.effects[k]||[]).find(e=>e&&e.enabled);
  const f=en("solidFill");if(f){const g=l.canvas.getContext("2d"),c=f.color||{};g.save();g.globalCompositeOperation="source-atop";g.globalAlpha=f.opacity??1;g.fillStyle=`rgb(${c.r|0},${c.g|0},${c.b|0})`;g.fillRect(0,0,l.canvas.width,l.canvas.height);g.restore();}
  const out=bakeFx(l.canvas,{dropShadow:en("dropShadow"),outerGlow:en("outerGlow"),stroke:en("stroke")});if(out){l.canvas=out.c;l.left-=out.pad;l.top-=out.pad;l.right=l.left+out.c.width;l.bottom=l.top+out.c.height;}}}
/** Draw outer glow, drop shadow and stroke (outside/center) around a layer's pixels. Canvas grows by `pad`. Approximations: glow/shadow = canvas blur of the silhouette (size ≈ blur), spread/choke, contours and noise ignored. */
function bakeFx(src,fx){const px=v=>v==null?0:typeof v==="number"?v:+v.value||0,col=(c,a)=>`rgba(${(c&&c.r)|0},${(c&&c.g)|0},${(c&&c.b)|0},${a??1})`;const ds=fx.dropShadow,og=fx.outerGlow,st=fx.stroke;if(!ds&&!og&&!st)return null;
  const dsz=ds?px(ds.size)+px(ds.distance):0,gsz=og?px(og.size):0,ssz=st?px(st.size):0,pad=Math.ceil(Math.max(dsz,gsz,ssz)+2);
  const c=document.createElement("canvas");c.width=src.width+2*pad;c.height=src.height+2*pad;const g=c.getContext("2d");
  const sil=(color)=>{const t=document.createElement("canvas");t.width=src.width;t.height=src.height;const k=t.getContext("2d");k.drawImage(src,0,0);k.globalCompositeOperation="source-in";k.fillStyle=color;k.fillRect(0,0,t.width,t.height);return t;};
  if(og){g.save();g.globalAlpha=og.opacity??1;g.filter=`blur(${px(og.size)/2}px)`;const s1=sil(col(og.color||{r:255,g:255,b:190}));g.drawImage(s1,pad,pad);g.drawImage(s1,pad,pad);g.restore();}
  if(ds){const a=(ds.angle??120)*Math.PI/180,d=px(ds.distance);g.save();g.globalAlpha=ds.opacity??.75;g.filter=`blur(${px(ds.size)/2}px)`;g.drawImage(sil(col(ds.color)),pad-Math.cos(a)*d,pad+Math.sin(a)*d);g.restore();}
  if(st){const r=px(st.size)*(st.position==="inside"?0:st.position==="center"?.5:1),s1=sil(col(st.color||st.fillColor,1));g.save();g.globalAlpha=st.opacity??1;const n=Math.max(12,Math.ceil(r*2));for(let i=0;i<n;i++){const t=i/n*2*Math.PI;g.drawImage(s1,pad+Math.cos(t)*r,pad+Math.sin(t)*r);}g.restore();}
  g.drawImage(src,pad,pad);return {c,pad};}


/** Prefer the visually dominant campaign line over date/offer copy. */
function correctHeadlineRole(a,an){
  const flat=flatL(a.layers), candidates=flat.filter(l=>l.kind==='text'&&!l.hidden&&l.box&&l.box[2]>0&&l.box[3]>0);
  if(!candidates.length)return;
  const score=l=>{
    const name=(l.name||'').toLowerCase(),content=String(l.text||l.value||'').toLowerCase();
    const t=name+' '+content,b=l.box;
    let v=Math.sqrt(b[2]*b[3])/Math.sqrt(a.w*a.h);
    if(/headline|hero|main copy|main text|tagline|we still want|more kitchens/.test(t))v+=2;
    if(/offer|extended|november|date|terms|legal|whatsapp|phone|contact|cta/.test(t))v-=2;
    return v;
  };
  const sorted=candidates.slice().sort((x,y)=>score(y)-score(x)),best=sorted[0];
  if(score(best)<=0)return;
  const current=an.roles.find(x=>x.role==='headline');
  if(current&&current.id===best.id)return;
  const chosen=an.roles.find(x=>x.id===best.id);
  if(!chosen)return;
  if(current)current.role=/offer|extended|november|date/i.test((flat.find(l=>l.id===current.id)||{}).name||'')?'offer':'ignore';
  chosen.role='headline';chosen.why='campaign headline: visual size and semantic priority';chosen.confidence=.8;
}
function artLoad(a, thumb) {
  const fonts = [...new Set(JSON.stringify(a.layers).match(/"font":"[^"]+"/g) || [])].map((x) => x.slice(8, -1))
  const an = Adapt.analyseArtwork(a, fonts.filter(fontOK).concat(['__none__']))
  correctHeadlineRole(a, an)
  pxFixStyle(a, an)
  const lr = an.rules.find((r) => r.key === 'lang')
  const fileLang = Adapt.langFromFilename((a.source && a.source.file) || '')
  const lang = fileLang.explicit ? fileLang.lang : lr ? lr.value : fileLang.lang
  let i = ARTS.findIndex((x) => x.a === a)
  if (i < 0) {
    ARTS.push({
      a, an,
      name: (a.source && a.source.file) || 'master',
      thumb: thumb || (a.composite ? a.composite.toDataURL('image/jpeg', 0.6) : null),
      lang: lang || '',
    })
    i = ARTS.length - 1
  } else {
    ARTS[i].an = an
    ARTS[i].lang = lang || ARTS[i].lang
  }
  ACT = i
  ART = ARTS[i]
  return ARTS[i]
}


export { Adapt, SHEET, SIZES, ARTS, SAMPLE_SVG, SAMPLE_PSD_B64 }
export function loadSampleSvg() {
  artLoad(Adapt.fromSVG(SAMPLE_SVG, 'sample.svg'))
  return ARTS.length
}
export function loadSamplePsd() {
  const bin = Uint8Array.from(atob(SAMPLE_PSD_B64), (c) => c.charCodeAt(0))
  artLoad(psdFromBuf(bin.buffer, 'sample.psd'))
  return ARTS.length
}
export function importSvgText(text, name) {
  artLoad(Adapt.fromSVG(text, name))
  return ARTS.length
}
export function importPsdBuffer(buf, name) {
  artLoad(psdFromBuf(buf, name))
  return ARTS.length
}
/** Raster master: one full-bleed pixel layer so drawPx (the v1.5 pixel path) places it. */
export function importRasterCanvas(canvas, name) {
  const w = canvas.width, h = canvas.height
  const a = {
    w, h, topFirst: true,
    layers: [{ id: 'bg1', name: 'Background', kind: 'image', box: [0, 0, w, h], src: name }],
    source: { format: 'image', file: name },
  }
  Object.defineProperty(a.layers[0], 'px', { value: canvas, enumerable: false })
  Object.defineProperty(a, 'composite', { value: canvas, enumerable: false })
  artLoad(a, canvas.toDataURL('image/jpeg', 0.6))
  return ARTS.length
}
export function masterFor(screen, row) {
  const i = masterIdx(screen, row)
  return i >= 0 ? ARTS[i] : null
}
export function renderTile(row, screen, maxW, maxH) {
  return tileCanvas(row, screen, maxW, maxH)
}
export function renderFull(row, screen) {
  const c = document.createElement('canvas')
  c.width = screen.w
  c.height = screen.h
  draw(c.getContext('2d'), row, screen)
  return c
}
export function artLang(entry) {
  return entry && entry.lang ? entry.lang : ''
}

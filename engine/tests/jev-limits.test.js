const A=require("../build/adapt.cjs");let n=0;const ok=(m,c)=>{if(!c){console.error("FAIL",m);process.exit(1)}n++;};
const m=k=>s=>s.length*k;
// 1) price circle keep-clear on portrait classes (and all)
for(const [w,h] of [[1080,1920],[480,1440],[1008,5184],[864,864],[1920,1080],[7680,1152],[3584,384]])for(const rtl of [false,true]){
 const c=A.compose({tw:w,th:h,rtl,texts:{headline:"SUMMER SALE",offer:"Up to 50% off everything"},measure:{headline:m(.62),offer:m(.55)},productAspect:.9,logoAspect:2.7});
 const g=A.DEFAULT_PRODUCT_GAP*Math.min(w,h)-0.5;for(const id of ["headline","offer"])ok(`cta gap ${w}x${h} ${id}`,A.rectGap(c.rects.cta,c.text[id].r)>=g);ok("cta vs product",A.rectGap(c.rects.cta,c.rects.product)>=g);}
const kc=A.keepClear({x:100,y:100,w:100,h:100},[{x:90,y:90,w:200,h:50}],1080,1920,54,38);ok("keepClear moves",kc.how==="move"&&A.rectGap(kc.r,{x:90,y:90,w:200,h:50})>=37.5);
// 2) Thuraya_Full secondary-face offer inside face safe margins
const faces=[{x:0,y:0,w:2624,h:608},{x:2624,y:0,w:960,h:608}];
for(const rtl of [false,true]){const f=A.composeFaces({tw:3584,th:608,rtl,texts:{headline:"SUMMER SALE",offer:"Up to 50% off everything"},measure:{headline:m(.62),offer:m(.6)},productAspect:.9,logoAspect:2.7},faces);
 const s=f.find(o=>!o.hero),mg=s.c.margin,r=s.c.text.offer.r;ok("secondary offer in face margin",r.x>=s.face.x+mg-0.5&&r.x+r.w<=s.face.x+s.face.w-mg+0.5&&s.c.text.offer.box.x>=s.face.x+mg-0.5);
 ok("secondary cta clear of offer",A.rectGap(s.c.rects.cta,r)>=0.02*608-0.5);}
// 3) fill = union coverage, not bbox
ok("coverage two corners ≪ bbox",A.coverage([{x:0,y:0,w:10,h:10},{x:90,y:90,w:10,h:10}],100,100,0)<0.05);
ok("coverage full",A.coverage([{x:0,y:0,w:100,h:100}],100,100,0)===1);
// 4) no kashida flag when headline fills its box
const base={tw:3584,th:384,cls:"xw",arabic:true,rtl:true,margin:19};
ok("flag when headline short",A.designScore({...base,headline:{r:{x:0,y:0,w:500,h:100},font:100,box:{x:0,y:0,w:1500,h:100}}}).notes.some(x=>/kashida/.test(x)));
ok("no flag when width-bound",!A.designScore({...base,headline:{r:{x:0,y:0,w:1450,h:100},font:100,box:{x:0,y:0,w:1500,h:100}}}).notes.some(x=>/kashida/.test(x)));
// 5) max 3 kashida per word
const kf=A.kashidaFit("تخفيضات الصيف",1e6,s=>s.length*10,6);ok("≤3 per word",kf.added<=3*2);ok("cap const",A.KASHIDA_MAX_PER_WORD===3);
kf.text.split(" ").forEach(w=>ok("word ≤3 tatweel",(w.match(/\u0640/g)||[]).length<=3));
// Jev
const rq=A.jevRequest("template",{screen:{w:1080,h:1920}});ok("jev model",rq.model==="jev-latest"&&rq.type==="Choice");ok("jev score type",A.jevRequest("quality",{}).type==="Score");ok("jev noul",A.jevRequest("review",{}).type==="Noul");
let thr=false;try{A.jevRequest("quality",{thumb:"data:image/png;base64,AAA"})}catch(e){thr=true}ok("jev rejects images",thr);
ok("route auto",A.routeDecision(.9,.8)==="auto");ok("route review",A.routeDecision(.7,.8)==="review");ok("route local",A.routeDecision(null)==="local");
console.log("ok — "+n+" checks");

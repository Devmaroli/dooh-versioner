import { test } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import A from '../adapt.js'
import { readPsd } from 'ag-psd'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const D = path.resolve(__dirname, '../../data/screens') + '/'
const agp = { readPsd }

test('spacing.test', () => {
let p=0,f=0;const ok=(n,c)=>{c?p++:(f++,console.log("FAIL",n));};
ok("U = 0.25H",A.spacingU(190)===48&&A.spacingU(340)===85);ok("U min 8",A.spacingU(12)===8);
const T=A.spacingTable(190,120,95);ok("head→sub 1.2U",Math.abs(T.headlineToSubline-57.6)<.1);ok("sub→cta 3U",T.sublineToCta===144);ok("logo→head max(6U,logo)",T.logoToHeadline===288&&A.spacingTable(100,200).logoToHeadline===200);ok("logo clear .5",T.logoClear===60);ok("cta→legal",T.ctaToLegal===47.5);ok("bilingual ≥4U",T.bilingualGap===192);
const m=s=>s.length*.55,b=A.ctaButton(190,"Shop now",m,false),br=A.ctaButton(190,"تسوق الآن",m,true);ok("cta text .5H",b.textSize===95&&b.h===190&&b.padY===47.5&&b.padX===95);ok("cta arrow mirrored",br.arrowSide==="left"&&b.arrowSide==="right");
const pb=A.priceBlock(100,true);ok("price block",pb.currencyGap===20&&pb.oldSize===50&&pb.oldGap===30&&pb.noWrap);
ok("kashida only 1-line wide headline",A.kashidaAllowed("xw","headline",1)&&!A.kashidaAllowed("xw","headline",2)&&!A.kashidaAllowed("v","headline",1)&&!A.kashidaAllowed("uw","offer",1)&&A.kashidaAllowed("h","headline",1));
ok("scrim 0 when passing",A.scrimAlpha(0.91,0.05,3)===0);const a=A.scrimAlpha(0.91,0.6,3);ok("scrim alpha reaches 3:1",a>0&&(0.96)/(0.6*Math.pow(1-a,2.2)+.05)>=3);
const pf=A.pairFonts(100,86,1.0,1.2);ok("pair shrinks EN when AR can't grow",Math.abs(pf.ar/pf.en-1.12)<.01&&pf.ar===86);const pg=A.pairFonts(100,86,1.5,1);ok("pair grows AR",Math.abs(pg.ar-112)<.01&&pg.en===100);
const base={tw:1080,th:1920,texts:{headline:"Summer Sale",offer:"Up to 50% off everything"},measure:{headline:s=>s.length*.6,offer:s=>s.length*.55},productAspect:.9,logoAspect:2.7};
const ar={headline:"تخفيضات الصيف",offer:"خصم حتى ٥٠٪ على كل شيء"},mA={headline:s=>s.length*.62,offer:s=>s.length*.55};
for(const [w,h] of [[1080,1920],[3584,384],[1920,1080],[1008,5184]]){const en=A.compose({...base,tw:w,th:h,pair:{texts:ar,measure:mA}}),a2=A.compose({...base,tw:w,th:h,rtl:true,texts:ar,measure:mA,pair:{texts:base.texts,measure:base.measure}});
  const r=a2.text.headline.font/en.text.headline.font;ok(`AR/EN 110–115% @${w}x${h} (${(r*100).toFixed(0)}%)`,r>=1.095&&r<=1.155);ok("U set",en.U===A.spacingU(en.text.headline.font));
  const H=en.text.headline,O=en.text.offer;if(O&&O.r.y>H.r.y+H.r.h-H.font&&O.r.x<H.r.x+H.r.w&&H.r.x<O.r.x+O.r.w&&O.r.y-H.r.y-H.r.h<4*en.U){const hi=A.inkRect({...H,lead:1.12}),oi=A.inkRect({...O,lead:1.12}),g=oi.y-hi.y-hi.h;ok(`head→sub ≈1.2U @${w}x${h} (${(g/en.U).toFixed(2)}U)`,g>=0.6*en.U&&g<=2.5*en.U);}}
const t={id:"x",tw:1080,th:1920,cls:"v",arabic:true,rtl:true,headline:{r:{x:100,y:500,w:800,h:300},font:120,lines:["تخفيـضات","الصيـف"],lead:1.4},tracking:0};
ok("audit flags multi-line kashida",A.auditTile(t).rows[15].measured.includes("kashida on headline"));
ok("audit row 20 exists",A.auditTile(t).rows.length===20&&A.AUDIT_CRITERIA[19].startsWith("Spacing"));
const t2={id:"y",tw:1920,th:1080,cls:"h",headline:{r:{x:100,y:300,w:800,h:130},font:120,lines:["Summer"]},offer:{r:{x:100,y:700,w:600,h:60},font:50,lines:["Up to 50%"]},tracking:0.02,ctaButton:{h:100,textSize:60,padX:60,padY:30,arrowSide:"right"},priceBlock:{numberSize:100,currencyGap:40,oneLine:false},bilingualGap:50};
const r20=A.auditTile(t2).rows[19];ok("spacing fails",!r20.pass&&/EN tracking/.test(r20.measured)&&/currency gap/.test(r20.measured)&&/price wraps/.test(r20.measured)&&/EN↔AR/.test(r20.measured)&&/headline→subline/.test(r20.measured));
console.log(`spacing: ${p} pass, ${f} fail`);if (f) throw new Error("failed "+f);

})

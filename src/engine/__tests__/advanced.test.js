import { test } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import A from '../adapt.js'
import { readPsd } from 'ag-psd'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const D = path.resolve(__dirname, '../../data/screens') + '/'
const agp = { readPsd }

test('advanced.test', () => {
let f=0;const ok=(n,c)=>{if(!c){f++;console.log("FAIL "+n);}};
const F=(w,h)=>A.screenFamily(w,h);
ok("hawally ultra t1",F(5832,432).key==="ultra"&&F(5832,432).tier===1);
ok("kuwait gate ultra",F(4460,378).key==="ultra");
ok("1920x320 ribbon",F(1920,320).key==="ribbon");
ok("2375x475 short ribbon, odd→t3",F(2375,475).key==="shortRibbon"&&F(2375,475).tier===3);
ok("2304x1152 panoramic",F(2304,1152).key==="panoramic");
ok("1080x1920 portrait t1",F(1080,1920).key==="portrait"&&F(1080,1920).tier===1);
ok("960x5328 xtall",F(960,5328).key==="xtall");
ok("240x960 tall t1",F(240,960).key==="tall"&&F(240,960).tier===1);
ok("7560x2100 t3",F(7560,2100).tier===3);
ok("1440x864 wide t2",F(1440,864).tier===2);
const L=A.contentLadder(5832,432,["logo","headline","product","offer","cta","subline","badge","legal"]);
ok("ladder keeps rank1+cta",["logo","headline","product","offer","cta"].every(r=>L.keep.includes(r)));
ok("ladder drops subline/badge/legal on ultra",["subline","badge","legal"].every(r=>!L.keep.includes(r)));
ok("ladder keeps subline on wide",A.contentLadder(1920,1080,["headline","subline"]).keep.includes("subline"));
const v=A.viewingSize(40,11500/4460);ok("viewing 40m cap≈129px font≈185",Math.abs(v.capPx-129)<2&&Math.abs(v.fontPx-185)<3);
ok("AR 112%",Math.abs(v.arFontPx/v.fontPx-1.12)<1e-9);
const I=A.intakeChecks({w:7560,h:2100,arabicCopy:false,heroPx:{w:1000,h:1000},placedPx:{w:1500,h:1500}}).map(x=>x.msg).join("|");
ok("intake HEVC L6",/Level 6/.test(I));ok("intake AR blocker",/blocker/.test(I));ok("intake upscale",/150%/.test(I));
ok("intake odd",/odd size/.test(A.intakeChecks({w:2027,h:720}).map(x=>x.msg).join()));
ok("intake bitrate 1080p",/6\.2–10\.4 Mbps/.test(A.intakeChecks({w:1920,h:1080}).map(x=>x.msg).join()));
ok("950x600 standard wide",F(950,600).key==="wide");ok("860x720 square",F(860,720).key==="square");
console.log(f?"FAIL advanced "+f:"advanced ok");if (f) throw new Error("failed "+f);

})

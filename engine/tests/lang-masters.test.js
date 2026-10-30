const A=require("../build/adapt.cjs");let f=0,p=0;const ok=(n,c)=>{if(!c){f++;console.log("FAIL "+n);}else p++;};
const art=(file,names,text)=>({source:{file},layers:names.map(n=>({name:n,kind:"pixel",text,children:[]}))});
ok("Campaign_EN.psd -> EN",A.detectMasterLang(art("Campaign_EN.psd",["1.7HD En"]))==="EN");
ok("Campaign_AR.psd -> AR",A.detectMasterLang(art("Campaign_AR.psd",["Arabic text"]))==="AR");
ok("Arabic live text -> AR",A.detectMasterLang(art("x.psd",["t"],"نص تجريبي"))==="AR");
const M=[{w:1920,h:1080,lang:"EN"},{w:1920,h:1080,lang:"AR"}];
ok("EN screen uses EN master",A.pickMasterForLang(M,1080,1920,"EN").index===0);
ok("AR screen uses AR master",A.pickMasterForLang(M,1080,1920,"AR").index===1);
const M2=[{w:1920,h:1080,lang:"EN"},{w:3840,h:540}];
ok("untagged ribbon master still serves AR",A.pickMasterForLang(M2,4460,378,"AR").index===1);
ok("EN-only tagged master falls back for AR",A.pickMasterForLang([{w:1920,h:1080,lang:"EN"}],1920,1080,"AR").index===0);

const T=(n,l,b)=>{const r=A.langFromFilename(n);ok(`suffix ${n} -> ${l}${b!=null?" base "+b:""}`,r.lang===l&&(b==null||r.base===b));};
T("Campaign_AR.psd","AR","Campaign");T("Campaign-ar.psd","AR","Campaign");T("Campaign Ar.psd","AR","Campaign");T("CampaignAR.psd","AR","Campaign");T("CampaignAr.psd","AR","Campaign");
T("Campaign Arabic.psd","AR","Campaign");T("Campaign_ARABIC.PSD","AR","Campaign");T("Campaign عربي.psd","AR","Campaign");T("Campaign_عربي.psd","AR","Campaign");
T("Campaign_EN.psd","EN","Campaign");T("Campaign-english.psd","EN","Campaign");T("Campaign.psd","EN","Campaign");T("Qatar.psd","EN","Qatar");T("/x/y/Arabic_Rio.psd","EN","Arabic_Rio");
ok("no suffix = implicit",A.langFromFilename("Campaign.psd").explicit===false);
ok("filename suffix beats layer names",A.detectMasterLang({source:{file:"Promo_AR.psd"},layers:[{name:"English copy",children:[]}]})==="AR");
console.log(`lang-masters (suffix): ${p} pass, ${f} fail`);process.exit(f?1:0);

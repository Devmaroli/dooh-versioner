var A=require("../build/adapt.cjs"),ran=0,fail=[];function ok(l,c){ran++;if(!c)fail.push(l);}
var m=function(s){return Array.from(s).length;}; // 1 unit per code point
ok("beh-alef joined pick", JSON.stringify(A.kashidaPicks("با"))==="[1]");
ok("alef does not join forward", A.kashidaPicks("اب").length===0);
ok("last joint per word", JSON.stringify(A.kashidaPicks("تخفيضات الصيف"))==="[5,12]");
ok("latin gets none", A.kashidaPicks("SALE").length===0);
var k=A.kashidaFit("تخفيضات الصيف",20,m); ok("fit reaches target", m(k.text)<=20 && k.added===6);
ok("cap per word", A.kashidaFit("بب",100,m,6).added===3);
ok("no stretch when already wide", A.kashidaFit("بب",1,m).added===0);
var L=A.balancedBreak("UP TO 50% OFF EVERYTHING".split(" "),2,m); ok("balanced 2 lines", L.length===2);
ok("weak word not at line end", !/ (TO|OF)$/i.test(A.balancedBreak("SALE OF THE YEAR NOW ON".split(" "),3,m)[0]));
var c=A.chunkToBox("SUMMER SALE NOW ON",10,40,m); ok("tall box picks more lines", c.k>=2);
ok("autotag price -> cta", A.autoTag("Price badge",[0,0,10,10],100,100).tag==="@cta");
ok("autotag skips tagged", A.autoTag("X @logo",[0,0,1,1],1,1)===null);
var q=A.qaScore([{kind:"text",r:{x:0,y:0,w:50,h:10},fontPx:2},{kind:"logo",r:{x:40,y:0,w:20,h:20}}],100,100,5);
ok("qa flags small text, overlap, safe area", q.issues.length>=3 && q.score<60);
if(fail.length){console.log(fail);process.exit(1);}console.log("ok — "+ran+" checks");
var q2=A.qaScore([{kind:"text",r:{x:10,y:10,w:50,h:20},fontPx:10},{kind:"product",r:{x:20,y:20,w:30,h:30}}],100,100,5);
if(!q2.issues.includes("text overlaps product")){console.log("FAIL product overlap");process.exit(1);}console.log("ok — product overlap checked");

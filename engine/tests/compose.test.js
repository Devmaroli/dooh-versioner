var A=require("../build/adapt.cjs"),ran=0,fail=[];function ok(l,c){ran++;if(!c)fail.push(l);}
function hit(a,b){return a.x<b.x+b.w-0.5&&b.x<a.x+a.w-0.5&&a.y<b.y+b.h-0.5&&b.y<a.y+a.h-0.5;}
var m=function(k){return function(s){return Array.from(s).length*k;};}; // ~0.6em per glyph
var SZ={xw:[3584,384],uw:[7680,1152],h:[1920,1080],sq:[864,864],v:[1080,1920],uv:[480,1440],xv:[1008,5184]};
Object.keys(SZ).forEach(function(cls){[false,true].forEach(function(rtl){
  var s=SZ[cls],c=A.compose({tw:s[0],th:s[1],rtl:rtl,texts:{headline:"SUMMER SALE NOW ON",offer:"Up to 50% off everything"},measure:{headline:m(.62),offer:m(.55)},productAspect:640/720,logoAspect:300/110});
  ok(cls+" class",c.cls===cls);
  var ink=Object.assign({},c.rects);["headline","offer"].forEach(function(k){if(c.text[k])ink[k]=A.inkRect({r:c.text[k].r,font:c.text[k].font,lines:c.text[k].lines,lead:A.leadingFor("x")});});var R=Object.values(ink),bad=0;R.forEach(function(a,i){R.forEach(function(b,j){if(i<j&&hit(a,b))bad++;});});ok(cls+(rtl?" rtl":"")+" no overlaps (ink)",bad===0);
  R.forEach(function(r){ok(cls+" inside safe",r.x>=c.margin-1&&r.y>=c.margin-1&&r.x+r.w<=s[0]-c.margin+1&&r.y+r.h<=s[1]-c.margin+1);});
  ok(cls+" hierarchy",c.text.headline.font>=c.text.offer.font*c.tpl.hierarchy-0.01);
  var sc=A.designScore({tw:s[0],th:s[1],cls:cls,margin:c.margin,headline:c.text.headline,offer:c.text.offer,logo:c.rects.logo,product:c.rects.product,cta:c.rects.cta});
  ok(cls+" rubric ≥70 ("+sc.total+" "+sc.notes.join("; ")+")",sc.total>=70);
  if(cls==="h"){var p=c.rects.product.x+c.rects.product.w/2,t=c.text.headline.r.x;ok("h rtl mirrors",rtl?p>t:p<t);}
});});
var f=A.composeFaces({tw:3584,th:608,texts:{headline:"SUMMER SALE",offer:"Up to 50% off"},measure:{headline:m(.62),offer:m(.55)},productAspect:.9,logoAspect:2.7},[{x:0,y:0,w:2624,h:608},{x:2624,y:0,w:960,h:540}]);
var f2=A.composeFaces({tw:960,th:1440,texts:{headline:"SUMMER SALE",offer:"Up to 50% off everything"},measure:{headline:m(.62),offer:m(.55)},productAspect:.9,logoAspect:2.7},[{x:0,y:0,w:480,h:1440},{x:480,y:0,w:480,h:1440}]);ok("combined: secondary offer ≤ hero offer",f2[1].c.text.offer.font<=f2[0].c.text.offer.font+1e-6);
ok("combined: hero on big face",f[0].hero&&f[0].c.text.headline&&!f[1].c.text.headline&&f[1].c.rects.logo&&f[1].c.rects.cta.x>=2624);
var bad=A.designScore({tw:1000,th:1000,cls:"sq",margin:50,headline:{r:{x:100,y:100,w:100,h:20},font:20},offer:{r:{x:100,y:130,w:100,h:20},font:19}});
ok("rubric punishes flat hierarchy + tiny text",bad.scores.hierarchy<0.7&&bad.scores.legibility<0.5);
if(fail.length){console.log(fail);process.exit(1);}console.log("ok — "+ran+" checks");

import { test } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import A from '../adapt.js'
import { readPsd } from 'ag-psd'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const D = path.resolve(__dirname, '../../data/screens') + '/'
const agp = { readPsd }

test('fork-precomps.test', () => {

function fromAE(l){ var xf=function(L){return {position:L.transform.position.valueAtTime(),anchor:L.transform.anchorPoint.valueAtTime(),scale:L.transform.scale.valueAtTime()};};
  var ps=[],p=l.parent; while(p){ps.push(xf(p));p=p.parent;} return [l.sourceRectAtTime(),xf(l),ps]; }
var g = Object.assign({}, A, { sourceDeltaToCompDelta: function(l,L,T,b){ return A.sourceDeltaToCompDelta(L,T,b,l.transform.scale.value,l.transform.rotation.value); } }), place = A, anim = A, fuzzy = A;
var geo = { masterFractions: function(l,W,H){ var a=fromAE(l); return A.masterFractions(a[0],a[1],W,H,a[2]); } };
var cfg = { normalizeScreens: A.normalizeScreens, jsonStringify: function(x){return JSON.stringify(x);} };
var failures = [], ran = 0;
function check(label, actual, expected) {
  ran++;
  var a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) failures.push(label + "\n    expected " + e + "\n    actual   " + a);
}

var session = { label: "1080x1920", taken: { "Text Precomp [1080x1920]": true } };
check("fork name suffixes the screen label",
  g.forkNameFor(session, "Logo"), "Logo [1080x1920]");
check("fork name steps past a name already in the project",
  g.forkNameFor(session, "Text Precomp"), "Text Precomp [1080x1920] 2");
check("fork name steps past its own earlier duplicate",
  g.forkNameFor(session, "Text Precomp"), "Text Precomp [1080x1920] 3");
check("fork name reserves what it hands out",
  g.forkNameFor(session, "Logo"), "Logo [1080x1920] 2");

var renames = [
  { from: "Text Precomp", to: "Text Precomp [1080x1920]" },
  { from: "BG", to: "BG [1080x1920]" }
];
check("rewrites a double-quoted comp reference",
  g.rewriteCompRefs('comp("Text Precomp").layer("Headline").text.sourceText', renames),
  'comp("Text Precomp [1080x1920]").layer("Headline").text.sourceText');
check("rewrites a single-quoted comp reference",
  g.rewriteCompRefs("comp('BG').width", renames),
  "comp('BG [1080x1920]').width");
check("rewrites every occurrence on a line",
  g.rewriteCompRefs('comp("BG").width + comp("BG").height', renames),
  'comp("BG [1080x1920]").width + comp("BG [1080x1920]").height');
check("leaves an unforked comp alone",
  g.rewriteCompRefs('comp("Untouched").width', renames),
  'comp("Untouched").width');
check("does not match a longer name that starts the same",
  g.rewriteCompRefs('comp("BG Loop").width', renames),
  'comp("BG Loop").width');
check("leaves thisComp.layer references alone (layer names never change)",
  g.rewriteCompRefs('thisComp.layer("BG").position', renames),
  'thisComp.layer("BG").position');
check("a no-op rename changes nothing",
  g.rewriteCompRefs('comp("BG").width', [{ from: "BG", to: "BG" }]),
  'comp("BG").width');

if (failures.length) {
  console.error(failures.join("\n\n"));
  throw new Error("check failed");
}
console.log("ok — " + ran + " checks");

})

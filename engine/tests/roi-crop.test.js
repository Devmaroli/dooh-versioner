var fs = require("fs");
var path = require("path");
var A = require("../build/adapt.cjs");
function fromAE(l){ var xf=function(L){return {position:L.transform.position.valueAtTime(),anchor:L.transform.anchorPoint.valueAtTime(),scale:L.transform.scale.valueAtTime()};};
  var ps=[],p=l.parent; while(p){ps.push(xf(p));p=p.parent;} return [l.sourceRectAtTime(),xf(l),ps]; }
var g = Object.assign({}, A, { sourceDeltaToCompDelta: function(l,L,T,b){ return A.sourceDeltaToCompDelta(L,T,b,l.transform.scale.value,l.transform.rotation.value); } }), place = A, anim = A, fuzzy = A;
var geo = { masterFractions: function(l,W,H){ var a=fromAE(l); return A.masterFractions(a[0],a[1],W,H,a[2]); } };
var cfg = { normalizeScreens: A.normalizeScreens, jsonStringify: function(x){return JSON.stringify(x);} };
// Also pull placementAfterRoiCrop / rotScaleOffset (live after addShiftToLayerAnchor).
var failures = [], ran = 0;
function check(label, actual, expected) {
  ran++;
  var a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) failures.push(label + "\n    expected " + e + "\n    actual   " + a);
}
var full = { width: 1920, height: 1080 };
check("full-frame invalid", g.validRoi(full, [0, 0, 1920, 1080]), false);
check("smaller ROI valid", g.validRoi(full, [100, 80, 400, 300]), true);
check("offset full-size still valid", g.validRoi(full, [10, 0, 1920, 1080]), true);
check("zero size invalid", g.validRoi(full, [0, 0, 0, 100]), false);
check("null ROI invalid", g.validRoi(full, null), false);
check("format unreadable",
  g.formatRoiSkipReason("L1", "Comp A", null, 1920, 1080),
  "L1 (ROI missing/invalid in 'Comp A'; ROI=<unreadable> comp=1920x1080)");
check("format short array not unreadable",
  g.formatRoiSkipReason("L1", "Comp A", [0, 0], 1920, 1080),
  "L1 (ROI missing/invalid in 'Comp A'; ROI=0,0 comp=1920x1080)");
check("format full frame numbers",
  g.formatRoiSkipReason("L1", "Comp A", [0, 0, 1920, 1080], 1920, 1080),
  "L1 (ROI missing/invalid in 'Comp A'; ROI=[0,0,1920,1080] comp=1920x1080)");
check("basis shift identity",
  g.basisShiftComp({ xAxis: [1, 0], yAxis: [0, 1] }, 100, 50),
  [100, 50]);
check("basis shift scaled",
  g.basisShiftComp({ xAxis: [0.5, 0], yAxis: [0, 2] }, 100, 50),
  [50, 100]);
var fakeLayer = {
  transform: {
    scale: { value: [50, 200] },
    rotation: { value: 0 }
  }
};
check("scaleRot fallback no basis",
  g.sourceDeltaToCompDelta(fakeLayer, 100, 50, null),
  [50, 100]);
check("scaleRot uses provided basis over fallback",
  g.sourceDeltaToCompDelta(fakeLayer, 100, 50, { xAxis: [1, 0], yAxis: [0, 1] }),
  [100, 50]);

// User log: offset=[1568,96] src=1920x1080->264x208, typical center anchor
var saved = { pos: [960, 540], anc: [960, 540], scale: [100, 100], rot: 0 };
var place = g.placementAfterRoiCrop(saved, 1568, 96, 264, 208);
check("user-log new anchor is cropped center", place.anchor, [132, 104]);
// ROI center = (1568+132, 96+104) = (1700, 200); offset from old anc = (740, -340)
check("user-log new pos locks ROI center", place.position, [1700, 200]);
check("rotScale identity", g.rotScaleOffset(740, -340, [100, 100], 0), [740, -340]);

// User log (3D precomp): offset=[356,20] src=1040x720->196x176, centred anchor.
// With no rotation and 100% scale the world-space probe degenerates to this
// same 2D formula, so the outer layer placement was already correct - what
// moved was the 3D content inside the source comp (see shield3DContentBeforeCrop).
var saved3D = { pos: [520, 360], anc: [520, 360], scale: [100, 100], rot: 0 };
var place3D = g.placementAfterRoiCrop(saved3D, 356, 20, 196, 176);
check("3D log new anchor is cropped center", place3D.anchor, [98, 88]);
check("3D log new position locks ROI center", place3D.position, [454, 108]);

if (failures.length) {
  console.error(failures.join("\n\n"));
  process.exit(1);
}
console.log("ok — " + ran + " checks");

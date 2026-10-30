/*
 * Round-trip check for the Screen Adapter tag grammar.
 * Extracts the pure parsing/naming functions from ScreenAdapter.jsx and
 * exercises them outside After Effects. Run: node tools/tag-grammar.test.js
 */
var fs = require("fs");
var path = require("path");
var A = require("../build/adapt.cjs");
function fromAE(l){ var xf=function(L){return {position:L.transform.position.valueAtTime(),anchor:L.transform.anchorPoint.valueAtTime(),scale:L.transform.scale.valueAtTime()};};
  var ps=[],p=l.parent; while(p){ps.push(xf(p));p=p.parent;} return [l.sourceRectAtTime(),xf(l),ps]; }
var g = Object.assign({}, A, { sourceDeltaToCompDelta: function(l,L,T,b){ return A.sourceDeltaToCompDelta(L,T,b,l.transform.scale.value,l.transform.rotation.value); } }), place = A, anim = A, fuzzy = A;
var geo = { masterFractions: function(l,W,H){ var a=fromAE(l); return A.masterFractions(a[0],a[1],W,H,a[2]); } };
var cfg = { normalizeScreens: A.normalizeScreens, jsonStringify: function(x){return JSON.stringify(x);} };



var failures = [];
var ran = 0;
function check(label, actual, expected) {
  ran++;
  var a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a !== e) failures.push(label + "\n    expected " + e + "\n    actual   " + a);
}

// --- parsing: semantic roles and their aliases -------------------------
check("@panel role", g.parseTag("Pink @panel").role, "panel");
check("@product role", g.parseTag("Hero @product").role, "product");
check("@headline role", g.parseTag("Title @headline").role, "headline");
check("@cta role", g.parseTag("Buy @cta").role, "cta");
check("legacy @fit aliases to product", g.parseTag("X @fit").role, "product");
check("legacy @text aliases to headline", g.parseTag("X @text").role, "headline");
check("legacy @brand aliases to logo", g.parseTag("X @brand").role, "logo");
check("legacy @background aliases to bg", g.parseTag("X @background").role, "bg");

// --- anchor is optional: absent means "take it from the master" --------
check("bare tag has no anchor", g.parseTag("Pink @panel").anchor, null);
check("bare cta has no anchor", g.parseTag("Buy @cta").anchor, null);
check("pinned tag keeps its anchor", g.parseTag("Logo @logo.tl").anchor, "tl");

// --- adapt modes: absent falls back to the role default ----------------
check("panel defaults to stretch", g.effectiveAdapt(g.parseTag("P @panel")), "stretch");
check("logo defaults to keep", g.effectiveAdapt(g.parseTag("L @logo")), "keep");
check("bg defaults to cover", g.effectiveAdapt(g.parseTag("B @bg")), "cover");
check("explicit .keep overrides panel", g.effectiveAdapt(g.parseTag("P @panel.keep")), "keep");
check("multi-char .contain parses", g.parseTag("P @product.contain").adapt, "contain");
check("multi-char .stretch parses", g.parseTag("P @logo.stretch").adapt, "stretch");

// --- zones stay intact, and are not confused with anchors --------------
var z = g.parseTag("Hero @product.60.r");
check("zone pct", z.zone.pct, 60);
check("zone side", z.zone.side, "r");
check("zone leaves anchor unset", z.anchor, null);

// --- building: defaults produce a one-word tag -------------------------
check("panel default builds bare", g.buildTaggedName("Pink", { role: "panel" }), "Pink @panel");
check("cta default builds bare", g.buildTaggedName("Buy", { role: "cta" }), "Buy @cta");
check("pin is written", g.buildTaggedName("Logo", { role: "logo", anchor: "tl" }), "Logo @logo.tl");
check("adapt is written", g.buildTaggedName("Pink", { role: "panel", adapt: "keep" }), "Pink @panel.keep");
check("zone is written without anchor",
  g.buildTaggedName("Hero", { role: "product", zonePct: 60, zoneSide: "r" }), "Hero @product.60.r");
check("orientation is appended",
  g.buildTaggedName("Buy", { role: "cta", anchor: "br", orient: "h" }), "Buy @cta.br @h");

// --- round trip: build -> parse -> build is stable ---------------------
var cases = [
  { role: "panel" },
  { role: "logo", anchor: "tl" },
  { role: "cta", anchor: "br", orient: "h" },
  { role: "product", zonePct: 35, zoneSide: "l" },
  { role: "headline", adapt: "keep" },
  { role: "product", anchor: "c", adapt: "contain" }
];
cases.forEach(function (o, i) {
  var name = g.buildTaggedName("Layer", o);
  var parsed = g.parseTag(name);
  var rebuilt = g.buildTaggedName("Layer", {
    role: parsed.role, anchor: parsed.anchor, adapt: parsed.adapt, orient: parsed.orient,
    zonePct: parsed.zone ? parsed.zone.pct : null,
    zoneSide: parsed.zone ? parsed.zone.side : null,
    fitAxis: parsed.fitAxis,
    reserveVal: parsed.reserve ? parsed.reserve.value : null,
    reserveUnit: parsed.reserve ? parsed.reserve.unit : null
  });
  check("round trip " + i + " (" + name + ")", rebuilt, name);
});

// --- retagging replaces rather than accumulates ------------------------
check("retag strips the previous tag",
  g.buildTaggedName("Pink @panel.keep", { role: "product" }), "Pink @product");

// --- flush edges and keep-clear ----------------------------------------
check("ground is bottom flush", g.parseTag("Pink @panel.ground").flush, { b: true });
check("flushb parses", g.parseTag("Pink @panel.flushb").flush, { b: true });
check("flush edges combine", g.parseTag("Pink @panel.flushl.flushb").flush, { l: true, b: true });
check("no flush by default", g.parseTag("Pink @panel").flush, null);
check("clear parses", g.parseTag("Orange @panel.clear").clear, true);
check("no clear by default", g.parseTag("Orange @panel").clear, false);
check("bare clear takes the safe margin", g.parseTag("Orange @panel.clear").clearGap, null);
check("clear gap in px", g.parseTag("Orange @panel.clear24").clearGap, { value: 24, unit: "px" });
check("clear gap in percent", g.parseTag("Orange @panel.clear5p").clearGap, { value: 5, unit: "pct" });
check("clear gap implies clear", g.parseTag("Orange @panel.clear24").clear, true);
check("a clear gap is not read as a zone",
  g.parseTag("Orange @panel.clear60").zone, null);
check("a real zone still parses next to a clear gap",
  g.parseTag("Hero @product.60.r.clear12").zone, { pct: 60, side: "r" });
check("clear gap is written in px",
  g.buildTaggedName("Orange", { role: "panel", clear: true, clearGap: { value: 24, unit: "px" } }),
  "Orange @panel.clear24");
check("clear gap is written in percent",
  g.buildTaggedName("Orange", { role: "panel", clear: true, clearGap: { value: 5, unit: "pct" } }),
  "Orange @panel.clear5p");
check("gap shows up in the description",
  g.describeTag(g.parseTag("Orange @panel.clear24")).indexOf("by 24px") >= 0, true);
check("safe margin shows up when no gap is set",
  g.describeTag(g.parseTag("Orange @panel.clear")).indexOf("by safe margin") >= 0, true);
check("flush and clear coexist with adapt",
  g.parseTag("Orange @panel.keep.flushb.clear").adapt, "keep");
check("flush survives alongside an anchor", g.parseTag("Logo @logo.tl.flushr").flush, { r: true });
check("flush is written",
  g.buildTaggedName("Pink", { role: "panel", flush: { b: true, l: true } }), "Pink @panel.flushb.flushl");
check("clear is written",
  g.buildTaggedName("Orange", { role: "panel", clear: true }), "Orange @panel.clear");
check("flush shows up in the description",
  g.describeTag(g.parseTag("Pink @panel.ground")).indexOf("flush bottom") >= 0, true);
check("clear shows up in the description",
  g.describeTag(g.parseTag("Orange @panel.clear")).indexOf("clear of logos") >= 0, true);

[
  { role: "panel", flush: { b: true } },
  { role: "panel", adapt: "keep", flush: { l: true, b: true }, clear: true },
  { role: "logo", anchor: "tr", clear: true },
  { role: "panel", clear: true, clearGap: { value: 24, unit: "px" } },
  { role: "panel", adapt: "keep", flush: { b: true }, clear: true, clearGap: { value: 5, unit: "pct" } }
].forEach(function (o, i) {
  var name = g.buildTaggedName("Layer", o);
  var p = g.parseTag(name);
  var rebuilt = g.buildTaggedName("Layer", {
    role: p.role, anchor: p.anchor, adapt: p.adapt, orient: p.orient,
    zonePct: p.zone ? p.zone.pct : null, zoneSide: p.zone ? p.zone.side : null,
    flush: p.flush, clear: p.clear, clearGap: p.clearGap
  });
  check("flush round trip " + i + " (" + name + ")", rebuilt, name);
});

// --- master geometry capture -------------------------------------------

function fakeLayer(rect, pos, anc, scl) {
  var prop = function (v) { return { valueAtTime: function () { return v; } }; };
  return {
    sourceRectAtTime: function () { return rect; },
    transform: { position: prop(pos), anchorPoint: prop(anc), scale: prop(scl) }
  };
}
function near(label, actual, expected) {
  ran++;
  if (Math.abs(actual - expected) > 1e-6) {
    failures.push(label + "\n    expected " + expected + "\n    actual   " + actual);
  }
}

// a 400x300 shape centred in a 1920x1080 master, anchor at its own centre
var centred = geo.masterFractions(
  fakeLayer({ left: -200, top: -150, width: 400, height: 300 }, [960, 540], [0, 0], [100, 100]),
  1920, 1080, 0);
near("centred cx", centred.cx, 0.5);
near("centred cy", centred.cy, 0.5);
near("centred width fraction", centred.wF, 400 / 1920);
near("centred height fraction", centred.hF, 300 / 1080);

// the same shape at 50% scale stays centred but halves in size
var halved = geo.masterFractions(
  fakeLayer({ left: -200, top: -150, width: 400, height: 300 }, [960, 540], [0, 0], [50, 50]),
  1920, 1080, 0);
near("scaled cx unchanged", halved.cx, 0.5);
near("scaled width fraction", halved.wF, 200 / 1920);

// anchor parked on the shape's top-left corner
var cornerAnchored = geo.masterFractions(
  fakeLayer({ left: -200, top: -150, width: 400, height: 300 }, [100, 50], [-200, -150], [100, 100]),
  1920, 1080, 0);
near("corner-anchored x0", cornerAnchored.x0, 100 / 1920);
near("corner-anchored y0", cornerAnchored.y0, 50 / 1080);

// a layer off to one side must not report itself as centred
var offset = geo.masterFractions(
  fakeLayer({ left: -200, top: -150, width: 400, height: 300 }, [400, 540], [0, 0], [100, 100]),
  1920, 1080, 0);
near("offset cx", offset.cx, 400 / 1920);

// --- a tagged child parented to a controller null must report where it
// actually renders (comp space), not just its position relative to the null.
// This is the fix for nulls whose children went missing/mislocated after
// Generate: masterFractions previously ignored the parent chain entirely.
var scaledNullChild = fakeLayer({ left: -200, top: -150, width: 400, height: 300 }, [0, 0], [0, 0], [100, 100]);
scaledNullChild.parent = fakeLayer(null, [960, 540], [0, 0], [50, 50]);   // null: centred, scaled to 50%
var underScaledNull = geo.masterFractions(scaledNullChild, 1920, 1080, 0);
near("child under a scaled null keeps the null's centre", underScaledNull.cx, 0.5);
near("child under a scaled null keeps the null's centre (y)", underScaledNull.cy, 0.5);
near("child under a scaled null inherits the null's scale", underScaledNull.wF, (400 * 0.5) / 1920);
near("child under a scaled null inherits the null's scale (h)", underScaledNull.hF, (300 * 0.5) / 1080);

// a moved (not scaled) null just offsets the child by the null's position
var movedNullChild = fakeLayer({ left: -50, top: -50, width: 100, height: 100 }, [0, 0], [0, 0], [100, 100]);
movedNullChild.parent = fakeLayer(null, [300, 200], [0, 0], [100, 100]);
var underMovedNull = geo.masterFractions(movedNullChild, 1920, 1080, 0);
near("child under a moved null lands at the null's position (x)", underMovedNull.x0, (300 - 50) / 1920);
near("child under a moved null lands at the null's position (y)", underMovedNull.y0, (200 - 50) / 1080);

// a chain of two nulls compounds both position and scale
var chainChild = fakeLayer({ left: -50, top: -50, width: 100, height: 100 }, [0, 0], [0, 0], [100, 100]);
var innerNull = fakeLayer(null, [100, 100], [0, 0], [200, 200]);
innerNull.parent = fakeLayer(null, [960, 540], [0, 0], [50, 50]);
chainChild.parent = innerNull;
var underChain = geo.masterFractions(chainChild, 1920, 1080, 0);
// inner null: local (0,0) -> (100,100) at 200% scale; outer null: (100,100) -> 960+(100-0)*0.5, 540+(100-0)*0.5
near("chain of nulls compounds position (x)", underChain.x0 * 1920 + underChain.wF * 1920 / 2, 960 + 100 * 0.5);
near("chain of nulls compounds scale", underChain.wF, (100 * 2 * 0.5) / 1920);

// --- fractions survive a change of aspect ratio -------------------------
// pink block: left column of a 16:9 master, reproduced on three real screens
var pink = geo.masterFractions(
  fakeLayer({ left: 0, top: 0, width: 460, height: 700 }, [173, 270], [0, 0], [100, 100]),
  1920, 1080, 0);
[[1536, 576], [1440, 1008], [860, 720]].forEach(function (s) {
  var tw = s[0], th = s[1];
  var bx = pink.x0 * tw, bw = pink.wF * tw;
  near("pink keeps its left fraction at " + tw + "x" + th, bx / tw, pink.x0);
  near("pink keeps its width fraction at " + tw + "x" + th, bw / tw, pink.wF);
});

// --- flush + clearance geometry -----------------------------------------

// gap resolution: blank falls back to the safe margin, % reads the short side
near("no gap falls back to the safe margin",
  place.clearGapPx({ clearGap: null }, 43, 1536, 576), 43);
near("px gap is taken literally",
  place.clearGapPx({ clearGap: { value: 24, unit: "px" } }, 43, 1536, 576), 24);
near("percent gap reads the short side of a wide frame",
  place.clearGapPx({ clearGap: { value: 5, unit: "pct" } }, 43, 1536, 576), 28.8);
near("percent gap reads the short side of a tall frame",
  place.clearGapPx({ clearGap: { value: 5, unit: "pct" } }, 43, 1080, 1920), 54);

// grounding the pink panel: bottom lands on the frame edge, x/width untouched
var grounded = place.flushRect({ x: 100, y: 200, w: 200, h: 400, stretch: false },
  { flush: { b: true } }, 860, 720);
near("grounded bottom sits on the frame", grounded.y + grounded.h, 720);
near("grounded x is untouched", grounded.x, 100);
near("grounded width is untouched", grounded.w, 200);

var leftGrounded = place.flushRect({ x: 100, y: 200, w: 200, h: 400, stretch: false },
  { flush: { l: true, b: true } }, 860, 720);
near("left flush hits x=0", leftGrounded.x, 0);
near("left flush keeps width", leftGrounded.w, 200);

// opposite edges span the frame only when stretching is allowed
var spanned = place.flushRect({ x: 100, y: 200, w: 200, h: 400, stretch: true },
  { flush: { l: true, r: true } }, 860, 720);
near("stretch spans the full width", spanned.w, 860);
near("stretch span starts at 0", spanned.x, 0);
var notSpanned = place.flushRect({ x: 100, y: 200, w: 200, h: 400, stretch: false },
  { flush: { l: true, r: true } }, 860, 720);
near("aspect-locked span keeps its width", notSpanned.w, 200);

check("no flush leaves the rect alone",
  place.flushRect({ x: 5, y: 6, w: 7, h: 8, stretch: false }, {}, 100, 100),
  { x: 5, y: 6, w: 7, h: 8, stretch: false });

// keep-clear: an orange panel overlapping a top-right logo gives way, always
// along whichever axis costs it the least room.
var logo = { x: 700, y: 20, w: 100, h: 80 };

// only the right edge is caught, so it pulls in horizontally
var sideways = place.pushClear({ x: 400, y: 0, w: 380, h: 300, stretch: true }, logo, 10);
near("panel stops short of the logo", sideways.x + sideways.w, logo.x - 10);
near("panel keeps its left edge", sideways.x, 400);
near("panel keeps its height", sideways.h, 300);

// a panel running the whole width can only escape downwards
var below = place.pushClear({ x: 400, y: 60, w: 800, h: 300, stretch: true }, logo, 10);
near("panel drops below the logo", below.y, logo.y + logo.h + 10);
near("panel keeps its width", below.w, 800);

// an aspect-locked element shrinks uniformly instead of distorting
var locked = place.pushClear({ x: 400, y: 60, w: 400, h: 200, stretch: false }, logo, 10);
near("aspect is preserved after clearing", locked.w / locked.h, 2);

// a bigger gap pushes the element further away
var tight = place.pushClear({ x: 400, y: 0, w: 380, h: 300, stretch: true }, logo, 10);
var roomy = place.pushClear({ x: 400, y: 0, w: 380, h: 300, stretch: true }, logo, 60);
near("a 10px gap stops 10px short", tight.x + tight.w, logo.x - 10);
near("a 60px gap stops 60px short", roomy.x + roomy.w, logo.x - 60);

// a gap alone can force a retreat even when the rects do not actually touch
var touching = place.pushClear({ x: 400, y: 0, w: 300, h: 300, stretch: true }, logo, 40);
near("a gap separates rects that were merely adjacent", touching.x + touching.w, logo.x - 40);

// already-clear rects come back untouched
check("disjoint rects are left alone",
  place.pushClear({ x: 0, y: 0, w: 100, h: 100, stretch: true }, { x: 500, y: 500, w: 50, h: 50 }, 10),
  { x: 0, y: 0, w: 100, h: 100, stretch: true });

// --- animated layers: the parent-null mapping ---------------------------

function prop(o) {
  return { numKeys: o.numKeys || 0, expressionEnabled: !!o.expressionEnabled, expression: o.expression || "" };
}
check("a plain property is static", anim.propIsAnimated(prop({})), false);
check("keyframes count as animated", anim.propIsAnimated(prop({ numKeys: 2 })), true);
check("an enabled expression counts as animated",
  anim.propIsAnimated(prop({ expressionEnabled: true, expression: "wiggle(2,10)" })), true);
check("a disabled expression does not",
  anim.propIsAnimated(prop({ expressionEnabled: false, expression: "wiggle(2,10)" })), false);
check("an empty expression does not",
  anim.propIsAnimated(prop({ expressionEnabled: true, expression: "" })), false);
check("a missing property is not animated", anim.propIsAnimated(null), false);

// the map has to carry the master box exactly onto the target rect, because
// that is what makes the null placement agree with the direct placement
function mapsBoxOnto(label, mf, r, mW, mH) {
  var m = anim.adaptMapping(mf, r, mW, mH);
  near(label + " maps the left edge", m.sx * (mf.x0 * mW) + m.tx, r.x);
  near(label + " maps the top edge", m.sy * (mf.y0 * mH) + m.ty, r.y);
  near(label + " maps the right edge", m.sx * ((mf.x0 + mf.wF) * mW) + m.tx, r.x + r.w);
  near(label + " maps the bottom edge", m.sy * ((mf.y0 + mf.hF) * mH) + m.ty, r.y + r.h);
}

// the pink panel, master 1920x1080, adapted onto each real screen
var pinkFrac = { x0: 0.09, y0: 0.2, wF: 0.24, hF: 0.65 };
[[1536, 576], [1440, 1008], [860, 720]].forEach(function (s) {
  var tw = s[0], th = s[1];
  var box = { x: pinkFrac.x0 * tw, y: pinkFrac.y0 * th, w: pinkFrac.wF * tw, h: pinkFrac.hF * th, stretch: true };
  mapsBoxOnto("pink at " + tw + "x" + th, pinkFrac, box, 1920, 1080);
});

// same frame and same box means the null must be a no-op
var same = anim.adaptMapping(pinkFrac,
  { x: pinkFrac.x0 * 1920, y: pinkFrac.y0 * 1080, w: pinkFrac.wF * 1920, h: pinkFrac.hF * 1080 }, 1920, 1080);
near("identity scale x", same.sx, 1);
near("identity scale y", same.sy, 1);
near("identity offset x", same.tx, 0);
near("identity offset y", same.ty, 0);

// a grounded rect and a cover rect are both just rects, so both must map too
mapsBoxOnto("a grounded box", pinkFrac, { x: 0, y: 720 - 400, w: 200, h: 400 }, 1920, 1080);
mapsBoxOnto("an oversized cover box", pinkFrac, { x: -120, y: -80, w: 2000, h: 900 }, 1920, 1080);

// the null path and the direct path have to agree on the final geometry
var srcRect = { left: -200, top: -150, width: 400, height: 300 };
var mfDirect = geo.masterFractions(
  fakeLayer(srcRect, [500, 400], [0, 0], [100, 100]), 1920, 1080, 0);
var targetBox = { x: 300, y: 120, w: 220, h: 165 };
var md = anim.adaptMapping(mfDirect, targetBox, 1920, 1080);
near("null path agrees with direct scale", md.sx * 100, (targetBox.w / srcRect.width) * 100);
near("null path lands the box where direct placement would",
  md.sx * (mfDirect.x0 * 1920) + md.tx, targetBox.x);

check("an unreadable master box yields no mapping",
  anim.adaptMapping({ x0: 0, y0: 0, wF: 0, hF: 0.5 }, { x: 0, y: 0, w: 10, h: 10 }, 1920, 1080), null);

// --- output comp naming -------------------------------------------------
var dooh = { name: "DOOH Pillar", w: 480, h: 2560, duration: 10 };
var mall = { name: "360 Mall Atrium", w: 1536, h: 576, duration: 15 };

check("full pattern",
  g.outputCompName("ACME", dooh, 10, "v2", false), "ACME_DOOH Pillar_10s_v2");
check("blank prefix drops out",
  g.outputCompName("", dooh, 10, "v2", false), "DOOH Pillar_10s_v2");
check("blank suffix drops out",
  g.outputCompName("ACME", dooh, 10, "", false), "ACME_DOOH Pillar_10s");
check("blank prefix and suffix leave name and duration",
  g.outputCompName("", dooh, 10, "", false), "DOOH Pillar_10s");
check("whitespace-only parts drop out",
  g.outputCompName("   ", dooh, 10, "  ", false), "DOOH Pillar_10s");
check("prefix and suffix are trimmed",
  g.outputCompName("  ACME  ", dooh, 10, "  v2  ", false), "ACME_DOOH Pillar_10s_v2");
check("pixel size can stand in for the name",
  g.outputCompName("ACME", dooh, 10, "v2", true), "ACME_480x2560_10s_v2");
check("a 15s mall screen",
  g.outputCompName("ACME", mall, 15, "v2", true), "ACME_1536x576_15s_v2");
check("tags never leak into an output name",
  g.outputCompName("", { name: "Lobby @bg", w: 100, h: 100 }, 10, "", false), "Lobby_10s");
check("a nameless screen still produces something",
  g.outputCompName("", { name: "", w: 100, h: 100 }, 0, "", false), "ScreenAdapter");

// --- where the duration comes from --------------------------------------
var noDur = { name: "Lobby", w: 100, h: 100 };
check("the size list wins when it names a duration",
  g.screenDuration(dooh, 12.5, false), 10);
check("the master fills in for a screen with no duration",
  g.screenDuration(noDur, 12.5, false), 12.5);
check("forcing the master overrides the size list",
  g.screenDuration(dooh, 12.5, true), 12.5);
check("forcing the master also covers screens with no duration",
  g.screenDuration(noDur, 12.5, true), 12.5);
check("a zero duration in the list is ignored",
  g.screenDuration({ w: 1, h: 1, duration: 0 }, 12.5, false), 12.5);
check("the two modes differ where it matters",
  g.screenDuration(mall, 12.5, false) !== g.screenDuration(mall, 12.5, true), true);
check("the toggle reaches the name",
  g.outputCompName("", dooh, g.screenDuration(dooh, 12.5, true), "", false), "DOOH Pillar_12.5s");

check("whole seconds have no decimal point", g.formatDurationLabel(10), "10s");
check("fractional seconds are kept", g.formatDurationLabel(7.5), "7.5s");
check("float noise is rounded away", g.formatDurationLabel(15.000000001), "15s");
check("a master duration is rendered sensibly", g.formatDurationLabel(12.52), "12.52s");

// --- loading a custom size list -----------------------------------------

var loaded = cfg.normalizeScreens([
  { name: "DOOH Pillar", w: 480, h: 2560, duration: 10 },
  { w: 1536, h: 576 },
  { name: "broken", w: 0, h: 100 },
  { name: "also broken" }
]);
check("usable entries are kept", loaded.screens.length, 2);
check("unusable entries are counted", loaded.skipped, 2);
check("duration is carried through", loaded.screens[0].duration, 10);
check("a missing name falls back to the pixel size", loaded.screens[1].name, "1536x576");
check("a missing duration is null", loaded.screens[1].duration, null);
check("entries default to selected", loaded.screens[1].selected, true);
check("an explicit false is respected",
  cfg.normalizeScreens([{ w: 10, h: 10, selected: false }]).screens[0].selected, false);
check("string dimensions are accepted",
  cfg.normalizeScreens([{ w: "1080", h: "1920" }]).screens[0].w, 1080);
check("an empty list yields nothing", cfg.normalizeScreens([]), null);
check("a null payload yields nothing", cfg.normalizeScreens(null), null);
check("an all-garbage list yields nothing", cfg.normalizeScreens([{ foo: 1 }, { w: -5, h: 3 }]), null);

// a loaded list must survive a save/reload round trip, duration included
var round = cfg.normalizeScreens(JSON.parse(cfg.jsonStringify(loaded.screens)));
check("round trip keeps the count", round.screens.length, 2);
check("round trip keeps the duration", round.screens[0].duration, 10);
check("round trip keeps the name", round.screens[0].name, "DOOH Pillar");
check("round trip omits an absent duration", round.screens[1].duration, null);

// --- fuzzy screen search -------------------------------------------------
var marina = { name: "Marina 1", w: 3600, h: 864 };
var dayarti = { name: "Dayarti 3 950 x 600", w: 950, h: 600 };
check("substring search matches marina", fuzzy.screenMatchesFilter(marina, "marina"), true);
check("fuzzy typo avnues matches avenues digital",
  fuzzy.screenMatchesFilter({ name: "Aveneus Digital", w: 1080, h: 1920 }, "avenues"), true);
check("dimension search matches", fuzzy.screenMatchesFilter(dayarti, "950x600"), true);
check("unrelated search misses", fuzzy.screenMatchesFilter(marina, "warehouse"), false);
check("blank search matches everything", fuzzy.screenMatchesFilter(marina, ""), true);

if (failures.length) {
  console.log(failures.length + " of " + ran + " checks FAILED\n");
  failures.forEach(function (f) { console.log("  " + f); });
  process.exit(1);
}
console.log(ran + " checks passed");

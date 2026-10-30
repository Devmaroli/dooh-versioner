var Adapt = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // engine/adapt.ts
  var adapt_exports = {};
  __export(adapt_exports, {
    AUDIT: () => AUDIT,
    AUDIT_CRITERIA: () => AUDIT_CRITERIA,
    BG_EXTEND_ORDER: () => BG_EXTEND_ORDER,
    CLASS_MAP: () => CLASS_MAP,
    DEFAULTS: () => DEFAULTS,
    DEFAULT_PRODUCT_GAP: () => DEFAULT_PRODUCT_GAP,
    ELEMENT_RANK: () => ELEMENT_RANK,
    JEV: () => JEV,
    JEV_TASKS: () => JEV_TASKS,
    KASHIDA_CLASSES: () => KASHIDA_CLASSES,
    KASHIDA_MAX_PER_WORD: () => KASHIDA_MAX_PER_WORD,
    NEVER_MIRROR: () => NEVER_MIRROR,
    PASTE_SELECTION_ALIASES: () => PASTE_SELECTION_ALIASES,
    REF_ZONES: () => REF_ZONES,
    ROLE_DEFAULT_ADAPT: () => ROLE_DEFAULT_ADAPT,
    RUBRIC_WEIGHTS: () => RUBRIC_WEIGHTS,
    SCREEN_FAMILIES: () => SCREEN_FAMILIES,
    SPACING: () => SPACING,
    TATWEEL: () => TATWEEL,
    TEMPLATES: () => TEMPLATES,
    ZONE_SIDE_NAMES: () => ZONE_SIDE_NAMES,
    adaptMapping: () => adaptMapping,
    allowsOverlap: () => allowsOverlap,
    analyseArtwork: () => analyseArtwork,
    anchorInRect: () => anchorInRect,
    anchorTopLeft: () => anchorTopLeft,
    applyArtRules: () => applyArtRules,
    applyKashida: () => applyKashida,
    arabicJoining: () => arabicJoining,
    auditCSV: () => auditCSV,
    auditCampaign: () => auditCampaign,
    auditTile: () => auditTile,
    autoTag: () => autoTag,
    avoidRect: () => avoidRect,
    balancedBreak: () => balancedBreak,
    basisShiftComp: () => basisShiftComp,
    bgExtendPlan: () => bgExtendPlan,
    buildOrientMap: () => buildOrientMap,
    buildTaggedName: () => buildTaggedName,
    chunkToBox: () => chunkToBox,
    clampRoleScale: () => clampRoleScale,
    clearGapPx: () => clearGapPx,
    compose: () => compose,
    composeFaces: () => composeFaces,
    contentLadder: () => contentLadder,
    coverage: () => coverage,
    ctaButton: () => ctaButton,
    defaultFitAxisForZone: () => defaultFitAxisForZone,
    describeTag: () => describeTag,
    designScore: () => designScore,
    detectMasterLang: () => detectMasterLang,
    effectCraftComps: () => effectCraftComps,
    effectiveAdapt: () => effectiveAdapt,
    encodeCraftJob: () => encodeCraftJob,
    findPastedPresetIndexes: () => findPastedPresetIndexes,
    flushRect: () => flushRect,
    forkNameFor: () => forkNameFor,
    formatDurationLabel: () => formatDurationLabel,
    formatRoiSkipReason: () => formatRoiSkipReason,
    fromAgPsd: () => fromAgPsd,
    fromPcraftManifest: () => fromPcraftManifest,
    fromPdfText: () => fromPdfText,
    fromSVG: () => fromSVG,
    fuzzyMatchScore: () => fuzzyMatchScore,
    importCombiners: () => importCombiners,
    importScreenList: () => importScreenList,
    inkRect: () => inkRect,
    intakeChecks: () => intakeChecks,
    jevRequest: () => jevRequest,
    kashidaAllowed: () => kashidaAllowed,
    kashidaFit: () => kashidaFit,
    kashidaPicks: () => kashidaPicks,
    keepClear: () => keepClear,
    langFromFilename: () => langFromFilename,
    layoutScreen: () => layoutScreen,
    leadingFor: () => leadingFor,
    libClass: () => libClass,
    libConformance: () => libConformance,
    lookupLayout: () => lookupLayout,
    mapRoles: () => mapRoles,
    masterFractions: () => masterFractions,
    matchPastedScreens: () => matchPastedScreens,
    mergePresets: () => mergePresets,
    mirrorAnchor: () => mirrorAnchor,
    normalizeScreenName: () => normalizeScreenName,
    normalizeScreens: () => normalizeScreens,
    oppositeSide: () => oppositeSide,
    outputCompName: () => outputCompName,
    pairFonts: () => pairFonts,
    parsePastedScreenNames: () => parsePastedScreenNames,
    parseTag: () => parseTag,
    pickMaster: () => pickMaster,
    pickMasterForLang: () => pickMasterForLang,
    pinnedScale: () => pinnedScale,
    placementAfterRoiCrop: () => placementAfterRoiCrop,
    priceBlock: () => priceBlock,
    propIsAnimated: () => propIsAnimated,
    pushClear: () => pushClear,
    qaScore: () => qaScore,
    rectGap: () => rectGap,
    refZoneRects: () => refZoneRects,
    resolveClearance: () => resolveClearance,
    resolveComplement: () => resolveComplement,
    rewriteCompRefs: () => rewriteCompRefs,
    rgbHex: () => rgbHex,
    rotScaleOffset: () => rotScaleOffset,
    routeDecision: () => routeDecision,
    saliencyCrop: () => saliencyCrop,
    screenDuration: () => screenDuration,
    screenFamily: () => screenFamily,
    screenMatchesFilter: () => screenMatchesFilter,
    scrimAlpha: () => scrimAlpha,
    sourceDeltaToCompDelta: () => sourceDeltaToCompDelta,
    spacingTable: () => spacingTable,
    spacingU: () => spacingU,
    splitRect: () => splitRect,
    stripPastedListMarker: () => stripPastedListMarker,
    stripTags: () => stripTags,
    targetOrient: () => targetOrient,
    targetRect: () => targetRect,
    trim: () => trim,
    validRoi: () => validRoi,
    vectorcraftRoute: () => vectorcraftRoute,
    viewingSize: () => viewingSize,
    wantedClass: () => wantedClass,
    zoneConformance: () => zoneConformance
  });

  // engine/layout-lib.ts
  var LAYOUT_LIB = [{ "name": "1.7HD", "group": "DOOH", "w": 1920, "h": 1080, "cls": "Wide", "marginPx": 80, "ribbon": false, "zones": { "logo": [0.0417, 0.0741, 0.25, 0.2278], "headline": [0.0417, 0.2778, 0.4583, 0.6185], "cta": [0.0417, 0.7037, 0.4583, 0.9259], "product": [0.5, 0.0741, 0.9583, 0.9259] }, "sameAs": null }, { "name": "1st Ring Road", "group": "DOOH", "w": 1008, "h": 5184, "cls": "Tall", "marginPx": 76, "ribbon": false, "zones": { "logo": [0.0754, 0.0189, 0.3294, 0.049], "teaser": [0.0754, 0.0559, 0.9246, 0.0791], "headline": [0.0754, 0.2631, 0.9246, 0.4018], "product": [0.0754, 0.4059, 0.9246, 0.6549], "offer": [0.0754, 0.659, 0.9246, 0.7319], "cta": [0.0754, 0.7411, 0.9246, 0.863], "legal": [0.0754, 0.9001, 0.9246, 0.9761] }, "sameAs": null }, { "name": "2.6 Screen", "group": "DOOH", "w": 1536, "h": 576, "cls": "Wide", "marginPx": 44, "ribbon": false, "zones": { "logo": [0.0286, 0.0764, 0.2435, 0.2292], "headline": [0.0286, 0.2812, 0.4622, 0.6181], "cta": [0.0286, 0.7049, 0.4622, 0.9236], "product": [0.5013, 0.0764, 0.9714, 0.9236] }, "sameAs": null }, { "name": "Al Hamra Mall - Indoor Screen", "group": "DOOH", "w": 640, "h": 896, "cls": "Portrait", "marginPx": 48, "ribbon": false, "zones": { "logo": [0.075, 0.0536, 0.3312, 0.1161], "headline": [0.075, 0.1429, 0.925, 0.3181], "product": [0.075, 0.3326, 0.925, 0.6395], "offer": [0.075, 0.654, 0.925, 0.7143], "cta": [0.075, 0.7411, 0.925, 0.8571], "legal": [0.075, 0.8839, 0.925, 0.9464] }, "sameAs": null }, { "name": "Al Hamra Mall - Outdoor Screen", "group": "DOOH", "w": 1840, "h": 1740, "cls": "Square", "marginPx": 130, "ribbon": false, "zones": { "logo": [0.0707, 0.0747, 0.2935, 0.177], "headline": [0.0707, 0.2023, 0.9293, 0.3879], "product": [0.0707, 0.408, 0.9293, 0.7126], "cta": [0.0707, 0.7471, 0.9293, 0.8638], "legal": [0.0707, 0.8839, 0.9293, 0.9253] }, "sameAs": null }, { "name": "Al Mansouriya", "group": "DOOH", "w": 3024, "h": 1152, "cls": "Wide", "marginPx": 86, "ribbon": false, "zones": { "logo": [0.0284, 0.0747, 0.2434, 0.2274], "headline": [0.0284, 0.2795, 0.4597, 0.6198], "cta": [0.0284, 0.7049, 0.4597, 0.9253], "product": [0.4993, 0.0747, 0.9716, 0.9253] }, "sameAs": null }, { "name": "Al Meera Mall-Left Side", "group": "DOOH", "w": 2160, "h": 1008, "cls": "Wide", "marginPx": 76, "ribbon": false, "zones": { "logo": [0.0352, 0.0754, 0.2481, 0.2282], "headline": [0.0352, 0.2798, 0.4583, 0.619], "cta": [0.0352, 0.7044, 0.4583, 0.9246], "product": [0.5, 0.0754, 0.9648, 0.9246] }, "sameAs": null }, { "name": "Al Meera Mall-Right Side", "group": "DOOH", "w": 1440, "h": 1008, "cls": "Wide", "marginPx": 76, "ribbon": false, "zones": { "logo": [0.0528, 0.0754, 0.2542, 0.2282], "headline": [0.0528, 0.2798, 0.4583, 0.619], "cta": [0.0528, 0.7044, 0.4583, 0.9246], "product": [0.5, 0.0754, 0.9472, 0.9246] }, "sameAs": null }, { "name": "Al Nassar Tower", "group": "DOOH", "w": 2688, "h": 1152, "cls": "Wide", "marginPx": 86, "ribbon": false, "zones": { "logo": [0.032, 0.0747, 0.2478, 0.2274], "headline": [0.032, 0.2795, 0.4613, 0.6198], "cta": [0.032, 0.7049, 0.4613, 0.9253], "product": [0.4985, 0.0747, 0.968, 0.9253] }, "sameAs": null }, { "name": "Al Nassar Tower Vertical", "group": "DOOH", "w": 960, "h": 5328, "cls": "Tall", "marginPx": 72, "ribbon": false, "zones": { "logo": [0.075, 0.0191, 0.3292, 0.0492], "teaser": [0.075, 0.0559, 0.925, 0.0788], "headline": [0.075, 0.2631, 0.925, 0.402], "product": [0.075, 0.4058, 0.925, 0.655], "offer": [0.075, 0.6588, 0.925, 0.732], "cta": [0.075, 0.741, 0.925, 0.863], "legal": [0.075, 0.9002, 0.925, 0.976] }, "sameAs": null }, { "name": "Al Salam Mall", "group": "DOOH", "w": 7680, "h": 1152, "cls": "Ribbon", "marginPx": 92, "ribbon": true, "zones": { "logo": [0.012, 0, 0.1003, 1], "headline": [0.1302, 0, 0.5495, 1], "product": [0.5703, 0, 0.8294, 1], "cta": [0.8503, 0, 0.988, 1] }, "sameAs": null }, { "name": "Al Salam Sync", "group": "DOOH", "w": 1536, "h": 576, "cls": "Wide", "marginPx": 44, "ribbon": false, "zones": { "logo": [0.0286, 0.0764, 0.2435, 0.2292], "headline": [0.0286, 0.2812, 0.4622, 0.6181], "cta": [0.0286, 0.7049, 0.4622, 0.9236], "product": [0.5013, 0.0764, 0.9714, 0.9236] }, "sameAs": "2.6 Screen" }, { "name": "Al Zawya - Screen 1 (center)", "group": "DOOH", "w": 860, "h": 720, "cls": "Square", "marginPx": 54, "ribbon": false, "zones": { "logo": [0.0628, 0.075, 0.2907, 0.1778], "headline": [0.0628, 0.2028, 0.9372, 0.3861], "product": [0.0628, 0.4069, 0.9372, 0.7111], "cta": [0.0628, 0.7472, 0.9372, 0.8639], "legal": [0.0628, 0.8847, 0.9372, 0.925] }, "sameAs": null }, { "name": "Al Zawya - Screen 2 (right side)", "group": "DOOH", "w": 1040, "h": 720, "cls": "Wide", "marginPx": 54, "ribbon": false, "zones": { "logo": [0.0519, 0.075, 0.2538, 0.2278], "headline": [0.0519, 0.2778, 0.4615, 0.6194], "cta": [0.0519, 0.7028, 0.4615, 0.925], "product": [0.5, 0.075, 0.9481, 0.925] }, "sameAs": null }, { "name": "Aqarat", "group": "DOOH", "w": 672, "h": 1836, "cls": "Tall", "marginPx": 50, "ribbon": false, "zones": { "logo": [0.0744, 0.0185, 0.3304, 0.0485], "teaser": [0.0744, 0.0561, 0.9256, 0.0795], "headline": [0.0744, 0.2625, 0.9256, 0.4003], "product": [0.0744, 0.408, 0.9256, 0.6531], "offer": [0.0744, 0.6607, 0.9256, 0.732], "cta": [0.0744, 0.7407, 0.9256, 0.8627], "legal": [0.0744, 0.8998, 0.9256, 0.976] }, "sameAs": null }, { "name": "Assima G & M Floors", "group": "DOOH", "w": 2304, "h": 1152, "cls": "Wide", "marginPx": 86, "ribbon": false, "zones": { "logo": [0.0373, 0.0747, 0.25, 0.2274], "headline": [0.0373, 0.2795, 0.4601, 0.6198], "cta": [0.0373, 0.7049, 0.4601, 0.9253], "product": [0.4991, 0.0747, 0.9627, 0.9253] }, "sameAs": null }, { "name": "Assima L1 & L2", "group": "DOOH", "w": 1920, "h": 1152, "cls": "Wide", "marginPx": 86, "ribbon": false, "zones": { "logo": [0.0448, 0.0747, 0.2531, 0.2274], "headline": [0.0448, 0.2795, 0.4583, 0.6198], "cta": [0.0448, 0.7049, 0.4583, 0.9253], "product": [0.5, 0.0747, 0.9552, 0.9253] }, "sameAs": null }, { "name": "Avenues Gate Left Side", "group": "DOOH", "w": 1440, "h": 864, "cls": "Wide", "marginPx": 64, "ribbon": false, "zones": { "logo": [0.0444, 0.0741, 0.2528, 0.2269], "headline": [0.0444, 0.2778, 0.4583, 0.6204], "cta": [0.0444, 0.7037, 0.4583, 0.9259], "product": [0.5, 0.0741, 0.9556, 0.9259] }, "sameAs": null }, { "name": "Avenues Gate Right Side", "group": "DOOH", "w": 6048, "h": 864, "cls": "Ribbon", "marginPx": 70, "ribbon": true, "zones": { "logo": [0.0116, 0, 0.0992, 1], "headline": [0.1306, 0, 0.5506, 1], "product": [0.5704, 0, 0.83, 1], "cta": [0.8499, 0, 0.9884, 1] }, "sameAs": null }, { "name": "Baitak", "group": "DOOH", "w": 2624, "h": 608, "cls": "Wide", "marginPx": 46, "ribbon": false, "zones": { "logo": [0.0175, 0.0757, 0.2576, 0.227], "headline": [0.0175, 0.2796, 0.4992, 0.6184], "cta": [0.0175, 0.7039, 0.4992, 0.9243], "product": [0.5412, 0.0757, 0.9825, 0.9243] }, "sameAs": null }, { "name": "Blajat-Left Side", "group": "DOOH", "w": 2448, "h": 864, "cls": "Wide", "marginPx": 64, "ribbon": false, "zones": { "logo": [0.0261, 0.0741, 0.2426, 0.2269], "headline": [0.0261, 0.2778, 0.4616, 0.6204], "cta": [0.0261, 0.7037, 0.4616, 0.9259], "product": [0.4984, 0.0741, 0.9739, 0.9259] }, "sameAs": null }, { "name": "Blajat-Right Side", "group": "DOOH", "w": 1152, "h": 864, "cls": "Wide", "marginPx": 64, "ribbon": false, "zones": { "logo": [0.0556, 0.0741, 0.2552, 0.2269], "headline": [0.0556, 0.2778, 0.4601, 0.6204], "cta": [0.0556, 0.7037, 0.4601, 0.9259], "product": [0.5035, 0.0741, 0.9444, 0.9259] }, "sameAs": null }, { "name": "Boulevard Bridge", "group": "DOOH", "w": 3584, "h": 384, "cls": "Ribbon", "marginPx": 30, "ribbon": true, "zones": { "logo": [84e-4, 0, 0.1004, 1], "headline": [0.1311, 0, 0.5497, 1], "product": [0.5692, 0, 0.8287, 1], "cta": [0.851, 0, 0.9916, 1] }, "sameAs": null }, { "name": "Boulevard Wall", "group": "DOOH", "w": 1280, "h": 1600, "cls": "Portrait", "marginPx": 96, "ribbon": false, "zones": { "logo": [0.075, 0.06, 0.3297, 0.1212], "headline": [0.075, 0.1475, 0.925, 0.32], "product": [0.075, 0.3362, 0.925, 0.6375], "offer": [0.075, 0.6538, 0.925, 0.7113], "cta": [0.075, 0.7375, 0.925, 0.8525], "legal": [0.075, 0.8788, 0.925, 0.94] }, "sameAs": null }, { "name": "Boursa (big)", "group": "DOOH", "w": 2400, "h": 720, "cls": "Wide", "marginPx": 54, "ribbon": false, "zones": { "logo": [0.0225, 0.075, 0.26, 0.2278], "headline": [0.0225, 0.2778, 0.5, 0.6194], "cta": [0.0225, 0.7028, 0.5, 0.925], "product": [0.5417, 0.075, 0.9775, 0.925] }, "sameAs": null }, { "name": "Boursa (small)", "group": "DOOH", "w": 1440, "h": 720, "cls": "Wide", "marginPx": 54, "ribbon": false, "zones": { "logo": [0.0375, 0.075, 0.2458, 0.2278], "headline": [0.0375, 0.2778, 0.4583, 0.6194], "cta": [0.0375, 0.7028, 0.4583, 0.925], "product": [0.5, 0.075, 0.9625, 0.925] }, "sameAs": null }, { "name": "Derwaza", "group": "DOOH", "w": 864, "h": 2880, "cls": "Tall", "marginPx": 64, "ribbon": false, "zones": { "logo": [0.0741, 0.0187, 0.3287, 0.0493], "teaser": [0.0741, 0.0563, 0.9259, 0.0792], "headline": [0.0741, 0.2632, 0.9259, 0.401], "product": [0.0741, 0.4073, 0.9259, 0.6538], "offer": [0.0741, 0.6601, 0.9259, 0.7319], "cta": [0.0741, 0.741, 0.9259, 0.8632], "legal": [0.0741, 0.9, 0.9259, 0.9757] }, "sameAs": null }, { "name": "Downtown", "group": "DOOH", "w": 2160, "h": 1440, "cls": "Wide", "marginPx": 108, "ribbon": false, "zones": { "logo": [0.05, 0.075, 0.2537, 0.2278], "headline": [0.05, 0.2792, 0.4583, 0.6194], "cta": [0.05, 0.7042, 0.4583, 0.925], "product": [0.5, 0.075, 0.95, 0.925] }, "sameAs": null }, { "name": "Farwaniya Rotunda", "group": "DOOH", "w": 2736, "h": 1008, "cls": "Wide", "marginPx": 76, "ribbon": false, "zones": { "logo": [0.0278, 0.0754, 0.2434, 0.2282], "headline": [0.0278, 0.2798, 0.4605, 0.619], "cta": [0.0278, 0.7044, 0.4605, 0.9246], "product": [0.5007, 0.0754, 0.9722, 0.9246] }, "sameAs": null }, { "name": "Gate Digital", "group": "DOOH", "w": 1080, "h": 1920, "cls": "Portrait", "marginPx": 80, "ribbon": false, "zones": { "logo": [0.0741, 0.0417, 0.3296, 0.1062], "headline": [0.0741, 0.1333, 0.9259, 0.3156], "product": [0.0741, 0.3271, 0.9259, 0.6458], "offer": [0.0741, 0.6573, 0.9259, 0.7198], "cta": [0.0741, 0.7479, 0.9259, 0.8667], "legal": [0.0741, 0.8938, 0.9259, 0.9583] }, "sameAs": null }, { "name": "Hawally Gate", "group": "DOOH", "w": 5832, "h": 432, "cls": "Ribbon", "marginPx": 34, "ribbon": true, "zones": { "logo": [58e-4, 0, 0.0995, 1], "headline": [0.1303, 0, 0.5504, 1], "product": [0.5693, 0, 0.8299, 1], "cta": [0.8505, 0, 0.9942, 1] }, "sameAs": null }, { "name": "Khalijiya", "group": "DOOH", "w": 2304, "h": 1008, "cls": "Wide", "marginPx": 76, "ribbon": false, "zones": { "logo": [0.033, 0.0754, 0.2457, 0.2282], "headline": [0.033, 0.2798, 0.4601, 0.619], "cta": [0.033, 0.7044, 0.4601, 0.9246], "product": [0.4991, 0.0754, 0.967, 0.9246] }, "sameAs": null }, { "name": "Kuwait Gate", "group": "DOOH", "w": 4460, "h": 378, "cls": "Ribbon", "marginPx": 30, "ribbon": true, "zones": { "logo": [67e-4, 0, 0.1009, 1], "headline": [0.13, 0, 0.5493, 1], "product": [0.5695, 0, 0.8296, 1], "cta": [0.8498, 0, 0.9933, 1] }, "sameAs": null }, { "name": "Marina 1", "group": "DOOH", "w": 3600, "h": 864, "cls": "Wide", "marginPx": 64, "ribbon": false, "zones": { "logo": [0.0178, 0.0741, 0.2594, 0.2269], "headline": [0.0178, 0.2778, 0.5, 0.6204], "cta": [0.0178, 0.7037, 0.5, 0.9259], "product": [0.5389, 0.0741, 0.9822, 0.9259] }, "sameAs": null }, { "name": "Marina 2", "group": "DOOH", "w": 3168, "h": 864, "cls": "Wide", "marginPx": 64, "ribbon": false, "zones": { "logo": [0.0202, 0.0741, 0.2601, 0.2269], "headline": [0.0202, 0.2778, 0.4987, 0.6204], "cta": [0.0202, 0.7037, 0.4987, 0.9259], "product": [0.5398, 0.0741, 0.9798, 0.9259] }, "sameAs": null }, { "name": "Mayar", "group": "DOOH", "w": 2448, "h": 864, "cls": "Wide", "marginPx": 64, "ribbon": false, "zones": { "logo": [0.0261, 0.0741, 0.2426, 0.2269], "headline": [0.0261, 0.2778, 0.4616, 0.6204], "cta": [0.0261, 0.7037, 0.4616, 0.9259], "product": [0.4984, 0.0741, 0.9739, 0.9259] }, "sameAs": "Blajat-Left Side" }, { "name": "Mubarak Al Kabeer Gate", "group": "DOOH", "w": 5328, "h": 864, "cls": "Ribbon", "marginPx": 70, "ribbon": true, "zones": { "logo": [0.0131, 0, 0.0995, 1], "headline": [0.1295, 0, 0.5499, 1], "product": [0.5706, 0, 0.8296, 1], "cta": [0.8502, 0, 0.9869, 1] }, "sameAs": null }, { "name": "Mubarakiya Gate", "group": "DOOH", "w": 4200, "h": 720, "cls": "Ribbon", "marginPx": 58, "ribbon": true, "zones": { "logo": [0.0138, 0, 0.1, 1], "headline": [0.131, 0, 0.55, 1], "product": [0.569, 0, 0.831, 1], "cta": [0.85, 0, 0.9862, 1] }, "sameAs": null }, { "name": "Murouj-Wall Screens", "group": "DOOH", "w": 1680, "h": 480, "cls": "Wide", "marginPx": 36, "ribbon": false, "zones": { "logo": [0.0214, 0.075, 0.2595, 0.2292], "headline": [0.0214, 0.2792, 0.5, 0.6208], "cta": [0.0214, 0.7042, 0.5, 0.925], "product": [0.5417, 0.075, 0.9786, 0.925] }, "sameAs": null }, { "name": "Piccadilly", "group": "DOOH", "w": 2027, "h": 720, "cls": "Wide", "marginPx": 54, "ribbon": false, "zones": { "logo": [0.0266, 0.075, 0.2437, 0.2278], "headline": [0.0266, 0.2778, 0.4588, 0.6194], "cta": [0.0266, 0.7028, 0.4588, 0.925], "product": [0.4983, 0.075, 0.9734, 0.925] }, "sameAs": null }, { "name": "Platinum Square", "group": "DOOH", "w": 1440, "h": 1008, "cls": "Wide", "marginPx": 76, "ribbon": false, "zones": { "logo": [0.0528, 0.0754, 0.2542, 0.2282], "headline": [0.0528, 0.2798, 0.4583, 0.619], "cta": [0.0528, 0.7044, 0.4583, 0.9246], "product": [0.5, 0.0754, 0.9472, 0.9246] }, "sameAs": "Al Meera Mall-Right Side" }, { "name": "Slayel and Yaal", "group": "DOOH", "w": 1080, "h": 1920, "cls": "Portrait", "marginPx": 80, "ribbon": false, "zones": { "logo": [0.0741, 0.0417, 0.3296, 0.1062], "headline": [0.0741, 0.1333, 0.9259, 0.3156], "product": [0.0741, 0.3271, 0.9259, 0.6458], "offer": [0.0741, 0.6573, 0.9259, 0.7198], "cta": [0.0741, 0.7479, 0.9259, 0.8667], "legal": [0.0741, 0.8938, 0.9259, 0.9583] }, "sameAs": "Gate Digital" }, { "name": "The Capital Hub - Side 1", "group": "DOOH", "w": 1440, "h": 630, "cls": "Wide", "marginPx": 48, "ribbon": false, "zones": { "logo": [0.0333, 0.0762, 0.2486, 0.2286], "headline": [0.0333, 0.2794, 0.4583, 0.619], "cta": [0.0333, 0.7048, 0.4583, 0.9238], "product": [0.5, 0.0762, 0.9667, 0.9238] }, "sameAs": null }, { "name": "The Gate Mall Outdoor", "group": "DOOH", "w": 948, "h": 648, "cls": "Wide", "marginPx": 48, "ribbon": false, "zones": { "logo": [0.0506, 0.0741, 0.2616, 0.2284], "headline": [0.0506, 0.2778, 0.4641, 0.6204], "cta": [0.0506, 0.7037, 0.4641, 0.9259], "product": [0.4958, 0.0741, 0.9494, 0.9259] }, "sameAs": null }, { "name": "Thuraya Screen 1 (Big)", "group": "DOOH", "w": 2624, "h": 608, "cls": "Wide", "marginPx": 46, "ribbon": false, "zones": { "logo": [0.0175, 0.0757, 0.2576, 0.227], "headline": [0.0175, 0.2796, 0.4992, 0.6184], "cta": [0.0175, 0.7039, 0.4992, 0.9243], "product": [0.5412, 0.0757, 0.9825, 0.9243] }, "sameAs": "Baitak" }, { "name": "Thuraya Screen 2 (Side)", "group": "DOOH", "w": 960, "h": 540, "cls": "Wide", "marginPx": 40, "ribbon": false, "zones": { "logo": [0.0417, 0.0741, 0.25, 0.2259], "headline": [0.0417, 0.2778, 0.4583, 0.6185], "cta": [0.0417, 0.7037, 0.4583, 0.9259], "product": [0.5, 0.0741, 0.9583, 0.9259] }, "sameAs": null }, { "name": "Marina - Balcony One", "group": "Marina", "w": 1200, "h": 240, "cls": "Ribbon", "marginPx": 20, "ribbon": true, "zones": { "logo": [0.0167, 0, 0.1167, 1], "headline": [0.1417, 0, 0.6, 1], "product": [0.6167, 0, 0.7833, 1], "cta": [0.8, 0, 0.9833, 1] }, "sameAs": null }, { "name": "Marina - Bridge Screen", "group": "Marina", "w": 2048, "h": 960, "cls": "Wide", "marginPx": 72, "ribbon": false, "zones": { "logo": [0.0352, 0.075, 0.2451, 0.2271], "headline": [0.0352, 0.2792, 0.459, 0.6188], "cta": [0.0352, 0.7042, 0.459, 0.925], "product": [0.498, 0.075, 0.9648, 0.925] }, "sameAs": null }, { "name": "Marina - Crescent Sync", "group": "Marina", "w": 480, "h": 1440, "cls": "Tall", "marginPx": 36, "ribbon": false, "zones": { "logo": [0.075, 0.0194, 0.3292, 0.0486], "teaser": [0.075, 0.0556, 0.925, 0.0792], "headline": [0.075, 0.2625, 0.925, 0.4007], "product": [0.075, 0.4076, 0.925, 0.6535], "offer": [0.075, 0.6604, 0.925, 0.7319], "cta": [0.075, 0.7417, 0.925, 0.8625], "legal": [0.075, 0.9, 0.925, 0.9764] }, "sameAs": null }, { "name": "Marina - Palm Trees (6 screens)", "group": "Marina", "w": 240, "h": 960, "cls": "Tall", "marginPx": 18, "ribbon": false, "zones": { "logo": [0.075, 0.0187, 0.3333, 0.05], "teaser": [0.075, 0.0563, 0.925, 0.0792], "headline": [0.075, 0.2625, 0.925, 0.401], "product": [0.075, 0.4062, 0.925, 0.6531], "offer": [0.075, 0.6583, 0.925, 0.7312], "cta": [0.075, 0.7417, 0.925, 0.8625], "legal": [0.075, 0.9, 0.925, 0.975] }, "sameAs": null }, { "name": "Aveneus Digital", "group": "Avenues", "w": 1080, "h": 1920, "cls": "Portrait", "marginPx": 80, "ribbon": false, "zones": { "logo": [0.0741, 0.0417, 0.3296, 0.1062], "headline": [0.0741, 0.1333, 0.9259, 0.3156], "product": [0.0741, 0.3271, 0.9259, 0.6458], "offer": [0.0741, 0.6573, 0.9259, 0.7198], "cta": [0.0741, 0.7479, 0.9259, 0.8667], "legal": [0.0741, 0.8938, 0.9259, 0.9583] }, "sameAs": "Gate Digital" }, { "name": "Avnues Flag", "group": "Avenues", "w": 1080, "h": 1920, "cls": "Portrait", "marginPx": 80, "ribbon": false, "zones": { "logo": [0.0741, 0.0417, 0.3296, 0.1062], "headline": [0.0741, 0.1333, 0.9259, 0.3156], "product": [0.0741, 0.3271, 0.9259, 0.6458], "offer": [0.0741, 0.6573, 0.9259, 0.7198], "cta": [0.0741, 0.7479, 0.9259, 0.8667], "legal": [0.0741, 0.8938, 0.9259, 0.9583] }, "sameAs": "Gate Digital" }, { "name": "Diamond", "group": "Avenues", "w": 1440, "h": 1800, "cls": "Portrait", "marginPx": 108, "ribbon": false, "zones": { "logo": [0.075, 0.06, 0.3306, 0.1211], "headline": [0.075, 0.1478, 0.925, 0.3206], "product": [0.075, 0.3367, 0.925, 0.6372], "offer": [0.075, 0.6533, 0.925, 0.7111], "cta": [0.075, 0.7378, 0.925, 0.8522], "legal": [0.075, 0.8789, 0.925, 0.94] }, "sameAs": null }, { "name": "Eye of Kuwait", "group": "Avenues", "w": 7560, "h": 2100, "cls": "Wide", "marginPx": 158, "ribbon": false, "zones": { "logo": [0.0209, 0.0752, 0.2603, 0.2286], "headline": [0.0209, 0.279, 0.5, 0.619], "cta": [0.0209, 0.7038, 0.5, 0.9248], "product": [0.5397, 0.0752, 0.9791, 0.9248] }, "sameAs": null }, { "name": "Eye of Kuwait Crop", "group": "Avenues", "w": 3624, "h": 1704, "cls": "Wide", "marginPx": 128, "ribbon": false, "zones": { "logo": [0.0353, 0.0751, 0.2478, 0.2277], "headline": [0.0353, 0.2793, 0.4608, 0.6185], "cta": [0.0353, 0.7042, 0.4608, 0.9249], "product": [0.4994, 0.0751, 0.9647, 0.9249] }, "sameAs": null }, { "name": "Grand Plaza Entrance", "group": "Avenues", "w": 2048, "h": 1024, "cls": "Wide", "marginPx": 76, "ribbon": false, "zones": { "logo": [0.0371, 0.0742, 0.2471, 0.2266], "headline": [0.0371, 0.2793, 0.459, 0.6191], "cta": [0.0371, 0.7051, 0.459, 0.9258], "product": [0.498, 0.0742, 0.9629, 0.9258] }, "sameAs": null }, { "name": "Topaz (Sync)", "group": "Avenues", "w": 864, "h": 864, "cls": "Square", "marginPx": 64, "ribbon": false, "zones": { "logo": [0.0741, 0.0741, 0.2963, 0.1759], "headline": [0.0741, 0.2014, 0.9259, 0.3877], "product": [0.0741, 0.4086, 0.9259, 0.713], "cta": [0.0741, 0.7477, 0.9259, 0.8646], "legal": [0.0741, 0.8854, 0.9259, 0.9259] }, "sameAs": null }, { "name": "AL Kout Bridge", "group": "AL Kout", "w": 2375, "h": 475, "cls": "Ribbon", "marginPx": 38, "ribbon": true, "zones": { "logo": [0.016, 0, 0.1179, 1], "headline": [0.1389, 0, 0.5979, 1], "product": [0.6189, 0, 0.7789, 1], "cta": [0.8, 0, 0.984, 1] }, "sameAs": null }, { "name": "360 Al Wadi", "group": "360 Mall", "w": 768, "h": 1024, "cls": "Portrait", "marginPx": 58, "ribbon": false, "zones": { "logo": [0.0755, 0.0566, 0.3307, 0.1191], "headline": [0.0755, 0.1445, 0.9245, 0.3193], "product": [0.0755, 0.335, 0.9245, 0.6387], "offer": [0.0755, 0.6543, 0.9245, 0.7129], "cta": [0.0755, 0.7402, 0.9245, 0.8555], "legal": [0.0755, 0.8809, 0.9245, 0.9434] }, "sameAs": null }, { "name": "360 Bridge", "group": "360 Mall", "w": 1920, "h": 766, "cls": "Wide", "marginPx": 58, "ribbon": false, "zones": { "logo": [0.0302, 0.0757, 0.2437, 0.2298], "headline": [0.0302, 0.2794, 0.4583, 0.6188], "cta": [0.0302, 0.705, 0.4583, 0.9243], "product": [0.5, 0.0757, 0.9698, 0.9243] }, "sameAs": null }, { "name": "360 Circular", "group": "360 Mall", "w": 1920, "h": 320, "cls": "Ribbon", "marginPx": 26, "ribbon": true, "zones": { "logo": [0.0135, 0, 0.1198, 1], "headline": [0.1406, 0, 0.599, 1], "product": [0.6198, 0, 0.7812, 1], "cta": [0.8021, 0, 0.9865, 1] }, "sameAs": null }, { "name": "360 Elevator", "group": "360 Mall", "w": 576, "h": 768, "cls": "Portrait", "marginPx": 44, "ribbon": false, "zones": { "logo": [0.0764, 0.0573, 0.3299, 0.1198], "headline": [0.0764, 0.1458, 0.9236, 0.319], "product": [0.0764, 0.3346, 0.9236, 0.638], "offer": [0.0764, 0.6536, 0.9236, 0.7135], "cta": [0.0764, 0.7396, 0.9236, 0.8542], "legal": [0.0764, 0.8802, 0.9236, 0.9427] }, "sameAs": null }, { "name": "360 Grand entrance", "group": "360 Mall", "w": 1366, "h": 768, "cls": "Wide", "marginPx": 58, "ribbon": false, "zones": { "logo": [0.0425, 0.0755, 0.2548, 0.2292], "headline": [0.0425, 0.2786, 0.4612, 0.6198], "cta": [0.0425, 0.7031, 0.4612, 0.9245], "product": [0.4978, 0.0755, 0.9575, 0.9245] }, "sameAs": null }, { "name": "360 Imax Tower", "group": "360 Mall", "w": 1600, "h": 2864, "cls": "Portrait", "marginPx": 120, "ribbon": false, "zones": { "logo": [0.075, 0.0419, 0.33, 0.1061], "headline": [0.075, 0.1334, 0.925, 0.316], "product": [0.075, 0.3272, 0.925, 0.6456], "offer": [0.075, 0.6568, 0.925, 0.72], "cta": [0.075, 0.7472, 0.925, 0.8666], "legal": [0.075, 0.8939, 0.925, 0.9581] }, "sameAs": null }, { "name": "360 MUPI", "group": "360 Mall", "w": 1080, "h": 1920, "cls": "Portrait", "marginPx": 80, "ribbon": false, "zones": { "logo": [0.0741, 0.0417, 0.3296, 0.1062], "headline": [0.0741, 0.1333, 0.9259, 0.3156], "product": [0.0741, 0.3271, 0.9259, 0.6458], "offer": [0.0741, 0.6573, 0.9259, 0.7198], "cta": [0.0741, 0.7479, 0.9259, 0.8667], "legal": [0.0741, 0.8938, 0.9259, 0.9583] }, "sameAs": "Gate Digital" }, { "name": "360 OvalScreen", "group": "360 Mall", "w": 1080, "h": 1920, "cls": "Portrait", "marginPx": 80, "ribbon": false, "zones": { "logo": [0.0741, 0.0417, 0.3296, 0.1062], "headline": [0.0741, 0.1333, 0.9259, 0.3156], "product": [0.0741, 0.3271, 0.9259, 0.6458], "offer": [0.0741, 0.6573, 0.9259, 0.7198], "cta": [0.0741, 0.7479, 0.9259, 0.8667], "legal": [0.0741, 0.8938, 0.9259, 0.9583] }, "sameAs": "Gate Digital" }, { "name": "Khairan indoor 2304 x 2376", "group": "Khairan Mall", "w": 2304, "h": 2376, "cls": "Square", "marginPx": 172, "ribbon": false, "zones": { "logo": [0.0747, 0.0724, 0.296, 0.1751], "headline": [0.0747, 0.2003, 0.9253, 0.3872], "product": [0.0747, 0.407, 0.9253, 0.7138], "cta": [0.0747, 0.7483, 0.9253, 0.8662], "legal": [0.0747, 0.8859, 0.9253, 0.9276] }, "sameAs": null }, { "name": "Khairan indoor 3456 x 1728", "group": "Khairan Mall", "w": 3456, "h": 1728, "cls": "Wide", "marginPx": 130, "ribbon": false, "zones": { "logo": [0.0376, 0.0752, 0.2488, 0.228], "headline": [0.0376, 0.2789, 0.4601, 0.6192], "cta": [0.0376, 0.7037, 0.4601, 0.9248], "product": [0.5006, 0.0752, 0.9624, 0.9248] }, "sameAs": null }, { "name": "Khairan indoor 3816 x 1224", "group": "Khairan Mall", "w": 3816, "h": 1224, "cls": "Wide", "marginPx": 92, "ribbon": false, "zones": { "logo": [0.0241, 0.0752, 0.2626, 0.2288], "headline": [0.0241, 0.2794, 0.5005, 0.6193], "cta": [0.0241, 0.7042, 0.5005, 0.9248], "product": [0.5398, 0.0752, 0.9759, 0.9248] }, "sameAs": null }, { "name": "Khairan Outdoor 1120 x 840", "group": "Khairan Mall", "w": 1120, "h": 840, "cls": "Wide", "marginPx": 64, "ribbon": false, "zones": { "logo": [0.0571, 0.0762, 0.2625, 0.2286], "headline": [0.0571, 0.2786, 0.4643, 0.619], "cta": [0.0571, 0.7024, 0.4643, 0.9238], "product": [0.5, 0.0762, 0.9429, 0.9238] }, "sameAs": null }, { "name": "WareHouse Screen 1120 x 512", "group": "Warehouse Mall", "w": 1120, "h": 512, "cls": "Wide", "marginPx": 38, "ribbon": false, "zones": { "logo": [0.0339, 0.0742, 0.2482, 0.2266], "headline": [0.0339, 0.2773, 0.4643, 0.6211], "cta": [0.0339, 0.7031, 0.4643, 0.9258], "product": [0.5, 0.0742, 0.9661, 0.9258] }, "sameAs": null }, { "name": "WareHouse Screen 2000 x 2800", "group": "Warehouse Mall", "w": 2e3, "h": 2800, "cls": "Portrait", "marginPx": 150, "ribbon": false, "zones": { "logo": [0.075, 0.0536, 0.33, 0.1157], "headline": [0.075, 0.1429, 0.925, 0.3186], "product": [0.075, 0.3329, 0.925, 0.64], "offer": [0.075, 0.6543, 0.925, 0.7143], "cta": [0.075, 0.7414, 0.925, 0.8571], "legal": [0.075, 0.8843, 0.925, 0.9464] }, "sameAs": null }, { "name": "WareHouse Screen 2400 x 800", "group": "Warehouse Mall", "w": 2400, "h": 800, "cls": "Wide", "marginPx": 60, "ribbon": false, "zones": { "logo": [0.025, 0.075, 0.2625, 0.2275], "headline": [0.025, 0.28, 0.5, 0.62], "cta": [0.025, 0.705, 0.5, 0.925], "product": [0.5417, 0.075, 0.975, 0.925] }, "sameAs": null }, { "name": "WareHouse Screen 576 x 1728", "group": "Warehouse Mall", "w": 576, "h": 1728, "cls": "Tall", "marginPx": 44, "ribbon": false, "zones": { "logo": [0.0764, 0.0185, 0.3299, 0.0486], "teaser": [0.0764, 0.0556, 0.9236, 0.0787], "headline": [0.0764, 0.2627, 0.9236, 0.4005], "product": [0.0764, 0.4074, 0.9236, 0.6539], "offer": [0.0764, 0.6609, 0.9236, 0.7315], "cta": [0.0764, 0.7407, 0.9236, 0.8634], "legal": [0.0764, 0.9005, 0.9236, 0.9757] }, "sameAs": null }, { "name": "Dayarti 1 1440 x 600", "group": "Dayarti", "w": 1440, "h": 600, "cls": "Wide", "marginPx": 44, "ribbon": false, "zones": { "logo": [0.0306, 0.0733, 0.2458, 0.2267], "headline": [0.0306, 0.2767, 0.4583, 0.62], "cta": [0.0306, 0.7033, 0.4583, 0.9267], "product": [0.5, 0.0733, 0.9694, 0.9267] }, "sameAs": null }, { "name": "Dayarti 2 1100 x 600", "group": "Dayarti", "w": 1100, "h": 600, "cls": "Wide", "marginPx": 44, "ribbon": false, "zones": { "logo": [0.04, 0.0733, 0.2491, 0.2267], "headline": [0.04, 0.2767, 0.4636, 0.62], "cta": [0.04, 0.7033, 0.4636, 0.9267], "product": [0.5, 0.0733, 0.96, 0.9267] }, "sameAs": null }, { "name": "Dayarti 3 950 x 600", "group": "Dayarti", "w": 950, "h": 600, "cls": "Wide", "marginPx": 44, "ribbon": false, "zones": { "logo": [0.0463, 0.0733, 0.2568, 0.2267], "headline": [0.0463, 0.2767, 0.4632, 0.62], "cta": [0.0463, 0.7033, 0.4632, 0.9267], "product": [0.5053, 0.0733, 0.9537, 0.9267] }, "sameAs": null }];

  // engine/adapt.ts
  var DEFAULTS = {
    SAFE_MARGIN_PCT: 0.06,
    TEXT_MAX_UPSCALE: 1.4,
    LOGO_MAX_W_PCT: 0.5,
    LOGO_MAX_H_PCT: 0.25,
    LOGO_MIN_SIDE_PCT: 0.03
  };
  var ROLE_DEFAULT_ADAPT = {
    bg: "cover",
    panel: "stretch",
    logo: "keep",
    headline: "keep",
    cta: "keep",
    product: "keep",
    scaleP: "keep"
  };
  var ZONE_SIDE_NAMES = { l: "left", r: "right", t: "top", b: "bottom" };
  var TAG_ANCHORS = /* @__PURE__ */ new Set(["tl", "tr", "bl", "br", "t", "b", "l", "r", "c"]);
  var trim = (s) => String(s ?? "").replace(/^\s+|\s+$/g, "");
  function stripTags(name) {
    return trim(String(name || "").replace(/@[a-zA-Z]+(?:[.:][a-zA-Z0-9]{1,10})*/g, " ").replace(/\s+/g, " "));
  }
  function parseTag(itemName) {
    const n = String(itemName || "").toLowerCase();
    if (n.indexOf("@") < 0) return null;
    let role = null, anchor = null, orient = null, adapt = null;
    let zonePct = null, zoneSide = null, pendingPct = null;
    let fitAxis = null, reserveVal = null, reserveUnit = null;
    let flush = null, keepClear2 = false, clearGap = null;
    const re = /@([a-z0-9]+)((?:[.:][a-z0-9]{1,10})*)/g;
    let m;
    while ((m = re.exec(n)) !== null) {
      let toks = [m[1]];
      if (m[2]) toks = toks.concat(m[2].replace(/^[.:]/, "").split(/[.:]/));
      for (const tk of toks) {
        if (tk === "bg" || tk === "background") role = "bg";
        else if (tk === "logo" || tk === "brand") role = "logo";
        else if (tk === "headline" || tk === "text" || tk === "copy") role = "headline";
        else if (tk === "cta") role = "cta";
        else if (["product", "hero", "fit", "safe", "image", "visual"].includes(tk)) role = "product";
        else if (tk === "panel" || tk === "block") role = "panel";
        else if (tk === "scalep" || tk === "sp") role = "scaleP";
        else if (tk === "auto") adapt = null;
        else if (tk === "keep" || tk === "stretch" || tk === "cover" || tk === "contain") adapt = tk;
        else if (tk === "ground") {
          flush = flush || {};
          flush.b = true;
        } else if (/^flush[lrtb]$/.test(tk)) {
          flush = flush || {};
          flush[tk.charAt(5)] = true;
        } else if (tk === "clear") keepClear2 = true;
        else if (/^clear\d{1,4}p?$/.test(tk)) {
          keepClear2 = true;
          clearGap = { value: parseInt(tk.slice(5), 10), unit: tk.endsWith("p") ? "pct" : "px" };
        } else if (tk === "hf") fitAxis = "h";
        else if (tk === "vf") fitAxis = "v";
        else if (/^\d{1,3}[lrtb]$/.test(tk)) {
          zonePct = parseInt(tk, 10);
          zoneSide = tk.charAt(tk.length - 1);
        } else if (/^\d{1,3}p$/.test(tk)) {
          if (fitAxis) {
            reserveVal = parseInt(tk, 10);
            reserveUnit = "pct";
          }
        } else if (/^\d{1,4}$/.test(tk)) {
          if (fitAxis && reserveVal === null) {
            reserveVal = parseInt(tk, 10);
            reserveUnit = "px";
          } else pendingPct = parseInt(tk, 10);
        } else if (tk === "l" || tk === "r" || tk === "t" || tk === "b") {
          if (pendingPct !== null) {
            zonePct = pendingPct;
            zoneSide = tk;
            pendingPct = null;
          } else anchor = tk;
        } else if (TAG_ANCHORS.has(tk)) anchor = tk;
        else if (tk === "left") anchor = "l";
        else if (tk === "right") anchor = "r";
        else if (tk === "top") anchor = "t";
        else if (tk === "bottom") anchor = "b";
        else if (tk === "center" || tk === "centre") anchor = "c";
        else if (["v", "sq", "uv", "uw", "xv", "xw", "h"].includes(tk)) orient = tk;
        else if (tk === "tall") orient = "uv";
        else if (tk === "xtall") orient = "xv";
        else if (tk === "wide") orient = "uw";
        else if (tk === "xwide" || tk === "extreme") orient = "xw";
      }
    }
    if (!role) return null;
    return {
      role,
      anchor,
      orient,
      adapt,
      zone: zonePct !== null && zoneSide ? { pct: zonePct, side: zoneSide } : null,
      fitAxis,
      reserve: reserveVal !== null ? { value: reserveVal, unit: reserveUnit } : null,
      flush,
      clear: keepClear2,
      clearGap
    };
  }
  var effectiveAdapt = (t) => t.adapt || ROLE_DEFAULT_ADAPT[t.role] || "keep";
  var gapLabel = (g) => g ? g.value + (g.unit === "pct" ? "%" : "px") : "safe margin";
  var flushLabel = (f) => f ? ["t", "b", "l", "r"].filter((k) => f[k]).map((k) => ({ t: "top", b: "bottom", l: "left", r: "right" })[k]).join("+") : "";
  function describeTag(t) {
    if (!t) return "";
    let s = t.role;
    if (t.role === "product" && t.zone) s += " zone " + t.zone.pct + "% " + ZONE_SIDE_NAMES[t.zone.side];
    else if (t.anchor) s += " pinned " + t.anchor;
    else if (t.role !== "bg") s += " auto";
    s += " / " + effectiveAdapt(t) + (t.adapt ? "" : " (default)");
    if (t.flush) s += " / flush " + flushLabel(t.flush);
    if (t.clear) s += " / clear of logos by " + gapLabel(t.clearGap);
    if (t.role === "product" && t.fitAxis) s += " " + (t.fitAxis === "h" ? "fit-W" : "fit-H") + (t.reserve ? " -" + t.reserve.value + (t.reserve.unit === "pct" ? "%" : "px") : "");
    if (t.orient) s += " @" + t.orient;
    return s;
  }
  function buildTaggedName(base, o) {
    const clean = stripTags(base);
    let core = "@" + o.role;
    const hasZone = o.role === "product" && o.zonePct && o.zoneSide;
    if (hasZone) core += "." + o.zonePct + "." + o.zoneSide;
    else if (o.anchor) core += "." + o.anchor;
    if (o.adapt) core += "." + o.adapt;
    if (o.flush) {
      for (const k of ["t", "b", "l", "r"]) if (o.flush[k]) core += ".flush" + k;
    }
    if (o.clear) {
      core += ".clear";
      if (o.clearGap) core += o.clearGap.value + (o.clearGap.unit === "pct" ? "p" : "");
    }
    if (o.role === "product" && o.fitAxis) {
      core += "." + (o.fitAxis === "h" ? "hf" : "vf");
      if (o.reserveVal) core += "." + o.reserveVal + (o.reserveUnit === "pct" ? "p" : "");
    }
    const parts = clean ? [clean, core] : [core];
    if (o.orient) parts.push("@" + o.orient);
    return parts.join(" ");
  }
  function formatDurationLabel(sec) {
    const r = Math.round(sec * 100) / 100;
    return (r === Math.floor(r) ? String(Math.floor(r)) : String(r)) + "s";
  }
  var screenDuration = (scr, masterDur, forceMaster) => forceMaster ? masterDur : scr && (scr.duration ?? 0) > 0 ? scr.duration : masterDur;
  function outputCompName(prefix, scr, durSec, suffix, labelBySize) {
    const parts = [];
    const label = labelBySize ? scr.w + "x" + scr.h : trim(stripTags(scr.name));
    if (trim(prefix)) parts.push(trim(prefix));
    if (label) parts.push(label);
    if (durSec > 0) parts.push(formatDurationLabel(durSec));
    if (trim(suffix)) parts.push(trim(suffix));
    return parts.length ? parts.join("_") : "ScreenAdapter";
  }
  function normalizeScreens(parsed) {
    if (!parsed || !parsed.length) return null;
    const out = [];
    let skipped = 0;
    for (const raw of parsed) {
      const s = raw || {};
      const w = parseInt(s.w, 10), h = parseInt(s.h, 10);
      if (!(w > 0 && h > 0)) {
        skipped++;
        continue;
      }
      const d = parseFloat(s.duration);
      const nm = s.name == null ? "" : trim(String(s.name));
      out.push({ name: nm || w + "x" + h, w, h, selected: s.selected !== false, duration: d > 0 ? d : null });
    }
    return out.length ? { screens: out, skipped } : null;
  }
  var normalizeScreenName = (v) => trim(String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " "));
  var haystack = (s) => normalizeScreenName(s.name) + " " + s.w + "x" + s.h + " " + s.w + " " + s.h;
  var editTol = (n) => n <= 3 ? 0 : n <= 6 ? 1 : 2;
  function editDistance(a, b) {
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      const cur = [i];
      for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = cur;
    }
    return prev[b.length];
  }
  function fuzzyMatchScore(query, hay) {
    if (!query) return 100;
    if (hay.indexOf(query) >= 0) return 100 - Math.min(hay.indexOf(query), 40);
    let qi = 0, streak = 0, best = 0;
    for (let hi = 0; hi < hay.length; hi++) {
      if (hay[hi] === query[qi]) {
        streak++;
        qi++;
        if (qi >= query.length) {
          best = Math.max(best, 62 + streak * 4);
          break;
        }
      } else if (streak > 0) streak = 0;
    }
    if (qi >= query.length) best = Math.max(best, 58 + streak * 3);
    const parts = query.split(" "), words = hay.split(" ");
    let found = 0;
    for (const qw of parts) {
      if (!qw) continue;
      if (hay.indexOf(qw) >= 0) {
        found++;
        continue;
      }
      if (words.some((w) => w && (w.indexOf(qw) >= 0 || editDistance(qw, w) <= editTol(qw.length)))) found++;
    }
    if (parts.length && found === parts.length) best = Math.max(best, 72);
    return best;
  }
  function screenMatchesFilter(scr, query) {
    const q = normalizeScreenName(query);
    if (!q) return true;
    const hay = haystack(scr);
    return hay.indexOf(q) >= 0 || fuzzyMatchScore(q, hay) >= 42;
  }
  function targetOrient(tw, th) {
    const r = tw / th;
    if (r >= 8) return "xw";
    if (r >= 3) return "uw";
    if (r > 1.1) return "h";
    if (r <= 0.2) return "xv";
    if (r <= 0.35) return "uv";
    if (r < 0.9) return "v";
    return "sq";
  }
  function wantedClass(cls, role, has) {
    const ok = (c2) => !!has[role]?.[c2];
    let c = cls;
    if (c === "xw" && !ok("xw")) c = "uw";
    if (c === "uw" && !ok("uw")) c = "h";
    if (c === "xv" && !ok("xv")) c = "uv";
    if (c === "uv" && !ok("uv")) c = "v";
    return c;
  }
  function buildOrientMap(tags) {
    const m = {};
    for (const t of tags) if (t?.orient) (m[t.role] ??= {})[t.orient] = true;
    return m;
  }
  function masterFractions(rect, xf, compW, compH, parents = []) {
    if (!rect || rect.width < 0.5 || rect.height < 0.5) return null;
    const sx = xf.scale[0] / 100, sy = xf.scale[1] / 100;
    let left = xf.position[0] + (rect.left - xf.anchor[0]) * sx;
    let top = xf.position[1] + (rect.top - xf.anchor[1]) * sy;
    let w = rect.width * sx, h = rect.height * sy;
    if (w <= 0 || h <= 0) return null;
    for (const p of parents.slice(0, 50)) {
      const psx = p.scale[0] / 100, psy = p.scale[1] / 100;
      left = p.position[0] + (left - p.anchor[0]) * psx;
      top = p.position[1] + (top - p.anchor[1]) * psy;
      w *= psx;
      h *= psy;
    }
    if (w <= 0 || h <= 0) return null;
    return { x0: left / compW, y0: top / compH, wF: w / compW, hF: h / compH, cx: (left + w / 2) / compW, cy: (top + h / 2) / compH };
  }
  function anchorInRect(anchor, zx, zy, zw, zh, ew, eh, m) {
    let x, y;
    switch (anchor) {
      case "tl":
        x = m;
        y = m;
        break;
      case "tr":
        x = zw - m - ew;
        y = m;
        break;
      case "bl":
        x = m;
        y = zh - m - eh;
        break;
      case "br":
        x = zw - m - ew;
        y = zh - m - eh;
        break;
      case "t":
        x = (zw - ew) / 2;
        y = m;
        break;
      case "b":
        x = (zw - ew) / 2;
        y = zh - m - eh;
        break;
      case "l":
        x = m;
        y = (zh - eh) / 2;
        break;
      case "r":
        x = zw - m - ew;
        y = (zh - eh) / 2;
        break;
      default:
        x = (zw - ew) / 2;
        y = (zh - eh) / 2;
    }
    return [zx + x, zy + y];
  }
  var anchorTopLeft = (a, tw, th, ew, eh, m) => anchorInRect(a, 0, 0, tw, th, ew, eh, m);
  function splitRect(base, side, pct) {
    const f = pct / 100;
    let [x, y, w, h] = base;
    if (side === "l") w = w * f;
    else if (side === "r") {
      const nw = w * f;
      x = x + w - nw;
      w = nw;
    } else if (side === "t") h = h * f;
    else if (side === "b") {
      const nh = h * f;
      y = y + h - nh;
      h = nh;
    }
    return [x, y, w, h];
  }
  var oppositeSide = (s) => ({ l: "r", r: "l", t: "b", b: "t" })[s];
  var defaultFitAxisForZone = (z) => !z ? null : z.side === "l" || z.side === "r" ? "h" : "v";
  var mirrorAnchor = (a) => a ? a.replace(/l|r/, (c) => c === "l" ? "r" : "l") : a;
  function clampRoleScale(role, f, rect, tw, th, c = DEFAULTS) {
    if (role === "logo") {
      if (rect.width * f > c.LOGO_MAX_W_PCT * tw) f = c.LOGO_MAX_W_PCT * tw / rect.width;
      if (rect.height * f > c.LOGO_MAX_H_PCT * th) f = c.LOGO_MAX_H_PCT * th / rect.height;
      const minSide = Math.max(24, Math.min(tw, th) * c.LOGO_MIN_SIDE_PCT);
      if (Math.min(rect.width, rect.height) * f < minSide) f = minSide / Math.min(rect.width, rect.height);
    }
    return f;
  }
  function pinnedScale(role, rect, tw, th, mW, mH, margin, c = DEFAULTS) {
    if (role === "headline" || role === "cta") {
      const f = Math.min((tw - 2 * margin) / rect.width, (th - 2 * margin) / rect.height);
      return f > 1 ? Math.min(f, c.TEXT_MAX_UPSCALE) : f;
    }
    return clampRoleScale(role, Math.min(tw / mW, th / mH), rect, tw, th, c);
  }
  function flushRect(r, tag, tw, th) {
    const fx = tag.flush;
    if (!fx) return r;
    if (fx.l && fx.r && r.stretch) {
      r.x = 0;
      r.w = tw;
    } else if (fx.l) r.x = 0;
    else if (fx.r) r.x = tw - r.w;
    if (fx.t && fx.b && r.stretch) {
      r.y = 0;
      r.h = th;
    } else if (fx.t) r.y = 0;
    else if (fx.b) r.y = th - r.h;
    return r;
  }
  function targetRect(rect, tag, mf, tw, th, mW, mH, margin, cushion = 100, zone = null, c = DEFAULTS) {
    const mode = effectiveAdapt(tag);
    let f, w, h;
    if (tag.role === "bg") {
      const ba = tag.anchor || "c";
      f = Math.max(tw / rect.width, th / rect.height);
      w = rect.width * f;
      h = rect.height * f;
      const x = ba.includes("l") ? 0 : ba.includes("r") ? tw - w : (tw - w) / 2;
      const y = ba.includes("t") ? 0 : ba.includes("b") ? th - h : (th - h) / 2;
      return { x, y, w, h, stretch: false };
    }
    if (zone) {
      const [zx, zy, zw, zh] = zone;
      const axis = tag.fitAxis || defaultFitAxisForZone(tag.zone);
      const res = (len) => tag.reserve ? tag.reserve.unit === "pct" ? len * tag.reserve.value / 100 : tag.reserve.value : 0;
      if (axis === "h") f = (zw - res(zw)) / rect.width;
      else if (axis === "v") f = (zh - res(zh)) / rect.height;
      else f = Math.min(zw / rect.width, zh / rect.height);
      if (f <= 0) f = 0.01;
      w = rect.width * f;
      h = rect.height * f;
      const [x, y] = anchorInRect(tag.anchor, zx, zy, zw, zh, w, h, 0);
      return flushRect({ x, y, w, h, stretch: false }, tag, tw, th);
    }
    if (tag.role === "scaleP") {
      const sb = [margin, margin, tw - 2 * margin, th - 2 * margin];
      f = Math.min(sb[2] / rect.width, sb[3] / rect.height) * (cushion / 100);
      if (f <= 0) f = 0.01;
      w = rect.width * f;
      h = rect.height * f;
      const [x, y] = anchorInRect(tag.anchor, sb[0], sb[1], sb[2], sb[3], w, h, 0);
      return flushRect({ x, y, w, h, stretch: false }, tag, tw, th);
    }
    if (tag.anchor || !mf) {
      f = pinnedScale(tag.role, rect, tw, th, mW, mH, margin, c);
      if (f <= 0) f = 0.01;
      w = rect.width * f;
      h = rect.height * f;
      const [x, y] = anchorTopLeft(tag.anchor, tw, th, w, h, margin);
      return flushRect({ x, y, w, h, stretch: false }, tag, tw, th);
    }
    const bx = mf.x0 * tw, by = mf.y0 * th, bw = mf.wF * tw, bh = mf.hF * th;
    if (mode === "stretch") return flushRect({ x: bx, y: by, w: bw, h: bh, stretch: true }, tag, tw, th);
    f = mode === "cover" ? Math.max(bw / rect.width, bh / rect.height) : Math.min(bw / rect.width, bh / rect.height);
    if (tag.role === "headline" || tag.role === "cta") {
      const masterF = mf.wF * mW / rect.width;
      if (f > masterF * c.TEXT_MAX_UPSCALE) f = masterF * c.TEXT_MAX_UPSCALE;
    }
    f = clampRoleScale(tag.role, f, rect, tw, th, c);
    if (f <= 0) f = 0.01;
    w = rect.width * f;
    h = rect.height * f;
    return flushRect({ x: bx + (bw - w) / 2, y: by + (bh - h) / 2, w, h, stretch: false }, tag, tw, th);
  }
  function pushClear(a, o, gap) {
    const ox0 = o.x - gap, oy0 = o.y - gap, ox1 = o.x + o.w + gap, oy1 = o.y + o.h + gap;
    const ax1 = a.x + a.w, ay1 = a.y + a.h;
    if (a.x >= ox1 || ax1 <= ox0 || a.y >= oy1 || ay1 <= oy0) return a;
    const w0 = a.w, h0 = a.h;
    const dTop = oy1 - a.y, dBottom = ay1 - oy0, dLeft = ox1 - a.x, dRight = ax1 - ox0;
    const least = Math.min(dTop, dBottom, dLeft, dRight);
    if (least === dTop) {
      a.y += dTop;
      a.h -= dTop;
    } else if (least === dBottom) a.h -= dBottom;
    else if (least === dLeft) {
      a.x += dLeft;
      a.w -= dLeft;
    } else a.w -= dRight;
    if (a.w < 1) a.w = 1;
    if (a.h < 1) a.h = 1;
    if (!a.stretch) {
      const s = Math.min(a.w / w0, a.h / h0), nw = w0 * s, nh = h0 * s;
      a.x += (a.w - nw) / 2;
      a.y += (a.h - nh) / 2;
      a.w = nw;
      a.h = nh;
    }
    return a;
  }
  var clearGapPx = (tag, fallback, tw, th) => !tag.clearGap ? fallback : tag.clearGap.unit === "pct" ? Math.min(tw, th) * (tag.clearGap.value / 100) : tag.clearGap.value;
  function resolveClearance(rects, tags, fallbackGap, tw, th) {
    rects.forEach((r, i) => {
      if (!r || !tags[i].clear) return;
      const gap = clearGapPx(tags[i], fallbackGap, tw, th);
      rects.forEach((o, j) => {
        if (i === j || !o || tags[j].role !== "logo" && tags[j].role !== "cta") return;
        rects[i] = pushClear(rects[i], o, gap);
      });
    });
  }
  function adaptMapping(mf, r, mW, mH) {
    const mw = mf.wF * mW, mh = mf.hF * mH;
    if (mw <= 0 || mh <= 0) return null;
    const sx = r.w / mw, sy = r.h / mh;
    return { sx, sy, tx: r.x - sx * (mf.x0 * mW), ty: r.y - sy * (mf.y0 * mH) };
  }
  function resolveComplement(tags, askPartner) {
    const primaryQ = tags.findIndex((t) => t?.role === "product" && t.zone && t.zone.pct < 100);
    if (primaryQ < 0) return null;
    const cand = tags.map((t, q) => q !== primaryQ && t?.role === "product" && !t.zone ? q : -1).filter((q) => q >= 0);
    const z = tags[primaryQ].zone;
    if (!cand.length) return { primaryQ, partnerQ: -1, side: z.side, pct: z.pct };
    const partnerQ = cand.length === 1 ? cand[0] : askPartner(cand);
    if (partnerQ === null) return "ABORT";
    return { primaryQ, partnerQ, side: z.side, pct: z.pct };
  }
  function validRoi(comp, roi) {
    if (!roi || roi.length < 4) return false;
    const [x, y, w, h] = roi;
    if (!(w > 0 && h > 0)) return false;
    return !(w >= comp.width && h >= comp.height && x === 0 && y === 0);
  }
  function formatRoiSkipReason(layerName, srcName, roi, compW, compH) {
    const t = !roi ? "<unreadable>" : roi.length >= 4 ? "[" + roi.slice(0, 4).join(",") + "]" : String(roi);
    return `${layerName} (ROI missing/invalid in '${srcName}'; ROI=${t} comp=${compW}x${compH})`;
  }
  var basisShiftComp = (b, L, T) => [b.xAxis[0] * L + b.yAxis[0] * T, b.xAxis[1] * L + b.yAxis[1] * T];
  function rotScaleOffset(dx, dy, scale, rotDeg) {
    const sx = scale[0] / 100, sy = scale[1] / 100, rot = rotDeg * Math.PI / 180, c = Math.cos(rot), s = Math.sin(rot);
    const lx = dx * sx, ly = dy * sy;
    return [lx * c - ly * s, lx * s + ly * c];
  }
  function placementAfterRoiCrop(saved, L, T, newW, newH) {
    const off = rotScaleOffset(L + newW / 2 - saved.anc[0], T + newH / 2 - saved.anc[1], saved.scale, saved.rot);
    return { anchor: [newW / 2, newH / 2], position: [saved.pos[0] + off[0], saved.pos[1] + off[1]] };
  }
  function forkNameFor(session, baseName) {
    const want = baseName + " [" + session.label + "]";
    let cand = want;
    for (let n = 2; session.taken[cand] && n < 1e4; n++) cand = want + " " + n;
    session.taken[cand] = true;
    return cand;
  }
  function rewriteCompRefs(expression, renames) {
    let out = expression;
    for (const { from, to } of renames) {
      if (from === to) continue;
      out = out.split(`comp("${from}")`).join(`comp("${to}")`).split(`comp('${from}')`).join(`comp('${to}')`);
    }
    return out;
  }
  function layoutScreen(layers, mW, mH, tw, th, opts = {}) {
    const c = opts.config || DEFAULTS;
    let tags = layers.map((l) => parseTag(l.name));
    if (opts.rtl) tags = tags.map((t) => t && { ...t, anchor: mirrorAnchor(t.anchor), zone: t.zone && { ...t.zone, side: t.zone.side === "l" || t.zone.side === "r" ? oppositeSide(t.zone.side) : t.zone.side } });
    const margin = Math.round(Math.min(tw, th) * c.SAFE_MARGIN_PCT);
    const orient = targetOrient(tw, th), has = buildOrientMap(tags);
    const pairR = resolveComplement(tags, opts.askPartner || ((cand) => cand[0]));
    const pair = pairR === "ABORT" ? null : pairR;
    const rects = [], skipped = [];
    layers.forEach((l, q) => {
      const tag = tags[q];
      if (!tag) {
        rects[q] = null;
        return;
      }
      if (!l.rect) {
        skipped.push({ name: l.name, reason: "no bounds" });
        rects[q] = null;
        return;
      }
      if (tag.orient && tag.orient !== wantedClass(orient, tag.role, has)) {
        skipped.push({ name: l.name, reason: "orientation " + tag.orient });
        rects[q] = null;
        return;
      }
      let zone = null;
      if (tag.role === "product" && (tag.zone || pair && (q === pair.primaryQ || q === pair.partnerQ))) {
        const base = [0, 0, tw, th];
        zone = pair && q === pair.partnerQ ? splitRect(base, oppositeSide(pair.side), 100 - pair.pct) : splitRect(base, tag.zone.side, tag.zone.pct);
      }
      let mf = l.frac;
      if (opts.rtl && mf) mf = { ...mf, x0: 1 - mf.x0 - mf.wF, cx: 1 - mf.cx };
      rects[q] = targetRect(l.rect, tag, mf, tw, th, mW, mH, margin, opts.cushion ?? 100, zone, c);
    });
    resolveClearance(rects, tags.map((t) => t), margin, tw, th);
    return { orient, margin, rects, skipped };
  }
  function propIsAnimated(p) {
    if (!p) return false;
    return (p.numKeys || 0) > 0 || !!p.expressionEnabled && !!p.expression;
  }
  function sourceDeltaToCompDelta(L, T, basis, scale = [100, 100], rotDeg = 0) {
    return basis ? basisShiftComp(basis, L, T) : rotScaleOffset(L, T, scale, rotDeg);
  }
  function saliencyCrop(sal, W, H, aspect, steps = 64) {
    let cw = W, ch = W / aspect;
    if (ch > H) {
      ch = H;
      cw = H * aspect;
    }
    const I = new Float64Array((W + 1) * (H + 1));
    for (let y = 0; y < H; y++) {
      let row = 0;
      for (let x = 0; x < W; x++) {
        row += sal[y * W + x];
        I[(y + 1) * (W + 1) + x + 1] = I[y * (W + 1) + x + 1] + row;
      }
    }
    const sum = (x, y, w, h) => {
      const x0 = Math.round(x), y0 = Math.round(y), x1 = Math.min(W, Math.round(x + w)), y1 = Math.min(H, Math.round(y + h));
      return I[y1 * (W + 1) + x1] - I[y0 * (W + 1) + x1] - I[y1 * (W + 1) + x0] + I[y0 * (W + 1) + x0];
    };
    let best = { x: (W - cw) / 2, y: (H - ch) / 2, s: -1, d: 0 };
    const nx = Math.max(1, Math.min(steps, Math.round(W - cw))), ny = Math.max(1, Math.min(steps, Math.round(H - ch)));
    for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) {
      const x = (W - cw) * i / nx, y = (H - ch) * j / ny, s = sum(x, y, cw, ch);
      const d = Math.hypot(x + cw / 2 - W / 2, y + ch / 2 - H / 2);
      if (s > best.s + 1e-9 || Math.abs(s - best.s) <= 1e-9 && d < best.d) best = { x, y, s, d };
    }
    return { x: best.x, y: best.y, w: cw, h: ch };
  }
  var TATWEEL = "\u0640";
  function arabicJoining(ch) {
    const c = ch.codePointAt(0);
    const inR = (a, b) => c >= a && c <= b;
    if (c === 1568 || c === 1574 || c === 1576 || inR(1578, 1582) || inR(1587, 1599) || inR(1601, 1607) || c === 1609 || c === 1610 || c === 1646 || c === 1647 || inR(1656, 1671) || inR(1690, 1727) || c === 1729 || c === 1730 || c === 1740 || c === 1742 || c === 1744 || c === 1745 || inR(1786, 1788) || c === 1791) return "D";
    if (inR(1570, 1573) || c === 1575 || c === 1577 || inR(1583, 1586) || c === 1608 || inR(1649, 1651) || inR(1653, 1655) || inR(1672, 1689) || c === 1728 || inR(1731, 1739) || c === 1741 || c === 1743 || c === 1746 || c === 1747 || c === 1749 || c === 1774 || c === 1775) return "R";
    if (c === 1600 || c === 8205) return "C";
    if (inR(1536, 1541) || c === 1757 || c === 8204) return "N";
    if (/\p{Mn}|\p{Me}|\p{Cf}/u.test(ch)) return "T";
    return "N";
  }
  function kashidaPicks(text) {
    const cs = Array.from(text), picks = [];
    let word = null, prev = null;
    for (let i = 0; i < cs.length; i++) {
      const ch = cs[i], j = arabicJoining(ch);
      const notLetter = j !== "T" && !/\p{L}/u.test(ch);
      if (notLetter || /\s/.test(ch)) {
        if (word !== null) picks.push(word);
        word = null;
        prev = null;
        continue;
      }
      if (j === "T") continue;
      if (prev !== null) {
        const a = arabicJoining(cs[prev]);
        if ((a === "D" || a === "C") && (j === "D" || j === "R" || j === "C")) word = i;
      }
      prev = i;
    }
    if (word !== null) picks.push(word);
    return picks;
  }
  function applyKashida(text, picks, counts) {
    const cs = Array.from(text);
    for (let k = picks.length - 1; k >= 0; k--) if (counts[k] > 0) cs.splice(picks[k], 0, TATWEEL.repeat(counts[k]));
    return cs.join("");
  }
  var KASHIDA_MAX_PER_WORD = 3;
  function kashidaFit(text, targetW, measure, maxPer = KASHIDA_MAX_PER_WORD) {
    maxPer = Math.max(0, Math.min(maxPer, KASHIDA_MAX_PER_WORD));
    const picks = kashidaPicks(text);
    const base = measure(text), t = measure(TATWEEL);
    if (!picks.length || !(t > 0) || base >= targetW) return { text, added: 0 };
    let total = Math.floor((targetW - base) / t);
    total = Math.min(total, picks.length * maxPer);
    const counts = picks.map((_, k) => Math.floor(total / picks.length) + (k < total % picks.length ? 1 : 0));
    let out = applyKashida(text, picks, counts);
    while (measure(out) > targetW && counts.some((c) => c > 0)) {
      const k = counts.lastIndexOf(Math.max(...counts));
      counts[k]--;
      out = applyKashida(text, picks, counts);
    }
    return { text: out, added: counts.reduce((a, b) => a + b, 0) };
  }
  var WEAK_END = /* @__PURE__ */ new Set(["a", "an", "the", "of", "to", "in", "on", "for", "and", "or", "&", "with", "at", "by", "up", "\u0648", "\u0641\u064A", "\u0645\u0646", "\u0639\u0644\u0649", "\u0625\u0644\u0649", "\u0639\u0646", "\u0645\u0639"]);
  function balancedBreak(words, k, measure) {
    const n = words.length;
    k = Math.max(1, Math.min(k, n));
    const w = (i, j) => measure(words.slice(i, j).join(" ")) * (j < n && WEAK_END.has(words[j - 1].toLowerCase()) ? 1.6 : 1);
    const memo = /* @__PURE__ */ new Map();
    const best = (i, r) => {
      const key = i + ":" + r;
      if (memo.has(key)) return memo.get(key);
      let res;
      if (r === 1) res = [w(i, n), [n]];
      else {
        res = [Infinity, []];
        for (let j = i + 1; j <= n - r + 1; j++) {
          const [m, cuts2] = best(j, r - 1);
          const v = Math.max(w(i, j), m);
          if (v < res[0]) res = [v, [j, ...cuts2]];
        }
      }
      memo.set(key, res);
      return res;
    };
    const cuts = best(0, k)[1];
    const lines = [];
    let s = 0;
    for (const c of cuts) {
      lines.push(words.slice(s, c).join(" "));
      s = c;
    }
    return lines;
  }
  function chunkToBox(text, boxW, boxH, measure1px, maxLines = 4, lineH = 1.12) {
    const words = text.trim().split(/\s+/);
    let best = { lines: [text], font: 0, k: 1 };
    for (let k = 1; k <= Math.min(maxLines, words.length); k++) {
      const lines = balancedBreak(words, k, measure1px);
      const widest = Math.max(...lines.map(measure1px));
      const font = Math.min(boxW / widest, boxH / (k * lineH));
      if (font > best.font * 1.04) best = { lines, font, k };
    }
    return best;
  }
  function autoTag(name, box, mW, mH) {
    if (parseTag(name)) return null;
    const n = name.toLowerCase(), [x, y, w, h] = box, area = w * h / (mW * mH);
    if (/logo|brand/.test(n)) return { tag: "@logo", why: "name" };
    if (/price|cta|buy|shop|badge|button/.test(n)) return { tag: "@cta", why: "name" };
    if (/bg|background/.test(n) || area > 0.9) return { tag: "@bg", why: area > 0.9 ? "covers frame" : "name" };
    if (/head|title|offer|copy|text/.test(n)) return { tag: "@headline", why: "name" };
    if (area > 0.15) return { tag: "@product", why: "large visual" };
    return { tag: "@panel", why: "default" };
  }
  function qaScore(items, tw, th, margin, minTextPct = 0.035, productGap = 0) {
    const issues = [];
    let score = 100;
    const short = Math.min(tw, th);
    for (const it of items) if (it.kind === "text" && it.fontPx !== void 0 && it.fontPx < short * minTextPct) {
      issues.push(`text ${Math.round(it.fontPx)}px < ${Math.round(short * minTextPct)}px`);
      score -= 20;
    }
    const ov = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    items.forEach((a, i) => items.forEach((b, j) => {
      if (i < j && a.kind === "text" && b.kind !== "other" && ov(a.r, b.r)) {
        issues.push(`text overlaps ${b.kind}`);
        score -= 15;
      }
    }));
    if (productGap > 0) items.forEach((a) => items.forEach((b) => {
      if (a.kind === "text" && b.kind === "product" && !hit(a.r, b.r) && rectGap(a.r, b.r) < productGap - 0.5) {
        issues.push("text closer than gap to product");
        score -= 10;
      }
    }));
    for (const it of items) if (it.kind !== "other" && it.kind !== "product" && (it.r.x < margin - 1 || it.r.y < margin - 1 || it.r.x + it.r.w > tw - margin + 1 || it.r.y + it.r.h > th - margin + 1)) {
      issues.push(`${it.kind} outside safe area`);
      score -= 10;
    }
    return { score: Math.max(0, score), issues };
  }
  function importScreenList(raw, source, problems = []) {
    if (raw === "" || raw == null) {
      problems.push(`${source}: empty file`);
      return [];
    }
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) {
      problems.push(`${source}: not an array`);
      return [];
    }
    const out = [];
    arr.forEach((r, i) => {
      const w = Number(r?.w), h = Number(r?.h);
      if (typeof r?.name !== "string" || !(w > 0) || !(h > 0) || !Number.isInteger(w) || !Number.isInteger(h)) {
        problems.push(`${source}[${i}]: invalid row`);
        return;
      }
      out.push({ name: r.name, w, h, group: r.group || void 0, source, kind: "screen" });
    });
    return out;
  }
  function importCombiners(raw, screens, source, problems = []) {
    const arr = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(arr)) {
      problems.push(`${source}: not an array`);
      return [];
    }
    const out = [];
    for (const L of arr) {
      const cols = L?.columns || [], notes = [];
      const sized = cols.map((col) => {
        const lay = ["single", "h-dup", "v-dup"].includes(String(col.layout).toLowerCase()) ? String(col.layout).toLowerCase() : "single";
        const count = lay === "single" ? 1 : Math.max(1, Number(col.count) || 1);
        let m = Array.isArray(col.match) && col.match.length === 2 ? col.match.map(Number) : null;
        const s = screens.find((p) => p.name === col.screenName);
        if (!m && s) m = [s.w, s.h];
        if (!m) return null;
        if (s && (s.w !== m[0] || s.h !== m[1])) notes.push(`"${col.screenName}" match ${m[0]}\xD7${m[1]} \u2260 preset ${s.w}\xD7${s.h}`);
        if (!s) notes.push(`"${col.screenName}" not in screen presets (size from match)`);
        const cw = col.compW ? Number(col.compW) : m[0] * (lay === "h-dup" ? count : 1);
        if (col.compW && col.compW !== m[0] * count) notes.push(`compW ${col.compW} overrides ${m[0]}\xD7${count}=${m[0] * count}${m[0] * count - col.compW > 0 && m[0] * count - col.compW <= 2 ? ` (crop ${m[0] * count - col.compW}px from last face, no scaling)` : col.forceScale ? " (forceScale)" : ""}`);
        return { col, lay, count, m, cw, ch: m[1] * (lay === "v-dup" ? count : 1) };
      });
      if (sized.some((s) => !s)) {
        problems.push(`${source}: ${L?.name} has a column with no size`);
        continue;
      }
      const W = sized.reduce((a, s) => a + s.cw, 0), H = Math.max(...sized.map((s) => s.ch));
      const faces = [];
      let x = 0;
      for (const s of sized) {
        const va = String(s.col.vAlign || "top").toLowerCase(), y0 = va === "center" ? (H - s.ch) / 2 : va === "bottom" ? H - s.ch : 0;
        const crop = s.lay === "h-dup" && s.cw < s.m[0] * s.count && s.m[0] * s.count - s.cw <= 2;
        const fw = s.lay === "h-dup" && !crop ? s.cw / s.count : s.lay === "h-dup" ? s.m[0] : s.cw;
        for (let k = 0; k < s.count; k++) {
          const w = crop && k === s.count - 1 ? s.cw - fw * (s.count - 1) : fw;
          faces.push(s.lay === "v-dup" ? { x, y: y0 + k * s.m[1], w: fw, h: s.m[1] } : { x: x + k * fw, y: y0, w, h: s.m[1] });
        }
        x += s.cw;
      }
      if (L.name === "Thuraya_Full") notes.push("Thuraya = two screens: 2624\xD7608 + 960\xD7540 (deliver per screen; the 3584\xD7608 canvas is only the AE combiner comp)");
      out.push({ name: L.name, w: W, h: H, source, kind: "combined", faces, notes: notes.length ? notes : void 0 });
    }
    return out;
  }
  function mergePresets(lists, problems = []) {
    const map = /* @__PURE__ */ new Map();
    for (const list of lists) for (const p of list) {
      const k = `${p.kind}|${p.name}|${p.w}x${p.h}`, prev = map.get(k);
      if (prev) {
        prev.source += ", " + p.source;
        prev.group = prev.group || p.group;
        continue;
      }
      if ([...map.values()].some((q) => q.name === p.name && q.kind === p.kind)) problems.push(`"${p.name}" has different sizes across files`);
      map.set(k, { ...p });
    }
    return [...map.values()];
  }
  function stripPastedListMarker(v) {
    const line = String(v || "").trim();
    if (!line) return "";
    if (/^\d+(?:\.\d+)?\s*[xX]\s*\d+$/.test(line) || /^\d+\.\d+\s*hd\b/i.test(line) || /^\d+(?:st|nd|rd|th)\b/i.test(line)) return line;
    return line.replace(/^\s*(?:(?:[-*\u2022\u2023\u25e6\u25aa\u25ab\u2013\u2014])\s+|\(?\d{1,4}\)?(?:[.)]|[-:])\s+|\[\d{1,4}\]\s+|\d{1,4}\s+)/, "").trim();
  }
  function parsePastedScreenNames(v) {
    return String(v || "").split(/[\r\n,;]+/).map(stripPastedListMarker).filter(Boolean);
  }
  var PASTE_SELECTION_ALIASES = Object.fromEntries([
    ["2.6", ["2.6 Screen"]],
    ["Thuraya", ["Thuraya Screen 1 (Big)", "Thuraya Screen 2 (Side)"]],
    ["Thuraya Combined", ["Thuraya Screen 1 (Big)", "Thuraya Screen 2 (Side)"]],
    ["Thuraya Full", ["Thuraya Screen 1 (Big)", "Thuraya Screen 2 (Side)"]],
    ["The Avenues Gate Combined", ["Avenues Gate Left Side", "Avenues Gate Right Side"]],
    ["Avenues Gate Combined", ["Avenues Gate Left Side", "Avenues Gate Right Side"]],
    ["Avenue Gate Combined", ["Avenues Gate Left Side", "Avenues Gate Right Side"]],
    ["The Avenues Gate", ["Avenues Gate Left Side", "Avenues Gate Right Side"]],
    ["Avenues Gate", ["Avenues Gate Left Side", "Avenues Gate Right Side"]],
    ["Blajat Salmiya Combined", ["Blajat-Left Side", "Blajat-Right Side"]],
    ["Balajath Salmiya Combined", ["Blajat-Left Side", "Blajat-Right Side"]],
    ["Blajat Combined", ["Blajat-Left Side", "Blajat-Right Side"]],
    ["Al Meera Mall Combined", ["Al Meera Mall-Left Side", "Al Meera Mall-Right Side"]],
    ["Al Meera Combined", ["Al Meera Mall-Left Side", "Al Meera Mall-Right Side"]],
    ["The Capital Hub Combined", ["The Capital Hub - Side 1"]],
    ["Capital Hub Combined", ["The Capital Hub - Side 1"]],
    ["Capital Hub", ["The Capital Hub - Side 1"]],
    ["Al Zawya Combined", ["Al Zawya - Screen 1 (center)", "Al Zawya - Screen 2 (right side)"]],
    ["Al Zawaya Combined", ["Al Zawya - Screen 1 (center)", "Al Zawya - Screen 2 (right side)"]],
    ["Zawaya Combined", ["Al Zawya - Screen 1 (center)", "Al Zawya - Screen 2 (right side)"]],
    ["Boursa Combined", ["Boursa (small)", "Boursa (big)"]],
    ["Boursa Full", ["Boursa (small)", "Boursa (big)"]],
    ["Platinum Screen", ["Platinum Square"]],
    ["Platinum Square Combined", ["Platinum Square"]],
    ["Marina Crescent Sync Combined", ["Marina - Crescent Sync"]],
    ["Marina Palms Full", ["Marina - Palm Trees (6 screens)"]],
    ["Murouj Wall AB", ["Murouj-Wall Screens"]],
    ["Murouj Wall C", ["Murouj-Wall Screens"]],
    ["Mourouj Wall", ["Murouj-Wall Screens"]],
    ["Mourouj Walls", ["Murouj-Wall Screens"]],
    ["Piccadilly Sync", ["Piccadilly"]],
    ["Topaz Sync", ["Topaz (Sync)"]],
    ["The Avenues Topaz Sync", ["Topaz (Sync)"]]
  ].map(([a, t]) => [normalizeScreenName(a), t]));
  function findPastedPresetIndexes(target, presets) {
    const t = normalizeScreenName(target), exact = [], partial = [];
    presets.forEach((p, i) => {
      const n = normalizeScreenName(p.name);
      if (n === t) exact.push(i);
      else if (t.length >= 4 && n && (n.includes(t) || t.includes(n))) partial.push(i);
    });
    return exact.length ? exact : partial.length === 1 ? partial : [];
  }
  var WXH = /(\d{2,5})\s*[xX×*]\s*(\d{2,5})/;
  function matchPastedScreens(text, presets) {
    const out = [], sel = /* @__PURE__ */ new Set();
    for (const raw of parsePastedScreenNames(text)) {
      const m = WXH.exec(raw), size = m ? [+m[1], +m[2]] : void 0;
      const name = (m ? raw.replace(m[0], " ") : raw).replace(/\t+/g, " ").replace(/\b(px|pixels?)\b/gi, " ").replace(/\s+/g, " ").replace(/[\s\-–:|(]+$/, "").trim();
      const L = { line: raw, name, size, matched: [], how: "none" };
      const cand = [raw, name].filter((s, i, a) => s && a.indexOf(s) === i);
      for (const c of cand) {
        const alias = PASTE_SELECTION_ALIASES[normalizeScreenName(c)];
        if (alias) {
          const ids = alias.flatMap((t) => findPastedPresetIndexes(t, presets));
          const own = presets.findIndex((p) => normalizeScreenName(p.name) === normalizeScreenName(c));
          if (own >= 0) ids.push(own);
          if (ids.length) {
            L.matched = [...new Set(ids)];
            L.how = "alias";
            break;
          }
        }
        if (c === name && !name) continue;
        const nameOnly = c === raw && m ? null : c;
        if (nameOnly && normalizeScreenName(nameOnly)) {
          const ids = findPastedPresetIndexes(nameOnly, presets);
          if (ids.length) {
            L.matched = ids;
            L.how = "name";
            break;
          }
        }
      }
      if (!L.matched.length && size) {
        const ids = presets.map((p, i) => p.w === size[0] && p.h === size[1] ? i : -1).filter((i) => i >= 0);
        if (ids.length === 1) {
          L.matched = ids;
          L.how = "size";
        } else if (ids.length > 1) L.candidates = ids;
      }
      L.matched.forEach((i) => sel.add(i));
      out.push(L);
    }
    return { lines: out, selected: [...sel], unmatched: out.filter((l) => !l.matched.length) };
  }
  var DEFAULT_PRODUCT_GAP = 0.02;
  var allowsOverlap = (name, opt) => !!opt || /(^|[\s.@])overlap\b/i.test(name);
  var hit = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  function avoidRect(r, obstacle, W, H, margin, gap) {
    const o = { x: obstacle.x - gap, y: obstacle.y - gap, w: obstacle.w + 2 * gap, h: obstacle.h + 2 * gap };
    if (!hit(r, o)) return { r, scale: 1, how: "none" };
    const F = { x0: margin, y0: margin, x1: W - margin, y1: H - margin };
    const bands = [
      { x0: F.x0, y0: F.y0, x1: F.x1, y1: Math.min(F.y1, o.y) },
      // above
      { x0: F.x0, y0: Math.max(F.y0, o.y + o.h), x1: F.x1, y1: F.y1 },
      // below
      { x0: F.x0, y0: F.y0, x1: Math.min(F.x1, o.x), y1: F.y1 },
      // left
      { x0: Math.max(F.x0, o.x + o.w), y0: F.y0, x1: F.x1, y1: F.y1 }
      // right
    ].filter((b) => b.x1 - b.x0 > 1 && b.y1 - b.y0 > 1);
    let best = null;
    for (const b of bands) {
      const s = Math.min(1, (b.x1 - b.x0) / r.w, (b.y1 - b.y0) / r.h), w = r.w * s, h = r.h * s;
      const cx = Math.min(Math.max(r.x + (r.w - w) / 2, b.x0), b.x1 - w), cy = Math.min(Math.max(r.y + (r.h - h) / 2, b.y0), b.y1 - h);
      const cand = { x: cx, y: cy, w, h }, cost = (1 - s) * 1e6 + Math.hypot(cx - r.x, cy - r.y);
      if (!hit(cand, o) && (!best || cost < best.cost)) best = { r: cand, scale: s, cost };
    }
    if (!best) return { r, scale: 1, how: "impossible" };
    return { r: best.r, scale: best.scale, how: best.scale < 0.999 ? "shrink" : "move" };
  }
  function rectGap(a, b) {
    const dx = Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w)), dy = Math.max(0, Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h));
    return hit(a, b) ? 0 : Math.hypot(dx, dy);
  }
  var txt = (hl, of, cta, hMax, oMax, ctaAlign = "center") => ({ role: "text", size: 0, sub: [{ role: "headline", size: hl, maxLines: hMax }, { role: "offer", size: of, maxLines: oMax }, ...cta ? [{ role: "cta", size: cta, align: ctaAlign }] : []] });
  var TEMPLATES = {
    xw: {
      cls: "xw",
      axis: "x",
      gapU: 3,
      opticalLift: 0,
      fill: [0.35, 0.8],
      hierarchy: 1.6,
      minHeadlinePct: 0.3,
      minOfferPct: 0.14,
      kashida: true,
      // ribbon playbook: headline ONE line, cap ≈40–55% of strip height, anchored in the central third; zones mirror in Arabic
      slots: [{ role: "logo", size: 0.09, cross: 0.6 }, { role: "headline", size: 0.48, maxLines: 1 }, { role: "product", size: 0.19, cross: 1 }, { role: "offer", size: 0.13, maxLines: 2, cross: 0.6 }, { role: "cta", size: 0.07, cross: 0.85 }]
    },
    uw: {
      cls: "uw",
      axis: "x",
      gapU: 4.5,
      opticalLift: 0,
      fill: [0.35, 0.8],
      hierarchy: 1.6,
      minHeadlinePct: 0.18,
      minOfferPct: 0.08,
      kashida: true,
      slots: [{ role: "logo", size: 0.1, cross: 0.45 }, { ...txt(0.6, 0.3, 0, 2, 1), size: 0.44 }, { role: "product", size: 0.27, cross: 1 }, { role: "cta", size: 0.12, cross: 0.8 }]
    },
    h: {
      cls: "h",
      axis: "x",
      gapU: 2,
      opticalLift: 0.02,
      fill: [0.35, 0.8],
      hierarchy: 1.7,
      minHeadlinePct: 0.09,
      minOfferPct: 0.04,
      kashida: true,
      slots: [{ role: "product", size: 0.42, cross: 0.92 }, { ...txt(0.38, 0.17, 0.3, 2, 2, "end"), size: 0.58, sub: [{ role: "logo", size: 0.12, align: "end" }, { role: "headline", size: 0.36, maxLines: 2 }, { role: "offer", size: 0.16, maxLines: 2 }, { role: "cta", size: 0.28, align: "end" }] }]
    },
    sq: {
      cls: "sq",
      axis: "y",
      gapU: 1.5,
      opticalLift: 0.02,
      fill: [0.35, 0.8],
      hierarchy: 1.7,
      minHeadlinePct: 0.08,
      minOfferPct: 0.035,
      kashida: false,
      slots: [{ role: "logo", size: 0.09, align: "start" }, { role: "product", size: 0.44 }, { role: "headline", size: 0.2, maxLines: 2 }, { role: "offer", size: 0.09, maxLines: 2 }, { role: "cta", size: 0.14, align: "end" }]
    },
    v: {
      cls: "v",
      axis: "y",
      gapU: 1.5,
      opticalLift: 0.02,
      fill: [0.35, 0.8],
      hierarchy: 1.8,
      minHeadlinePct: 0.1,
      minOfferPct: 0.045,
      kashida: false,
      slots: [{ role: "logo", size: 0.07 }, { role: "headline", size: 0.22, maxLines: 3 }, { role: "product", size: 0.4 }, { role: "offer", size: 0.1, maxLines: 3 }, { role: "cta", size: 0.13 }]
    },
    uv: {
      cls: "uv",
      axis: "y",
      gapU: 1.5,
      opticalLift: 0.01,
      fill: [0.35, 0.8],
      hierarchy: 1.8,
      minHeadlinePct: 0.14,
      minOfferPct: 0.06,
      kashida: false,
      slots: [{ role: "logo", size: 0.06 }, { role: "headline", size: 0.26, maxLines: 4 }, { role: "product", size: 0.32 }, { role: "offer", size: 0.14, maxLines: 4 }, { role: "cta", size: 0.12 }]
    },
    // tall-column playbook: top ~20% brand · middle ~50% headline + hero (eye level) · lower ~25% offer + CTA; nothing critical at the very top/bottom
    xv: {
      cls: "xv",
      axis: "y",
      gapU: 1,
      opticalLift: 0,
      fill: [0.35, 0.8],
      hierarchy: 1.8,
      minHeadlinePct: 0.16,
      minOfferPct: 0.07,
      kashida: false,
      slots: [{ role: "spacer", size: 4e-3 }, { role: "logo", size: 0.032 }, { role: "spacer", size: 0.21 }, { role: "headline", size: 0.14, maxLines: 4 }, { role: "product", size: 0.25 }, { role: "offer", size: 0.07, maxLines: 3 }, { role: "cta", size: 0.12 }, { role: "spacer", size: 0.11 }]
    }
  };
  var fitAspect = (box, aspect, align = "center", crossAxis = "x") => {
    let w = box.w, h = w / aspect;
    if (h > box.h) {
      h = box.h;
      w = h * aspect;
    }
    const off = (free) => align === "start" ? 0 : align === "end" ? free : free / 2;
    return { x: box.x + (crossAxis === "x" ? off(box.w - w) : (box.w - w) / 2), y: box.y + (crossAxis === "y" ? off(box.h - h) : (box.h - h) / 2), w, h };
  };
  function stack(slots, box, axis, gap) {
    const total = slots.reduce((a, s) => a + s.size, 0) || 1, L = (axis === "x" ? box.w : box.h) - gap * (slots.length - 1);
    let p = axis === "x" ? box.x : box.y;
    const out = [];
    for (const s of slots) {
      const len = s.size / total * L, cr = s.cross ?? 1;
      const r = axis === "x" ? { x: p, y: box.y + box.h * (1 - cr) / 2, w: len, h: box.h * cr } : { x: box.x + box.w * (1 - cr) / 2, y: p, w: box.w * cr, h: len };
      out.push([s, r]);
      p += len + gap;
    }
    return out;
  }
  function keepClear(r, obstacles, W, H, margin, gap) {
    const free = (q) => q.x >= margin - 0.5 && q.y >= margin - 0.5 && q.x + q.w <= W - margin + 0.5 && q.y + q.h <= H - margin + 0.5 && obstacles.every((o) => rectGap(q, o) >= gap - 0.5);
    if (free(r)) return { r, how: "none" };
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    for (const k of [1, 0.9, 0.8, 0.7, 0.6]) {
      const w = r.w * k, h = r.h * k, cands = [];
      const N = 12;
      for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) cands.push({ x: margin + (W - 2 * margin - w) * i / N, y: margin + (H - 2 * margin - h) * j / N, w, h });
      const ok = cands.filter(free).sort((a, b) => Math.hypot(a.x + w / 2 - cx, a.y + h / 2 - cy) - Math.hypot(b.x + w / 2 - cx, b.y + h / 2 - cy));
      if (ok.length) return { r: ok[0], how: k === 1 ? "move" : "shrink" };
    }
    return { r, how: "impossible" };
  }
  var leadingFor = (text) => /[\u0600-\u06FF]/.test(text) ? 1.4 : 1.12;
  var spacingU = (H) => Math.max(8, Math.round(0.25 * H));
  var SPACING = { headSub: 1.2, subCta: 3, headHero: [2, 4], heroMinH: 0.5, logoHead: 6, logoClear: 0.5, ctaLegal: 0.5, groupRatio: 2, zoneGap: [2, 3], repeatGap: 2, repeatGroup: 4, bilingual: 4, trackEn: [0, 0.01], trackAr: 0, leadEn: [1.1, 1.2], leadAr: [1.3, 1.5] };
  function spacingTable(H, logoH = 0, ctaH = 0) {
    const U = spacingU(H);
    return { U, headlineToSubline: 1.2 * U, sublineToCta: 3 * U, headlineToHero: [Math.max(2 * U, 0.5 * H), 4 * U], logoToHeadline: Math.max(6 * U, logoH), logoClear: 0.5 * logoH, ctaToLegal: 0.5 * ctaH, zoneGap: [2 * U, 3 * U], repeatGap: 2 * U, repeatGroupGap: 4 * U, bilingualGap: Math.max(4 * U, H) };
  }
  function ctaButton(H, label, measure, rtl = false) {
    const t = 0.5 * H, padY = 0.5 * t, padX = 1 * t, arrow = 0.6 * t, gap = 0.4 * t, tw = measure(label) * t;
    return { textSize: t, padX, padY, h: 2 * t, w: tw + 2 * padX + gap + arrow, arrowSide: rtl ? "left" : "right", arrowPoints: rtl ? "left" : "right", arrowGap: gap };
  }
  function priceBlock(numberSize, hasOld = false) {
    return { numberSize, currencyGap: 0.2 * numberSize, currencyGapRange: [0.15 * numberSize, 0.25 * numberSize], noWrap: true, oldSize: hasOld ? 0.5 * numberSize : void 0, oldGap: hasOld ? 0.3 * numberSize : void 0 };
  }
  var KASHIDA_CLASSES = ["xw", "uw", "h"];
  var kashidaAllowed = (cls, role, lines) => role === "headline" && lines === 1 && KASHIDA_CLASSES.includes(cls);
  function scrimAlpha(Lt, Lb, need) {
    if ((Math.max(Lt, Lb) + 0.05) / (Math.min(Lt, Lb) + 0.05) >= need) return 0;
    const target = (Lt + 0.05) / need - 0.05;
    if (target <= 0) return 0.85;
    return Math.min(0.85, Math.max(0.2, 1 - Math.pow(target / Math.max(1e-4, Lb), 1 / 2.2) + 0.05));
  }
  function pairFonts(en, ar, arGrow, enGrow) {
    let E = en, A = ar;
    if (A < 1.1 * E) {
      A = Math.min(ar * arGrow, 1.12 * E);
      if (A < 1.1 * E) E = A / 1.12;
    } else if (A > 1.15 * E) {
      E = Math.min(en * enGrow, A / 1.12);
      if (A > 1.15 * E) A = 1.15 * E;
    }
    return { en: E, ar: A };
  }
  var growCap = (c) => {
    const t = c.text.headline;
    return t ? Math.max(1, Math.min(t.box.w / Math.max(1, t.r.w), t.box.h / Math.max(1, t.r.h))) : 1;
  };
  function scaleHeadline(c, k, lead) {
    const t = c.text.headline;
    if (!t || Math.abs(k - 1) < 5e-3) return;
    const w = t.r.w * k, h = t.r.h * k;
    const x = t.align === "center" ? t.r.x + (t.r.w - w) / 2 : t.align === "end" ? t.r.x + t.r.w - w : t.r.x;
    const y = k > 1 ? Math.max(t.box.y, t.r.y - (h - t.r.h) / 2) : t.r.y + (t.r.h - h) / 2;
    const oldBottom = t.r.y + t.r.h;
    t.font *= k;
    t.r = { x, y, w, h };
    c.rects.headline = t.r;
    const O = c.text.offer;
    if (O && O.r.y >= oldBottom - 2 * spacingU(t.font / k) && O.r.y - oldBottom <= 2 * spacingU(t.font / k) && O.r.x < x + w && O.r.x + O.r.w > x) {
      const pad = (f) => Math.max(0, (lead - 0.7) / 2) * f, ny = y + h - pad(t.font) - pad(O.font) + SPACING.headSub * spacingU(t.font);
      O.r = { ...O.r, y: ny };
      O.box = { ...O.box, y: ny };
      c.rects.offer = O.r;
    }
    if (O && k < 1) {
      const ox = O.align === "end" ? O.r.x + O.r.w * (1 - k) : O.align === "center" ? O.r.x + O.r.w * (1 - k) / 2 : O.r.x;
      O.font *= k;
      O.r = { ...O.r, x: ox, w: O.r.w * k, h: O.r.h * k };
      c.rects.offer = O.r;
    }
    const hier = c.tpl.hierarchy;
    if (O && O.font > t.font / hier) {
      const kk = t.font / hier / O.font;
      O.font *= kk;
      O.r = { ...O.r, w: O.r.w * kk, h: O.r.h * kk };
      c.rects.offer = O.r;
    }
  }
  var ELEMENT_RANK = { logo: 1, headline: 1, product: 1, offer: 1, cta: 2, subline: 3, badge: 4, legal: 5 };
  var SCREEN_FAMILIES = [
    { key: "ultra", label: "Ultra-ribbon", min: 10, max: Infinity, anchor: { name: "Hawally Gate", w: 5832, h: 432 }, strategy: "one short line, single row; subline/legal to second beat or end frame" },
    { key: "ribbon", label: "Ribbon", min: 6, max: 10, anchor: { name: "Boulevard Bridge", w: 3584, h: 384 }, strategy: "one-line headline (2 if height \u2265800px), 4 zones, one offer" },
    { key: "shortRibbon", label: "Short ribbon", min: 5, max: 6, anchor: { name: "Marina - Balcony One", w: 1200, h: 240 }, strategy: "compact row, very short headline" },
    { key: "banner", label: "Banner", min: 3, max: 5, anchor: { name: "Baitak", w: 2624, h: 608 }, strategy: "split: text one side, hero other; headline 2 lines" },
    { key: "panoramic", label: "Panoramic wide", min: 2, max: 3, anchor: { name: "Al Nassar Tower", w: 2688, h: 1152 }, strategy: "split, headline 2\u20133 lines, subline allowed" },
    { key: "wide", label: "Standard wide", min: 1.55, max: 2, anchor: { name: "1.7HD", w: 1920, h: 1080 }, strategy: "recompose from the master" },
    { key: "classic", label: "Classic 4:3-ish", min: 1.25, max: 1.55, anchor: { name: "Platinum Square", w: 1440, h: 1008 }, strategy: "split, taller text block" },
    { key: "square", label: "Square-ish", min: 0.85, max: 1.25, anchor: { name: "Al Hamra Mall - Outdoor Screen", w: 1840, h: 1740 }, strategy: "centred stack" },
    { key: "portrait", label: "Portrait", min: 1 / 1.8, max: 0.85, anchor: { name: "360 OvalScreen", w: 1080, h: 1920 }, strategy: "vertical stack, hero centre band" },
    { key: "tall", label: "Tall column", min: 1 / 4.5, max: 1 / 1.8, anchor: { name: "Marina - Palm Trees (6 screens)", w: 240, h: 960 }, strategy: "eye-level band, 1\u20133 words per line" },
    { key: "xtall", label: "Extreme tall", min: 0, max: 1 / 4.5, anchor: { name: "Al Nassar Tower Vertical", w: 960, h: 5328 }, strategy: "key message in the eye-level band; fill the length" }
  ];
  function screenFamily(w, h) {
    const r = w / h, f = SCREEN_FAMILIES.find((x) => r >= x.min - 1e-9 && r < x.max) || SCREEN_FAMILIES[SCREEN_FAMILIES.length - 1];
    const ar = f.anchor.w / f.anchor.h, dev = Math.abs(r / ar - 1), special = Math.min(w, h) <= 240 || w * h > 89e5 || w % 2 === 1 || h % 2 === 1;
    const tier = w === f.anchor.w && h === f.anchor.h ? 1 : dev <= 0.15 && !special ? 2 : 3;
    return { ...f, ratio: r, deviation: dev, tier };
  }
  function contentLadder(w, h, roles) {
    const f = screenFamily(w, h), thin = ["ultra", "ribbon", "shortRibbon"].includes(f.key), drop = [];
    roles.forEach((r) => {
      const k = ELEMENT_RANK[r] ?? 4;
      if (k <= 1) return;
      if (r === "legal" && (thin || f.key === "tall" || f.key === "xtall")) drop.push({ role: r, to: "end frame" });
      else if ((r === "subline" || r === "badge") && thin) drop.push({ role: r, to: f.key === "ultra" ? "second beat" : "removed" });
      else if (r === "badge" && (f.key === "tall" || f.key === "xtall" || f.key === "banner")) drop.push({ role: r, to: "later frame" });
    });
    const gone = new Set(drop.map((d) => d.role));
    return { family: f.key, keep: roles.filter((r) => !gone.has(r)), drop, ctaShort: thin };
  }
  function viewingSize(distanceM, pitchMm, mode = "comfortable") {
    const div = mode === "comfortable" ? 120 : mode === "minimum" ? 200 : 300;
    const capMm = distanceM * 1e3 / div, capPx = capMm / pitchMm, fontPx = capPx / 0.7;
    return { capMm, capPx, fontPx, arFontPx: fontPx * 1.12 };
  }
  function intakeChecks(i) {
    const out = [], mp = i.w * i.h / 1e6, fps = i.fps || 25;
    if (i.w % 2 || i.h % 2) out.push({ level: "warn", msg: `odd size ${i.w}\xD7${i.h}: ask the media owner (next even size or pad)` });
    const codec = mp > 8.9 ? "H.265 Level 6 or split into tiles (confirm)" : Math.max(i.w, i.h) > 4096 ? "H.265 (confirm player)" : "H.264 (H.265 optional)", hevc = codec.startsWith("H.265"), bpp = hevc ? [0.08, 0.14] : [0.12, 0.2];
    out.push({ level: mp > 8.9 ? "warn" : "info", msg: `${mp.toFixed(2)} MP \u2192 ${codec}; bitrate \u2248 ${(mp * fps * bpp[0]).toFixed(1)}\u2013${(mp * fps * bpp[1]).toFixed(1)} Mbps @${fps}fps` });
    if (i.arabicCopy === false) out.push({ level: "block", msg: "Arabic copy not supplied: blocker for AR versions" });
    else if (i.arabicApproved === false) out.push({ level: "warn", msg: "Arabic copy not approved by a native writer" });
    if (i.layered === false) out.push({ level: "warn", msg: "flat master: text must be rebuilt as live text (takes longer)" });
    if (i.heroPx && i.placedPx) {
      const up = Math.max(i.placedPx.w / i.heroPx.w, i.placedPx.h / i.heroPx.h);
      if (up > 1.2) out.push({ level: "warn", msg: `hero upscaled ${(up * 100).toFixed(0)}% (>120%): request the original` });
    }
    const f = screenFamily(i.w, i.h);
    if (f.tier === 3) out.push({ level: "info", msg: `tier 3 (special) in ${f.label}: individual treatment` });
    if (i.distanceM && i.pitchMm) {
      const v = viewingSize(i.distanceM, i.pitchMm);
      out.push({ level: "info", msg: `headline \u2248${Math.round(v.fontPx)}px EN / ${Math.round(v.arFontPx)}px AR for ${i.distanceM} m at ${i.pitchMm} mm pitch` });
    }
    return out;
  }
  function compose(inp) {
    const once = (i) => {
      const c1 = composeOnce(i);
      const H = c1.text.headline?.font;
      if (!H) return c1;
      const U = spacingU(H), c2 = composeOnce(i, U);
      c2.U = spacingU(c2.text.headline?.font || H);
      return c2;
    };
    const own = once(inp);
    if (!inp.pair || !own.text.headline) return own;
    const other = once({ ...inp, texts: inp.pair.texts, measure: inp.pair.measure, rtl: !inp.rtl, pair: void 0 });
    if (!other.text.headline) return own;
    const isAr = /[\u0600-\u06FF]/.test(inp.texts.headline), en = isAr ? other : own, ar = isAr ? own : other, lead = leadingFor(inp.texts.headline + inp.texts.offer);
    const f = pairFonts(en.text.headline.font, ar.text.headline.font, growCap(ar), growCap(en)), want = isAr ? f.ar : f.en, k = want / own.text.headline.font;
    scaleHeadline(own, k, lead);
    own.U = spacingU(own.text.headline.font);
    own.pairNote = `AR/EN headline ${(f.ar / f.en * 100).toFixed(0)}% (target 110\u2013115%)`;
    return own;
  }
  function composeOnce(inp, U0) {
    const { tw, th } = inp, cls = targetOrient(tw, th), base = inp.template || TEMPLATES[cls], short = Math.min(tw, th);
    const u = short * 0.02, margin = inp.margin ?? short * (cls === "xw" || cls === "uw" || cls === "xv" ? 0.09 : cls === "uv" ? 0.08 : DEFAULTS.SAFE_MARGIN_PCT);
    const lead = leadingFor(inp.texts.headline + inp.texts.offer);
    const keep = (s) => {
      if (s.sub) {
        const sub = s.sub.map(keep).filter(Boolean);
        return sub.length ? { ...s, sub } : null;
      }
      return s.role === "spacer" || !inp.roles || inp.roles.includes(s.role) ? s : null;
    };
    let slots = base.slots.map(keep).filter(Boolean);
    if (inp.rtl && base.axis === "x") slots = slots.slice().reverse();
    const safe = { x: margin, y: margin, w: tw - 2 * margin, h: th - 2 * margin };
    const out = { cls, u, margin, rects: {}, text: {}, tpl: base };
    const flipAlign = (a) => !inp.rtl || !a || a === "center" ? a || "center" : a === "start" ? "end" : "start";
    const place = (s, r, inText) => {
      if (s.role === "product") out.rects.product = fitAspect(r, inp.productAspect, "center");
      else if (s.role === "logo") {
        let lr = fitAspect(r, inp.logoAspect, flipAlign(s.align), "x");
        const k = Math.min(1, 0.5 * tw / lr.w, 0.25 * th / lr.h);
        lr = { ...lr, w: lr.w * k, h: lr.h * k };
        out.rects.logo = lr;
      } else if (s.role === "cta") {
        const d = Math.min(r.w, r.h), a = flipAlign(s.align);
        const x = a === "start" ? r.x : a === "end" ? r.x + r.w - d : r.x + (r.w - d) / 2;
        out.rects.cta = { x, y: r.y + (r.h - d) / 2, w: d, h: d };
      } else if (s.role === "headline" || s.role === "offer") {
        const c = chunkToBox(inp.texts[s.role], r.w, r.h, inp.measure[s.role], s.role === "headline" && inp.headlineMaxLines || s.maxLines || 2, lead);
        const align = inText || base.axis === "x" ? inp.rtl ? "end" : "start" : "center";
        out.text[s.role] = { r: { x: r.x, y: r.y, w: r.w, h: c.lines.length * c.font * lead }, box: r, font: c.font, lines: c.lines, align };
        out.rects[s.role] = out.text[s.role].r;
      }
    };
    if (inp.libZones) {
      const Z = inp.libZones.zones, rib = inp.libZones.ribbon, full = (z) => z[0] * tw <= margin * 1.5 && z[2] * tw >= tw - margin * 1.5;
      const zr = (z) => {
        let x0 = z[0] * tw, x1 = z[2] * tw;
        if (inp.rtl && !full(z)) [x0, x1] = [tw - x1, tw - x0];
        if (U0 && rib && !full(z) && z !== Z.headline) {
          const ins = Math.min(U0, 0.15 * (x1 - x0));
          if (x0 > margin * 1.5) x0 += ins;
          if (x1 < tw - margin * 1.5) x1 -= ins;
        }
        return rib ? { x: x0, y: margin, w: x1 - x0, h: th - 2 * margin } : { x: x0, y: z[1] * th, w: x1 - x0, h: (z[3] - z[1]) * th };
      };
      const has = (r) => !inp.roles || inp.roles.includes(r), hl = Z.headline && zr(Z.headline);
      if (Z.logo && has("logo")) place({ role: "logo", size: 0, align: "start" }, zr(Z.logo), false);
      if (Z.product && has("product")) place({ role: "product", size: 0 }, zr(Z.product), false);
      let ctaR = Z.cta ? zr(Z.cta) : void 0, offR = Z.offer ? zr(Z.offer) : void 0;
      if (!offR && ctaR && rib) {
        const w1 = ctaR.w * 0.55, g = u;
        offR = inp.rtl ? { ...ctaR, x: ctaR.x + ctaR.w - w1, w: w1 } : { ...ctaR, w: w1 };
        ctaR = inp.rtl ? { ...ctaR, w: ctaR.w - w1 - g } : { ...ctaR, x: ctaR.x + w1 + g, w: ctaR.w - w1 - g };
      }
      const P0 = out.rects.product;
      if (rib && offR && P0 && Z.product) {
        const pz = zr(Z.product), g2 = Math.max(2 * (U0 || u), u);
        if (!inp.rtl && pz.x + pz.w <= offR.x + 1) {
          const nx = pz.x;
          out.rects.product = { ...P0, x: nx };
          const ox = nx + P0.w + g2;
          if (ox < offR.x) offR = { ...offR, x: ox, w: offR.x + offR.w - ox };
        } else if (inp.rtl && pz.x >= offR.x + offR.w - 1) {
          const nx = pz.x + pz.w - P0.w;
          out.rects.product = { ...P0, x: nx };
          const oe = nx - g2;
          if (oe > offR.x + offR.w) offR = { ...offR, w: oe - offR.x };
        }
      }
      let hR = hl;
      if (!offR && hl) {
        const h1 = hl.h * 0.62;
        hR = { ...hl, h: h1 };
        offR = { ...hl, y: hl.y + h1 + u, h: hl.h - h1 - u };
      }
      if (hR && has("headline")) place({ role: "headline", size: 0, maxLines: rib ? tw / th >= 8 ? 1 : 2 : 4 }, hR, true);
      if (offR && has("offer")) place({ role: "offer", size: 0, maxLines: 3 }, offR, true);
      if (ctaR && has("cta")) place({ role: "cta", size: 0, align: rib ? "center" : "start" }, ctaR, false);
      slots = [];
      const L = out.rects.logo, HF = out.text.headline?.font;
      if (L && HF && L.h > HF * 0.95) {
        const k = HF * 0.95 / L.h, nw = L.w * k;
        out.rects.logo = { x: inp.rtl ? L.x + L.w - nw : L.x, y: L.y, w: nw, h: L.h * k };
      }
    }
    const L0 = base.axis === "x" ? safe.w : safe.h, nG = Math.max(1, slots.length - 1), gMain = U0 ? Math.min((base.axis === "x" ? 2 : 3) * U0, 0.3 * L0 / nG) : base.gapU * u;
    for (const [s, r] of stack(slots, safe, base.axis, gMain)) {
      if (s.role === "text" && s.sub) {
        const sub = stack(s.sub, r, "y", U0 ? SPACING.headSub * U0 : u * 4);
        const used = sub.reduce((a, [, rr]) => a + rr.h, 0) + u * 1.2 * (sub.length - 1);
        const dy = (r.h - used) / 2 - base.opticalLift * th;
        sub.forEach(([ss, rr]) => place(ss, { ...rr, y: rr.y + Math.max(0, dy) }, true));
      } else place(s, r, false);
    }
    const H = out.text.headline, O = out.text.offer;
    if (H && O && O.font > H.font / base.hierarchy) {
      const f = H.font / base.hierarchy, k = f / O.font;
      O.font = f;
      O.r = { ...O.r, h: O.r.h * k };
      out.rects.offer = O.r;
    }
    for (const id of ["headline", "offer"]) {
      const t = out.text[id];
      if (!t) continue;
      const wide = Math.max(...t.lines.map((l) => inp.measure[id](l) * t.font));
      if (wide < t.r.w) {
        const x = t.align === "center" ? t.r.x + (t.r.w - wide) / 2 : t.align === "end" ? t.r.x + t.r.w - wide : t.r.x;
        t.r = { ...t.r, x, w: wide };
        out.rects[id] = t.r;
      }
    }
    if (H && O) {
      const u1 = Math.max(1, Math.round(short * 0.01)) + 0.25, pad = (f) => Math.max(0, (lead - 0.7) / 2) * f, ny = H.r.y + H.r.h - pad(H.font) - pad(O.font) + (U0 ? SPACING.headSub * U0 : 2 * u1);
      const blocked = Object.entries(out.rects).some(([k, r]) => k !== "headline" && k !== "offer" && r && r.y >= H.r.y + H.r.h - 1 && r.y + r.h <= O.r.y + 1 && r.x < Math.max(H.r.x + H.r.w, O.r.x + O.r.w) && r.x + r.w > Math.min(H.r.x, O.r.x));
      const nr = { ...O.r, y: ny }, hits = Object.entries(out.rects).some(([k, r]) => k !== "headline" && k !== "offer" && r && rectGap(nr, r) < 0.5 && !(r.y + r.h <= O.r.y)) || ny + O.r.h > th - margin + 0.5;
      if (!blocked && O.r.y > H.r.y && (ny < O.r.y || U0 && !hits)) {
        O.r = nr;
        O.box = { ...O.box, y: ny };
        out.rects.offer = O.r;
      }
    }
    {
      const Lg = out.rects.logo, Hh = out.text.headline;
      if (U0 && Lg && Hh && Lg.x < Hh.r.x + Hh.r.w && Hh.r.x < Lg.x + Lg.w && Lg.y + Lg.h <= Hh.r.y + 1) {
        const g = Hh.r.y - Lg.y - Lg.h, need = Math.max(SPACING.logoHead * U0, Lg.h);
        if (g < need) {
          const nh = Math.max(Lg.h * 0.85, 0.065 * short, Math.min(Lg.h, Lg.h - (Math.max(SPACING.logoHead * U0, 0) - g))), k = nh / Lg.h, nw = Lg.w * k, ax = Lg.x + Lg.w / 2 > tw * 0.6 ? Lg.x + Lg.w - nw : Lg.x + Lg.w / 2 < tw * 0.4 ? Lg.x : Lg.x + (Lg.w - nw) / 2;
          out.rects.logo = { x: ax, y: Lg.y, w: nw, h: nh };
        }
      }
    }
    if (out.rects.cta) {
      const obs = [out.text.headline?.r, out.text.offer?.r, out.rects.product, out.rects.logo].filter(Boolean);
      const g = Math.max((inp.gap ?? DEFAULT_PRODUCT_GAP) * short, U0 || 0), kc = keepClear(out.rects.cta, obs, tw, th, margin, g);
      out.rects.cta = kc.r;
      out.ctaHow = kc.how;
    }
    return out;
  }
  function composeFaces(inp, faces) {
    if (!faces || faces.length < 2) return [{ face: { x: 0, y: 0, w: inp.tw, h: inp.th }, c: compose(inp), hero: true }];
    const heroI = faces.reduce((b, f, i) => f.w * f.h > faces[b].w * faces[b].h ? i : b, 0);
    return faces.map((f, i) => {
      const c = compose({ ...inp, libZones: void 0, tw: f.w, th: f.h, roles: i === heroI ? void 0 : ["logo", "cta", "offer"] });
      const sh = (r) => ({ ...r, x: r.x + f.x, y: r.y + f.y });
      Object.keys(c.rects).forEach((k) => c.rects[k] = sh(c.rects[k]));
      Object.keys(c.text).forEach((k) => {
        c.text[k].r = sh(c.text[k].r);
        c.text[k].box = sh(c.text[k].box);
      });
      return { face: f, c, hero: i === heroI };
    }).map((o, _i, all) => {
      const hero = all.find((a) => a.hero).c.text.offer, t = o.c.text.offer;
      if (!o.hero && t && hero && t.font > hero.font) {
        const k = hero.font / t.font;
        t.font = hero.font;
        t.r = { ...t.r, w: t.r.w * k, h: t.r.h * k };
      }
      if (!o.hero && t) {
        const m = o.c.margin, ix0 = o.face.x + m, ix1 = o.face.x + o.face.w - m;
        if (t.r.w > ix1 - ix0) {
          const k = (ix1 - ix0) / t.r.w;
          t.font *= k;
          t.r = { ...t.r, w: t.r.w * k, h: t.r.h * k };
        }
        const x = t.align === "center" ? (ix0 + ix1 - t.r.w) / 2 : t.align === "end" ? ix1 - t.r.w : ix0;
        t.r = { ...t.r, x: Math.min(Math.max(x, ix0), ix1 - t.r.w) };
        t.box = { ...t.box, x: ix0, w: ix1 - ix0 };
        o.c.rects.offer = t.r;
        if (o.c.rects.cta) {
          const obs = [t.r, o.c.rects.logo].filter(Boolean);
          o.c.rects.cta = keepClear(o.c.rects.cta, obs, inp.tw, inp.th, 0, (inp.gap ?? DEFAULT_PRODUCT_GAP) * Math.min(o.face.w, o.face.h)).r;
        }
      }
      return o;
    });
  }
  var RUBRIC_WEIGHTS = { hierarchy: 0.18, legibility: 0.22, fill: 0.14, balance: 0.12, gaps: 0.14, brand: 0.1, rtl: 0.1 };
  function coverage(rs, W, H, m) {
    const N = 96, sw = (W - 2 * m) / N, sh = (H - 2 * m) / N;
    let n = 0;
    for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) {
      const px = m + (a + 0.5) * sw, py = m + (b + 0.5) * sh;
      if (rs.some((r) => px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h)) n++;
    }
    return n / (N * N);
  }
  function designScore(i) {
    const t = i.tpl || TEMPLATES[i.cls], short = Math.min(i.tw, i.th), u = short * 0.02, c = (v) => Math.max(0, Math.min(1, v));
    const S = { hierarchy: 1, legibility: 1, fill: 1, balance: 1, gaps: 1, brand: 1, rtl: 1 }, notes = [];
    if (i.headline && i.offer) {
      S.hierarchy = c(i.headline.font / i.offer.font / t.hierarchy);
      if (S.hierarchy < 1) notes.push(`headline/offer ratio ${(i.headline.font / i.offer.font).toFixed(2)} < ${t.hierarchy}`);
    }
    if (i.headline) {
      const l = i.headline.font / (t.minHeadlinePct * short);
      const o = i.offer ? i.offer.font / (t.minOfferPct * short) : 1;
      S.legibility = c(Math.min(l, o));
      if (l < 1) notes.push(`headline ${Math.round(i.headline.font)}px < ${Math.round(t.minHeadlinePct * short)}px for viewing distance`);
      if (o < 1) notes.push("offer below min size");
    }
    const items = [i.headline?.r, i.offer?.r, i.logo, i.product, i.cta].filter(Boolean);
    if (items.length) {
      const x0 = Math.min(...items.map((r) => r.x)), y0 = Math.min(...items.map((r) => r.y)), x1 = Math.max(...items.map((r) => r.x + r.w)), y1 = Math.max(...items.map((r) => r.y + r.h));
      const fill = coverage(items, i.tw, i.th, i.margin);
      S.fill = fill < t.fill[0] ? c(fill / t.fill[0]) : fill > t.fill[1] ? c(1 - (fill - t.fill[1]) * 3) : 1;
      if (S.fill < 1) notes.push(`fill ${(fill * 100).toFixed(0)}% outside ${t.fill.map((v) => Math.round(v * 100)).join("\u2013")}%`);
      let A = 0, cx = 0, cy = 0;
      items.forEach((r) => {
        const a = r.w * r.h;
        A += a;
        cx += a * (r.x + r.w / 2);
        cy += a * (r.y + r.h / 2);
      });
      const d = Math.hypot((cx / A - i.tw / 2) / i.tw, (cy / A - i.th / 2) / i.th);
      S.balance = c(1 - Math.max(0, d - 0.08) / 0.25);
      if (S.balance < 1) notes.push(`visual centroid off-centre by ${(d * 100).toFixed(0)}%`);
      let g = Infinity;
      items.forEach((a, k) => items.forEach((b, j) => {
        if (k < j) g = Math.min(g, rectGap(a, b));
      }));
      S.gaps = items.length > 1 ? c(g / u) : 1;
      if (S.gaps < 1) notes.push(`min gap ${Math.round(g)}px < ${Math.round(u)}px`);
    }
    if (i.logo) {
      const L = i.logo, ok = L.w <= 0.5 * i.tw + 0.5 && L.h <= 0.25 * i.th + 0.5 && Math.min(L.w, L.h) >= Math.max(24, 0.03 * short) - 0.5 && L.x >= i.margin - 1 && L.y >= i.margin - 1 && L.x + L.w <= i.tw - i.margin + 1 && L.y + L.h <= i.th - i.margin + 1;
      S.brand = ok ? 1 : 0.4;
      if (!ok) notes.push("logo outside caps/safe area");
    }
    if (i.arabic) {
      let r = 1;
      if (i.rtl === false) r -= 0.5;
      if (t.kashida && !i.kashidaUsed && !(i.headline?.box && i.headline.r.w >= 0.92 * i.headline.box.w)) {
        r -= 0.3;
        notes.push("wide Arabic headline without kashida");
      }
      S.rtl = c(r);
    }
    const total = Math.round(100 * Object.keys(RUBRIC_WEIGHTS).reduce((a, k) => a + RUBRIC_WEIGHTS[k] * S[k], 0));
    return { total, scores: S, notes };
  }
  var JEV = { base: "https://thejevai.com", path: "/v1/systemone", model: "jev-latest", keyLocation: "server-side env JEV_API_KEY (never in the browser)" };
  var JEV_TASKS = {
    template: { q: "Choice", question: "Which layout template fits this screen best?", options: ["xw", "uw", "h", "sq", "v", "uv", "xv"] },
    autotag: { q: "Choice", question: "Which tag should this layer get?", options: ["@bg", "@product", "@logo", "@headline", "@offer", "@cta", "@panel"] },
    chunk: { q: "Choice", question: "Which line split reads best at distance?" },
    quality: { q: "Score", question: "Rate this layout 0\u20131 against the DOOH design rubric." },
    review: { q: "Noul", question: "Does this layout need human review?" }
  };
  function jevRequest(task, state, options) {
    const t = JEV_TASKS[task];
    if (!t) throw new Error("unknown Jev task " + task);
    const s = JSON.stringify(state);
    if (/data:image|base64,/.test(s)) throw new Error("Jev: text/JSON state only \u2014 no images");
    return { model: JEV.model, type: t.q, question: t.question, options: options || t.options, state };
  }
  function routeDecision(p, threshold = 0.8) {
    if (p == null || !isFinite(p)) return "local";
    return p >= threshold ? "auto" : "review";
  }
  var BG_EXTEND_ORDER = ["reposition", "edge-stretch/mirror", "colour/gradient field", "cutout on field", "ai-outpaint (opt-in, @bg.ai)"];
  function bgExtendPlan(srcAspect, tw, th, aiOptIn = false) {
    const ta = tw / th, r = Math.max(ta / srcAspect, srcAspect / ta);
    const steps = r <= 1.15 ? ["reposition"] : r <= 1.6 ? ["reposition", "edge-stretch/mirror"] : ["reposition", "colour/gradient field", "cutout on field"];
    if (aiOptIn) steps.push("ai-outpaint (opt-in, @bg.ai)");
    return { mismatch: +r.toFixed(2), steps, ai: aiOptIn };
  }
  var NEVER_MIRROR = ["logo", "product", "price", "url", "phone", "numerals"];
  var REF_ZONES = {
    xv: { axis: "y", zones: { logo: [0.019, 0.049], teaser: [0.056, 0.079], headline: [0.263, 0.404], product: [0.404, 0.657], offer: [0.657, 0.732], cta: [0.741, 0.863], legal: [0.901, 0.976] }, focal: 0.526, eyeLevel: [0.3, 0.6] },
    xw: { axis: "x", zones: { logo: [7e-3, 0.096], headline: [0.135, 0.561], product: [0.583, 0.83], cta: [0.852, 0.993] }, capPct: [0.4, 0.5], logoMaxHPct: 0.53, vCentre: 0.5 },
    uw: { axis: "x", zones: { logo: [0.012, 0.104], headline: [0.13, 0.547], product: [0.56, 0.82], cta: [0.833, 0.988] }, minZoneGapPctW: 0.013, vCentre: 0.5 }
  };
  function refZoneRects(cls, tw, th, rtl = false) {
    const Z = REF_ZONES[cls], out = {};
    Object.entries(Z.zones).forEach(([k, [a, b]]) => {
      if (Z.axis === "y") out[k] = { x: 0, y: a * th, w: tw, h: (b - a) * th };
      else {
        const x0 = rtl ? 1 - b : a;
        out[k] = { x: x0 * tw, y: 0, w: (b - a) * tw, h: th };
      }
    });
    return out;
  }
  function zoneConformance(cls, tw, th, rtl, els, tol = 0.04) {
    if (cls !== "xv" && cls !== "xw" && cls !== "uw") return [];
    const Z = REF_ZONES[cls], iss = [];
    Object.entries(els).forEach(([k, r]) => {
      if (!r) return;
      if (k === "offer" && cls === "uw") return;
      const key = k === "offer" && Z.axis === "x" ? "cta" : k, z = Z.zones[key];
      if (!z) return;
      const c = Z.axis === "y" ? (r.y + r.h / 2) / th : (r.x + r.w / 2) / tw, cc = Z.axis === "x" && rtl ? 1 - c : c;
      if (k === "offer" && Z.axis === "x") {
        if (cc < 0.56) iss.push(`offer at ${(cc * 100).toFixed(0)}% (support \u2192 CTA side)`);
        return;
      }
      if (cc < z[0] - tol || cc > z[1] + tol) iss.push(`${k} at ${(cc * 100).toFixed(0)}% vs zone ${(z[0] * 100).toFixed(0)}\u2013${(z[1] * 100).toFixed(0)}%`);
      if (cls === "xw") {
        const vc = (r.y + r.h / 2) / th;
        if (Math.abs(vc - 0.5) > 0.12) iss.push(`${k} not vertically centred (${(vc * 100).toFixed(0)}%)`);
      }
    });
    if (cls === "xw" && els.logo && els.logo.h / th > REF_ZONES.xw.logoMaxHPct + 0.02) iss.push(`logo ${(els.logo.h / th * 100).toFixed(0)}% of height (\u226453%)`);
    if (cls === "uw") {
      const xs = ["logo", "headline", "product", "cta"].map((k) => els[k]).filter(Boolean);
      xs.sort((a, b) => a.x - b.x);
      for (let i = 1; i < xs.length; i++) {
        const g = xs[i].x - (xs[i - 1].x + xs[i - 1].w);
        if (g < REF_ZONES.uw.minZoneGapPctW * tw - 1 && g > -1) iss.push(`zone gap ${(g / tw * 100).toFixed(1)}% W (\u22651.3%)`);
      }
    }
    return iss;
  }
  function libClass(w, h) {
    const r = w / h;
    return r >= 5 ? "Ribbon" : r >= 1.25 ? "Wide" : r >= 0.85 ? "Square" : r >= 0.4 ? "Portrait" : "Tall";
  }
  var CLASS_MAP = { Ribbon: ["xw", "uw"], Wide: ["uw", "h"], Square: ["h", "sq", "v"], Portrait: ["v", "uv"], Tall: ["uv", "xv"] };
  function lookupLayout(name, w, h) {
    const lc = libClass(w, h), cls = targetOrient(w, h), marginPct = lc === "Ribbon" ? 0.08 : 0.075, n = (name || "").trim().toLowerCase();
    const byName = n ? LAYOUT_LIB.find((e) => e.name.trim().toLowerCase() === n && e.w === w && e.h === h) : void 0;
    if (byName) return { source: "name", entry: byName, libClass: lc, cls, marginPct };
    const bySize = LAYOUT_LIB.find((e) => e.w === w && e.h === h);
    if (bySize) return { source: "size", entry: bySize, libClass: lc, cls, marginPct };
    return { source: "class", libClass: lc, cls, marginPct };
  }
  function libConformance(e, tw, th, rtl, els, tol = 0.04) {
    const iss = [];
    Object.entries(els).forEach(([k, r]) => {
      const z = e.zones[k];
      if (!r || !z) return;
      const full = z[0] <= 0.1 && z[2] >= 0.9;
      let cx = (r.x + r.w / 2) / tw;
      if (rtl && !full) cx = 1 - cx;
      const cy = (r.y + r.h / 2) / th;
      const tx = k === "cta" && e.ribbon ? tol + 0.06 : tol;
      if (cx < z[0] - tx || cx > z[2] + tx || !e.ribbon && (cy < z[1] - tol || cy > z[3] + tol)) iss.push(`${k} centre ${(cx * 100).toFixed(0)}%/${(cy * 100).toFixed(0)}% outside library zone`);
    });
    return iss;
  }
  var flat = (ls) => ls.flatMap((l) => [l, ...l.children ? flat(l.children) : []]);
  var hex2 = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");
  var rgbHex = (r, g, b) => "#" + hex2(r) + hex2(g) + hex2(b);
  function mapRoles(a) {
    const vis = (ls) => ls.filter((l) => !l.hidden).flatMap((l) => [l, ...l.children ? vis(l.children) : []]);
    const L = vis(a.layers), A = a.w * a.h, texts = L.filter((l) => l.kind === "text" && l.text).sort((x, y) => (y.size || y.box[3]) - (x.size || x.box[3]));
    return L.map((l) => {
      const n = l.name.toLowerCase(), cov = l.box[2] * l.box[3] / A, tag = /@(bg|product|logo|headline|offer|price|cta|legal|kv)\b/.exec(n);
      let role = "ignore", why = "", c = 0.5;
      if (tag) {
        role = tag[1] === "cta" ? "price" : tag[1];
        why = "tag " + tag[0];
        c = 1;
      } else if (/\b(kv|key ?visual|lockup)\b/.test(n) && l.kind === "group") {
        role = "kv";
        why = "name: key visual group";
        c = 0.85;
      } else if (/logo|brand/.test(n)) {
        role = "logo";
        why = "name contains logo/brand";
        c = 0.9;
      } else if (/bg|background|backdrop/.test(n) || l.kind !== "text" && cov >= 0.9) {
        role = "bg";
        why = cov >= 0.9 ? `covers ${(cov * 100).toFixed(0)}% of canvas` : "name: background";
        c = 0.85;
      } else if (/product|pack|bottle|hero|packshot/.test(n)) {
        role = "product";
        why = "name: product/hero";
        c = 0.85;
      } else if (l.kind === "text") {
        const t = l.text || "";
        if (/(KD|SAR|AED|\$|د\.ك|ر\.س)/i.test(t) && /[0-9٠-٩]/.test(t)) {
          role = "price";
          why = "text with currency + number";
          c = 0.8;
        } else if (/terms|t&c|conditions|www\.|\.com|شروط/i.test(t) || (l.size || 99) < (texts[0]?.size || 100) * 0.3) {
          role = "legal";
          why = "small / legal wording";
          c = 0.7;
        } else if (/\b(headline|tagline|slogan)\b/.test(n)) {
          role = "headline";
          why = "name identifies campaign headline";
          c = 0.85;
        } else if (/\b(offer|promotion|promo)\b/i.test(n + " " + t) || /\b(extended|valid)\s+until\b/i.test(t)) {
          role = "offer";
          why = "offer wording; remains secondary even when it is the largest editable text";
          c = 0.85;
        } else if (texts[0] === l) {
          role = "headline";
          why = "largest text layer";
          c = 0.75;
        } else {
          role = "offer";
          why = "secondary text layer";
          c = 0.6;
        }
      } else if (l.kind === "image" || l.kind === "smart") {
        role = "product";
        why = "image/smart object, not full-bleed";
        c = 0.5;
      }
      if (!tag && l.kind === "group" && role !== "kv" && role !== "logo") {
        role = "ignore";
        why = "group (container; children carry the roles)";
        c = 0.6;
      }
      if (!tag && a.topFirst && l.kind !== "group" && role !== "bg") {
        const idx = L.indexOf(l);
        if (L.slice(0, idx).some((y) => y.kind !== "group" && y.kind !== "text" && !y.blend && y.box[2] * y.box[3] / A >= 0.9)) {
          role = "ignore";
          why = "covered by a full-bleed layer above it (not visible)";
          c = 0.8;
        }
      }
      if (!tag && a.topFirst && role === "bg" && L.slice(0, L.indexOf(l)).some((y) => y.kind !== "group" && y.kind !== "text" && !y.blend && y.box[2] * y.box[3] / A >= 0.9)) {
        role = "ignore";
        why = "full-bleed layer under another full-bleed layer (not visible)";
        c = 0.8;
      }
      if (!tag && !texts.length && (l.kind === "image" || l.kind === "smart") && role === "product") {
        const asp = l.box[2] / Math.max(1, l.box[3]), hF = l.box[3] / a.h;
        if (/\btext|headline|tagline|slogan|claim/.test(n) || asp >= 4 && hF <= 0.2) {
          const al = (o) => [[o.box[0], l.box[0]], [o.box[0] + o.box[2], l.box[0] + l.box[2]], [o.box[0] + o.box[2] / 2, l.box[0] + l.box[2] / 2]].some(([u, v]) => Math.abs(u - v) <= a.w * 0.03);
          const sib = L.filter((o) => o !== l && (o.kind === "image" || o.kind === "smart") && !o.blend && Math.abs(o.box[3] - l.box[3]) <= l.box[3] * 0.15 && Math.abs(o.box[2] - l.box[2]) <= l.box[2] * 0.15 && o.box[2] / Math.max(1, o.box[3]) >= 4 && al(o));
          if (l.blend === "multiply") {
            role = "product";
            why = "multiply shadow (moves with the product)";
            c = 0.6;
            return { id: l.id, name: l.name, role, why, confidence: c, confirmed: false };
          } else if (sib.filter((o) => !o.blend).length >= 1) {
            role = "offer";
            why = `rasterised text: ${sib.length + 1} similar strips (benefit list) \u2014 baked, cannot be re-typeset`;
            c = 0.6;
          } else {
            role = "headline";
            why = "rasterised text strip (wide, short) \u2014 baked, cannot be re-typeset";
            c = 0.6;
          }
          l.bakedText = true;
        }
      }
      return { id: l.id, name: l.name, role, why, confidence: c, confirmed: false };
    }).map((r, _i, all) => {
      const kvs = all.filter((x) => x.role === "kv").map((x) => L.find((l) => l.id === x.id));
      const inside = kvs.some((g) => flat(g.children || []).some((c) => c.id === r.id));
      return inside ? { ...r, role: "ignore", why: "inside key-visual group (moves with it)", confidence: 0.9 } : r;
    });
  }
  function analyseArtwork(a, availableFonts = []) {
    const roles = mapRoles(a), L = flat(a.layers), by = (r) => roles.filter((x) => x.role === r).map((x) => L.find((l) => l.id === x.id)).filter(Boolean);
    const rules = [], warnings = [...a.warnings || []], A = a.w * a.h;
    const hiddenLogo = L.find((l) => l.hidden && /logo|brand/i.test(l.name));
    if (hiddenLogo && !roles.some((r) => r.role === "logo")) warnings.push(`Logo layer "${hiddenLogo.name}" is hidden: no visible logo. Unhide it or confirm the pack carries the brand.`);
    if (!L.some((l) => l.kind === "text" && !l.hidden)) warnings.push("No live text: all copy is rasterised/vector art. It is placed as pixels (cannot be re-typeset, re-broken or kashida-stretched); the AR/EN versions need their own masters.");
    const lang = detectMasterLang(a);
    if (lang) rules.push({ key: "lang", value: lang, why: "file / root group name", overrides: "master feeds only " + lang + " versions", confidence: 0.9 });
    const union = (ls) => {
      const x0 = Math.min(...ls.map((l) => l.box[0])), y0 = Math.min(...ls.map((l) => l.box[1])), x1 = Math.max(...ls.map((l) => l.box[0] + l.box[2])), y1 = Math.max(...ls.map((l) => l.box[1] + l.box[3]));
      return [x0, y0, x1 - x0, y1 - y0];
    };
    const logo = by("logo")[0], prods = by("product"), bg = by("bg")[0], kv = by("kv")[0], texts = L.filter((l) => l.kind === "text");
    if (logo) {
      const asp = logo.box[2] / Math.max(1, logo.box[3]);
      rules.push({ key: "logoAspect", value: +asp.toFixed(2), why: `logo lockup is ${logo.box[2]}\xD7${logo.box[3]}`, overrides: "template logo aspect", confidence: 0.95 });
      if (asp >= 3) rules.push({ key: "wideLockup", value: true, why: `wide lockup (${asp.toFixed(1)}:1)`, overrides: "logo slot: width-led on ribbons; ask for stacked lockup on tall columns", confidence: 0.9 });
    }
    if (kv) {
      rules.push({ key: "lockKV", value: true, why: `"${kv.name}" is an already-composed key visual`, overrides: "hero = KV group scaled as one unit (no re-layout of its children)", confidence: 0.85 });
      rules.push({ key: "productAspect", value: +(kv.box[2] / kv.box[3]).toFixed(2), why: "KV group bounds", overrides: "template hero aspect", confidence: 0.85 });
    } else if (prods.length > 1) {
      const u = union(prods);
      rules.push({ key: "heroUnit", value: prods.map((p) => p.id).join(","), why: `${prods.length} products`, overrides: "products kept together as one hero group", confidence: 0.8 });
      rules.push({ key: "productAspect", value: +(u[2] / u[3]).toFixed(2), why: "union of product layers", overrides: "template hero aspect", confidence: 0.8 });
    } else if (prods[0]) rules.push({ key: "productAspect", value: +(prods[0].box[2] / prods[0].box[3]).toFixed(2), why: `product ${prods[0].box[2]}\xD7${prods[0].box[3]}`, overrides: "template hero aspect", confidence: 0.9 });
    const photoBg = bg && (bg.kind === "image" || bg.kind === "smart");
    if (bg && photoBg && !prods.length && !kv) rules.push({ key: "fullBleed", value: true, why: "full-bleed photo carries the hero", overrides: "no separate hero slot; bg crop keeps the focal point", confidence: 0.8 });
    rules.push({ key: "artStyle", value: photoBg ? "photo" : "flat", why: photoBg ? "background is a photo" : "background is a flat/vector field", overrides: photoBg ? "scrim on by default behind text" : "no scrim", confidence: 0.7 });
    const baked = L.filter((l) => !l.hidden && l.blend !== "multiply" && (l.bakedText || l.kind !== "text" && /text|copy|baked|typo/.test(l.name.toLowerCase().replace(/ copy( \d+)?$/, ""))));
    if (baked.length) rules.push({ key: "protect", value: baked.map((b) => b.id).join(","), why: "text baked into " + baked.map((b) => b.name).join(", "), overrides: "never crop or cover these areas; flag for localisation (cannot translate baked text)", confidence: 0.75 });
    const cols = texts.map((t) => (t.color || "").toLowerCase()).filter((c) => c && !/^#(fff|ffffff|f5f5f5|000|000000)$/.test(c));
    if (cols.length) {
      const m = {};
      cols.forEach((c) => m[c] = (m[c] || 0) + 1);
      const bc = Object.entries(m).sort((x, y) => y[1] - x[1])[0][0];
      rules.push({ key: "brandColor", value: bc, why: "most-used text colour", overrides: "palette check uses this brand colour", confidence: 0.6 });
    }
    const H = by("headline")[0];
    if (H?.text) {
      const n = H.text.replace(/\s+/g, " ").length;
      if (n > 24) rules.push({ key: "headlineMaxLines", value: n > 40 ? 4 : 3, why: `${n}-char headline`, overrides: "template headline line cap", confidence: 0.7 });
    }
    const focal = kv || (prods.length ? { box: union(prods) } : null);
    if (focal) rules.push({ key: "focal", value: [+((focal.box[0] + focal.box[2] / 2) / a.w).toFixed(3), +((focal.box[1] + focal.box[3] / 2) / a.h).toFixed(3)], why: "hero centre in master", overrides: "crop/saliency focal point", confidence: 0.8 });
    const comp = by("headline")[0] && (prods[0] || kv) ? by("headline")[0].box[0] + by("headline")[0].box[2] / 2 < (kv || prods[0]).box[0] + (kv || prods[0]).box[2] / 2 ? "text-left" : "text-right" : null;
    if (comp) rules.push({ key: "masterComposition", value: comp, why: "existing master composition", overrides: "side order on wide formats (mirrored for Arabic)", confidence: 0.6 });
    const fonts = [...new Set(texts.map((t) => t.font).filter(Boolean))];
    const missing = availableFonts.length ? fonts.filter((f) => !availableFonts.some((x) => x.toLowerCase() === f.toLowerCase())) : [];
    missing.forEach((f) => warnings.push(`Missing font "${f}": substituted (flagged @font.sub) \u2014 install or replace before final render`));
    if (fonts.length) rules.push({ key: "fonts", value: fonts.join(", "), why: "fonts in master", overrides: missing.length ? "substitute flag on " + missing.join(", ") : "none", confidence: 1 });
    return { roles, rules, warnings, fonts, missingFonts: missing };
  }
  function applyArtRules(base, rules) {
    const g = (k) => rules.find((r) => r.key === k)?.value;
    const out = { ...base };
    if (typeof g("logoAspect") === "number") out.logoAspect = g("logoAspect");
    if (typeof g("productAspect") === "number") out.productAspect = g("productAspect");
    if (typeof g("headlineMaxLines") === "number") out.headlineMaxLines = g("headlineMaxLines");
    if (g("fullBleed") === true) out.roles = (base.roles || ["logo", "headline", "offer", "cta"]).filter((r) => r !== "product");
    if (g("artStyle") === "photo") out.scrim = true;
    if (typeof g("brandColor") === "string") out.brandColor = g("brandColor");
    if (typeof g("protect") === "string") out.protect = g("protect").split(",");
    if (g("lockKV") === true) out.lockKV = true;
    return out;
  }
  function fromSVG(svg, file = "artwork.svg") {
    const num = (s, d = 0) => s == null ? d : parseFloat(s);
    const attr = (t, k) => {
      const m2 = new RegExp(`\\s${k}="([^"]*)"`).exec(t);
      return m2 ? m2[1] : void 0;
    };
    const root = /<svg\b[^>]*>/.exec(svg)?.[0] || "";
    const vb = (attr(root, "viewBox") || "").split(/[\s,]+/).map(Number);
    const W = vb.length === 4 ? vb[2] : num(attr(root, "width")), H = vb.length === 4 ? vb[3] : num(attr(root, "height"));
    const layers = [];
    let i = 0;
    const el = (tag, body, dx = 0, dy = 0) => {
      const name = attr(tag, "inkscape:label") || attr(tag, "data-name") || attr(tag, "id") || "";
      const t = /<(\w+)/.exec(tag)[1];
      if (t === "rect" || t === "image") return { id: "l" + i++, name: name || t, kind: t === "image" ? "image" : "shape", box: [num(attr(tag, "x")) + dx, num(attr(tag, "y")) + dy, num(attr(tag, "width")), num(attr(tag, "height"))], color: attr(tag, "fill"), src: `${file}#${attr(tag, "id") || name}` };
      if (t === "text") {
        const fs = num(attr(tag, "font-size"), 16), txt2 = body.replace(/<[^>]+>/g, "").trim();
        const x = num(attr(tag, "x")) + dx, y = num(attr(tag, "y")) + dy, w = txt2.length * fs * 0.55;
        const anc = attr(tag, "text-anchor");
        return { id: "l" + i++, name: name || txt2.slice(0, 24), kind: "text", box: [anc === "end" ? x - w : anc === "middle" ? x - w / 2 : x, y - fs * 0.8, w, fs * 1.2], text: txt2, font: (attr(tag, "font-family") || "").replace(/['"]/g, "").split(",")[0].trim() || void 0, size: fs, color: attr(tag, "fill"), src: `${file}#${attr(tag, "id") || name}` };
      }
      return null;
    };
    const inner = svg.replace(/^[\s\S]*?<svg\b[^>]*>/, "").replace(/<\/svg>\s*$/, "").replace(/<defs[\s\S]*?<\/defs>/g, "");
    const re = /<(g|rect|image|text)\b([^>]*?)(\/>|>([\s\S]*?)<\/\1>)/g;
    let m;
    while (m = re.exec(inner)) {
      const tag = "<" + m[1] + m[2] + ">", body = m[4] || "";
      if (m[1] === "g") {
        const tr = /translate\(\s*([-\d.]+)[ ,]*([-\d.]*)\)/.exec(attr(tag, "transform") || ""), dx = tr ? +tr[1] : 0, dy = tr && tr[2] ? +tr[2] : 0;
        const kids = [];
        let k;
        const r2 = /<(rect|image|text)\b([^>]*?)(\/>|>([\s\S]*?)<\/\1>)/g;
        while (k = r2.exec(body)) {
          const c = el("<" + k[1] + k[2] + ">", k[4] || "", dx, dy);
          if (c) kids.push(c);
        }
        if (kids.length) {
          const x0 = Math.min(...kids.map((c) => c.box[0])), y0 = Math.min(...kids.map((c) => c.box[1])), x1 = Math.max(...kids.map((c) => c.box[0] + c.box[2])), y1 = Math.max(...kids.map((c) => c.box[1] + c.box[3]));
          const name = attr(tag, "inkscape:label") || attr(tag, "data-name") || attr(tag, "id") || "group";
          layers.push(kids.length === 1 && !/kv|key|lockup/i.test(name) ? { ...kids[0], name: name + (kids[0].kind === "text" ? "" : "") } : { id: "g" + i++, name, kind: "group", box: [x0, y0, x1 - x0, y1 - y0], children: kids, src: `${file}#${name}` });
        }
      } else {
        const c = el(tag, body);
        if (c) layers.push(c);
      }
    }
    return { w: W, h: H, layers, source: { format: "svg", file } };
  }
  function fromAgPsd(psd, file = "artwork.psd") {
    const warnings = [];
    let i = 0;
    const map = (l) => {
      const box = [l.left || 0, l.top || 0, (l.right || 0) - (l.left || 0), (l.bottom || 0) - (l.top || 0)], st = l.text?.style || {}, fc = st.fillColor;
      const kind = l.children ? "group" : l.text ? "text" : l.placedLayer ? "smart" : l.vectorMask && !l.canvas ? "shape" : "image";
      const out = { id: "p" + i++, name: l.name || "Layer", kind, box, hidden: !!l.hidden, hasMask: !!(l.mask || l.vectorMask), src: `${file}#${l.name}` };
      const embedded=l.placedLayer?.type==='vector'&&(psd.linkedFiles||[]).find(f=>f.id===l.placedLayer.id&&f.data?.length&&String.fromCharCode(...f.data.slice(0,5))==='%PDF-')
      if(embedded)Object.defineProperty(out,'vectorPdf',{value:{data:embedded.data,transform:l.placedLayer.transform,page:l.placedLayer.pageNumber||1},enumerable:false})
      out.fillOpacity = l.fillOpacity ?? 1;
      out.locks = { transparency: !!l.protected?.transparency, pixels: !!l.protected?.composite, position: !!l.protected?.position, artboards: !!l.protected?.artboards, all: !!l.protected?.all };
      if(l.effects) out.effects = structuredClone(l.effects);
      if(l.mask) { out.mask = { kind: 'bitmap', reference: out.id, enabled: !l.mask.disabled, linked: true, sourceRect: { x: l.mask.left || 0, y: l.mask.top || 0, w: (l.mask.right || 0)-(l.mask.left || 0), h: (l.mask.bottom || 0)-(l.mask.top || 0) }, defaultColor: l.mask.defaultColor ?? 255 }; if(l.mask.canvas) Object.defineProperty(out,'maskPx',{value:l.mask.canvas,enumerable:false}); }
      out.sourceBlend = l.blendMode || (l.children ? "pass through" : "normal"); out.sourceOpacity = l.opacity ?? 1;
      if (l.blendMode && l.blendMode !== "normal" && l.blendMode !== "pass through") out.blend = l.blendMode;
      if (typeof l.opacity === "number" && l.opacity < 1) out.opacity = l.opacity;
      if (l.canvas) Object.defineProperty(out, "px", { value: l.canvas, enumerable: false, writable: true });
      if (l.text) {
        out.text = l.text.text;
        out.font = st.font?.name;
        out.size = (st.fontSize || 0) * (l.text.transform ? Math.abs(l.text.transform[3] || 1) : 1);
        if (fc) out.color = rgbHex(fc.r, fc.g, fc.b);
      }
      if (l.children) {
        out.children = l.children.slice().reverse().map(map);
        const k = out.children.filter((c) => !c.hidden);
        if (k.length && !(box[2] > 0)) {
          const x0 = Math.min(...k.map((c) => c.box[0])), y0 = Math.min(...k.map((c) => c.box[1]));
          out.box = [x0, y0, Math.max(...k.map((c) => c.box[0] + c.box[2])) - x0, Math.max(...k.map((c) => c.box[1] + c.box[3])) - y0];
        }
      }
      return out;
    };
    const layers = (psd.children || []).slice().reverse().map(map);
    if (!psd.children) warnings.push("PSD has no layers (flattened): imported as one background image");
    return { w: psd.width, h: psd.height, layers: psd.children ? layers : [{ id: "p0", name: "Background", kind: "image", box: [0, 0, psd.width, psd.height] }], source: { format: file.toLowerCase().endsWith(".psb") ? "psb" : "psd", file }, warnings, topFirst: true };
  }
  function fromPdfText(items, w, h, file = "artwork.pdf") {
    const t = items.filter((x) => x.str.trim()).map((x, i) => {
      const fs = Math.hypot(x.transform[2], x.transform[3]) || x.height;
      return { id: "t" + i, name: x.str.slice(0, 24), kind: "text", text: x.str, size: fs, font: x.fontName, box: [x.transform[4], h - x.transform[5] - fs * 0.8, x.width, fs * 1.2], src: `${file}#text${i}` };
    });
    return { w, h, layers: [{ id: "page", name: "Page artwork (flattened) @bg", kind: "image", box: [0, 0, w, h], src: file + "#page1" }, ...t], source: { format: "pdf", file }, warnings: ["PDF/AI/EPS: vectors arrive flattened into the page raster; text runs stay editable. Native AI without PDF compatibility is not supported (ASSUMED)."] };
  }
  function fromPcraftManifest(m, file = "artwork.pcraft") {
    const d = m.document, W = d.size?.width ?? d.size?.[0], H = d.size?.height ?? d.size?.[1];
    let i = 0;
    const map = (l) => {
      const c = l.content || {}, k = c.kind;
      const out = { id: "c" + (l.id ?? i++), name: l.name, kind: k === "group" ? "group" : k === "text" ? "text" : k === "smart" ? "smart" : k === "shape" || k === "fill" ? "shape" : "image", box: [0, 0, W, H], hidden: l.visible === false, hasMask: !!l.mask, src: `${file}#layer${l.id}` };
      if (k === "text") {
        out.text = c.text;
        out.font = c.font_family;
        out.size = c.size_pt;
        const t = c.transform;
        if (Array.isArray(t)) out.box = [t[4] || 0, t[5] || 0, (c.text || "").length * (c.size_pt || 12) * 0.55, (c.size_pt || 12) * 1.2];
        if (c.color) out.color = Array.isArray(c.color) ? rgbHex(c.color[0] * 255, c.color[1] * 255, c.color[2] * 255) : void 0;
      }
      if (k === "group" && Array.isArray(c.layers)) out.children = c.layers.slice().reverse().map(map);
      return out;
    };
    return { w: W, h: H, layers: (d.layers || []).slice().reverse().map(map), source: { format: "pcraft", file }, warnings: ["PhotoCraft .pcraft: layer tree read from manifest.json; pixel bounds via PSD route (photocraft-cli convert) \u2014 ASSUMED schema fields"] };
  }
  function vectorcraftRoute(j) {
    if (j?.format !== "vectorcraft") throw new Error("not a VectorCraft file");
    return j.pdf?.data ? { route: "pdf", pdfBase64: j.pdf.data, note: "embedded PDF-compatible copy \u2192 pdf.js" } : { route: "svg", note: "no embedded PDF: export SVG from VectorCraft (Preserve Editing keeps the native file inside)" };
  }
  function encodeCraftJob(project, comp, sizes, presetId = "dooh-h264", outDir) {
    return { schema: 1, source: { kind: "effectcraft", project, comp, mezzanine: "prores" }, preset_id: presetId, ...outDir ? { output_dir: outDir } : {}, naming: "{comp}_{name}_{width}x{height}", sizes: sizes.map((s) => ({ name: s.name, width: s.w, height: s.h })), start_queue: false };
  }
  function effectCraftComps(versions, sizes, layout, fps = 25, dur = 10) {
    return { bridge: "screenadapter-json/1", comps: versions.flatMap((v) => sizes.map((s) => {
      const c = layout(v, s);
      const L = [];
      Object.keys(c.rects).forEach((k) => {
        const r = c.rects[k];
        if (!r) return;
        const t = k === "headline" || k === "offer" ? c.text[k] : void 0;
        L.push({ name: `${k[0].toUpperCase() + k.slice(1)} @${k === "cta" ? "cta" : k}`, rect: r, ...t ? { font: Math.round(t.font), lines: t.lines } : {} });
      });
      return { name: `${v.id}_${v.lang}_${s.name.replace(/[^\w-]+/g, "_")}_${s.w}x${s.h}`, width: s.w, height: s.h, fps, duration: dur, rtl: v.rtl, layers: L };
    })) };
  }
  var AUDIT = {
    pass: 80,
    uPct: 0.01,
    scale: [1, 2, 3, 4, 6, 8, 12],
    marginU: 6,
    marginUExtreme: 8,
    clearU: 2,
    logoClearMin: 0.5,
    logoClearIdeal: 0.75,
    logoHPct: [0.06, 0.25],
    hierarchy: 1.5,
    minCapPct: { headline: 0.05, offer: 0.025 },
    capRatio: 0.7,
    maxHeadlineWords: 7,
    maxTextGroups: 3,
    contrastLarge: 3,
    contrastBody: 4.5,
    fill: [0.35, 0.8],
    opticalCentre: [0.4, 0.52],
    wordsPerLine: [2, 6],
    maxTypefaces: 2,
    maxPalette: 5,
    kashidaMax: 3,
    leadAr: [1.3, 1.5],
    capPctRibbon: [0.4, 0.5],
    whiteMax: 0.15,
    seamU: 2,
    tallZones: { logo: [0, 0.25], mid: [0.2, 0.75], cta: [0.7, 0.97], edge: 0.015 },
    leadLat: [1.05, 1.2],
    consistencyCV: 0.25
  };
  var NUM = /^[0-9\u0660-\u0669.,\u066B%\u066A]+$/;
  var CUR = /^(KD|SAR|SR|AED|QAR|BHD|OMR|USD|\$|€|£|د\.ك|ر\.س|د\.إ|ر\.ق)$/i;
  var AUDIT_CRITERIA = ["Safe margins", "Logo clear space", "Element clearance", "Spacing scale & proximity", "Logo size consistency", "Hierarchy", "Legibility at distance", "3-second read", "Contrast", "Alignment & grid", "Balance & visual weight", "Gestalt grouping", "Focal point & flow", "Typography", "Colour & brand", "Arabic / RTL", "Consistency across sizes", "Multi-face screens", "Format playbook", "Spacing rules (U = \xBC headline)"];
  var cl = (v) => Math.max(0, Math.min(100, Math.round(v)));
  function inkRect(t) {
    const lead = t.lead || 1.12, pad = Math.max(0, (lead - AUDIT.capRatio) / 2) * t.font;
    return { x: t.r.x, y: t.r.y + pad, w: t.r.w, h: Math.max(1, t.r.h - 2 * pad) };
  }
  function auditTile(t) {
    const S = Math.min(t.tw, t.th), A = AUDIT, u = Math.max(1, Math.round(A.uPct * S)), rows = [], U = t.headline ? spacingU(t.headline.font) : u;
    const add = (n, score, measured, reason, fix, assumed) => {
      const sc = cl(score);
      rows.push({ n, name: AUDIT_CRITERIA[n - 1], score: sc, pass: sc >= A.pass, measured, reason, fix: sc >= A.pass ? void 0 : fix, assumed });
    };
    const texts = [["headline", t.headline], ["offer", t.offer]].filter((x) => x[1]);
    const E = [...texts.map(([k, v]) => [k, inkRect(v)]), ...t.logo ? [["logo", t.logo]] : [], ...t.cta ? [["price", t.cta]] : [], ...(t.extra || []).map((r, i) => ["secondary" + (i + 1), r])];
    const EP = [...E, ...t.product ? [["product", t.product]] : []];
    const gap = (a, b) => {
      const x = EP.find((e) => e[0] === a), y = EP.find((e) => e[0] === b);
      return x && y ? rectGap(x[1], y[1]) : Infinity;
    };
    const edge = (r) => Math.min(r.x, r.y, t.tw - r.x - r.w, t.th - r.y - r.h);
    {
      const mf = !!(t.faces && t.faces.length > 1), LBm = !mf && t.screen ? lookupLayout(t.screen, t.tw, t.th).entry : void 0, mu = LBm?.marginPx ? Math.max(1, LBm.marginPx / u - 0.5) : !mf && (t.cls === "xw" || t.cls === "uw" || t.cls === "xv" || t.cls === "uv") ? A.marginUExtreme : A.marginU, need = mu * u;
      const w = E.reduce((b, e) => edge(e[1]) < b[1] ? [e[0], edge(e[1])] : b, ["", Infinity]);
      add(1, w[1] >= need - 0.5 * u ? 100 : 80 * Math.max(0, w[1]) / need, `${w[0]} ${Math.round(w[1])}px = ${(w[1] / u).toFixed(1)}u vs \u2265${mu}u (${need}px)`, w[1] >= need - 0.5 * u ? "every layer inside the outer margin" : `${w[0]} too close to edge`, { kind: "relayout", label: `Re-run designer layout (${mu}u margin)` });
    }
    if (t.logo) {
      const L = t.logo, g = Math.min(edge(L), ...EP.filter((e) => e[0] !== "logo").map((e) => rectGap(L, e[1]))), r = g / L.h + 0.03, k = Math.max(0.6, Math.min(1, r / A.logoClearMin));
      add(2, r >= A.logoClearMin ? 100 : 80 * r / A.logoClearMin, `${Math.round(g)}px = ${(r * 100).toFixed(0)}% of logo h`, r >= A.logoClearIdeal ? "generous clear space" : r >= A.logoClearMin ? "meets 50% minimum" : "logo crowded (needs \u22650.5\xD7 logo height)", { kind: "logoScale", value: k, label: `Scale logo to ${Math.round(k * 100)}%` });
    } else add(2, 100, "no logo", "n/a");
    {
      let mg = Infinity, mp = "";
      EP.forEach((a, i) => EP.forEach((b, j) => {
        if (j <= i) return;
        if (texts.some((x) => (x[0] === a[0] || x[0] === b[0]) && x[1].allowOverlap && (a[0] === "product" || b[0] === "product"))) return;
        if (a[0] === "headline" && b[0] === "offer" || a[0] === "offer" && b[0] === "headline") return;
        const g = rectGap(a[1], b[1]);
        if (g < mg) {
          mg = g;
          mp = a[0] + "\u2194" + b[0];
        }
      }));
      const need = U;
      add(3, mg >= need - 0.5 ? 100 : 80 * Math.max(0, mg) / need, `${mp} ${Math.round(mg === Infinity ? 0 : mg)}px = ${(mg / U).toFixed(1)}U vs \u22651U (U=${U}px)`, mg >= need - 0.5 ? "all pairs clear" : `${mp} too tight`, { kind: "keepClear", label: "Apply keep-clear (move price, then shrink)" });
    }
    const msg = ["headline", "offer"], between = (() => {
      const h = EP.find((e) => e[0] === "headline"), o = EP.find((e) => e[0] === "offer");
      if (!h || !o) return true;
      const y0 = Math.min(h[1].y + h[1].h, o[1].y + o[1].h), y1 = Math.max(h[1].y, o[1].y), x0 = Math.min(h[1].x, o[1].x), x1 = Math.max(h[1].x + h[1].w, o[1].x + o[1].w);
      return EP.some((e) => !msg.includes(e[0]) && e[1].y < y1 && e[1].y + e[1].h > y0 && e[1].x < x1 && e[1].x + e[1].w > x0);
    })(), inner = between ? Infinity : gap("headline", "offer"), outer = Math.min(...EP.filter((e) => !msg.includes(e[0])).flatMap((e) => msg.map((m) => gap(m, e[0]))));
    {
      const nn = EP.map((a) => Math.min(...EP.filter((b) => b !== a).map((b) => rectGap(a[1], b[1])))).filter((g) => isFinite(g) && g > 0);
      const onScale = nn.filter((g) => {
        const v = g / U;
        return [1, 1.25, 1.5, 2, 3, 4, 6].some((sv) => Math.abs(v - sv) <= Math.max(0.3, sv * 0.2)) || v > 6;
      }).length / (nn.length || 1);
      const prox = !isFinite(inner) || !isFinite(outer) || inner <= 0.5 * outer + 0.5;
      const sc = 60 * onScale + (prox ? 40 : 40 * Math.min(1, 0.5 * outer / inner));
      add(4, sc, `${Math.round(onScale * 100)}% gaps on 1\xB71.25\xB71.5\xB72\xB73\xB74\xB76U (U=${U}px); inner ${isFinite(inner) ? (inner / U).toFixed(1) + "U" : "\u2013"} : between ${isFinite(outer) ? (outer / U).toFixed(1) + "U" : "\u2013"}`, prox ? onScale >= 0.67 ? "spacing on scale, groups read" : "one-off gaps" : "headline\u2013offer gap not tighter than gaps between groups", { kind: "relayout", label: "Snap gaps to scale (designer layout)" });
    }
    if (t.logo) {
      const p = t.logo.h / S, ok = p >= A.logoHPct[0] && p <= A.logoHPct[1];
      add(5, ok ? 100 : 60, `logo h ${(p * 100).toFixed(1)}% short side`, ok ? "within 6\u201325%" : p < A.logoHPct[0] ? "below min legible logo" : "logo dominates", { kind: "logoScale", value: (p < A.logoHPct[0] ? A.logoHPct[0] : A.logoHPct[1]) / p, label: "Scale logo into 6\u201325% band" });
    } else add(5, 100, "no logo", "n/a");
    if (t.headline && t.offer) {
      const r = t.headline.font / t.offer.font, logoBig = t.logo ? t.logo.h > t.headline.font * 1.2 : false;
      const ok = r >= A.hierarchy && !logoBig;
      add(6, ok ? 100 : 85 * Math.min(r / A.hierarchy, logoBig ? 0.9 : 1), `headline/offer ${r.toFixed(2)}\xD7${logoBig ? "; logo taller than headline" : ""}`, ok ? "one hero, one message, one brand" : logoBig ? "brand competes with hero" : "message competes with hero", { kind: "headlineScale", value: A.hierarchy / r, label: `Scale headline \xD7${(A.hierarchy / r).toFixed(2)}` });
    } else add(6, 100, "single text level", "n/a");
    {
      const lv = texts.map(([k, v]) => {
        const need = A.minCapPct[k] * S, cap = v.font * A.capRatio;
        return { k, cap, need, r: cap / need };
      });
      const w = lv.reduce((a, b) => b.r < a.r ? b : a, lv[0] || { k: "", cap: 0, need: 1, r: 1 });
      if (t.distanceM && t.pitchMm && t.headline) {
        const v = viewingSize(t.distanceM, t.pitchMm, "minimum"), need = v.capPx / A.capRatio * (t.arabic ? 1.1 : 1);
        if (t.headline.font < need) {
          w.k = "headline";
          w.cap = t.headline.font * A.capRatio;
          w.need = need * A.capRatio;
          w.r = t.headline.font / need;
        }
      }
      add(7, w.r >= 1 ? 100 : 85 * w.r, w.k ? `${w.k} cap ${Math.round(w.cap)}px vs \u2265${Math.round(w.need)}px` : "no text", w.r >= 1 ? "legible at distance" : `${w.k} too small`, { kind: "headlineScale", value: 1 / w.r, label: `Scale ${w.k} \xD7${(1 / w.r).toFixed(2)}` }, true);
    }
    {
      const hw = t.headline ? t.headline.lines.join(" ").replace(/\u0640/g, "").split(/\s+/).filter(Boolean).length : 0, groups = texts.length + (t.cta ? 1 : 0), ok = hw <= A.maxHeadlineWords && groups <= A.maxTextGroups;
      add(8, ok ? 100 : 65, `${hw} headline words, ${groups} text groups, ${t.cta ? 1 : 0} CTA`, ok ? "reads in 3 s" : "too much to read", { kind: "none", label: "Shorten copy (creative call)" });
    }
    {
      const cs = texts.filter(([, v]) => v.contrast != null).map(([k, v]) => ({ k, c: v.contrast, need: k === "headline" ? A.contrastLarge : A.contrastBody }));
      if (t.logoContrast != null) cs.push({ k: "logo", c: t.logoContrast, need: A.contrastLarge });
      const w = cs.reduce((a, b) => b.c / b.need < a.c / a.need ? b : a, cs[0]);
      if (w) add(9, w.c >= w.need ? 100 : 80 * w.c / w.need, `${w.k} ${w.c.toFixed(1)}:1 vs \u2265${w.need}:1`, w.c >= w.need ? "passes (WCAG-style)" : `${w.k} low contrast on local background`, { kind: "scrim", label: "Add scrim behind text" });
      else add(9, 100, "not measured", "no pixel data", void 0, true);
    }
    {
      const tol = 2 * u;
      let ok = true, m = "single block";
      if (texts.length > 1 && (texts[0][1].r.x >= texts[1][1].r.x + texts[1][1].r.w || texts[1][1].r.x >= texts[0][1].r.x + texts[0][1].r.w)) {
        m = "zone sequence (side by side)";
      } else if (texts.length > 1) {
        const [a, b] = texts.map((x) => x[1].r);
        const d = Math.min(Math.abs(a.x - b.x), Math.abs(a.x + a.w - b.x - b.w), Math.abs(a.x + a.w / 2 - b.x - b.w / 2));
        ok = d <= tol;
        m = `text axis offset ${(d / u).toFixed(1)}u (\u22642u)`;
      }
      add(10, ok ? 100 : 70, m, ok ? "shared axis" : "headline and offer on different axes", { kind: "relayout", label: "Re-run designer layout" });
    }
    {
      const items = EP.map((e) => e[1]), f = coverage(items, t.tw, t.th, A.marginU * u);
      let Aa = 0, cx = 0, cy = 0;
      items.forEach((r) => {
        const a = r.w * r.h;
        Aa += a;
        cx += a * (r.x + r.w / 2);
        cy += a * (r.y + r.h / 2);
      });
      const yc = Aa ? cy / Aa / t.th : 0.5, xc = Aa ? cx / Aa / t.tw : 0.5, okF = f >= A.fill[0] && f <= A.fill[1], okY = yc >= A.opticalCentre[0] - 0.05 && yc <= A.opticalCentre[1] + 0.05, okX = Math.abs(xc - 0.5) <= 0.15;
      add(11, (okF ? 50 : 50 * (f < A.fill[0] ? f / A.fill[0] : Math.max(0, 1 - (f - A.fill[1]) * 3))) + (okY ? 25 : 12) + (okX ? 25 : 12), `fill ${(f * 100).toFixed(0)}% (35\u201380%), weight at ${(xc * 100).toFixed(0)}%/${(yc * 100).toFixed(0)}% (optical \u224840\u201352% v)`, okF && okY && okX ? "balanced" : !okF ? f < A.fill[0] ? "dead space" : "crowded" : "visual weight off optical centre", { kind: "relayout", label: "Re-run designer layout" });
    }
    {
      const po = gap("price", "offer"), pl = gap("price", "logo"), lm = Math.min(gap("logo", "headline"), gap("logo", "offer"));
      const ok1 = !isFinite(po) || !isFinite(pl) || po <= pl, ok2 = !isFinite(lm) || !isFinite(inner) || lm >= inner;
      add(12, (ok1 ? 50 : 30) + (ok2 ? 50 : 30), `price\u2192offer ${isFinite(po) ? (po / u).toFixed(1) + "u" : "\u2013"} vs price\u2192logo ${isFinite(pl) ? (pl / u).toFixed(1) + "u" : "\u2013"}; logo\u2192message ${isFinite(lm) ? (lm / u).toFixed(1) + "u" : "\u2013"}`, ok1 && ok2 ? "related items grouped" : !ok1 ? "price groups with logo, not offer" : "logo crowds the message group", { kind: "relayout", label: "Regroup (designer layout)" });
    }
    {
      const c = (r) => r ? { x: r.x + r.w / 2, y: r.y + r.h / 2 } : null, h = c(t.headline?.r), o = c(t.offer?.r), cta = c(t.cta);
      let ok = true;
      const why = [];
      const before = (a, b) => {
        const dy = b.y - a.y, dx = t.rtl ? a.x - b.x : b.x - a.x;
        return dy > -0.02 * t.th || dx > 0;
      };
      if (h && o && !before(h, o)) {
        ok = false;
        why.push("offer read before headline");
      }
      if (o && cta && !before(o, cta)) {
        ok = false;
        why.push("CTA before message");
      }
      add(13, ok ? 100 : 65, `${t.rtl ? "RTL mirrored Z/F" : "LTR Z/F"}: ${why.join("; ") || "hero \u2192 message \u2192 CTA"}`, ok ? "clear eye path" : "eye path breaks", { kind: "relayout", label: "Re-run designer layout" });
    }
    {
      const iss = [];
      const faces = new Set(texts.map(([, v]) => v.typeface || "default"));
      if (faces.size > A.maxTypefaces) iss.push(faces.size + " typefaces");
      texts.forEach(([k, v]) => {
        const words = v.lines.map((l) => l.replace(/\u0640/g, "").trim().split(/\s+/).filter(Boolean));
        const all = words.flat().length;
        words.forEach((w, j) => {
          if (w.length > A.wordsPerLine[1]) iss.push(`${k} line ${j + 1}: ${w.length} words`);
        });
        if (v.lines.length > 1 && all > 3 && words[words.length - 1].length === 1) iss.push(k + " widow");
        v.lines.slice(0, -1).forEach((l, j) => {
          const a = l.trim().split(/\s+/).pop() || "", b = v.lines[j + 1].trim().split(/\s+/)[0] || "";
          if (NUM.test(a) && CUR.test(b) || CUR.test(a) && NUM.test(b)) iss.push(k + ": price broken across lines");
        });
        words.slice(0, -1).forEach((w) => {
          const e = (w[w.length - 1] || "").toLowerCase();
          if (WEAK_END.has(e)) iss.push(`${k} ends on "${e}"`);
        });
      });
      add(14, iss.length ? 70 : 100, iss.join("; ") || `\u22646 words/line, no widows, ${faces.size} typeface(s)`, iss.length ? "typesetting issue" : "clean typesetting", { kind: "rebreak", label: "Rebalance line breaks" });
    }
    {
      const pal = new Set((t.palette || []).map((c) => c.toLowerCase())), okP = !t.palette || pal.size <= A.maxPalette, okB = !t.brandColor || pal.has(t.brandColor.toLowerCase());
      add(15, (okP ? 50 : 30) + (okB ? 50 : 20), `${pal.size || "?"} colours${t.brandColor ? `, brand ${t.brandColor} ${okB ? "used" : "missing"}` : ""}`, okP && okB ? "limited palette, brand colour present" : !okB ? "brand colour missing" : "palette too wide", { kind: "none", label: "Restrict palette to brand colours" }, !t.palette);
      if (t.whitePct != null && t.whitePct > A.whiteMax) {
        const r = rows[rows.length - 1];
        r.score = Math.min(r.score, 70);
        r.pass = false;
        r.measured += `; pure-white area ${(t.whitePct * 100).toFixed(0)}% (\u2264${A.whiteMax * 100}%)`;
        r.reason = "pure #FFF glare on LED";
        r.fix = { kind: "none", label: "Use off-white (#F5F5F5) or tinted field" };
      }
    }
    if (t.arabic) {
      const iss = [];
      if (!t.rtl) iss.push("not RTL");
      texts.forEach(([k, v]) => {
        const L = v.lead || 1.12;
        if (L < A.leadAr[0] - 0.01 || L > A.leadAr[1] + 0.01) iss.push(`${k} leading ${L.toFixed(2)} (1.3\u20131.6)`);
        v.lines.join(" ").split(/\s+/).forEach((w) => {
          const n = (w.match(/\u0640/g) || []).length;
          if (n > A.kashidaMax) iss.push(`${k}: ${n} kashida in one word`);
          if (n && /[A-Za-z0-9]/.test(w)) iss.push("kashida on Latin/number");
        });
      });
      if (t.tracking) iss.push(`tracking ${t.tracking} on Arabic (never)`);
      texts.forEach(([k, v]) => {
        if (v.lines.join("").includes("\u0640") && !kashidaAllowed(t.cls, k, v.lines.length)) iss.push(`kashida on ${k} (${v.lines.length} line(s), class ${t.cls}): only single-line headlines on xw/uw/h`);
      });
      const bad = (t.mirrored || []).filter((x) => /logo|product|price|url|phone|number|numeral/i.test(x));
      if (bad.length) iss.push("mirrored: " + bad.join(", ") + " (never mirror)");
      const all = texts.map((x) => x[1].lines.join(" ")).join(" ") + " " + (t.price || "");
      if (/[0-9]/.test(all) && /[\u0660-\u0669\u06F0-\u06F9]/.test(all)) iss.push("mixed Western/Eastern numerals");
      add(16, iss.length ? 60 : 100, iss.join("; ") || "RTL, kashida \u22643/word, leading 1.3\u20131.5, no tracking, numerals consistent", iss.length ? "Arabic typography issue" : "reads naturally RTL", { kind: "rebreak", label: "Re-fit kashida / leading" });
    } else add(16, 100, "Latin", "n/a");
    add(17, 100, "campaign roll-up", "scored across sizes");
    if (t.faces && t.faces.length > 1) {
      const inFace = (r) => t.faces.findIndex((f) => r.x >= f.x - 0.5 && r.y >= f.y - 0.5 && r.x + r.w <= f.x + f.w + 0.5 && r.y + r.h <= f.y + f.h + 0.5);
      const big = t.faces.reduce((b, f, i) => f.w * f.h > t.faces[b].w * t.faces[b].h ? i : b, 0), bad = EP.filter((e) => inFace(e[1]) < 0).map((e) => e[0]), hf = t.headline ? inFace(t.headline.r) : big;
      const ok = !bad.length && hf === big;
      add(18, ok ? 100 : bad.length ? 40 : 60, bad.length ? "split across seam: " + bad.join(", ") : hf !== big ? "headline not on largest face" : `${t.faces.length} faces, hero on largest`, ok ? "each face stands alone" : "multi-face issue", { kind: "relayout", label: "Re-run multi-face layout" });
      if (ok) {
        const sm = Math.min(...E.map((e) => {
          const f = t.faces[inFace(e[1])];
          return f ? Math.min(e[1].x - f.x, e[1].y - f.y, f.x + f.w - e[1].x - e[1].w, f.y + f.h - e[1].y - e[1].h) : Infinity;
        }));
        const r = rows[rows.length - 1];
        r.measured += `; seam clearance ${(sm / u).toFixed(1)}u (\u2265${A.seamU}u)`;
        if (sm < A.seamU * u - 0.5) {
          r.score = 70;
          r.pass = false;
          r.reason = "text/logo too close to a seam";
          r.fix = { kind: "relayout", label: "Re-run multi-face layout" };
        }
      }
    } else add(18, 100, "single face", "n/a");
    {
      const H = t.headline, iss = [];
      let m = "n/a";
      if (t.faces && t.faces.length > 1) m = "multi-face: per-face rules (#18)";
      else if (H && (t.cls === "xw" || t.cls === "uw") && !(t.screen && lookupLayout(t.screen, t.tw, t.th).entry && !lookupLayout(t.screen, t.tw, t.th).entry.ribbon)) {
        const cx = (H.r.x + H.r.w / 2) / t.tw, cap = H.font * A.capRatio / t.th;
        const ov = Math.max(0, Math.min(H.r.x + H.r.w, t.tw * 2 / 3) - Math.max(H.r.x, t.tw / 3));
        if (ov < 0.25 * H.r.w && (cx < 1 / 3 || cx > 2 / 3)) iss.push(`headline centre ${(cx * 100).toFixed(0)}% misses the central third`);
        if (H.lines.length > (t.cls === "xw" ? 1 : 2)) iss.push(`${H.lines.length} headline lines (max ${t.cls === "xw" ? 1 : 2})`);
        if (t.cls === "xw" && (cap < A.capPctRibbon[0] - 0.02 || cap > A.capPctRibbon[1] + 0.02)) iss.push(`cap ${(cap * 100).toFixed(0)}% of height (40\u201355%)`);
        m = `headline ${H.lines.length} line(s), cap ${(cap * 100).toFixed(0)}% h, centre ${(cx * 100).toFixed(0)}% w`;
      } else if (t.cls === "xv") {
        const cy = (r) => r ? (r.y + r.h / 2) / t.th : null, Z = A.tallZones, chk = (k, v, z) => {
          if (v != null && (v < z[0] || v > z[1])) iss.push(`${k} at ${(v * 100).toFixed(0)}% (zone ${z[0] * 100}\u2013${z[1] * 100}%)`);
        };
        chk("logo", cy(t.logo), Z.logo);
        chk("headline", cy(H?.r), Z.mid);
        chk("product", cy(t.product), Z.mid);
        chk("CTA", cy(t.cta), Z.cta);
        E.forEach((e) => {
          if (e[0] === "logo") return;
          if (e[1].y < Z.edge * t.th || e[1].y + e[1].h > (1 - Z.edge) * t.th) iss.push(e[0] + " at very top/bottom");
        });
        m = "tall-column zones (ref 960\xD75328)";
      }
      const fam = screenFamily(t.tw, t.th);
      const LB = !(t.faces && t.faces.length > 1) && t.screen ? lookupLayout(t.screen, t.tw, t.th) : null;
      if (LB?.entry) {
        const lc = libConformance(LB.entry, t.tw, t.th, !!t.rtl, { logo: t.logo, headline: H?.r, product: t.product, cta: t.cta });
        lc.forEach((x) => iss.push(x));
        m = (m === "n/a" ? "" : m + " \xB7 ") + `library ${LB.source} match (${LB.entry.name})` + (lc.length ? "" : " \u2713");
      } else if (!(t.faces && t.faces.length > 1)) {
        const zc = zoneConformance(t.cls, t.tw, t.th, !!t.rtl, { logo: t.logo, headline: H ? inkRect(H) : void 0, product: t.product, offer: t.offer ? inkRect(t.offer) : void 0, cta: t.cta });
        zc.forEach((x) => iss.push(x));
        if (zc.length === 0 && m !== "n/a") m += " \xB7 ref zones \u2713";
      }
      add(19, iss.length ? 65 : 100, (iss.join("; ") || m) + ` \xB7 ${fam.label}, tier ${fam.tier}`, iss.length ? "breaks the format playbook" : m === "n/a" ? "n/a" : "follows the format playbook", { kind: "relayout", label: "Apply designer template (format playbook)" });
    }
    {
      const iss = [], H = t.headline, Ht = H ? H.font : 0, ov = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w, mf = !!(t.faces && t.faces.length > 1);
      let inr = NaN;
      if (H && t.offer && !between) {
        const hi = inkRect(H), oi = inkRect(t.offer);
        if (ov(hi, oi) && oi.y >= hi.y + hi.h - 1) {
          inr = oi.y - hi.y - hi.h;
          if (inr < 0.6 * U || inr > 2.5 * U) iss.push(`headline\u2192subline ${(inr / U).toFixed(1)}U (\u22481.2U)`);
        }
      }
      if (H && t.logo && !mf) {
        const L = t.logo, hi = inkRect(H);
        if (ov(L, hi) && (L.y + L.h <= hi.y || hi.y + hi.h <= L.y)) {
          const g = rectGap(L, hi), need = Math.max(SPACING.logoHead * U, L.h);
          if (g < 0.9 * need) iss.push(`logo\u2192headline ${(g / U).toFixed(1)}U < max(6U, logo h) = ${(need / U).toFixed(1)}U`);
        }
      }
      if (H && t.product && !mf) texts.forEach(([k, v]) => {
        if (v.allowOverlap) return;
        const g = rectGap(inkRect(v), t.product);
        if (g < 0.9 * SPACING.heroMinH * Ht) iss.push(`${k}\u2192hero ${(g / U).toFixed(1)}U < 0.5H (2U)`);
      });
      if ((t.cls === "xw" || t.cls === "uw") && !mf) {
        const zs = EP.map((e) => e[1]).sort((a, b) => a.x - b.x), gs = [];
        for (let i = 1; i < zs.length; i++) {
          const g = zs[i].x - Math.max(...zs.slice(0, i).map((z) => z.x + z.w));
          if (g > 0) gs.push(g);
        }
        if (gs.length) {
          const mn = Math.min(...gs);
          if (mn < 0.9 * SPACING.zoneGap[0] * U) iss.push(`zone gap ${(mn / U).toFixed(1)}U < 2U`);
        }
      }
      if (isFinite(inr) && inr > 0 && !mf) {
        const others = EP.filter((e) => e[0] !== "headline" && e[0] !== "offer" && e[0] !== "product").map((e) => Math.min(gap("headline", e[0]), gap("offer", e[0]))).filter(isFinite);
        if (others.length && Math.min(...others) < SPACING.groupRatio * inr - 0.5) iss.push(`group gap ${(Math.min(...others) / U).toFixed(1)}U < 2\xD7 inner ${(inr / U).toFixed(1)}U`);
      }
      if (t.tracking != null) {
        if (t.arabic && t.tracking !== 0) iss.push("Arabic tracking \u2260 0");
        if (!t.arabic && (t.tracking < 0 || t.tracking > 0.01)) iss.push(`EN tracking ${(t.tracking * 100).toFixed(1)}% (0 to +1%)`);
      }
      const B = t.ctaButton;
      if (B && Ht) {
        const tx = B.textSize;
        if (Math.abs(tx / Ht - 0.5) > 0.1) iss.push(`CTA text ${(tx / Ht).toFixed(2)}H (\u22480.5H)`);
        if (Math.abs(B.h / tx - 2) > 0.3) iss.push(`CTA height ${(B.h / tx).toFixed(1)}\xD7 text (\u22482\xD7)`);
        if (Math.abs(B.padX / tx - 1) > 0.25 || Math.abs(B.padY / tx - 0.5) > 0.15) iss.push("CTA padding off 0.5/1.0\xD7 text");
        if (B.arrowSide && t.rtl && B.arrowSide !== "left") iss.push("CTA arrow not mirrored for Arabic");
      }
      const P = t.priceBlock;
      if (P) {
        const r = P.currencyGap / P.numberSize;
        if (r < 0.15 || r > 0.25) iss.push(`currency gap ${r.toFixed(2)}\xD7 number (0.15\u20130.25)`);
        if (!P.oneLine) iss.push("price wraps");
        if (P.oldSize && Math.abs(P.oldSize / P.numberSize - 0.5) > 0.1) iss.push("old price not \u22480.5\xD7 new");
        if (P.oldGap && Math.abs(P.oldGap / P.numberSize - 0.3) > 0.1) iss.push("old\u2192new gap not \u22480.3\xD7");
      }
      if (t.bilingualGap != null && t.bilingualGap < 4 * U - 0.5) iss.push(`EN\u2194AR block gap ${(t.bilingualGap / U).toFixed(1)}U < 4U`);
      if (t.repeats && t.repeats.length > 1) {
        const rs = t.repeats.slice().sort((a, b) => a.x - b.x || a.y - b.y), gs = rs.slice(1).map((r, i) => rectGap(rs[i], r)), mx = Math.max(...gs), mn = Math.min(...gs);
        if (mn < 0.8 * 2 * U || mx > 1.2 * mn + 0.5) iss.push(`repeated items gaps ${(mn / U).toFixed(1)}\u2013${(mx / U).toFixed(1)}U (equal \u22482U)`);
      }
      add(20, 100 - 15 * iss.length, iss.join("; ") || (H ? `U=${U}px (\xBC of ${Math.round(Ht)}px headline); gaps on the U table` : "no headline"), iss.length ? "spacing off the U table" : "spacing follows the U table", { kind: "relayout", label: "Re-run designer layout (U gaps)" });
    }
    return { id: t.id, score: Math.round(rows.reduce((a, r) => a + r.score, 0) / rows.length), rows, u, U };
  }
  function auditCampaign(tiles) {
    const res = tiles.map(auditTile), cv = (a) => {
      a = a.filter(isFinite);
      if (a.length < 2) return 0;
      const m = a.reduce((x, y) => x + y, 0) / a.length;
      return Math.sqrt(a.reduce((x, y) => x + (y - m) ** 2, 0) / a.length) / (m || 1);
    };
    const S = (t) => Math.min(t.tw, t.th), lg = tiles.filter((t) => t.logo).map((t) => t.logo.h / S(t)), hr = tiles.filter((t) => t.headline && t.offer).map((t) => t.headline.font / t.offer.font);
    const ig = tiles.filter((t) => t.headline && t.offer && auditTile(t).rows[3].measured.indexOf("inner \u2013") < 0).map((t) => rectGap(inkRect(t.headline), inkRect(t.offer)) / Math.max(1, Math.round(0.01 * S(t))));
    const byCls = {};
    tiles.forEach((t) => {
      if (t.logo) (byCls[t.cls] = byCls[t.cls] || []).push(t.logo.h / S(t));
    });
    const byC = (f) => {
      const g = {};
      tiles.forEach((t) => {
        const v = f(t);
        if (v != null && isFinite(v)) {
          const key = t.cls + (t.arabic ? ":ar" : ":en");
          (g[key] = g[key] || []).push(v);
        }
      });
      return Math.max(0, ...Object.values(g).map(cv));
    };
    const cLogo = Math.max(0, ...Object.values(byCls).map(cv)), cH = byC((t) => t.headline && t.offer ? t.headline.font / t.offer.font : null), cGap = byC((t) => {
      if (!t.headline || !t.offer) return null;
      if (t.headline.r.x >= t.offer.r.x + t.offer.r.w || t.offer.r.x >= t.headline.r.x + t.headline.r.w) return null;
      const a = auditTile(t).rows[3];
      if (a.measured.indexOf("inner \u2013") >= 0) return null;
      return rectGap(inkRect(t.headline), inkRect(t.offer)) / spacingU(t.headline.font);
    });
    res.forEach((r, i) => {
      const t = tiles[i], r5 = r.rows[4], r17 = r.rows[16], r16 = r.rows[15];
      if (cLogo > AUDIT.consistencyCV) {
        r5.score = Math.min(r5.score, cl(100 - (cLogo - AUDIT.consistencyCV) * 150));
        r5.measured += `; campaign CV ${(cLogo * 100).toFixed(0)}%`;
        r5.pass = r5.score >= AUDIT.pass;
        if (!r5.pass) r5.fix = r5.fix || { kind: "logoScale", label: "Normalise logo % across sizes" };
      }
      const worst = Math.max(cH, cGap);
      r17.score = cl(worst <= AUDIT.consistencyCV ? 100 : 100 - (worst - AUDIT.consistencyCV) * 150);
      r17.pass = r17.score >= AUDIT.pass;
      r17.measured = `within-class CV hierarchy ${(cH * 100).toFixed(0)}%, inner gap ${(cGap * 100).toFixed(0)}%, logo ${(cLogo * 100).toFixed(0)}% (\u226425%, per class & language)`;
      r17.reason = r17.pass ? "same family look" : "ratios vary across sizes";
      if (!r17.pass) r17.fix = { kind: "relayout", label: "Apply designer template to all sizes" };
      if (t.arabic && t.group && t.headline) {
        const lat = tiles.find((x) => !x.arabic && x.group === t.group && x.headline);
        const ratio = lat ? t.headline.font / lat.headline.font : 1;
        if (lat) r16.measured += `; AR/EN headline ${(ratio * 100).toFixed(0)}% (target 110\u2013115%)`;
        if (lat && ratio >= 0.9 && ratio < 1.1) {
          r16.score = Math.min(r16.score, 90);
        }
        if (lat && t.headline.font < lat.headline.font * 0.9) {
          r16.score = Math.min(r16.score, 70);
          r16.pass = false;
          r16.measured += `; Arabic headline ${Math.round(t.headline.font)}px < Latin ${Math.round(lat.headline.font)}px`;
          r16.fix = { kind: "headlineScale", value: lat.headline.font / t.headline.font, label: "Match Arabic size to Latin" };
        }
      }
      r.score = Math.round(r.rows.reduce((a, x) => a + x.score, 0) / r.rows.length);
    });
    const fails = {};
    res.forEach((r) => r.rows.filter((x) => !x.pass).forEach((x) => fails[x.name] = (fails[x.name] || 0) + 1));
    return {
      tiles: res,
      passRate: res.length ? res.filter((r) => r.rows.every((x) => x.pass)).length / res.length : 1,
      avg: res.length ? Math.round(res.reduce((a, r) => a + r.score, 0) / res.length) : 0,
      top: Object.entries(fails).sort((a, b) => b[1] - a[1]).slice(0, 3),
      cv: { logo: cLogo, hierarchy: cH, innerGap: cGap }
    };
  }
  function auditCSV(c) {
    const q = (s) => `"${String(s).replace(/"/g, '""')}"`, out = ["tile,tile_score,n,criterion,score,pass,measured,reason,fix"];
    c.tiles.forEach((t) => t.rows.forEach((r) => out.push([q(t.id), t.score, r.n, q(r.name), r.score, r.pass ? "PASS" : "FAIL", q(r.measured + (r.assumed ? " (ASSUMED)" : "")), q(r.reason), q(r.fix?.label || "")].join(","))));
    return out.join("\n");
  }
  function pickMaster(masters, tw, th) {
    if (!masters.length) return { index: -1, dist: Infinity, sameFamily: false, covers: false };
    const tf = screenFamily(tw, th).key;
    const sc = masters.map((m, i) => {
      const dist2 = Math.abs(Math.log(m.w / m.h / (tw / th))), sameFamily2 = screenFamily(m.w, m.h).key === tf, covers2 = m.w >= tw && m.h >= th;
      return { index: i, dist: dist2, sameFamily: sameFamily2, covers: covers2, cost: dist2 + (sameFamily2 ? 0 : 0.15), px: m.w * m.h };
    });
    sc.sort((a, b) => Math.abs(a.cost - b.cost) > 0.01 ? a.cost - b.cost : a.covers !== b.covers ? a.covers ? -1 : 1 : b.px - a.px);
    const { index, dist, sameFamily, covers } = sc[0];
    return { index, dist, sameFamily, covers };
  }
  function langFromFilename(name) {
    const s = String(name || "").replace(/^.*[\\/]/, "").replace(/\.[a-z0-9]{2,5}$/i, "").trim();
    const cut = (m2) => s.slice(0, m2.index).replace(/[\s_\-.]+$/, "");
    let m = s.match(/[\s_\-.]+(ar|arb|arabic)$/i) || s.match(/(?<=[a-z0-9])(Ar|AR|Arabic|ARABIC)$/) || s.match(/[\s_\-.]*(عربي)$/);
    if (m) return { lang: "AR", base: cut(m), explicit: true };
    m = s.match(/[\s_\-.]+(en|eng|english)$/i) || s.match(/(?<=[a-z0-9])(En|EN|English|ENGLISH)$/);
    if (m) return { lang: "EN", base: cut(m), explicit: true };
    return { lang: "EN", base: s, explicit: false };
  }
  function detectMasterLang(a) {
    {
      const f = langFromFilename(a.source.file || "");
      if (f.explicit) return f.lang;
    }
    const names = [a.source.file, ...a.layers.map((l) => l.name)].join(" ");
    if (/(^|[^a-z])(ar|arabic|arb)([^a-z]|$)/i.test(names)) return "AR";
    if (/(^|[^a-z])(en|eng|english)([^a-z]|$)/i.test(names)) return "EN";
    const t = flat(a.layers).map((l) => l.text || "").join(" ");
    if (/[\u0600-\u06FF]/.test(t)) return "AR";
    if (/[a-z]/i.test(t)) return "EN";
    return "";
  }
  function pickMasterForLang(masters, tw, th, lang) {
    const idx = masters.map((m, i) => i).filter((i) => !masters[i].lang || !lang || masters[i].lang === lang);
    const pool = idx.length ? idx : masters.map((_, i) => i);
    const r = pickMaster(pool.map((i) => masters[i]), tw, th);
    return { ...r, index: r.index < 0 ? -1 : pool[r.index], langMatch: idx.length > 0 };
  }
  return __toCommonJS(adapt_exports);
})();
export default Adapt

import { frameBounds, rectBounds } from './graphics/artworkTransforms'
import { effectiveVisible, ancestors } from './layerPanelModel'
import { layerStyle, BLEND_MODES } from './blending.js'
import { stackOrder } from './stack.js'
import { allLayers, unionBounds } from './artwork.js'
import { borderGeometry } from './border.js'

export const FAMILIES = ['landscape', 'ultrawide', 'ultratall', 'vertical', 'compact']
export const GUIDE_PRESETS = ['2.6 Screen', 'Al Salam Mall', 'Al Nassar Tower Vertical', 'Alshaheed - Mupi', 'The Gate Mall Outdoor']
export function layoutFamily(screen) {
  const ratio = screen.w / screen.h
  return ratio < .33 ? 'ultratall' : ratio < .85 ? 'vertical' : ratio < 1.8 ? 'compact' : ratio >= 4 ? 'ultrawide' : 'landscape'
}
export const screenProofKey = screen => JSON.stringify([screen.name,screen.w,screen.h])
export function proofForScreen(art,screen) { return art.calibration?.outputs?.[screenProofKey(screen)] || art.calibration?.proofs?.[layoutFamily(screen)] }
export function createScreenProof(art,screen) {
  const guide=art.calibration?.proofs?.[layoutFamily(screen)] || initialProof(art,screen), layout=guideLayout(art,screen,guide)
  return {...structuredClone(guide),screen:{name:screen.name,w:screen.w,h:screen.h},frames:Object.fromEntries(layout.map(u=>[u.id,{...u.frame}])),sourceSignature:sourceSignature(art),approved:false}
}
export function sourceSignature(art) {
  return JSON.stringify(['individual-layers-v2', art.an.roles.map(r => [r.id, r.role, r.confidence === 1 || !!r.confirmed]), art.layerConstraints || {}, art.backgroundRegion || null, art.layerVisibility || {}, art.layerLinks || [], art.layerCrops || {}, art.originalBorder || null, art.wordPieces || []])
}
export function calibrationReady(art) {
  const signature = sourceSignature(art)
  return !!art.calibration?.enabled && FAMILIES.every(f => art.calibration.proofs[f]?.approved && art.calibration.proofs[f].sourceSignature === signature)
}
export function contentUnits(art, detached = [], panel) {
  const visibility = { ...art.layerVisibility }
  if(panel)for(const node of panel.nodes)for(const id of node.sourceIds||[])visibility[id]=!node.deleted&&node.visible
  const view = panel ? { ...art, layerVisibility:visibility } : art
  const roles = new Map(art.an.roles.map(r => [r.id, r]))
  const layers = allLayers(view).filter(l => !l.effectiveHidden && !l.splitIntoWords && l.px && !l.children?.length && l.box?.[2] > 0 && l.box?.[3] > 0)
  const foreground = layers.filter(l => roles.get(l.id)?.role !== 'bg' && !(roles.get(l.id)?.role === 'border' && art.originalBorder?.sourceLayerId === l.id) && !(roles.get(l.id)?.role === 'ignore' && roles.get(l.id)?.confidence === 1 && !(panel?.nodes.find(n=>n.sourceIds?.includes(l.id))?.visible)))
  const available = new Map(foreground.map(l => [l.id, l])), used = new Set(), units = []
  function add(id, members, role, name) {
    if (!members.length) return
    const visible = members.map(l => {
      const [x, y, w, h] = l.box, crop = l.crop || { x, y, w, h }, left = Math.max(0, x, crop.x), top = Math.max(0, y, crop.y)
      return { ...l, box: [left, top, Math.max(0, Math.min(art.a.w, x + w, crop.x + crop.w) - left), Math.max(0, Math.min(art.a.h, y + h, crop.y + crop.h) - top)] }
    }).filter(l => l.box[2] > 0 && l.box[3] > 0)
    if (!visible.length) return
    const constraints = members.map(l => art.layerConstraints?.[l.id]).filter(Boolean)
    units.push({ id, layerIds: visible.map(l => l.id), sourceKind: members.length === 1 ? members[0].kind : 'linked', sourceLink: (art.layerLinks || []).some(link => link.id === id), wordSourceId: members.length === 1 ? members[0].wordSourceId : null, role, name, box: unionBounds(visible), required: constraints.some(c => c.required), constraint: constraints.find(c => c.anchor && c.anchor !== 'free') || constraints[0] || {} })
    members.forEach(l => used.add(l.id))
  }
  for (const link of art.layerLinks || []) {
    if (detached.includes(link.id)) continue
    const members = link.layerIds.map(id => available.get(id)).filter(Boolean)
    const role = roles.get(members[0]?.id)?.role || 'other'
    add(link.id, members, role, `Linked ${role} · ${members.length} layers`)
  }
  for (const layer of foreground) {
    if (used.has(layer.id)) continue
    const role = roles.get(layer.id)?.role || 'other', constraint = art.layerConstraints?.[layer.id] || {}
    const id = layer.wordSourceId ? `word:${layer.id}` : `layer:${layer.id}`
    add(id, [layer], role, layer.name || role)
    const unit = units.find(u => u.id === id)
    if (unit) unit.legacyId = (art.layerLinks || []).find(link => detached.includes(link.id) && link.layerIds.includes(layer.id))?.id || (layer.wordSourceId ? id : `${role}:${constraint.anchor || 'free'}:${constraint.margin ?? 2}`)
  }
  if (!units.length && art.a.composite && art.a.source?.format === 'image') units.push({ id: 'flattened', layerIds: [], role: 'artwork', name: 'Flattened artwork', box: { x: 0, y: 0, w: art.a.w, h: art.a.h }, constraint: {} })
  const order = new Map(layers.map((l, i) => [l.id, i]))
  units.sort((a, b) => Math.min(...a.layerIds.map(id => order.get(id) ?? 0)) - Math.min(...b.layerIds.map(id => order.get(id) ?? 0)))
  return units
}
function slot(role, family, index, count) {
  const slots = (family === 'vertical' || family === 'ultratall') ? {
    headline: [.08, .08, .84, .35], product: [.08, .46, .84, .2], offer: [.08, .7, .84, .09], cta: [.08, .82, .84, .07], logo: [.35, .92, .3, .05], legal: [.05, .96, .9, .025], price: [.08, .8, .3, .08],
  } : family === 'ultrawide' ? {
    headline: [.04, .12, .36, .76], product: [.43, .12, .2, .76], offer: [.66, .12, .28, .4], cta: [.66, .6, .28, .25], logo: [.87, .82, .09, .12], legal: [.03, .93, .8, .04], price: [.65, .65, .15, .2],
  } : family === 'compact' ? {
    headline: [.08, .06, .84, .32], product: [.08, .44, .48, .4], offer: [.62, .44, .3, .2], cta: [.08, .87, .5, .07], logo: [.64, .76, .28, .13], legal: [.06, .96, .88, .025], price: [.65, .67, .25, .08],
  } : {
    headline: [.04, .12, .43, .72], product: [.5, .12, .44, .44], offer: [.53, .6, .4, .2], cta: [.53, .84, .32, .09], logo: [.83, .84, .12, .1], legal: [.04, .95, .75, .025], price: [.52, .8, .2, .1],
  }
  slots.stamp = family === 'vertical' || family === 'ultratall' ? [.08, .02, .84, .1] : [.04, .02, .25, .16]
  const box = slots[role] || [.08, .08 + .84 * index / Math.max(1, count), .84, .75 / Math.max(1, count)]
  return { x: box[0], y: box[1], w: box[2], h: box[3] }
}
export function fitFrame(frame, unit, screen, art) {
  const scale = Math.min(frame.w * screen.w / unit.box.w, frame.h * screen.h / unit.box.h)
  let w = unit.box.w * scale, h = unit.box.h * scale
  if (unit.constraint?.freeTransform) return { x: frame.x, y: frame.y, w: w / screen.w, h: h / screen.h }
  const c = unit.constraint || {}, margin = Math.max(0, Math.min(20, c.margin ?? 2)) / 100 * Math.min(screen.w, screen.h)
  const shrink = Math.min(1, (screen.w - margin * 2) / w, (screen.h - margin * 2) / h)
  w *= shrink; h *= shrink
  let x = frame.x * screen.w + (frame.w * screen.w - w) / 2, y = frame.y * screen.h + (frame.h * screen.h - h) / 2
  let anchor = c.anchor
  if (anchor === 'nearest') {
    const b = unit.box
    anchor = [['left', b.x / art.a.w], ['right', (art.a.w - b.x - b.w) / art.a.w], ['top', b.y / art.a.h], ['bottom', (art.a.h - b.y - b.h) / art.a.h]].sort((a, b) => a[1] - b[1])[0][0]
  }
  if (anchor === 'locked') { x = unit.box.x / art.a.w * screen.w; y = unit.box.y / art.a.h * screen.h }
  if (anchor === 'left') x = margin
  if (anchor === 'right') x = screen.w - margin - w
  if (anchor === 'top') y = margin
  if (anchor === 'bottom') y = screen.h - margin - h
  x = Math.max(margin, Math.min(screen.w - margin - w, x)); y = Math.max(margin, Math.min(screen.h - margin - h, y))
  return { x: x / screen.w, y: y / screen.h, w: w / screen.w, h: h / screen.h }
}
export function initialProof(art, screen) {
  const units = contentUnits(art), family = layoutFamily(screen)
  const frames = Object.fromEntries(units.map((u, index) => [u.id, fitFrame(slot(u.role, family, index, units.length), u, screen, art)]))
  for (const parent of new Set(units.map(u => u.wordSourceId || u.legacyId).filter(Boolean))) {
    const words = units.filter(u => (u.wordSourceId || u.legacyId) === parent), box = unionBounds(words.map(u => ({ box: [u.box.x, u.box.y, u.box.w, u.box.h] })))
    const group = fitFrame(slot(words[0].role, family, 0, 1), { box, constraint: words[0].constraint }, screen, art)
    for (const word of words) frames[word.id] = { x: group.x + (word.box.x - box.x) / box.w * group.w, y: group.y + (word.box.y - box.y) / box.h * group.h, w: word.box.w / box.w * group.w, h: word.box.h / box.h * group.h }
  }
  return { screen: { name: screen.name, w: screen.w, h: screen.h }, sourceSignature: sourceSignature(art), approved: false, frames }
}
export function guideLayout(art, screen, proof = proofForScreen(art,screen)) {
  const units = contentUnits(art, proof?.detachedSourceLinks, proof?.panel), base = proof || initialProof(art, screen)
  const frames = { ...base.frames }
  // Preserve the visible arrangement from older implicit role clusters without keeping them linked.
  for (const key of new Set(units.map(u => u.legacyId).filter(Boolean))) {
    const members = units.filter(u => u.legacyId === key && !frames[u.id])
    if (!members.length || !frames[key]) continue
    const box = unionBounds(members.map(u => ({ box: [u.box.x, u.box.y, u.box.w, u.box.h] })))
    const group = fitFrame(frames[key], { box, constraint: {} }, screen, art)
    for (const unit of members) frames[unit.id] = { x: group.x + (unit.box.x - box.x) / box.w * group.w, y: group.y + (unit.box.y - box.y) / box.h * group.h, w: unit.box.w / box.w * group.w, h: unit.box.h / box.h * group.h }
  }
  const layout = units.map(original => { const free = base.freeUnitIds?.includes(original.id); const unit = free || (base.groups || []).some(g => g.kind === 'link' && g.unitIds.includes(original.id)) ? { ...original, constraint: { ...original.constraint, anchor: 'free', freeTransform: !!free } } : original; return ({ ...unit, frame: fitFrame(frames[unit.id] || slot(unit.role, layoutFamily(screen), 0, 1), unit, screen, art) }) })
  // A proof group transfers as one geometric unit, preserving word spacing and aspect.
  for (const group of base.groups || []) {
    const members = layout.filter(u => group.unitIds.includes(u.id) && frames[u.id])
    if (!members.length || !base.screen) continue
    const refs = new Map(members.map(u => [u.id, fitFrame(frames[u.id], u, base.screen, art)]))
    const referenceFrames = [...refs.values()], x = Math.min(...referenceFrames.map(f => f.x)), y = Math.min(...referenceFrames.map(f => f.y))
    const bounds = { x, y, w: Math.max(...referenceFrames.map(f => f.x + f.w)) - x, h: Math.max(...referenceFrames.map(f => f.y + f.h)) - y }
    const target = fitFrame(bounds, { box: { w: bounds.w * base.screen.w, h: bounds.h * base.screen.h }, constraint: { freeTransform: members.every(u => u.constraint.freeTransform) } }, screen, art)
    for (const member of members) {
      const f = refs.get(member.id)
      member.proofGroup = group.id
      member.frame = { x: target.x + (f.x - bounds.x) / bounds.w * target.w, y: target.y + (f.y - bounds.y) / bounds.h * target.h, w: f.w / bounds.w * target.w, h: f.h / bounds.h * target.h }
    }
  }
  if(base.panel)for(const unit of layout){const node=base.panel.nodes.find(n=>n.id===unit.id);if(node)unit.name=node.name}
  const order = stackOrder(layout.map(u => u.id), base.layerOrder)
  return layout.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
}
export function guideFindings(art, screen, layout, proof = proofForScreen(art,screen)) {
  const issues = []
  const sources = allLayers(art)
  const complexGroups = !proof?.panel ? sources.filter(l => l.children?.length && ((l.opacity ?? 1) < 1 || !['pass through', 'pass-through'].includes(l.sourceBlend || 'pass through'))) : []
  if (complexGroups.length) issues.push({ blocked: false, message: 'PSD group isolation or group opacity needs visual review. Leaf opacity is inherited; exact Photoshop group-overlap compositing is not guaranteed.' })
  if(proof?.panel)for(const node of proof.panel.nodes){
    const required=(node.sourceIds||[]).some(id=>art.layerConstraints?.[id]?.required)||(node.memberIds||[]).some(id=>layout.find(u=>u.id===id)?.required)
    if(required&&(!effectiveVisible(proof.panel,node.id)||[node,...ancestors(proof.panel,node.id)].some(n=>n.opacity===0)||node.fill===0&&!node.fx?.stroke?.enabled||node.mask?.enabled&&node.mask.kind==='path'&&((node.mask.rect?.w??1)<=0||(node.mask.rect?.h??1)<=0)))issues.push({blocked:true,message:`Required layer ${node.name} is hidden, deleted or fully masked.`})
    if(required&&[node,...ancestors(proof.panel,node.id)].some(n=>n.mask?.enabled))issues.push({blocked:false,message:`Required layer ${node.name} is masked. Check that all required content is still visible.`})
  }
  if(proof?.panel?.nodes.some(n=>!n.deleted&&(n.importedEffects||n.type==='group'&&n.mask?.kind==='bitmap'))||sources.some(l=>l.hasMask&&!l.mask))issues.push({blocked:false,message:'Imported effects, vector masks or group bitmap masks need visual comparison with the original PSD. Full Photoshop fidelity is not guaranteed.'})
  for (const unit of layout) for (const id of unit.layerIds) {
    const source = sources.find(l => l.id === id), style = layerStyle(source, proof?.layerStyles?.[id] || proof?.layerStyles?.[source?.wordSourceId])
    if (!BLEND_MODES.includes(style.blend)) issues.push({ blocked: true, message: `Unsupported imported blend mode: ${style.blend}. Choose a supported mode explicitly.` })
    if (style.opacity === 0 && (unit.required || art.layerConstraints?.[id]?.required)) issues.push({ blocked: true, message: `Required layer ${source?.name || id} has 0% opacity.` })
    else if (style.opacity < .25) issues.push({ blocked: false, message: `${source?.name || id} has low opacity. Check readability.` })
  }

  const background = proof?.backgroundTransform
  const stack = proof?.layerOrder || [], bgIndex = stack.indexOf('__background')
  if (bgIndex >= 0 && layout.some(u => stack.indexOf(u.id) > bgIndex)) issues.push({ blocked: layout.some(u => u.required && stack.indexOf(u.id) > bgIndex), message: 'The background is above foreground layers. Check for obscured content; required layers must remain visible.' })
  if(proof?.transforms?.__background)issues.push({blocked:false,message:'The background has an affine transform. Inspect all canvas edges for uncovered areas.'})
  if (background && (background.scale < 100 || background.offsetX || background.offsetY)) issues.push({ blocked: false, message: 'Background has a free transform. Check uncovered or transparent canvas edges before approval.' })
  for (const unit of layout) {
    const f = frameBounds(unit.frame,screen,proof?.transforms?.[unit.id])
    if (f.x < 0 || f.y < 0 || f.x + f.w > 1.00001 || f.y + f.h > 1.00001) issues.push({ blocked: !!unit.required, message: `${unit.name} extends outside the canvas.${unit.required ? ' Required content must be fully visible before approval.' : ' Inspect clipping before approval.'}` })
  }
  for (const link of art.layerLinks || []) {
    const anchors = new Set(link.layerIds.map(id => art.layerConstraints?.[id]?.anchor).filter(a => a && a !== 'free'))
    if (anchors.size > 1) issues.push({ blocked: true, message: 'Linked layers have conflicting edge anchors. Set the same edge on the linked selection in Analyse.' })
  }
  if (layout.some(u => u.proofGroup && u.constraint.anchor && u.constraint.anchor !== 'free')) issues.push({ blocked: true, message: 'An editor group contains edge-anchored elements. Ungroup it before applying individual edge constraints.' })
  if (!layout.length) issues.push({ blocked: true, message: 'No original foreground pixels are available.' })
  if (art.a.source?.format !== 'image' && !layout.some(u => u.role === 'headline')) issues.push({ blocked: true, message: 'Identify the main headline in Analyse before approving this guide.' })
  for (const [id, c] of Object.entries(art.layerConstraints || {})) {
    const pieces = (art.wordPieces || []).filter(p => p.parentId === id)
    const present = pieces.length ? pieces.every(p => layout.some(u => u.layerIds.includes(p.id))) : layout.some(u => u.layerIds.includes(id)) || art.originalBorder?.sourceLayerId === id && allLayers(art).some(l => l.id === id && !l.effectiveHidden)
    if (c.required && !present) issues.push({ blocked: true, message: `Required layer ${allLayers(art).find(l => l.id === id)?.name || id} is hidden or excluded.` })
  }
  for (let i = 0; i < layout.length; i++) for (let j = i + 1; j < layout.length; j++) {
    const a = frameBounds(layout[i].frame,screen,proof?.transforms?.[layout[i].id]), b = frameBounds(layout[j].frame,screen,proof?.transforms?.[layout[j].id])
    if (Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > .005 && Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y) > .005) issues.push({ blocked: false, message: `${layout[i].name} overlaps ${layout[j].name}. Inspect before approval.` })
  }
  if (!art.backgroundRegion) issues.push({ blocked: false, message: 'No reusable background patch confirmed. Inspect background quality.' })
  const originalBorder = borderGeometry(art, screen, layout, proof), border=originalBorder?rectBounds(originalBorder,proof?.transforms?.__border):null
  if (border && (border.x < 0 || border.y < 0 || border.x + border.w > screen.w || border.y + border.h > screen.h)) issues.push({ blocked: false, message: 'The border extends outside the canvas. Inspect its visible edges.' })
  if (border && (border.w <= 0 || border.h <= 0)) issues.push({ blocked: true, message: 'The stamp leaves no usable space for the border. Move or scale it.' })
  if (border) for (const unit of layout.filter(u => u.role !== 'stamp')) {
    const f = unit.frame
    if (f.x * screen.w < border.x || f.y * screen.h < border.y || (f.x + f.w) * screen.w > border.x + border.w || (f.y + f.h) * screen.h > border.y + border.h) issues.push({ blocked: false, message: `${unit.name} extends beyond the rebuilt border. Inspect its placement.` })
  }
  if (screen.faces?.length) issues.push({ blocked: false, message: 'Combined display: inspect each physical face after applying guides.' })
  return issues
}

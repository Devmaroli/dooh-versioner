import { compositeDraw, layerStyle } from './blending.js'
const splitPixels = new WeakMap()
function sourcePiecePixels(layer, piece) {
  if (!piece.sourceClip) return layer.px
  let cached = splitPixels.get(piece)
  if (cached?.source === layer.px) return cached.canvas
  const canvas = document.createElement('canvas'); canvas.width = layer.px.width; canvas.height = layer.px.height
  const g = canvas.getContext('2d'), [x,y,w,h] = layer.box
  g.setTransform(canvas.width/w,0,0,canvas.height/h,-x*canvas.width/w,-y*canvas.height/h)
  g.clip(new Path2D(piece.sourceClip)); g.drawImage(layer.px,x,y,w,h)
  splitPixels.set(piece,{source:layer.px,canvas})
  return canvas
}
export function allLayers(art) {
  const visit = (layers, hidden = false, parentOpacity = 1, parents = []) => layers.flatMap(layer => {
    const off = hidden || !(art.layerVisibility?.[layer.id] ?? !layer.hidden)
    return [{ ...layer, px: layer.px, vectorPdf: layer.vectorPdf, maskPx: layer.maskPx, parentOpacity, parentGroups: parents, crop: art.layerCrops?.[layer.id], logoProtected: art.an?.roles?.some(r => r.id === layer.id && r.role === 'logo') || !!art.layerConstraints?.[layer.id]?.protectedLogo, effectiveHidden: off }, ...visit(layer.children || [], off, parentOpacity * (layer.opacity ?? 1), [...parents, { id: layer.id, blend: layer.sourceBlend || layer.blend || 'pass through', opacity: layer.opacity ?? 1 }])]
  })
  const source = visit(art.a.layers)
  return source.flatMap(layer => {
    const pieces = (art.wordPieces || []).filter(p => p.parentId === layer.id)
    if (!pieces.length || layer.logoProtected) return [layer]
    return [{ ...layer, splitIntoWords: true }, ...pieces.map(piece => ({
      ...layer, originalPixels: layer.px, px: sourcePiecePixels(layer,piece), sourceClip: piece.sourceClip, id: piece.id, name: piece.name, box: [piece.crop.x, piece.crop.y, piece.crop.w, piece.crop.h], sourceBox: layer.box,
      crop: piece.crop, vectorWord: !!piece.vector, wordSourceId: layer.id, effectiveHidden: layer.effectiveHidden || art.layerVisibility?.[piece.id] === false,
    }))]
  })
}

export function unionBounds(layers, fallback) {
  const boxes = layers.map(l => l.box).filter(b => b && b[2] > 0 && b[3] > 0)
  if (!boxes.length) return fallback
  const x = Math.min(...boxes.map(b => b[0])), y = Math.min(...boxes.map(b => b[1]))
  return { x, y, w: Math.max(...boxes.map(b => b[0] + b[2])) - x, h: Math.max(...boxes.map(b => b[1] + b[3])) - y }
}

export function selectLayers(current, index, layers, modifiers, previousIndex) {
  if (modifiers.shiftKey) {
    const range = layers.slice(Math.min(previousIndex, index), Math.max(previousIndex, index) + 1).map(l => l.id)
    return [...new Set(modifiers.ctrlKey || modifiers.metaKey ? [...current, ...range] : range)]
  }
  const id = layers[index].id
  return modifiers.ctrlKey || modifiers.metaKey ? current.includes(id) ? current.filter(x => x !== id) : [...current, id] : [id]
}

export function drawSourceLayers(ctx, layers, showSplitSource = false, raw = false) {
  layers.slice().reverse().forEach(layer => {
    if (layer.effectiveHidden || !layer.px || !layer.box || layer.splitIntoWords && !showSplitSource) return
    const draw = g => {
      g.save()
      if (layer.crop) { const c = layer.crop; g.beginPath(); g.rect(c.x, c.y, c.w, c.h); g.clip() }
      g.drawImage(layer.px, ...(layer.sourceBox || layer.box)); g.restore()
    }
    const [x, y, w, h] = layer.box
    if (raw) draw(ctx)
    else compositeDraw(ctx, draw, layerStyle(layer), { x, y, w, h })
  })
}

export function linkLayers(links, selected, id) {
  const members = new Set(selected)
  let merged = true
  while (merged) {
    merged = false
    for (const link of links) if (link.layerIds.some(x => members.has(x))) {
      for (const member of link.layerIds) if (!members.has(member)) { members.add(member); merged = true }
    }
  }
  return [...links.filter(link => !link.layerIds.some(x => members.has(x))), { id, layerIds: [...members] }]
}

export function unlinkLayers(links, selected) {
  return links.map(link => ({ ...link, layerIds: link.layerIds.filter(id => !selected.includes(id)) })).filter(link => link.layerIds.length > 1)
}

export function setLayerVisibility(art, ids, visible) {
  const next = { ...art.layerVisibility, ...Object.fromEntries(ids.map(id => [id, visible])) }
  function visit(layers, parents = []) {
    for (const layer of layers) {
      if (visible && ids.includes(layer.id)) parents.forEach(id => { next[id] = true })
      visit(layer.children || [], [...parents, layer.id])
    }
  }
  visit(art.a.layers)
  art.layerVisibility = next
}

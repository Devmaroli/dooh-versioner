import { allLayers, unlinkLayers } from './artwork.js'
import { detectSourceBorder, borderInterior } from './border.js'
import { splitSourceWords } from './words.js'
import { invalidateBackground } from './background.js'

export function prepareSourceText(art, id, action) {
  const layer = allLayers(art).find(l => l.id === id)
  if (!layer?.px || layer.logoProtected || layer.wordSourceId || layer.splitIntoWords) throw new Error('Select one original headline layer. Logos and existing word pieces stay intact.')
  if (art.an.roles.find(r => r.id === id)?.role !== 'headline') throw new Error('Identify this source as the main headline first.')
  if (action === 'border') {
    if (art.originalBorder && art.originalBorder.sourceLayerId !== id) throw new Error('A different border is already traced. Restore it in Analyse before replacing it.')
    const g = layer.px.getContext('2d'), data = g.getImageData(0, 0, layer.px.width, layer.px.height).data
    let left = layer.px.width, top = layer.px.height, right = -1, bottom = -1
    for (let y = 0; y < layer.px.height; y++) for (let x = 0; x < layer.px.width; x++) {
      const i = (y * layer.px.width + x) * 4
      if (data[i + 3] < 100 || Math.max(data[i], data[i + 1], data[i + 2]) > 120) continue
      left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y)
    }
    const [x, y, w, h] = layer.box
    const rect = { x: x + left / layer.px.width * w, y: y + top / layer.px.height * h, w: (right - left + 1) / layer.px.width * w, h: (bottom - top + 1) / layer.px.height * h }
    const color = detectSourceBorder(layer, rect), thickness = 6
    if (!color) throw new Error('No reliable rectangular border detected. Trace the original border in Analyse; no new border was invented.')
    const crop = borderInterior(layer, rect, thickness)
    if (!crop) throw new Error('No text interior detected. Use Analyse for a separate border-only layer.')
    art.originalBorder = { sourceLayerId: id, sourceRect: rect, color, thickness, margin: 4, shared: true, previousCrop: art.originalBorder?.previousCrop || art.layerCrops?.[id] || null, previousRole: { ...art.an.roles.find(r => r.id === id) } }
    art.layerCrops = { ...art.layerCrops, [id]: crop }
    invalidateBackground(art)
    return { message: 'Original border detected and rebuilt as a separate vector layer. Review all five guides.', pieces: [] }
  }
  const pieces = splitSourceWords(layer).map((crop, index) => ({ id: crypto.randomUUID(), parentId: id, vector: !!layer.vectorPdf, name: `Word ${index + 1} · ${layer.vectorPdf ? 'embedded vector' : 'source pixels'}`, crop }))
  art.wordPieces = [...(art.wordPieces || []), ...pieces]
  for (const piece of pieces) {
    art.an.roles.push({ id: piece.id, role: 'headline', confidence: 1, why: 'Designer-requested source-pixel word separation' })
    art.layerConstraints = { ...art.layerConstraints, [piece.id]: { required: true, anchor: 'free', orientation: 'preserve' } }
  }
  art.layerLinks = unlinkLayers(art.layerLinks || [], [id])
  invalidateBackground(art)
  return { message: layer.vectorPdf ? `Separated ${pieces.length} words backed by the embedded Illustrator vector source. Preview and export render each crop at its requested resolution. Review all five guides.` : `Separated ${pieces.length} source-pixel words. No embedded vector source is available. Review all five guides.`, pieces }
}

export function prepareAnyLayer(art, id) {
  const layer = allLayers(art).find(item => item.id === id)
  if (layer?.children?.length) throw new Error('Prepare a layer inside the group. A folder is not flattened into new artwork.')
  if (!layer?.px || layer.wordSourceId || layer.splitIntoWords) throw new Error('Select one original layer. Existing split pieces stay as they are.')
  if (layer.logoProtected && art.layerConstraints?.[id]?.allowSplit !== true) throw new Error('This logo is protected. Allow split on this layer before separating it.')
  const verifiedVector = !!layer.vectorPdf
  const pieces = splitSourceWords(layer).map((crop, index) => ({
    id: crypto.randomUUID(), parentId: id, vector: verifiedVector,
    name: verifiedVector ? `Part ${index + 1} · embedded vector` : `Part ${index + 1} · raster`,
    crop,
  }))
  const group = { id: crypto.randomUUID(), name: `${layer.name || 'Layer'} split`, layerIds: pieces.map(piece => piece.id), source: verifiedVector ? 'vector' : 'raster' }
  art.wordPieces = [...(art.wordPieces || []), ...pieces]
  art.preparationGroups = [...(art.preparationGroups || []), group]
  const role = art.an.roles.find(item => item.id === id)?.role || 'other'
  for (const piece of pieces) {
    art.an.roles.push({ id: piece.id, role, confidence: 1, why: verifiedVector ? 'Split from a verified embedded vector source' : 'Raster source-pixel separation. No paths were invented.' })
    art.layerConstraints = { ...art.layerConstraints, [piece.id]: { required: false, anchor: 'free', orientation: 'preserve' } }
  }
  art.layerLinks = unlinkLayers(art.layerLinks || [], [id])
  invalidateBackground(art)
  return { message: verifiedVector ? `Split ${pieces.length} parts from the embedded vector source into “${group.name}”.` : `Separated ${pieces.length} raster pieces from source pixels into “${group.name}”. No vector paths were invented.`, pieces, group }
}

import { readPsd, writePsdUint8Array } from 'ag-psd'
import { allLayers } from '../artwork.js'
import { panelForArtwork } from '../layerPanelAdapter'
import { guideLayout, proofForScreen } from '../layoutGuides.js'
import { renderLayerPixels } from './render.js'

export const psdBlend = mode => (mode || 'normal').replaceAll('-', ' ')

// Crop only transparent margins. Never downsample production pixels.
function croppedPixels(canvas) {
  const image = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
  let left = canvas.width, top = canvas.height, right = -1, bottom = -1
  for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) if (image.data[(y * image.width + x) * 4 + 3]) {
    left = Math.min(left, x); top = Math.min(top, y); right = Math.max(right, x); bottom = Math.max(bottom, y)
  }
  if (right < left) return {}
  const width = right - left + 1, height = bottom - top + 1, data = new Uint8ClampedArray(width * height * 4)
  for (let y = 0; y < height; y++) data.set(image.data.subarray(((top + y) * image.width + left) * 4, ((top + y) * image.width + left + width) * 4), y * width * 4)
  return { left, top, imageData: { width, height, data } }
}

/** Adapted pixels remain independent layers with native blend/opacity. Native
 * source objects are retained in a hidden reference folder, never mislabelled
 * as reconstructed vectors in the adapted stack. */
export async function exportLayeredPsd(art, screen, composite) {
  if (screen.w > 30000 || screen.h > 30000) throw new Error('This screen exceeds PSD dimensions. Export PNG or PDF instead.')
  const proof = proofForScreen(art, screen), layout = guideLayout(art, screen, proof), panel = panelForArtwork(art, layout, proof), sources = allLayers(art)
  const unsupported = panel.nodes.find(n => !n.deleted && (n.type === 'adjustment' && ((n.adjustment?.brightness || 0) || (n.adjustment?.contrast || 0)) || n.type === 'group' && (n.mask?.enabled || n.fx?.stroke?.enabled)))
  if (unsupported) throw new Error(`PSD cannot faithfully reproduce the current effect on “${unsupported.name}”. Use PNG/PDF, or disable that adjustment/group effect before PSD export.`)
  const links = new Map(), linkNumber = id => { if (!links.has(id)) links.set(id, links.size + 1); return links.get(id) }
  async function layer(node) {
    const result = {
      name: node.name, hidden: !node.visible, blendMode: psdBlend(node.blendMode), opacity: node.opacity,
      protected: { transparency: node.locks.transparency, composite: node.locks.pixels, position: node.locks.position, artboards: node.locks.artboards, all: node.locks.all },
      ...(node.linkId ? { linkGroup: linkNumber(node.linkId), linkGroupEnabled: true } : {}),
    }
    if (node.type === 'group') { result.fillOpacity = node.fill; result.children = await children(node.id); return result }
    if (node.empty || node.type === 'adjustment') return result
    const unit = layout.find(u => u.id === node.id)
    if (unit?.layerIds.length > 1) {
      result.blendMode = 'pass through'; result.opacity = 1; result.children = []
      for (const id of unit.layerIds.slice().reverse()) {
        const source = sources.find(s => s.id === id), appearance = proof?.layerStyles?.[id] || {}
        const canvas = renderLayerPixels(art, screen, proof, node.id, node, id)
        try { result.children.push({ name: source.name, blendMode: psdBlend(appearance.blend ?? source.blend ?? source.sourceBlend), opacity: appearance.opacity ?? source.opacity ?? 1, ...croppedPixels(canvas) }) }
        finally { canvas.width = 1; canvas.height = 1 }
      }
      return result
    }
    const canvas = renderLayerPixels(art, screen, proof, node.id, node)
    try { return { ...result, ...croppedPixels(canvas) } }
    finally { canvas.width = 1; canvas.height = 1 }
  }
  async function children(parentId) {
    const result = []
    // App rows are top first; ag-psd children are bottom first.
    for (const node of panel.nodes.filter(n => !n.deleted && n.parentId === parentId).reverse()) {
      result.push(await layer(node)); await new Promise(resolve => setTimeout(resolve, 0))
    }
    return result
  }
  const adapted = await children(null)
  const source = art.a.psdBuffer ? readPsd(new Uint8Array(art.a.psdBuffer), { skipThumbnail: true, skipCompositeImageData: true, useImageData: true, totalMemoryLimit: 256 * 1024 * 1024 }) : null
  const original = source?.children || [{ name: art.name, canvas: art.a.composite, left: 0, top: 0 }]
  const document = { width: screen.w, height: screen.h, canvas: composite, linkedFiles: source?.linkedFiles, patterns: source?.patterns,
    children: [{ name: 'Original source — native layers, original coordinates (hidden)', hidden: true, blendMode: 'pass through', children: original }, ...adapted] }
  return writePsdUint8Array(document, { generateThumbnail: false, noBackground: true, compress: true })
}

import { svgStyles, svgElement } from './svgStyle.js'
// Linear SVG reader. It does not use a backtracking expression on the whole file,
// so a multi-megabyte Illustrator export with embedded images stays parseable.

const IDENTITY = [1, 0, 0, 1, 0, 0]
const DRAWING = new Set(['path', 'rect', 'circle', 'ellipse', 'polygon', 'polyline', 'line'])

function multiply(a, b) {
  return [
    a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5],
  ]
}
function applyPoint(m, x, y) {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]]
}
function corners(m, x, y, w, h) {
  return [applyPoint(m, x, y), applyPoint(m, x + w, y), applyPoint(m, x, y + h), applyPoint(m, x + w, y + h)]
}
function boxFromPoints(points) {
  const xs = points.map(p => p[0]), ys = points.map(p => p[1])
  const x = Math.min(...xs), y = Math.min(...ys)
  return [x, y, Math.max(...xs) - x, Math.max(...ys) - y]
}

export function extractEmbeddedImages(svg) {
  const images = []
  let out = ''
  let cursor = 0
  const markers = ['href', 'xlink:href']
  while (cursor < svg.length) {
    let at = -1, marker = ''
    for (const candidate of markers) {
      const found = svg.indexOf(candidate, cursor)
      if (found >= 0 && (at < 0 || found < at)) { at = found; marker = candidate }
    }
    if (at < 0) { out += svg.slice(cursor); break }
    let quoteAt = at + marker.length
    while (quoteAt < svg.length && /\s/.test(svg[quoteAt])) quoteAt++
    if (svg[quoteAt] !== '=') { out += svg.slice(cursor, quoteAt); cursor = quoteAt; continue }
    quoteAt++
    while (quoteAt < svg.length && /\s/.test(svg[quoteAt])) quoteAt++
    const quote = svg[quoteAt]
    if (quote !== '"' && quote !== "'") { out += svg.slice(cursor, at + marker.length); cursor = at + marker.length; continue }
    const valueStart = quoteAt + 1
    const valueEnd = svg.indexOf(quote, valueStart)
    if (valueEnd < 0) { out += svg.slice(cursor); break }
    out += svg.slice(cursor, valueStart)
    const value = svg.slice(valueStart, valueEnd)
    if (value.startsWith('data:image/') || value.startsWith('data:application/octet-stream')) {
      images.push(decodeDataUri(value))
      out += `data:placeholder/${images.length - 1}`
    } else out += value
    cursor = valueEnd
  }
  return { svg: out, images }
}

export function decodeDataUri(uri) {
  const comma = uri.indexOf(',')
  const meta = uri.slice(5, comma < 0 ? uri.length : comma)
  const body = comma < 0 ? '' : uri.slice(comma + 1).replace(/\s+/g, '')
  const mime = (meta.split(';')[0] || 'image/png').toLowerCase()
  if (!/base64/i.test(meta)) return { mime, base64: null, text: decodeURIComponent(body) }
  return { mime, base64: body }
}

function parseAttrs(source) {
  const attrs = {}
  let i = 0
  while (i < source.length) {
    while (i < source.length && /\s/.test(source[i])) i++
    if (i >= source.length) break
    const nameStart = i
    while (i < source.length && source[i] !== '=' && !/\s/.test(source[i])) i++
    const name = source.slice(nameStart, i).trim()
    while (i < source.length && /\s/.test(source[i])) i++
    if (source[i] !== '=') continue
    i++
    while (i < source.length && /\s/.test(source[i])) i++
    const quote = source[i]
    if (quote !== '"' && quote !== "'") continue
    const end = source.indexOf(quote, i + 1)
    if (end < 0) break
    attrs[name] = source.slice(i + 1, end)
    i = end + 1
  }
  return attrs
}

export function parseSvgTree(svg) {
  const root = { name: 'root', attrs: {}, children: [] }
  const stack = [root]
  let i = 0
  while (i < svg.length) {
    const start = svg.indexOf('<', i)
    if (start < 0) break
    if (svg.startsWith('<!--', start)) { const end = svg.indexOf('-->', start); i = end < 0 ? svg.length : end + 3; continue }
    if (svg.startsWith('<![', start) || svg.startsWith('<?', start)) { const end = svg.indexOf('>', start); i = end < 0 ? svg.length : end + 1; continue }
    const end = svg.indexOf('>', start)
    if (end < 0) break
    let raw = svg.slice(start + 1, end).trim()
    const selfClosing = raw.endsWith('/')
    if (selfClosing) raw = raw.slice(0, -1).trim()
    if (raw.startsWith('/')) {
      const closing = raw.slice(1).split(/\s/)[0].toLowerCase().replace(/^.*:/, '')
      if (stack.length > 1 && stack[stack.length - 1].name === closing) stack.pop()
      i = end + 1
      continue
    }
    const space = raw.search(/\s/)
    const name = (space < 0 ? raw : raw.slice(0, space)).toLowerCase().replace(/^.*:/, '')
    const attrs = parseAttrs(space < 0 ? '' : raw.slice(space))
    const node = { name, attrs, children: [] }
    stack[stack.length - 1].children.push(node)
    if (!selfClosing && !['path', 'rect', 'circle', 'ellipse', 'line', 'image', 'polygon', 'polyline', 'use'].includes(name)) stack.push(node)
    i = end + 1
    if (name === 'style' || name === 'text' || name === 'tspan') {
      const close = svg.toLowerCase().indexOf(`</${name}`, i)
      if (close >= 0) { node.text = name === 'style' ? svg.slice(i, close).replace(/^\s*<!\[CDATA\[|\]\]>\s*$/g, '') : svg.slice(i, close).replace(/<[^>]+>/g, ''); i = close }
    }
  }
  return root.children.find(node => node.name === 'svg') || null
}

function styleMap(value = '') {
  const out = {}
  for (const part of value.split(';')) {
    const colon = part.indexOf(':')
    if (colon < 0) continue
    out[part.slice(0, colon).trim().toLowerCase()] = part.slice(colon + 1).trim()
  }
  return out
}
function paint(attrs, style, key) {
  return attrs[key] || style[key] || null
}
function lengthOf(value, fallback = 0) {
  if (value == null || value === '') return fallback
  const number = parseFloat(String(value).replace(/px|pt$/i, ''))
  return Number.isFinite(number) ? number : fallback
}
function opacityOf(value) {
  const n = lengthOf(value, 1) / (String(value).endsWith('%') ? 100 : 1)
  return Math.max(0, Math.min(1, n))
}
function parseTransform(value) {
  if (!value) return IDENTITY
  const calls = []
  let i = 0
  while (i < value.length) {
    const nameStart = value.slice(i).search(/[A-Za-z]/)
    if (nameStart < 0) break
    i += nameStart
    const paren = value.indexOf('(', i)
    if (paren < 0) break
    const name = value.slice(i, paren).trim().toLowerCase()
    const close = value.indexOf(')', paren)
    if (close < 0) break
    const numbers = value.slice(paren + 1, close).trim().split(/[\s,]+/).filter(Boolean).map(Number)
    calls.push([name, numbers])
    i = close + 1
  }
  let matrix = IDENTITY
  for (const [name, n] of calls) {
    let local = IDENTITY
    if (name === 'matrix' && n.length >= 6) local = n.slice(0, 6)
    else if (name === 'translate') local = [1, 0, 0, 1, n[0] || 0, n[1] || 0]
    else if (name === 'scale') local = [n[0] || 1, 0, 0, n[1] ?? n[0] ?? 1, 0, 0]
    else if (name === 'rotate') {
      const radians = (n[0] || 0) * Math.PI / 180, cos = Math.cos(radians), sin = Math.sin(radians)
      const cx = n[1] || 0, cy = n[2] || 0
      local = multiply(multiply([1, 0, 0, 1, cx, cy], [cos, sin, -sin, cos, 0, 0]), [1, 0, 0, 1, -cx, -cy])
    }
    if (name === 'skewx') local = [1, 0, Math.tan((n[0] || 0) * Math.PI / 180), 1, 0, 0]
    else if (name === 'skewy') local = [1, Math.tan((n[0] || 0) * Math.PI / 180), 0, 1, 0, 0]
    matrix = multiply(matrix, local)
  }
  return matrix
}

function pathBounds(d) {
  const tokens = String(d).match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/gi) || []
  const points = []
  let index = 0, command = '', x = 0, y = 0, startX = 0, startY = 0
  const read = () => Number(tokens[index++])
  while (index < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[index])) command = tokens[index++]
    if (!command) break
    const relative = command === command.toLowerCase()
    const code = command.toLowerCase()
    if (code === 'z') { x = startX; y = startY; points.push([x, y]); command = ''; continue }
    if (code === 'h') { x = relative ? x + read() : read(); points.push([x, y]); continue }
    if (code === 'v') { y = relative ? y + read() : read(); points.push([x, y]); continue }
    if (code === 'm') { x = relative ? x + read() : read(); y = relative ? y + read() : read(); startX = x; startY = y; points.push([x, y]); command = relative ? 'l' : 'L'; continue }
    if (code === 'l' || code === 't') { x = relative ? x + read() : read(); y = relative ? y + read() : read(); points.push([x, y]); continue }
    if (code === 'c') { const values = [read(), read(), read(), read(), read(), read()]; points.push([relative ? x + values[0] : values[0], relative ? y + values[1] : values[1]], [relative ? x + values[2] : values[2], relative ? y + values[3] : values[3]]); x = relative ? x + values[4] : values[4]; y = relative ? y + values[5] : values[5]; points.push([x, y]); continue }
    if (code === 's' || code === 'q') { const values = [read(), read(), read(), read()]; points.push([relative ? x + values[0] : values[0], relative ? y + values[1] : values[1]]); x = relative ? x + values[2] : values[2]; y = relative ? y + values[3] : values[3]; points.push([x, y]); continue }
    if (code === 'a') { index += 5; x = relative ? x + read() : read(); y = relative ? y + read() : read(); points.push([x, y]); continue }
    break
  }
  return points.length ? boxFromPoints(points) : [0, 0, 0, 0]
}

export function splitSubpaths(d) {
  const parts = []
  const tokens = String(d).match(/[Mm][^Mm]*/g) || []
  for (const token of tokens) if (token.trim()) parts.push(token.trim())
  return parts
}

function hrefOf(attrs) {
  return attrs.href || attrs['xlink:href'] || attrs['href'] || ''
}

function imageSource(href, embedded) {
  if (!href) return { missingLink: true, linkName: '', warning: 'An image element has no address.' }
  if ((/^[a-z][a-z0-9+.-]*:/i.test(href) && !href.startsWith('data:')) || href.startsWith('//')) return { missingLink: true, linkName: href, remote: true, warning: `Remote image was not downloaded: ${href}` }
  if (href.startsWith('data:placeholder/')) {
    const image = embedded[Number(href.slice('data:placeholder/'.length))]
    return image ? { imageSource: 'embedded', embedded: image } : { missingLink: true, linkName: href, warning: 'An embedded image could not be read.' }
  }
  if (href.startsWith('data:')) return { imageSource: 'embedded', embedded: decodeDataUri(href) }
  const linkName = decodeURIComponent(href.split(/[?#]/)[0].split(/[\\/]/).pop() || href)
  return { imageSource: 'linked', linkName }
}

export function parseSvgArtwork(svg, file = 'artwork.svg', files = new Map()) {
  const stripped = extractEmbeddedImages(String(svg).replace(/^\uFEFF/, ''))
  const tree = parseSvgTree(stripped.svg)
  if (!tree) throw new Error('This SVG has no svg element.')
  const styles = svgStyles(tree)
  const rootStyle = styles.compute(tree)
  const viewBox = (tree.attrs.viewBox || '').trim().split(/[\s,]+/).map(Number)
  const width = viewBox.length === 4 && viewBox[2] > 0 ? viewBox[2] : lengthOf(tree.attrs.width || rootStyle.width)
  const height = viewBox.length === 4 && viewBox[3] > 0 ? viewBox[3] : lengthOf(tree.attrs.height || rootStyle.height)
  if (!(width > 0) || !(height > 0)) throw new Error('This SVG has no viewBox or width and height.')
  const clips = new Map()
  const warnings = []
  let serial = 0
  const gradients = new Map()
  function gradient(id, seen = new Set()) {
    if (gradients.has(id)) return gradients.get(id)
    const node = styles.ids.get(id)
    if (!node || !['lineargradient', 'radialgradient'].includes(node.name) || seen.has(id)) return null
    seen.add(id)
    const base = gradient(hrefOf(node.attrs).slice(1), seen)
    const attrs = { ...(base?.attrs || {}), ...node.attrs }
    delete attrs.href; delete attrs['xlink:href']
    const ownStops = node.children.filter(c => c.name === 'stop').map(c => styles.original(c))
    const stops = ownStops.length ? ownStops : base?.stops || []
    const type = node.name === 'lineargradient' ? 'linearGradient' : 'radialGradient'
    const value = { type, attrs, stops, svg: svgElement(type, attrs, stops.map(stop => svgElement('stop', stop)).join('')) }
    gradients.set(id, value)
    return value
  }
  for (const [id, node] of styles.ids) if (node.name.endsWith('gradient')) gradient(id)
  function paintGradient(value) {
    const id = (value || '').match(/url\(\s*['"]?#([^)'"\s]+)['"]?\s*\)/)?.[1]
    return id ? gradients.get(id) || null : null
  }

  function clipFor(attrs) {
    const ref = (attrs['clip-path'] || styleMap(attrs.style)['clip-path'] || '').match(/url\(#([^)]+)\)/)
    return ref ? clips.get(ref[1]) || null : null
  }
  function rememberClips(node) {
    if (node.name === 'clippath') {
      const id = node.attrs.id
      const path = node.children.find(child => child.attrs.d) || node.children[0]
      if (id && path) clips.set(id, path.attrs.d ? { d: path.attrs.d } : { rect: [lengthOf(path.attrs.x), lengthOf(path.attrs.y), lengthOf(path.attrs.width), lengthOf(path.attrs.height)] })
    }
    node.children.forEach(rememberClips)
  }
  rememberClips(tree)
  function localBox(node) {
    const a = node.attrs
    if (node.name === 'rect' || node.name === 'image') return [lengthOf(a.x), lengthOf(a.y), lengthOf(a.width), lengthOf(a.height)]
    if (node.name === 'circle') { const r = lengthOf(a.r); return [lengthOf(a.cx) - r, lengthOf(a.cy) - r, r * 2, r * 2] }
    if (node.name === 'ellipse') { const rx = lengthOf(a.rx), ry = lengthOf(a.ry); return [lengthOf(a.cx) - rx, lengthOf(a.cy) - ry, rx * 2, ry * 2] }
    if (node.name === 'line') return boxFromPoints([[lengthOf(a.x1), lengthOf(a.y1)], [lengthOf(a.x2), lengthOf(a.y2)]])
    if (a.d || node.name === 'polygon' || node.name === 'polyline') return pathBounds(shapePath(node))
    return [0, 0, 0, 0]
  }
  function elementBox(node, matrix) {
    const local = localBox(node)
    return boxFromPoints(corners(matrix, local[0], local[1], local[2], local[3]))
  }
  function shapePath(node) {
    const a = node.attrs
    if (a.d) return a.d
    if (node.name === 'rect') return `M${lengthOf(a.x)} ${lengthOf(a.y)}h${lengthOf(a.width)}v${lengthOf(a.height)}h${-lengthOf(a.width)}z`
    if (node.name === 'circle') { const r = lengthOf(a.r), cx = lengthOf(a.cx), cy = lengthOf(a.cy); return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0` }
    if (node.name === 'ellipse') { const rx = lengthOf(a.rx), ry = lengthOf(a.ry), cx = lengthOf(a.cx), cy = lengthOf(a.cy); return `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0` }
    if (node.name === 'line') return `M${lengthOf(a.x1)} ${lengthOf(a.y1)}L${lengthOf(a.x2)} ${lengthOf(a.y2)}`
    if (node.name === 'polygon' || node.name === 'polyline') {
      const pairs = (a.points || '').trim().split(/[\s,]+/).map(Number)
      let d = ''
      for (let p = 0; p < pairs.length - 1; p += 2) d += `${p === 0 ? 'M' : 'L'}${pairs[p]} ${pairs[p + 1]}`
      return node.name === 'polygon' ? `${d}z` : d
    }
    return ''
  }
  function visit(node, matrix, inheritedClip = null, parentStyle = rootStyle, parents = [tree], seen = new Set()) {
    if (node.name === 'defs' || node.name === 'clippath' || node.name === 'style' || node.name === 'metadata') return []
    const computed = styles.compute(node, parentStyle, parents)
    if (computed.display === 'none') return []
    const original = node
    node = { ...node, attrs: computed }
    const next = multiply(matrix, parseTransform(node.attrs.transform))
    if (node.name === 'use') {
      const id = hrefOf(node.attrs).slice(1), target = styles.ids.get(id)
      if (!hrefOf(node.attrs).startsWith('#') || !target || seen.has(id)) { warnings.push(`Unresolved or cyclic SVG use ${id}. Needs review.`); return [] }
      const chain = new Set(seen); chain.add(id)
      let placement = multiply(next, [1, 0, 0, 1, lengthOf(node.attrs.x), lengthOf(node.attrs.y)])
      if (target.name === 'symbol') {
        const vb = (target.attrs.viewBox || '').split(/[\s,]+/).map(Number)
        if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
          const sx = lengthOf(node.attrs.width, vb[2]) / vb[2], sy = lengthOf(node.attrs.height, vb[3]) / vb[3]
          const aspect = target.attrs.preserveAspectRatio || 'xMidYMid meet'
          const scale = aspect.includes('slice') ? Math.max(sx, sy) : Math.min(sx, sy)
          const scaleX = aspect === 'none' ? sx : scale, scaleY = aspect === 'none' ? sy : scale
          const alignX = aspect.includes('xMax') ? 1 : aspect.includes('xMin') ? 0 : .5
          const alignY = aspect.includes('YMax') ? 1 : aspect.includes('YMin') ? 0 : .5
          placement = multiply(placement, [scaleX, 0, 0, scaleY, (lengthOf(node.attrs.width, vb[2]) - vb[2] * scaleX) * alignX - vb[0] * scaleX, (lengthOf(node.attrs.height, vb[3]) - vb[3] * scaleY) * alignY - vb[1] * scaleY])
        }
      }
      const children = visit(target, placement, inheritedClip, computed, [...parents, original], chain)
      if (!children.length) return []
      return [{ id: `svg${serial++}`, name: node.attrs.id || 'Use', kind: 'group', box: union(children), opacity: opacityOf(computed.opacity), children, sourceKind: 'svg-group' }]
    }
    const clip = clipFor(node.attrs) || inheritedClip
    const style = styleMap(node.attrs.style)
    const opacity = opacityOf(node.attrs.opacity ?? style.opacity)
    if (node.name === 'g' || node.name === 'svg' || node.name === 'symbol' || node.name === 'a') {
      const children = node.children.flatMap(child => visit(child, next, clip, computed, [...parents, original], seen))
      if (node.name !== 'g' && opacity === 1 || !children.length) return children
      const box = union(children)
      return [{ id: `svg${serial++}`, name: node.attrs['inkscape:label'] || node.attrs.id || 'Group', kind: 'group', box, opacity, children, sourceKind: 'svg-group' }]
    }
    if (computed.visibility === 'hidden' || computed.visibility === 'collapse') return []
    if (node.name === 'image') {
      const source = imageSource(hrefOf(node.attrs), stripped.images)
      let box = elementBox(node, next)
      if (!(box[2] > 0) || !(box[3] > 0)) box = [lengthOf(node.attrs.x), lengthOf(node.attrs.y), 32, 32]
      const layer = { id: `svg${serial++}`, name: node.attrs['inkscape:label'] || node.attrs.id || source.linkName || 'Image', kind: 'image', box, localBox: localBox(node), opacity, preserveAspectRatio: computed.preserveAspectRatio || 'xMidYMid meet', clip, transform: next, sourceKind: source.imageSource || 'linked', imageSource: source.imageSource || 'linked', linkName: source.linkName || '', missingLink: !!source.missingLink, remote: !!source.remote }
      if (source.embedded) layer.embeddedImage = source.embedded
      if (source.warning) warnings.push(source.warning)
      if (source.linkName && !source.remote && !source.embedded) {
        const file = files.get(String(source.linkName).toLowerCase())
        if (file) layer.linkedFile = file
        else { layer.missingLink = true; warnings.push(`Missing linked image ${source.linkName}. Needs review.`) }
      }
      return [layer]
    }
    if (node.name === 'text') {
      const text = (node.text || node.children.map(child => child.text || '').join(' ')).replace(/\s+/g, ' ').trim()
      if (!text) return []
      const size = lengthOf(node.attrs['font-size'] || style['font-size'], 16)
      const anchor = node.attrs['text-anchor'] || style['text-anchor']
      const x = lengthOf(node.attrs.x), y = lengthOf(node.attrs.y)
      const width = Math.max(size, text.length * size * 0.55)
      const local = [anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x, y - size, width, size * 1.25]
      return [{ id: `svg${serial++}`, name: node.attrs.id || text.slice(0, 32), kind: 'text', text, font: (node.attrs['font-family'] || style['font-family'] || 'serif').split(',')[0].replace(/['"]/g, '').trim(), size, fontWeight: computed['font-weight'] || 'normal', fontStyle: computed['font-style'] || 'normal', textX: x, textY: y, textAnchor: anchor || 'start', fillGradient: paintGradient(computed.fill), strokeGradient: paintGradient(computed.stroke), svgFillOpacity: opacityOf(computed['fill-opacity']), svgStrokeOpacity: opacityOf(computed['stroke-opacity']), stroke: computed.stroke || 'none', strokeWidth: lengthOf(computed['stroke-width'], 1), fontStatus: 'unresolved', editable: false, color: paint(node.attrs, style, 'fill') || '#000', box: boxFromPoints(corners(next, ...local)), opacity, transform: next, sourceKind: 'svg-text' }]
    }
    if (DRAWING.has(node.name)) {
      const d = shapePath(node)
      let box = elementBox(node, next)
      const strokeWidth = computed.stroke && computed.stroke !== 'none' ? lengthOf(computed['stroke-width'], 1) : 0
      if (strokeWidth) {
        const [x, y, w, h] = localBox(node), pad = strokeWidth / 2
        box = boxFromPoints(corners(next, x - pad, y - pad, w + pad * 2, h + pad * 2))
      }
      if (!(box[2] > 0) || !(box[3] > 0)) return []
      return [{ id: `svg${serial++}`, name: node.attrs['inkscape:label'] || node.attrs.id || node.name, kind: 'shape', pathData: d, fill: paint(node.attrs, style, 'fill') || '#000', stroke: paint(node.attrs, style, 'stroke'), strokeWidth: lengthOf(node.attrs['stroke-width'] || style['stroke-width'], 1), localBox: localBox(node), fillGradient: paintGradient(computed.fill), strokeGradient: paintGradient(computed.stroke), svgShape: svgElement(node.name, { ...computed, opacity: 1, transform: null }), box, opacity, clip, transform: next, sourceKind: 'svg-path' }]
    }
    return node.children.flatMap(child => visit(child, next, clip, computed, [...parents, original], seen))
  }
  const origin = viewBox.length === 4 ? [1, 0, 0, 1, -viewBox[0], -viewBox[1]] : IDENTITY
  const layers = visit(tree, origin, null, {}, [])
  function topFirst(nodes) { nodes.reverse(); for (const node of nodes) if (node.children) topFirst(node.children) }
  topFirst(layers)
  return { w: width, h: height, topFirst: true, layers, warnings, fontFiles: [...files.values()].filter(file => /\.(otf|ttf)$/i.test(file.name)), source: { format: 'svg', file } }
}

function union(layers) {
  const boxes = layers.map(layer => layer.box).filter(box => box && box[2] > 0 && box[3] > 0)
  if (!boxes.length) return [0, 0, 0, 0]
  const x = Math.min(...boxes.map(box => box[0])), y = Math.min(...boxes.map(box => box[1]))
  return [x, y, Math.max(...boxes.map(box => box[0] + box[2])) - x, Math.max(...boxes.map(box => box[1] + box[3])) - y]
}

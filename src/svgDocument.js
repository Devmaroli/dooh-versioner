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
  const markers = ['href=', 'xlink:href=']
  while (cursor < svg.length) {
    let at = -1, marker = ''
    for (const candidate of markers) {
      const found = svg.indexOf(candidate, cursor)
      if (found >= 0 && (at < 0 || found < at)) { at = found; marker = candidate }
    }
    if (at < 0) { out += svg.slice(cursor); break }
    let quoteAt = at + marker.length
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
    if (name === 'text' || name === 'tspan') {
      const close = svg.toLowerCase().indexOf(`</${name}`, i)
      if (close >= 0) { node.text = svg.slice(i, close).replace(/<[^>]+>/g, ''); i = close }
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
  const rootStyle = styleMap(tree.attrs.style)
  const viewBox = (tree.attrs.viewBox || '').trim().split(/[\s,]+/).map(Number)
  const width = viewBox.length === 4 && viewBox[2] > 0 ? viewBox[2] : lengthOf(tree.attrs.width || rootStyle.width)
  const height = viewBox.length === 4 && viewBox[3] > 0 ? viewBox[3] : lengthOf(tree.attrs.height || rootStyle.height)
  if (!(width > 0) || !(height > 0)) throw new Error('This SVG has no viewBox or width and height.')
  const clips = new Map()
  const warnings = []
  let serial = 0
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
    if (a.d) return pathBounds(shapePath(node))
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
    if (node.name === 'line') return `M${lengthOf(a.x1)} ${lengthOf(a.y1)}L${lengthOf(a.x2)} ${lengthOf(a.y2)}`
    if (node.name === 'polygon' || node.name === 'polyline') {
      const pairs = (a.points || '').trim().split(/[\s,]+/).map(Number)
      let d = ''
      for (let p = 0; p < pairs.length - 1; p += 2) d += `${p === 0 ? 'M' : 'L'}${pairs[p]} ${pairs[p + 1]}`
      return node.name === 'polygon' ? `${d}z` : d
    }
    return ''
  }
  function visit(node, matrix, inheritedClip = null) {
    if (node.name === 'defs' || node.name === 'clippath' || node.name === 'style' || node.name === 'metadata') return []
    const next = multiply(matrix, parseTransform(node.attrs.transform))
    const clip = clipFor(node.attrs) || inheritedClip
    const style = styleMap(node.attrs.style)
    const opacity = lengthOf(node.attrs.opacity ?? style.opacity, 1)
    if (node.name === 'g' || node.name === 'svg' || node.name === 'symbol' || node.name === 'a') {
      const children = node.children.flatMap(child => visit(child, next, clip))
      if (node.name !== 'g' || !children.length) return children
      const box = union(children)
      return [{ id: `svg${serial++}`, name: node.attrs['inkscape:label'] || node.attrs.id || 'Group', kind: 'group', box, opacity, children, sourceKind: 'svg-group' }]
    }
    if (node.name === 'image') {
      const source = imageSource(hrefOf(node.attrs), stripped.images)
      let box = elementBox(node, next)
      if (!(box[2] > 0) || !(box[3] > 0)) box = [lengthOf(node.attrs.x), lengthOf(node.attrs.y), 32, 32]
      const layer = { id: `svg${serial++}`, name: node.attrs['inkscape:label'] || node.attrs.id || source.linkName || 'Image', kind: 'image', box, localBox: localBox(node), opacity, clip, transform: next, sourceKind: source.imageSource || 'linked', imageSource: source.imageSource || 'linked', linkName: source.linkName || '', missingLink: !!source.missingLink, remote: !!source.remote }
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
      return [{ id: `svg${serial++}`, name: node.attrs.id || text.slice(0, 32), kind: 'text', text, font: (node.attrs['font-family'] || style['font-family'] || 'sans-serif').split(',')[0].replace(/['"]/g, '').trim(), size, color: paint(node.attrs, style, 'fill') || '#111', box: boxFromPoints(corners(next, ...local)), opacity, transform: next, sourceKind: 'svg-text' }]
    }
    if (DRAWING.has(node.name)) {
      const d = shapePath(node)
      const box = elementBox(node, next)
      if (!(box[2] > 0) || !(box[3] > 0)) return []
      return [{ id: `svg${serial++}`, name: node.attrs['inkscape:label'] || node.attrs.id || node.name, kind: 'shape', pathData: d, fill: paint(node.attrs, style, 'fill') || '#000', stroke: paint(node.attrs, style, 'stroke'), strokeWidth: lengthOf(node.attrs['stroke-width'] || style['stroke-width'], 1), box, opacity, clip, transform: next, sourceKind: 'svg-path' }]
    }
    return node.children.flatMap(child => visit(child, next, clip))
  }
  const layers = tree.children.flatMap(child => visit(child, IDENTITY))
  return { w: width, h: height, topFirst: true, layers, warnings, source: { format: 'svg', file } }
}

function union(layers) {
  const boxes = layers.map(layer => layer.box).filter(box => box && box[2] > 0 && box[3] > 0)
  if (!boxes.length) return [0, 0, 0, 0]
  const x = Math.min(...boxes.map(box => box[0])), y = Math.min(...boxes.map(box => box[1]))
  return [x, y, Math.max(...boxes.map(box => box[0] + box[2])) - x, Math.max(...boxes.map(box => box[1] + box[3])) - y]
}

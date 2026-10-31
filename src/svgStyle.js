// Author styles are indexed by their rightmost simple selector. Image payloads
// never pass through the CSS scanner.
export const inheritedProperties = new Set('color fill fill-opacity fill-rule stroke stroke-opacity stroke-width stroke-linecap stroke-linejoin stroke-dasharray stroke-dashoffset visibility font-family font-size font-weight font-style text-anchor'.split(' '))
export function declarations(value = '') {
  return value.split(';').flatMap(part => {
    const colon = part.indexOf(':')
    if (colon < 0) return []
    const raw = part.slice(colon + 1).trim()
    return [{ key: part.slice(0, colon).trim().toLowerCase(), value: raw.replace(/\s*!important\s*$/i, ''), important: /!important\s*$/i.test(raw) }]
  })
}
function simple(node, selector) {
  const tag = selector.match(/^[\w*-]+/)
  if (tag && tag[0] !== '*' && tag[0].toLowerCase() !== node.name) return false
  const rest = selector.slice(tag?.[0].length || 0)
  if (!/^(?:[.#][\w-]+)*$/.test(rest)) return false
  return (rest.match(/[.#][\w-]+/g) || []).every(token => token[0] === '#'
    ? node.attrs.id === token.slice(1) : (node.attrs.class || '').split(/\s+/).includes(token.slice(1)))
}
function matches(node, parts, parents) {
  if (!simple(node, parts[parts.length - 1])) return false
  let p = parents.length - 1
  for (let i = parts.length - 2; i >= 0; i--) {
    if (parts[i] === '>') { if (p < 0 || !simple(parents[p--], parts[--i])) return false }
    else { while (p >= 0 && !simple(parents[p], parts[i])) p--; if (p-- < 0) return false }
  }
  return true
}
export function svgStyles(tree) {
  const buckets = new Map(), ids = new Map(), parents = new WeakMap(), cache = new WeakMap()
  let order = 0
  function scan(node, parent = null) {
    if (parent) parents.set(node, parent)
    if (node.attrs.id) ids.set(node.attrs.id, node)
    if (node.name === 'style') {
      const css = (node.text || '').replace(/\/\*[\s\S]*?\*\//g, '')
      for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
        for (const selector of match[1].split(',')) {
          const parts = selector.trim().replace(/\s*>\s*/g, ' > ').split(/\s+/)
          const last = parts[parts.length - 1]
          const key = last.match(/#[\w-]+/)?.[0] || last.match(/\.[\w-]+/)?.[0] || last.match(/^[\w-]+/)?.[0] || '*'
          const score = (selector.match(/#/g) || []).length * 10000 + (selector.match(/\./g) || []).length * 100 + parts.filter(p => /^[a-z]/i.test(p)).length
          const rule = { parts, score, order: ++order, values: declarations(match[2]) }
          if (!buckets.has(key)) buckets.set(key, [])
          buckets.get(key).push(rule)
        }
      }
    }
    node.children.forEach(child => scan(child, node))
  }
  scan(tree)
  function compute(node, parent = {}, parents = []) {
    const out = {}, ranks = new Map()
    for (const key of inheritedProperties) if (parent[key] != null) out[key] = parent.currentColorProperties?.includes(key) ? 'currentColor' : parent[key]
    const set = (key, value, rank) => { if (!ranks.has(key) || rank >= ranks.get(key)) { out[key] = value; ranks.set(key, rank) } }
    for (const [key, value] of Object.entries(node.attrs)) if (key !== 'style') set(key, value, 0)
    const keys = ['*', node.name, `#${node.attrs.id}`, ...(node.attrs.class || '').split(/\s+/).map(c => `.${c}`)]
    for (const key of keys) for (const rule of buckets.get(key) || []) {
      if (matches(node, rule.parts, parents)) for (const d of rule.values) set(d.key, d.value, (d.important ? 1e12 : 0) + rule.score * 1e5 + rule.order)
    }
    for (const d of declarations(node.attrs.style)) set(d.key, d.value, (d.important ? 1e12 : 0) + 1e11)
    for (const key of Object.keys(out)) {
      if (out[key] === 'inherit' || out[key] === 'unset' && inheritedProperties.has(key)) out[key] = parent.currentColorProperties?.includes(key) ? 'currentColor' : parent[key]
      else if (out[key] === 'initial' || out[key] === 'unset') delete out[key]
    }
    out.color = out.color === 'currentColor' ? parent.color || '#000' : out.color || '#000'
    Object.defineProperty(out, 'currentColorProperties', { value: ['fill', 'stroke', 'stop-color'].filter(key => /^currentcolor$/i.test(out[key] || '')), enumerable: false })
    for (const key of ['fill', 'stroke', 'stop-color']) if (/^currentcolor$/i.test(out[key] || '')) out[key] = out.color
    return out
  }
  function original(node) {
    if (cache.has(node)) return cache.get(node)
    const parent = parents.get(node), ancestors = []
    for (let p = parent; p; p = parents.get(p)) ancestors.unshift(p)
    const value = compute(node, parent ? original(parent) : {}, ancestors)
    cache.set(node, value)
    return value
  }
  return { compute, ids, original }
}

export function xml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
export function svgElement(name, attrs, children = '') {
  return `<${name} ${Object.entries(attrs).filter(([key, value]) => value != null && !key.startsWith('on') && key !== 'style' && !key.includes(':')).map(([key, value]) => `${key}="${xml(value)}"`).join(' ')}>${children}</${name}>`
}

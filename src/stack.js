export function stackOrder(ids, saved = []) {
  return [...new Set([...saved.filter(id => ids.includes(id)), ...ids])]
}

export function materialStackOrder(ids, saved = []) {
  const order = stackOrder(ids, saved)
  if (ids.includes('__border') && !saved.includes('__border') && order.includes('__background')) {
    order.splice(order.indexOf('__border'), 1)
    order.splice(order.indexOf('__background'), 0, '__border')
  }
  return order
}

export function moveStack(ids, selected, target, after = false) {
  const moving = ids.filter(id => selected.includes(id)), rest = ids.filter(id => !selected.includes(id))
  if (!moving.length || selected.includes(target) || !rest.includes(target)) return ids
  const at = rest.indexOf(target) + (after ? 1 : 0)
  return [...rest.slice(0, at), ...moving, ...rest.slice(at)]
}

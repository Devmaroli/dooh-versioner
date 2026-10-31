let worker
let sequence = 0
const pending = new Map()

// The large module and all Rust work stay off the UI thread. A failed WASM
// import is reported to the caller; it never silently switches renderers.
export function normalizeSvgWithWasm(svg) {
  if (!worker) {
    worker = new Worker(new URL('./workers/svgNormalize.worker.js', import.meta.url), { type: 'module' })
    worker.onmessage = ({ data }) => {
      const wait = pending.get(data.id)
      if (!wait) return
      pending.delete(data.id)
      if (data.error) wait.reject(new Error(`VectorCraft SVG: ${data.error}`))
      else wait.resolve(data)
    }
    worker.onerror = () => {
      for (const wait of pending.values()) wait.reject(new Error('VectorCraft SVG worker could not load.'))
      pending.clear(); worker.terminate(); worker = null
    }
  }
  const id = ++sequence
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    worker.postMessage({ id, svg })
  })
}

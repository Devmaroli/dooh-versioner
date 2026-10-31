import init, { svg_normalize } from '../vendor/vectorcraft/vectorcraft_svg.js'
import wasmUrl from '../vendor/vectorcraft/vectorcraft_svg_bg.wasm.bin?url'

let ready
self.onmessage = async ({ data }) => {
  try {
    ready ||= (async () => {
      const response = await fetch(wasmUrl)
      if (!response.ok) throw new Error(`Local WASM load failed (${response.status}).`)
      const bytes = await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer()
      return init({ module_or_path: bytes })
    })()
    await ready
    const result = JSON.parse(svg_normalize(data.svg))
    self.postMessage({ id: data.id, ...result })
  } catch (error) {
    self.postMessage({ id: data.id, error: error instanceof Error ? error.message : String(error) })
  }
}

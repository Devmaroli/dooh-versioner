import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import fs from 'node:fs'
import path from 'node:path'

function svgWasmLicenses() {
  return { name: 'svg-wasm-licenses', generateBundle() {
    const root = path.resolve('src/vendor/vectorcraft')
    const copy = (directory: string) => {
      for (const name of fs.readdirSync(directory)) {
        const file = path.join(directory, name)
        if (fs.statSync(file).isDirectory()) copy(file)
        else if (!/\.(wasm|gz|bin|js)$/.test(name)) this.emitFile({ type: 'asset', fileName: `licenses/vectorcraft/${path.relative(root, file).replaceAll('\\', '/')}`, source: fs.readFileSync(file) })
      }
    }
    copy(root)
  } }
}

export default defineConfig({
  plugins: [react(), svgWasmLicenses()],
  publicDir: false,
  test: {
    environment: 'node',
    include: ['src/engine/__tests__/**/*.test.{js,ts}'],
  },
})

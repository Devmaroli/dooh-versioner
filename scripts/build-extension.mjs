import { build } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { zipSync } from 'fflate'

const root = process.cwd(), output = path.join(root, 'dist-extension'), artifacts = path.join(root, 'artifacts')
const json = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const manifest = json('extension/manifest.json')
if (manifest.permissions?.length || manifest.host_permissions?.length || manifest.content_scripts?.length || manifest.externally_connectable || manifest.web_accessible_resources?.length) throw new Error('Review security scope before adding extension privileges or exposing resources.')
if (manifest.version !== json('package.json').version || !fs.readFileSync('src/version.ts', 'utf8').includes(`'${manifest.version}'`) || !fs.readFileSync('extension/popup.html', 'utf8').includes(`v${manifest.version}`)) throw new Error('Release versions must agree in package.json, manifest, src/version.ts and launcher.')
await build({
  configFile: path.join(root, 'vite.config.ts'), configLoader: 'runner', base: './',
  build: { outDir: output, emptyOutDir: true, minify: false, cssMinify: false },
  plugins: [{ name: 'offline-extension', transformIndexHtml(html) {
    return html.replace(/<link\b[^>]*>/g, tag => tag.includes('fonts.googleapis.com') ? '' : tag)
  } }],
})
fs.cpSync('extension', output, { recursive: true })
const licenses = path.join(output, 'licenses'); fs.mkdirSync(licenses, { recursive: true })
const inventory = [], visited = new Set()
function dependency(name) {
  if (visited.has(name)) return
  visited.add(name)
  const folder = path.join(root, 'node_modules', name), file = path.join(folder, 'package.json')
  if (!fs.existsSync(file)) throw new Error(`Missing runtime dependency ${name}`)
  const info = json(file); inventory.push({ name, version: info.version, license: info.license || 'See included license' })
  for (const entry of fs.readdirSync(folder).filter(n => /^(licen[cs]e|notice|copying)(\.|$)/i.test(n))) {
    if (fs.statSync(path.join(folder, entry)).isFile()) fs.copyFileSync(path.join(folder, entry), path.join(licenses, `${name.replaceAll('/', '_')}-${entry}`))
  }
  Object.keys(info.dependencies || {}).forEach(dependency)
}
Object.keys(json('package.json').dependencies).forEach(dependency)
fs.writeFileSync(path.join(output, 'DEPENDENCIES.json'), JSON.stringify(inventory, null, 2))
for (const name of ['chrome-extension.md', 'security-audit.md']) fs.copyFileSync(path.join('docs', name), path.join(output, name))
const entries = {}, hashes = {}
function collect(folder) {
  for (const file of fs.readdirSync(folder).sort()) {
    const absolute = path.join(folder, file)
    if (fs.statSync(absolute).isDirectory()) collect(absolute)
    else {
      const name = path.relative(output, absolute).split(path.sep).join('/'), bytes = fs.readFileSync(absolute)
      if (/\.(exe|dll|bat|cmd|ps1|pem|psd|psb|map)$/i.test(name)) throw new Error(`Unexpected distribution file ${name}`)
      entries[name] = bytes; hashes[name] = createHash('sha256').update(bytes).digest('hex')
    }
  }
}
collect(output)
if (/<(?:script|link)\b[^>]*(?:src|href)=["']https?:/i.test(entries['index.html'].toString())) throw new Error('Remote startup resource in offline extension.')
fs.mkdirSync(artifacts, { recursive: true })
const zipName = `dooh-creative-studio-chrome-${manifest.version}.zip`, bytes = zipSync(entries, { level: 6 })
fs.writeFileSync(path.join(artifacts, zipName), bytes)
fs.writeFileSync(path.join(artifacts, `${zipName}.sha256`), `${createHash('sha256').update(bytes).digest('hex')}  ${zipName}\n`)
fs.writeFileSync(path.join(artifacts, 'extension-file-hashes.json'), JSON.stringify(hashes, null, 2))
console.log(`Extension: ${zipName}, ${bytes.length} bytes, ${Object.keys(entries).length} files; no requested browser/host permissions.`)

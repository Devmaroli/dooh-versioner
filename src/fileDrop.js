function readEntries(reader) {
  return new Promise((resolve, reject) => reader.readEntries(resolve, reject))
}

async function allEntries(reader) {
  const collected = []
  while (true) {
    const batch = await readEntries(reader)
    if (!batch?.length) break
    collected.push(...batch)
  }
  return collected
}

function fileFromEntry(entry) {
  return new Promise((resolve, reject) => entry.file(resolve, reject))
}

async function walk(entry, files) {
  if (!entry) return
  if (entry.isFile) files.push(await fileFromEntry(entry))
  else if (entry.isDirectory) {
    const children = await allEntries(entry.createReader())
    for (const child of children) await walk(child, files)
  }
}

/** Resolves a drop that may contain files, an SVG plus its images, or a folder. Nothing is fetched. */
export async function filesFromDataTransfer(dataTransfer) {
  const items = Array.from(dataTransfer?.items || [])
  const entries = items.map(item => item.webkitGetAsEntry?.()).filter(Boolean)
  if (!entries.length) return Array.from(dataTransfer?.files || [])
  const files = []
  for (const entry of entries) await walk(entry, files)
  return files.length ? files : Array.from(dataTransfer?.files || [])
}

self.onmessage = async (event) => {
  const { id, base64, mime } = event.data
  try {
    const clean = String(base64 || '').replace(/\s+/g, '')
    const binary = atob(clean)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index)
    const bitmap = await createImageBitmap(new Blob([bytes], { type: mime || 'image/png' }))
    const scale = Math.min(1, 4096 / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.ceil(bitmap.width * scale)), height = Math.max(1, Math.ceil(bitmap.height * scale))
    const canvas = new OffscreenCanvas(width, height)
    const context = canvas.getContext('2d', { willReadFrequently: true })
    context.drawImage(bitmap, 0, 0, width, height)
    const image = context.getImageData(0, 0, width, height)
    const sourceAspect = bitmap.width / bitmap.height
    bitmap.close?.()
    self.postMessage({ id, width, height, sourceAspect, buffer: image.data.buffer }, [image.data.buffer])
  } catch (error) {
    self.postMessage({ id, error: error instanceof Error ? error.message : String(error) })
  }
}

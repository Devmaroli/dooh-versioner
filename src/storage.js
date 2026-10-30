const DATABASE = 'dooh-creative-studio'
let connection
function open() {
  if (!connection) connection = new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1)
    request.onupgradeneeded = () => request.result.createObjectStore('project')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => { connection = null; reject(request.error) }
  })
  return connection
}
export async function readProject() {
  const db = await open()
  return new Promise((resolve, reject) => {
    const request = db.transaction('project').objectStore('project').get('current')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
export async function saveProject(snapshot) {
  const db = await open()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('project', 'readwrite')
    tx.objectStore('project').put({ ...snapshot, version: 1 }, 'current')
    tx.oncomplete = resolve
    tx.onerror = () => reject(tx.error)
    tx.onabort = () => reject(tx.error || new Error('Project save aborted'))
  })
}

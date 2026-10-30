/*! Author: Kapildev Maroli */
const link = document.getElementById('open-studio')
let opening = false
link.addEventListener('click', async event => {
  event.preventDefault()
  if (opening) return
  opening = true
  link.setAttribute('aria-busy', 'true')
  try {
    const url = chrome.runtime.getURL('index.html')
    // Inspect only our own extension contexts, never other websites/history.
    const contexts = await chrome.runtime.getContexts({ contextTypes: ['TAB'], documentUrls: [url] })
    const existing = contexts.find(context => context.tabId >= 0)
    if (existing) {
      await chrome.tabs.update(existing.tabId, { active: true })
      await chrome.windows.update(existing.windowId, { focused: true })
    } else await chrome.tabs.create({ url })
    window.close()
  } catch {
    document.getElementById('error').textContent = 'Could not open Studio. Check whether your browser administrator permits this extension.'
  } finally { opening = false; link.removeAttribute('aria-busy') }
})

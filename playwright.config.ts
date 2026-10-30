import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/browser',
  timeout: 60000,
  workers: 1,
  use: { baseURL: process.env.STUDIO_URL || 'http://127.0.0.1:4173', channel: process.env.STUDIO_BROWSER || (process.platform === 'win32' ? 'msedge' : undefined), viewport: { width: 1440, height: 1000 } },
})

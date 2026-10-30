import { defineConfig } from '@playwright/test'
export default defineConfig({ testDir: './tests/extension', timeout: 120000, workers: 1, use: { viewport: { width: 1440, height: 1000 } } })

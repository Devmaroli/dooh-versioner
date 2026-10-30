import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  publicDir: false,
  test: {
    environment: 'node',
    include: ['src/engine/__tests__/**/*.test.{js,ts}'],
  },
})

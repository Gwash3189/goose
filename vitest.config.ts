import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    setupFiles: ['/test/setup.ts'],
    coverage: {
      exclude: ['node_modules', 'prisma', 'src/database/factories'],
      reporter: ['json', 'html']
    }
  }
})

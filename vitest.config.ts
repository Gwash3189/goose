import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    setupFiles: ['/test/setup.ts'],
    exclude: ['node_modules', 'prisma', 'src/database/factories', 'out/**/*'],
    coverage: {
      exclude: ['node_modules', 'prisma', 'src/database/factories', 'out/**/*'],
      reporter: ['json', 'html']
    }
  }
})

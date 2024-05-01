import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    setupFiles: ['/test/setup.ts'],
    exclude: ['node_modules', 'prisma', 'src/database/factories', 'build/**/*'],
    coverage: {
      exclude: ['node_modules', 'prisma', 'src/database/factories', 'build/**/*'],
      reporter: ['json', 'html']
    }
  }
})

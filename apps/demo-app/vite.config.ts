import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    sveltekit({
      compilerOptions: {
        runes: undefined, // Let individual files decide
      },
      // Only apply runes to our own components, not dependencies
      onwarn: (warning, handler) => {
        // Ignore warnings from node_modules
        if (warning.filename?.includes('node_modules')) return
        if (handler) handler(warning)
      },
    }),
  ],
  server: {
    port: 5174,
  },
})

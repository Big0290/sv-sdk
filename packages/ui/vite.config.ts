import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        runes: undefined, // Let individual files decide
      },
      // Only apply runes to our own components, not dependencies
      onwarn: (warning, handler) => {
        // Ignore warnings from node_modules
        if (warning.filename?.includes('node_modules')) return
        handler(warning)
      },
    }),
  ],
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es'],
    },
  },
})

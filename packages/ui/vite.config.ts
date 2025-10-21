import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        runes: true,
        compatibility: {
          componentApi: 4, // Allow Svelte 4 components in dependencies
        },
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

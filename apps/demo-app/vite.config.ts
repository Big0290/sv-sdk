import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    noExternal: [], // Don't bundle any external packages
  },
  server: {
    port: 5174,
  },
})

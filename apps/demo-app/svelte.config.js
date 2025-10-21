import adapter from '@sveltejs/adapter-auto'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),

  compilerOptions: {
    runes: true,
    compatibility: {
      componentApi: 4, // Allow Svelte 4 components like lucide-svelte
    },
  },

  kit: {
    adapter: adapter(),
  },
}

export default config


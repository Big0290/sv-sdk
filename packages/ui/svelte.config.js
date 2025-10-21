import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: true,
    compatibility: {
      componentApi: 4, // Allow Svelte 4 components like lucide-svelte
    },
  },
  package: {
    dir: 'src',
    emitTypes: true,
  },
}

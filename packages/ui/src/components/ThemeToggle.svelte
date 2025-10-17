<script lang="ts">
  /**
   * Theme toggle component
   * Switch between light and dark mode
   */

  import { onMount } from 'svelte'

  let theme = $state<'light' | 'dark'>('light')

  onMount(() => {
    // Check stored preference or system preference
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

    theme = (stored as 'light' | 'dark') || (prefersDark ? 'dark' : 'light')
    applyTheme(theme)
  })

  function toggleTheme() {
    theme = theme === 'light' ? 'dark' : 'light'
    applyTheme(theme)
    localStorage.setItem('theme', theme)
  }

  function applyTheme(newTheme: 'light' | 'dark') {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
</script>

<button
  type="button"
  onclick={toggleTheme}
  class="rounded-md p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
  aria-label="Toggle theme"
>
  {#if theme === 'light'}
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  {:else}
    <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  {/if}
</button>


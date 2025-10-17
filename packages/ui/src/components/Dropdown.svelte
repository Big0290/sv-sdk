<script lang="ts">
  /**
   * Dropdown component
   * Menu with keyboard navigation
   */

  import { onMount } from 'svelte'

  interface Props {
    trigger?: any
    align?: 'left' | 'right'
    class?: string
  }

  let {
    trigger,
    align = 'left',
    class: className = '',
    children,
  }: Props = $props()

  let isOpen = $state(false)
  let dropdownRef: HTMLDivElement

  onMount(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef && !dropdownRef.contains(event.target as Node)) {
        isOpen = false
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  })

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      isOpen = false
    }
  }
</script>

<div class="relative {className}" bind:this={dropdownRef}>
  <button
    type="button"
    onclick={() => (isOpen = !isOpen)}
    aria-expanded={isOpen}
    aria-haspopup="true"
  >
    {@render trigger?.()}
  </button>

  {#if isOpen}
    <div
      class="absolute z-dropdown mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
      class:right-0={align === 'right'}
      class:left-0={align === 'left'}
      role="menu"
      onkeydown={handleKeydown}
    >
      <div class="py-1">
        {@render children?.()}
      </div>
    </div>
  {/if}
</div>


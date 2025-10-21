<script lang="ts">
  /**
   * SearchInput component - iOS 26 Glassmorphism Edition
   * Search input with clear button and icon
   */

  import { cn } from '../../theme/utils'
  import { Search, X } from 'lucide-svelte'

  interface Props {
    value?: string
    placeholder?: string
    disabled?: boolean
    id?: string
    name?: string
    class?: string
    debounce?: number
    oninput?: (value: string) => void
    onsearch?: (value: string) => void
    onclear?: () => void
  }

  let {
    value = $bindable(''),
    placeholder = 'Search...',
    disabled = false,
    id,
    name,
    class: className = '',
    debounce = 0,
    oninput,
    onsearch,
    onclear,
  }: Props = $props()

  let searchId = $state(id || `search-${Math.random().toString(36).substr(2, 9)}`)
  let debounceTimer: number | undefined = $state()

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    value = target.value

    if (debounce > 0) {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        oninput?.(value)
        onsearch?.(value)
      }, debounce) as unknown as number
    } else {
      oninput?.(value)
      onsearch?.(value)
    }
  }

  function handleClear() {
    value = ''
    onclear?.()
    oninput?.('')
    onsearch?.('')
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      onsearch?.(value)
    } else if (event.key === 'Escape') {
      handleClear()
    }
  }
</script>

<div class={cn('relative w-full', className)}>
  <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
    <Search class="h-4 w-4" />
  </div>

  <input
    type="search"
    id={searchId}
    {name}
    bind:value
    {placeholder}
    {disabled}
    class={cn('input w-full pl-10', value.length > 0 ? 'pr-10' : '')}
    oninput={handleInput}
    onkeydown={handleKeydown}
  />

  {#if value.length > 0 && !disabled}
    <button
      type="button"
      class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
      onclick={handleClear}
      aria-label="Clear search"
    >
      <X class="h-4 w-4" />
    </button>
  {/if}
</div>

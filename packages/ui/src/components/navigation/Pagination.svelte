<script lang="ts">
  /**
   * Pagination component - iOS 26 Glass Edition
   */

  import { cn } from '../../theme/utils'
  import { ChevronLeft, ChevronRight } from 'lucide-svelte'

  interface Props {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    class?: string
  }

  let { currentPage, totalPages, onPageChange, class: className = '' }: Props = $props()

  const pages = $derived(() => {
    const delta = 2
    const range: number[] = []
    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i)
    }
    if (currentPage - delta > 2) range.unshift(-1)
    if (currentPage + delta < totalPages - 1) range.push(-1)
    range.unshift(1)
    if (totalPages > 1) range.push(totalPages)
    return range
  })
</script>

<nav class={cn('flex items-center gap-2', className)}>
  <button
    type="button"
    class="glass px-3 py-2 rounded-lg disabled:opacity-50"
    onclick={() => onPageChange(currentPage - 1)}
    disabled={currentPage === 1}
  >
    <ChevronLeft class="h-4 w-4" />
  </button>

  {#each pages() as page}
    {#if page === -1}
      <span class="px-2">...</span>
    {:else}
      <button
        type="button"
        class={cn(
          'px-3 py-2 rounded-lg transition-all',
          page === currentPage ? 'bg-gradient-primary text-white shadow-glow-sm' : 'glass hover:shadow-glow-sm'
        )}
        onclick={() => onPageChange(page)}
      >
        {page}
      </button>
    {/if}
  {/each}

  <button
    type="button"
    class="glass px-3 py-2 rounded-lg disabled:opacity-50"
    onclick={() => onPageChange(currentPage + 1)}
    disabled={currentPage === totalPages}
  >
    <ChevronRight class="h-4 w-4" />
  </button>
</nav>

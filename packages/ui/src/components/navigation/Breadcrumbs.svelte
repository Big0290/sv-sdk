<script lang="ts">
  /**
   * Breadcrumbs component - iOS 26 Glass Edition
   */

  import { cn } from '../../theme/utils'
  import { ChevronRight } from 'lucide-svelte'

  interface Breadcrumb {
    label: string
    href?: string
  }

  interface Props {
    items: Breadcrumb[]
    class?: string
  }

  let { items, class: className = '' }: Props = $props()
</script>

<nav aria-label="Breadcrumb" class={cn('flex items-center space-x-2 text-sm', className)}>
  {#each items as item, i}
    {#if i > 0}
      <ChevronRight class="h-4 w-4 text-gray-400" />
    {/if}
    {#if item.href && i < items.length - 1}
      <a href={item.href} class="text-primary-600 dark:text-primary-400 hover:underline">
        {item.label}
      </a>
    {:else}
      <span class="text-gray-600 dark:text-gray-400">{item.label}</span>
    {/if}
  {/each}
</nav>

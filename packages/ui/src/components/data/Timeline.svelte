<script lang="ts">
  import { cn } from '../../theme/utils'

  interface TimelineItem {
    title: string
    description?: string
    timestamp: Date
  }

  interface Props {
    items: TimelineItem[]
    class?: string
  }

  let { items, class: className = '' }: Props = $props()
</script>

<div class={cn('space-y-4', className)}>
  {#each items as item, i}
    <div class="flex gap-4">
      <div class="flex flex-col items-center">
        <div class="h-3 w-3 rounded-full bg-gradient-primary shadow-glow-sm"></div>
        {#if i < items.length - 1}
          <div class="flex-1 w-px bg-gray-200 dark:bg-gray-700 my-2"></div>
        {/if}
      </div>
      <div class="glass-card flex-1">
        <h4 class="font-medium text-gray-900 dark:text-gray-100">{item.title}</h4>
        {#if item.description}
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
        {/if}
        <span class="text-xs text-gray-500 mt-2 block">{item.timestamp.toLocaleString()}</span>
      </div>
    </div>
  {/each}
</div>

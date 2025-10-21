<script lang="ts">
  import { cn } from '../../theme/utils'
  import { TrendingUp, TrendingDown } from 'lucide-svelte'

  interface Props {
    label: string
    value: string | number
    change?: number
    icon?: import('svelte').Snippet
    class?: string
  }

  let { label, value, change, icon, class: className = '' }: Props = $props()
  const isPositive = $derived(change && change > 0)
</script>

<div class={cn('glass-card', className)}>
  <div class="flex items-center justify-between mb-4">
    <p class="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    {#if icon}
      <div class="text-primary-600 dark:text-primary-400">
        {@render icon?.()}
      </div>
    {/if}
  </div>
  <p class="text-3xl font-bold gradient-text">{value}</p>
  {#if change}
    <div
      class={cn(
        'flex items-center gap-1 mt-2 text-sm',
        isPositive ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'
      )}
    >
      {#if isPositive}<TrendingUp class="h-4 w-4" />{:else}<TrendingDown class="h-4 w-4" />{/if}
      <span>{Math.abs(change)}%</span>
    </div>
  {/if}
</div>

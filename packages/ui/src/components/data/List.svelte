<script lang="ts">
  import { cn } from '../../theme/utils'

  interface Props {
    items: unknown[]
    class?: string
    children?: import('svelte').Snippet<[item: unknown, index: number]>
  }

  let { items, class: className = '', children }: Props = $props()
</script>

<ul class={cn('glass-card !p-0 divide-y divide-gray-200/50 dark:divide-gray-700/50', className)}>
  {#each items as item, i}
    <li class="px-6 py-4">
      {@render children?.(item, i)}
    </li>
  {/each}
</ul>

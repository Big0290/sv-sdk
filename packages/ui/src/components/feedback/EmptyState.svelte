<script lang="ts">
  import { cn } from '../../theme/utils'

  interface Props {
    title: string
    description?: string
    icon?: import('svelte').Snippet
    action?: import('svelte').Snippet
    class?: string
  }

  let { title, description, icon, action, class: className = '' }: Props = $props()
</script>

<div class={cn('glass-card text-center py-12', className)}>
  {#if icon}
    <div class="text-gray-400 mb-4">
      {@render icon?.()}
    </div>
  {/if}
  <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
  {#if description}
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">{description}</p>
  {/if}
  {#if action}
    {@render action?.()}
  {/if}
</div>

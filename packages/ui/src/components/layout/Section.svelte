<script lang="ts">
  import { cn } from '../../theme/utils'

  interface Props {
    title?: string
    description?: string
    action?: import('svelte').Snippet
    glass?: boolean
    class?: string
    children?: import('svelte').Snippet
  }

  let { title, description, action, glass = false, class: className = '', children }: Props = $props()
</script>

<section class={cn(glass ? 'glass-card' : 'py-8', className)}>
  {#if title || description || action}
    <div class="flex items-start justify-between mb-6">
      <div>
        {#if title}
          <h2 class="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
        {/if}
        {#if description}
          <p class="mt-2 text-gray-600 dark:text-gray-400">{description}</p>
        {/if}
      </div>
      {#if action}
        {@render action?.()}
      {/if}
    </div>
  {/if}
  {@render children?.()}
</section>

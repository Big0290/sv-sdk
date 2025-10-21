<script lang="ts">
  /**
   * Card component - iOS 26 Glassmorphism Edition
   * Glass card with optional hover effect and glow border
   * Maintains backward compatibility
   */

  import { cn } from '../../theme/utils'

  interface Props {
    variant?: 'default' | 'glass' | 'solid'
    hover?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
    class?: string
    onclick?: (event: MouseEvent) => void
    children?: import('svelte').Snippet
  }

  let { variant = 'glass', hover = false, padding = 'md', class: className = '', onclick, children }: Props = $props()

  const variantClasses = {
    default: 'card',
    glass: 'glass-card',
    solid: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-lg',
  }

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }
</script>

{#if onclick}
  <button
    type="button"
    class={cn(
      variantClasses[variant],
      paddingClasses[padding],
      hover ? 'card-hover cursor-pointer' : '',
      'text-left w-full',
      className
    )}
    {onclick}
  >
    {@render children?.()}
  </button>
{:else}
  <div class={cn(variantClasses[variant], paddingClasses[padding], hover ? 'card-hover' : '', className)}>
    {@render children?.()}
  </div>
{/if}

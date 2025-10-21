<script lang="ts">
  import { cn } from '../../theme/utils'

  interface Props {
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'gray'
    size?: 'sm' | 'md' | 'lg'
    removable?: boolean
    onRemove?: () => void
    class?: string
    children?: import('svelte').Snippet
  }

  let { variant = 'gray', size = 'md', removable = false, onRemove, class: className = '', children }: Props = $props()

  const variants = {
    primary: 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300',
    success: 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300',
    warning: 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300',
    error: 'bg-error-100 dark:bg-error-900 text-error-700 dark:text-error-300',
    gray: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }
</script>

<span class={cn('inline-flex items-center gap-1.5 rounded-lg font-medium', variants[variant], sizes[size], className)}>
  {@render children?.()}
  {#if removable}
    <button onclick={onRemove} class="hover:opacity-75">×</button>
  {/if}
</span>

<script lang="ts">
  /**
   * Badge component - iOS 26 Glassmorphism Edition
   * Small status indicators with glass styling
   */

  import { cn } from '../../theme/utils'

  interface Props {
    variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'gray'
    size?: 'sm' | 'md' | 'lg'
    dot?: boolean
    pill?: boolean
    glass?: boolean
    class?: string
    children?: import('svelte').Snippet
  }

  let {
    variant = 'gray',
    size = 'md',
    dot = false,
    pill = false,
    glass = true,
    class: className = '',
    children,
  }: Props = $props()

  const variantClasses = {
    primary: glass
      ? 'bg-primary-100/70 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 border-primary-300/50'
      : 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300',
    success: glass
      ? 'bg-success-100/70 dark:bg-success-900/50 text-success-700 dark:text-success-300 border-success-300/50'
      : 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300',
    warning: glass
      ? 'bg-warning-100/70 dark:bg-warning-900/50 text-warning-700 dark:text-warning-300 border-warning-300/50'
      : 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300',
    error: glass
      ? 'bg-error-100/70 dark:bg-error-900/50 text-error-700 dark:text-error-300 border-error-300/50'
      : 'bg-error-100 dark:bg-error-900 text-error-700 dark:text-error-300',
    info: glass
      ? 'bg-info-100/70 dark:bg-info-900/50 text-info-700 dark:text-info-300 border-info-300/50'
      : 'bg-info-100 dark:bg-info-900 text-info-700 dark:text-info-300',
    gray: glass
      ? 'bg-gray-100/70 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-gray-300/50'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  const dotColors = {
    primary: 'bg-primary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600',
    info: 'bg-info-600',
    gray: 'bg-gray-600',
  }
</script>

<span
  class={cn(
    'inline-flex items-center gap-1.5 font-medium',
    pill ? 'rounded-full' : 'rounded-lg',
    glass ? 'backdrop-blur-md border' : '',
    variantClasses[variant],
    sizeClasses[size],
    className
  )}
>
  {#if dot}
    <span class={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])}></span>
  {/if}
  {@render children?.()}
</span>

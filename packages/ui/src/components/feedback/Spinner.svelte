<script lang="ts">
  /**
   * Spinner component - iOS 26 Glassmorphism Edition
   * Liquid loading spinner with gradient
   */

  import { cn } from '../../theme/utils'

  interface Props {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'primary' | 'white' | 'gray'
    label?: string
    class?: string
  }

  let { size = 'md', variant = 'primary', label, class: className = '' }: Props = $props()

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12',
  }

  const variantClasses = {
    primary: 'border-primary-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    gray: 'border-gray-600 border-t-transparent dark:border-gray-400',
  }
</script>

<div class={cn('inline-flex flex-col items-center gap-2', className)} role="status">
  <div
    class={cn('animate-spin rounded-full border-2', sizeClasses[size], variantClasses[variant])}
    aria-label={label || 'Loading'}
  ></div>
  {#if label}
    <span class="text-sm text-gray-600 dark:text-gray-400">{label}</span>
  {:else}
    <span class="sr-only">Loading...</span>
  {/if}
</div>

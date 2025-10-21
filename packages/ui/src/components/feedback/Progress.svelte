<script lang="ts">
  /**
   * Progress component - iOS 26 Glassmorphism Edition
   * Progress bar with gradient fill
   */

  import { cn } from '../../theme/utils'

  interface Props {
    value: number
    max?: number
    size?: 'sm' | 'md' | 'lg'
    variant?: 'primary' | 'success' | 'warning' | 'error'
    showLabel?: boolean
    label?: string
    indeterminate?: boolean
    class?: string
  }

  let {
    value,
    max = 100,
    size = 'md',
    variant = 'primary',
    showLabel = false,
    label,
    indeterminate = false,
    class: className = '',
  }: Props = $props()

  const percentage = $derived(Math.min((value / max) * 100, 100))

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  }

  const variantClasses = {
    primary: 'bg-gradient-primary',
    success: 'bg-gradient-to-r from-success-500 to-success-600',
    warning: 'bg-gradient-to-r from-warning-500 to-warning-600',
    error: 'bg-gradient-to-r from-error-500 to-error-600',
  }
</script>

<div class={cn('w-full', className)}>
  {#if showLabel || label}
    <div class="flex items-center justify-between mb-2">
      {#if label}
        <span class="text-sm text-gray-700 dark:text-gray-300">{label}</span>
      {/if}
      {#if showLabel && !indeterminate}
        <span class="text-sm font-medium text-primary-600 dark:text-primary-400">
          {Math.round(percentage)}%
        </span>
      {/if}
    </div>
  {/if}

  <div
    class={cn('w-full rounded-full glass overflow-hidden', sizeClasses[size])}
    role="progressbar"
    aria-valuenow={indeterminate ? undefined : value}
    aria-valuemin={0}
    aria-valuemax={max}
  >
    <div
      class={cn(
        'h-full transition-all duration-300 rounded-full',
        variantClasses[variant],
        indeterminate ? 'animate-shimmer' : ''
      )}
      style={indeterminate ? 'width: 100%' : `width: ${percentage}%`}
    ></div>
  </div>
</div>

<script lang="ts">
  /**
   * Progress component
   * Progress bar for showing completion
   */

  interface Props {
    value: number
    max?: number
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
    showLabel?: boolean
    size?: 'sm' | 'md' | 'lg'
    class?: string
  }

  let {
    value,
    max = 100,
    variant = 'primary',
    showLabel = false,
    size = 'md',
    class: className = '',
  }: Props = $props()

  const percentage = $derived(Math.min((value / max) * 100, 100))

  const variantClasses = {
    default: 'bg-gray-600',
    primary: 'bg-primary-600',
    success: 'bg-success-600',
    warning: 'bg-warning-600',
    error: 'bg-error-600',
  }

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  }
</script>

<div class="{className}">
  {#if showLabel}
    <div class="flex justify-between items-center mb-1">
      <span class="text-sm text-gray-700 dark:text-gray-300">
        {Math.round(percentage)}%
      </span>
    </div>
  {/if}

  <div
    class="w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden {sizeClasses[size]}"
    role="progressbar"
    aria-valuenow={value}
    aria-valuemin={0}
    aria-valuemax={max}
  >
    <div
      class="{variantClasses[variant]} {sizeClasses[size]} rounded-full transition-all duration-300"
      style="width: {percentage}%"
    ></div>
  </div>
</div>


<script lang="ts">
  /**
   * Radio component - iOS 26 Glassmorphism Edition
   * Glass radio button with smooth animations
   * Maintains backward compatibility
   */

  import { cn } from '../../theme/utils'

  interface Props {
    checked?: boolean
    disabled?: boolean
    label?: string
    description?: string
    error?: string
    id?: string
    name: string
    value: string
    class?: string
    size?: 'sm' | 'md' | 'lg'
    onchange?: (value: string) => void
  }

  let {
    checked = $bindable(false),
    disabled = false,
    label,
    description,
    error,
    id,
    name,
    value,
    class: className = '',
    size = 'md',
    onchange,
  }: Props = $props()

  let radioId = $state(id || `radio-${Math.random().toString(36).substr(2, 9)}`)

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const dotSizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  }

  function handleChange() {
    if (!disabled) {
      checked = true
      onchange?.(value)
    }
  }
</script>

<div class={cn('flex items-start', className)}>
  <div class="flex items-center h-5">
    <button
      type="button"
      role="radio"
      id={radioId}
      aria-checked={checked}
      aria-disabled={disabled}
      {disabled}
      class={cn(
        'relative rounded-full transition-all duration-200 flex items-center justify-center',
        sizeClasses[size],
        checked ? 'bg-gradient-primary shadow-glow-sm' : 'glass bg-white dark:bg-gray-800',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-glow-sm',
        error ? 'border-error-500' : ''
      )}
      onclick={handleChange}
    >
      <span class="sr-only">{label || 'Radio button'}</span>
      {#if checked}
        <span class={cn('rounded-full bg-white animate-scale-in', dotSizeClasses[size])}></span>
      {/if}
    </button>

    <input type="radio" {name} {value} {checked} class="sr-only" tabindex="-1" aria-hidden="true" />
  </div>

  {#if label || description}
    <div class="ml-3 flex-1">
      {#if label}
        <label
          for={radioId}
          class={cn(
            'text-sm font-medium cursor-pointer',
            disabled ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-900 dark:text-gray-100',
            error ? 'text-error-600 dark:text-error-400' : ''
          )}
        >
          {label}
        </label>
      {/if}
      {#if description}
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {description}
        </p>
      {/if}
      {#if error}
        <p class="text-xs text-error-600 dark:text-error-400 mt-1">
          {error}
        </p>
      {/if}
    </div>
  {/if}
</div>

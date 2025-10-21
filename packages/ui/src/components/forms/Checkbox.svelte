<script lang="ts">
  /**
   * Checkbox component - iOS 26 Glassmorphism Edition
   * Glass checkbox with smooth animations
   * Maintains backward compatibility
   */

  import { cn } from '../../theme/utils'
  import { Check, Minus } from 'lucide-svelte'

  interface Props {
    checked?: boolean
    indeterminate?: boolean
    disabled?: boolean
    label?: string
    description?: string
    error?: string
    id?: string
    name?: string
    value?: string
    class?: string
    size?: 'sm' | 'md' | 'lg'
    onchange?: (checked: boolean) => void
  }

  let {
    checked = $bindable(false),
    indeterminate = false,
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

  let checkboxId = $state(id || `checkbox-${Math.random().toString(36).substr(2, 9)}`)

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }

  function handleChange() {
    if (!disabled) {
      checked = !checked
      onchange?.(checked)
    }
  }
</script>

<div class={cn('flex items-start', className)}>
  <div class="flex items-center h-5">
    <button
      type="button"
      role="checkbox"
      id={checkboxId}
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-disabled={disabled}
      {disabled}
      class={cn(
        'relative rounded-lg transition-all duration-200 flex items-center justify-center',
        sizeClasses[size],
        checked || indeterminate ? 'bg-gradient-primary shadow-glow-sm' : 'glass bg-white dark:bg-gray-800',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-glow-sm',
        error ? 'border-error-500' : ''
      )}
      onclick={handleChange}
    >
      <span class="sr-only">{label || 'Checkbox'}</span>
      {#if indeterminate}
        <Minus class={cn('text-white', iconSizeClasses[size])} />
      {:else if checked}
        <Check class={cn('text-white animate-scale-in', iconSizeClasses[size])} />
      {/if}
    </button>

    <input type="checkbox" {name} {value} bind:checked class="sr-only" tabindex="-1" aria-hidden="true" />
  </div>

  {#if label || description}
    <div class="ml-3 flex-1">
      {#if label}
        <label
          for={checkboxId}
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

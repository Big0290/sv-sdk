<script lang="ts">
  /**
   * Switch component - iOS 26 Glassmorphism Edition
   * iOS-style toggle switch with glow effect
   * Maintains backward compatibility
   */

  import { cn } from '../../theme/utils'

  interface Props {
    checked?: boolean
    disabled?: boolean
    label?: string
    description?: string
    id?: string
    name?: string
    class?: string
    size?: 'sm' | 'md' | 'lg'
    glow?: boolean
    onchange?: (checked: boolean) => void
  }

  let {
    checked = $bindable(false),
    disabled = false,
    label,
    description,
    id,
    name,
    class: className = '',
    size = 'md',
    glow = true,
    onchange,
  }: Props = $props()

  let switchId = $state(id || `switch-${Math.random().toString(36).substr(2, 9)}`)

  const sizeClasses = {
    sm: 'h-5 w-9',
    md: 'h-6 w-11',
    lg: 'h-7 w-14',
  }

  const thumbSizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }

  const thumbTranslateClasses = {
    sm: checked ? 'translate-x-4' : 'translate-x-0.5',
    md: checked ? 'translate-x-5' : 'translate-x-0.5',
    lg: checked ? 'translate-x-7' : 'translate-x-0.5',
  }

  function handleChange() {
    if (!disabled) {
      checked = !checked
      onchange?.(checked)
    }
  }
</script>

<div class={cn('flex items-start', className)}>
  <button
    type="button"
    role="switch"
    id={switchId}
    aria-checked={checked}
    aria-disabled={disabled}
    {disabled}
    class={cn(
      'relative inline-flex flex-shrink-0 rounded-full transition-all duration-300',
      sizeClasses[size],
      checked ? 'bg-gradient-primary' : 'glass bg-gray-200 dark:bg-gray-700',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      glow && checked ? 'shadow-glow-md' : ''
    )}
    onclick={handleChange}
  >
    <span class="sr-only">{label || 'Toggle switch'}</span>
    <span
      class={cn(
        'inline-block rounded-full bg-white shadow-lg transform transition-transform duration-300',
        thumbSizeClasses[size],
        thumbTranslateClasses[size]
      )}
    ></span>
  </button>

  {#if label || description}
    <div class="ml-3 flex-1">
      {#if label}
        <label
          for={switchId}
          class={cn(
            'text-sm font-medium cursor-pointer',
            disabled ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' : 'text-gray-900 dark:text-gray-100'
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
    </div>
  {/if}

  <input type="checkbox" {name} bind:checked class="sr-only" tabindex="-1" aria-hidden="true" />
</div>

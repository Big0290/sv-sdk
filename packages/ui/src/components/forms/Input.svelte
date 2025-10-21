<script lang="ts">
  /**
   * Input component - iOS 26 Glassmorphism Edition
   * Glass input field with optional floating label
   * Maintains backward compatibility
   */

  import { cn } from '../../theme/utils'
  import { Eye, EyeOff } from 'lucide-svelte'

  interface Props {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
    value?: string
    label?: string
    placeholder?: string
    error?: string
    hint?: string
    disabled?: boolean
    required?: boolean
    readonly?: boolean
    id?: string
    name?: string
    class?: string
    floatingLabel?: boolean
    iconLeft?: import('svelte').Snippet
    iconRight?: import('svelte').Snippet
    onchange?: (event: Event) => void
    oninput?: (event: Event) => void
    onfocus?: (event: FocusEvent) => void
    onblur?: (event: FocusEvent) => void
  }

  let {
    type = $bindable('text'),
    value = $bindable(''),
    label,
    placeholder,
    error,
    hint,
    disabled = false,
    required = false,
    readonly = false,
    id,
    name,
    class: className = '',
    floatingLabel = false,
    iconLeft,
    iconRight,
    onchange,
    oninput,
    onfocus,
    onblur,
  }: Props = $props()

  let inputId = $state(id || `input-${Math.random().toString(36).substr(2, 9)}`)
  let showPassword = $state(false)
  let isFocused = $state(false)

  const hasValue = $derived(value && value.length > 0)
  const inputType = $derived(type === 'password' && showPassword ? 'text' : type)

  function handleFocus(e: FocusEvent) {
    isFocused = true
    onfocus?.(e)
  }

  function handleBlur(e: FocusEvent) {
    isFocused = false
    onblur?.(e)
  }
</script>

<div class={cn('w-full', className)}>
  {#if label && !floatingLabel}
    <label for={inputId} class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
      {#if required}
        <span class="text-error-500">*</span>
      {/if}
    </label>
  {/if}

  <div class="relative">
    {#if iconLeft}
      <div class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
        {@render iconLeft()}
      </div>
    {/if}

    <input
      type={inputType}
      bind:value
      {placeholder}
      {disabled}
      {required}
      {readonly}
      {name}
      id={inputId}
      class={cn(
        'input',
        error ? 'input-error' : '',
        iconLeft ? 'pl-10' : '',
        iconRight || type === 'password' ? 'pr-10' : '',
        floatingLabel && (isFocused || hasValue) ? 'pt-6 pb-2' : ''
      )}
      {onchange}
      {oninput}
      onfocus={handleFocus}
      onblur={handleBlur}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
    />

    {#if floatingLabel && label}
      <label
        for={inputId}
        class={cn(
          'absolute left-3 transition-all duration-200 pointer-events-none',
          isFocused || hasValue
            ? 'top-1.5 text-xs text-primary-600 dark:text-primary-400'
            : 'top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400'
        )}
      >
        {label}
        {#if required}
          <span class="text-error-500">*</span>
        {/if}
      </label>
    {/if}

    {#if type === 'password'}
      <button
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        onclick={() => (showPassword = !showPassword)}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
      >
        {#if showPassword}
          <EyeOff class="h-4 w-4" />
        {:else}
          <Eye class="h-4 w-4" />
        {/if}
      </button>
    {:else if iconRight}
      <div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
        {@render iconRight()}
      </div>
    {/if}
  </div>

  {#if error}
    <p id="{inputId}-error" class="mt-1.5 text-sm text-error-600 dark:text-error-400">
      {error}
    </p>
  {:else if hint}
    <p id="{inputId}-hint" class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
      {hint}
    </p>
  {/if}
</div>

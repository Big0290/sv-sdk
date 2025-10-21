<script lang="ts">
  /**
   * Slider component - iOS 26 Glassmorphism Edition
   * Range slider with glass styling and gradient track
   */

  import { cn } from '../../theme/utils'

  interface Props {
    value?: number
    min?: number
    max?: number
    step?: number
    label?: string
    hint?: string
    error?: string
    disabled?: boolean
    showValue?: boolean
    id?: string
    name?: string
    class?: string
    onchange?: (value: number) => void
    oninput?: (value: number) => void
  }

  let {
    value = $bindable(50),
    min = 0,
    max = 100,
    step = 1,
    label,
    hint,
    error,
    disabled = false,
    showValue = true,
    id,
    name,
    class: className = '',
    onchange,
    oninput,
  }: Props = $props()

  let sliderId = $state(id || `slider-${Math.random().toString(36).substr(2, 9)}`)

  const percentage = $derived(((value - min) / (max - min)) * 100)

  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement
    value = parseFloat(target.value)
    oninput?.(value)
  }

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement
    value = parseFloat(target.value)
    onchange?.(value)
  }
</script>

<div class={cn('w-full', className)}>
  {#if label || showValue}
    <div class="flex items-center justify-between mb-2">
      {#if label}
        <label for={sliderId} class="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      {/if}
      {#if showValue}
        <span class="text-sm font-medium text-primary-600 dark:text-primary-400">
          {value}
        </span>
      {/if}
    </div>
  {/if}

  <div class="relative">
    <input
      type="range"
      id={sliderId}
      {name}
      bind:value
      {min}
      {max}
      {step}
      {disabled}
      class={cn(
        'w-full h-2 rounded-full appearance-none cursor-pointer',
        'bg-gray-200 dark:bg-gray-700',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        '[&::-webkit-slider-thumb]:appearance-none',
        '[&::-webkit-slider-thumb]:w-5',
        '[&::-webkit-slider-thumb]:h-5',
        '[&::-webkit-slider-thumb]:rounded-full',
        '[&::-webkit-slider-thumb]:bg-white',
        '[&::-webkit-slider-thumb]:shadow-glow-md',
        '[&::-webkit-slider-thumb]:cursor-pointer',
        '[&::-webkit-slider-thumb]:transition-all',
        '[&::-webkit-slider-thumb]:hover:shadow-glow-lg',
        '[&::-moz-range-thumb]:w-5',
        '[&::-moz-range-thumb]:h-5',
        '[&::-moz-range-thumb]:rounded-full',
        '[&::-moz-range-thumb]:bg-white',
        '[&::-moz-range-thumb]:border-0',
        '[&::-moz-range-thumb]:shadow-glow-md',
        '[&::-moz-range-thumb]:cursor-pointer'
      )}
      style="background: linear-gradient(to right, #A46CF3 0%, #6C4CF3 {percentage}%, rgb(229 231 235) {percentage}%, rgb(229 231 235) 100%)"
      oninput={handleInput}
      onchange={handleChange}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
    />
  </div>

  {#if error}
    <p class="mt-1.5 text-sm text-error-600 dark:text-error-400">
      {error}
    </p>
  {:else if hint}
    <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
      {hint}
    </p>
  {/if}
</div>

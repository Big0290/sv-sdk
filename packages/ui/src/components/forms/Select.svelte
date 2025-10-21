<script lang="ts">
  /**
   * Select component - iOS 26 Glassmorphism Edition
   * Custom glass dropdown with Floating UI
   * Maintains backward compatibility
   */

  import { cn } from '../../theme/utils'
  import { ChevronDown, Check } from 'lucide-svelte'
  import { computePosition, flip, shift, offset } from '@floating-ui/dom'

  interface Option {
    value: string
    label: string
    disabled?: boolean
  }

  interface Props {
    value?: string
    options: Option[]
    label?: string
    placeholder?: string
    error?: string
    hint?: string
    disabled?: boolean
    required?: boolean
    id?: string
    name?: string
    class?: string
    onchange?: (value: string) => void
  }

  let {
    value = $bindable(''),
    options,
    label,
    placeholder = 'Select an option',
    error,
    hint,
    disabled = false,
    required = false,
    id,
    name,
    class: className = '',
    onchange,
  }: Props = $props()

  let selectId = $state(id || `select-${Math.random().toString(36).substr(2, 9)}`)
  let isOpen = $state(false)
  let buttonElement: HTMLButtonElement | undefined = $state()
  let dropdownElement: HTMLDivElement | undefined = $state()

  const selectedOption = $derived(options.find((opt) => opt.value === value))
  const displayText = $derived(selectedOption?.label || placeholder)

  async function updatePosition() {
    if (!buttonElement || !dropdownElement) return

    const { x, y } = await computePosition(buttonElement, dropdownElement, {
      placement: 'bottom-start',
      middleware: [offset(8), flip(), shift({ padding: 8 })],
    })

    dropdownElement.style.left = `${x}px`
    dropdownElement.style.top = `${y}px`
  }

  function toggleOpen() {
    if (!disabled) {
      isOpen = !isOpen
      if (isOpen) {
        updatePosition()
      }
    }
  }

  function selectOption(option: Option) {
    if (!option.disabled) {
      value = option.value
      isOpen = false
      onchange?.(option.value)
    }
  }

  function handleClickOutside(event: MouseEvent) {
    if (
      isOpen &&
      buttonElement &&
      dropdownElement &&
      !buttonElement.contains(event.target as Node) &&
      !dropdownElement.contains(event.target as Node)
    ) {
      isOpen = false
    }
  }

  $effect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      window.addEventListener('click', handleClickOutside)
      return () => window.removeEventListener('click', handleClickOutside)
    }
    return undefined
  })
</script>

<svelte:window on:resize={() => isOpen && updatePosition()} />

<div class={cn('w-full relative', className)}>
  {#if label}
    <label for={selectId} class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
      {#if required}
        <span class="text-error-500">*</span>
      {/if}
    </label>
  {/if}

  <button
    bind:this={buttonElement}
    type="button"
    id={selectId}
    {disabled}
    class={cn(
      'input w-full text-left flex items-center justify-between',
      error ? 'input-error' : '',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      !selectedOption ? 'text-gray-500 dark:text-gray-400' : ''
    )}
    onclick={toggleOpen}
    aria-haspopup="listbox"
    aria-expanded={isOpen}
  >
    <span class="truncate">{displayText}</span>
    <ChevronDown
      class={cn(
        'h-4 w-4 text-gray-500 dark:text-gray-400 transition-transform duration-200',
        isOpen ? 'rotate-180' : ''
      )}
    />
  </button>

  {#if isOpen}
    <div
      bind:this={dropdownElement}
      role="listbox"
      class="fixed z-dropdown glass-card min-w-[200px] max-h-[300px] overflow-y-auto scrollbar-thin animate-slide-down"
      style="width: {buttonElement?.offsetWidth}px"
    >
      {#each options as option}
        <button
          type="button"
          role="option"
          aria-selected={value === option.value}
          disabled={option.disabled}
          class={cn(
            'w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between',
            value === option.value
              ? 'bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
              : 'text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800',
            option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          )}
          onclick={() => selectOption(option)}
        >
          <span>{option.label}</span>
          {#if value === option.value}
            <Check class="h-4 w-4" />
          {/if}
        </button>
      {/each}
    </div>
  {/if}

  {#if error}
    <p class="mt-1.5 text-sm text-error-600 dark:text-error-400">
      {error}
    </p>
  {:else if hint}
    <p class="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
      {hint}
    </p>
  {/if}

  <select bind:value {name} class="sr-only" tabindex="-1" aria-hidden="true">
    {#each options as option}
      <option value={option.value}>{option.label}</option>
    {/each}
  </select>
</div>

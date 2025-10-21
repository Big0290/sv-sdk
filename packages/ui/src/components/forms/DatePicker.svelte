<script lang="ts">
  /**
   * DatePicker component - iOS 26 Glass Edition
   * Glass calendar overlay
   */

  import { cn } from '../../theme/utils'
  import { Calendar } from 'lucide-svelte'

  interface Props {
    value?: Date
    label?: string
    placeholder?: string
    class?: string
    onchange?: (date: Date) => void
  }

  let {
    value = $bindable(new Date()),
    label,
    placeholder = 'Select date',
    class: className = '',
    onchange,
  }: Props = $props()

  let isOpen = $state(false)
  const formattedDate = $derived(value.toLocaleDateString())

  function handleDateSelect(date: Date) {
    value = date
    isOpen = false
    onchange?.(date)
  }
</script>

<div class={cn('relative', className)}>
  {#if label}
    <label for="date-picker-button" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
      >{label}</label
    >
  {/if}

  <button
    id="date-picker-button"
    type="button"
    onclick={() => (isOpen = !isOpen)}
    class="input w-full text-left flex items-center justify-between"
  >
    <span>{formattedDate || placeholder}</span>
    <Calendar class="h-4 w-4 text-gray-500" />
  </button>

  {#if isOpen}
    <div class="absolute z-dropdown glass-card mt-2">
      <input
        type="date"
        value={value.toISOString().split('T')[0]}
        onchange={(e) => handleDateSelect(new Date((e.target as HTMLInputElement).value))}
        class="input"
      />
    </div>
  {/if}
</div>

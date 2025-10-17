<script lang="ts">
  /**
   * Radio component
   * Radio button with group management
   */

  interface Props {
    value: string
    checked?: boolean
    label?: string
    disabled?: boolean
    required?: boolean
    id?: string
    name: string
    class?: string
    onchange?: (value: string) => void
  }

  let {
    value,
    checked = $bindable(false),
    label,
    disabled = false,
    required = false,
    id,
    name,
    class: className = '',
    onchange,
  }: Props = $props()

  const inputId = id || `radio-${Math.random().toString(36).substring(7)}`

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement
    if (target.checked) {
      onchange?.(value)
    }
  }
</script>

<div class="flex items-center gap-2 {className}">
  <input
    type="radio"
    id={inputId}
    {name}
    {value}
    bind:checked
    {disabled}
    {required}
    class="h-4 w-4 border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
    onchange={handleChange}
  />
  {#if label}
    <label for={inputId} class="text-sm text-gray-700 dark:text-gray-300 cursor-pointer select-none">
      {label}
      {#if required}
        <span class="text-error-500" aria-label="required">*</span>
      {/if}
    </label>
  {/if}
</div>


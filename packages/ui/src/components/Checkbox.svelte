<script lang="ts">
  /**
   * Checkbox component
   * With indeterminate state support
   */

  interface Props {
    checked?: boolean
    indeterminate?: boolean
    label?: string
    disabled?: boolean
    required?: boolean
    id?: string
    name?: string
    value?: string
    class?: string
    onchange?: (checked: boolean) => void
  }

  let {
    checked = $bindable(false),
    indeterminate = false,
    label,
    disabled = false,
    required = false,
    id,
    name,
    value,
    class: className = '',
    onchange,
  }: Props = $props()

  const inputId = id || `checkbox-${Math.random().toString(36).substring(7)}`

  let checkboxRef: HTMLInputElement

  $effect(() => {
    if (checkboxRef) {
      checkboxRef.indeterminate = indeterminate
    }
  })

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement
    checked = target.checked
    onchange?.(checked)
  }
</script>

<div class="flex items-center gap-2 {className}">
  <input
    bind:this={checkboxRef}
    type="checkbox"
    id={inputId}
    {name}
    {value}
    bind:checked
    {disabled}
    {required}
    class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 disabled:opacity-50"
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


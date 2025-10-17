<script lang="ts">
  /**
   * DatePicker component
   * Simple date picker with keyboard navigation
   */

  interface Props {
    value?: string
    label?: string
    error?: string
    disabled?: boolean
    required?: boolean
    min?: string
    max?: string
    id?: string
    name?: string
    class?: string
  }

  let {
    value = $bindable(''),
    label,
    error,
    disabled = false,
    required = false,
    min,
    max,
    id,
    name,
    class: className = '',
  }: Props = $props()

  const inputId = id || `datepicker-${Math.random().toString(36).substring(7)}`
</script>

<div class="flex flex-col gap-1.5 {className}">
  {#if label}
    <label for={inputId} class="text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {#if required}
        <span class="text-error-500" aria-label="required">*</span>
      {/if}
    </label>
  {/if}

  <input
    type="date"
    id={inputId}
    {name}
    bind:value
    {disabled}
    {required}
    {min}
    {max}
    class="input {error ? 'input-error' : ''}"
    aria-invalid={!!error}
    aria-describedby={error ? `${inputId}-error` : undefined}
  />

  {#if error}
    <p id="{inputId}-error" class="text-sm text-error-600 dark:text-error-400" role="alert">
      {error}
    </p>
  {/if}
</div>


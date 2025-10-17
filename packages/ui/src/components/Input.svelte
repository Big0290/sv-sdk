<script lang="ts">
  /**
   * Input component
   * Accessible input with label, error states, and validation
   */

  interface Props {
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
    value?: string | number
    placeholder?: string
    label?: string
    error?: string
    disabled?: boolean
    required?: boolean
    id?: string
    name?: string
    autocomplete?: string
    class?: string
    oninput?: (event: Event) => void
  }

  let {
    type = 'text',
    value = $bindable(''),
    placeholder,
    label,
    error,
    disabled = false,
    required = false,
    id,
    name,
    autocomplete,
    class: className = '',
    oninput,
  }: Props = $props()

  // Generate ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substring(7)}`
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
    {type}
    id={inputId}
    {name}
    bind:value
    {placeholder}
    {disabled}
    {required}
    {autocomplete}
    class="input {error ? 'input-error' : ''}"
    aria-invalid={!!error}
    aria-describedby={error ? `${inputId}-error` : undefined}
    {oninput}
  />

  {#if error}
    <p id="{inputId}-error" class="text-sm text-error-600 dark:text-error-400" role="alert">
      {error}
    </p>
  {/if}
</div>


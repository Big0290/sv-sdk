<script lang="ts">
  /**
   * Select component
   * Dropdown select with search and keyboard navigation
   */

  interface Option {
    value: string
    label: string
    disabled?: boolean
  }

  interface Props {
    value?: string
    options: Option[]
    placeholder?: string
    label?: string
    error?: string
    disabled?: boolean
    required?: boolean
    searchable?: boolean
    id?: string
    name?: string
    class?: string
  }

  let {
    value = $bindable(''),
    options,
    placeholder = 'Select an option',
    label,
    error,
    disabled = false,
    required = false,
    searchable = false,
    id,
    name,
    class: className = '',
  }: Props = $props()

  const inputId = id || `select-${Math.random().toString(36).substring(7)}`

  let searchQuery = $state('')
  let filteredOptions = $derived(
    searchable && searchQuery
      ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
      : options
  )
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

  {#if searchable}
    <div class="relative">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Search..."
        class="input mb-2"
      />
    </div>
  {/if}

  <select
    id={inputId}
    {name}
    bind:value
    {disabled}
    {required}
    class="input {error ? 'input-error' : ''} cursor-pointer"
    aria-invalid={!!error}
    aria-describedby={error ? `${inputId}-error` : undefined}
  >
    {#if placeholder}
      <option value="" disabled selected>{placeholder}</option>
    {/if}
    {#each filteredOptions as option}
      <option value={option.value} disabled={option.disabled}>
        {option.label}
      </option>
    {/each}
  </select>

  {#if error}
    <p id="{inputId}-error" class="text-sm text-error-600 dark:text-error-400" role="alert">
      {error}
    </p>
  {/if}
</div>


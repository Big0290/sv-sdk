<script lang="ts">
  /**
   * Switch component
   * Toggle switch for boolean values
   */

  interface Props {
    checked?: boolean
    label?: string
    description?: string
    disabled?: boolean
    id?: string
    name?: string
    class?: string
    onchange?: (checked: boolean) => void
  }

  let {
    checked = $bindable(false),
    label,
    description,
    disabled = false,
    id,
    name,
    class: className = '',
    onchange,
  }: Props = $props()

  const inputId = id || `switch-${Math.random().toString(36).substring(7)}`

  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement
    checked = target.checked
    onchange?.(checked)
  }
</script>

<div class="flex items-center justify-between {className}">
  {#if label || description}
    <div class="flex-1">
      {#if label}
        <label for={inputId} class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
          {label}
        </label>
      {/if}
      {#if description}
        <p class="text-sm text-gray-500 dark:text-gray-400">
          {description}
        </p>
      {/if}
    </div>
  {/if}

  <button
    type="button"
    role="switch"
    id={inputId}
    aria-checked={checked}
    {disabled}
    class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
    class:bg-primary-600={checked}
    class:bg-gray-200={!checked}
    class:dark:bg-gray-700={!checked}
    onclick={() => {
      if (!disabled) {
        checked = !checked
        onchange?.(checked)
      }
    }}
  >
    <input type="checkbox" {name} bind:checked class="sr-only" onchange={handleChange} />
    <span
      class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
      class:translate-x-5={checked}
      class:translate-x-0={!checked}
    ></span>
  </button>
</div>


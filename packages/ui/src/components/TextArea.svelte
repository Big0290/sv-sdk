<script lang="ts">
  /**
   * TextArea component
   * Multi-line text input with auto-resize and character count
   */

  interface Props {
    value?: string
    placeholder?: string
    label?: string
    error?: string
    disabled?: boolean
    required?: boolean
    rows?: number
    maxLength?: number
    showCount?: boolean
    autoResize?: boolean
    id?: string
    name?: string
    class?: string
  }

  let {
    value = $bindable(''),
    placeholder,
    label,
    error,
    disabled = false,
    required = false,
    rows = 4,
    maxLength,
    showCount = false,
    autoResize = false,
    id,
    name,
    class: className = '',
  }: Props = $props()

  const inputId = id || `textarea-${Math.random().toString(36).substring(7)}`

  let textareaRef: HTMLTextAreaElement

  function handleInput(event: Event) {
    if (autoResize && textareaRef) {
      textareaRef.style.height = 'auto'
      textareaRef.style.height = textareaRef.scrollHeight + 'px'
    }
  }
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

  <textarea
    bind:this={textareaRef}
    id={inputId}
    {name}
    bind:value
    {placeholder}
    {disabled}
    {required}
    {rows}
    maxlength={maxLength}
    class="input {error ? 'input-error' : ''} resize-none"
    class:resize-y={!autoResize}
    aria-invalid={!!error}
    aria-describedby={error ? `${inputId}-error` : undefined}
    oninput={handleInput}
  ></textarea>

  <div class="flex justify-between items-center">
    {#if error}
      <p id="{inputId}-error" class="text-sm text-error-600 dark:text-error-400" role="alert">
        {error}
      </p>
    {/if}
    {#if showCount && maxLength}
      <p class="text-sm text-gray-500 dark:text-gray-400 ml-auto">
        {value.length} / {maxLength}
      </p>
    {/if}
  </div>
</div>


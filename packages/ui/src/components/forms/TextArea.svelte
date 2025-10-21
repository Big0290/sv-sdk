<script lang="ts">
  /**
   * TextArea component - iOS 26 Glassmorphism Edition
   * Resizable glass textarea
   * Maintains backward compatibility
   */

  import { cn } from '../../theme/utils'

  interface Props {
    value?: string
    label?: string
    placeholder?: string
    error?: string
    hint?: string
    disabled?: boolean
    required?: boolean
    readonly?: boolean
    rows?: number
    maxlength?: number
    id?: string
    name?: string
    class?: string
    resize?: boolean
    autoGrow?: boolean
    onchange?: (event: Event) => void
    oninput?: (event: Event) => void
  }

  let {
    value = $bindable(''),
    label,
    placeholder,
    error,
    hint,
    disabled = false,
    required = false,
    readonly = false,
    rows = 4,
    maxlength,
    id,
    name,
    class: className = '',
    resize = true,
    autoGrow = false,
    onchange,
    oninput,
  }: Props = $props()

  let textareaId = $state(id || `textarea-${Math.random().toString(36).substr(2, 9)}`)
  let textareaElement: HTMLTextAreaElement | undefined = $state()

  const characterCount = $derived(value?.length || 0)

  function handleInput(event: Event) {
    if (autoGrow && textareaElement) {
      textareaElement.style.height = 'auto'
      textareaElement.style.height = `${textareaElement.scrollHeight}px`
    }
    oninput?.(event)
  }
</script>

<div class={cn('w-full', className)}>
  {#if label}
    <label for={textareaId} class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
      {label}
      {#if required}
        <span class="text-error-500">*</span>
      {/if}
    </label>
  {/if}

  <div class="relative">
    <textarea
      bind:this={textareaElement}
      bind:value
      {placeholder}
      {disabled}
      {required}
      {readonly}
      {name}
      {rows}
      {maxlength}
      id={textareaId}
      class={cn(
        'input min-h-[80px] py-3',
        error ? 'input-error' : '',
        !resize ? 'resize-none' : 'resize-y',
        autoGrow ? 'overflow-hidden' : ''
      )}
      {onchange}
      oninput={handleInput}
      aria-invalid={error ? 'true' : undefined}
      aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
    ></textarea>
  </div>

  <div class="flex items-center justify-between mt-1.5">
    <div class="flex-1">
      {#if error}
        <p id="{textareaId}-error" class="text-sm text-error-600 dark:text-error-400">
          {error}
        </p>
      {:else if hint}
        <p id="{textareaId}-hint" class="text-sm text-gray-500 dark:text-gray-400">
          {hint}
        </p>
      {/if}
    </div>

    {#if maxlength}
      <p class="text-xs text-gray-500 dark:text-gray-400">
        {characterCount}/{maxlength}
      </p>
    {/if}
  </div>
</div>

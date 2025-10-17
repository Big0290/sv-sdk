<script lang="ts">
  /**
   * Modal component
   * Accessible modal with focus trap and backdrop
   */

  import { onMount } from 'svelte'

  interface Props {
    open?: boolean
    title?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    closeOnBackdrop?: boolean
    closeOnEscape?: boolean
    class?: string
    onClose?: () => void
  }

  let {
    open = $bindable(false),
    title,
    size = 'md',
    closeOnBackdrop = true,
    closeOnEscape = true,
    class: className = '',
    onClose,
    children,
  }: Props = $props()

  let dialogRef: HTMLDialogElement

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  $effect(() => {
    if (open && dialogRef) {
      dialogRef.showModal()
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    } else if (dialogRef) {
      dialogRef.close()
      document.body.style.overflow = ''
    }
  })

  function handleClose() {
    open = false
    onClose?.()
  }

  function handleBackdropClick(event: MouseEvent) {
    if (closeOnBackdrop && event.target === dialogRef) {
      handleClose()
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (closeOnEscape && event.key === 'Escape') {
      handleClose()
    }
  }

  onMount(() => {
    return () => {
      // Cleanup: restore body scroll
      document.body.style.overflow = ''
    }
  })
</script>

<dialog
  bind:this={dialogRef}
  class="backdrop:bg-black/50 bg-transparent p-0 max-h-[90vh] overflow-y-auto"
  onclick={handleBackdropClick}
  onkeydown={handleKeydown}
  aria-labelledby={title ? 'modal-title' : undefined}
>
  <div class="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full {sizeClasses[size]} {className}">
    {#if title}
      <div class="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
        <h2 id="modal-title" class="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h2>
        <button
          type="button"
          onclick={handleClose}
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Close modal"
        >
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    {/if}

    <div class="p-6">
      {@render children?.()}
    </div>
  </div>
</dialog>


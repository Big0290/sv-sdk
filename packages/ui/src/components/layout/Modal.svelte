<script lang="ts">
  /**
   * Modal component - iOS 26 Glassmorphism Edition
   * Glass modal with backdrop blur
   * Maintains backward compatibility
   */

  import { cn } from '../../theme/utils'
  import { X } from 'lucide-svelte'
  import { fade, scale } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'

  interface Props {
    open?: boolean
    title?: string
    description?: string
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    closeOnBackdrop?: boolean
    closeOnEscape?: boolean
    showClose?: boolean
    class?: string
    onclose?: () => void
    children?: import('svelte').Snippet
  }

  let {
    open = $bindable(false),
    title,
    description,
    size = 'md',
    closeOnBackdrop = true,
    closeOnEscape = true,
    showClose = true,
    class: className = '',
    onclose,
    children,
  }: Props = $props()

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4',
  }

  function handleClose() {
    open = false
    onclose?.()
  }

  function handleBackdropClick() {
    if (closeOnBackdrop) {
      handleClose()
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (closeOnEscape && event.key === 'Escape') {
      handleClose()
    }
  }

  $effect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.body.style.overflow = ''
    }
  })
</script>

<svelte:window on:keydown={handleKeydown} />

{#if open}
  <!-- Backdrop -->
  <div
    class="fixed inset-0 z-modal-backdrop backdrop-glass"
    transition:fade={{ duration: 200 }}
    onclick={handleBackdropClick}
    role="presentation"
  ></div>

  <!-- Modal -->
  <div
    class="fixed inset-0 z-modal flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? 'modal-title' : undefined}
    aria-describedby={description ? 'modal-description' : undefined}
  >
    <section
      class={cn('glass-card w-full', sizeClasses[size], 'max-h-[90vh] overflow-y-auto scrollbar-thin', className)}
      transition:scale={{ duration: 200, start: 0.95, easing: cubicOut }}
      role="document"
    >
      <!-- Header -->
      {#if title || showClose}
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            {#if title}
              <h2 id="modal-title" class="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {title}
              </h2>
            {/if}
            {#if description}
              <p id="modal-description" class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            {/if}
          </div>

          {#if showClose}
            <button
              type="button"
              class="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              onclick={handleClose}
              aria-label="Close modal"
            >
              <X class="h-5 w-5" />
            </button>
          {/if}
        </div>
      {/if}

      <!-- Content -->
      <div>
        {@render children?.()}
      </div>
    </section>
  </div>
{/if}

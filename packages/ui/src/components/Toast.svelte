<script lang="ts">
  /**
   * Toast component
   * Auto-dismissible notification
   */

  import { onMount } from 'svelte'

  interface Props {
    variant?: 'info' | 'success' | 'warning' | 'error'
    duration?: number
    onDismiss?: () => void
  }

  let {
    variant = 'info',
    duration = 5000,
    onDismiss,
    children,
  }: Props = $props()

  let visible = $state(true)

  onMount(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        visible = false
        onDismiss?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  })

  function handleDismiss() {
    visible = false
    onDismiss?.()
  }

  const variantClasses = {
    info: 'bg-primary-600 text-white',
    success: 'bg-success-600 text-white',
    warning: 'bg-warning-600 text-white',
    error: 'bg-error-600 text-white',
  }
</script>

{#if visible}
  <div
    class="fixed bottom-4 right-4 z-tooltip max-w-sm rounded-lg shadow-lg p-4 {variantClasses[variant]}"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <div class="flex-1">
        {@render children?.()}
      </div>
      <button
        type="button"
        onclick={handleDismiss}
        class="flex-shrink-0 opacity-70 hover:opacity-100"
        aria-label="Dismiss"
      >
        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
{/if}


<script lang="ts">
  /**
   * Alert component
   * Displays informational messages with different variants
   */

  interface Props {
    variant?: 'info' | 'success' | 'warning' | 'error'
    title?: string
    dismissible?: boolean
    class?: string
    onDismiss?: () => void
  }

  let {
    variant = 'info',
    title,
    dismissible = false,
    class: className = '',
    onDismiss,
    children,
  }: Props = $props()

  let visible = $state(true)

  function handleDismiss() {
    visible = false
    onDismiss?.()
  }

  const icons = {
    info: '🔵',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  }
</script>

{#if visible}
  <div class="alert alert-{variant} {className}" role="alert">
    <div class="flex items-start gap-3">
      <span class="text-xl flex-shrink-0" aria-hidden="true">{icons[variant]}</span>

      <div class="flex-1">
        {#if title}
          <h4 class="font-semibold mb-1">{title}</h4>
        {/if}

        <div class="text-sm">
          {@render children?.()}
        </div>
      </div>

      {#if dismissible}
        <button
          type="button"
          onclick={handleDismiss}
          class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Dismiss"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      {/if}
    </div>
  </div>
{/if}


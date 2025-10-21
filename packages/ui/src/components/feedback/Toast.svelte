<script lang="ts">
  /**
   * Toast component - iOS 26 Glassmorphism Edition
   * Floating glass toast notifications
   */

  import { cn } from '../../theme/utils'
  import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-svelte'
  import { fly } from 'svelte/transition'

  interface Props {
    variant?: 'info' | 'success' | 'warning' | 'error'
    title?: string
    message?: string
    duration?: number
    dismissible?: boolean
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
    class?: string
    ondismiss?: () => void
  }

  let {
    variant = 'info',
    title,
    message,
    duration = 5000,
    dismissible = true,
    position = 'top-right',
    class: className = '',
    ondismiss,
  }: Props = $props()

  let visible = $state(true)

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
  }

  const Icon = icons[variant]

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  }

  const colorClasses = {
    info: 'text-primary-600 dark:text-primary-400',
    success: 'text-success-600 dark:text-success-400',
    warning: 'text-warning-600 dark:text-warning-400',
    error: 'text-error-600 dark:text-error-400',
  }

  function dismiss() {
    visible = false
    ondismiss?.()
  }

  $effect(() => {
    if (duration > 0 && visible) {
      const timer = setTimeout(dismiss, duration)
      return () => clearTimeout(timer)
    }
  })
</script>

{#if visible}
  <div
    class={cn('fixed z-tooltip glass-card min-w-[300px] max-w-md shadow-glow-md', positionClasses[position], className)}
    transition:fly={{ y: position.includes('top') ? -20 : 20, duration: 300 }}
    role="alert"
  >
    <div class="flex items-start gap-3">
      <Icon class={cn('h-5 w-5 flex-shrink-0 mt-0.5', colorClasses[variant])} />

      <div class="flex-1 min-w-0">
        {#if title}
          <h4 class="font-semibold text-gray-900 dark:text-gray-100 mb-1">{title}</h4>
        {/if}
        {#if message}
          <p class="text-sm text-gray-600 dark:text-gray-400">{message}</p>
        {/if}
      </div>

      {#if dismissible}
        <button
          type="button"
          class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          onclick={dismiss}
          aria-label="Dismiss"
        >
          <X class="h-4 w-4" />
        </button>
      {/if}
    </div>
  </div>
{/if}

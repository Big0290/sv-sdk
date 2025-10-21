<script lang="ts">
  /**
   * Alert component - iOS 26 Glassmorphism Edition
   * Glass alert boxes with variants
   * Maintains backward compatibility
   */

  import { cn } from '../../theme/utils'
  import { Info, CheckCircle, AlertTriangle, XCircle, X } from 'lucide-svelte'

  interface Props {
    variant?: 'info' | 'success' | 'warning' | 'error'
    title?: string
    dismissible?: boolean
    class?: string
    ondismiss?: () => void
    children?: import('svelte').Snippet
  }

  let { variant = 'info', title, dismissible = false, class: className = '', ondismiss, children }: Props = $props()

  let dismissed = $state(false)

  const icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    error: XCircle,
  }

  const variantClasses = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
  }

  const Icon = icons[variant]

  function handleDismiss() {
    dismissed = true
    ondismiss?.()
  }
</script>

{#if !dismissed}
  <div class={cn('alert', variantClasses[variant], 'flex items-start gap-3', className)} role="alert">
    <Icon class="h-5 w-5 flex-shrink-0 mt-0.5" />

    <div class="flex-1">
      {#if title}
        <h4 class="font-medium mb-1">{title}</h4>
      {/if}
      <div class="text-sm">
        {@render children?.()}
      </div>
    </div>

    {#if dismissible}
      <button
        type="button"
        class="flex-shrink-0 text-current opacity-70 hover:opacity-100 transition-opacity"
        onclick={handleDismiss}
        aria-label="Dismiss alert"
      >
        <X class="h-4 w-4" />
      </button>
    {/if}
  </div>
{/if}

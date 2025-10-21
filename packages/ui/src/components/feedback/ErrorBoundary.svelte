<script lang="ts">
  import { cn } from '../../theme/utils'
  import { AlertTriangle } from 'lucide-svelte'

  interface Props {
    fallback?: import('svelte').Snippet<[error: Error]>
    onError?: (error: Error) => void
    class?: string
    children?: import('svelte').Snippet
  }

  let { fallback, onError, class: className = '', children }: Props = $props()
  let error = $state<Error | null>(null)

  function handleError(e: ErrorEvent) {
    error = e.error
    onError?.(e.error)
  }

  $effect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('error', handleError)
      return () => window.removeEventListener('error', handleError)
    }
    return undefined
  })
</script>

{#if error}
  {#if fallback}
    {@render fallback?.(error)}
  {:else}
    <div class={cn('glass-card text-center py-12', className)}>
      <AlertTriangle class="h-12 w-12 mx-auto mb-4 text-error-500" />
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Something went wrong</h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">{error.message}</p>
      <button onclick={() => window.location.reload()} class="btn btn-primary">Reload Page</button>
    </div>
  {/if}
{:else}
  {@render children?.()}
{/if}

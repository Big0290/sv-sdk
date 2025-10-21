<script lang="ts">
  /**
   * Backdrop component - Glass backdrop for modals/overlays
   */

  import { cn } from '../../theme/utils'
  import { fade } from 'svelte/transition'

  interface Props {
    show?: boolean
    blur?: boolean
    onclick?: () => void
    class?: string
    children?: import('svelte').Snippet
  }

  let { show = true, blur = true, onclick, class: className = '', children }: Props = $props()
</script>

{#if show}
  <div
    class={cn('fixed inset-0 z-modal-backdrop', blur ? 'backdrop-glass' : 'bg-black/50', className)}
    transition:fade={{ duration: 200 }}
    {onclick}
    role="presentation"
  >
    {@render children?.()}
  </div>
{/if}

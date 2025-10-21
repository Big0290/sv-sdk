<script lang="ts">
  import { cn } from '../../theme/utils'
  import { computePosition, flip, shift, offset } from '@floating-ui/dom'

  interface Props {
    open?: boolean
    placement?: 'top' | 'right' | 'bottom' | 'left'
    trigger?: import('svelte').Snippet
    content?: import('svelte').Snippet
    class?: string
  }

  let { open = $bindable(false), placement = 'bottom', trigger, content, class: className = '' }: Props = $props()

  let triggerElement: HTMLElement | undefined = $state()
  let popoverElement: HTMLDivElement | undefined = $state()

  async function updatePosition() {
    if (!triggerElement || !popoverElement) return
    const { x, y } = await computePosition(triggerElement, popoverElement, {
      placement,
      middleware: [offset(8), flip(), shift({ padding: 8 })],
    })
    popoverElement.style.left = `${x}px`
    popoverElement.style.top = `${y}px`
  }

  $effect(() => {
    if (open) updatePosition()
  })
</script>

<div
  bind:this={triggerElement}
  onclick={() => (open = !open)}
  onkeydown={(e) => e.key === 'Enter' && (open = !open)}
  role="button"
  tabindex="0"
>
  {@render trigger?.()}
</div>

{#if open}
  <div bind:this={popoverElement} class={cn('fixed z-popover glass-card animate-slide-down', className)}>
    {@render content?.()}
  </div>
{/if}

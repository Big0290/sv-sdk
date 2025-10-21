<script lang="ts">
  /**
   * Tooltip component - iOS 26 Glassmorphism Edition
   * Glass tooltip with Floating UI positioning
   */

  import { cn } from '../../theme/utils'
  import { computePosition, flip, shift, offset } from '@floating-ui/dom'

  interface Props {
    content: string
    placement?: 'top' | 'right' | 'bottom' | 'left'
    delay?: number
    class?: string
    children?: import('svelte').Snippet
  }

  let { content, placement = 'top', delay = 200, class: className = '', children }: Props = $props()

  let isVisible = $state(false)
  let triggerElement: HTMLElement | undefined = $state()
  let tooltipElement: HTMLDivElement | undefined = $state()
  let showTimeout: number | undefined = $state()

  async function updatePosition() {
    if (!triggerElement || !tooltipElement) return

    const { x, y } = await computePosition(triggerElement, tooltipElement, {
      placement,
      middleware: [offset(8), flip(), shift({ padding: 8 })],
    })

    tooltipElement.style.left = `${x}px`
    tooltipElement.style.top = `${y}px`
  }

  function handleMouseEnter() {
    showTimeout = setTimeout(() => {
      isVisible = true
      updatePosition()
    }, delay) as unknown as number
  }

  function handleMouseLeave() {
    clearTimeout(showTimeout)
    isVisible = false
  }
</script>

<span
  bind:this={triggerElement}
  class={cn('inline-block', className)}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  role="presentation"
>
  {@render children?.()}
</span>

{#if isVisible}
  <div
    bind:this={tooltipElement}
    role="tooltip"
    class="fixed z-tooltip glass px-3 py-2 text-sm text-gray-900 dark:text-gray-100 rounded-lg shadow-lg animate-fade-in pointer-events-none"
  >
    {content}
  </div>
{/if}

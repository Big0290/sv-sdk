<script lang="ts">
  /**
   * Portal component - Render children in a different DOM location
   */

  import { onMount } from 'svelte'

  interface Props {
    target?: string | HTMLElement
    children?: import('svelte').Snippet
  }

  let { target = 'body', children }: Props = $props()
  let portalNode: HTMLDivElement | undefined = $state()
  let targetNode: HTMLElement | undefined = $state()

  onMount(() => {
    portalNode = document.createElement('div')
    portalNode.className = 'portal-root'

    targetNode = typeof target === 'string' ? (document.querySelector(target) as HTMLElement) || document.body : target

    if (targetNode) {
      targetNode.appendChild(portalNode)
    }

    return () => {
      if (portalNode && targetNode?.contains(portalNode)) {
        targetNode.removeChild(portalNode)
      }
    }
  })
</script>

{#if portalNode}
  <div bind:this={portalNode}>
    {@render children?.()}
  </div>
{/if}

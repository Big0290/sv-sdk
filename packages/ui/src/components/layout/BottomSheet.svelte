<script lang="ts">
  import { cn } from '../../theme/utils'
  import { fly, fade } from 'svelte/transition'

  interface Props {
    open?: boolean
    title?: string
    onClose?: () => void
    class?: string
    children?: import('svelte').Snippet
  }

  let { open = $bindable(false), title, onClose, class: className = '', children }: Props = $props()
</script>

{#if open}
  <div class="fixed inset-0 z-modal" transition:fade={{ duration: 200 }}>
    <div
      class="backdrop-glass"
      onclick={() => {
        open = false
        onClose?.()
      }}
      onkeydown={(e) => e.key === 'Enter' && ((open = false), onClose?.())}
      role="button"
      tabindex="0"
      aria-label="Close bottom sheet"
    ></div>
    <div
      class={cn('fixed bottom-0 left-0 right-0 glass-card rounded-t-3xl max-h-[80vh] overflow-y-auto', className)}
      transition:fly={{ y: 300, duration: 300 }}
    >
      {#if title}
        <div class="p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <div class="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
      {/if}
      <div class="p-6">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}

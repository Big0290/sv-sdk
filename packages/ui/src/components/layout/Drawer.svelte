<script lang="ts">
  import { cn } from '../../theme/utils'
  import { X } from 'lucide-svelte'
  import { fly, fade } from 'svelte/transition'

  interface Props {
    open?: boolean
    position?: 'left' | 'right' | 'top' | 'bottom'
    title?: string
    onClose?: () => void
    class?: string
    children?: import('svelte').Snippet
  }

  let { open = $bindable(false), position = 'right', title, onClose, class: className = '', children }: Props = $props()

  const transitions = {
    left: { x: -300 },
    right: { x: 300 },
    top: { y: -300 },
    bottom: { y: 300 },
  }
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
      aria-label="Close drawer"
    ></div>
    <div
      class={cn(
        'fixed glass-card',
        position === 'left' ? 'left-0 top-0 bottom-0 w-80' : '',
        position === 'right' ? 'right-0 top-0 bottom-0 w-80' : '',
        position === 'top' ? 'top-0 left-0 right-0 h-80' : '',
        position === 'bottom' ? 'bottom-0 left-0 right-0 h-80' : '',
        className
      )}
      transition:fly={{ ...transitions[position], duration: 300 }}
    >
      {#if title}
        <div class="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50">
          <h3 class="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <button
            onclick={() => {
              open = false
              onClose?.()
            }}
            class="btn btn-ghost btn-sm rounded-full"
          >
            <X class="h-5 w-5" />
          </button>
        </div>
      {/if}
      <div class="p-6">
        {@render children?.()}
      </div>
    </div>
  </div>
{/if}

<script lang="ts">
  /**
   * Sidebar component - iOS 26 Glass Edition
   * Collapsible glass sidebar
   */

  import { cn } from '../../theme/utils'
  import { X } from 'lucide-svelte'

  interface Props {
    open?: boolean
    position?: 'left' | 'right'
    onClose?: () => void
    class?: string
    children?: import('svelte').Snippet
  }

  let { open = $bindable(true), position = 'left', onClose, class: className = '', children }: Props = $props()
</script>

{#if open}
  <aside
    class={cn(
      'glass-card fixed top-0 bottom-0 z-fixed w-64 transition-transform',
      position === 'left' ? 'left-0' : 'right-0',
      className
    )}
  >
    <div class="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
      <h3 class="font-semibold text-gray-900 dark:text-gray-100">Menu</h3>
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
    <div class="p-4">
      {@render children?.()}
    </div>
  </aside>
{/if}

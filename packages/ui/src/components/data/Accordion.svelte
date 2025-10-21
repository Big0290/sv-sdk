<script lang="ts">
  /**
   * Accordion component - iOS 26 Glassmorphism Edition
   * Collapsible glass panels with smooth animations
   */

  import { cn } from '../../theme/utils'
  import { ChevronDown } from 'lucide-svelte'
  import { slide } from 'svelte/transition'

  interface AccordionItem {
    id: string
    title: string
    content: string
    disabled?: boolean
  }

  interface Props {
    items: AccordionItem[]
    multiple?: boolean
    class?: string
  }

  let { items, multiple = false, class: className = '' }: Props = $props()

  let openItems = $state<Set<string>>(new Set())

  function toggleItem(id: string, disabled?: boolean) {
    if (disabled) return

    if (multiple) {
      const newSet = new Set(openItems)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      openItems = newSet
    } else {
      openItems = openItems.has(id) ? new Set() : new Set([id])
    }
  }
</script>

<div class={cn('space-y-2', className)}>
  {#each items as item}
    {@const isOpen = openItems.has(item.id)}
    <div class="glass-card !p-0 overflow-hidden">
      <button
        type="button"
        class={cn(
          'w-full px-6 py-4 flex items-center justify-between text-left transition-colors',
          isOpen ? 'bg-primary-50/50 dark:bg-primary-950/30' : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30',
          item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        )}
        onclick={() => toggleItem(item.id, item.disabled)}
        aria-expanded={isOpen}
        disabled={item.disabled}
      >
        <span class="font-medium text-gray-900 dark:text-gray-100">{item.title}</span>
        <ChevronDown
          class={cn(
            'h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform duration-200',
            isOpen ? 'rotate-180' : ''
          )}
        />
      </button>

      {#if isOpen}
        <div
          class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200/50 dark:border-gray-700/50"
          transition:slide={{ duration: 200 }}
        >
          {item.content}
        </div>
      {/if}
    </div>
  {/each}
</div>

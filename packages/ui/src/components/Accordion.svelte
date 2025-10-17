<script lang="ts">
  /**
   * Accordion component
   * Collapsible content sections
   */

  interface AccordionItem {
    id: string
    title: string
    content?: any
  }

  interface Props {
    items: AccordionItem[]
    multiple?: boolean
    class?: string
  }

  let {
    items,
    multiple = false,
    class: className = '',
    children,
  }: Props = $props()

  let openItems = $state<Set<string>>(new Set())

  function toggleItem(id: string) {
    if (openItems.has(id)) {
      openItems.delete(id)
    } else {
      if (!multiple) {
        openItems.clear()
      }
      openItems.add(id)
    }
    openItems = new Set(openItems)
  }
</script>

<div class="space-y-2 {className}">
  {#each items as item}
    <div class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
      <button
        type="button"
        class="w-full flex items-center justify-between p-4 text-left bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onclick={() => toggleItem(item.id)}
        aria-expanded={openItems.has(item.id)}
      >
        <span class="font-medium text-gray-900 dark:text-gray-100">
          {item.title}
        </span>
        <svg
          class="h-5 w-5 text-gray-500 transition-transform"
          class:rotate-180={openItems.has(item.id)}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {#if openItems.has(item.id)}
        <div class="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          {#if item.content}
            {item.content}
          {:else}
            {@render children?.()}
          {/if}
        </div>
      {/if}
    </div>
  {/each}
</div>


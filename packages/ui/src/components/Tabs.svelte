<script lang="ts">
  /**
   * Tabs component
   * Accessible tab navigation
   */

  interface Tab {
    id: string
    label: string
    icon?: string
    disabled?: boolean
  }

  interface Props {
    tabs: Tab[]
    activeTab?: string
    class?: string
    onTabChange?: (tabId: string) => void
  }

  let {
    tabs,
    activeTab = $bindable(tabs[0]?.id || ''),
    class: className = '',
    onTabChange,
    children,
  }: Props = $props()

  function handleTabClick(tabId: string, disabled?: boolean) {
    if (disabled) return
    activeTab = tabId
    onTabChange?.(tabId)
  }

  function handleKeydown(event: KeyboardEvent, index: number) {
    if (event.key === 'ArrowRight' && index < tabs.length - 1) {
      activeTab = tabs[index + 1].id
    } else if (event.key === 'ArrowLeft' && index > 0) {
      activeTab = tabs[index - 1].id
    }
  }
</script>

<div class="{className}">
  <div class="border-b border-gray-200 dark:border-gray-800" role="tablist">
    <nav class="-mb-px flex space-x-8" aria-label="Tabs">
      {#each tabs as tab, index}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls="panel-{tab.id}"
          tabindex={activeTab === tab.id ? 0 : -1}
          disabled={tab.disabled}
          class="whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors"
          class:border-primary-500={activeTab === tab.id}
          class:text-primary-600={activeTab === tab.id}
          class:dark:text-primary-400={activeTab === tab.id}
          class:border-transparent={activeTab !== tab.id}
          class:text-gray-500={activeTab !== tab.id}
          class:hover:text-gray-700={activeTab !== tab.id && !tab.disabled}
          class:dark:hover:text-gray-300={activeTab !== tab.id && !tab.disabled}
          class:opacity-50={tab.disabled}
          onclick={() => handleTabClick(tab.id, tab.disabled)}
          onkeydown={(e) => handleKeydown(e, index)}
        >
          {#if tab.icon}
            <span class="mr-2">{tab.icon}</span>
          {/if}
          {tab.label}
        </button>
      {/each}
    </nav>
  </div>

  <div class="mt-4">
    {@render children?.()}
  </div>
</div>


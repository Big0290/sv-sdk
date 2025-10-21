<script lang="ts">
  /**
   * Tabs component - iOS 26 Glassmorphism Edition
   * Glass segmented control tabs
   */

  import { cn } from '../../theme/utils'

  interface Tab {
    id: string
    label: string
    disabled?: boolean
    badge?: string | number
  }

  interface Props {
    tabs: Tab[]
    active?: string
    variant?: 'default' | 'pills'
    class?: string
    onchange?: (tabId: string) => void
    children?: import('svelte').Snippet
  }

  let {
    tabs,
    active = $bindable(tabs[0]?.id),
    variant = 'default',
    class: className = '',
    onchange,
    children,
  }: Props = $props()

  function handleTabClick(tabId: string, disabled?: boolean) {
    if (!disabled) {
      active = tabId
      onchange?.(tabId)
    }
  }
</script>

<div class={cn('w-full', className)}>
  <div
    class={cn(
      'flex gap-1',
      variant === 'pills' ? 'glass p-1 rounded-xl' : 'border-b border-gray-200 dark:border-gray-800'
    )}
    role="tablist"
  >
    {#each tabs as tab}
      <button
        type="button"
        role="tab"
        aria-selected={active === tab.id}
        aria-disabled={tab.disabled}
        disabled={tab.disabled}
        class={cn(
          'px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-lg',
          active === tab.id
            ? variant === 'pills'
              ? 'bg-white dark:bg-gray-800 shadow-md text-primary-600 dark:text-primary-400'
              : 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-600'
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100',
          tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          variant === 'default' ? '-mb-px' : ''
        )}
        onclick={() => handleTabClick(tab.id, tab.disabled)}
      >
        <span class="flex items-center gap-2">
          {tab.label}
          {#if tab.badge}
            <span
              class="px-2 py-0.5 text-xs rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300"
            >
              {tab.badge}
            </span>
          {/if}
        </span>
      </button>
    {/each}
  </div>

  <div class="mt-4" role="tabpanel">
    {@render children?.()}
  </div>
</div>

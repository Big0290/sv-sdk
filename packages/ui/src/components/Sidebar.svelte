<script lang="ts">
  /**
   * Sidebar component
   * Collapsible navigation sidebar
   */

  interface NavItem {
    label: string
    href: string
    icon?: string
    badge?: string
    children?: NavItem[]
  }

  interface Props {
    items: NavItem[]
    collapsed?: boolean
    activeHref?: string
    class?: string
    onNavigate?: (href: string) => void
  }

  let {
    items,
    collapsed = false,
    activeHref = '',
    class: className = '',
    onNavigate,
  }: Props = $props()

  function isActive(item: NavItem): boolean {
    return activeHref === item.href || activeHref.startsWith(item.href + '/')
  }
</script>

<nav class="h-full flex flex-col {className}">
  <div class="flex-1 overflow-y-auto py-4">
    <ul class="space-y-1 px-3">
      {#each items as item}
        <li>
          <a
            href={item.href}
            class="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors"
            class:bg-primary-50={isActive(item)}
            class:dark:bg-primary-950={isActive(item)}
            class:text-primary-700={isActive(item)}
            class:dark:text-primary-300={isActive(item)}
            class:text-gray-700={!isActive(item)}
            class:dark:text-gray-300={!isActive(item)}
            class:hover:bg-gray-100={!isActive(item)}
            class:dark:hover:bg-gray-800={!isActive(item)}
            onclick={() => onNavigate?.(item.href)}
          >
            {#if item.icon}
              <span class="text-xl flex-shrink-0">{item.icon}</span>
            {/if}
            {#if !collapsed}
              <span class="flex-1">{item.label}</span>
              {#if item.badge}
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                  {item.badge}
                </span>
              {/if}
            {/if}
          </a>

          {#if item.children && !collapsed}
            <ul class="ml-8 mt-1 space-y-1">
              {#each item.children as child}
                <li>
                  <a
                    href={child.href}
                    class="block px-4 py-2 text-sm rounded-lg transition-colors"
                    class:bg-primary-50={isActive(child)}
                    class:text-primary-700={isActive(child)}
                    class:text-gray-600={!isActive(child)}
                    class:hover:bg-gray-100={!isActive(child)}
                  >
                    {child.label}
                  </a>
                </li>
              {/each}
            </ul>
          {/if}
        </li>
      {/each}
    </ul>
  </div>
</nav>


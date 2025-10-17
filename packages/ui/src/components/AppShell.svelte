<script lang="ts">
  /**
   * AppShell component
   * Responsive application layout with sidebar, navbar, and main content
   */

  interface Props {
    sidebarCollapsed?: boolean
    showSidebar?: boolean
    class?: string
  }

  let {
    sidebarCollapsed = $bindable(false),
    showSidebar = true,
    class: className = '',
    navbar,
    sidebar,
    children,
  }: Props = $props()
</script>

<div class="flex h-screen overflow-hidden {className}">
  <!-- Sidebar -->
  {#if showSidebar}
    <aside
      class="flex-shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300"
      class:w-64={!sidebarCollapsed}
      class:w-16={sidebarCollapsed}
    >
      {@render sidebar?.()}
    </aside>
  {/if}

  <!-- Main content area -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Navbar -->
    {#if navbar}
      <header class="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        {@render navbar?.()}
      </header>
    {/if}

    <!-- Page content -->
    <main class="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950">
      {@render children?.()}
    </main>
  </div>
</div>


<script lang="ts">
  /**
   * AppShell component - iOS 26 Glass Edition
   * Application shell with header/sidebar/footer
   */

  import { cn } from '../../theme/utils'

  interface Props {
    header?: import('svelte').Snippet
    sidebar?: import('svelte').Snippet
    footer?: import('svelte').Snippet
    class?: string
    children?: import('svelte').Snippet
  }

  let { header, sidebar, footer, class: className = '', children }: Props = $props()
</script>

<div class={cn('min-h-screen flex flex-col', className)}>
  {#if header}
    <header class="glass sticky top-0 z-sticky">
      {@render header?.()}
    </header>
  {/if}

  <div class="flex flex-1">
    {#if sidebar}
      <aside class="glass w-64 flex-shrink-0">
        {@render sidebar?.()}
      </aside>
    {/if}

    <main class="flex-1 p-6">
      {@render children?.()}
    </main>
  </div>

  {#if footer}
    <footer class="glass mt-auto">
      {@render footer?.()}
    </footer>
  {/if}
</div>

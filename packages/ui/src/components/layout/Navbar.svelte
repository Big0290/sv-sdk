<script lang="ts">
  /**
   * Navbar component - iOS 26 Glass Edition
   * Glass navigation bar
   */

  import { cn } from '../../theme/utils'

  interface Props {
    logo?: string
    class?: string
    children?: import('svelte').Snippet
  }

  let { logo, class: className = '', children }: Props = $props()
</script>

<nav class={cn('glass sticky top-0 z-sticky', className)}>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between h-16">
      {#if logo}
        <div class="flex-shrink-0">
          <img src={logo} alt="Logo" class="h-8" />
        </div>
      {/if}
      <div class="flex-1 flex items-center justify-end gap-4">
        {@render children?.()}
      </div>
    </div>
  </div>
</nav>

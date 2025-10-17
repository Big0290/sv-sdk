<script lang="ts">
  /**
   * Navbar component
   * Responsive navigation bar with dropdown menus
   */

  interface Props {
    title?: string
    class?: string
  }

  let {
    title,
    class: className = '',
    left,
    right,
  }: Props = $props()
</script>

<nav class="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 {className}">
  <div class="flex items-center gap-4">
    {#if title}
      <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100">
        {title}
      </h1>
    {/if}
    {#if left}
      {@render left?.()}
    {/if}
  </div>

  <div class="flex items-center gap-4">
    {#if right}
      {@render right?.()}
    {/if}
  </div>
</nav>


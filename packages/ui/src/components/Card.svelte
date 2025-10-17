<script lang="ts">
  /**
   * Card component
   * Container with border and shadow
   */

  interface Props {
    class?: string
    padding?: boolean
  }

  let { class: className = '', padding = true, children }: Props = $props()
</script>

<div class="card {padding ? 'p-6' : ''} {className}">
  {@render children?.()}
</div>


<script lang="ts">
  /**
   * Grid component
   * Responsive grid layout
   */

  interface Props {
    cols?: 1 | 2 | 3 | 4 | 6 | 12
    gap?: number
    class?: string
  }

  let {
    cols = 12,
    gap = 4,
    class: className = '',
    children,
  }: Props = $props()

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-12',
  }

  const gapClass = `gap-${gap}`
</script>

<div class="grid {colClasses[cols]} {gapClass} {className}">
  {@render children?.()}
</div>


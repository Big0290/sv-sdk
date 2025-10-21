<script lang="ts">
  /**
   * Grid component - iOS 26 Glassmorphism Edition
   * Responsive grid layout
   */

  import { cn } from '../../theme/utils'

  interface Props {
    cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12
    gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
    class?: string
    children?: import('svelte').Snippet
  }

  let { cols = 1, gap = 'md', class: className = '', children }: Props = $props()

  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
    6: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-6',
    12: 'grid-cols-12',
  }

  const gapClasses = {
    none: 'gap-0',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }
</script>

<div class={cn('grid', colClasses[cols], gapClasses[gap], className)}>
  {@render children?.()}
</div>

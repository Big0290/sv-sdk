<script lang="ts">
  /**
   * Stack component - iOS 26 Glassmorphism Edition
   * Vertical/horizontal stack layout with spacing
   */

  import { cn } from '../../theme/utils'

  interface Props {
    direction?: 'vertical' | 'horizontal'
    spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    align?: 'start' | 'center' | 'end' | 'stretch'
    justify?: 'start' | 'center' | 'end' | 'between' | 'around'
    wrap?: boolean
    class?: string
    children?: import('svelte').Snippet
  }

  let {
    direction = 'vertical',
    spacing = 'md',
    align = 'stretch',
    justify = 'start',
    wrap = false,
    class: className = '',
    children,
  }: Props = $props()

  const directionClasses = {
    vertical: 'flex-col',
    horizontal: 'flex-row',
  }

  const spacingClasses = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  }
</script>

<div
  class={cn(
    'flex',
    directionClasses[direction],
    spacingClasses[spacing],
    alignClasses[align],
    justifyClasses[justify],
    wrap ? 'flex-wrap' : '',
    className
  )}
>
  {@render children?.()}
</div>

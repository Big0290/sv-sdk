<script lang="ts">
  /**
   * Stack component
   * Vertical or horizontal stack with consistent spacing
   */

  interface Props {
    direction?: 'vertical' | 'horizontal'
    gap?: number
    align?: 'start' | 'center' | 'end' | 'stretch'
    justify?: 'start' | 'center' | 'end' | 'between'
    class?: string
  }

  let {
    direction = 'vertical',
    gap = 4,
    align = 'stretch',
    justify = 'start',
    class: className = '',
    children,
  }: Props = $props()

  const directionClass = direction === 'vertical' ? 'flex-col' : 'flex-row'
  const gapClass = `gap-${gap}`

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
  }
</script>

<div class="flex {directionClass} {gapClass} {alignClasses[align]} {justifyClasses[justify]} {className}">
  {@render children?.()}
</div>


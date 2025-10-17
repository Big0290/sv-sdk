<script lang="ts">
  /**
   * Skeleton component
   * Loading placeholder
   */

  interface Props {
    variant?: 'text' | 'circle' | 'rect'
    width?: string
    height?: string
    class?: string
  }

  let {
    variant = 'text',
    width,
    height,
    class: className = '',
  }: Props = $props()

  const variantClasses = {
    text: 'rounded h-4',
    circle: 'rounded-full',
    rect: 'rounded',
  }
</script>

<div
  class="animate-pulse bg-gray-200 dark:bg-gray-800 {variantClasses[variant]} {className}"
  style:width={width}
  style:height={height}
  aria-label="Loading"
  aria-busy="true"
></div>


<script lang="ts">
  /**
   * Container component
   * Responsive container with max-width
   */

  interface Props {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
    padding?: boolean
    class?: string
  }

  let {
    size = 'lg',
    padding = true,
    class: className = '',
    children,
  }: Props = $props()

  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }
</script>

<div class="mx-auto {sizeClasses[size]} {padding ? 'px-4 sm:px-6 lg:px-8' : ''} {className}">
  {@render children?.()}
</div>


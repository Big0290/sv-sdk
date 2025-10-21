<script lang="ts">
  /**
   * Container component - iOS 26 Glassmorphism Edition
   * Responsive container with max-width constraints
   */

  import { cn } from '../../theme/utils'

  interface Props {
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
    class?: string
    children?: import('svelte').Snippet
  }

  let { size = 'lg', class: className = '', children }: Props = $props()

  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  }
</script>

<div class={cn('mx-auto px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}>
  {@render children?.()}
</div>

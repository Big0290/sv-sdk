<script lang="ts">
  /**
   * Skeleton component - iOS 26 Glassmorphism Edition
   * Shimmer skeleton loaders with glass effect
   */

  import { cn } from '../../theme/utils'

  interface Props {
    variant?: 'text' | 'circular' | 'rectangular'
    width?: string
    height?: string
    lines?: number
    class?: string
  }

  let { variant = 'rectangular', width, height, lines = 1, class: className = '' }: Props = $props()

  const variantClasses = {
    text: 'h-4 rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  }
</script>

{#if variant === 'text' && lines > 1}
  <div class={cn('space-y-2', className)}>
    {#each Array.from({ length: lines }, (_, i) => i) as i (i)}
      <div
        class={cn(
          'glass animate-shimmer bg-shimmer-gradient bg-[length:200%_100%]',
          variantClasses.text,
          i === lines - 1 ? 'w-3/4' : ''
        )}
        style={width && i !== lines - 1 ? `width: ${width}` : ''}
      ></div>
    {/each}
  </div>
{:else}
  <div
    class={cn('glass animate-shimmer bg-shimmer-gradient bg-[length:200%_100%]', variantClasses[variant], className)}
    style={`${width ? `width: ${width};` : ''} ${height ? `height: ${height};` : ''}`}
    aria-label="Loading"
  ></div>
{/if}

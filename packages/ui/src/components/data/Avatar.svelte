<script lang="ts">
  /**
   * Avatar component - iOS 26 Glassmorphism Edition
   * User avatar with initials fallback and glass border
   */

  import { cn } from '../../theme/utils'

  interface Props {
    src?: string
    alt?: string
    initials?: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
    variant?: 'circular' | 'rounded'
    status?: 'online' | 'offline' | 'away' | 'busy' | false
    glow?: boolean
    class?: string
  }

  let {
    src,
    alt,
    initials,
    size = 'md',
    variant = 'circular',
    status = false,
    glow = false,
    class: className = '',
  }: Props = $props()

  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
    '2xl': 'h-24 w-24 text-3xl',
  }

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-gray-400',
    away: 'bg-warning-500',
    busy: 'bg-error-500',
  }

  const statusSizes = {
    xs: 'h-1.5 w-1.5',
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
    '2xl': 'h-5 w-5',
  }
</script>

<div class={cn('relative inline-block', className)}>
  <div
    class={cn(
      'flex items-center justify-center font-medium overflow-hidden',
      variant === 'circular' ? 'rounded-full' : 'rounded-xl',
      glow ? 'ring-2 ring-primary-500/50 shadow-glow-sm' : '',
      sizeClasses[size],
      !src ? 'bg-gradient-primary text-white' : ''
    )}
  >
    {#if src}
      <img {src} {alt} class="h-full w-full object-cover" />
    {:else if initials}
      {initials}
    {:else}
      <span class="text-2xl">👤</span>
    {/if}
  </div>

  {#if status}
    <span
      class={cn(
        'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-gray-900',
        statusColors[status],
        statusSizes[size]
      )}
      aria-label={`Status: ${status}`}
    ></span>
  {/if}
</div>

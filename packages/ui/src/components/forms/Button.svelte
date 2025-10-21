<script lang="ts">
  /**
   * Button component - iOS 26 Glassmorphism Edition
   * Accessible button with multiple variants and loading state
   * Maintains backward compatibility with existing prop interface
   */

  import { Loader2 } from 'lucide-svelte'
  import { cn } from '../../theme/utils'

  interface Props {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    loading?: boolean
    fullWidth?: boolean
    glow?: boolean
    class?: string
    onclick?: (event: MouseEvent) => void
    children?: import('svelte').Snippet
  }

  let {
    variant = 'primary',
    size = 'md',
    type = 'button',
    disabled = false,
    loading = false,
    fullWidth = false,
    glow = false,
    class: className = '',
    onclick,
    children,
  }: Props = $props()

  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'bg-accent-600 text-white hover:bg-accent-700 dark:bg-accent-500 dark:hover:bg-accent-600',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    glass: 'btn-glass',
    danger: 'bg-error-600 text-white hover:bg-error-700 dark:bg-error-500 dark:hover:bg-error-600 shadow-error-md',
  }

  const sizeClasses = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  }

  const glowClass = glow ? 'hover-glow' : ''
</script>

<button
  {type}
  disabled={disabled || loading}
  class={cn('btn', variantClasses[variant], sizeClasses[size], fullWidth ? 'w-full' : '', glowClass, className)}
  aria-busy={loading}
  {onclick}
>
  {#if loading}
    <Loader2 class="animate-spin -ml-1 mr-2 h-4 w-4" aria-label="Loading" />
  {/if}
  {@render children?.()}
</button>

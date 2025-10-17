<script lang="ts">
  /**
   * Badge component
   * Small label for status or counts
   */

  interface Props {
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
    size?: 'sm' | 'md'
    class?: string
  }

  let {
    variant = 'default',
    size = 'sm',
    class: className = '',
    children,
  }: Props = $props()

  const variantClasses = {
    default: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200',
    primary: 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200',
    success: 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200',
    warning: 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200',
    error: 'bg-error-100 dark:bg-error-900 text-error-800 dark:text-error-200',
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }
</script>

<span class="inline-flex items-center rounded-full font-medium {variantClasses[variant]} {sizeClasses[size]} {className}">
  {@render children?.()}
</span>


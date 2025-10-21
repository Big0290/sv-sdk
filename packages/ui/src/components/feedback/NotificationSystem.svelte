<script lang="ts">
  import { cn } from '../../theme/utils'
  import Toast from './Toast.svelte'

  export interface Notification {
    id: string
    variant: 'info' | 'success' | 'warning' | 'error'
    title?: string
    message: string
    duration?: number
  }

  interface Props {
    notifications?: Notification[]
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    class?: string
  }

  let { notifications = $bindable([]), position = 'top-right', class: className = '' }: Props = $props()

  function removeNotification(id: string) {
    notifications = notifications.filter((n) => n.id !== id)
  }
</script>

<div
  class={cn(
    'fixed z-tooltip space-y-4',
    position.includes('top') ? 'top-4' : 'bottom-4',
    position.includes('right') ? 'right-4' : 'left-4',
    className
  )}
>
  {#each notifications as notification (notification.id)}
    <Toast
      variant={notification.variant}
      title={notification.title}
      message={notification.message}
      duration={notification.duration}
      {position}
      ondismiss={() => removeNotification(notification.id)}
    />
  {/each}
</div>

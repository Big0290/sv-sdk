<script lang="ts">
  /**
   * MessageBubble component - iOS 26 Glass Edition
   * Glass message bubbles for chat
   */

  import { cn } from '../../theme/utils'
  import Avatar from '../data/Avatar.svelte'

  interface Props {
    message: string
    sender: { name: string; avatar?: string }
    timestamp: Date
    variant?: 'sent' | 'received'
    class?: string
  }

  let { message, sender, timestamp, variant = 'received', class: className = '' }: Props = $props()
</script>

<div class={cn('flex gap-3', variant === 'sent' ? 'flex-row-reverse' : 'flex-row', className)}>
  <Avatar src={sender.avatar} initials={sender.name[0]} size="sm" />

  <div class={cn('flex flex-col', variant === 'sent' ? 'items-end' : 'items-start')}>
    <div
      class={cn(
        'glass px-4 py-2 rounded-2xl max-w-md',
        variant === 'sent' ? 'bg-gradient-primary text-white rounded-tr-none' : 'rounded-tl-none'
      )}
    >
      <p class="text-sm">{message}</p>
    </div>
    <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">
      {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
    </span>
  </div>
</div>

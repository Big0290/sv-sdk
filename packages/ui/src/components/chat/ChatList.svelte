<script lang="ts">
  import { cn } from '../../theme/utils'
  import Avatar from '../data/Avatar.svelte'

  interface Chat {
    id: string
    user: { name: string; avatar?: string }
    lastMessage: string
    timestamp: Date
    unread?: number
  }

  interface Props {
    chats: Chat[]
    onSelect?: (id: string) => void
    class?: string
  }

  let { chats, onSelect, class: className = '' }: Props = $props()
</script>

<div class={cn('glass-card !p-0', className)}>
  {#each chats as chat}
    <button
      onclick={() => onSelect?.(chat.id)}
      class="w-full flex items-center gap-3 p-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors border-b border-gray-200/50 dark:border-gray-700/50 last:border-0"
    >
      <Avatar src={chat.user.avatar} initials={chat.user.name[0]} size="md" />
      <div class="flex-1 text-left">
        <div class="flex items-center justify-between mb-1">
          <h4 class="font-medium text-gray-900 dark:text-gray-100">{chat.user.name}</h4>
          <span class="text-xs text-gray-500"
            >{chat.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span
          >
        </div>
        <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{chat.lastMessage}</p>
      </div>
      {#if chat.unread}
        <span class="bg-gradient-primary text-white text-xs font-medium px-2 py-0.5 rounded-full">{chat.unread}</span>
      {/if}
    </button>
  {/each}
</div>

<script lang="ts">
  import { cn } from '../../theme/utils'
  import Avatar from '../data/Avatar.svelte'

  interface Props {
    user: { name: string; avatar?: string; status?: 'online' | 'offline' | 'away' | 'busy' }
    class?: string
  }

  let { user, class: className = '' }: Props = $props()
</script>

<div class={cn('glass flex items-center gap-3 p-4', className)}>
  <Avatar src={user.avatar} initials={user.name[0]} status={user.status} size="md" />
  <div>
    <h3 class="font-medium text-gray-900 dark:text-gray-100">{user.name}</h3>
    {#if user.status}
      <p class="text-xs text-gray-500">{user.status}</p>
    {/if}
  </div>
</div>

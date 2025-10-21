<script lang="ts">
  import { cn } from '../../theme/utils'
  import Avatar from '../data/Avatar.svelte'
  import { Mic, MicOff, PhoneOff } from 'lucide-svelte'

  interface Props {
    participant: { name: string; avatar?: string }
    isMuted?: boolean
    duration?: number
    onToggleMute?: () => void
    onEndCall?: () => void
    class?: string
  }

  let {
    participant,
    isMuted = $bindable(false),
    duration = 0,
    onToggleMute,
    onEndCall,
    class: className = '',
  }: Props = $props()

  const formattedDuration = $derived(() => {
    const mins = Math.floor(duration / 60)
    const secs = duration % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  })
</script>

<div class={cn('glass-card text-center', className)}>
  <Avatar src={participant.avatar} initials={participant.name[0]} size="2xl" class="mx-auto mb-4" />
  <h3 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{participant.name}</h3>
  <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">{formattedDuration()}</p>

  <div class="flex items-center justify-center gap-4">
    <button
      onclick={() => {
        isMuted = !isMuted
        onToggleMute?.()
      }}
      class={cn('btn rounded-full', isMuted ? 'btn-danger' : 'btn-glass')}
    >
      {#if isMuted}<MicOff class="h-5 w-5" />{:else}<Mic class="h-5 w-5" />{/if}
    </button>

    <button onclick={onEndCall} class="btn btn-danger rounded-full">
      <PhoneOff class="h-5 w-5" />
    </button>
  </div>
</div>

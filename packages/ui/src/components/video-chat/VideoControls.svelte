<script lang="ts">
  import { cn } from '../../theme/utils'
  import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-svelte'

  interface Props {
    isMuted?: boolean
    isCameraOff?: boolean
    onToggleMute?: () => void
    onToggleCamera?: () => void
    onLeave?: () => void
    class?: string
  }

  let {
    isMuted = $bindable(false),
    isCameraOff = $bindable(false),
    onToggleMute,
    onToggleCamera,
    onLeave,
    class: className = '',
  }: Props = $props()
</script>

<div class={cn('glass flex items-center justify-center gap-4 p-4', className)}>
  <button
    onclick={() => {
      isMuted = !isMuted
      onToggleMute?.()
    }}
    class={cn('btn rounded-full', isMuted ? 'btn-danger' : 'btn-glass')}
  >
    {#if isMuted}<MicOff class="h-5 w-5" />{:else}<Mic class="h-5 w-5" />{/if}
  </button>

  <button
    onclick={() => {
      isCameraOff = !isCameraOff
      onToggleCamera?.()
    }}
    class={cn('btn rounded-full', isCameraOff ? 'btn-danger' : 'btn-glass')}
  >
    {#if isCameraOff}<VideoOff class="h-5 w-5" />{:else}<Video class="h-5 w-5" />{/if}
  </button>

  <button onclick={onLeave} class="btn btn-danger rounded-full">
    <PhoneOff class="h-5 w-5" />
  </button>
</div>

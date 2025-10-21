<script lang="ts">
  import { cn } from '../../theme/utils'
  import { Mic, MicOff } from 'lucide-svelte'

  interface Props {
    participantName: string
    isMuted?: boolean
    isLocal?: boolean
    stream?: MediaStream
    class?: string
  }

  let { participantName, isMuted = false, isLocal = false, stream, class: className = '' }: Props = $props()
  let videoElement: HTMLVideoElement | undefined = $state()

  $effect(() => {
    if (videoElement && stream) {
      videoElement.srcObject = stream
    }
  })
</script>

<div class={cn('glass-card !p-0 relative overflow-hidden', className)}>
  <video bind:this={videoElement} autoplay playsinline muted={isLocal} class="w-full h-full object-cover rounded-xl"
  ></video>

  <div class="absolute bottom-3 left-3 flex items-center gap-2 glass px-3 py-2 rounded-lg">
    <span class="text-sm font-medium text-white">{participantName}</span>
    {#if isMuted}
      <MicOff class="h-4 w-4 text-error-400" />
    {:else}
      <Mic class="h-4 w-4 text-success-400" />
    {/if}
  </div>
</div>

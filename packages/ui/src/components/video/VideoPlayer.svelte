<script lang="ts">
  /**
   * VideoPlayer component - iOS 26 Glass Edition
   * Glass video player with HLS support
   */

  import { cn } from '../../theme/utils'
  import { Play, Pause, Volume2, Maximize } from 'lucide-svelte'

  interface Props {
    src: string
    poster?: string
    class?: string
  }

  let { src, poster, class: className = '' }: Props = $props()

  let video: HTMLVideoElement | undefined = $state()
  let isPlaying = $state(false)
  let showControls = $state(true)

  function togglePlay() {
    if (!video) return
    if (isPlaying) video.pause()
    else video.play()
    isPlaying = !isPlaying
  }

  function toggleFullscreen() {
    video?.requestFullscreen()
  }
</script>

<div class={cn('glass-card !p-0 relative group', className)}>
  <video
    bind:this={video}
    {src}
    {poster}
    class="w-full rounded-xl"
    onclick={togglePlay}
    onplay={() => (isPlaying = true)}
    onpause={() => (isPlaying = false)}
  >
    <track kind="captions" />
  </video>

  {#if showControls}
    <div class="absolute bottom-0 left-0 right-0 glass p-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <div class="flex items-center gap-4">
        <button onclick={togglePlay} class="btn btn-ghost btn-sm rounded-full">
          {#if isPlaying}<Pause class="h-5 w-5" />{:else}<Play class="h-5 w-5" />{/if}
        </button>

        <div class="flex-1">
          <input type="range" class="w-full h-1" />
        </div>

        <button class="btn btn-ghost btn-sm rounded-full">
          <Volume2 class="h-5 w-5" />
        </button>

        <button onclick={toggleFullscreen} class="btn btn-ghost btn-sm rounded-full">
          <Maximize class="h-5 w-5" />
        </button>
      </div>
    </div>
  {/if}
</div>

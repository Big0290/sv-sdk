<script lang="ts">
  /**
   * AudioPlayer component - iOS 26 Glass Edition
   * Glass audio player with waveform visualization
   */

  import { cn } from '../../theme/utils'
  import { Play, Pause, Volume2 } from 'lucide-svelte'

  interface Props {
    src: string
    title?: string
    artist?: string
    class?: string
  }

  let { src, title, artist, class: className = '' }: Props = $props()

  let audio: HTMLAudioElement | undefined = $state()
  let isPlaying = $state(false)
  let currentTime = $state(0)
  let duration = $state(0)
  let volume = $state(1)

  function togglePlay() {
    if (!audio) return
    if (isPlaying) audio.pause()
    else audio.play()
    isPlaying = !isPlaying
  }

  function formatTime(seconds: number) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
</script>

<div class={cn('glass-card', className)}>
  <audio
    bind:this={audio}
    {src}
    onloadedmetadata={() => (duration = audio?.duration || 0)}
    ontimeupdate={() => (currentTime = audio?.currentTime || 0)}
    onended={() => (isPlaying = false)}
  ></audio>

  {#if title || artist}
    <div class="mb-4">
      {#if title}
        <h4 class="font-medium text-gray-900 dark:text-gray-100">{title}</h4>
      {/if}
      {#if artist}
        <p class="text-sm text-gray-600 dark:text-gray-400">{artist}</p>
      {/if}
    </div>
  {/if}

  <div class="flex items-center gap-4">
    <button onclick={togglePlay} class="btn btn-glass rounded-full p-3">
      {#if isPlaying}
        <Pause class="h-5 w-5" />
      {:else}
        <Play class="h-5 w-5" />
      {/if}
    </button>

    <div class="flex-1">
      <input
        type="range"
        min="0"
        max={duration}
        bind:value={currentTime}
        onchange={() => audio && (audio.currentTime = currentTime)}
        class="w-full h-2 rounded-full appearance-none bg-gray-200 dark:bg-gray-700"
      />
      <div class="flex justify-between text-xs text-gray-500 mt-1">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <Volume2 class="h-4 w-4 text-gray-500" />
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        bind:value={volume}
        onchange={() => audio && (audio.volume = volume)}
        class="w-20 h-2"
      />
    </div>
  </div>
</div>

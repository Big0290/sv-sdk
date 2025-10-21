<script lang="ts">
  /**
   * CameraCapture component - iOS 26 Glass Edition
   * Camera access with glass controls
   */

  import { cn } from '../../theme/utils'
  import { Camera, X } from 'lucide-svelte'
  import { useCamera } from '../../composables/useCamera'

  interface Props {
    onCapture?: (blob: Blob) => void
    class?: string
  }

  let { onCapture, class: className = '' }: Props = $props()

  const { state: cameraState, startCamera, stopCamera } = useCamera()
  let videoElement: HTMLVideoElement | undefined = $state()

  async function handleStart() {
    const stream = await startCamera()
    if (videoElement && stream) {
      videoElement.srcObject = stream
    }
  }

  async function capture() {
    if (!videoElement) return
    const canvas = document.createElement('canvas')
    canvas.width = videoElement.videoWidth
    canvas.height = videoElement.videoHeight
    canvas.getContext('2d')?.drawImage(videoElement, 0, 0)
    canvas.toBlob((blob) => blob && onCapture?.(blob))
  }
</script>

<div class={cn('glass-card relative', className)}>
  <video bind:this={videoElement} autoplay playsinline class="w-full rounded-lg">
    <track kind="captions" />
  </video>

  {#if cameraState.isActive}
    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
      <button onclick={capture} class="btn btn-glass btn-lg rounded-full">
        <Camera class="h-6 w-6" />
      </button>
      <button onclick={stopCamera} class="btn btn-ghost rounded-full">
        <X class="h-5 w-5" />
      </button>
    </div>
  {:else}
    <button onclick={handleStart} class="absolute inset-0 flex items-center justify-center">
      <div class="btn btn-primary btn-lg">
        <Camera class="h-6 w-6 mr-2" />
        Start Camera
      </div>
    </button>
  {/if}
</div>

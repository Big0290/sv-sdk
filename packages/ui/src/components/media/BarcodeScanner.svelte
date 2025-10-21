<script lang="ts">
  import { cn } from '../../theme/utils'
  import { useCamera } from '../../composables/useCamera'

  interface Props {
    onScan?: (result: string) => void
    class?: string
  }

  let { class: className = '' }: Props = $props()
  // onScan will be used when barcode scanning is implemented
  const { state: cameraState, startCamera, stopCamera } = useCamera()
  let videoElement: HTMLVideoElement | undefined = $state()

  async function handleStart() {
    const stream = await startCamera()
    if (videoElement && stream) {
      videoElement.srcObject = stream
      // Note: @zxing/browser integration would go here
      // When scan detected: onScan?.(result)
    }
  }

  async function handleStop() {
    stopCamera()
  }
</script>

<div class={cn('glass-card relative', className)}>
  <video bind:this={videoElement} autoplay playsinline class="w-full rounded-lg">
    <track kind="captions" />
  </video>
  {#if !$cameraState.isActive}
    <button onclick={handleStart} class="absolute inset-0 flex items-center justify-center">
      <div class="btn btn-primary">Start Scanner</div>
    </button>
  {:else}
    <button onclick={handleStop} class="absolute top-4 right-4 btn btn-ghost btn-sm"> Stop </button>
  {/if}
  <div class="absolute inset-0 border-2 border-primary-500 rounded-lg pointer-events-none">
    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-primary-500"
    ></div>
  </div>
</div>

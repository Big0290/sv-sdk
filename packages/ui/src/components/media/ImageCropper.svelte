<script lang="ts">
  import { cn } from '../../theme/utils'
  import { Check, X } from 'lucide-svelte'

  interface Props {
    src: string
    aspectRatio?: number
    onCrop?: (blob: Blob) => void
    onCancel?: () => void
    class?: string
  }

  let { src, aspectRatio = 1, onCrop, onCancel, class: className = '' }: Props = $props()

  let canvas: HTMLCanvasElement | undefined = $state()
  let img: HTMLImageElement | undefined = $state()

  function handleCrop() {
    if (!canvas || !img) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = img.width
    canvas.height = img.width / aspectRatio
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

    canvas.toBlob((blob) => {
      if (blob) onCrop?.(blob)
    })
  }
</script>

<div class={cn('glass-card', className)}>
  <div class="relative">
    <img bind:this={img} {src} alt="Crop preview" class="w-full rounded-lg" />
    <div
      class="absolute inset-0 border-2 border-primary-500 rounded-lg pointer-events-none"
      style="aspect-ratio: {aspectRatio}"
    ></div>
  </div>

  <canvas bind:this={canvas} class="hidden"></canvas>

  <div class="flex gap-3 mt-4">
    <button onclick={onCancel} class="btn btn-outline flex-1">
      <X class="h-4 w-4 mr-2" />
      Cancel
    </button>
    <button onclick={handleCrop} class="btn btn-primary flex-1">
      <Check class="h-4 w-4 mr-2" />
      Crop
    </button>
  </div>
</div>

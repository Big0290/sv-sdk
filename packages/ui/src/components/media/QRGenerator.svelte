<script lang="ts">
  import { cn } from '../../theme/utils'

  interface Props {
    value: string
    size?: number
    class?: string
  }

  let { value, size = 256, class: className = '' }: Props = $props()
  const qrUrl = $derived(
    `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}`
  )
</script>

<div class={cn('glass-card', className)}>
  <img src={qrUrl} alt="QR Code" class="w-full rounded-lg" />
</div>

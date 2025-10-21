<script lang="ts">
  import { cn } from '../../theme/utils'

  interface Props {
    class?: string
  }

  let { class: className = '' }: Props = $props()
</script>

<div class={cn('flex items-center gap-1.5 glass px-4 py-3 rounded-2xl w-fit', className)}>
  <span class="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></span>
  <span class="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></span>
  <span class="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></span>
</div>

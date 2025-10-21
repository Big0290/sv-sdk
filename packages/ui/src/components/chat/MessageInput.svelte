<script lang="ts">
  /**
   * MessageInput component - iOS 26 Glass Edition
   * Rich input with emoji picker and file upload
   */

  import { cn } from '../../theme/utils'
  import { Send, Paperclip, Smile } from 'lucide-svelte'

  interface Props {
    value?: string
    placeholder?: string
    onSend?: (message: string) => void
    class?: string
  }

  let { value = $bindable(''), placeholder = 'Type a message...', onSend, class: className = '' }: Props = $props()

  function handleSend() {
    if (value.trim()) {
      onSend?.(value)
      value = ''
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
</script>

<div class={cn('glass-card !p-3 flex items-end gap-2', className)}>
  <button class="btn btn-ghost btn-sm rounded-full p-2">
    <Paperclip class="h-5 w-5" />
  </button>

  <textarea
    bind:value
    {placeholder}
    class="flex-1 bg-transparent border-0 resize-none focus:outline-none text-sm max-h-32"
    rows="1"
    onkeydown={handleKeydown}
  ></textarea>

  <button class="btn btn-ghost btn-sm rounded-full p-2">
    <Smile class="h-5 w-5" />
  </button>

  <button onclick={handleSend} class="btn btn-primary btn-sm rounded-full p-2" disabled={!value.trim()}>
    <Send class="h-5 w-5" />
  </button>
</div>

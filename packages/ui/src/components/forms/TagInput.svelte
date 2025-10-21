<script lang="ts">
  import { cn } from '../../theme/utils'
  import { X } from 'lucide-svelte'

  interface Props {
    tags?: string[]
    placeholder?: string
    class?: string
  }

  let { tags = $bindable([]), placeholder = 'Add tag...', class: className = '' }: Props = $props()
  let inputValue = $state('')

  function addTag() {
    if (inputValue.trim()) {
      tags = [...tags, inputValue.trim()]
      inputValue = ''
    }
  }

  function removeTag(index: number) {
    tags = tags.filter((_, i) => i !== index)
  }
</script>

<div class={cn('glass p-2 rounded-xl flex flex-wrap gap-2', className)}>
  {#each tags as tag, i}
    <span class="glass px-3 py-1 rounded-lg text-sm flex items-center gap-2">
      {tag}
      <button onclick={() => removeTag(i)} class="hover:text-error-600"><X class="h-3 w-3" /></button>
    </span>
  {/each}
  <input
    bind:value={inputValue}
    {placeholder}
    class="flex-1 bg-transparent border-0 focus:outline-none min-w-[120px]"
    onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
  />
</div>

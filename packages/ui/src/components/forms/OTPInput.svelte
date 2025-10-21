<script lang="ts">
  import { cn } from '../../theme/utils'

  interface Props {
    length?: number
    value?: string
    onComplete?: (value: string) => void
    class?: string
  }

  let { length = 6, value = $bindable(''), onComplete, class: className = '' }: Props = $props()
  let inputs: HTMLInputElement[] = []

  function handleInput(index: number, e: Event) {
    const target = e.target as HTMLInputElement
    const val = target.value
    if (val && index < length - 1) inputs[index + 1]?.focus()
    value = inputs.map((i) => i.value).join('')
    if (value.length === length) onComplete?.(value)
  }
</script>

<div class={cn('flex gap-2', className)}>
  {#each Array.from({ length }, (_, i) => i) as i (i)}
    <input
      bind:this={inputs[i]}
      type="text"
      maxlength="1"
      class="input w-12 h-12 text-center text-lg"
      oninput={(e) => handleInput(i, e)}
    />
  {/each}
</div>

<script lang="ts">
  import { cn } from '../../theme/utils'

  interface Props {
    value?: number
    min?: number
    max?: number
    step?: number
    onchange?: (value: number) => void
    class?: string
  }

  let { value = $bindable(0), min = 0, max = 100, step = 1, onchange, class: className = '' }: Props = $props()

  function increment() {
    if (value + step <= max) {
      value += step
      onchange?.(value)
    }
  }

  function decrement() {
    if (value - step >= min) {
      value -= step
      onchange?.(value)
    }
  }
</script>

<div class={cn('glass flex items-center rounded-xl', className)}>
  <button onclick={decrement} disabled={value <= min} class="btn btn-ghost rounded-l-xl">-</button>
  <div class="px-6 py-2 text-center min-w-[60px] font-medium">{value}</div>
  <button onclick={increment} disabled={value >= max} class="btn btn-ghost rounded-r-xl">+</button>
</div>

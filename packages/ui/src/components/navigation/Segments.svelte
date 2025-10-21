<script lang="ts">
  import { cn } from '../../theme/utils'

  interface Segment {
    id: string
    label: string
  }

  interface Props {
    segments: Segment[]
    active?: string
    onchange?: (id: string) => void
    class?: string
  }

  let { segments, active = $bindable(segments[0]?.id), onchange, class: className = '' }: Props = $props()
</script>

<div class={cn('glass p-1 rounded-xl inline-flex', className)} role="tablist">
  {#each segments as segment}
    <button
      type="button"
      role="tab"
      aria-selected={active === segment.id}
      onclick={() => {
        active = segment.id
        onchange?.(segment.id)
      }}
      class={cn(
        'px-4 py-2 text-sm font-medium transition-all rounded-lg',
        active === segment.id
          ? 'bg-white dark:bg-gray-800 shadow-md text-primary-600 dark:text-primary-400'
          : 'text-gray-600 dark:text-gray-400'
      )}
    >
      {segment.label}
    </button>
  {/each}
</div>

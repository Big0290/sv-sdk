<script lang="ts">
  import { cn } from '../../theme/utils'

  interface MediaItem {
    type: 'image' | 'video'
    url: string
    thumbnail?: string
  }

  interface Props {
    items: MediaItem[]
    columns?: 2 | 3 | 4
    onSelect?: (item: MediaItem) => void
    class?: string
  }

  let { items, columns = 3, onSelect, class: className = '' }: Props = $props()

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }
</script>

<div class={cn('grid gap-4', gridCols[columns], className)}>
  {#each items as item}
    <button
      onclick={() => onSelect?.(item)}
      class="glass-card !p-0 overflow-hidden aspect-square hover:shadow-glow-md transition-shadow"
    >
      {#if item.type === 'image'}
        <img src={item.url} alt="" class="w-full h-full object-cover" />
      {:else}
        <video src={item.url} poster={item.thumbnail} class="w-full h-full object-cover">
          <track kind="captions" />
        </video>
      {/if}
    </button>
  {/each}
</div>

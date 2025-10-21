<script lang="ts">
  import { cn } from '../../theme/utils'
  import VideoTile from './VideoTile.svelte'

  interface Participant {
    id: string
    name: string
    stream?: MediaStream
    isMuted: boolean
  }

  interface Props {
    participants: Participant[]
    localStream?: MediaStream
    class?: string
  }

  let { participants, localStream, class: className = '' }: Props = $props()
</script>

<div class={cn('grid grid-cols-2 lg:grid-cols-3 gap-4', className)}>
  {#if localStream}
    <VideoTile participantName="You" stream={localStream} isLocal={true} />
  {/if}
  {#each participants as participant}
    <VideoTile participantName={participant.name} stream={participant.stream} isMuted={participant.isMuted} />
  {/each}
</div>

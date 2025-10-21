<script lang="ts">
  import { cn } from '../../theme/utils'
  import { Mic, Square } from 'lucide-svelte'
  import { useMicrophone } from '../../composables/useMicrophone'

  interface Props {
    onRecordingComplete?: (blob: Blob) => void
    class?: string
  }

  let { onRecordingComplete, class: className = '' }: Props = $props()

  const { startMicrophone, stopMicrophone } = useMicrophone()
  let mediaRecorder: MediaRecorder | null = $state(null)
  let chunks: Blob[] = $state([])
  let isRecording = $state(false)

  async function startRecording() {
    const stream = await startMicrophone()
    mediaRecorder = new MediaRecorder(stream)
    chunks = []
    mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' })
      onRecordingComplete?.(blob)
    }
    mediaRecorder.start()
    isRecording = true
  }

  function stopRecording() {
    mediaRecorder?.stop()
    stopMicrophone()
    isRecording = false
  }
</script>

<div class={cn('glass-card flex items-center gap-4', className)}>
  {#if !isRecording}
    <button onclick={startRecording} class="btn btn-primary rounded-full">
      <Mic class="h-5 w-5" />
      Start Recording
    </button>
  {:else}
    <button onclick={stopRecording} class="btn btn-danger rounded-full animate-pulse">
      <Square class="h-5 w-5" />
      Stop
    </button>
    <span class="text-sm text-gray-600 dark:text-gray-400">Recording...</span>
  {/if}
</div>

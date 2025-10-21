<script lang="ts">
  import { cn } from '../../theme/utils'
  import { Upload } from 'lucide-svelte'

  interface Props {
    accept?: string
    multiple?: boolean
    onUpload?: (files: File[]) => void
    class?: string
  }

  let { accept = '*', multiple = false, onUpload, class: className = '' }: Props = $props()

  function handleFiles(files: FileList | null) {
    if (files) onUpload?.(Array.from(files))
  }
</script>

<div class={cn('glass-card text-center', className)}>
  <Upload class="h-12 w-12 mx-auto mb-4 text-gray-400" />
  <input
    type="file"
    {accept}
    {multiple}
    onchange={(e) => handleFiles((e.target as HTMLInputElement).files)}
    id="file"
    class="hidden"
  />
  <label for="file" class="btn btn-primary cursor-pointer">Upload Files</label>
</div>

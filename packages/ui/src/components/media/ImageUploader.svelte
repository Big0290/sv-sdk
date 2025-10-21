<script lang="ts">
  /**
   * ImageUploader component - iOS 26 Glass Edition
   * Drag-drop image upload with preview
   */

  import { cn } from '../../theme/utils'
  import { Upload, X } from 'lucide-svelte'

  interface Props {
    accept?: string
    multiple?: boolean
    maxSize?: number
    onUpload?: (files: File[]) => void
    class?: string
  }

  let {
    accept = 'image/*',
    multiple = false,
    maxSize = 5 * 1024 * 1024,
    onUpload,
    class: className = '',
  }: Props = $props()

  let isDragging = $state(false)
  let previews = $state<string[]>([])
  let error = $state<string>('')

  function handleFiles(files: FileList | null) {
    if (!files) return
    error = ''
    const fileArray = Array.from(files)

    const validFiles = fileArray.filter((f) => {
      if (f.size > maxSize) {
        error = `File ${f.name} exceeds ${maxSize / 1024 / 1024}MB`
        return false
      }
      return true
    })

    validFiles.forEach((f) => {
      const reader = new FileReader()
      reader.onload = (e) => (previews = [...previews, e.target?.result as string])
      reader.readAsDataURL(f)
    })

    onUpload?.(validFiles)
  }

  function removePreview(index: number) {
    previews = previews.filter((_, i) => i !== index)
  }
</script>

<div class={cn('glass-card', className)}>
  <div
    class={cn(
      'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
      isDragging ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30' : 'border-gray-300 dark:border-gray-700'
    )}
    ondragover={(e) => {
      e.preventDefault()
      isDragging = true
    }}
    ondragleave={() => (isDragging = false)}
    ondrop={(e) => {
      e.preventDefault()
      isDragging = false
      handleFiles(e.dataTransfer?.files)
    }}
    role="button"
    tabindex="0"
  >
    <Upload class="h-12 w-12 mx-auto mb-4 text-gray-400" />
    <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">Drag and drop or click to upload</p>
    <input
      type="file"
      {accept}
      {multiple}
      class="hidden"
      onchange={(e) => handleFiles((e.target as HTMLInputElement).files)}
      id="file-upload"
    />
    <label for="file-upload" class="btn btn-primary btn-sm cursor-pointer"> Choose Files </label>
  </div>

  {#if error}
    <p class="mt-2 text-sm text-error-600">{error}</p>
  {/if}

  {#if previews.length > 0}
    <div class="mt-4 grid grid-cols-3 gap-4">
      {#each previews as preview, i}
        <div class="relative">
          <img src={preview} alt="Preview" class="rounded-lg w-full h-24 object-cover" />
          <button onclick={() => removePreview(i)} class="absolute top-1 right-1 glass p-1 rounded-full">
            <X class="h-4 w-4" />
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>

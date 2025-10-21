<script lang="ts">
  /**
   * TemplateEditor component
   * Monaco-based code editor for MJML templates
   */

  import { onMount } from 'svelte'

  interface Props {
    value?: string
    language?: string
    theme?: 'vs-dark' | 'vs-light'
    height?: string
    readOnly?: boolean
    onchange?: (value: string) => void
  }

  let { value = $bindable(''), height = '600px', readOnly = false, onchange }: Props = $props()

  let editorContainer: HTMLDivElement

  onMount(async () => {
    // Dynamically import Monaco to avoid SSR issues
    // Note: In production, you would npm install monaco-editor
    // and configure with vite-plugin-monaco-editor

    // Placeholder implementation - would use Monaco Editor in production
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.className = 'w-full h-full font-mono text-sm p-4 bg-gray-900 text-gray-100 border-0 focus:outline-none'
    textarea.style.height = height
    textarea.readOnly = readOnly

    textarea.addEventListener('input', (e) => {
      value = (e.target as HTMLTextAreaElement).value
      onchange?.(value)
    })

    editorContainer.appendChild(textarea)

    return () => {
      editorContainer.innerHTML = ''
    }
  })

  $effect(() => {
    // Update editor when value changes externally
    if (editorContainer?.querySelector('textarea')) {
      const textarea = editorContainer.querySelector('textarea') as HTMLTextAreaElement
      if (textarea.value !== value) {
        textarea.value = value
      }
    }
  })
</script>

<div bind:this={editorContainer} class="border border-gray-700 rounded-lg overflow-hidden" style="height: {height}">
  <!-- Monaco editor will be mounted here -->
  <!-- In production, install: monaco-editor, vite-plugin-monaco-editor -->
</div>

<div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
  Note: Full Monaco Editor integration requires additional setup. See package README.
</div>

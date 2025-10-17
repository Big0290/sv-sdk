<script lang="ts">
  /**
   * TemplatePreview component
   * Iframe-based preview for HTML email templates
   */

  interface Props {
    html: string
    height?: string
    class?: string
  }

  let {
    html,
    height = '600px',
    class: className = '',
  }: Props = $props()

  let iframeRef: HTMLIFrameElement

  $effect(() => {
    if (iframeRef && html) {
      const doc = iframeRef.contentDocument || iframeRef.contentWindow?.document

      if (doc) {
        doc.open()
        doc.write(html)
        doc.close()
      }
    }
  })
</script>

<div class="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden {className}" style="height: {height}">
  <iframe
    bind:this={iframeRef}
    title="Email Template Preview"
    sandbox="allow-same-origin"
    class="w-full h-full bg-white"
    style="height: {height}"
  ></iframe>
</div>


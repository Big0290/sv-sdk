<script lang="ts">
  import Modal from '../layout/Modal.svelte'

  interface Props {
    open?: boolean
    title: string
    description?: string
    confirmText?: string
    cancelText?: string
    onConfirm?: () => void
    onCancel?: () => void
    class?: string
  }

  let {
    open = $bindable(false),
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    class: className = '',
  }: Props = $props()

  function handleConfirm() {
    onConfirm?.()
    open = false
  }

  function handleCancel() {
    onCancel?.()
    open = false
  }
</script>

<Modal bind:open {title} {description} size="sm" class={className}>
  <div class="flex gap-3 mt-6">
    <button onclick={handleCancel} class="btn btn-outline flex-1">{cancelText}</button>
    <button onclick={handleConfirm} class="btn btn-primary flex-1">{confirmText}</button>
  </div>
</Modal>

/**
 * useFocusTrap - Trap focus within an element for modals/dialogs
 */

export function useFocusTrap(node: HTMLElement) {
  const focusableElements = node.querySelectorAll<HTMLElement>(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )

  const firstFocusable = focusableElements[0]
  const lastFocusable = focusableElements[focusableElements.length - 1]

  function handleKeydown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault()
        lastFocusable?.focus()
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault()
        firstFocusable?.focus()
      }
    }
  }

  node.addEventListener('keydown', handleKeydown)
  firstFocusable?.focus()

  return {
    destroy() {
      node.removeEventListener('keydown', handleKeydown)
    },
  }
}

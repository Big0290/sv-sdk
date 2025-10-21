/**
 * Glassmorphism Animation Utilities
 */

export function pulseGlow(element: HTMLElement, color: 'purple' | 'blue' = 'purple') {
  const glowColor = color === 'purple' ? 'rgba(164, 108, 243, 0.4)' : 'rgba(108, 76, 243, 0.4)'

  element.style.animation = 'pulse-glow 2s ease-in-out infinite'
  element.style.setProperty('--glow-color', glowColor)
}

export function shimmer(element: HTMLElement) {
  element.style.animation = 'shimmer 2s linear infinite'
}

export function floatAnimation(element: HTMLElement) {
  element.style.animation = 'float 3s ease-in-out infinite'
}

export function removeAnimations(element: HTMLElement) {
  element.style.animation = ''
}

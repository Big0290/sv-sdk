/**
 * iOS 26 Glassmorphism Transitions & Animations
 */

import type { TransitionConfig } from 'svelte/transition'
import { cubicOut } from 'svelte/easing'

export function glassScale(
  node: Element,
  { delay = 0, duration = 200, start = 0.95 }: { delay?: number; duration?: number; start?: number } = {}
): TransitionConfig {
  return {
    delay,
    duration,
    easing: cubicOut,
    css: (t) => `
      transform: scale(${start + (1 - start) * t});
      opacity: ${t};
    `,
  }
}

export function glassFade(
  node: Element,
  { delay = 0, duration = 200 }: { delay?: number; duration?: number } = {}
): TransitionConfig {
  return {
    delay,
    duration,
    css: (t) => `opacity: ${t}`,
  }
}

export function liquidSlide(
  node: Element,
  { delay = 0, duration = 300, axis = 'y' }: { delay?: number; duration?: number; axis?: 'x' | 'y' } = {}
): TransitionConfig {
  return {
    delay,
    duration,
    easing: cubicOut,
    css: (t) => {
      const transform = axis === 'y' ? `translateY(${(1 - t) * 10}px)` : `translateX(${(1 - t) * 10}px)`
      return `
        transform: ${transform};
        opacity: ${t};
      `
    },
  }
}

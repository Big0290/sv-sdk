/**
 * useIntersection - Intersection Observer for lazy loading
 */

import { writable } from 'svelte/store'

export function useIntersection(options?: IntersectionObserverInit) {
  const isIntersecting = writable(false)

  function observe(node: HTMLElement) {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]) {
        isIntersecting.set(entries[0].isIntersecting)
      }
    }, options)

    observer.observe(node)

    return {
      destroy() {
        observer.disconnect()
      },
    }
  }

  return { isIntersecting, observe }
}

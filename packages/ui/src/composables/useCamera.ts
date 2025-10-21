/**
 * useCamera - Camera access abstraction
 */

import { writable } from 'svelte/store'

export interface CameraState {
  stream: MediaStream | null
  isActive: boolean
  error: string | null
  devices: MediaDeviceInfo[]
}

export function useCamera() {
  const state = writable<CameraState>({
    stream: null,
    isActive: false,
    error: null,
    devices: [],
  })

  async function startCamera(constraints: MediaStreamConstraints = { video: true }) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      state.update((s) => ({ ...s, stream, isActive: true, error: null }))
      return stream
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to access camera'
      state.update((s) => ({ ...s, error: errorMessage }))
      throw error
    }
  }

  async function stopCamera() {
    state.update((s) => {
      s.stream?.getTracks().forEach((track) => track.stop())
      return { ...s, stream: null, isActive: false }
    })
  }

  async function getDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((d) => d.kind === 'videoinput')
      state.update((s) => ({ ...s, devices: videoDevices }))
      return videoDevices
    } catch (error) {
      console.error('Failed to enumerate devices:', error)
      return []
    }
  }

  return {
    state,
    startCamera,
    stopCamera,
    getDevices,
  }
}

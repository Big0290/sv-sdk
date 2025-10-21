/**
 * useMicrophone - Microphone access abstraction
 */

import { writable } from 'svelte/store'

export interface MicrophoneState {
  stream: MediaStream | null
  isActive: boolean
  isRecording: boolean
  error: string | null
}

export function useMicrophone() {
  const state = writable<MicrophoneState>({
    stream: null,
    isActive: false,
    isRecording: false,
    error: null,
  })

  async function startMicrophone(constraints: MediaStreamConstraints = { audio: true }) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      state.update((s) => ({ ...s, stream, isActive: true, error: null }))
      return stream
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to access microphone'
      state.update((s) => ({ ...s, error: errorMessage }))
      throw error
    }
  }

  async function stopMicrophone() {
    state.update((s) => {
      s.stream?.getTracks().forEach((track) => track.stop())
      return { ...s, stream: null, isActive: false, isRecording: false }
    })
  }

  return {
    state,
    startMicrophone,
    stopMicrophone,
  }
}

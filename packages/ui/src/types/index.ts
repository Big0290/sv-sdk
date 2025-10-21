/**
 * Type definitions for iOS 26 Glassmorphism UI Components
 */

export type Theme = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
export type Variant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'gray'
export type Status = 'online' | 'offline' | 'away' | 'busy'

export interface BaseComponentProps {
  class?: string
  id?: string
}

export interface MediaStreamState {
  stream: MediaStream | null
  isActive: boolean
  error: string | null
}

export interface ChatMessage {
  id: string
  sender: {
    id: string
    name: string
    avatar?: string
  }
  content: string
  timestamp: Date
  status?: 'sending' | 'sent' | 'delivered' | 'read'
}

export interface VideoParticipant {
  id: string
  name: string
  stream?: MediaStream
  isMuted: boolean
  isCameraOff: boolean
}

import type { User, Session } from '@sv-sdk/auth'

declare global {
  namespace App {
    interface Locals {
      user: User | null
      session: Session | null
    }
  }
}

export {}

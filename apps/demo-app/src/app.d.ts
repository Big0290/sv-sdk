import type { User, Session } from '@big0290/auth'

declare global {
  namespace App {
    interface Locals {
      user: User | null
      session: Session | null
    }
  }
}

export {}

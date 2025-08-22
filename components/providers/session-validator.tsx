'use client'

import { useActiveSession } from '@/lib/hooks/use-arcade'

export function SessionValidator() {
  useActiveSession()
  return null
}
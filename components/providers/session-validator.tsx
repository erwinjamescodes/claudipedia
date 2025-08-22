'use client'

import { useValidatePersistedSession } from '@/lib/hooks/use-arcade'

export function SessionValidator() {
  useValidatePersistedSession()
  return null
}
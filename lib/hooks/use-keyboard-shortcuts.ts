import { useEffect } from 'react'

interface KeyboardShortcutsConfig {
  onSelect1?: () => void
  onSelect2?: () => void
  onSelect3?: () => void
  onSelect4?: () => void
  onSubmit?: () => void
  onNext?: () => void
  onFlag?: () => void
  onSkip?: () => void
  disabled?: boolean
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  useEffect(() => {
    if (config.disabled) return

    const handleKeyPress = (event: KeyboardEvent) => {
      // Ignore if typing in an input field
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Ignore if modifier keys are pressed (Ctrl, Alt, Cmd)
      if (event.ctrlKey || event.altKey || event.metaKey) {
        return
      }

      switch (event.key) {
        case '1':
          event.preventDefault()
          config.onSelect1?.()
          break
        case '2':
          event.preventDefault()
          config.onSelect2?.()
          break
        case '3':
          event.preventDefault()
          config.onSelect3?.()
          break
        case '4':
          event.preventDefault()
          config.onSelect4?.()
          break
        case 'Enter':
          event.preventDefault()
          config.onSubmit?.()
          break
        case ' ': // Space bar
          event.preventDefault()
          config.onNext?.()
          break
        case 'f':
        case 'F':
          event.preventDefault()
          config.onFlag?.()
          break
        case 's':
        case 'S':
          event.preventDefault()
          config.onSkip?.()
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
    }
  }, [config])

  return {
    shortcuts: [
      { key: '1-4', description: 'Select answer choice' },
      { key: 'Enter', description: 'Submit answer' },
      { key: 'Space', description: 'Next question' },
      { key: 'F', description: 'Flag question' },
      { key: 'S', description: 'Skip question' },
    ]
  }
}
import { useEffect, useRef } from 'react'
import { useTimerStore } from '@/lib/stores/timer-store'

export function useTimer() {
  const {
    elapsedTime,
    remainingTime,
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
    tick,
    setQuestionStartTime,
    getQuestionElapsedTime,
  } = useTimerStore()

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        tick()
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, tick])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeRemaining = () => {
    if (remainingTime === null) return null
    return Math.max(0, remainingTime)
  }

  const isTimeUp = () => {
    return remainingTime !== null && remainingTime <= 0
  }

  const getWarningLevel = () => {
    if (remainingTime === null) return 'none'
    if (remainingTime <= 300) return 'critical' // 5 minutes
    if (remainingTime <= 900) return 'warning' // 15 minutes
    return 'normal'
  }

  return {
    elapsedTime,
    remainingTime: getTimeRemaining(),
    isRunning,
    isTimeUp: isTimeUp(),
    warningLevel: getWarningLevel(),
    startTimer,
    stopTimer,
    resetTimer,
    setQuestionStartTime,
    getQuestionElapsedTime,
    formatTime,
  }
}
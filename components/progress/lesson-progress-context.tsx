'use client'

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react'
import { useAuth } from '@clerk/nextjs'

interface LessonProgressContextValue {
  completedLessonIds: string[]
  isCompleted: (lessonId: string) => boolean
  toggleComplete: (lessonId: string) => Promise<void>
  progressPercent: number
  isLoading: boolean
}

const LessonProgressContext = createContext<LessonProgressContextValue | null>(null)

export function LessonProgressProvider({
  courseId,
  currentLessonSlug,
  startSeconds,
  totalLessons,
  children,
}: {
  courseId: string
  currentLessonSlug?: string
  startSeconds?: number
  totalLessons: number
  children: React.ReactNode
}) {
  const { isSignedIn, isLoaded } = useAuth()
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [, startTransition] = useTransition()

  // Fetch initial progress for course
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !courseId) return

    let cancelled = false

    fetch(`/api/progress?courseId=${encodeURIComponent(courseId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.completedLessons) {
          setCompletedLessonIds(data.completedLessons)
        }
      })
      .catch((err) => {
        console.error('Failed to load course progress:', err)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    // Record resume position for the current lesson
    if (currentLessonSlug) {
      fetch('/api/progress/position', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          lessonSlug: currentLessonSlug,
          position: typeof startSeconds === 'number' ? startSeconds : 0,
        }),
      }).catch((err) => {
        console.warn('Failed to save resume position:', err)
      })
    }

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, courseId, currentLessonSlug, startSeconds])

  const isCompleted = (lessonId: string) => completedLessonIds.includes(lessonId)

  const toggleComplete = async (lessonId: string) => {
    if (!isSignedIn) return

    const willBeCompleted = !completedLessonIds.includes(lessonId)

    // Optimistic update
    startTransition(() => {
      setCompletedLessonIds((prev) =>
        willBeCompleted ? [...prev, lessonId] : prev.filter((id) => id !== lessonId)
      )
    })

    try {
      const res = await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          lessonId,
          completed: willBeCompleted,
          totalLessons,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to update progress on server')
      }

      const updated = await res.json()
      if (updated?.completedLessons) {
        setCompletedLessonIds(updated.completedLessons)
      }
    } catch (err) {
      console.error('Error toggling complete:', err)
      // Rollback optimistic update
      setCompletedLessonIds((prev) =>
        willBeCompleted ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
      )
    }
  }

  const progressPercent =
    totalLessons > 0
      ? Math.min(100, Math.round((completedLessonIds.length / totalLessons) * 100))
      : 0

  return (
    <LessonProgressContext.Provider
      value={{
        completedLessonIds,
        isCompleted,
        toggleComplete,
        progressPercent,
        isLoading,
      }}
    >
      {children}
    </LessonProgressContext.Provider>
  )
}

export function useLessonProgress() {
  return useContext(LessonProgressContext)
}


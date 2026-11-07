'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { CourseSyllabus } from '@/components/course/course-syllabus'
import type { Module } from '@/sanity/types'

interface CourseSyllabusWrapperProps {
  modules?: Module[]
  courseSlug: string
  courseId: string
}

export function CourseSyllabusWrapper({
  modules,
  courseSlug,
  courseId,
}: CourseSyllabusWrapperProps) {
  const { isSignedIn, isLoaded } = useAuth()
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([])

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
        console.warn('Failed to fetch course syllabus progress:', err)
      })

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, courseId])

  return (
    <CourseSyllabus
      modules={modules}
      courseSlug={courseSlug}
      completedLessonIds={completedLessonIds}
    />
  )
}


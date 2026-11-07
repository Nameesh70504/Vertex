'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { CourseCard } from '@/components/cards/course-card'
import { formatDuration } from '@/lib/format'
import type { Course, LearnerProgress } from '@/sanity/types'

interface CoursesGridWithProgressProps {
  courses: Course[]
}

export function CoursesGridWithProgress({ courses }: CoursesGridWithProgressProps) {
  const { isSignedIn, isLoaded } = useAuth()
  const [progressMap, setProgressMap] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    let cancelled = false
    fetch('/api/progress')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: LearnerProgress[] | null) => {
        if (cancelled || !Array.isArray(data)) return

        const map: Record<string, number> = {}
        data.forEach((p) => {
          const course = courses.find((c) => c._id === p.courseId)
          const total = course?.totalLessons || 0
          const completed = p.completedLessons?.length || 0
          if (total > 0 && completed > 0) {
            map[p.courseId] = Math.min(100, Math.round((completed / total) * 100))
          }
        })
        setProgressMap(map)
      })
      .catch((err) => {
        console.warn('Failed to load courses progress:', err)
      })

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, courses])

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const moduleCount = course.modules?.length || 0
        const durationFormatted = formatDuration(course.totalDuration)
        const progressPercent = progressMap[course._id]

        return (
          <CourseCard
            key={course._id}
            title={course.title}
            description={course.summary || ''}
            logoText={course.title.charAt(0)}
            level={course.level || 'All Levels'}
            duration={durationFormatted}
            modules={`${moduleCount} modules`}
            href={`/courses/${course.slug.current}`}
            progressPercent={progressPercent}
            className="h-full transition-shadow hover:shadow-md"
          />
        )
      })}
    </div>
  )
}


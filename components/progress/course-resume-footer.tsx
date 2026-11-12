'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import posthog from 'posthog-js'

interface CourseResumeFooterProps {
  courseId: string
  courseSlug: string
  firstLessonHref: string
  totalLessons: number
}

export function CourseResumeFooter({
  courseId,
  courseSlug,
  firstLessonHref,
  totalLessons,
}: CourseResumeFooterProps) {
  const { isSignedIn, isLoaded } = useAuth()
  const [percent, setPercent] = useState<number>(0)
  const [resumeHref, setResumeHref] = useState<string>(firstLessonHref)

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !courseId) return

    let cancelled = false
    fetch(`/api/progress?courseId=${encodeURIComponent(courseId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return

        const completedCount = data.completedLessons?.length || 0
        if (totalLessons > 0) {
          const calculated = Math.min(
            100,
            Math.round((completedCount / totalLessons) * 100)
          )
          setPercent(calculated)
        }

        if (data.lastLessonSlug) {
          const query =
            typeof data.lastPosition === 'number' && data.lastPosition > 0
              ? `?start=${data.lastPosition}`
              : ''
          setResumeHref(
            `/courses/${courseSlug}/lessons/${data.lastLessonSlug}${query}`
          )
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch course resume progress:', err)
      })

    return () => {
      cancelled = true
    }
  }, [isLoaded, isSignedIn, courseId, courseSlug, totalLessons])

  const buttonLabel = percent > 0 ? 'Continue Learning' : 'Start Learning'

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200/90 bg-white/95 px-6 py-3.5 backdrop-blur-md shadow-lg">
      <div className="mx-auto flex max-w-[70.5rem] items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="text-small font-medium text-neutral-700">
            Your Progress
          </span>
          <div className="hidden h-2 w-48 overflow-hidden rounded-full bg-neutral-100 sm:block">
            <div
              className="h-full rounded-full bg-primary-500 transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-small text-neutral-500">{percent}% complete</span>
        </div>

        <Link
          href={resumeHref}
          onClick={() => {
            posthog.capture('course_learning_started', {
              course_slug: courseSlug,
              has_prior_progress: percent > 0,
            })
          }}
        >
          <Button size="md" className="gap-2">
            {buttonLabel}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </div>
  )
}


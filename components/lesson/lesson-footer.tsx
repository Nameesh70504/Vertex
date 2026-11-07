import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MarkCompleteButton } from '@/components/progress/mark-complete-button'
import type { LessonNavigation } from '@/sanity/types'

interface LessonFooterProps {
  courseSlug: string
  navigation?: LessonNavigation
  lessonId?: string
}

export function LessonFooter({ courseSlug, navigation, lessonId }: LessonFooterProps) {
  const previous = navigation?.previousLesson
  const next = navigation?.nextLesson

  return (
    <footer className="mt-14 border-t border-neutral-200/90 bg-white py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Previous Lesson */}
        <div>
          {previous ? (
            <Link href={`/courses/${courseSlug}/lessons/${previous.slug.current}`}>
              <Button variant="secondary" className="gap-2 text-body">
                <ArrowLeft className="h-4 w-4" />
                Previous Lesson
              </Button>
              <p className="mt-1.5 text-xs text-neutral-500 max-w-[14rem] truncate">
                {previous.title}
              </p>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Center: Mark Complete button */}
        {lessonId && (
          <div className="flex items-center justify-center">
            <MarkCompleteButton lessonId={lessonId} />
          </div>
        )}

        {/* Next Lesson */}
        <div className="text-right">
          {next ? (
            <Link href={`/courses/${courseSlug}/lessons/${next.slug.current}`}>
              <p className="mb-1.5 text-xs text-neutral-500 max-w-[14rem] truncate ml-auto">
                {next.title}
              </p>
              <Button className="gap-2 text-body">
                Next Lesson
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href={`/courses/${courseSlug}`}>
              <Button className="gap-2 text-body">
                Complete Course
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </footer>
  )
}


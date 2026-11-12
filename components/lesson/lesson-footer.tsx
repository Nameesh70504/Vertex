import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { formatDuration } from '@/lib/format'
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
    <footer className="mt-12 pt-6 pb-12 border-t border-neutral-200/80 bg-white">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Previous Lesson Cluster */}
        <div className="w-full sm:w-auto">
          {previous ? (
            <Link
              href={`/courses/${courseSlug}/lessons/${previous.slug.current}`}
              className="flex items-center gap-3.5 group"
            >
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200/90 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-neutral-700 group-hover:bg-neutral-50 group-hover:border-neutral-300 transition-colors shadow-xs">
                <ArrowLeft className="h-3.5 w-3.5" />
                Previous Lesson
              </span>
              <div className="text-left min-w-0">
                <p className="text-xs sm:text-sm font-medium text-neutral-900 truncate max-w-[11rem] sm:max-w-[13rem]">
                  {previous.title}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {formatDuration(previous.duration || 6120)}
                </p>
              </div>
            </Link>
          ) : (
            <div />
          )}
        </div>

        {/* Center: Mark Complete affordance (accessible when signed in) */}
        {lessonId && (
          <div className="flex items-center justify-center my-2 sm:my-0">
            <MarkCompleteButton lessonId={lessonId} />
          </div>
        )}

        {/* Next Lesson Cluster */}
        <div className="w-full sm:w-auto flex justify-end">
          {next ? (
            <Link
              href={`/courses/${courseSlug}/lessons/${next.slug.current}`}
              className="flex items-center gap-3.5 group ml-auto"
            >
              <div className="text-right min-w-0">
                <p className="text-xs sm:text-sm font-medium text-neutral-900 truncate max-w-[11rem] sm:max-w-[13rem]">
                  {next.title}
                </p>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  {formatDuration(next.duration || 4680)}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-[#C85A32] hover:bg-[#B34E28] px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs transition-colors">
                Next Lesson
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ) : (
            <Link
              href={`/courses/${courseSlug}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#C85A32] hover:bg-[#B34E28] px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs transition-colors ml-auto"
            >
              Complete Course
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </footer>
  )
}

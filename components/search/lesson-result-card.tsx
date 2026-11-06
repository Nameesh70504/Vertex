import React from 'react'
import Link from 'next/link'
import { FileText, Check, ExternalLink, ChevronRight } from 'lucide-react'
import type { LessonSearchResult } from '@/sanity/types'
import { Badge } from '@/components/ui/badge'
import { CourseIcon } from '@/components/course/course-icon'

interface LessonResultCardProps {
  result: LessonSearchResult
}

export function LessonResultCard({ result }: LessonResultCardProps) {
  const lessonUrl = `/courses/${result.courseSlug}/lessons/${result.lessonSlug}`

  return (
    <article className="group flex flex-col md:flex-row gap-5 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md">
      {/* Key Points Notepad Column */}
      <Link
        href={lessonUrl}
        className="relative w-full md:w-72 shrink-0 rounded-lg border border-neutral-200/80 bg-neutral-50/70 p-4 flex flex-col justify-between min-h-[130px] hover:bg-neutral-50 transition-colors"
        aria-label={`View lesson notes for ${result.title}`}
      >
        <div>
          <FileText className="h-4 w-4 text-neutral-400 mb-2.5" aria-hidden="true" />
          <ul className="space-y-1.5 text-xs text-neutral-600">
            {result.keyPoints.slice(0, 3).map((point, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-neutral-400 font-bold shrink-0">•</span>
                <span className="line-clamp-1 leading-snug">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Completion Checkmark Icon Bottom Right */}
        <div className="self-end mt-2 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white shadow-xs">
          <Check className="h-3 w-3 stroke-[3]" aria-hidden="true" />
        </div>
      </Link>

      {/* Content Column */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          {/* Header Row: Course Emblem + Course Title + Lesson Badge */}
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/courses/${result.courseSlug}`}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0"
            >
              <CourseIcon title={result.courseTitle} slug={result.courseSlug} />
              <span className="truncate text-xs font-semibold text-neutral-600 sm:text-sm">
                {result.courseTitle}
              </span>
            </Link>
            <Badge variant="lesson">LESSON</Badge>
          </div>

          {/* Lesson Title */}
          <h3 className="mt-2 text-base font-bold text-neutral-900 sm:text-lg">
            <Link
              href={lessonUrl}
              className="hover:text-primary-500 transition-colors"
            >
              {result.title}
            </Link>
          </h3>

          {/* Description */}
          <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 line-clamp-2 leading-relaxed">
            {result.description}
          </p>
        </div>

        {/* Footer Metadata Row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
          {/* Module Label */}
          <div className="text-xs font-medium text-neutral-500">
            <span>Module {result.moduleNumber}</span>
          </div>

          {/* Direct Action Link */}
          <Link
            href={lessonUrl}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors shrink-0"
          >
            <span>View lesson</span>
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}


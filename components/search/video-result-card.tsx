import React from 'react'
import Link from 'next/link'
import { Play, PlayCircle, FileText, ChevronRight } from 'lucide-react'
import type { VideoSearchResult } from '@/sanity/types'
import { Badge } from '@/components/ui/badge'
import { CourseIcon } from '@/components/course/course-icon'
import { formatTimestamp } from '@/lib/format'

interface VideoResultCardProps {
  result: VideoSearchResult
}

export function VideoResultCard({ result }: VideoResultCardProps) {
  const watchUrl = `/courses/${result.courseSlug}/lessons/${result.lessonSlug}?start=${result.startSeconds}`
  const formattedStart = formatTimestamp(result.startSeconds)
  const formattedDuration = formatTimestamp(result.duration)

  return (
    <article className="group flex flex-col md:flex-row gap-5 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md">
      {/* Video Preview Column */}
      <Link
        href={watchUrl}
        className="relative aspect-video w-full md:w-72 shrink-0 overflow-hidden rounded-lg bg-neutral-900 group-hover:opacity-95 transition-opacity"
        aria-label={`Watch ${result.title} from ${formattedStart}`}
      >
        {/* Subtle decorative video background pattern */}
        <div className="absolute inset-0 bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-800" />
        
        {/* Abstract code/graphic illustration inside video box */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30 select-none">
          <div className="font-mono text-[10px] text-neutral-400 p-4 leading-tight overflow-hidden">
            <code>
              {result.title.slice(0, 35)}...
              <br />
              &gt; seekTo({result.startSeconds}s)
              <br />
              &gt; buffer: ok
            </code>
          </div>
        </div>

        {/* Center Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-lg transition-transform group-hover:scale-110">
            <Play className="h-5 w-5 fill-current ml-0.5" aria-hidden="true" />
          </div>
        </div>

        {/* Duration Badge Bottom Right */}
        <span className="absolute bottom-2.5 right-2.5 rounded bg-black/85 px-2 py-0.5 font-mono text-xs font-medium text-white">
          {formattedDuration}
        </span>
      </Link>

      {/* Content Column */}
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          {/* Header Row: Course Emblem + Course Title + Video Badge */}
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
            <Badge variant="video">VIDEO</Badge>
          </div>

          {/* Lesson / Video Title */}
          <h3 className="mt-2 text-base font-bold text-neutral-900 sm:text-lg">
            <Link
              href={watchUrl}
              className="hover:text-primary-500 transition-colors"
            >
              {result.title}
            </Link>
          </h3>

          {/* Description / Matched Segment */}
          <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 line-clamp-2 leading-relaxed">
            {result.description}
          </p>
        </div>

        {/* Footer Metadata Row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 pt-3">
          {/* Lesson & Module Label */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
            <FileText className="h-3.5 w-3.5 text-neutral-400 shrink-0" aria-hidden="true" />
            <span>Lesson {result.lessonNumber}</span>
            <span className="text-neutral-300">·</span>
            <span className="truncate">{result.moduleTitle}</span>
          </div>

          {/* Direct Action Link */}
          <Link
            href={watchUrl}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors shrink-0"
          >
            <PlayCircle className="h-4 w-4" aria-hidden="true" />
            <span>Watch from {formattedStart}</span>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  )
}


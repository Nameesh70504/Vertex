'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDuration, formatLessonDuration } from '@/lib/format'
import { useLessonProgress } from '@/components/progress/lesson-progress-context'

interface LessonSidebarProps {
  courseSlug: string
  courseTitle: string
  modules: {
    title: string
    lessons: {
      _id: string
      title: string
      slug: { current: string }
      duration?: number
      freePreview?: boolean
    }[]
  }[]
  activeLessonSlug: string
  activeModuleIndex: number
  completedLessonIds?: string[]
  progressPercent?: number
}

export function LessonSidebar({
  courseSlug,
  courseTitle,
  modules,
  activeLessonSlug,
  activeModuleIndex,
  completedLessonIds,
  progressPercent,
}: LessonSidebarProps) {
  const [expandedIndex, setExpandedIndex] = useState<number>(activeModuleIndex)
  const progressContext = useLessonProgress()

  const activeCompletedIds =
    completedLessonIds ?? progressContext?.completedLessonIds ?? []
  const activePercent = progressPercent ?? progressContext?.progressPercent ?? 35

  const toggleModule = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? -1 : index))
  }

  // Course emblem letter (first letter of title or 'N')
  const courseLetter = courseTitle.charAt(0).toUpperCase() || 'N'

  return (
    <aside className="w-full shrink-0 lg:w-[22rem] lg:border-r lg:border-[#ECE7E1] bg-[#FAF9F7]">
      {/* Top Header Card */}
      <div className="sticky top-0 z-10 p-5 sm:p-6 border-b border-[#ECE7E1] bg-[#FAF9F7]">
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C85A32] hover:text-[#B34E28] transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to course
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-900 font-sans text-xl font-bold text-white shadow-xs">
            {courseLetter}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold text-sm text-neutral-900 leading-snug">
              {courseTitle}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              {activePercent}% complete
            </p>
          </div>
        </div>

        {/* Module indicator row */}
        <div className="mt-5 flex items-center justify-between text-xs text-neutral-500 font-medium">
          <span>Module {activeModuleIndex + 1} of {modules.length}</span>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
        </div>
      </div>

      {/* Modules List */}
      <div className="divide-y divide-[#F0EDE8] overflow-y-auto max-h-[calc(100vh-12rem)]">
        {modules.map((moduleItem, modIdx) => {
          const isExpanded = expandedIndex === modIdx
          const isCurrentModule = activeModuleIndex === modIdx
          const moduleSeconds =
            moduleItem.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0) || 0

          const allLessonsCompleted =
            moduleItem.lessons &&
            moduleItem.lessons.length > 0 &&
            moduleItem.lessons.every((l) => activeCompletedIds.includes(l._id))

          // Past completed modules show orange checkmark
          const isCompleted = modIdx < activeModuleIndex || allLessonsCompleted

          return (
            <div key={modIdx} className="bg-transparent">
              {/* Module Header Button */}
              <button
                type="button"
                onClick={() => toggleModule(modIdx)}
                className={cn(
                  'flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors hover:bg-neutral-100/50',
                  isCurrentModule && 'bg-white/60'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Number Badge */}
                  <div
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                      isCurrentModule
                        ? 'bg-[#C85A32] text-white shadow-xs'
                        : 'border border-neutral-300 text-neutral-600 bg-white'
                    )}
                  >
                    {modIdx + 1}
                  </div>

                  {/* Title & Duration */}
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'truncate text-xs leading-snug',
                        isCurrentModule
                          ? 'font-bold text-neutral-900'
                          : 'font-medium text-neutral-800'
                      )}
                    >
                      {moduleItem.title}
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {formatDuration(moduleSeconds)}
                    </p>
                  </div>
                </div>

                {/* Right Status Indicator */}
                <div className="shrink-0 flex items-center justify-center">
                  {isCurrentModule ? (
                    isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-neutral-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-neutral-400" />
                    )
                  ) : isCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-[#C85A32]" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-neutral-400" />
                  )}
                </div>
              </button>

              {/* Vertical Timeline for Lessons in Expanded Module */}
              {isExpanded && moduleItem.lessons && moduleItem.lessons.length > 0 && (
                <div className="relative py-2 pl-6 pr-4">
                  {/* Timeline vertical stem line */}
                  <div
                    className="absolute left-[35px] top-4 bottom-4 w-[1px] bg-neutral-200"
                    aria-hidden="true"
                  />

                  <div className="space-y-2">
                    {moduleItem.lessons.map((lesson) => {
                      const isNowPlaying = lesson.slug?.current === activeLessonSlug
                      const isLessonDone = activeCompletedIds.includes(lesson._id)

                      return (
                        <Link
                          key={lesson._id}
                          href={`/courses/${courseSlug}/lessons/${lesson.slug?.current}`}
                          className={cn(
                            'relative flex items-center justify-between rounded-lg py-2 pl-8 pr-2.5 transition-colors group',
                            isNowPlaying
                              ? 'bg-white/80'
                              : 'hover:bg-neutral-100/60'
                          )}
                        >
                          {/* Timeline Dot */}
                          <div className="absolute left-[8px] top-1/2 -translate-y-1/2 flex items-center justify-center">
                            {isNowPlaying ? (
                              <span className="h-2.5 w-2.5 rounded-full bg-[#C85A32] ring-4 ring-[#FAF9F7]" />
                            ) : isLessonDone ? (
                              <CheckCircle2 className="h-3 w-3 text-[#C85A32] bg-white rounded-full" />
                            ) : (
                              <span className="h-2 w-2 rounded-full border-2 border-neutral-300 bg-white ring-4 ring-[#FAF9F7] group-hover:border-neutral-400 transition-colors" />
                            )}
                          </div>

                          {/* Lesson Information */}
                          <div className="min-w-0 pr-2">
                            <span
                              className={cn(
                                'block text-xs leading-snug truncate',
                                isNowPlaying
                                  ? 'font-semibold text-neutral-900'
                                  : 'font-normal text-neutral-600 group-hover:text-neutral-900'
                              )}
                            >
                              {lesson.title}
                            </span>
                            {isNowPlaying ? (
                              <span className="block text-[11px] font-medium text-[#C85A32] mt-0.5">
                                Now playing
                              </span>
                            ) : (
                              <span className="block text-[11px] text-neutral-400 mt-0.5">
                                {formatLessonDuration(lesson.duration)}
                              </span>
                            )}
                          </div>

                          {/* Right Play Icon for Now Playing */}
                          {isNowPlaying && (
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#C85A32] text-white shadow-xs">
                              <Play className="h-2.5 w-2.5 fill-white text-white translate-x-0.5" />
                            </div>
                          )}
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

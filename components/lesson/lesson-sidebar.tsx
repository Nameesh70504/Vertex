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
  const activePercent = progressPercent ?? progressContext?.progressPercent ?? 0

  const toggleModule = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? -1 : index))
  }

  return (
    <aside className="w-full shrink-0 lg:w-[22rem] lg:border-r lg:border-neutral-200/80 bg-white">
      <div className="sticky top-0 z-10 p-5 border-b border-neutral-100 bg-white">
        <Link
          href={`/courses/${courseSlug}`}
          className="inline-flex items-center gap-2 text-small font-medium text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to course
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-neutral-900 font-sans text-xl font-bold text-white shadow-sm">
            {courseTitle.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-body-large font-bold text-neutral-900">
              {courseTitle}
            </h2>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary-500 transition-all duration-300"
                  style={{ width: `${activePercent}%` }}
                />
              </div>
              <span className="text-small text-neutral-400">{activePercent}% complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modules List */}
      <div className="divide-y divide-neutral-100 overflow-y-auto max-h-[calc(100vh-10rem)]">
        {modules.map((moduleItem, modIdx) => {
          const isExpanded = expandedIndex === modIdx
          const isCurrentModule = activeModuleIndex === modIdx
          const moduleSeconds =
            moduleItem.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0) || 0

          return (
            <div key={modIdx} className="bg-white">
              <button
                type="button"
                onClick={() => toggleModule(modIdx)}
                className={cn(
                  'flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors hover:bg-neutral-50/80',
                  isCurrentModule && 'bg-primary-100/10'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-small font-medium transition-colors',
                      isCurrentModule
                        ? 'bg-primary-500 text-white'
                        : 'border border-neutral-300 text-neutral-600'
                    )}
                  >
                    {modIdx + 1}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        'truncate text-body font-semibold',
                        isCurrentModule ? 'text-primary-600' : 'text-neutral-900'
                      )}
                    >
                      {moduleItem.title}
                    </p>
                    <p className="text-small text-neutral-400">
                      {formatDuration(moduleSeconds)}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 text-neutral-400">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </button>

              {/* Collapsible Lessons */}
              {isExpanded && moduleItem.lessons && (
                <div className="bg-neutral-50/50 py-1 pl-12 pr-4 space-y-0.5">
                  {moduleItem.lessons.map((lesson) => {
                    const isNowPlaying = lesson.slug?.current === activeLessonSlug
                    const isCompleted = activeCompletedIds.includes(lesson._id)

                    return (
                      <Link
                        key={lesson._id}
                        href={`/courses/${courseSlug}/lessons/${lesson.slug?.current}`}
                        className={cn(
                          'flex items-center justify-between rounded-lg px-3 py-2 text-small transition-colors group',
                          isNowPlaying
                            ? 'bg-primary-100/60 font-semibold text-primary-600'
                            : 'text-neutral-600 hover:bg-neutral-100/80 hover:text-neutral-900'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {isCompleted ? (
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                          ) : isNowPlaying ? (
                            <Play className="h-3.5 w-3.5 shrink-0 fill-primary-500 text-primary-500" />
                          ) : (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-300 group-hover:bg-neutral-400" />
                          )}
                          <div className="min-w-0">
                            <span className="truncate block">{lesson.title}</span>
                            {isNowPlaying && (
                              <span className="block text-xs font-normal text-primary-500">
                                Now playing
                              </span>
                            )}
                          </div>
                        </div>

                        <span className="shrink-0 text-neutral-400 text-xs">
                          {formatLessonDuration(lesson.duration)}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

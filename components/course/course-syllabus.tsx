'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, ChevronDown, ChevronUp, PlayCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDuration, formatLessonDuration } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Module } from '@/sanity/types'

export function CourseSyllabus({
  modules,
  courseSlug,
  completedLessonIds,
}: {
  modules?: Module[]
  courseSlug: string
  completedLessonIds?: string[]
}) {
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({
    0: true, // First module expanded by default
  })
  const [showAllModules, setShowAllModules] = useState(false)

  if (!modules || modules.length === 0) return null

  const totalLessons = modules.reduce(
    (acc, m) => acc + (m.lessons?.length || 0),
    0
  )
  const totalSeconds = modules.reduce(
    (acc, m) =>
      acc + (m.lessons?.reduce((subAcc, l) => subAcc + (l.duration || 0), 0) || 0),
    0
  )

  const visibleModules = showAllModules ? modules : modules.slice(0, 6)
  const hasHiddenModules = modules.length > 6

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  return (
    <section className="mt-14">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-200 pb-4">
        <h2 className="font-display text-heading-1 text-neutral-900">
          Course Content
        </h2>
        <span className="text-body text-neutral-500">
          {modules.length} modules • {totalLessons} lessons • {formatDuration(totalSeconds)}
        </span>
      </div>

      <div className="mt-4 divide-y divide-neutral-200/80 rounded-xl border border-neutral-200/80 bg-white">
        {visibleModules.map((moduleItem, modIdx) => {
          const isExpanded = !!expandedModules[modIdx]
          const moduleSeconds =
            moduleItem.lessons?.reduce((acc, l) => acc + (l.duration || 0), 0) || 0

          return (
            <div key={moduleItem._key || modIdx} className="overflow-hidden">
              <button
                type="button"
                onClick={() => toggleModule(modIdx)}
                className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-neutral-50/80 focus:outline-none"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-neutral-300 font-medium text-neutral-700 text-small">
                    {modIdx + 1}
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-neutral-900 text-body-large">
                      {moduleItem.title}
                    </h3>
                    {moduleItem.summary && (
                      <p className="truncate text-small text-neutral-500 mt-0.5">
                        {moduleItem.summary}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4 text-small text-neutral-500">
                  <span>{formatDuration(moduleSeconds)}</span>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-neutral-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-neutral-400" />
                  )}
                </div>
              </button>

              {isExpanded && moduleItem.lessons && moduleItem.lessons.length > 0 && (
                <div className="border-t border-neutral-100 bg-neutral-50/50 px-5 py-3 divide-y divide-neutral-100">
                  {moduleItem.lessons.map((lesson, lesIdx) => {
                    const isCompleted = completedLessonIds?.includes(lesson._id)

                    return (
                      <div
                        key={lesson._id || lesIdx}
                        className="flex items-center justify-between py-3 text-body"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-4">
                          {isCompleted ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                          ) : (
                            <PlayCircle className="h-4 w-4 shrink-0 text-primary-500" />
                          )}
                          <Link
                            href={`/courses/${courseSlug}/lessons/${lesson.slug?.current}`}
                            className={cn(
                              'truncate font-medium transition-colors',
                              isCompleted
                                ? 'text-neutral-700 hover:text-primary-600'
                                : 'text-neutral-800 hover:text-primary-600'
                            )}
                          >
                            {lesson.title}
                          </Link>
                          {lesson.freePreview && (
                            <Badge variant="lesson" className="text-xs py-0.5 px-2 font-normal">
                              Free Preview
                            </Badge>
                          )}
                        </div>
                        <span className="shrink-0 text-small text-neutral-500">
                          {formatLessonDuration(lesson.duration)}
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {hasHiddenModules && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setShowAllModules((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 bg-white px-5 py-2.5 text-body font-medium text-neutral-700 hover:bg-neutral-50 transition-colors shadow-sm"
          >
            {showAllModules
              ? 'Collapse modules'
              : `Show all ${modules.length} modules`}
            {showAllModules ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </section>
  )
}


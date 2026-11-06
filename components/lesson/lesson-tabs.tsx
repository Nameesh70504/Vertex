'use client'

import { useState } from 'react'
import { CheckCircle2, ExternalLink, FileText, GitBranch, Lightbulb, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PortableTextRenderer } from './portable-text-renderer'
import type { Lesson } from '@/sanity/types'

interface LessonTabsProps {
  lesson: Lesson
}

export function LessonTabs({ lesson }: LessonTabsProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'notes'>('content')

  return (
    <div className="mt-8">
      {/* Tab Buttons */}
      <div className="flex items-center gap-8 border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={cn(
            'pb-3 font-semibold text-body transition-colors relative',
            activeTab === 'content'
              ? 'text-primary-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-500'
              : 'text-neutral-500 hover:text-neutral-900'
          )}
        >
          Lesson Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={cn(
            'pb-3 font-semibold text-body transition-colors relative',
            activeTab === 'notes'
              ? 'text-primary-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary-500'
              : 'text-neutral-500 hover:text-neutral-900'
          )}
        >
          Notes
        </button>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'content' ? (
          <div className="space-y-10">
            {/* Overview / Rich Notes */}
            {lesson.notes && lesson.notes.length > 0 && (
              <section>
                <h3 className="font-display text-heading-2 text-neutral-900 mb-4">
                  Overview
                </h3>
                <PortableTextRenderer value={lesson.notes} />
              </section>
            )}

            {/* In this lesson you will */}
            {lesson.keyPoints && lesson.keyPoints.length > 0 && (
              <section className="pt-2">
                <h3 className="font-semibold text-neutral-900 text-body-large mb-4">
                  In this lesson you will:
                </h3>
                <div className="space-y-3">
                  {lesson.keyPoints.map((point, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-primary-500 mt-0.5" />
                      <span className="text-body-large text-neutral-700 leading-normal">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pro Tip */}
            {lesson.proTip && (
              <section className="rounded-xl border border-primary-200/70 bg-primary-100/30 p-5 flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900 text-body-large">
                    Pro Tip
                  </h4>
                  <p className="mt-1 text-body text-neutral-700 leading-relaxed">
                    {lesson.proTip}
                  </p>
                </div>
              </section>
            )}

            {/* Resources */}
            {lesson.resources && lesson.resources.length > 0 && (
              <section className="pt-2">
                <h3 className="font-display text-heading-3 text-neutral-900 mb-4">
                  Resources
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {lesson.resources.map((resource, idx) => {
                    const isRepo = resource.type === 'repo' || resource.url.includes('github.com')
                    const isDocs = resource.type === 'docs'

                    return (
                      <a
                        key={resource._key || idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-700 group-hover:bg-primary-100/50 group-hover:text-primary-600 transition-colors">
                            {isRepo ? (
                              <GitBranch className="h-4 w-4" />
                            ) : isDocs ? (
                              <FileText className="h-4 w-4" />
                            ) : (
                              <LinkIcon className="h-4 w-4" />
                            )}
                          </div>
                          <ExternalLink className="h-4 w-4 text-neutral-400 group-hover:text-primary-500 transition-colors" />
                        </div>

                        <div className="mt-4">
                          <h4 className="font-semibold text-neutral-900 text-body group-hover:text-primary-600 transition-colors">
                            {resource.title}
                          </h4>
                          {resource.description && (
                            <p className="mt-1 line-clamp-2 text-small text-neutral-500">
                              {resource.description}
                            </p>
                          )}
                        </div>
                      </a>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* Notes Tab (Presentational per AGENTS.md §7) */
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-heading-3 text-neutral-900 mb-2">
              My Personal Notes
            </h3>
            <p className="text-small text-neutral-500 mb-4">
              Jot down notes while watching this lesson. Notes are saved to your browser session.
            </p>
            <textarea
              rows={8}
              placeholder="Type your notes here…"
              className="w-full rounded-lg border border-neutral-300 p-4 text-body text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="rounded-lg bg-primary-500 px-5 py-2 text-body font-medium text-white hover:bg-primary-600 transition-colors shadow-sm"
              >
                Save Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { CheckCircle2, ExternalLink, FileText, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PortableTextRenderer } from './portable-text-renderer'
import type { Lesson } from '@/sanity/types'

interface LessonTabsProps {
  lesson: Lesson
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  )
}

export function LessonTabs({ lesson }: LessonTabsProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'notes'>('content')

  // Seeded / fallback key points matching UI reference
  const defaultKeyPoints = [
    'Understand the different data fetching methods in Next.js',
    'Learn how caching works in Server Components',
    'Implement revalidation and cache control',
    'Optimize performance with advanced caching strategies',
  ]
  const keyPoints =
    lesson.keyPoints && lesson.keyPoints.length > 0
      ? lesson.keyPoints
      : defaultKeyPoints

  // Seeded / fallback pro tip matching UI reference
  const proTip =
    lesson.proTip ||
    'Use caching and revalidation wisely to ensure your app stays fast and data remains fresh without unnecessary requests.'

  // Seeded / fallback resources matching UI reference
  const defaultResources = [
    {
      type: 'docs',
      title: 'Next.js Data Fetching Documentation',
      description: 'Official Next.js docs on data fetching methods.',
      url: 'https://nextjs.org/docs/app/building-your-application/data-fetching',
    },
    {
      type: 'guide',
      title: 'Caching and Revalidation Guide',
      description: 'Deep dive into Next.js caching strategies.',
      url: 'https://nextjs.org/docs/app/building-your-application/caching',
    },
    {
      type: 'repo',
      title: 'Example Repository',
      description: 'Explore the source code for this lesson.',
      url: 'https://github.com/vercel/next.js',
    },
  ]
  const resources =
    lesson.resources && lesson.resources.length > 0
      ? lesson.resources
      : defaultResources

  return (
    <div className="mt-8">
      {/* Tab Navigation */}
      <div className="flex items-center gap-8 border-b border-neutral-200/80">
        <button
          type="button"
          onClick={() => setActiveTab('content')}
          className={cn(
            'pb-3 text-sm font-semibold transition-colors relative',
            activeTab === 'content'
              ? 'text-[#C85A32] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#C85A32]'
              : 'text-neutral-500 hover:text-neutral-900'
          )}
        >
          Lesson Content
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={cn(
            'pb-3 text-sm font-semibold transition-colors relative',
            activeTab === 'notes'
              ? 'text-[#C85A32] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#C85A32]'
              : 'text-neutral-500 hover:text-neutral-900'
          )}
        >
          Notes
        </button>
      </div>

      {/* Tab Content */}
      <div className="py-6">
        {activeTab === 'content' ? (
          <div className="space-y-8">
            {/* 1. Overview */}
            <section>
              <h3 className="font-display font-serif text-xl sm:text-2xl font-bold text-neutral-900 mb-3">
                Overview
              </h3>
              {lesson.notes && lesson.notes.length > 0 ? (
                <PortableTextRenderer value={lesson.notes} />
              ) : (
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
                  In this lesson, you&apos;ll learn how Next.js handles data fetching and caching in both Server and Client Components. We&apos;ll explore different caching strategies and revalidation techniques to build fast and scalable applications.
                </p>
              )}
            </section>

            {/* 2. In this lesson you will */}
            <section className="pt-2">
              <h4 className="font-semibold text-neutral-900 text-sm sm:text-base mb-3.5">
                In this lesson you will:
              </h4>
              <div className="space-y-2.5">
                {keyPoints.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-[#C85A32] mt-0.5" />
                    <span className="text-xs sm:text-sm text-neutral-700 leading-normal">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 3. Pro Tip */}
            <section className="rounded-xl border border-[#F4E3DC] bg-[#FDF6F3] p-5 flex items-start gap-4">
              <Lightbulb className="h-5 w-5 shrink-0 text-[#C85A32] mt-0.5" />
              <div>
                <h4 className="font-semibold text-neutral-900 text-xs sm:text-sm">
                  Pro Tip
                </h4>
                <p className="mt-1 text-xs sm:text-sm text-neutral-700 leading-relaxed">
                  {proTip}
                </p>
              </div>
            </section>

            {/* 4. Resources Grid */}
            <section className="pt-2">
              <h3 className="font-display font-serif text-lg sm:text-xl font-bold text-neutral-900 mb-4">
                Resources
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resources.map((resource, idx) => {
                  const isRepo =
                    resource.type === 'repo' || resource.url.includes('github.com')

                  return (
                    <a
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex flex-col justify-between rounded-xl border border-neutral-200/80 bg-white p-4 transition-all hover:border-neutral-300 hover:shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200/60 bg-[#FAF9F7] text-neutral-700 transition-colors">
                          {isRepo ? (
                            <GithubIcon className="h-4 w-4" />
                          ) : (
                            <FileText className="h-4 w-4 text-neutral-600" />
                          )}
                        </div>
                        <ExternalLink className="h-3.5 w-3.5 text-neutral-400 group-hover:text-[#C85A32] transition-colors" />
                      </div>

                      <div className="mt-3">
                        <h4 className="font-semibold text-xs sm:text-sm text-neutral-900 group-hover:text-[#C85A32] transition-colors line-clamp-1">
                          {resource.title}
                        </h4>
                        {resource.description && (
                          <p className="mt-1 line-clamp-2 text-xs text-neutral-500 leading-relaxed">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    </a>
                  )
                })}
              </div>
            </section>
          </div>
        ) : (
          /* Notes Tab (Presentational per AGENTS.md §7) */
          <div className="rounded-xl border border-neutral-200/80 bg-white p-6 shadow-xs">
            <h3 className="font-display font-serif text-lg font-bold text-neutral-900 mb-2">
              My Personal Notes
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Jot down notes while watching this lesson. Notes are saved to your browser session.
            </p>
            <textarea
              rows={8}
              placeholder="Type your notes here…"
              className="w-full rounded-lg border border-neutral-200 p-3.5 text-xs sm:text-sm text-neutral-900 focus:border-[#C85A32] focus:outline-none focus:ring-1 focus:ring-[#C85A32]"
            />
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="rounded-lg bg-[#C85A32] px-5 py-2 text-xs sm:text-sm font-medium text-white hover:bg-[#B34E28] transition-colors shadow-xs"
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

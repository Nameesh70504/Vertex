'use client'

import React, { useState, useEffect, useRef, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, ArrowRight, ChevronDown, Sparkles } from 'lucide-react'
import type { SearchResponse } from '@/sanity/types'
import { VideoResultCard } from './video-result-card'
import { LessonResultCard } from './lesson-result-card'
import { Button } from '@/components/ui/button'

interface SearchResultsClientProps {
  initialData: SearchResponse
  initialQuery: string
  initialSort: string
}

export function SearchResultsClient({
  initialData,
  initialQuery,
  initialSort = 'relevance',
}: SearchResultsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [prevInitialQuery, setPrevInitialQuery] = useState(initialQuery)
  if (initialQuery !== prevInitialQuery) {
    setPrevInitialQuery(initialQuery)
    setQuery(initialQuery)
  }

  const [sort, setSort] = useState(initialSort)
  const [prevInitialSort, setPrevInitialSort] = useState(initialSort)
  if (initialSort !== prevInitialSort) {
    setPrevInitialSort(initialSort)
    setSort(initialSort)
  }

  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  // Global ⌘K / Ctrl+K keyboard shortcut to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return

    startTransition(() => {
      const params = new URLSearchParams()
      params.set('q', trimmed)
      if (sort && sort !== 'relevance') {
        params.set('sort', sort)
      }
      router.push(`/search?${params.toString()}`)
    })
  }

  const handleSortChange = (newSort: string) => {
    setSort(newSort)
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('sort', newSort)
      router.push(`/search?${params.toString()}`)
    })
  }

  return (
    <div className="mx-auto w-full max-w-[70.5rem] px-4 py-8 sm:px-6 lg:py-12">
      {/* Search Header Hero */}
      <div className="text-center">
        {/* Eyebrow Pill Badge */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-primary-500">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Search Results
        </span>

        {/* Serif Headline with Highlighted Query */}
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl">
          {initialQuery ? (
            <>
              Results for{' '}
              <span className="text-primary-500">
                &ldquo;{initialQuery}&rdquo;
              </span>
            </>
          ) : (
            'Intelligent Content Search'
          )}
        </h1>

        {/* Subtitle with Result Counts */}
        <p className="mt-3 text-sm text-neutral-500 sm:text-base">
          {initialData.totalCount > 0 ? (
            <>
              Found <span className="font-semibold text-neutral-800">{initialData.totalCount}</span> results across{' '}
              <span className="font-semibold text-neutral-800">{initialData.courseCount}</span> courses
            </>
          ) : initialQuery ? (
            'No matching lessons or video moments found'
          ) : (
            'Type any topic, concept, or technical term to find the exact moment in video lessons'
          )}
        </p>

        {/* Large Centered Search Bar */}
        <div className="mx-auto mt-8 max-w-3xl">
          <form onSubmit={handleSearchSubmit} className="relative">
            <label htmlFor="search-input" className="sr-only">
              Search lessons and videos
            </label>
            <Search
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400"
              aria-hidden="true"
            />
            <input
              id="search-input"
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything across courses and video moments…"
              className="w-full rounded-lg border border-neutral-200 bg-white py-4 pl-14 pr-20 text-base text-neutral-900 shadow-xs placeholder:text-neutral-400 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 rounded border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-xs font-medium text-neutral-400"
            >
              ⌘K
            </span>
          </form>
        </div>
      </div>

      {/* Control Bar: Result Count & Sort Selector */}
      {initialData.totalCount > 0 && (
        <div className="mt-12 flex items-center justify-between border-b border-neutral-200 pb-4">
          <span className="text-sm font-semibold text-neutral-900">
            {initialData.totalCount} results
          </span>

          <div className="flex items-center gap-2">
            <label htmlFor="sort-select" className="text-xs text-neutral-500">
              Sort by:
            </label>
            <div className="relative">
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="appearance-none rounded-md border border-neutral-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-neutral-800 shadow-xs focus:border-primary-400 focus:outline-none"
              >
                <option value="relevance">Most Relevant</option>
                <option value="duration">Duration</option>
                <option value="title">Title (A-Z)</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading Indicator during transition */}
      {isPending && (
        <div className="py-8 text-center text-sm text-neutral-400 animate-pulse">
          Updating results...
        </div>
      )}

      {/* Result Cards List */}
      <div className="mt-6 space-y-4">
        {initialData.results.map((item) => {
          if (item.type === 'video') {
            return <VideoResultCard key={`video-${item.id}`} result={item} />
          }
          return <LessonResultCard key={`lesson-${item.id}`} result={item} />
        })}

        {/* Empty State */}
        {initialData.totalCount === 0 && (
          <div className="my-12 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
              <Search className="h-6 w-6" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-base font-bold text-neutral-900 sm:text-lg">
              No results found
            </h2>
            <p className="mx-auto mt-2 max-w-md text-xs sm:text-sm text-neutral-500 leading-relaxed">
              We couldn&apos;t find any lessons or video chapters matching &ldquo;{initialQuery}&rdquo;. Try broader terms like &ldquo;data fetching&rdquo;, &ldquo;caching&rdquo;, &ldquo;react&rdquo;, or &ldquo;docker&rdquo;.
            </p>
            <div className="mt-6 flex justify-center">
              <Link href="/courses">
                <Button variant="primary" size="md">
                  Explore Course Catalog
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Callout: "Can't find what you're looking for?" */}
      <div className="mt-12 rounded-xl border border-neutral-200 bg-neutral-50/70 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-500">
            <Search className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              Can&apos;t find what you&apos;re looking for?
            </h3>
            <p className="text-xs text-neutral-500">
              Try different keywords or browse our full course catalog.
            </p>
          </div>
        </div>

        <Link href="/courses" className="shrink-0">
          <Button variant="tertiary" size="md" className="gap-2 bg-white hover:bg-neutral-50">
            Browse all courses
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Sparkle } from 'lucide-react'

import { Navbar } from '@/components/nav/navbar'
import { CourseCard } from '@/components/cards/course-card'
import { Badge } from '@/components/ui/badge'
import { SearchInput } from '@/components/ui/search-input'
import { formatDuration } from '@/lib/format'
import { getCategories, getCourses } from '@/sanity/lib/data'

export const metadata: Metadata = {
  title: 'All Courses — Vertex',
  description:
    'Browse production-grade engineering courses across AI, modern web frameworks, systems architecture, and data.',
}

export default async function CoursesPage() {
  const [courses, categories] = await Promise.all([
    getCourses(),
    getCategories(),
  ])

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white">
      <Navbar
        items={[
          { label: 'Courses', href: '/courses' },
          { label: 'My Learning', href: '#' },
        ]}
      />

      <main className="flex-1 pb-20">
        <section className="mx-auto w-full max-w-[70.5rem] px-6 pt-12 pb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-small font-medium text-neutral-500 hover:text-neutral-900 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <Badge className="rounded-md px-3.5 py-1 tracking-wider uppercase text-xs">
            Curriculum
          </Badge>

          <h1 className="mt-4 font-display text-display-2 font-bold text-neutral-900">
            Explore All Courses
          </h1>
          <p className="mt-3 text-body-large text-neutral-500 max-w-2xl">
            Deep-dive courses with video lessons, real-world notes, and intelligent instant search across every second taught.
          </p>

          <form action="/search" method="GET" className="mt-8 max-w-xl">
            <SearchInput
              size="md"
              placeholder="Filter courses by topic or concept…"
            />
          </form>

          {/* Category Pills */}
          <div className="mt-8 flex flex-wrap gap-2 border-b border-neutral-200 pb-6">
            <span className="rounded-full bg-neutral-900 px-4 py-1.5 text-small font-medium text-white shadow-sm">
              All ({courses.length})
            </span>
            {categories.map((category) => (
              <span
                key={category._id}
                className="rounded-full border border-neutral-200 bg-white px-4 py-1.5 text-small font-medium text-neutral-600 hover:border-neutral-300 hover:text-neutral-900 transition-colors"
              >
                {category.title} {category.courseCount ? `(${category.courseCount})` : ''}
              </span>
            ))}
          </div>

          {/* Course Grid */}
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const moduleCount = course.modules?.length || 0
              const durationFormatted = formatDuration(course.totalDuration)

              return (
                <CourseCard
                  key={course._id}
                  title={course.title}
                  description={course.summary || ''}
                  logoText={course.title.charAt(0)}
                  level={course.level || 'All Levels'}
                  duration={durationFormatted}
                  modules={`${moduleCount} modules`}
                  href={`/courses/${course.slug.current}`}
                  className="h-full transition-shadow hover:shadow-md"
                />
              )
            })}
          </div>

          {/* Bottom Callout */}
          <div className="mx-auto mt-16 flex w-full max-w-[70.5rem] items-center gap-4 px-2">
            <span className="h-px flex-1 bg-neutral-200" aria-hidden="true" />
            <span className="inline-flex items-center gap-2 text-body text-neutral-500">
              <Sparkle className="h-5 w-5 text-primary-500" aria-hidden="true" />
              New courses and lessons added every week.
            </span>
            <span className="h-px flex-1 bg-neutral-200" aria-hidden="true" />
          </div>
        </section>
      </main>
    </div>
  )
}


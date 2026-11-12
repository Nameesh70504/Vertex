import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { connection } from 'next/server'
import { BarChart3, Bookmark, Clock, Users } from 'lucide-react'

import { Navbar } from '@/components/nav/navbar'
import { Breadcrumbs } from '@/components/nav/breadcrumbs'
import { LessonSidebar } from '@/components/lesson/lesson-sidebar'
import { VideoEmbed } from '@/components/lesson/video-embed'
import { LessonTabs } from '@/components/lesson/lesson-tabs'
import { LessonFooter } from '@/components/lesson/lesson-footer'
import { LessonProgressProvider } from '@/components/progress/lesson-progress-context'
import { formatDuration, formatStudentCount } from '@/lib/format'
import { getLessonBySlug } from '@/sanity/lib/data'

interface LessonPageProps {
  params: Promise<{ slug: string; lessonSlug: string }>
  searchParams: Promise<{ start?: string }>
}

export const instant = false

export async function generateMetadata({
  params,
}: LessonPageProps): Promise<Metadata> {
  const { lessonSlug } = await params
  const lesson = await getLessonBySlug(lessonSlug)

  if (!lesson) {
    return {
      title: 'Lesson Not Found — Vertex',
    }
  }

  const courseTitle = lesson.course?.title || 'Course'
  return {
    title: `${lesson.title} — ${courseTitle} — Vertex`,
    description: `Watch and learn ${lesson.title} on Vertex.`,
  }
}

export default async function LessonPage({
  params,
  searchParams,
}: LessonPageProps) {
  await connection()
  const { slug: courseSlug, lessonSlug } = await params
  const { start } = await searchParams
  const startSeconds = start ? parseFloat(start) : undefined

  const lesson = await getLessonBySlug(lessonSlug)

  if (!lesson || !lesson.course) {
    return notFound()
  }

  const moduleIndex = lesson.moduleIndex ?? 0
  const lessonIndex = lesson.lessonIndex ?? 0
  const currentModuleTitle =
    lesson.course.modules?.[moduleIndex]?.title || 'Module'
  const lessonSubtitle =
    lesson.course.modules?.[moduleIndex]?.summary ||
    'Learn how Next.js handles data fetching and caching in both Server and Client Components.'

  const modules = (lesson.course.modules || []).map((m) => ({
    title: m.title,
    lessons: (m.lessons || []).map((l) => ({
      _id: l._id,
      title: l.title,
      slug: l.slug,
      duration: l.duration,
      freePreview: l.freePreview,
    })),
  }))

  const totalLessons = modules.reduce(
    (acc, m) => acc + (m.lessons?.length || 0),
    0
  )

  const courseLevel = lesson.course.level || 'Intermediate'

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white">
      <Navbar
        items={[
          { label: 'Courses', href: '/courses' },
          { label: 'My Learning', href: '#' },
        ]}
      />

      <LessonProgressProvider
        courseId={lesson.course._id}
        currentLessonSlug={lessonSlug}
        startSeconds={startSeconds}
        totalLessons={totalLessons}
      >
        <div className="flex-1 flex flex-col lg:flex-row w-full">
          {/* Left Module / Curriculum Sidebar */}
          <LessonSidebar
            courseSlug={courseSlug}
            courseTitle={lesson.course.title}
            modules={modules}
            activeLessonSlug={lessonSlug}
            activeModuleIndex={moduleIndex}
          />

          {/* Main Lesson Content Area */}
          <main className="flex-1 min-w-0 px-6 py-8 sm:px-10 lg:px-12 max-w-5xl">
            <Breadcrumbs
              items={[
                { label: 'All Courses', href: '/courses' },
                { label: lesson.course.title, href: `/courses/${courseSlug}` },
                { label: currentModuleTitle },
                { label: lesson.title },
              ]}
            />

            {/* Lesson Header */}
            <div className="mt-6 flex flex-col">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center rounded px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase bg-[#FDF2EE] text-[#C85A32]">
                  Lesson {moduleIndex + 1}.{lessonIndex + 1}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Bookmark lesson"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200/90 text-neutral-400 hover:text-neutral-700 hover:border-neutral-300 transition-colors shadow-xs"
                  >
                    <Bookmark className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h1 className="mt-3 font-display font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 leading-tight">
                {lesson.title}
              </h1>

              {/* Subtitle */}
              <p className="mt-2 text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-3xl">
                {lessonSubtitle}
              </p>

              {/* Metadata row */}
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-neutral-500">
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-neutral-400" />
                  {formatDuration(lesson.duration || 5280)}
                </span>
                <span className="inline-flex items-center gap-1.5 capitalize">
                  <BarChart3 className="h-3.5 w-3.5 text-neutral-400" />
                  {courseLevel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-neutral-400" />
                  {formatStudentCount(lesson.studentCount || 3426)} students
                </span>
              </div>
            </div>

            {/* Video Player Embed (with start seconds seek support) */}
            <div className="mt-6">
              <VideoEmbed
                url={lesson.videoUrl}
                title={lesson.title}
                startSeconds={startSeconds}
              />
            </div>

            {/* Tabs: Lesson Content & Notes */}
            <LessonTabs lesson={lesson} />

            {/* Previous / Next Lesson Navigation Footer */}
            <LessonFooter
              courseSlug={courseSlug}
              navigation={lesson.navigation}
              lessonId={lesson._id}
            />
          </main>
        </div>
      </LessonProgressProvider>
    </div>
  )
}

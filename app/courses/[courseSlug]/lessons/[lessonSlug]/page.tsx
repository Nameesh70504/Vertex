import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { BarChart3, Bookmark, Clock, Users } from 'lucide-react'

import { Navbar } from '@/components/nav/navbar'
import { Breadcrumbs } from '@/components/nav/breadcrumbs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LessonSidebar } from '@/components/lesson/lesson-sidebar'
import { VideoEmbed } from '@/components/lesson/video-embed'
import { LessonTabs } from '@/components/lesson/lesson-tabs'
import { LessonFooter } from '@/components/lesson/lesson-footer'
import { formatDuration, formatStudentCount } from '@/lib/format'
import { getLessonBySlug } from '@/sanity/lib/data'

interface LessonPageProps {
  params: Promise<{ courseSlug: string; lessonSlug: string }>
  searchParams: Promise<{ start?: string }>
}

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
  const { courseSlug, lessonSlug } = await params
  const { start } = await searchParams
  const startSeconds = start ? parseFloat(start) : undefined

  const lesson = await getLessonBySlug(lessonSlug)

  if (!lesson || !lesson.course) {
    notFound()
  }

  const moduleIndex = lesson.moduleIndex ?? 0
  const lessonIndex = lesson.lessonIndex ?? 0
  const currentModuleTitle =
    lesson.course.modules?.[moduleIndex]?.title || 'Module'

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

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white">
      <Navbar
        items={[
          { label: 'Courses', href: '/courses' },
          { label: 'My Learning', href: '#' },
        ]}
      />

      <div className="flex-1 flex flex-col lg:flex-row mx-auto w-full max-w-[90rem]">
        {/* Left Module / Curriculum Sidebar */}
        <LessonSidebar
          courseSlug={courseSlug}
          courseTitle={lesson.course.title}
          modules={modules}
          activeLessonSlug={lessonSlug}
          activeModuleIndex={moduleIndex}
        />

        {/* Main Lesson Content Area */}
        <main className="flex-1 min-w-0 px-6 py-8 lg:px-10">
          <Breadcrumbs
            items={[
              { label: 'All Courses', href: '/courses' },
              { label: lesson.course.title, href: `/courses/${courseSlug}` },
              { label: currentModuleTitle },
              { label: lesson.title },
            ]}
          />

          {/* Lesson Header */}
          <div className="mt-6 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <Badge variant="popular" className="font-semibold tracking-wider text-xs uppercase">
                Lesson {moduleIndex + 1}.{lessonIndex + 1}
              </Badge>
              <Button variant="secondary" size="md" className="gap-1.5 text-xs text-neutral-600">
                <Bookmark className="h-3.5 w-3.5" />
                Bookmark
              </Button>
            </div>

            <h1 className="mt-2 font-display text-display-2 font-bold text-neutral-900 leading-tight">
              {lesson.title}
            </h1>

            {/* Metadata row */}
            <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-small text-neutral-500">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-neutral-400" />
                {formatDuration(lesson.duration)}
              </span>
              <span className="inline-flex items-center gap-1.5 capitalize">
                <BarChart3 className="h-4 w-4 text-neutral-400" />
                Intermediate
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4 text-neutral-400" />
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
          />
        </main>
      </div>
    </div>
  )
}

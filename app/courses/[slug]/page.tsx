import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowRight,
  BarChart3,
  Bookmark,
  Clock,
  LayoutGrid,
  Users,
} from 'lucide-react'

import { Navbar } from '@/components/nav/navbar'
import { Breadcrumbs } from '@/components/nav/breadcrumbs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { WhatYoullLearn } from '@/components/course/what-youll-learn'
import { CourseSyllabusWrapper } from '@/components/progress/course-syllabus-wrapper'
import { CourseResumeFooter } from '@/components/progress/course-resume-footer'
import { formatDuration, formatStudentCount } from '@/lib/format'
import { getCourseBySlug, getCourseSlugs } from '@/sanity/lib/data'
import { urlFor } from '@/sanity/lib/image'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getCourseSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const course = await getCourseBySlug(slug)

  if (!course) {
    return {
      title: 'Course Not Found — Vertex',
    }
  }

  return {
    title: `${course.title} — Vertex`,
    description: course.summary || `Learn ${course.title} with Vertex.`,
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params
  const course = await getCourseBySlug(slug)

  if (!course) {
    notFound()
  }

  const firstLessonSlug = course.modules?.[0]?.lessons?.[0]?.slug?.current
  const startLearningHref = firstLessonSlug
    ? `/courses/${course.slug.current}/lessons/${firstLessonSlug}`
    : '#'

  const coverImageUrl = course.coverImage
    ? urlFor(course.coverImage).width(400).height(400).url()
    : null

  const instructorImageUrl = course.instructor?.photo
    ? urlFor(course.instructor.photo).width(160).height(160).url()
    : null

  return (
    <div className="flex min-h-screen flex-1 flex-col bg-white">
      <Navbar
        items={[
          { label: 'Courses', href: '/courses' },
          { label: 'My Learning', href: '#' },
        ]}
      />

      <main className="flex-1 pb-24">
        <div className="mx-auto w-full max-w-[70.5rem] px-6 pt-6">
          <Breadcrumbs
            items={[
              { label: 'All Courses', href: '/courses' },
              { label: course.title },
            ]}
          />

          {/* Hero Section */}
          <section className="mt-8 flex flex-col gap-8 md:flex-row md:items-start md:gap-10">
            {/* Course Cover/Logo */}
            <div className="flex h-44 w-44 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-900 shadow-md">
              {coverImageUrl ? (
                <Image
                  src={coverImageUrl}
                  alt={course.title}
                  width={176}
                  height={176}
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <span className="font-display text-5xl font-bold text-white">
                  {course.title.charAt(0)}
                </span>
              )}
            </div>

            {/* Course Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                {course.popular && (
                  <Badge variant="popular" className="font-semibold tracking-wider uppercase text-xs">
                    Popular
                  </Badge>
                )}
                {course.category && (
                  <span className="text-small font-medium text-neutral-500">
                    {course.category.title}
                  </span>
                )}
              </div>

              <h1 className="mt-3 font-display text-display-2 font-bold text-neutral-900 leading-tight">
                {course.title}
              </h1>

              {course.summary && (
                <p className="mt-3 text-body-large text-neutral-600 leading-relaxed max-w-3xl">
                  {course.summary}
                </p>
              )}

              {/* Metadata row */}
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-body text-neutral-600">
                <span className="inline-flex items-center gap-2 capitalize">
                  <BarChart3 className="h-4 w-4 text-neutral-400" />
                  {course.level || 'All levels'}
                </span>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  {formatDuration(course.totalDuration)}
                </span>
                <span className="inline-flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4 text-neutral-400" />
                  {course.modules?.length || 0} modules
                </span>
                <span className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4 text-neutral-400" />
                  {formatStudentCount(course.studentCount)} students
                </span>
              </div>

              {/* Actions */}
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link href={startLearningHref}>
                  <Button className="h-12 gap-2 px-7 text-body font-medium">
                    Start Learning
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
                <Button variant="secondary" className="h-12 gap-2 px-5 text-body">
                  <Bookmark className="h-4 w-4" aria-hidden="true" />
                  Bookmark
                </Button>
              </div>
            </div>
          </section>

          {/* What you'll learn */}
          <WhatYoullLearn outcomes={course.learningOutcomes} />

          {/* Course Content / Syllabus Accordion */}
          <CourseSyllabusWrapper
            modules={course.modules}
            courseSlug={course.slug.current}
            courseId={course._id}
          />

          {/* Instructor Bio Section */}
          {course.instructor && (
            <section className="mt-14 border-t border-neutral-200 pt-10">
              <h2 className="font-display text-heading-2 text-neutral-900">
                About the Instructor
              </h2>
              <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-100 border border-neutral-200">
                  {instructorImageUrl ? (
                    <Image
                      src={instructorImageUrl}
                      alt={course.instructor.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-neutral-400">
                      {course.instructor.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-display text-heading-3 text-neutral-900">
                    {course.instructor.name}
                  </h3>
                  {course.instructor.expertise && (
                    <p className="text-small font-medium text-primary-600 mt-0.5">
                      {course.instructor.expertise}
                    </p>
                  )}
                  {course.instructor.bio && (
                    <p className="mt-3 text-body text-neutral-600 leading-relaxed max-w-2xl">
                      {course.instructor.bio}
                    </p>
                  )}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Floating / Sticky Resume Bar */}
      <CourseResumeFooter
        courseId={course._id}
        courseSlug={course.slug.current}
        firstLessonHref={startLearningHref}
        totalLessons={course.totalLessons || 0}
      />
    </div>
  )
}


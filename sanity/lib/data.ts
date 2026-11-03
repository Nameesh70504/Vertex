import { sanityFetch } from './client'
import {
  CATEGORIES_QUERY,
  COURSE_BY_SLUG_QUERY,
  COURSE_SLUGS_QUERY,
  COURSES_QUERY,
  INSTRUCTOR_BY_SLUG_QUERY,
  INSTRUCTORS_QUERY,
  LESSON_BY_SLUG_QUERY,
  LESSON_SLUGS_QUERY,
} from './queries'
import type {
  Category,
  Course,
  Instructor,
  LessonWithCourse,
} from '../types'

/**
 * Fetch all published courses for the catalog / landing page
 */
export async function getCourses(): Promise<Course[]> {
  return sanityFetch<Course[]>({
    query: COURSES_QUERY,
    tags: ['course'],
  })
}

/**
 * Fetch single course by slug with complete syllabus and resolved references
 */
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  return sanityFetch<Course | null>({
    query: COURSE_BY_SLUG_QUERY,
    params: { slug },
    tags: [`course:${slug}`],
  })
}

/**
 * Get all course slugs for static path generation
 */
export async function getCourseSlugs(): Promise<string[]> {
  return sanityFetch<string[]>({
    query: COURSE_SLUGS_QUERY,
    tags: ['course'],
  })
}

/**
 * Fetch lesson by slug with reverse-referenced parent course and navigation metadata
 */
export async function getLessonBySlug(slug: string): Promise<LessonWithCourse | null> {
  const lesson = await sanityFetch<LessonWithCourse | null>({
    query: LESSON_BY_SLUG_QUERY,
    params: { slug },
    tags: [`lesson:${slug}`],
  })

  if (!lesson) {
    return null
  }

  // Derive module order, lesson indices, and next/previous navigation from course modules
  if (lesson.course?.modules) {
    const flatLessons: { moduleTitle: string; lesson: { _id: string; title: string; slug: { _type: 'slug'; current: string } } }[] = []
    let currentModuleIdx = -1
    let currentLessonIdx = -1

    lesson.course.modules.forEach((mod, mIdx) => {
      mod.lessons?.forEach((les, lIdx) => {
        flatLessons.push({ moduleTitle: mod.title, lesson: les })
        if (les._id === lesson._id || les.slug?.current === lesson.slug?.current) {
          currentModuleIdx = mIdx
          currentLessonIdx = lIdx
        }
      })
    })

    const currentIndex = flatLessons.findIndex(
      (item) => item.lesson._id === lesson._id || item.lesson.slug?.current === lesson.slug?.current
    )

    const previousLesson =
      currentIndex > 0
        ? {
            title: flatLessons[currentIndex - 1].lesson.title,
            slug: flatLessons[currentIndex - 1].lesson.slug,
            moduleTitle: flatLessons[currentIndex - 1].moduleTitle,
          }
        : null

    const nextLesson =
      currentIndex >= 0 && currentIndex < flatLessons.length - 1
        ? {
            title: flatLessons[currentIndex + 1].lesson.title,
            slug: flatLessons[currentIndex + 1].lesson.slug,
            moduleTitle: flatLessons[currentIndex + 1].moduleTitle,
          }
        : null

    return {
      ...lesson,
      moduleIndex: currentModuleIdx,
      lessonIndex: currentLessonIdx,
      navigation: {
        previousLesson,
        nextLesson,
      },
    }
  }

  return lesson
}

/**
 * Get all lesson slugs
 */
export async function getLessonSlugs(): Promise<string[]> {
  return sanityFetch<string[]>({
    query: LESSON_SLUGS_QUERY,
    tags: ['lesson'],
  })
}

/**
 * Fetch all instructors
 */
export async function getInstructors(): Promise<Instructor[]> {
  return sanityFetch<Instructor[]>({
    query: INSTRUCTORS_QUERY,
    tags: ['instructor'],
  })
}

/**
 * Fetch instructor profile by slug with their courses
 */
export async function getInstructorBySlug(
  slug: string
): Promise<(Instructor & { courses?: Course[] }) | null> {
  return sanityFetch<(Instructor & { courses?: Course[] }) | null>({
    query: INSTRUCTOR_BY_SLUG_QUERY,
    params: { slug },
    tags: [`instructor:${slug}`],
  })
}

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<Category[]> {
  return sanityFetch<Category[]>({
    query: CATEGORIES_QUERY,
    tags: ['category'],
  })
}


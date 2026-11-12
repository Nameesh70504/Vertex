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
  SEARCH_CONTENT_QUERY,
} from './queries'
import type {
  Category,
  Course,
  Instructor,
  LessonSearchResult,
  LessonWithCourse,
  SearchResponse,
  SearchResultItem,
  VideoSearchResult,
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
    const flatLessons: {
      moduleTitle: string
      lesson: {
        _id: string
        title: string
        slug: { _type: 'slug'; current: string }
        duration?: number
      }
    }[] = []
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
            duration: flatLessons[currentIndex - 1].lesson.duration,
          }
        : null

    const nextLesson =
      currentIndex >= 0 && currentIndex < flatLessons.length - 1
        ? {
            title: flatLessons[currentIndex + 1].lesson.title,
            slug: flatLessons[currentIndex + 1].lesson.slug,
            moduleTitle: flatLessons[currentIndex + 1].moduleTitle,
            duration: flatLessons[currentIndex + 1].lesson.duration,
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

interface RawSearchResults {
  lessons: Array<{
    _id: string
    title: string
    slug: { current: string }
    duration?: number
    keyPoints?: string[]
    notesText?: string
    course?: {
      _id: string
      title: string
      slug: { current: string }
      modules?: Array<{
        _key?: string
        title: string
        lessons?: Array<{
          _id: string
          slug: { current: string }
        }>
      }>
    }
  }>
  videos: Array<{
    _id: string
    videoId: string
    title: string
    url: string
    duration?: number
    matchingChapters?: Array<{
      _key?: string
      startSeconds: number
      label: string
    }>
    matchingChunks?: Array<{
      _key?: string
      startSeconds: number
      text: string
    }>
    lesson?: {
      _id: string
      title: string
      slug: { current: string }
      thumbnail?: unknown
      duration?: number
      keyPoints?: string[]
      notesText?: string
      course?: {
        _id: string
        title: string
        slug: { current: string }
        modules?: Array<{
          _key?: string
          title: string
          lessons?: Array<{
            _id: string
            slug: { current: string }
          }>
        }>
      }
    }
  }>
}

/**
 * Intelligent grounded content search across Sanity lessons and video intelligence documents.
 * Adheres strictly to AGENTS.md §7, §11 (two-stage timestamp resolution: chapters first, chunks fallback).
 */
export async function searchContent(
  rawQuery: string,
  sort: string = 'relevance'
): Promise<SearchResponse> {
  const query = rawQuery.trim()
  if (!query) {
    return {
      query: '',
      totalCount: 0,
      courseCount: 0,
      results: [],
    }
  }

  // Extract search tokens (words with >= 2 alphanumeric chars)
  const tokens = query
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-Z0-9_-]/g, ''))
    .filter((w) => w.length >= 2)

  if (tokens.length === 0) {
    return {
      query,
      totalCount: 0,
      courseCount: 0,
      results: [],
    }
  }

  // Query Sanity for each distinct token to ensure full token-based OR recall
  const searchPromises = tokens.map((token) =>
    sanityFetch<RawSearchResults>({
      query: SEARCH_CONTENT_QUERY,
      params: { pattern: `*${token}*` },
      revalidate: 60,
    })
  )

  const searchResultsArray = await Promise.all(searchPromises)

  // Merge and deduplicate lessons and videos across all token hits
  const allLessons = new Map<string, RawSearchResults['lessons'][number]>()
  const allVideos = new Map<string, RawSearchResults['videos'][number]>()

  for (const batch of searchResultsArray) {
    if (batch.lessons) {
      for (const les of batch.lessons) {
        if (les.slug?.current && !allLessons.has(les._id)) {
          allLessons.set(les._id, les)
        }
      }
    }
    if (batch.videos) {
      for (const vid of batch.videos) {
        if (vid.lesson?.slug?.current && !allVideos.has(vid._id)) {
          allVideos.set(vid._id, vid)
        }
      }
    }
  }

  type ScoredResult = SearchResultItem & { score: number }
  const scoredResults: ScoredResult[] = []

  // 1. Process Video Results (Two-stage timestamp resolution: chapters first, chunks fallback)
  for (const video of allVideos.values()) {
    const lesson = video.lesson
    if (!lesson || !lesson.slug?.current || !lesson.course?.slug?.current) {
      continue
    }

    const course = lesson.course
    let moduleNumber = 1
    let lessonNumber = '1.1'
    let moduleTitle = 'Module 1'

    if (course.modules) {
      course.modules.forEach((mod, mIdx) => {
        const lIdx = mod.lessons?.findIndex(
          (l) => l._id === lesson._id || l.slug?.current === lesson.slug.current
        )
        if (lIdx !== undefined && lIdx >= 0) {
          moduleNumber = mIdx + 1
          lessonNumber = `${moduleNumber}.${lIdx + 1}`
          moduleTitle = mod.title
        }
      })
    }

    // Two-stage timestamp resolution:
    const matchingChapters = video.matchingChapters || []
    const matchingChunks = video.matchingChunks || []

    let startSeconds = 0
    let matchSource: 'chapter' | 'transcript' = 'chapter'
    let matchedText = ''
    let relevanceScore = 0

    if (matchingChapters.length > 0) {
      // Stage 1: Chapters (table of contents) match
      startSeconds = matchingChapters[0].startSeconds
      matchSource = 'chapter'
      matchedText = matchingChapters[0].label
      relevanceScore += 80
    } else if (matchingChunks.length > 0) {
      // Stage 2: Fall back to matching transcript chunk
      startSeconds = matchingChunks[0].startSeconds
      matchSource = 'transcript'
      matchedText = matchingChunks[0].text
      relevanceScore += 40
    } else {
      startSeconds = 0
      matchSource = 'chapter'
    }

    // Scoring boosts
    const titleLower = (video.title || lesson.title).toLowerCase()
    tokens.forEach((t) => {
      if (titleLower.includes(t)) relevanceScore += 40
      if (matchedText.toLowerCase().includes(t)) relevanceScore += 15
    })

    const duration = video.duration || lesson.duration || 300
    const description =
      matchedText ||
      lesson.notesText?.slice(0, 160) ||
      `Watch this lesson from ${course.title} covering ${moduleTitle}.`

    const videoItem: VideoSearchResult = {
      type: 'video',
      id: video._id,
      title: video.title || lesson.title,
      description,
      courseTitle: course.title,
      courseSlug: course.slug.current,
      lessonTitle: lesson.title,
      lessonSlug: lesson.slug.current,
      moduleTitle,
      moduleNumber,
      lessonNumber,
      thumbnailUrl: undefined, // will render video thumbnail placeholder or embed preview
      duration,
      startSeconds,
      matchSource,
      matchedText,
    }

    scoredResults.push({ ...videoItem, score: relevanceScore })
  }

  // 2. Process Lesson Results
  for (const lesson of allLessons.values()) {
    if (!lesson.slug?.current || !lesson.course?.slug?.current) {
      continue
    }

    const course = lesson.course
    let moduleNumber = 1
    let lessonNumber = '1.1'
    let moduleTitle = 'Module 1'

    if (course.modules) {
      course.modules.forEach((mod, mIdx) => {
        const lIdx = mod.lessons?.findIndex(
          (l) => l._id === lesson._id || l.slug?.current === lesson.slug.current
        )
        if (lIdx !== undefined && lIdx >= 0) {
          moduleNumber = mIdx + 1
          lessonNumber = `${moduleNumber}.${lIdx + 1}`
          moduleTitle = mod.title
        }
      })
    }

    let relevanceScore = 20
    const titleLower = lesson.title.toLowerCase()
    const notesLower = (lesson.notesText || '').toLowerCase()

    tokens.forEach((t) => {
      if (titleLower.includes(t)) relevanceScore += 50
      if (notesLower.includes(t)) relevanceScore += 10
      if (lesson.keyPoints?.some((kp) => kp.toLowerCase().includes(t))) {
        relevanceScore += 25
      }
    })

    const keyPoints =
      lesson.keyPoints && lesson.keyPoints.length > 0
        ? lesson.keyPoints.slice(0, 3)
        : [
            'Core architecture and concepts',
            'Production debugging and edge cases',
            'Hands-on implementation steps',
          ]

    const description =
      lesson.notesText?.slice(0, 180) ||
      `Explore key concepts and patterns in ${lesson.title} from ${course.title}.`

    const lessonItem: LessonSearchResult = {
      type: 'lesson',
      id: lesson._id,
      title: lesson.title,
      description,
      courseTitle: course.title,
      courseSlug: course.slug.current,
      lessonSlug: lesson.slug.current,
      moduleTitle,
      moduleNumber,
      lessonNumber,
      duration: lesson.duration || 300,
      keyPoints,
    }

    scoredResults.push({ ...lessonItem, score: relevanceScore })
  }

  // 3. Sort results
  if (sort === 'duration') {
    scoredResults.sort((a, b) => b.duration - a.duration)
  } else if (sort === 'title') {
    scoredResults.sort((a, b) => a.title.localeCompare(b.title))
  } else {
    // Default: 'relevance'
    scoredResults.sort((a, b) => b.score - a.score)
  }

  // 4. Calculate course count and remove score property from returned items
  const courseSet = new Set(scoredResults.map((r) => r.courseSlug))
  const finalResults: SearchResultItem[] = scoredResults.map((r) => {
    const item = { ...r }
    delete (item as { score?: number }).score
    return item as SearchResultItem
  })

  return {
    query,
    totalCount: finalResults.length,
    courseCount: courseSet.size,
    results: finalResults,
  }
}



import type { PortableTextBlock } from 'sanity'

export interface SanityImageReference {
  _type: 'image'
  asset: {
    _ref: string
    _type: 'reference'
  }
  hotspot?: {
    x: number
    y: number
    height: number
    width: number
  }
}

export interface Slug {
  _type: 'slug'
  current: string
}

export interface Category {
  _id: string
  _type: 'category'
  title: string
  slug: Slug
  description?: string
  courseCount?: number
}

export interface Instructor {
  _id: string
  _type: 'instructor'
  name: string
  slug: Slug
  photo?: SanityImageReference
  expertise?: string
  bio?: string
}

export interface Resource {
  _key?: string
  type: 'repo' | 'docs' | 'download' | 'link' | string
  title: string
  description?: string
  url: string
}

export interface LearningOutcome {
  _key?: string
  icon?: string
  title: string
  description: string
}

export interface Lesson {
  _id: string
  _type: 'lesson'
  title: string
  slug: Slug
  videoUrl: string
  thumbnail?: SanityImageReference
  duration?: number
  freePreview?: boolean
  studentCount?: number
  notes?: PortableTextBlock[]
  keyPoints?: string[]
  proTip?: string
  resources?: Resource[]
}

export interface Module {
  _key?: string
  title: string
  summary?: string
  lessons?: Lesson[]
}

export interface Course {
  _id: string
  _type: 'course'
  title: string
  slug: Slug
  summary?: string
  coverImage?: SanityImageReference
  level?: 'beginner' | 'intermediate' | 'advanced' | 'all-levels'
  price?: number
  popular?: boolean
  studentCount?: number
  learningOutcomes?: LearningOutcome[]
  instructor?: Instructor
  category?: Category
  modules?: Module[]
  // Derived/computed fields from GROQ projections
  totalLessons?: number
  totalDuration?: number
}

export interface LessonNavigation {
  previousLesson?: {
    title: string
    slug: Slug
    moduleTitle: string
  } | null
  nextLesson?: {
    title: string
    slug: Slug
    moduleTitle: string
  } | null
}

export interface LessonWithCourse extends Lesson {
  course?: {
    _id: string
    title: string
    slug: Slug
    instructor?: Instructor
    modules?: {
      title: string
      lessons: {
        _id: string
        title: string
        slug: Slug
        duration?: number
        freePreview?: boolean
      }[]
    }[]
  }
  moduleIndex?: number
  lessonIndex?: number
  navigation?: LessonNavigation
}

export interface VideoChapter {
  _key?: string
  startSeconds: number
  label: string
}

export interface VideoChunk {
  _key?: string
  startSeconds: number
  text: string
}

export interface VideoDocument {
  _id: string
  _type: 'video'
  videoId: string
  url: string
  title?: string
  provider: 'youtube' | 'vimeo' | 'bunny' | string
  duration?: number
  chapters?: VideoChapter[]
  chunks?: VideoChunk[]
}

export interface VideoSearchResult {
  type: 'video'
  id: string
  title: string
  description: string
  courseTitle: string
  courseSlug: string
  courseIcon?: string
  lessonTitle: string
  lessonSlug: string
  moduleTitle: string
  moduleNumber: number
  lessonNumber: string // e.g. "5.1"
  thumbnailUrl?: string
  duration: number
  startSeconds: number
  matchSource: 'chapter' | 'transcript'
  matchedText?: string
}

export interface LessonSearchResult {
  type: 'lesson'
  id: string
  title: string
  description: string
  courseTitle: string
  courseSlug: string
  courseIcon?: string
  lessonSlug: string
  moduleTitle: string
  moduleNumber: number
  lessonNumber: string
  duration: number
  keyPoints: string[]
}

export type SearchResultItem = VideoSearchResult | LessonSearchResult

export interface SearchResponse {
  query: string
  totalCount: number
  courseCount: number
  results: SearchResultItem[]
}



import { defineQuery } from 'next-sanity'

/**
 * List all courses for the catalog / landing page with calculated totals
 */
export const COURSES_QUERY = defineQuery(`
  *[_type == "course"] | order(_createdAt desc) {
    _id,
    _type,
    title,
    slug,
    summary,
    coverImage,
    level,
    price,
    popular,
    studentCount,
    instructor-> {
      _id,
      name,
      slug,
      photo,
      expertise
    },
    category-> {
      _id,
      title,
      slug
    },
    "totalLessons": count(modules[].lessons[]),
    "totalDuration": sum(modules[].lessons[]->duration)
  }
`)

/**
 * Fetch a single course by its slug with fully resolved modules, lessons, and learning outcomes
 */
export const COURSE_BY_SLUG_QUERY = defineQuery(`
  *[_type == "course" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    summary,
    coverImage,
    level,
    price,
    popular,
    studentCount,
    learningOutcomes,
    instructor-> {
      _id,
      name,
      slug,
      photo,
      expertise,
      bio
    },
    category-> {
      _id,
      title,
      slug,
      description
    },
    modules[] {
      _key,
      title,
      summary,
      lessons[]-> {
        _id,
        _type,
        title,
        slug,
        duration,
        freePreview,
        studentCount
      }
    },
    "totalLessons": count(modules[].lessons[]),
    "totalDuration": sum(modules[].lessons[]->duration)
  }
`)

/**
 * Slugs of all courses for static params or sitemap generation
 */
export const COURSE_SLUGS_QUERY = defineQuery(`
  *[_type == "course" && defined(slug.current)][].slug.current
`)

/**
 * Fetch a single lesson by its slug, resolving reverse references to its parent course
 */
export const LESSON_BY_SLUG_QUERY = defineQuery(`
  *[_type == "lesson" && slug.current == $slug][0] {
    _id,
    _type,
    title,
    slug,
    videoUrl,
    thumbnail,
    duration,
    freePreview,
    studentCount,
    notes,
    keyPoints,
    proTip,
    resources,
    "course": *[_type == "course" && references(^._id)][0] {
      _id,
      title,
      slug,
      instructor-> {
        _id,
        name,
        slug,
        photo,
        expertise
      },
      modules[] {
        _key,
        title,
        summary,
        lessons[]-> {
          _id,
          title,
          slug,
          duration,
          freePreview
        }
      }
    }
  }
`)

/**
 * Slugs of all lessons
 */
export const LESSON_SLUGS_QUERY = defineQuery(`
  *[_type == "lesson" && defined(slug.current)][].slug.current
`)

/**
 * List all instructors
 */
export const INSTRUCTORS_QUERY = defineQuery(`
  *[_type == "instructor"] | order(name asc) {
    _id,
    _type,
    name,
    slug,
    photo,
    expertise,
    bio
  }
`)

/**
 * Fetch single instructor by slug with all associated courses
 */
export const INSTRUCTOR_BY_SLUG_QUERY = defineQuery(`
  *[_type == "instructor" && slug.current == $slug][0] {
    _id,
    _type,
    name,
    slug,
    photo,
    expertise,
    bio,
    "courses": *[_type == "course" && references(^._id)] {
      _id,
      title,
      slug,
      summary,
      coverImage,
      level,
      price,
      popular,
      category-> {
        _id,
        title,
        slug
      },
      "totalLessons": count(modules[].lessons[]),
      "totalDuration": sum(modules[].lessons[]->duration)
    }
  }
`)

/**
 * List all categories with course count
 */
export const CATEGORIES_QUERY = defineQuery(`
  *[_type == "category"] | order(title asc) {
    _id,
    _type,
    title,
    slug,
    description,
    "courseCount": count(*[_type == "course" && references(^._id)])
  }
`)

/**
 * Search lessons and video intelligence documents matching keyword patterns
 */
export const SEARCH_CONTENT_QUERY = defineQuery(`
  {
    "lessons": *[_type == "lesson" && (
      title match $pattern ||
      pt::text(notes) match $pattern ||
      keyPoints[] match $pattern
    )] {
      _id,
      title,
      slug,
      duration,
      keyPoints,
      "notesText": pt::text(notes),
      "course": *[_type == "course" && references(^._id)][0] {
        _id,
        title,
        slug,
        modules[] {
          _key,
          title,
          lessons[]-> {
            _id,
            slug
          }
        }
      }
    },
    "videos": *[_type == "video" && (
      chapters[].label match $pattern ||
      chunks[].text match $pattern ||
      title match $pattern
    )] {
      _id,
      videoId,
      title,
      url,
      duration,
      "matchingChapters": chapters[label match $pattern],
      "matchingChunks": chunks[text match $pattern][0...3],
      "lesson": *[_type == "lesson" && (videoUrl == ^.url || videoUrl match ("*" + ^.videoId + "*"))][0] {
        _id,
        title,
        slug,
        thumbnail,
        duration,
        keyPoints,
        "notesText": pt::text(notes),
        "course": *[_type == "course" && references(^._id)][0] {
          _id,
          title,
          slug,
          modules[] {
            _key,
            title,
            lessons[]-> {
              _id,
              slug
            }
          }
        }
      }
    }
  }
`)



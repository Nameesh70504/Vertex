import 'server-only'
import { getSanityWriteClient, sanityFetch } from './client'
import type { LearnerProgress } from '../types'

/**
 * Generate a deterministic Sanity document ID for a learner's course progress.
 */
export function getProgressId(userId: string, courseId: string): string {
  const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, '_')
  const safeCourse = courseId.replace(/[^a-zA-Z0-9_-]/g, '_')
  return `progress-${safeUser}-${safeCourse}`
}

/**
 * Get progress for a specific user and course.
 */
export async function getProgressForCourse(
  userId: string,
  courseId: string
): Promise<LearnerProgress | null> {
  const progressId = getProgressId(userId, courseId)
  return sanityFetch<LearnerProgress | null>({
    query: `*[_type == "progress" && (_id == $progressId || (clerkUserId == $userId && courseId == $courseId))][0]`,
    params: { progressId, userId, courseId },
    revalidate: 0, // Never cache user progress
  })
}

/**
 * Get all progress records for a user across all courses.
 */
export async function getProgressForUser(
  userId: string
): Promise<LearnerProgress[]> {
  return sanityFetch<LearnerProgress[]>({
    query: `*[_type == "progress" && clerkUserId == $userId]`,
    params: { userId },
    revalidate: 0,
  })
}

/**
 * Toggle or set lesson completion status.
 */
export async function setLessonCompletion(
  userId: string,
  courseId: string,
  lessonId: string,
  completed: boolean,
  totalLessons?: number
): Promise<LearnerProgress> {
  const writeClient = getSanityWriteClient()
  const progressId = getProgressId(userId, courseId)

  // Fetch current doc to calculate list
  const existingDoc = await writeClient.getDocument<LearnerProgress>(progressId).catch(() => null)
  const currentCompleted = existingDoc?.completedLessons || []

  let updatedCompleted: string[]
  if (completed) {
    if (!currentCompleted.includes(lessonId)) {
      updatedCompleted = [...currentCompleted, lessonId]
    } else {
      updatedCompleted = currentCompleted
    }
  } else {
    updatedCompleted = currentCompleted.filter((id) => id !== lessonId)
  }

  const isAllComplete =
    completed &&
    typeof totalLessons === 'number' &&
    totalLessons > 0 &&
    updatedCompleted.length >= totalLessons

  const tx = writeClient.transaction()

  tx.createIfNotExists({
    _id: progressId,
    _type: 'progress',
    clerkUserId: userId,
    courseId: courseId,
    completedLessons: [],
  })

  tx.patch(progressId, (p) => {
    let patch = p.set({ completedLessons: updatedCompleted })
    if (isAllComplete) {
      patch = patch.set({ completedAt: new Date().toISOString() })
    } else if (!completed && existingDoc?.completedAt) {
      patch = patch.unset(['completedAt'])
    }
    return patch
  })

  await tx.commit()

  return {
    _id: progressId,
    _type: 'progress',
    clerkUserId: userId,
    courseId,
    completedLessons: updatedCompleted,
    completedAt: isAllComplete ? new Date().toISOString() : undefined,
    lastLessonSlug: existingDoc?.lastLessonSlug,
    lastPosition: existingDoc?.lastPosition,
  }
}

/**
 * Save the learner's last visited lesson and timestamp (resume position).
 */
export async function saveResumePosition(
  userId: string,
  courseId: string,
  lessonSlug: string,
  position?: number
): Promise<void> {
  const writeClient = getSanityWriteClient()
  const progressId = getProgressId(userId, courseId)

  const tx = writeClient.transaction()

  tx.createIfNotExists({
    _id: progressId,
    _type: 'progress',
    clerkUserId: userId,
    courseId: courseId,
    completedLessons: [],
  })

  tx.patch(progressId, (p) => {
    let patch = p.set({ lastLessonSlug: lessonSlug })
    if (typeof position === 'number' && !isNaN(position) && position >= 0) {
      patch = patch.set({ lastPosition: Math.round(position) })
    }
    return patch
  })

  await tx.commit()
}


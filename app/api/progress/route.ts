import { NextRequest, NextResponse, after } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getProgressForCourse, getProgressForUser, setLessonCompletion } from '@/sanity/lib/progress'
import { getPostHogClient } from '@/lib/posthog-server'
import { posthogLogger, posthogLoggerProvider, SeverityNumber } from '@/instrumentation'

function flushPostHogLogs() {
  after(() => posthogLoggerProvider?.forceFlush().catch(() => {}))
}

export async function GET(request: NextRequest) {
  const { isAuthenticated, userId } = await auth()

  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const courseId = searchParams.get('courseId')

  try {
    if (courseId) {
      const progress = await getProgressForCourse(userId, courseId)
      return NextResponse.json(progress || { completedLessons: [] })
    }

    const allProgress = await getProgressForUser(userId)
    return NextResponse.json(allProgress)
  } catch (error) {
    console.error('[API_PROGRESS_GET_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const { isAuthenticated, userId } = await auth()

  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { courseId, lessonId, completed, totalLessons } = body

    if (!courseId || typeof courseId !== 'string') {
      return NextResponse.json(
        { error: 'Valid courseId is required' },
        { status: 400 }
      )
    }

    if (!lessonId || typeof lessonId !== 'string') {
      return NextResponse.json(
        { error: 'Valid lessonId is required' },
        { status: 400 }
      )
    }

    const isCompleted = typeof completed === 'boolean' ? completed : true
    const progress = await setLessonCompletion(
      userId,
      courseId,
      lessonId,
      isCompleted,
      typeof totalLessons === 'number' ? totalLessons : undefined
    )

    posthogLogger?.emit({
      body: 'Lesson completion updated',
      severityNumber: SeverityNumber.INFO,
      attributes: {
        route: '/api/progress',
        course_id: courseId,
        lesson_id: lessonId,
        completed: isCompleted,
      },
    })
    flushPostHogLogs()

    const posthog = getPostHogClient()
    if (posthog) {
      posthog.capture({
        distinctId: userId,
        event: 'lesson_completion_updated',
        properties: {
          course_id: courseId,
          lesson_id: lessonId,
          completed: isCompleted,
          ...(typeof totalLessons === 'number' ? { total_lessons: totalLessons } : {}),
        },
      })
      await posthog.flush().catch(() => {})
    }

    return NextResponse.json(progress)
  } catch (error) {
    posthogLogger?.emit({
      body: 'Lesson completion update failed',
      severityNumber: SeverityNumber.ERROR,
      attributes: { route: '/api/progress' },
    })
    flushPostHogLogs()
    console.error('[API_PROGRESS_POST_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { saveResumePosition } from '@/sanity/lib/progress'

export async function POST(request: NextRequest) {
  const { isAuthenticated, userId } = await auth()

  if (!isAuthenticated || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { courseId, lessonSlug, position } = body

    if (!courseId || typeof courseId !== 'string') {
      return NextResponse.json(
        { error: 'Valid courseId is required' },
        { status: 400 }
      )
    }

    if (!lessonSlug || typeof lessonSlug !== 'string') {
      return NextResponse.json(
        { error: 'Valid lessonSlug is required' },
        { status: 400 }
      )
    }

    await saveResumePosition(
      userId,
      courseId,
      lessonSlug,
      typeof position === 'number' ? position : undefined
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API_PROGRESS_POSITION_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to save position' },
      { status: 500 }
    )
  }
}


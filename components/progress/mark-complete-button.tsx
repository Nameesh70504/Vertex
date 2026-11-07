'use client'

import React from 'react'
import { useAuth } from '@clerk/nextjs'
import { CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLessonProgress } from './lesson-progress-context'
import { cn } from '@/lib/utils'

interface MarkCompleteButtonProps {
  lessonId: string
  className?: string
}

export function MarkCompleteButton({ lessonId, className }: MarkCompleteButtonProps) {
  const { isSignedIn, isLoaded } = useAuth()
  const progress = useLessonProgress()

  if (!isLoaded || !isSignedIn || !progress) {
    return null
  }

  const completed = progress.isCompleted(lessonId)

  return (
    <Button
      variant={completed ? 'secondary' : 'primary'}
      size="md"
      onClick={() => progress.toggleComplete(lessonId)}
      className={cn(
        'gap-2 transition-all duration-200',
        completed &&
          'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300',
        className
      )}
      title={completed ? 'Click to mark as incomplete' : 'Mark this lesson as completed'}
    >
      {completed ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Completed</span>
        </>
      ) : (
        <>
          <Circle className="h-4 w-4" />
          <span>Mark as Complete</span>
        </>
      )}
    </Button>
  )
}


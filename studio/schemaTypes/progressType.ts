import { defineField, defineType } from 'sanity'
import { CheckmarkCircleIcon } from '@sanity/icons'

export const progressType = defineType({
  name: 'progress',
  title: 'Learner Progress',
  type: 'document',
  icon: CheckmarkCircleIcon,
  fields: [
    defineField({
      name: 'clerkUserId',
      title: 'Clerk User ID',
      type: 'string',
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'courseId',
      title: 'Course ID',
      type: 'string',
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'completedLessons',
      title: 'Completed Lessons',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of lesson IDs completed by the learner',
    }),
    defineField({
      name: 'lastLessonSlug',
      title: 'Last Visited Lesson Slug',
      type: 'string',
      description: 'Slug of the last visited lesson for resume affordance',
    }),
    defineField({
      name: 'lastPosition',
      title: 'Last Video Position (Seconds)',
      type: 'number',
      description: 'Timestamp in seconds where the learner left off',
    }),
    defineField({
      name: 'completedAt',
      title: 'Completed At',
      type: 'datetime',
      description: 'Timestamp when the entire course was marked complete',
    }),
  ],
  preview: {
    select: {
      userId: 'clerkUserId',
      courseId: 'courseId',
      completedCount: 'completedLessons.length',
    },
    prepare({ userId, courseId, completedCount }) {
      return {
        title: `User: ${userId || 'Unknown'}`,
        subtitle: `Course: ${courseId || 'Unknown'} (${completedCount || 0} completed)`,
      }
    },
  },
})


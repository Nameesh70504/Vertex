import { defineArrayMember, defineField, defineType } from 'sanity'
import { BookIcon } from '@sanity/icons'

export const courseType = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  icon: BookIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      type: 'text',
      rows: 3,
      description: 'Marketing summary of what this course delivers',
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'level',
      title: 'Difficulty Level',
      type: 'string',
      options: {
        list: [
          { title: 'Beginner', value: 'beginner' },
          { title: 'Intermediate', value: 'intermediate' },
          { title: 'Advanced', value: 'advanced' },
          { title: 'All Levels', value: 'all-levels' },
        ],
      },
      initialValue: 'beginner',
    }),
    defineField({
      name: 'price',
      title: 'Price (USD)',
      type: 'number',
      description: 'Course price in USD (0 for free)',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'popular',
      title: 'Popular Flag',
      type: 'boolean',
      description: 'Highlight this course with a popular badge in catalog listings',
      initialValue: false,
    }),
    defineField({
      name: 'studentCount',
      title: 'Student Count (for display)',
      type: 'number',
      initialValue: 0,
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'learningOutcomes',
      title: 'Learning Outcomes ("What you\'ll learn")',
      type: 'array',
      of: [defineArrayMember({ type: 'learningOutcome' })],
      description: 'Outcomes highlighted in the course syllabus header',
    }),
    defineField({
      name: 'instructor',
      title: 'Instructor',
      type: 'reference',
      to: [{ type: 'instructor' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'modules',
      title: 'Modules',
      type: 'array',
      of: [defineArrayMember({ type: 'module' })],
      description: 'Ordered list of curriculum modules',
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      instructorName: 'instructor.name',
      categoryTitle: 'category.title',
      media: 'coverImage',
    },
    prepare({ title, instructorName, categoryTitle, media }) {
      const details = [instructorName, categoryTitle].filter(Boolean).join(' • ')
      return {
        title: title || 'Untitled Course',
        subtitle: details,
        media,
      }
    },
  },
})


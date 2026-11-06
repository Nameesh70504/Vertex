import { defineArrayMember, defineField, defineType } from 'sanity'
import { PlayIcon } from '@sanity/icons'

export const videoType = defineType({
  name: 'video',
  title: 'Video',
  type: 'document',
  icon: PlayIcon,
  fields: [
    defineField({
      name: 'videoId',
      title: 'Video ID',
      type: 'string',
      description: 'Provider-specific identifier (e.g. YouTube 11-char ID)',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      description: 'Full canonical embed/watch URL',
      validation: (rule) =>
        rule.required().uri({
          scheme: ['http', 'https'],
        }),
    }),
    defineField({
      name: 'title',
      title: 'Video Title',
      type: 'string',
    }),
    defineField({
      name: 'provider',
      title: 'Video Provider',
      type: 'string',
      options: {
        list: [
          { title: 'YouTube', value: 'youtube' },
          { title: 'Vimeo', value: 'vimeo' },
          { title: 'Bunny', value: 'bunny' },
        ],
      },
      initialValue: 'youtube',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      type: 'number',
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: 'chapters',
      title: 'Table of Contents / Chapters',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'chapter',
          fields: [
            defineField({
              name: 'startSeconds',
              title: 'Start Seconds',
              type: 'number',
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: 'label',
              title: 'Chapter Label',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'label',
              start: 'startSeconds',
            },
            prepare({ title, start }) {
              const minutes = Math.floor((start || 0) / 60)
              const seconds = (start || 0) % 60
              return {
                title: title || 'Untitled Chapter',
                subtitle: `${minutes}:${seconds.toString().padStart(2, '0')}`,
              }
            },
          },
        }),
      ],
      description: 'Authored or detected timestamped chapter markers',
    }),
    defineField({
      name: 'chunks',
      title: 'Transcript Chunks',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'chunk',
          fields: [
            defineField({
              name: 'startSeconds',
              title: 'Start Seconds',
              type: 'number',
              validation: (rule) => rule.required().min(0),
            }),
            defineField({
              name: 'text',
              title: 'Transcript Text',
              type: 'text',
              rows: 2,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'text',
              start: 'startSeconds',
            },
            prepare({ title, start }) {
              const minutes = Math.floor((start || 0) / 60)
              const seconds = (start || 0) % 60
              return {
                title: title || 'Empty chunk',
                subtitle: `At ${minutes}:${seconds.toString().padStart(2, '0')}`,
              }
            },
          },
        }),
      ],
      description: 'Timestamped short transcript chunks for search grounding',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      url: 'url',
      duration: 'duration',
    },
    prepare({ title, url, duration }) {
      const minutes = duration ? Math.floor(duration / 60) : 0
      const seconds = duration ? duration % 60 : 0
      return {
        title: title || url || 'Untitled Video',
        subtitle: `${minutes}m ${seconds}s • YouTube Intelligence`,
      }
    },
  },
})


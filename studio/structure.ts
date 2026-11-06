import type { StructureResolver } from 'sanity/structure'
import { BookIcon, DocumentTextIcon, PlayIcon, TagIcon, UserIcon } from '@sanity/icons'

// Custom Studio desk structure
export const structure: StructureResolver = (S) =>
  S.list()
    .title('Vertex Content')
    .items([
      S.documentTypeListItem('course').title('Courses').icon(BookIcon),
      S.documentTypeListItem('lesson').title('Lessons').icon(DocumentTextIcon),
      S.divider(),
      S.documentTypeListItem('video').title('Videos (Intelligence)').icon(PlayIcon),
      S.divider(),
      S.documentTypeListItem('instructor').title('Instructors').icon(UserIcon),
      S.documentTypeListItem('category').title('Categories').icon(TagIcon),
    ])

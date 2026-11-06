import { type SchemaTypeDefinition } from 'sanity'
import { blockContentType } from './blockContentType'
import { categoryType } from './categoryType'
import { courseType } from './courseType'
import { instructorType } from './instructorType'
import { learningOutcomeType } from './learningOutcomeType'
import { lessonType } from './lessonType'
import { moduleType } from './moduleType'
import { resourceType } from './resourceType'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    courseType,
    moduleType,
    lessonType,
    instructorType,
    categoryType,
    learningOutcomeType,
    resourceType,
    blockContentType,
  ],
}

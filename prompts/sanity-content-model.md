# Implementation prompt: Sanity Content Model, Studio, and Server Read Data Layer

## Goal

Implement the complete Sanity content model and Studio configuration for Vertex (`course`, `module`, `lesson`, `instructor`, `category`, and supporting objects), alongside a secure, server-only Sanity read client and clean data layer adhering to all architectural boundaries, strict typing, and security constraints outlined in `AGENTS.md`.

## Skills and docs read

- `AGENTS.md` (sections 1, 2, 4 skills, 5 structure, 6 tech stack, 7 decisions, 8 data modeling, 12 trip-ups, 13 checks, 15 living docs).
- `sanity-best-practices` (`.agents/skills/sanity-best-practices/SKILL.md` and references `schema.md`, `nextjs.md`).
- `content-modeling-best-practices` (`.agents/skills/content-modeling-best-practices/SKILL.md` and references `reference-vs-embedding.md`, `separation-of-concerns.md`).

## Code inspected

- `sanity.config.ts` — Studio configuration currently referencing empty schema and basic structure.
- `sanity/schemaTypes/index.ts` — Empty schema types array `types: []`.
- `sanity/structure.ts` — Basic desk structure fallback.
- `sanity/env.ts` — Dataset, Project ID, and API version getters.
- `sanity/lib/client.ts` — Current client without private dataset server read token support.
- `sanity/lib/image.ts` — Image builder configured with dataset and project ID.
- `sanity/lib/live.ts` — Live content API helper.
- `app/studio/[[...tool]]/page.tsx` — NextStudio page route mounting `/studio`.
- `package.json` — `next-sanity`, `sanity`, `@sanity/image-url`, `@sanity/vision` installed.

## Decisions and assumptions

1. **Exact Schema Adherence (§8):**
   - **`course` (document):** `title`, `slug`, marketing fields (`summary`, `coverImage`, `level` [beginner, intermediate, advanced, all-levels], `price`), optional `popular` flag, display `studentCount`, `learningOutcomes` array of objects (`icon`, `title`, `description`), `instructor` (reference to `instructor`), `category` (reference to `category`), and `modules` (ordered array of embedded `module` objects).
   - **`module` (embedded object, NOT a document):** `title`, `summary`, and `lessons` (ordered array of references to `lesson` documents). Numbering (e.g. Module 5, Lesson 5.1) is derived dynamically from order.
   - **`lesson` (document):** `title`, `slug`, `videoUrl` (YouTube, Vimeo, Bunny), `thumbnail` / poster image with hotspot, `duration` (in seconds), `freePreview` boolean flag, `studentCount` display number, `notes` in Portable Text, `keyPoints` array of strings, optional `proTip` text, and `resources` array of objects (`type`, `title`, `description`, `url`).
   - **`instructor` (document):** `name`, `slug`, `photo` (with hotspot), `expertise`, and `bio`.
   - **`category` (document):** `title`, `slug`, and `description`.
   - **Supporting embedded objects:** `moduleType`, `learningOutcomeType`, `resourceType`, and `blockContentType` (for Portable Text notes).

2. **Custom Studio Desk Structure (§3, §8):**
   - Provide an organized hierarchy in `sanity/structure.ts` with dedicated menu items and distinct icons for Courses, Lessons, Instructors, and Categories.

3. **Server-Only Read Client & Security Boundaries (§5, §6, §12):**
   - Sanity dataset is private. Data fetching must only happen server-side using `SANITY_API_READ_TOKEN`.
   - The token will live in a server-only token module (`sanity/lib/token.ts`) and will never leak into client component bundles.
   - The client in `sanity/lib/client.ts` will attach the token when executed in the server environment while preserving client-safe defaults without tokens.

4. **Dedicated Data Access Layer & GROQ Queries:**
   - Define canonical GROQ queries in `sanity/lib/queries.ts` covering:
     - Courses catalog listing with expanded category, instructor, and module/lesson counts.
     - Single course by slug with resolved modules and lessons.
     - Single lesson by slug with reverse-referenced parent course (`*[_type == "course" && references(^._id)][0]`), instructor, and siblings for navigation.
     - Instructors listing and single instructor profile by slug with taught courses.
     - Categories listing.
   - Provide typed data layer functions in `sanity/lib/data.ts` (`getCourses()`, `getCourseBySlug(slug)`, `getLessonBySlug(slug)`, `getInstructors()`, `getInstructorBySlug(slug)`, `getCategories()`).

5. **Canonical Environment Variables (§12):**
   - Create committed `.env.example` documenting all Sanity, Clerk, and app environment variables.

6. **Strict TypeScript Types:**
   - Provide comprehensive TypeScript interfaces in `sanity/types.ts` for all documents and query projection returns.

## Files to touch

- `sanity/schemaTypes/categoryType.ts` — Create category document schema.
- `sanity/schemaTypes/instructorType.ts` — Create instructor document schema.
- `sanity/schemaTypes/resourceType.ts` — Create resource object schema.
- `sanity/schemaTypes/blockContentType.ts` — Create Portable Text schema for lesson notes.
- `sanity/schemaTypes/lessonType.ts` — Create lesson document schema.
- `sanity/schemaTypes/learningOutcomeType.ts` — Create learning outcome object schema.
- `sanity/schemaTypes/moduleType.ts` — Create module embedded object schema.
- `sanity/schemaTypes/courseType.ts` — Create course document schema.
- `sanity/schemaTypes/index.ts` — Register all schema types in the schema bundle.
- `sanity/structure.ts` — Configure structured desk layout with icons.
- `sanity/lib/token.ts` — Create server-only token access module.
- `sanity/lib/client.ts` — Update Sanity client with server-token support and create server fetch helper.
- `sanity/lib/queries.ts` — GROQ queries for courses, lessons, instructors, and categories.
- `sanity/lib/data.ts` — Typed data-access layer functions.
- `sanity/types.ts` — TypeScript definitions for all content types and query responses.
- `.env.example` — Canonical list of environment variables.
- `flow.md`, `decisions.md`, `quiz.md` — Living docs updates per AGENTS.md §15.

## Requirements

1. Complete schema definitions using `defineType`, `defineField`, and `defineArrayMember` from `sanity`.
2. Clean separation between documents (`course`, `lesson`, `instructor`, `category`) and embedded objects (`module`, `learningOutcome`, `resource`, `blockContent`).
3. Lesson does not store parent course; reverse reference GROQ lookup resolves parent course and module position.
4. Studio structure displays organized items for Courses, Lessons, Instructors, and Categories with appropriate icons and titles.
5. `sanity/lib/client.ts` and `sanity/lib/data.ts` query data safely using the server token for private dataset access.
6. TypeScript check (`npx tsc --noEmit`) and linting (`npm run lint`) pass cleanly.
7. Next.js build (`npm run build`) compiles without errors.
8. Living docs (`flow.md`, `decisions.md`, `quiz.md`) updated with entries on top.

## Security considerations

- Private Sanity dataset read token `SANITY_API_READ_TOKEN` stays strictly on the server via `sanity/lib/token.ts`.
- No tokens are exposed to client-side bundles or the browser.
- `.env*` files remain git-ignored; `.env.example` provides non-sensitive template values.

## Acceptance criteria

- All schema types load cleanly in Sanity Studio at `/studio` without schema warnings or errors.
- Schema allows authoring of courses with embedded modules referencing lessons, instructors, and categories.
- Reverse GROQ query cleanly resolves parent course and navigation for any lesson.
- Data access functions in `sanity/lib/data.ts` are strongly typed and ready for page consumption.
- `npm run lint`, `npx tsc --noEmit`, and `npm run build` pass with zero errors.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- `npm run build`

## Manual test steps

1. Run `npm run dev` and navigate to `http://localhost:3000/studio`.
2. Verify Sanity Studio loads with navigation sections for Courses, Lessons, Instructors, and Categories.
3. Test creating a Category and an Instructor in Studio.
4. Test creating a Lesson with notes, key points, and resources.
5. Test creating a Course with marketing fields, learning outcomes, and a module referencing the created lesson.
6. Verify Studio form validation (required fields, slugs, numbers).


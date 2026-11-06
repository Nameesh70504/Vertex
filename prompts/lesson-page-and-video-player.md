# Implementation prompt: Lesson Page and Embedded Video Player

## Goal

Build the Lesson page (`/courses/[courseSlug]/lessons/[lessonSlug]`) reproducing `design/vertex-lesson.png` down to spacing, typography, colors, and layout: an embedded on-site video player (YouTube/Vimeo/Bunny with start seconds query parameter support), expandable course module sidebar navigation with active lesson indicators, Portable Text notes rendering, key points checklist, pro tip card, downloadable/external resources grid, and previous/next lesson navigation.

## Skills and docs read

- `AGENTS.md` (§1 platform description, §3 UI work & reference image truth, §5 architecture boundaries, §7 decisions: on-site embed player with start second param, presentational notes tab, §8 lesson data shape, §13 checks, §15 living docs).
- `portable-text-serialization` (`.agents/skills/portable-text-serialization/SKILL.md`).
- Reference image: `design/vertex-lesson.png` (desktop source of truth for layout, sidebar, video embed, tabs, key points, pro tips, resources, and navigation).

## Code inspected

- `sanity/lib/data.ts` — `getLessonBySlug(slug)` returns lesson with reverse-referenced parent course (`lesson.course`), dynamic `moduleIndex`, `lessonIndex`, and `navigation` (`previousLesson`, `nextLesson`).
- `sanity/lib/queries.ts` — `LESSON_BY_SLUG_QUERY` resolves course, instructor, and sibling modules.
- `components/cards/resource-card.tsx` — Prebuilt card for external resources.
- `lib/format.ts` — Duration formatting utilities (`formatDuration`, `formatLessonDuration`, `formatStudentCount`).
- `design/vertex-lesson.png` — Visual reference for layout: sidebar with course progress, module numbers, checkmarks, active "Now playing" lesson; breadcrumbs, lesson title with derived numbering (e.g. `LESSON 5.1`), embedded player, tabs (Lesson Content, Notes), overview notes, checklist, pro tip banner, resources grid, and bottom previous/next lesson bar.

## Decisions and assumptions

1. **Exact Visual Reproduction of `design/vertex-lesson.png` (§3):**
   - **Left Sidebar:** Course title, back-to-course button, progress percentage indicator, full course module list with module numbers. The active module is expanded with the current lesson highlighted in red/primary color and labeled "Now playing" with a play icon. Completed lessons show checkmarks.
   - **Header & Breadcrumbs:** `All Courses > [Course] > [Module] > [Lesson Title]`.
   - **Lesson Header:** Derived lesson badge `LESSON {moduleIndex + 1}.{lessonIndex + 1}` (e.g. `LESSON 5.1`), Playfair Display title, summary, bookmark button, and metadata row (duration, level, student count).
   - **On-Site Video Embed (§7):** Render embedded YouTube player (`https://www.youtube.com/embed/{id}?autoplay=0&start={startSeconds}`). Do not build a custom player. Support optional `?start={seconds}` query param for search jump-in. Never send learners out to YouTube.
   - **Tabs:** `Lesson Content` and `Notes` tabs (presentational per §7).
   - **Content Sections:**
     - Overview: Rich text rendered with `@portabletext/react`.
     - "In this lesson you will": Checklist with orange circled checkmarks rendering `keyPoints`.
     - "Pro Tip": Styled banner with lightbulb icon when `lesson.proTip` exists.
     - "Resources": 3-column grid of resources with icons (Github, Docs, Link) and external link indicators.
   - **Bottom Navigation Bar:** Floating sticky footer with "Previous Lesson" (linking to previous lesson with module info) and "Next Lesson" (linking to next lesson).
2. **Server-Side Fetching & Static Slugs:**
   - Server Component reads `courseSlug` and `lessonSlug` params.
   - Queries `getLessonBySlug(lessonSlug)`. If not found or if the lesson doesn't belong to the course, returns `notFound()`.
   - `generateMetadata()` produces clean dynamic SEO metadata for the lesson.
3. **Responsive Mobile Adaptations (§3):**
   - On mobile/tablet (< `lg`), collapse the lesson sidebar into a collapsible drawer or accordion above the video so learners can navigate without losing layout integrity.

## Files to touch

- `components/lesson/lesson-sidebar.tsx` — Course navigation sidebar with collapsible modules and active lesson indicator.
- `components/lesson/video-embed.tsx` — Embed video player supporting YouTube, Vimeo, Bunny, and `start` seconds query param.
- `components/lesson/portable-text-renderer.tsx` — Portable text renderer for lesson notes with custom styled blocks, links, and code.
- `components/lesson/lesson-tabs.tsx` — Tabs component switching between "Lesson Content" and "Notes".
- `components/lesson/lesson-footer.tsx` — Previous/next lesson footer navigation.
- `app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx` — Main lesson page route.
- `flow.md`, `decisions.md`, `quiz.md` — Living docs updates per AGENTS.md §15.

## Requirements

1. Navigating to `/courses/[courseSlug]/lessons/[lessonSlug]` renders the exact layout from `design/vertex-lesson.png`.
2. YouTube video embed loads and plays within the page without redirection.
3. Optional URL query parameter `?start=120` starts the video at second 120 (`start=120`).
4. Sidebar highlights the active lesson with "Now playing" and derives module & lesson numbers (e.g. `LESSON 5.1`).
5. Rich notes from Sanity render cleanly in Portable Text.
6. Key points, Pro Tip (if present), and Resources render according to the design.
7. Previous and Next buttons correctly link to adjacent lessons in curriculum order across module boundaries.
8. TypeScript check (`npx tsc --noEmit`) and lint (`npm run lint`) pass cleanly.
9. Living docs updated with entries on top.

## Security considerations

- All content querying runs server-side with private dataset token.
- Video embeds use secure sandbox attributes and valid HTTPS origins.

## Acceptance criteria

- Navigating to `/courses/nextjs-app-router-in-depth/lessons/nextjs-app-router-in-depth-file-system-routing` renders the complete lesson page with sidebar and embedded video.
- Clicking "Next Lesson" moves to `nextjs-app-router-in-depth-layouts-and-templates`.
- Clicking "Back to course" returns to `/courses/nextjs-app-router-in-depth`.
- Passing `?start=60` to the URL sets the video iframe's start timestamp.
- Zero TypeScript and ESLint errors.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`

## Manual test steps

1. Run `npm run dev` and navigate to `http://localhost:3000/courses/nextjs-app-router-in-depth`.
2. Click "Start Learning" or any lesson link in the syllabus.
3. Verify the lesson page loads with the left sidebar showing all modules and the active lesson highlighted.
4. Verify the YouTube embed loads and plays on the site.
5. Verify the "In this lesson you will" key points and resources appear below the video.
6. Click "Next Lesson" in the bottom footer and verify smooth navigation to the next lesson.


# Implementation prompt: Course Catalog and Course Detail Pages

## Goal

Build the dynamic Course Catalog (`/courses` and live Home page course list) and the Course Detail page (`/courses/[slug]`) adhering strictly to the desktop reference image (`design/vertex-course.png`), connecting the live Sanity data layer (`getCourses`, `getCourseBySlug`, `getCategories`), rendering full syllabus hierarchies (modules and lessons), learning outcomes, and instructors, with responsive layouts down to mobile.

## Skills and docs read

- `AGENTS.md` (§1 platform description, §3 UI work & reference image truth, §5 architecture boundaries, §7 decisions, §8 data model, §13 checks, §15 living docs).
- `sanity-best-practices` (`references/nextjs.md` data fetching in App Router).
- Reference design: `design/vertex-course.png` (desktop source of truth for course detail layout, typography, badges, syllabus accordion, and metadata).

## Code inspected

- `sanity/lib/data.ts` — `getCourses()`, `getCourseBySlug(slug)`, `getCourseSlugs()`, `getCategories()`.
- `sanity/lib/queries.ts` — `COURSES_QUERY` (with calculated `totalLessons`, `totalDuration`), `COURSE_BY_SLUG_QUERY` (with expanded instructor, category, learning outcomes, and resolved module lessons).
- `components/cards/course-card.tsx` — `CourseCard` component with level, duration, and module count metadata.
- `components/nav/breadcrumbs.tsx` — Breadcrumb navigation component.
- `components/nav/navbar.tsx` — Header navigation bar with logo, links, and Clerk `AuthControls`.
- `app/page.tsx` — Current landing page with static mockup course cards.
- `design/vertex-course.png` — Visual reference for course page hierarchy: breadcrumbs, course tile logo, popular badge, title, summary, metadata chips, "Start Learning" CTA, bookmark button, "What you'll learn" 2x2 grid, "Course Content" syllabus with expandable modules, and bottom progress banner.

## Decisions and assumptions

1. **Exact Visual Reproduction of `design/vertex-course.png` (§3):**
   - Breadcrumb navigation: `All Courses > [Course Title]`.
   - Hero header: Brand tile/cover image on left, title in Playfair Display serif, summary, meta row (level with signal bars, duration formatted `Xh Ym`, module count, student count), "Start / Continue Learning" CTA button and "Bookmark" button.
   - "What you'll learn" section: 2x2 grid of outcome cards featuring orange outline icons, title, and description.
   - "Course Content" accordion: Modules numbered 1..N with title, summary, total module duration, and expandable lesson list displaying lesson title, duration (`Xm Ys`), and free preview badge.
   - Sticky bottom bar: Progress percentage indicator with progress bar and "Continue Learning" CTA.
2. **Server-Side Rendering & Zero Token Leakage (§5, §12):**
   - Pages are React Server Components fetching data through `sanity/lib/data.ts`.
   - `getCourseSlugs()` used in `generateStaticParams()` for optimal performance.
   - `generateMetadata()` dynamically derives SEO title, description, and OpenGraph metadata.
   - The private dataset read token stays on the server; zero tokens sent to the browser.
3. **Live Catalog Page (`/courses`) and Home Page Integration:**
   - Update `app/page.tsx` to dynamically query and render the live Sanity courses.
   - Create `app/courses/page.tsx` displaying the complete 10-course catalog with category filter pills, search input, and course grid.
4. **Duration Formatting Utility:**
   - Format seconds into clean human-readable strings (e.g. `18h 24m` for courses, `12m 30s` for lessons).

## Files to touch

- `lib/format.ts` — Create helper functions for duration formatting (`formatDuration`, `formatLessonDuration`) and student counts.
- `components/course/course-syllabus.tsx` — Interactive client component for the expandable module/lesson accordion on the course detail page.
- `components/course/what-youll-learn.tsx` — Component rendering the 2x2 learning outcomes grid with dynamic Lucide icon matching.
- `app/courses/page.tsx` — Catalog page listing all courses with category filter pills.
- `app/courses/[slug]/page.tsx` — Course detail page matching `design/vertex-course.png`.
- `app/page.tsx` — Update home page to render live Sanity courses via `getCourses()`.
- `flow.md`, `decisions.md`, `quiz.md` — Living docs updates per AGENTS.md §15.

## Requirements

1. `/courses` renders all 10 seeded courses from Sanity with category filtering.
2. `/courses/[slug]` renders the full course detail page matching `design/vertex-course.png`.
3. Clicking on any course card navigates to `/courses/[slug]`.
4. "What you'll learn" renders each course's `learningOutcomes`.
5. "Course Content" renders all modules in order, with module durations and expandable lessons showing durations and free preview flags.
6. "Start Learning" CTA links directly to the first lesson of the first module.
7. TypeScript check (`npx tsc --noEmit`) and lint (`npm run lint`) pass cleanly.
8. Living docs updated with entries on top.

## Security considerations

- All content fetching is executed server-side via `sanityFetch` with `SANITY_API_READ_TOKEN`.
- No sensitive credentials or write tokens are exposed to client components.

## Acceptance criteria

- Navigating to `/courses` displays all 10 seeded courses with accurate counts and metadata.
- Navigating to `/courses/nextjs-app-router-in-depth` (and all other 9 courses) loads the exact layout from `design/vertex-course.png`.
- Expandable modules reveal all 3 lessons with title, duration, and free preview badge where applicable.
- `npx tsc --noEmit` and `npm run lint` execute with 0 errors.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`

## Manual test steps

1. Run `npm run dev` and navigate to `http://localhost:3000`.
2. Verify home page displays live courses from Sanity.
3. Click "View all courses" or navigate to `http://localhost:3000/courses` and verify all 10 courses render with category filters.
4. Click on "Next.js App Router in Depth" (or any course card) and verify the course detail page matches `design/vertex-course.png`.
5. Expand module accordions in "Course Content" to inspect lessons and duration times.
6. Verify "What you'll learn" displays all 4 learning outcome cards.


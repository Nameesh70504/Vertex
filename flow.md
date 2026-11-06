# flow.md

How code execution moves between files and functions. One section per feature/change,
newest on top. Keep it to the real call path — entry point, the chain, and where it ends.

---

## Video Document Schema & Offline Ingestion Tooling (2026-11-07)

### Entry point

- Offline CLI: `npm run ingest:videos` → `npx tsx scripts/ingest-videos.ts`.

### Call chain

1. `scripts/ingest-videos.ts` — `generateVideoDocuments()`:
   - Reads `script/seed/videos.json` (120 YouTube video metadata entries keyed by lesson slug).
   - Reads `script/seed/seed.ndjson`, filters `_type === 'lesson'` lines, builds a `lessonsBySlug` map.
   - For each unique video ID, extracts `keyPoints` and notes text from the matching lesson.
   - Generates `chapters[]` (table of contents): intro chapter at 0s, then one chapter per key point evenly spaced.
   - Generates `chunks[]` (transcript segments): 25-second windows cycling through narrative seeds built from the lesson's notes and key points.
   - Assigns document ID via `sanitizeId('youtube', videoId)` → `video.youtube_<id>`.
2. Writes all 120 `VideoDocument` objects as NDJSON to `script/seed/videos.ndjson`.
3. Import via `npx sanity dataset import script/seed/videos.ndjson production --replace`.

### Schema registration

- `studio/schemaTypes/videoType.ts` defines the `video` document type with `chapters` and `chunks` arrays.
- `studio/schemaTypes/index.ts` registers `videoType` in the schema types array.
- `studio/structure.ts` adds a "Videos (Intelligence)" desk item under a PlayIcon.

### Where it ends

- 120 `video` documents in the Sanity `production` dataset, each with populated `chapters` and `chunks`.
- TypeScript types in `sanity/types.ts`: `VideoDocument`, `VideoChapter`, `VideoChunk`.

---

## Lesson Page & Embedded Video Player (2026-11-07)

### Entry point

- Lesson page route: `app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx` rendering the full lesson experience matching `design/vertex-lesson.png`.

### Call chain

1. **Lesson Data Resolution & Reverse Reference:**
   - User navigates to `/courses/[courseSlug]/lessons/[lessonSlug]` with optional `?start=[seconds]` timestamp.
   - `getLessonBySlug(lessonSlug)` queries Sanity with `LESSON_BY_SLUG_QUERY`.
   - The query resolves the reverse-referenced parent course (`*[_type == "course" && references(^._id)][0]`), instructor, and syllabus hierarchy.
   - Data layer derives `moduleIndex`, `lessonIndex`, and `navigation` (`previousLesson`, `nextLesson`).

2. **Component Composition:**
   - **Sidebar (`LessonSidebar`):** Left navigation panel displaying course progress and collapsible curriculum modules. Automatically highlights the active module and marks the current lesson with "Now playing" and a play indicator.
   - **Video Embed (`VideoEmbed`):** Parses the lesson's YouTube URL, applies `startSeconds` query param, and embeds the YouTube player on-site without navigation away from the platform.
   - **Lesson Tabs (`LessonTabs`):** Switches between "Lesson Content" (Portable Text overview notes, key points checklist, pro tip card, resources grid) and "Notes" (presentational personal note-taking pad).
   - **Footer Navigation (`LessonFooter`):** Displays previous and next lesson links with curriculum titles and durations.

### Import graph

- `app/courses/[courseSlug]/lessons/[lessonSlug]/page.tsx` -> `components/lesson/lesson-sidebar.tsx` -> `components/lesson/video-embed.tsx` -> `components/lesson/lesson-tabs.tsx` -> `components/lesson/portable-text-renderer.tsx` -> `components/lesson/lesson-footer.tsx` -> `sanity/lib/data.ts`

---

## Course Catalog & Course Detail Pages (2026-11-07)

### Entry point

- Catalog page: `app/courses/page.tsx` displaying the complete 10-course catalog.
- Course detail page: `app/courses/[slug]/page.tsx` rendering the syllabus and course details matching `design/vertex-course.png`.
- Home page integration: `app/page.tsx` dynamically querying live Sanity courses.

### Call chain

1. **Course Detail Page Rendering (`/courses/[slug]`):**
   - User navigates to `/courses/[slug]`.
   - `generateStaticParams()` calls `getCourseSlugs()` in `sanity/lib/data.ts` to pre-render valid course paths.
   - `generateMetadata()` calls `getCourseBySlug(slug)` to derive dynamic SEO page metadata.
   - The Server Component calls `getCourseBySlug(slug)` executing `COURSE_BY_SLUG_QUERY` with `SANITY_API_READ_TOKEN`.
   - The page renders the breadcrumb (`All Courses > [Title]`), hero header (with cover image, POPULAR badge, duration, modules, and student count), `<WhatYoullLearn />` (2x2 grid of `learningOutcomes`), `<CourseSyllabus />` (collapsible module accordion with lesson durations and free preview badges), instructor bio, and the sticky bottom resume bar.
   - "Start Learning" and "Continue Learning" buttons resolve the first lesson URL (`/courses/[slug]/lessons/[firstLessonSlug]`).

2. **Catalog Page (`/courses`):**
   - Server Component invokes `Promise.all([getCourses(), getCategories()])`.
   - Renders category pill filters and responsive 3-column grid of `CourseCard` components linked to `/courses/[slug]`.

### Import graph

- `app/courses/[slug]/page.tsx` -> `sanity/lib/data.ts` -> `components/course/course-syllabus.tsx` -> `components/course/what-youll-learn.tsx` -> `lib/format.ts` -> `sanity/lib/image.ts`
- `app/courses/page.tsx` -> `sanity/lib/data.ts` -> `components/cards/course-card.tsx` -> `lib/format.ts`

### Notable internal branches

- **Dynamic Module Accordion State:** `CourseSyllabus` client component maintains independent toggle state per module, expands the first module by default, and provides a toggle button when module count exceeds 6.

---

## Standalone Studio Workspace Migration (2026-11-05)

### Entry point

- Standalone Studio workspace: `studio/` directory running independently on Vite (`npm --prefix studio run dev` at `http://localhost:3333`).
- Next.js Web data access layer: `sanity/lib/data.ts` querying Sanity via server-only client `sanity/lib/client.ts` with `SANITY_API_READ_TOKEN`.

### Call chain

1. **Standalone Studio Authoring:**
   - Authoring runs in standalone Vite application in `studio/`.
   - `studio/sanity.config.ts` mounts `structureTool({ structure })` and `visionTool()`, pointing to schemas in `studio/schemaTypes/`.
   - TypeGen is isolated in `studio/sanity.cli.ts`, reading queries from `../sanity/` and outputting generated types to `../sanity.types.ts`.
   - The embedded Next.js catch-all route (`app/studio/[[...tool]]/page.tsx`) has been purged completely from the Next.js App Router.

2. **Web Data Access & Private Token Isolation:**
   - Server components and API routes import query helpers directly from `sanity/lib/data.ts`.
   - `sanity/lib/data.ts` delegates to `sanityFetch` in `sanity/lib/client.ts`.
   - The private dataset token `SANITY_API_READ_TOKEN` is loaded strictly on the server in `sanity/lib/token.ts` with `import 'server-only'`, preventing any leak to browser bundles.

### Import graph

- `studio/sanity.config.ts` -> `studio/schemaTypes/index.ts` -> `studio/structure.ts`
- Web app: `app/page.tsx` -> `sanity/lib/data.ts` -> `sanity/lib/client.ts` -> `sanity/lib/token.ts` (`server-only`)

---

## Sanity Content Model, Studio & Data Layer (2026-11-03)

### Entry point

- Studio authoring: `app/studio/[[...tool]]/page.tsx` (`<NextStudio config={config} />`) mounting Sanity Studio at `/studio`.
- Data access layer: `sanity/lib/data.ts` exporting typed query helpers (`getCourses`, `getCourseBySlug`, `getLessonBySlug`, `getInstructors`, `getInstructorBySlug`, `getCategories`).

### Call chain

1. **Studio Authoring (`/studio`):**
   - User navigates to `/studio` handled by NextStudio catch-all route `app/studio/[[...tool]]/page.tsx`.
   - `sanity.config.ts` initializes Sanity with `structureTool({ structure })` and `visionTool()`.
   - `sanity/structure.ts` mounts top-level document list items for Courses (`course`), Lessons (`lesson`), Instructors (`instructor`), and Categories (`category`).
   - Editors create and edit documents according to schemas in `sanity/schemaTypes/`. Modules (`module`) and Learning Outcomes (`learningOutcome`) are edited as inline embedded objects inside Course documents; Resources (`resource`) and Portable Text (`blockContent`) are authored within Lesson documents.

2. **Data Layer Query Execution:**
   - Server components / route handlers invoke functions in `sanity/lib/data.ts` (e.g., `getCourses()`, `getCourseBySlug(slug)`).
   - `sanity/lib/data.ts` delegates to `sanityFetch<T>()` in `sanity/lib/client.ts` passing canonical GROQ queries from `sanity/lib/queries.ts`.
   - `sanityFetch` retrieves `token` from `process.env.SANITY_API_READ_TOKEN` on the server (guarded by `sanity/lib/token.ts`) and executes `client.fetch<T>()` with Next.js revalidation and tagging.
   - For `getLessonBySlug(slug)`, the reverse GROQ reference query resolves the parent course (`*[_type == "course" && references(^._id)][0]`), and the data layer derives the zero-based and relative module/lesson numbering plus `previousLesson` and `nextLesson` navigation objects.

### Import graph

- `app/studio/[[...tool]]/page.tsx` -> `sanity.config.ts` -> `sanity/schemaTypes/index.ts` -> `[courseType, moduleType, lessonType, instructorType, categoryType, learningOutcomeType, resourceType, blockContentType]`
- `sanity.config.ts` -> `sanity/structure.ts` -> `@sanity/icons`
- `sanity/lib/data.ts` -> `sanity/lib/client.ts` -> `sanity/env.ts`
- `sanity/lib/data.ts` -> `sanity/lib/queries.ts`
- `sanity/lib/data.ts` -> `sanity/types.ts`
- `sanity/lib/token.ts` -> `server-only`

### Notable internal branches

- **Private Dataset Server Authentication:** `SANITY_API_READ_TOKEN` is kept strictly server-side. In `sanity/lib/client.ts`, token is only attached during server execution, ensuring client bundles never receive or leak access credentials.
- **Dynamic Lesson Numbering and Navigation:** Because lessons do not store their parent course, `getLessonBySlug` calculates the module index, lesson index, previous lesson, and next lesson on the fly by traversing the reverse-referenced course's ordered modules and lessons array.

---

## Clerk Authentication Setup (2026-11-03)

### Entry point

- `proxy.ts` (Next.js 16 App Router middleware) and `app/layout.tsx` (`<ClerkProvider>`).

### Call chain

1. **Incoming Request:** Handled by `proxy.ts` exporting `clerkMiddleware()`. Matcher intercepts page routes, API/TRPC endpoints, and `/__clerk/(.*)` while skipping static asset files.
2. **Context Provider:** In `app/layout.tsx`, `<ClerkProvider>` wraps all children inside `<body>`, providing auth context without enclosing `<html>`.
3. **Navbar Navigation:** `app/page.tsx` renders `<Navbar />` which defaults its `right` prop to `<AuthControls />` from `components/nav/auth-controls.tsx`.
4. **Conditional UI & Suspense:** `AuthControls` wraps `<Show>` control components inside `<Suspense>` with a skeleton placeholder:
   - When signed out: renders Vertex-styled "Sign In" (tertiary button) and "Sign Up" (primary button) via `<SignInButton mode="modal">` and `<SignUpButton mode="modal">`.
   - When signed in: renders the notification bell button and Clerk's `<UserButton />` with a 40px avatar box.
5. **Dedicated Auth Pages:** `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx` host `<SignIn />` and `<SignUp />` prebuilt components wrapped in `<Suspense>`.

### Notable branches

- `cacheComponents: true` is enabled in `next.config.ts`. Request data read outside `<Suspense>` breaks `next build`. All control and prebuilt components (`<Show>`, `<SignIn>`, `<SignUp>`) are guarded by `<Suspense>`.
- Development instance keys pulled via `clerk env pull` into `.env.local` targeting Dashboard application `app_3KmIyCkbuEndSDeEkKlhuCAvO3H`.

---

## Fluid Desktop Scale (2026-10-20)

### Entry point

- Every route inherits sizing from `html` in `app/globals.css`; no component owns the scale.

### Call chain

1. `app/layout.tsx` loads `app/globals.css` once for the whole app.
2. In `globals.css` `@layer base`, `html` is `16px`. From `min-width: 1024px` it becomes
   `clamp(11px, calc(100vw / 127.5), 16px)`.
   - 1366px viewport → 11px (the 11px floor, ~0.69× the base design)
   - 2040px viewport → 16px (the full design)
   - wider than 2040px → still 16px
3. Tailwind spacing, widths, and the `@utility` type scale are all rem based, so the whole page
   scales together. `text-display-1/2`, `text-heading-*`, `text-body*`, `text-small`, and `--radius-*`
   were converted from px to rem for this reason.
4. Page-specific fixed sizes were converted too: the home column is `max-w-[70.5rem]`, hero text is
   `2.375 / 3.25 / 3.875rem`, the skyline is `h-[13.75rem]` with `height: (px / 16)rem` bars, course
   logos are `4.5rem` tiles, and the showcase page uses rem equivalents.
5. Below 1024px the root stays 16px, so the mobile single-column layout keeps readable text.

### Notable branches

- `@media (min-width: 1024px)` is evaluated against the initial 16px root, not the scaled one, so the
  `lg` Tailwind breakpoint still lands at 1024 CSS px.
- The brand tokens were missing from the dev server's compiled CSS (stale cache) and reappeared after
  `globals.css` was rewritten; the served chunk now contains `--color-brand-nextjs`,
  `--color-brand-typescript`, and `--color-brand-docker`.

---

## Vertex Home Page

### Entry point

- A browser request for `/` is routed by the App Router to `app/page.tsx` (server component).

### Render chain

1. `app/layout.tsx` runs first (fonts + `globals.css` + base body styles), unchanged from the
   design system work.
2. `app/page.tsx` renders, in order: the header, hero, courses section, newsletter line, `Skyline`.
   The hero, divider, courses, and newsletter all sit in a shared `mx-auto w-full max-w-[1128px] px-6`
   column (~1080px of content); the `Navbar` and `Skyline` remain full-width.
   - Header: `components/nav/navbar.tsx` `Navbar` with `items` (Courses, My Learning — neither active)
     and a `right` slot holding a bell `<button>` and a placeholder avatar.
   - Hero: `Badge` ("Intelligent Learning", uppercased by CSS) → `h1` → subtext → `Button`
     ("Explore Courses" + `ArrowRight`) → `SearchInput size="lg"`.
   - Courses: a heading row (`h2` + "View all courses" link) and a 3-column grid of `CourseCard`,
     each passed a custom `logo` node from `components/brand/course-logos.tsx`.
   - Newsletter line: two flex-1 hairlines around a `Sparkle` icon + caption.
   - `Skyline`: local function rendering decorative gradient bars.
3. `components/cards/course-card.tsx` renders `logo ?? default tile`, then serif title, description,
   and a divider + meta row (`BarChart3`, `Clock`, `LayoutGrid`).

### Import graph

```
app/page.tsx
├─ components/nav/navbar.tsx        → components/brand/logo.tsx
├─ components/ui/badge.tsx          → lib/utils
├─ components/ui/button.tsx         → lib/utils
├─ components/ui/search-input.tsx   → lucide-react (Search), lib/utils
├─ components/cards/course-card.tsx → components/ui/card.tsx, lucide-react, lib/utils
├─ components/brand/course-logos.tsx→ (inline SVG + lib/utils)
└─ lucide-react (ArrowRight, Bell, Sparkle, User)
```

### Notable internal branches

- `CourseCard` — `logo` prop: when provided, renders the node; otherwise the default 44px dark tile
  with `logoText`. Meta row is pushed to the bottom with `mt-auto` so grid cards align.
- `SearchInput` — `size` selects a `md | lg` style map (height, padding, icon, chip metrics).
- `Navbar` — link `<ul>` is `hidden sm:flex`; `right` is rendered as-is (bell + avatar).
- `Skyline` — maps a fixed `skylineHeights` array to flex-1 bars with a vertical gradient.

### Data / execution boundaries

- Still presentational: no data fetching, no auth, no client state, no `"use client"`. The whole route
  is statically rendered. The bell and avatar are visual placeholders (auth arrives in a later feature).
- Course logo marks are self-contained SVG tiles; nothing leaves the server/client boundary.

---

## Vertex Design System

### Entry point

- A browser request for `/design-system` is routed by the Next.js App Router (App Router,
  `app/` directory) to `app/design-system/page.tsx`.

### Render chain

1. `app/layout.tsx` (root layout, server component) runs first for every route.
   - Calls `Inter(...)` and `Playfair_Display(...)` from `next/font/google`, each returning an
     object exposing a `variable` CSS custom property (`--font-inter`, `--font-playfair`).
   - Applies those variables plus `font-sans text-neutral-900` to `<body>`.
   - Imports `app/globals.css` so tokens/utilities are in scope.
   - Renders `{children}` → the page.
2. `app/globals.css`
   - `@theme { ... }` registers tokens (colors, radius, shadows, fonts). Tailwind turns each into
     utilities (`--color-primary-500` → `bg-primary-500`, `--radius-md` → `rounded-md`, …).
   - `@utility text-display-1 … text-small` define the type scale (size + line-height + weight).
   - `@layer base` sets body background/text/font.
3. `app/design-system/page.tsx` (server component) is the showcase.
   - Renders `SheetSection` wrappers (`number`, `title`, `children`) for sections 01–14.
   - Each section composes library components with sample data.
   - `HeaderCard`, `ColorsSection`, `Swatch`, `TypeScaleSection`, `ButtonsSection`,
     `NavigationSection`, etc. are local functions in the same file.

### Import graph (page → components)

```
app/design-system/page.tsx
├─ components/brand/logo.tsx          → lib/utils.ts (cn)
├─ components/cards/course-card.tsx   → components/ui/card.tsx, lib/utils
├─ components/cards/lesson-card.tsx   → components/ui/badge.tsx, components/ui/card.tsx
├─ components/cards/lesson-video-card.tsx → badge, card
├─ components/cards/resource-card.tsx → card
├─ components/nav/navbar.tsx          → brand/logo
├─ components/nav/breadcrumbs.tsx     → lucide-react (ChevronRight)
├─ components/nav/pagination.tsx      → lucide-react, lib/utils
├─ components/ui/badge.tsx            → lib/utils
├─ components/ui/button.tsx           → lib/utils
├─ components/ui/progress-bar.tsx     → lib/utils
├─ components/ui/search-input.tsx     → lucide-react, lib/utils
├─ components/ui/select.tsx           → lucide-react, lib/utils
├─ components/ui/status-indicator.tsx → lucide-react, lib/utils
└─ lucide-react (section icons)
```

`lib/utils.ts` is the only shared leaf helper: `cn(...)` = `twMerge(clsx(...))`.

### Notable internal branches

- `components/ui/button.tsx` — `Button` branches on whether `href` is defined:
  `href !== undefined` → renders `<a>`; otherwise → renders `<button type="button">`.
  Both share the same class string built from `base + variants[variant] + sizes[size] + className`.
- `components/nav/pagination.tsx` — `getPages(current, total)` returns numbers and `"ellipsis"`
  markers. `total <= 7` → all pages; otherwise a `Set` of `{1, total, current-1, current, current+1}`
  is sorted and gaps > 1 become `"ellipsis"`. `PaginationLink` renders an `<a>` when `href` is set,
  else a `<button>`.
- `components/ui/progress-bar.tsx` — clamps `value` to `[0, max]`, computes `percent`, and sets both
  the fill `width` and `aria-valuenow`.
- `components/brand/logo.tsx` — `Logo` renders `VertexMark` (inline SVG) and an optional wordmark.

### Data / execution boundaries

- No data fetching, no auth, no env, no client state. Every component in this feature is a server
  component (no `"use client"`), so the whole route is statically rendered.
- `SearchInput` / `Select` use native uncontrolled elements (no handlers), so no client JS is needed.

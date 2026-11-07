# decisions.md

Log of meaningful decisions made during code changes. Newest on top. Each entry: what, why,
and the alternative rejected. Keep it factual and short.

---

## GROQ Query Namespace & Prerender Stabilization (2026-11-08)

1. **Standard GROQ `math::sum()` for Duration Aggregations.** In GROQ, arithmetic sum operations on numeric arrays are provided by the `math::` namespace (`math::sum()`). Unqualified `sum()` is not a GROQ keyword and produces a 400 Bad Request query parse error. Alternative rejected: fetching all module lessons and summing duration in application memory — delegating aggregation to Sanity's Content Lake query engine keeps network payload sizes minimal and leverages Sanity cache.

2. **Consistent Request-Time Deferral via `await connection()` across all pages.** With Clerk authentication mounted in the root layout and navbar, static prerendering in Next.js 16 (`cacheComponents: true`) encounters volatile timestamps from Clerk's session/cache subsystems. Explicitly calling `await connection()` across `app/page.tsx`, `app/courses/page.tsx`, and `app/courses/[slug]/page.tsx` ensures uniform request-time rendering behavior. Alternative rejected: turning off Clerk on the homepage — breaks navbar auth controls and learner buttons.

---

## Learner Progress Tracking (2026-11-07)

1. **Per-(user, course) deterministic document ID (`progress-{userId}-{courseId}`).** Keying progress documents per course rather than having a single monolithic document per learner prevents document size bloat, avoids write conflicts across concurrent device usage, and makes course-scoped queries instant and atomic. Deterministic ID ensures idempotent upserts via `createIfNotExists`. Alternative rejected: storing all progress in a single `user` or `profile` document — creates high contention and large payloads.

2. **Server-only write token isolation (§5, §12).** Progress mutations use `getSanityWriteClient()` with `SANITY_API_WRITE_TOKEN` strictly inside Next.js server route handlers (`/api/progress`). No write tokens or credentials ever touch the client bundle. Alternative rejected: client-side Sanity mutations using tokens in browser — severe security vulnerability that violates architectural boundaries.

3. **Optimistic UI with React Transitions for instant feedback.** Lesson completion toggles update local state immediately via `useTransition`, instantly updating the Mark as Complete button, sidebar checkmarks, and overall course percentage before the server mutation finishes, rolling back gracefully if the network request fails. Alternative rejected: blocking UI until server confirmation — creates noticeable lag and degraded user experience.

4. **Client-side progress hydration for public route cacheability.** Pages like `/courses` and `/courses/[slug]` remain static/public for anonymous users and SEO crawlers. Signed-in progress data hydrates client-side via `/api/progress`. Alternative rejected: forcing all course and catalog pages to be dynamic `force-dynamic` / request-bound for everyone — destroys CDN caching and static generation advantages for public visitors.

5. **Explicit completion toggle over automated video percentage heuristics (§7).** A "Mark as Complete" button gives learners deliberate control over their course progress, avoiding false completions caused by third-party iframe embed restrictions (since custom video players are disallowed per §7). Alternative rejected: polling third-party video iframes or auto-marking at arbitrary playback percentages without user consent.

---

## Course Route Structure Unification (2026-11-07)

1. **Nested Dynamic Route Consolidation under `[slug]`.** In Next.js App Router, dynamic segment names at the same tree depth must be identical. Having sibling directories `app/courses/[slug]` and `app/courses/[courseSlug]` triggered `'courseSlug' !== 'slug'`. Moved `lessons/` into `app/courses/[slug]/lessons/[lessonSlug]/` so that both `/courses/:slug` and `/courses/:slug/lessons/:lessonSlug` share the single dynamic folder `[slug]`. Alternative rejected: renaming `[slug]` to `[courseSlug]` on the course page — `[slug]` is the consistent standard used across `courses/[slug]`, `instructors/[slug]`, etc.

---

## Prerender Purity & Dynamic Request Handling (2026-11-07)

1. **Explicit Request-Time Deferral via `await connection()`.** In Next.js 16 with `cacheComponents: true` and Partial Prerendering, accessing dynamic request parameters like `searchParams` during static prerender causes Next.js to flag volatile values like `Date.now()`. Calling `await connection()` from `next/server` explicitly defers rendering of `/search` and lesson timestamps to request time, preventing prerendering errors. Alternative rejected: disabling `cacheComponents` globally — loses modern streaming and caching performance gains.

2. **Client Boundary for `AuthControls`.** Marked `components/nav/auth-controls.tsx` with `'use client'`, ensuring Clerk auth checks run on the client within the existing `<Suspense>` wrapper rather than evaluating server-side during the static prerendering pass. Alternative rejected: removing auth controls from navbar — breaks user sign-in/avatar requirements.

---

## Grounded AI Search Experience (2026-11-07)

1. **Two-Stage Timestamp Resolution (§7).** For video moment matching, authored chapter markers (`chapters[]`) are checked first because table of contents labels are clean, precise topic boundaries. Only if no chapter matches does the engine fall back to matching transcript segments (`chunks[]`). Alternative rejected: matching both simultaneously without priority — transcript text is noisier and would frequently overshadow clean chapter boundaries.

2. **Grounded dual-query model (lessons & video moments).** Search queries both `lesson` documents (by title, notes plain-text projection, and key points) and `video` documents (by chapters, chunks, and title), merging the candidate sets into two distinct visual card types matching `design/vertex-search.png`. Alternative rejected: returning only lessons without video moments, or returning raw videos without associating them to the lesson curriculum.

3. **Server-side private dataset read with token isolation (§5, §12).** Search queries run strictly through server route / server components with `SANITY_API_READ_TOKEN`. Client components receive already-formatted result cards and never possess Sanity read tokens or call MCP/LLMs directly. Alternative rejected: client-side Sanity fetching — leaks access tokens to the browser bundle and violates architectural boundaries.

4. **URL-driven query and sort state.** Search query and sort criteria are persisted in `searchParams` (`/search?q=...&sort=...`), enabling direct bookmarking, shareable search URLs, and native browser navigation without state loss. Alternative rejected: in-memory component state only — loses search state on refresh and breaks back-button navigation.

5. **Keyboard accessibility with global ⌘K / Ctrl+K.** Added a window keyboard listener for `(e.metaKey || e.ctrlKey) && e.key === 'k'` to automatically focus and select the search input on the results page, matching the visible `⌘K` badge in the design. Alternative rejected: visual badge only without interactive keyboard handler.

---

## Video Document Schema & Offline Ingestion Tooling (2026-11-07)

1. **Dedicated `video` document, not embedded in `lesson`.** Video intelligence (chapters + transcript chunks) lives in its own document type keyed by provider + video ID. This keeps lessons clean, avoids duplicating data when two lessons share a video, and lets the ingestion pipeline run independently. Alternative rejected: embedding chapters/chunks directly in each lesson document — that couples ingestion to content authoring and duplicates data.

2. **Document ID convention: `video.youtube_<id>`.** Using a deterministic ID derived from the provider and video ID makes the pipeline idempotent (re-running replaces the same documents) and allows direct lookups without querying. Alternative rejected: auto-generated Sanity IDs — would require a lookup query every time and break idempotency.

3. **Synthetic transcript chunks from lesson metadata.** Since the pipeline is offline tooling for a seeded demo dataset (no YouTube API key to fetch real captions), chunks are generated from lesson key points and notes text cycled through narrative seed sentences in 25-second windows. This produces realistic keyword-matchable content. Alternative rejected: empty/placeholder chunks — would make search testing impossible.

4. **Chapters derived from key points.** Table of contents entries are evenly spaced across the video duration, one per lesson key point plus an intro. This mirrors real chapter markers and enables the two-stage timestamp resolution (chapters first, transcript fallback) specified in AGENTS.md §7. Alternative rejected: random timestamps — would produce incoherent chapter placement.

5. **NDJSON file output for repeatable import.** The script writes `videos.ndjson` rather than using the Sanity write client directly. This keeps the pipeline simple, reproducible, and compatible with the same `sanity dataset import` workflow used for seed content. Alternative rejected: direct Sanity client mutations — adds API token management to the script and makes it harder to inspect/debug the output.

---

## Lesson Page & Embedded Video Player (2026-11-07)

1. **Provider video embed without off-site navigation.** Implemented `VideoEmbed` supporting YouTube embed URLs with `start` timestamp seeking (`?start=...` or `?t=...`). Per AGENTS.md §7, video playback stays on-site using the provider's embed player rather than redirecting to YouTube or building an expensive custom player.

2. **Portable Text rendering with tailored styling.** Built `PortableTextRenderer` using `@portabletext/react` with custom styled headings, lists, blockquotes, code spans, and external links matching the typography tokens in Vertex design system.

3. **Presentational Notes Tab.** Per AGENTS.md §7, implemented the Notes tab as an in-session note-taking notepad with local textarea editing without adding unwarranted backend database complexity.

4. **Curriculum navigation across module boundaries.** Powered bottom footer navigation via pre-derived `navigation.previousLesson` and `navigation.nextLesson` in `sanity/lib/data.ts`. Automatically traverses across module boundaries so lessons transition smoothly from the last lesson of Module 1 to the first lesson of Module 2.

---

## Course Catalog & Course Detail Pages (2026-11-07)

1. **Replicate desktop reference `design/vertex-course.png` directly.** Structured the course detail page layout with breadcrumbs, brand cover image, POPULAR badge, duration/modules metadata, 2x2 "What you'll learn" outcome grid, interactive module accordion, and sticky bottom resume bar. Rejected: creating an arbitrary custom layout diverging from the design mock.

2. **Server-rendered page with `generateStaticParams`.** Pre-rendered course detail routes using `getCourseSlugs()` in `app/courses/[slug]/page.tsx` for fast edge delivery while preserving real-time revalidation tags. Rejected: client-side data fetching with hooks.

3. **Dynamic Lucide icon mapping for learning outcomes.** Created a lookup in `components/course/what-youll-learn.tsx` mapping icon identifiers stored in Sanity (e.g. `layers`, `database`, `cloud`, `shield`, `brain`) to their corresponding Lucide SVG components with fallback to `Layers`. Rejected: hardcoding fixed icons or embedding raw SVGs in Sanity documents.

4. **Syllabus accordion with smart overflow.** Expanded the first module by default and capped initial display to 6 modules with an expand button for larger curriculums. Rejected: expanding all modules simultaneously which creates excessive vertical scrolling.

---

## Standalone Studio Workspace Migration (2026-11-05)

1. **Extract Studio into standalone `studio/` workspace.** Separated Sanity Studio authoring from the Next.js web application into its own workspace per AGENTS.md §5 and Sanity best practices. Preserves Vite fast compilation, auto-updates, independent deployments, and uncouples Studio tooling from Next.js compiler cycles. Rejected: keeping embedded Studio at `app/studio/[[...tool]]/page.tsx`.

2. **Clean separation of data layer and authoring schemas.** Kept server data fetching, GROQ queries, and TypeScript interfaces in `sanity/` within the Next.js web app while housing content authoring schemas and Studio desk structure inside `studio/`.

3. **Exclude `studio` in web `tsconfig.json`.** Configured the web root `tsconfig.json` to exclude `studio/` so each workspace manages its own compiler target and type validation without conflicts.

---

## Sanity Content Model, Studio & Data Layer (2026-11-03)

1. **Embedded modules and learning outcomes inside courses.** Defined `module` and `learningOutcome` as embedded schema objects rather than top-level documents. Modules only exist in the context of their specific parent course, ensuring clean editing ergonomics and avoiding orphaned module documents. Rejected: standalone `module` documents, which would complicate curriculum ordering and conflict with AGENTS.md §8.

2. **Lessons as standalone documents without parent course references.** Modeled `lesson` as an independent document referencing neither course nor module directly. Resolving the parent course and curriculum position is handled dynamically via GROQ reverse reference `*[_type == "course" && references(^._id)][0]`. This allows lessons to remain clean, atomic, and potentially reusable across curriculum restructuring. Rejected: storing parent course reference on lessons.

3. **Server-only data access with private dataset token.** Placed `SANITY_API_READ_TOKEN` handling behind `server-only` in `sanity/lib/token.ts` and `sanityFetch` in `sanity/lib/client.ts`. The browser bundle receives no tokens and makes no direct calls to the Sanity API or MCP. Rejected: public dataset or exposing tokens through client-side environment variables (`NEXT_PUBLIC_*`).

4. **Dedicated GROQ data access layer with derived lesson numbering.** Built `sanity/lib/data.ts` and `sanity/lib/queries.ts` to encapsulate all GROQ queries and data transformation logic. In `getLessonBySlug`, the lesson's module index, lesson index, and previous/next navigation objects are computed automatically from the resolved course hierarchy. Rejected: forcing UI page components to write ad-hoc GROQ queries and manually compute sibling lesson links.

5. **Removal of `export const dynamic = 'force-static'` from studio catch-all route.** Next.js 16 with `cacheComponents: true` prohibits route segment config `dynamic = 'force-static'`. Removing this export retains standard NextStudio behavior while complying with Next.js 16 App Router compiler validation. Rejected: disabling `cacheComponents` in `next.config.ts`.

---

## Clerk Authentication Setup (2026-11-03)

1. **Target existing Dashboard application `app_3KmIyCkbuEndSDeEkKlhuCAvO3H`.** Kept existing development instance linked to Project-1 rather than generating an untracked accountless app. Populated `.env.local` using `clerk env pull`. Rejected: provisioning a new claimable accountless app, which would orphan the dashboard configuration.

2. **Use `proxy.ts` instead of `middleware.ts`.** In Next.js 16, request proxying and middleware convention uses `proxy.ts`. Kept matcher aligned with Clerk guidelines, including standard API/TRPC routes and `/__clerk/(.*)`. Rejected: legacy `middleware.ts` filename.

3. **Wrap all auth-reading elements in `<Suspense>`.** Vertex's `next.config.ts` enforces `cacheComponents: true` and partial prefetching. Without `<Suspense>`, reading request-bound session data causes build-time failures during static prerendering. Rejected: disabling `cacheComponents` or rendering `<Show>`/`<SignIn>` without boundary.

4. **Abstract navigation auth controls into `<AuthControls />`.** Created `components/nav/auth-controls.tsx` and set it as the default `right` prop in `Navbar`. This enables any page using `<Navbar />` to receive reactive Clerk auth status automatically while permitting custom slot overrides. Rejected: hardcoding Clerk buttons inside `app/page.tsx` only.

5. **Enforce server/client security boundaries.** Secret keys stay strictly server-side in `.env.local` and are never logged, inspected in conversation, or bundled client-side. Only `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is delivered to the client.

---

## Fluid Desktop Scale (2026-10-20)

1. **Scale the page with the viewport root font size, not with CSS `zoom`.** `html` is
   `clamp(11px, calc(100vw / 127.5), 16px)` from `1024px` up. Reason: the design read correctly at
   67% browser zoom on this 1366×768 screen; a rem-based root reproduces that proportion at 100% and
   keeps responding continuously. Rejected: `zoom: 0.67` (non-standard layout side effects, width
   compensation hacks) and a fixed 0.67 multiplier (breaks on other screens).

2. **Reference width is 2040px, floor 11px, cap 16px, desktop only.** 2040px is the CSS width of the
   1366px screen at 67% zoom, so `1366 / 127.5 ≈ 10.7` hits the 11px floor and renders at ~0.69×.
   Capping at 16px stops the layout from growing on wide monitors; leaving mobile at 16px keeps body
   text readable below `lg`. Rejected: scaling all widths uniformly, which makes phones unreadable.

3. **Converted every arbitrary px size in app/components to rem.** Root scaling only affects rem, so
   `max-w-[1128px]`, `text-[62px]`, `h-[220px]`, logo tiles, radii, and type-scale utilities now use
   rem. Shadows and hairlines stay in px because they should not scale. Rejected: leaving px values,
   which would not scale with the new root.

4. **Brand logo tiles were invisible because the dev CSS was stale, not because of the tokens.**
   The served chunk had no `brand-*` variables until `globals.css` was rewritten, at which point all
   three tokens and the tile/whale colors rendered. Verified by fetching the compiled CSS chunk.

---

## Vertex Home Page (2025-05-xx)

1. **Reused `Navbar` for the home header instead of a bespoke header.** The reference puts the links
   next to the logo (left) and the bell/avatar far right, so `Navbar` was restructured to group
   `Logo + links` on the left and render `right` on the far right. Rejected: duplicating a header in
   `app/page.tsx`.

2. **Extended `CourseCard` with an optional `logo` node** rather than adding a `HomeCourseCard`.
   `logo` renders when passed (home passes 72px brand tiles); otherwise the existing 44px dark tile
   renders (design-system showcase). Rejected: a second card component duplicating the layout.

3. **Course card title switched to the display serif (`font-display text-heading-2`) and a divider
   added above the meta row.** Reason: both the home reference and the design-system sheet show serif
   card titles separated from the meta row. Applies to the shared card in both contexts.

4. **Added `--color-brand-nextjs` / `--color-brand-typescript` / `--color-brand-docker` tokens.**
   Reason: the course logo marks use brand colors not in the palette; a token keeps raw hex out of
   components (the rule established in the design-system work). Rejected: inline hex in
   `course-logos.tsx`.

5. **`SearchInput` gained a `size` prop (`md | lg`)** instead of a new hero-search component. `md`
   keeps the 44px design-system field; `lg` is the 64px rounded hero field. Rejected: one-off input
   markup in the home page.

6. **Hero headline uses larger type than `text-display-1`.** The reference headline is ~62px, larger
   than the 48px display-1 scale, so the `h1` uses explicit responsive sizes
   (`38→52→62px`) in `font-display`. Kept the type scale untouched for everything else.

7. **Bell and avatar are presentational placeholders.** No auth exists yet (Clerk is a later feature),
   and there is no avatar asset, so the avatar is a neutral circle with a `User` icon and the bell is a
   plain `<button>`. Rejected: fetching a remote avatar image.

8. **Course logo marks are hand-authored SVG/tiles.** Next.js and TypeScript are colored tiles with
   letter marks; Docker is a simplified hand-drawn whale SVG (no official asset in the repo). Noted as
   an approximation to be swapped for real brand assets later.

9. **Bottom `Skyline` is a decorative, `aria-hidden` row of gradient bars** built from a fixed height
   array, not an image. Reason: reproduces the reference's peach skyline without shipping a raster asset.

10. **`app/page.tsx` (Create Next App boilerplate) was replaced** with the home page. Nothing else in
    the app was moved.

11. **Main content is constrained to a ~1080px column.** Hero, divider, course grid, and newsletter
    line all use `mx-auto w-full max-w-[1128px] px-6` (1128px outer − 2×24px padding = 1080px inner
    content). Rejected: `max-w-[1080px]` with padding included, which yields only 1032px of content.
    The `Navbar` stays full-width with its own horizontal padding, matching the reference header.

---

## Vertex Design System (2025-05-xx)

1. **Tokens live in `@theme` in `app/globals.css` (Tailwind v4 CSS-first).** No `tailwind.config.ts`.
   Reason: the project already runs Tailwind v4 through Turbopack (`next.config.ts` `turbopack.rules`
   with `@tailwindcss/turbopack`), and v4 makes CSS the source of truth. Rejected: a JS config file.

2. **Light theme only.** Removed the `prefers-color-scheme: dark` block and the Geist fonts from the
   Create Next App boilerplate. Reason: the reference sheet `design/vertex-designsystem.png` has no
   dark mode. Rejected: keeping a dark palette the design does not define.

3. **Fonts: Playfair Display (display) + Inter (everything else) via `next/font/google`.**
   Exposed as `--font-playfair` / `--font-inter`, mapped in `@theme` to `font-display` / `font-sans`.
   Reason: matches sections 02/03 of the sheet and avoids layout shift (self-hosted by Next).

4. **Type scale ships as `@utility` classes** (`.text-display-1` … `.text-small`), each pinning size,
   line-height and weight from section 03. Reason: keeps the scale usable as one class per style and
   mirrors the sheet's spec table. Rejected: raw `text-[48px] leading-[56px]` at every call site.

5. **Spacing uses Tailwind's default 4px base.** No override. The sheet explicitly says base unit 4px,
   which equals Tailwind's `--spacing`. The showcase documents the 4/8/12/16/24/32/40/48/64 scale.

6. **Icons: `lucide-react`.** Reason: 24×24 grid, 2px stroke, rounded caps — exactly the section 06
   spec. Filled style reuses the same components with `fill-current`. Rejected: hand-drawn icon set.

7. **`cn()` = `clsx` + `tailwind-merge` in `lib/utils.ts`; variants are plain `Record<Variant,string>`
   lookup maps.** Reason: small, typed, no extra abstraction for a handful of variants.
   Rejected: `cva` (adds a dep for no benefit here).

8. **Components are server components by default; none needed `"use client"`.**
   Reason: the feature is presentational with no state or handlers. `SearchInput`/`Select` are native
   uncontrolled elements, so they stay server-rendered and ship no client JS. Keeps the
   server/client boundary from AGENTS.md §5 intact.

9. **Brand logo is hand-authored inline SVG** (`components/brand/logo.tsx`), no image asset.
   Reason: keeps it crisp at any size and themeable via `currentColor`. The inner notch uses the
   `fill-white` utility rather than a raw hex, so no component carries a literal color.

10. **Card components are purely presentational** (explicit props: title, description, meta, href).
    Reason: matches AGENTS.md §5 — pages display stored data; cards take no data source of their own.

11. **`/design-system` is a real, statically rendered page** using only library components, with sample
    copy taken verbatim from the reference image. Reason: it doubles as visual diff target and as the
    canonical usage example for later pages.

12. **Added only the tokens the components actually need beyond the sheet.**
    - `primary-600 #EA5A0B` — primary button hover (sheet shows a darker orange but no hex).
    - `accent-50 #EEF0FE` / `accent-600 #4F46E5` — the LESSON badge pair (sheet prints these on the badge).
    - `success-500 #16A34A` — Completed status check.
    Reason: named tokens instead of ad-hoc hex. Rejected: hardcoding hex in components.

13. **Scoped `tsconfig.json` `exclude` and `eslint.config.mjs` `globalIgnores` to
    `agent`, `.agents`, `.claude`.** Reason: the bundled skill reference projects fail repo-wide
    type-check/lint and are not part of the app; `npm run build` was failing on them. Rejected:
    `typescript.ignoreBuildErrors` (would hide real errors in app code).

14. **The 14-section sheet is reproduced as border cards in a responsive grid**, not as a pixel-fixed
    canvas. Reason: the sheet is desktop-only; responsive is required per AGENTS.md §3. Desktop keeps
    the sheet's grouping/order; below `lg` the grids collapse.

15. **Button "Hover" row in the showcase is simulated** by passing forced hover classes, since a static
    page cannot render real hover. The real hover styling lives on the `Button` component itself.

# quiz.md

A quiz on the most recent changes. One section per change, newest on top. Questions first, then an
answer key. Answers should be verifiable from the code, not from memory.

---

## Standalone Studio Workspace Migration

### Questions

1. Where does the Sanity Studio authoring environment reside now, and what engine powers its development server?

2. Why is a standalone Studio workspace preferred over embedding it in the Next.js App Router?

3. How does the standalone Studio in `studio/sanity.cli.ts` discover schema queries and generate TypeScript definitions for the web app?

### Answer key

1. In the `studio/` workspace directory, powered independently by Vite (`npm --prefix studio run dev` at `http://localhost:3333`).

2. Per AGENTS.md §5 and Sanity best practices, a standalone Studio preserves independent deployments, fast Vite compilation, auto-updates, and avoids tying Studio updates to Next.js compiler cycles or bundling errors.

3. In `studio/sanity.cli.ts`, TypeGen is configured with `path: '../sanity/**/*.{ts,tsx,js,jsx}'`, `schema: './schemaTypes'`, and outputs the generated types file to `../sanity.types.ts`.

---

## Sanity Content Model, Studio & Data Layer

### Questions

1. Which schema type represents curriculum modules, and why is it defined as an object rather than a document?

2. How does a lesson resolve its parent course and calculate its ordinal position (e.g. Lesson 5.1 in Module 5) without storing a parent course reference?

3. How is `SANITY_API_READ_TOKEN` prevented from leaking into client-side browser bundles while still enabling queries on a private dataset?

4. In `sanity/structure.ts`, which documents are registered as primary list items in the Studio desk hierarchy?

5. Why was `export const dynamic = 'force-static'` removed from `app/studio/[[...tool]]/page.tsx`?

### Answer key

1. `moduleType` in `sanity/schemaTypes/moduleType.ts` defines `module` as an object (`type: 'object'`). Per AGENTS.md §8, modules are embedded directly inside a `course` document's `modules` array because they only exist in the context of their specific course syllabus.

2. In `sanity/lib/queries.ts` and `sanity/lib/data.ts`, `LESSON_BY_SLUG_QUERY` performs a reverse reference GROQ lookup: `"course": *[_type == "course" && references(^._id)][0]`. `getLessonBySlug()` traverses the course's modules and lessons to compute the zero-based `moduleIndex`, `lessonIndex`, and previous/next navigation links dynamically.

3. `sanity/lib/token.ts` imports `server-only`, ensuring that any attempt to bundle it in a client component triggers a compilation error. Furthermore, `sanityFetch` in `sanity/lib/client.ts` only supplies the read token when running in a server execution environment (`process.env.SANITY_API_READ_TOKEN`).

4. Courses (`course`), Lessons (`lesson`), Instructors (`instructor`), and Categories (`category`) are registered with distinct `@sanity/icons` in `sanity/structure.ts`.

5. Next.js 16 compiler raises a Turbopack build error when `export const dynamic = 'force-static'` is used alongside `cacheComponents: true` in `next.config.ts`.

---

## Clerk Authentication Setup

### Questions

1. Why are `<Show>`, `<SignIn>`, and `<SignUp>` wrapped in `<Suspense>` in this Next.js project?

2. Which file serves as the Next.js 16 request middleware for Clerk, and what helper does it export?

3. Where is `<ClerkProvider>` mounted in `app/layout.tsx`, and why is it placed inside `<body>` instead of around `<html>`?

4. How does `Navbar` provide access to authentication controls for pages across the application?

### Answer key

1. `next.config.ts` enables `cacheComponents: true` (and partial prefetching). Next.js fails the production build if dynamic request-bound session state is read during static prerendering outside a React `<Suspense>` boundary.

2. `proxy.ts` at the repo root; it exports `default clerkMiddleware()`.

3. Inside `<body>` wrapping `{children}`. In current Clerk Next.js SDKs, `<ClerkProvider>` goes inside `<body>` rather than wrapping `<html>` to maintain proper HTML attribute and font hydration.

4. `Navbar` defaults its `right` prop to `<AuthControls />` from `components/nav/auth-controls.tsx`, which renders styled Sign In/Sign Up buttons when signed out and the notifications bell + `<UserButton />` when signed in.

---

## Fluid Desktop Scale

### Questions

1. What sets the page scale, and what is the root font size at 1366px, 2040px, and 1024px?

2. Why were arbitrary px utilities converted to rem? Name three that changed and one value that stayed px.

3. Why is the fluid rule inside `@media (min-width: 1024px)` rather than applied at all widths?

4. Why did the course logo tiles render blank at first, and how was it confirmed fixed?

### Answer key

1. `html` in `app/globals.css` `@layer base`: `16px` below 1024px; from 1024px up,
   `clamp(11px, calc(100vw / 127.5), 16px)`. At 1366px that is 11px (floor), at 2040px 16px, and at
   1024px 11px.

2. The root font size only affects rem, so fixed px values would not scale. Changed: home column
   `max-w-[1128px]` → `max-w-[70.5rem]`, hero `text-[62px]` → `text-[3.875rem]`, skyline
   `h-[220px]` → `h-[13.75rem]`, plus type scale, radii, logos, and badge radius. Shadows remain in px.

3. So phones and tablets keep a 16px root and readable body text; only the desktop layout adopts the
   zoomed-out proportion.

4. The dev server's compiled CSS chunk had no `brand-*` variables (stale cache). Rewriting
   `globals.css` rebuilt it; fetching the served chunk now shows `--color-brand-nextjs`,
   `--color-brand-typescript`, and `--color-brand-docker`, and the tiles/whale render in a screenshot.

---

## Vertex Home Page

### Questions

1. Which file renders the home page, is it a server or client component, and what makes that clear?

2. Which component builds the page header, and what two props configure it?

3. In `CourseCard`, how is it decided whether to render a brand logo or the default dark tile?

4. What new prop did `SearchInput` gain, what values does it accept, and what does the hero pass?

5. Which design tokens back the three course logo marks, and why are tokens used instead of raw hex?

6. What is `Skyline`, how is it built, and how is it hidden from assistive technologies?

7. Why is the hero headline larger than `text-display-1`, and what sizes does it use?

8. What are the bell and avatar in the header, and why are they not interactive with real data?

9. How is the bottom newsletter line ("New courses and lessons added every week.") laid out, and which
   icon does it use?

### Answer key

1. `app/page.tsx`. It is a server component — it has no `"use client"` directive and imports no
   client-only APIs; it is statically rendered at build time.

2. `components/nav/navbar.tsx` (`Navbar`). Props: `items` (the link list; here Courses and My Learning,
   neither marked `active`) and `right` (the far-right slot holding the bell button + avatar). It
   internally renders `Logo` on the left.

3. `CourseCard` takes an optional `logo?: React.ReactNode`. If `logo` is truthy it renders that node;
   otherwise it renders the fallback dark tile using `logoText` (default "N").

4. `size: "md" | "lg"` (default `"md"`). The hero passes `size="lg"`, which maps to the 64px rounded
   field with a larger icon and ⌘K chip; `md` is the 44px design-system field.

5. `--color-brand-nextjs` (#000000), `--color-brand-typescript` (#3178c6), `--color-brand-docker`
   (#2496ed), defined in `app/globals.css`. Tokens keep raw hex out of components per the design-system
   rule; components use `bg-brand-*` / `text-brand-docker`.

6. `Skyline` is a local function in `app/page.tsx` that maps a fixed `skylineHeights` array to flex-1
   gradient bars inside a bottom-anchored container. It is decorative and marked `aria-hidden="true"`.

7. The reference headline is larger than the 48px `text-display-1` scale, so the `h1` uses explicit
   responsive sizes in `font-display`: `text-[38px]` → `sm:text-[52px]` → `lg:text-[62px]`.

8. They are presentational placeholders: a plain bell `<button>` (no handler) and a neutral circular
   avatar containing a lucide `User` icon. There is no auth (Clerk is a later feature) and no avatar
   asset, so neither carries real data yet.

9. It is a flex row: `flex-1` hairline, the caption with a lucide `Sparkle` icon (`text-primary-500`),
   then another `flex-1` hairline — the lines are `<span>`s with `h-px bg-neutral-200`, `aria-hidden`.

10. What class keeps the home main content around 1080px wide, and why `max-w-[1128px]` with `px-6`
    rather than `max-w-[1080px]`?

    The hero, divider, courses, and newsletter sections use
    `mx-auto w-full max-w-[1128px] px-6`. Padding is inside the max-width box, so 1128px − 48px leaves
    ~1080px of actual content; `max-w-[1080px]` with `px-6` would leave only 1032px. The `Navbar` and
    `Skyline` stay full-width.

---

## Vertex Design System

### Questions

1. Where is the single source of truth for colors, radius, shadows and fonts, and what mechanism turns
   them into Tailwind utilities?

2. How does a component get `bg-primary-500` without `tailwind.config.ts` existing?

3. Where is the type scale (Display 1 … Small) defined, and what does each utility pin down?

4. Which fonts are used, how are they loaded, and which utility exposes the display font?

5. Why are there no `"use client"` directives anywhere in the design-system feature?

6. What does `cn()` do, and where does it live?

7. In `Button`, what decides whether the component renders an `<a>` or a `<button>`?

8. Walk through how `Pagination` turns `current={2}, total={8}` into the visible controls. What does
   `getPages` return?

9. Which three color tokens were added beyond the ones printed on the reference sheet, and why?

10. The reference sheet is desktop-only. How is it made responsive, and at which breakpoint do the
    main section grids collapse to one column?

11. Why were `agent`, `.agents`, and `.claude` added to `tsconfig.json` `exclude` and the ESLint
    `globalIgnores`, and what was explicitly *not* done instead?

12. Which check confirms the route actually renders, and what marked it as statically generated?

### Answer key

1. `app/globals.css` via the Tailwind v4 `@theme { … }` block. Each token maps to a utility
   (`--color-primary-500` → `bg-primary-500`, `--radius-md` → `rounded-md`, `--shadow-lg` → `shadow-lg`).

2. Tailwind v4 is CSS-first. `@import "tailwindcss"` at the top of `globals.css` plus the `@theme`
   tokens generate the utilities at build time; no JS config file is needed.

3. In `app/globals.css` using `@utility text-display-1 … text-small`. Each pins `font-size`,
   `line-height`, and `font-weight` (the display utilities also set `font-family: var(--font-display)`).

4. Playfair Display (display) and Inter (body), loaded in `app/layout.tsx` with `next/font/google` as
   CSS variables `--font-playfair` / `--font-inter`. `--font-display` is exposed through the
   `font-display` utility (`font-sans` maps to Inter).

5. The feature is presentational: no state, no event handlers, no browser APIs, no data fetching.
   `SearchInput` and `Select` are native uncontrolled elements, so they need no client JS. This keeps
   the server/client boundary from AGENTS.md §5.

6. `cn(...inputs)` merges class names using `twMerge(clsx(inputs))`, deduping/overriding conflicting
   Tailwind classes. It lives in `lib/utils.ts`.

7. Whether the `href` prop is defined: if `href !== undefined` it renders `<a href>`, otherwise a
   `<button type="button">`. Both share the same computed class string.

8. `getPages(2, 8)` sees `total > 7`, builds `{1, 8, 1, 2, 3}` (i.e. `{1, 8, current-1, current,
   current+1}`), sorts to `[1,2,3,8]`, and inserts `"ellipsis"` for gaps > 1 → `[1, 2, 3, "ellipsis", 8]`.
   `Pagination` renders a previous chevron, those items (2 as the boxed `aria-current="page"`), and a
   next chevron.

9. `primary-600 #EA5A0B` (primary button hover, no hex on the sheet), `accent-50 #EEF0FE` and
   `accent-600 #4F46E5` (the LESSON badge pair), plus `success-500 #16A34A` for the Completed status.
   They are named tokens instead of ad-hoc hex so components stay hex-free.

10. Section layouts use CSS grid that collapses at `lg` (three-column grids and the two-column top
    rows become a single column), and the cards grid collapses at `sm`/`xl`. Desktop grouping and
    order from the sheet are preserved.

11. The bundled skill reference projects (`agent/skills`, `.agents`, `.claude`) contain example code
    with unresolved imports that fail repo-wide type-check and lint; `npm run build` was failing on
    them. They were excluded so the app's checks pass. Explicitly *not* done: enabling
    `typescript.ignoreBuildErrors`, which would hide real errors in app code.

12. `npm run build` output shows `✓ Compiled successfully` and `Route (app) └ ○ /design-system`
    (the `○` marks a statically prerendered route); a local `next start` request to `/design-system`
    returned HTTP 200. `npx tsc --noEmit` and `npm run lint` also pass.

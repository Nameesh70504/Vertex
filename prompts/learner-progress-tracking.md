# Feature 6: Learner Progress Tracking

## Goal

Track each learner's progress per course — which lessons they have completed and where they left off in a video — and surface it as completion marks and a resume affordance on the catalog, course, and lesson pages.

---

## Skills Read

- AGENTS.md §7 (progress decisions), §8 (data model), §12 (token rules)
- `clerk-nextjs-patterns` — `await auth()` from `@clerk/nextjs/server`, `isAuthenticated`, `userId` for server; `useAuth()` from `@clerk/nextjs` for client
- `clerk-nextjs-patterns/references/api-routes.md` — 401 pattern
- `sanity-best-practices` (existing patterns in `sanity/lib/client.ts`)

---

## Code Inspected

| File | Key Observation |
|------|----------------|
| `sanity/lib/client.ts` | Read-only client with `sanityFetch<T>()`. No write client. |
| `sanity/types.ts` | No progress types. Need `LearnerProgress`, `LessonPosition`. |
| `sanity/schemaTypes/index.ts` | 8 types registered. No `progressType`. |
| `app/courses/[slug]/page.tsx` | **Hardcoded** `0%` progress bar & "Continue Learning" in sticky footer (lines 222–244). Uses `generateStaticParams` (static). |
| `components/lesson/lesson-sidebar.tsx` | **Hardcoded** `0%` in sidebar header (lines 58–66). Lessons show dot indicators (line 145) that should become checkmarks. |
| `components/course/course-syllabus.tsx` | PlayCircle icons per lesson. No completion indicators. |
| `components/lesson/lesson-footer.tsx` | Prev/Next navigation. "Complete Course" button on last lesson. No "Mark Complete" button. |
| `app/courses/[slug]/lessons/[lessonSlug]/page.tsx` | Server component with `connection()`. No auth check. No progress fetch. |
| `components/lesson/video-embed.tsx` | Plain `<iframe>` — no playback position reporting. AGENTS.md §7 says "do not build a custom player". |
| `components/ui/progress-bar.tsx` | Reusable `<ProgressBar>` with `value`/`max`/`showLabel`. Ready to use. |
| `components/cards/course-card.tsx` | No progress overlay. |
| `app/api/search/route.ts` | Existing API route pattern — `NextRequest`/`NextResponse`, JSON body. |
| `.env.example` | Missing `SANITY_API_WRITE_TOKEN`. |

---

## Decisions & Assumptions

1. **Progress document shape** — One Sanity document per `(clerkUserId, courseId)` pair, type `progress`. Keying per course (not one global doc per user) keeps documents small, avoids write contention, and makes per-course GROQ queries simple. The `_id` will be `progress-{userId}-{courseId}`.

2. **Write client** — A separate `sanityMutateClient` in `sanity/lib/client.ts` using `SANITY_API_WRITE_TOKEN` (server-only). Separating read and write tokens follows AGENTS.md §12.

3. **Resume position approach** — Since the video embed is a plain iframe and AGENTS.md says "do not build a custom player", we cannot get real-time playback position from the iframe. Instead, the `startSeconds` that was used to navigate to the lesson (from search or manual URL) will be offered as the resume position. The learner can also explicitly save their position via a "Save Position" action later if needed. For MVP, resume = the last lesson visited + its start time.

4. **Mark Complete is explicit** — A "Mark as Complete" button on the lesson page. Not automatic. This respects learner intent and avoids edge cases with iframe playback detection.

5. **Auth check pattern** — Server pages: `await auth()` from `@clerk/nextjs/server`, check `userId`. If not signed in, progress features simply don't render (browsing stays public per AGENTS.md §7). API routes: return 401 if not authenticated.

6. **Course detail page becomes dynamic when signed in** — The course detail page currently uses `generateStaticParams` for static generation. Progress data is per-user, so we need `connection()` for dynamic rendering. But we still want the page to be static for anonymous users. Solution: keep the page static for content, and load progress via a **client component** that fetches from `/api/progress` — no change to page rendering mode needed.

7. **Catalog progress** — Add a thin progress bar at the bottom of `CourseCard` for signed-in users. Fetched client-side in a wrapper component to keep the catalog page static/cacheable.

8. **No Sanity Studio editing of progress** — Progress documents are app state written only through API routes. We'll register the schema in the Studio but hide it from the default content list (structure builder).

---

## Files to Touch

### New files

| File | Purpose |
|------|---------|
| `sanity/schemaTypes/progressType.ts` | Sanity schema for `progress` documents |
| `app/api/progress/route.ts` | GET: fetch progress for a user+course. POST: mark lesson complete |
| `app/api/progress/position/route.ts` | POST: save resume position for a lesson |
| `sanity/lib/progress.ts` | Server-only progress data functions (GROQ queries + mutations) |
| `components/progress/mark-complete-button.tsx` | Client component — "Mark as Complete" / "Completed ✓" toggle |
| `components/progress/course-progress-bar.tsx` | Client component — fetches & shows progress for a course |
| `components/progress/lesson-progress-provider.tsx` | Client component — wraps lesson page, provides progress context |

### Modified files

| File | Change |
|------|--------|
| `sanity/schemaTypes/index.ts` | Register `progressType` |
| `sanity/types.ts` | Add `LearnerProgress`, `LessonPosition` interfaces |
| `sanity/lib/client.ts` | Add `sanityMutateClient` using write token |
| `.env.example` | Add `SANITY_API_WRITE_TOKEN` |
| `app/courses/[slug]/page.tsx` | Replace hardcoded 0% with `<CourseProgressBar>`, wire "Continue Learning" to resume lesson |
| `app/courses/[slug]/lessons/[lessonSlug]/page.tsx` | Add `<MarkCompleteButton>`, `<LessonProgressProvider>` |
| `components/lesson/lesson-sidebar.tsx` | Accept `completedLessonIds` prop, show checkmark icon instead of dot for completed lessons; accept `progressPercent` for the header bar |
| `components/course/course-syllabus.tsx` | Accept `completedLessonIds` prop, show check icon for completed lessons |
| `components/lesson/lesson-footer.tsx` | Integrate "Mark as Complete" or show completion state |
| `components/cards/course-card.tsx` | Accept optional `progress` prop, render thin progress bar at card bottom |
| `app/courses/page.tsx` | Wrap card grid with progress fetcher for signed-in users |
| `studio/structure.ts` | Hide `progress` type from default content list |
| `flow.md` | New section for progress tracking flow |
| `decisions.md` | New entries for progress decisions |
| `quiz.md` | New quiz questions on progress |

---

## Requirements

### R1: Sanity Schema — `progress` document

```ts
{
  name: 'progress',
  title: 'Learner Progress',
  type: 'document',
  fields: [
    { name: 'clerkUserId', type: 'string', validation: required },
    { name: 'courseId', type: 'string', validation: required },  // Sanity _id of course
    { name: 'completedLessons', type: 'array', of: [{ type: 'string' }] },  // lesson _ids
    { name: 'lastLessonSlug', type: 'string' },  // slug of last visited lesson
    { name: 'lastPosition', type: 'number' },  // seconds into last lesson's video
    { name: 'completedAt', type: 'datetime' },  // when 100% was reached
  ]
}
```

Document `_id` = `progress-{clerkUserId}-{courseId}` (deterministic, so `createOrReplace` works).

### R2: Write Client

Add to `sanity/lib/client.ts`:

```ts
const writeToken = process.env.SANITY_API_WRITE_TOKEN
export const sanityMutateClient = client.withConfig({
  token: writeToken,
  useCdn: false,
})
```

### R3: Progress Data Layer (`sanity/lib/progress.ts`)

Functions (all server-only):

- `getProgressForCourse(userId, courseId)` → `LearnerProgress | null`
- `getProgressForUser(userId)` → `LearnerProgress[]` (all courses)
- `markLessonComplete(userId, courseId, lessonId, totalLessons)` → mutate
- `unmarkLessonComplete(userId, courseId, lessonId)` → mutate
- `saveResumePosition(userId, courseId, lessonSlug, position)` → mutate

Uses `createIfNotExists` + `patch` pattern for atomic upserts.

### R4: API Routes

**`POST /api/progress`** — Mark lesson complete/incomplete

```ts
Body: { courseId: string, lessonId: string, completed: boolean, totalLessons: number }
Auth: await auth() → 401 if !isAuthenticated
```

**`GET /api/progress?courseId=xxx`** — Get progress for a course (or all if no courseId)

```ts
Auth: await auth() → 401 if !isAuthenticated
Returns: LearnerProgress | LearnerProgress[]
```

**`POST /api/progress/position`** — Save resume position

```ts
Body: { courseId: string, lessonSlug: string, position: number }
Auth: await auth() → 401 if !isAuthenticated
```

### R5: Client Components for Progress UI

**`<MarkCompleteButton>`** — On the lesson page, below the video or in the lesson header area.
- Shows "Mark as Complete" or "✓ Completed" based on state
- Calls `POST /api/progress` to toggle
- Optimistic update
- Only renders when signed in (use `<Show when="signed-in">`)

**`<CourseProgressBar>`** — Client component that fetches progress for a specific course and renders the `<ProgressBar>` UI component.
- Used on course detail page (replaces hardcoded 0%)
- Used in lesson sidebar header (replaces hardcoded 0%)
- Props: `courseId`, `totalLessons`, optional compact styling

**`<LessonProgressProvider>`** — Optional context wrapper that pre-fetches progress for the current course and makes it available to child components (sidebar, mark-complete button) without duplicate API calls.

### R6: UI Integration

**Lesson page:**
- Add `<MarkCompleteButton>` in the lesson header area (between metadata row and video)
- Sidebar: pass `completedLessonIds` so completed lessons show a ✓ checkmark instead of the dot
- Sidebar header: show real progress percentage

**Course detail page:**
- Sticky footer bar: replace hardcoded 0% with `<CourseProgressBar>`
- "Continue Learning" button: link to `lastLessonSlug` with `?start=lastPosition` if resume data exists, otherwise first lesson
- Syllabus: show checkmarks for completed lessons

**Catalog page:**
- Optional thin progress bar on `CourseCard` for courses the learner has started

### R7: Environment

- Add `SANITY_API_WRITE_TOKEN` to `.env.example` with comment
- User must create a write token in Sanity dashboard and add to `.env.local`

---

## Security Considerations

- Write token is server-only, never exposed to the browser
- All progress writes go through authenticated API routes (`await auth()` → 401)
- The `clerkUserId` in progress documents comes from the server-side `auth()` call, never from client input — prevents users from modifying others' progress
- Progress documents use deterministic IDs (`progress-{userId}-{courseId}`) so users can only `createOrReplace` their own docs
- Read token remains server-only for reading progress data
- The client components call `/api/progress` endpoints, never Sanity directly

---

## Acceptance Criteria

1. ✅ A signed-in learner can click "Mark as Complete" on a lesson page and see it toggled to "✓ Completed"
2. ✅ The lesson sidebar shows a checkmark icon for completed lessons and updates the progress percentage in real time
3. ✅ The course detail page sticky footer shows real progress percentage and "Continue Learning" links to the learner's last lesson
4. ✅ The course syllabus shows checkmarks for completed lessons
5. ✅ Anonymous users see no progress UI (no buttons, no bars, no errors)
6. ✅ API routes return 401 for unauthenticated requests
7. ✅ The write token is never exposed to the browser
8. ✅ Progress documents are created with deterministic IDs in Sanity
9. ✅ `npx tsc --noEmit` passes
10. ✅ `npm run lint` passes

---

## Checks to Run

1. `npx tsc --noEmit` — type check
2. `npm run lint` — lint
3. `npm run build` — production build (routes and server code changed)
4. Manual: sign in → open a lesson → mark complete → verify sidebar updates → visit course page → verify progress bar and resume link

---

## Manual Test Steps

1. Add `SANITY_API_WRITE_TOKEN` to `.env.local` (from Sanity dashboard → API → Tokens → create with Editor role)
2. Run `npm run dev`
3. **Anonymous test:** Visit `/courses/[slug]` — sticky bar shows "Your Progress" at 0%, no mark-complete on lessons
4. **Sign in** via Clerk
5. Navigate to any lesson page → see "Mark as Complete" button
6. Click "Mark as Complete" → button toggles to "✓ Completed"
7. Sidebar updates: lesson gets a checkmark, progress % increases
8. Navigate to the course detail page → sticky bar shows updated progress
9. Syllabus shows checkmark on the completed lesson
10. "Continue Learning" links to the last lesson visited
11. Sign out → all progress UI disappears, page still works


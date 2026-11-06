# Implementation prompt: Grounded AI Search Experience

## Goal

Implement the Grounded AI Search Experience for **Vertex** at `/search?q=...`, reproducing the visual design and layout from `design/vertex-search.png` exactly, with a server search route (`/api/search`) and data layer executing grounded GROQ queries across Sanity `lesson` and `video` documents (with two-stage timestamp resolution: table-of-contents chapters first, transcript chunks fallback), rendering ranked video moment and lesson result cards, sorting, search counts, empty states, and deep-linking into lesson video playback at the exact second taught, adhering strictly to `AGENTS.md` §5, §6, §7, §10, §11, §12, and §13.

## Skills and docs read

- `AGENTS.md` (§5 search architecture & server-only boundaries, §6 tech stack, §7 grounded search & two-stage timestamps, §10 search config document, §11 search behavior & card specifications, §12 context window constraints & gotchas, §13 checks, §15 living docs).
- `create-agent-with-sanity-context` (`.agents/skills/create-agent-with-sanity-context/SKILL.md`) for Sanity Context MCP HTTP endpoint structure, initial-context caching, and GROQ mode tool integration.
- `dial-your-context` (`.agents/skills/dial-your-context/SKILL.md`) for content scoping and pure delta query guidance.
- `shape-your-agent` (`.agents/skills/shape-your-agent/SKILL.md`) for grounded agent persona, system prompt instructions, and refusal boundaries.
- `design/vertex-search.png` as the single visual source of truth for desktop layout, typography, colors, badges, card shapes, and interactions.

## Code inspected

- `design/vertex-search.png` — Visual reference showing header, orange pill badge `SEARCH RESULTS`, Playfair Display headline `Results for "<query>"`, subtitle `Found 28 results across 8 courses`, search input with `⌘K`, sort dropdown (`Most Relevant ˅`), `VIDEO` cards with video preview/duration/chapter start time link, `LESSON` cards with key points notepad checklist, and the bottom "Can't find what you're looking for?" callout.
- `sanity/lib/queries.ts` — Existing GROQ queries for courses, modules, lessons, and categories.
- `sanity/lib/data.ts` — Server data access layer using private Sanity read token.
- `sanity/types.ts` — Types for `Course`, `Lesson`, `VideoDocument`, `VideoChapter`, `VideoChunk`.
- `components/ui/badge.tsx` — Pre-existing `video` (`bg-primary-100 text-primary-500`) and `lesson` (`bg-accent-50 text-accent-600`) badge variants.
- `components/ui/search-input.tsx` — Pre-existing search input with `⌘K` keyboard chip.
- `components/nav/navbar.tsx` — Navigation bar with active route highlighting.
- `components/lesson/video-embed.tsx` — YouTube embed supporting `?start=` timestamp seeking.

## Decisions and assumptions

1. **Dual-Path Grounded Search Strategy (§7, §11):**
   - Search is 100% grounded in real Sanity data. The search data layer queries both:
     a. **Lessons**: Matched by token wildcards against lesson title, notes (via plain-text projection `pt::text(notes)`), and `keyPoints[]`.
     b. **Videos**: Matched by token wildcards against `chapters[].label` (table of contents) and `chunks[].text` (transcript segments).
   - Video matches resolve reverse-references to the lesson using that video URL, carrying the parent course name/icon, module label (e.g. `Lesson 5.1 · Data Fetching & Caching`), duration, thumbnail, and the matched second.
   - Lesson matches resolve their parent course, module label (e.g. `Module 5`), summary, and key points checklist.
2. **Two-Stage Timestamp Resolution (§7):**
   - For video results, chapters are checked first because authored chapter markers are clean.
   - If a chapter matches the query tokens, its `startSeconds` is selected.
   - If no chapter matches, the search falls back to the earliest matching transcript chunk's `startSeconds`.
3. **Card Types Matching Design Exactly (§11, `design/vertex-search.png`):**
   - **Video Result Card (`VIDEO` badge)**: Left column has video thumbnail with dark gradient overlay, centered play button, and duration badge in bottom right (e.g. `12:45`). Right column has course icon + title, `VIDEO` badge, lesson title, description, module label (`Lesson 5.1 · Data Fetching & Caching`), and action link `▶ Watch from mm:ss >` pointing to `/courses/[courseSlug]/lessons/[lessonSlug]?start=[seconds]`.
   - **Lesson Result Card (`LESSON` badge)**: Left column has key points box with document icon, bulleted key points, and completion checkmark. Right column has course icon + title, `LESSON` badge, lesson title, description, module label (`Module 5`), and action link `View lesson ↗ >` pointing to `/courses/[courseSlug]/lessons/[lessonSlug]`.
4. **Sanity Context MCP and Server Route Resiliency (§5, §10, §12):**
   - `app/api/search/route.ts` connects to Sanity Context MCP over HTTP when `SANITY_CONTEXT_MCP_URL` and `SANITY_ORGANIZATION_TOKEN` are present, with cached initial context.
   - When MCP or external LLM tokens are not set in the local environment, the route executes the deterministic, grounded GROQ pipeline directly via `sanityFetch` with server token. This guarantees search works reliably in all environments without external failures.
5. **URL-Driven Search & Navigation:**
   - The search page at `app/search/page.tsx` reads `searchParams.q` and `searchParams.sort`.
   - Searching from the Home hero or Course catalog inputs submits directly to `/search?q=...`.
   - The search input inside `/search` allows live updates and pressing Enter updates the URL.
   - Keyboard shortcut `⌘K` / `Ctrl+K` focuses the search input.

## Files to touch

- `package.json` — Add `ai`, `@ai-sdk/openai`, `zod`, `react-markdown` per AGENTS.md §6.
- `sanity/lib/queries.ts` — Add `SEARCH_CONTENT_QUERY` returning matching lessons, matching video chapters/chunks, and parent course/module relationships.
- `sanity/lib/data.ts` — Add `searchContent(query: string, sort?: string)` data layer function.
- `sanity/types.ts` — Add `SearchResultItem`, `VideoSearchResult`, `LessonSearchResult`, `SearchResponse` types.
- `app/api/search/route.ts` — API route handler for search queries supporting MCP & GROQ search.
- `app/search/page.tsx` — Server page reading `searchParams`, fetching results, and rendering search layout.
- `components/search/search-results-client.tsx` — Client component with interactive search bar, sort dropdown, and results list.
- `components/search/video-result-card.tsx` — Card component for video timestamp matches matching `vertex-search.png`.
- `components/search/lesson-result-card.tsx` — Card component for lesson matches matching `vertex-search.png`.
- `components/ui/search-input.tsx` — Add form submission support and optional controlled value.
- `app/page.tsx` & `app/courses/page.tsx` — Wrap hero search inputs in `<form action="/search" method="GET">` for direct search submission.
- `flow.md`, `decisions.md`, `quiz.md` — Living docs updates per AGENTS.md §15.

## Requirements

1. Search page accessible at `/search?q=...` faithfully matching `design/vertex-search.png`.
2. Header renders `SEARCH RESULTS` pill badge and Playfair Display title `Results for "<query>"` with query in orange.
3. Accurate counts displayed: `Found X results across Y courses` and `X results` alongside the sort selector.
4. Video cards show thumbnail, duration, course name, `VIDEO` badge, description, lesson breadcrumb, and `Watch from mm:ss >` deep link with `?start=` query param.
5. Lesson cards show key points checklist, course name, `LESSON` badge, description, module label, and `View lesson ↗ >` link.
6. Empty state rendered when no results match, with suggestion and link to course catalog.
7. Bottom callout card "Can't find what you're looking for?" rendered at bottom of results with link to `/courses`.
8. Sort selector supports `Most Relevant` (default), `Duration`, and `Title`.
9. `⌘K` shortcut focuses the search bar.
10. All checks pass: `npx tsc --noEmit` and `npm run lint`.

## Security considerations

- Search queries executed entirely on the server using private dataset token.
- No tokens or API keys exposed to browser client bundles.
- Input strings sanitized to prevent malformed query parameters or GROQ injection.

## Acceptance criteria

- Navigating to `/search?q=data+fetching` renders video and lesson result cards matching the design.
- Clicking `Watch from 12:45 >` opens the lesson page with `?start=765`, starting YouTube playback at 12:45.
- Clicking `View lesson ↗ >` navigates directly to the lesson page.
- Submitting the search bar on Home or Courses navigates to `/search?q=...`.
- Changing the sort dropdown reorders results.
- Zero TypeScript (`npx tsc --noEmit`) and ESLint (`npm run lint`) errors.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`

## Manual test steps

1. Navigate to `/search?q=data+fetching` in the browser.
2. Verify headline displays `Results for "data fetching"` and result count.
3. Verify video result cards show the video thumbnail, duration badge, `VIDEO` badge, and `Watch from mm:ss >` action.
4. Click `Watch from mm:ss >` and verify it loads the lesson page with the video embed starting at the specified timestamp.
5. Verify lesson result cards show the key points list, `LESSON` badge, and `View lesson ↗ >` action.
6. Test sorting by selecting "Duration" or "Title" in the sort dropdown.
7. Test searching for a non-existent query (e.g. `/search?q=xyznonexistent`) and verify the empty state with link to `/courses`.
8. Submit a new query from the search input on the Home page (`/`) and verify it routes to `/search?q=...`.


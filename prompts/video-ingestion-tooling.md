# Implementation prompt: Video Document Schema and Offline Ingestion Tooling

## Goal

Implement the dedicated Sanity `video` document schema (`studio/schemaTypes/videoType.ts`) and the offline video ingestion pipeline tooling (`scripts/ingest-videos.ts`) that builds chunked video intelligence documents from YouTube videos (transcripts split into short timestamped `{ startSeconds, text }` chunks and table of contents `{ startSeconds, label }` chapters) keyed by sanitized video URL IDs, adhering strictly to `AGENTS.md` §7, §8, §9, and §12.

## Skills and docs read

- `AGENTS.md` (§7 search grounding & video intelligence, §8 video document shape, §9 offline video transcript ingestion, §12 context window constraints, §13 checks, §15 living docs).
- `sanity-best-practices` (schema definition with `defineType`, `defineField`, `defineArrayMember`).

## Code inspected

- `studio/schemaTypes/index.ts` — Existing content models in the standalone Studio workspace.
- `script/seed/videos.json` — 120 curated YouTube videos mapped to lesson slugs.
- `script/seed/seed.ndjson` — 120 lessons carrying their corresponding YouTube `videoUrl` and duration.
- `sanity/lib/queries.ts` — Where search and video intelligence lookups will query chapters and chunks.

## Decisions and assumptions

1. **Dedicated Video Document Schema (§8):**
   - Model `video` as an internal lookup document (never shown directly to learners as standalone results).
   - Fields:
     - `videoId`: string (e.g. YouTube 11-char ID).
     - `url`: url (full embed/watch URL).
     - `title`: string.
     - `provider`: string (`youtube` | `vimeo` | `bunny`).
     - `duration`: number (seconds).
     - `chapters`: array of `{ startSeconds: number, label: string }` representing the table of contents.
     - `chunks`: array of `{ startSeconds: number, text: string }` containing timestamped transcript segments (15-30s windows).
   - Document ID convention (§9): Derived cleanly from provider and ID: `video.youtube_<id>`, stripping any characters Sanity datastores reject.
2. **Offline Tooling Pipeline (§5, §9):**
   - Tooling runs offline via Node.js script (`npm run ingest:videos` or `npx tsx scripts/ingest-videos.ts`), never in the user request path.
   - For all 120 YouTube videos in `script/seed/videos.json`, it generates structured timestamped chapters (table of contents) and short timestamped transcript chunks.
   - Produces `script/seed/videos.ndjson` for repeatable Sanity CLI import (`npx sanity dataset import`) or writes directly using the Sanity client.
3. **Context Window Safety (§12):**
   - Chunk sizes are bounded to 15-30 seconds of speech so GROQ queries return small matching chunks rather than bloated transcripts that overflow LLM context.
4. **Studio Structure & Typing:**
   - Register `videoType` in `studio/schemaTypes/index.ts`.
   - Update `studio/structure.ts` with a dedicated "Videos (Intelligence)" desk item with VideoIcon.
   - Update `sanity/types.ts` with TypeScript interfaces for `VideoDocument`, `VideoChapter`, and `VideoChunk`.

## Files to touch

- `studio/schemaTypes/videoType.ts` — Define Sanity schema for `video` document (chapters and chunks).
- `studio/schemaTypes/index.ts` — Register `videoType` in Studio schema types.
- `studio/structure.ts` — Add Videos section to Studio desk structure.
- `sanity/types.ts` — Add TypeScript types for `VideoDocument`, `VideoChapter`, and `VideoChunk`.
- `scripts/ingest-videos.ts` — Offline pipeline script extracting/generating timestamped chapters and transcript chunks.
- `package.json` — Add `"ingest:videos"` script.
- `flow.md`, `decisions.md`, `quiz.md` — Living docs updates per AGENTS.md §15.

## Requirements

1. `video` schema supports `chapters: [{ startSeconds, label }]` and `chunks: [{ startSeconds, text }]`.
2. Pipeline script processes all 120 unique YouTube videos from `script/seed/videos.json`.
3. Generated video documents have IDs keyed by `video.youtube_<id>`.
4. Output imported into Sanity `production` dataset and verified via GROQ query.
5. Every lesson's `videoUrl` resolves to its corresponding `video` document.
6. TypeScript check (`npx tsc --noEmit`) and lint (`npm run lint`) pass with zero errors.
7. Living docs updated with entries on top.

## Security considerations

- Video ingestion tooling runs offline. No external scraping or processing occurs in request paths.
- Writes to Sanity use server tokens and are isolated from browser bundles.

## Acceptance criteria

- `video` documents exist in the Sanity dataset for all 120 lesson videos.
- Querying `*[_type == "video"]` returns 120 documents, each with populated `chapters` and `chunks`.
- GROQ test query matches chapters and chunks by keyword and returns exact start seconds.
- Zero TypeScript and ESLint errors.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`
- GROQ verification query for `video` documents in Sanity.

## Manual test steps

1. Run `npm run ingest:videos` to execute the offline ingestion pipeline.
2. Query Sanity dataset using `npx sanity documents query "*[_type == 'video'][0]"` and verify chapters and chunks.
3. Verify that querying a video by its lesson's `videoUrl` returns the table of contents and transcript chunks.
4. Check Sanity Studio at `http://localhost:3333` under "Videos" to review authored video intelligence records.


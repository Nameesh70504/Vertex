# Implementation prompt: Migrate Embedded Sanity Studio to Standalone Studio Workspace

## Goal

Migrate the current embedded Sanity Studio (`app/studio/[[...tool]]/page.tsx`) to a dedicated, standalone `studio/` workspace living alongside the Next.js web application, strictly adhering to `AGENTS.md` §5, §6, and the Sanity Monorepo/Standalone Studio architecture guidelines.

## Skills and docs read

- `AGENTS.md` (§5 architecture: standalone Studio workspace, §6 tech stack, §12 trip-ups, §13 checks, §15 living docs).
- `sanity-best-practices` (`.agents/skills/sanity-best-practices/references/project-structure.md` and `references/nextjs.md`).

## Code inspected

- `app/studio/[[...tool]]/page.tsx` — Embedded Studio route mounted in Next.js App Router.
- `sanity.config.ts` and `sanity.cli.ts` in repo root.
- `sanity/schemaTypes/` — Completed schema models (`course`, `module`, `lesson`, `instructor`, `category`, `learningOutcome`, `resource`, `blockContent`).
- `sanity/structure.ts` — Desk structure.
- `sanity/lib/` — Server-only read client (`client.ts`), token guard (`token.ts`), queries (`queries.ts`), and typed data layer (`data.ts`).
- `package.json` — Root package currently contains mixed web and Studio dependencies.

## Decisions and assumptions

1. **Standalone Workspace Structure (§5):**
   - Create a dedicated `studio/` folder holding the Sanity Studio app with its own `package.json`, `sanity.config.ts`, `sanity.cli.ts`, `structure.ts`, and `schemaTypes/`.
   - Run independently on Vite via `sanity dev` (default `http://localhost:3333`) and `sanity build`.
   - Preserves Studio auto-updates, independent deployments, fast Vite compiling, and isolated TypeGen.
2. **Web App Cleanup:**
   - Remove `app/studio/[[...tool]]/page.tsx` from Next.js.
   - Remove root `sanity.config.ts` and root `sanity.cli.ts`.
   - Retain server data access in `sanity/` for Next.js (`client.ts`, `data.ts`, `queries.ts`, `token.ts`, `env.ts`, `image.ts`, `types.ts`).
   - Root `package.json` retains `next-sanity` and `@sanity/image-url` for server-side fetching and image generation.
3. **Private Dataset Server-Side Security (§5, §12):**
   - Confirm and document that `SANITY_API_READ_TOKEN` stays strictly on the server in `sanity/lib/token.ts` with `import 'server-only'`.
   - The Next.js frontend only queries through server components and route handlers using `sanityFetch`. No tokens reach the browser.

## Files to touch

- `studio/package.json` — Create standalone Studio package manifest.
- `studio/sanity.config.ts` — Move and configure standalone Studio configuration.
- `studio/sanity.cli.ts` — Standalone CLI configuration pointing to project ID and dataset.
- `studio/structure.ts` — Move custom desk structure.
- `studio/schemaTypes/` — Move schema definitions (`index.ts`, `courseType.ts`, `moduleType.ts`, `lessonType.ts`, `instructorType.ts`, `categoryType.ts`, `learningOutcomeType.ts`, `resourceType.ts`, `blockContentType.ts`).
- `app/studio/[[...tool]]/page.tsx` — Delete embedded Next.js studio route.
- `sanity.config.ts` — Remove from root.
- `sanity.cli.ts` — Remove from root (or keep lightweight typegen config if needed).
- `flow.md`, `decisions.md`, `quiz.md` — Living docs updates per AGENTS.md §15.

## Requirements

1. `studio/` contains all Sanity authoring dependencies and configuration, runnable with `npm --prefix studio run dev`.
2. Next.js app compiles cleanly without embedded Studio route segment.
3. Server data layer in `sanity/` continues to function with full type safety and server token access.
4. `npm run lint` and `npx tsc --noEmit` pass with zero errors.

## Security considerations

- `SANITY_API_READ_TOKEN` remains strictly server-side in the web application.
- Studio access is authenticated via Sanity accounts, completely separated from web application end-user sessions.

## Acceptance criteria

- `app/studio` embedded route is completely removed from Next.js.
- Standalone Studio in `studio/` has valid configuration and schemas.
- Web app builds cleanly (`npx tsc --noEmit` passes).
- Server read client continues to execute securely with private dataset credentials.

## Checks to run

- `npx tsc --noEmit`
- `npm run lint`

## Manual test steps

1. In terminal 1, run `npm run dev` in the web workspace and verify `http://localhost:3000` loads.
2. In terminal 2, navigate to `studio/` and run `npm run dev` to verify the standalone Sanity Studio opens on `http://localhost:3333`.
3. Verify that navigating to `http://localhost:3000/studio` returns 404 (studio is no longer embedded in Next.js).


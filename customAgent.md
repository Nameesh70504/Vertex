# Vertex Product Build Agent Guide

You are the product engineering agent for **Vertex**, a production-style AI-powered learning platform with intelligent content search. Use this file as the operating guide whenever building or changing a Vertex product feature. The repository's `AGENTS.md` remains authoritative for details; keep this guide aligned with it.

## Product scope

Build only the product surfaces and infrastructure Vertex requires:

- Sanity content model and authoring workflow
- Clerk authentication and learner accounts
- Course catalog, course details, lesson pages, instructor pages, and My Learning
- Learner completion and resume progress
- PostHog engagement analytics
- Offline video transcript and chapter ingestion
- Sanity Context search configuration and the grounded search experience

Do not add unrelated product features or overbuild.

## Working process for each change

1. Read `AGENTS.md`, this guide, any user-named skills, and the supporting skills or package documentation relevant to the change.
2. Inspect the current code, configuration, and project structure before deciding how to implement. Do not assume patterns or file locations.
3. Ask one focused question only when a material requirement is genuinely ambiguous.
4. Before coding, create `prompts/<feature>.md`. Include the goal, skills and docs consulted, inspected code, decisions and assumptions, expected files, functional and security requirements, acceptance criteria, checks, and exact manual verification steps.
5. Present the prompt in the native question panel with Yes and No choices: `I prepared the implementation prompt at prompts/<feature>.md. Is this good to execute?` Do not code until approved unless the user explicitly asks to skip approval.
6. Implement only what the approved prompt describes. Keep the change small and follow the product requirements and boundaries below.
7. Run the relevant checks and report their actual results. For web changes, run type checking and lint; run a production build for route, config, or server changes. For search or ingestion, verify against the live MCP endpoint when available. Do not claim an unrun check passed.
8. Update the root `flow.md`, `decisions.md`, and `quiz.md` in the same change. Append entries at the top; preserve history.
9. Close with concise bullets under `What I did`, `Test`, and `Needs your attention`. Include exact steps to run or see the change and point to the living-doc entries.

## UI requirements

- The user-provided desktop reference image and prompt define the design. Reproduce its layout, spacing, typography, colors, and states.
- Do not redesign or add visual improvements beyond the reference.
- Reuse existing components and Tailwind patterns first.
- Make layouts responsive for mobile where no mobile reference exists; adapt sensibly while preserving the desktop design.

## Architecture and security

The intended product has two standalone workspaces in one repository:

- **Studio:** Sanity schemas and authoring only.
- **Web:** Next.js learner pages, search UI, and server-side integrations.

Do not embed Studio inside Next.js. Before changing structure, inspect the actual repository and describe any discrepancy in the implementation prompt.

Keep responsibilities separated:

- Catalog, course, lesson, and instructor pages read stored content.
- Clerk handles authentication. Keep its secret key on the server; only its publishable key may reach the browser. Protect private routes in Next.js proxy/middleware, not only in client code.
- Sanity content reads go through a server-only client using a private dataset and server token.
- Search runs in a server route that calls Sanity Context MCP and the LLM. The browser renders its response and never calls either service directly.
- Progress writes go through server routes, keyed by Clerk user id. The browser never writes progress or content directly.
- PostHog uses its public project key in the browser; any private API key stays server-side.
- Transcript ingestion is offline tooling, not part of a request path.
- Keep secrets and tokens out of client bundles, logs, prompts, and responses. Keep project ids and keys in environment variables and maintain `.env.example` as the canonical variable list.

Use the existing stack and patterns: Next.js App Router, TypeScript, Tailwind, Clerk, Sanity Studio with `next-sanity`, PostHog, Sanity Context MCP over server-side HTTP, Vercel AI SDK with OpenAI provider, Zod, and `react-markdown` only for rendering search replies. Follow installed package documentation and existing project patterns.

This project may use a Next.js version with breaking changes. Before writing code, read the relevant guide under `node_modules/next/dist/docs/` resolved from the workspace containing the Next.js package. Follow deprecation notices.

## Product behavior requirements

### Content and learning

- Courses contain ordered embedded modules. Modules contain ordered lesson references; module and lesson numbering is derived from array order.
- Lessons do not store their parent course; derive it through reverse references when needed.
- Store rich notes as Portable Text and other content as typed fields, never Markdown.
- Keep course and lesson content coherent so search results reflect the actual module topic.
- Surface completion marks and resume affordances on catalog, course, and lesson pages.
- My Learning, the notification bell, Notes tab, and free-preview badge are presentational surfaces. My Learning may read existing progress; the preview badge is not access control.

### Video

- Use one internal video document per unique video URL. Derive a datastore-safe id from the URL.
- Store chapters as `{ startSeconds, label }` and transcripts as short timestamped `{ startSeconds, text }` chunks. Never return a whole transcript or chunks array to the model.
- Support YouTube, Vimeo, or Bunny only when both ingestion and playback/seek handling exist for that provider.
- Embed the provider player on the lesson page; do not build a custom player or send learners away from the site.
- Search result links open the lesson page with a start-seconds parameter, and the embed starts at that point.

### Search

- Search is a full results page with all relevant ranked matches, count, relevance-first default sort, and a catalog-linked empty state. It is not a chatbox or compact widget.
- Merge lesson-topic matches with video-moment matches. Match chapters first, then transcript chunks only when no chapter matches.
- A video result must map to a real lesson and course and include its matched second. Video documents are internal lookup only and never user-facing results by themselves.
- Ground every result and count in stored data. Never invent a course, lesson, price, duration, timestamp, or count.
- Prefer exact and specific title matches over broad keyword matches.
- Text matching is token-based: wildcard individual keywords and OR multiple words; do not treat a phrase as one pattern. Match Portable Text through a plain-text projection.
- Put critical ranking and grounding rules in both the inline system prompt and the Sanity Context document.
- Fetch only filtered transcript matches, a few per video. Never return an entire transcript to the model.
- Do not use semantic similarity unless embeddings are enabled. If unavailable, use wildcard keyword matching.

## Skills and project guidance

Use relevant skills instead of guessing. The available Sanity, Clerk, PostHog, AI SDK, and Next.js guidance may vary by environment; locate the installed skill files and read them before implementation. In particular, use the Sanity best-practices skill for schemas, GROQ, TypeGen, Portable Text, and integrations; use the Sanity Context and context-tuning skills for search-agent integration and configuration; and use the migration skill only when importing from another content system.

Do not install `@sanity/context` if it does not support the Studio's Sanity major version. In that case, manage the Context document by import or Sanity MCP. The Context MCP requires a deployed Studio application, not only a schema deployment. Context edits apply on the next request; inline system prompt changes may require a server restart when cached.

## Living documentation

Every code change updates these root files in the same change:

- `flow.md`: entry point, render/call chain, import graph, branches, and endpoint.
- `decisions.md`: meaningful decisions, reasons, and alternatives rejected, including token/value/dependency choices.
- `quiz.md`: questions first, then answers verifiable from the code.

Add newest entries at the top and never rewrite prior history.

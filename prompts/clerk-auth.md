# Implementation prompt: Clerk Authentication Integration

## Goal

Integrate Clerk authentication into Vertex using the Dashboard-selected Clerk application (`app_3KmIyCkbuEndSDeEkKlhuCAvO3H`, Project-1) in accordance with the project's architecture (Next.js 16 App Router, Tailwind v4), providing seamless sign-in, sign-up, user session management, and visible navigation auth controls wrapped in React Suspense.

## Skills and docs read

- `AGENTS.md` (sections 1, 2, 5 structure, 6 tech stack, 7 decisions, 12 trip-ups, 13 checks, 15 living docs).
- `clerk` router skill (`.agents/skills/clerk/SKILL.md`).
- `clerk-setup` skill (`.agents/skills/clerk-setup/SKILL.md`).
- Next.js Quickstart docs (`https://clerk.com/docs/nextjs/getting-started/quickstart.md?manual=1`).
- Next.js 16 proxy / middleware guidance.

## Code inspected

- `package.json` — Next 16.4.2, React 19.3.0, Tailwind v4. `@clerk/nextjs` (^7.9.23) installed.
- `next.config.ts` — `cacheComponents: true` enabled; requires any request-bound auth data or control components (`<Show>`, `<SignIn />`, `<SignUp />`, `<UserButton />`) to be wrapped in `<Suspense>`.
- `proxy.ts` — Created with `clerkMiddleware()`. Matcher includes standard assets and API routes; updated to include `/__clerk/(.*)`.
- `app/layout.tsx` — Root layout configured with `<ClerkProvider>` inside `<body>`.
- `app/sign-in/[[...sign-in]]/page.tsx` — Prebuilt `<SignIn />` route wrapped in `<Suspense>`.
- `app/sign-up/[[...sign-up]]/page.tsx` — Prebuilt `<SignUp />` route wrapped in `<Suspense>`.
- `app/page.tsx` — Landing page with Navbar currently showing a static placeholder user profile icon.
- `components/nav/navbar.tsx` — Navigation bar component with brand logo, nav links, and right slot.

## Decisions and assumptions

1. **Dashboard-Selected Application:** Using `app_3KmIyCkbuEndSDeEkKlhuCAvO3H` (Project-1). CLI authenticated and linked. Keys pulled to `.env.local` via `clerk env pull`.
2. **Next.js 16 Convention:** Using `proxy.ts` with `clerkMiddleware()` export and full matcher pattern (including `/__clerk/(.*)`).
3. **Suspense Boundaries:** Because `cacheComponents: true` is enabled in `next.config.ts`, all auth-reading components (`<Show>`, `<SignIn />`, `<SignUp />`, `<UserButton />`) are wrapped in `<Suspense>` boundaries.
4. **Auth Controls in Navigation:** Provide `<AuthControls />` in `components/nav/auth-controls.tsx`. When signed out, it renders accessible "Sign In" and "Sign Up" triggers styled to match the Vertex design system (tertiary and primary buttons). When signed in, it displays the notification bell and Clerk's `<UserButton />`.
5. **Navbar Integration:** Use `<AuthControls />` as the default right-hand content in `Navbar` while allowing optional overrides via `right?: React.ReactNode`. Update `app/page.tsx` to use the live auth controls.
6. **Security & Boundaries:** All Clerk secret keys remain strictly on the server (`.env.local`). Only the publishable key is exposed to the browser. Environment variable files are never read or output into conversation.

## Files to touch

- `proxy.ts` — Ensure matcher includes `/__clerk/(.*)`.
- `components/nav/auth-controls.tsx` — Create component rendering `<Suspense><Show when="signed-out">...</Show><Show when="signed-in">...</Show></Suspense>`.
- `components/nav/navbar.tsx` — Update default right-side slot to render `<AuthControls />`.
- `app/page.tsx` — Replace placeholder user profile icon with live Clerk `<AuthControls />` inside the navbar.
- `flow.md`, `decisions.md`, `quiz.md` — Living docs updates per AGENTS.md §15.

## Requirements

1. `@clerk/nextjs` (v7+) installed and configured.
2. `ClerkProvider` wrapping children inside `<body>` in `app/layout.tsx`.
3. `proxy.ts` executing `clerkMiddleware()` with correct matcher.
4. Dedicated `/sign-in/[[...sign-in]]` and `/sign-up/[[...sign-up]]` catch-all pages wrapped in `<Suspense>`.
5. Visible auth controls in the navigation bar switching seamlessly between signed-out ("Sign In" / "Sign Up") and signed-in (`<UserButton />`) states.
6. `clerk doctor` passing with all checks satisfied.
7. ESLint and TypeScript checks passing cleanly.
8. Living docs updated with entry on top.

## Security considerations

- `CLERK_SECRET_KEY` remains secret and server-side only in `.env.local`.
- `.env*` files are ignored by git and never exposed in client bundles or logged.
- Auth protection follows Clerk best practices with route-level and action-level gating.

## Acceptance criteria

- `npx clerk doctor` passes without missing keys or unreachable application errors.
- `npm run lint` and `npx tsc --noEmit` pass with zero errors.
- Navigation bar renders Sign In and Sign Up buttons when signed out.
- Signing in renders the user avatar and profile dropdown via `<UserButton />`.
- Visiting `/sign-in` and `/sign-up` renders the full authentication forms correctly.

## Checks to run

- `npx -y clerk@latest doctor`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`

## Manual test steps

1. Run `npm run dev` and navigate to `http://localhost:3000`.
2. Verify the top right navigation shows "Sign in" and "Sign up" buttons.
3. Click "Sign in" to verify modal or navigation to `/sign-in`.
4. Sign in with test credentials or sign up for a new account.
5. Verify the avatar replaces the buttons, and clicking the avatar opens the Clerk user profile menu.
6. Click "Sign out" from the menu and verify the UI transitions back to "Sign in" and "Sign up".

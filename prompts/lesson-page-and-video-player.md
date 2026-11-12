# Implementation Prompt: Lesson Page & Embedded Video Player (Pixel-Perfect to UI Reference)

## Goal
Implement the lesson page (`/courses/[slug]/lessons/[lessonSlug]`) pixel-perfect to the attached reference design (`media_1794477029072_54daffe8.png`), wired to seeded Sanity content with provider video playback (YouTube, Vimeo, Bunny) directly on the page, interactive module curriculum sidebar with timeline progression, lesson notes/tabs, pro tip callout, resource cards, and previous/next lesson navigation.

---

## Skills & Guidelines Read
- `AGENTS.md` (§1 Platform purpose, §2 Loop & prompt approval, §3 UI work: desktop reference is source of truth, reproduce exactly, responsive down to mobile, §5 Workspace boundaries & read-only pages, §7 Decisions: on-site embed player with start second param, presentational notes tab, §8 Data model: lesson, module, course, §13 Checks: type check, lint, dev).
- Reference design: `media_1794477029072_54daffe8.png`.

---

## Code & Data Inspected
| File | Current State | Target Alignment |
|---|---|---|
| `app/courses/[slug]/lessons/[lessonSlug]/page.tsx` | Renders basic lesson header, metadata, video embed, tabs, and footer. | Update layout, breadcrumbs, badge (`LESSON X.Y`), serif display title, subtitle, bookmark square button, metadata row, video embed, and footer navigation to match UI reference. |
| `components/lesson/lesson-sidebar.tsx` | Flat module list without timeline styling, plain text buttons, progress bar. | Rebuild with exact reference styling: terracotta "← Back to course", course emblem, percentage text, module accordion with checkmarks `(✓)` for completed modules, terracotta filled badge for active module, and vertical timeline stem with active play badge `[▶]` and hollow dots. |
| `components/lesson/video-embed.tsx` | Embed helper for YouTube, Vimeo, Bunny with start seconds. | Maintain iframe provider playback with exact 16:9 aspect ratio, rounded container, and dark presentation frame matching the design. |
| `components/lesson/lesson-tabs.tsx` | Basic tabs for content and notes. | Match exact tab styling (terracotta underline on `Lesson Content`), serif `Overview` heading, Portable Text notes rendering, `In this lesson you will:` with terracotta check circle icons, peach `Pro Tip` callout box with lightbulb icon, and 3-card `Resources` grid with document/repo icons and external link indicators. |
| `components/lesson/lesson-footer.tsx` | Simple navigation links. | Update to match design: left `← Previous Lesson` outline button with module title and duration underneath; right next lesson title/duration with solid terracotta `Next Lesson →` button. |

---

## Decisions & Assumptions
1. **Design as Source of Truth (§3):** The attached image `media_1794477029072_54daffe8.png` defines layout, colors, typography, and states. Desktop layout matches the screenshot exactly, with responsive adaptations (stacking columns and collapsible sidebar) for mobile devices.
2. **Provider Embed (§7):** In accordance with AGENTS.md §7, video playback stays on the site using the provider's embed player (YouTube/Vimeo/Bunny) with `startSeconds` support, rather than a custom HTML5 player.
3. **Sidebar Timeline & Progression:**
   - Active module shows vertical connector line (timeline) connecting lesson nodes.
   - Active lesson displays a solid terracotta dot, title, "Now playing" subtitle in terracotta, and a terracotta circular play button `[▶]` on the right.
   - Inactive lessons display a hollow circle node, title, and lesson duration.
   - Completed modules display an orange outline checkmark circle `(✓)` on the right.
4. **Presentational Notes Tab (§7):** The "Notes" tab is presentational with a browser-session note pad per AGENTS.md §7.
5. **Color Palette:**
   - Primary terracotta/rust accent: `#C85A32` (Tailwind `primary-500` / `primary-600`)
   - Peach/warm pastel backgrounds: `#FDF6F3` / `#FDF2EE`
   - Neutral text: `#171717` (headings), `#737373` (subtitles/muted)

---

## Files to Touch
1. `app/courses/[slug]/lessons/[lessonSlug]/page.tsx` — layout, header, subtitle, metadata, responsive container.
2. `components/lesson/lesson-sidebar.tsx` — curriculum accordion, module status, vertical timeline with active lesson indicator and circular play badge.
3. `components/lesson/lesson-tabs.tsx` — tab navigation, overview text, key points with check icons, pro tip container, resource cards grid.
4. `components/lesson/lesson-footer.tsx` — styled previous/next navigation buttons with lesson/module metadata.
5. `components/lesson/video-embed.tsx` — video embed container and provider iframe parameters.
6. `flow.md`, `decisions.md`, `quiz.md` — living docs updates.

---

## Requirements & Acceptance Criteria
- [x] **Sidebar Match:** Left sidebar shows terracotta "← Back to course", square course icon, title, progress percent, module list with completed checks `(✓)`, active module filled number `(5)`, and vertical timeline with active lesson indicator and circular play badge.
- [x] **Lesson Header:** Matches screenshot with `LESSON X.Y` terracotta badge, square bookmark icon button, serif display title, summary subtitle, and metadata row (Clock duration, BarChart level, Users student count).
- [x] **Video Playback:** 16:9 embedded video plays cleanly on the page with support for `?start=` timestamp seeking.
- [x] **Lesson Content Tabs:**
  - `Lesson Content` tab active by default with terracotta underline.
  - `Overview` section with serif heading and rich description.
  - `In this lesson you will:` checklist with terracotta checkmark icons.
  - `Pro Tip` highlighted peach box with lightbulb icon.
  - `Resources` grid with document and GitHub cards.
  - `Notes` tab allows writing personal notes.
- [x] **Navigation Footer:** Bottom bar displays `← Previous Lesson` with previous lesson details, and `Next Lesson →` terracotta button with next lesson details.
- [x] **Verification:** `npx tsc --noEmit` and `npm run lint` pass with 0 errors.

---

## Checks to Run
- `npx tsc --noEmit`
- `npm run lint`
- Manual browser verification on `http://localhost:3000/courses/[slug]/lessons/[lessonSlug]`

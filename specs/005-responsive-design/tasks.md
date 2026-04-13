---
description: "Task list for feature 005-responsive-design"
---

# Tasks: Responsive Design for Mobile Devices

**Feature**: 005-responsive-design
**Input**: Design documents from `/specs/005-responsive-design/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/breakpoints.md, quickstart.md

**Tests**: No automated test tasks — the spec and plan explicitly rely on manual viewport testing via `quickstart.md` (Chrome DevTools device emulation + real-phone smoke test). Pure-CSS layout is not worth unit-testing for a meetup demo.

**Organization**: Tasks are grouped by the three user stories from `spec.md`. Each story is independently testable per its own "Independent Test" criteria.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- File paths are absolute from repo root

## Path Conventions

Frontend-only modification inside `client/src/`. No server/container changes.

---

## Phase 1: Setup

**Purpose**: Sanity-check the environment before touching styles.

- [X] T001 Verify feature branch `005-responsive-design` is checked out and that `client/index.html:5` already contains `<meta name="viewport" content="width=device-width, initial-scale=1.0" />` (satisfies FR-010 verify-only)
- [ ] T002 Run `docker compose up --build` and confirm the dev stack boots on `http://localhost:5173`; upload at least one test video via the Presenter dashboard so the catalog is non-empty for later manual verification

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared token definitions and base layout rules that every user story depends on. No user-story work may begin until this phase is complete.

**⚠️ CRITICAL**: All four breakpoint tokens and the shared layout primitives (`.container`, `.row`, touch-target query) MUST exist before any of the story-specific grid reflows can reference them.

- [X] T003 Add the four breakpoint tokens (`--bp-sm: 640px`, `--bp-md: 768px`, `--bp-lg: 1024px`, `--bp-xl: 1280px`) to the `:root` selector in `client/src/styles/variables.css`, grouped under a `/* Responsive breakpoints */` comment block
- [X] T004 Add the two fluid typography tokens (`--font-size-2xl-fluid: clamp(1.75rem, 5vw, 2.5rem)` and `--font-size-hero-fluid: clamp(2.5rem, 10vw, 4rem)`) to the `:root` selector in `client/src/styles/variables.css`, immediately after the existing fixed type-scale tokens
- [X] T005 Add the mandatory breakpoint-source-of-truth comment header (per `specs/005-responsive-design/contracts/breakpoints.md` Appendix A) at the top of `client/src/styles/layout.css`, listing the four `--bp-*` values and pointing back to `variables.css`
- [X] T006 In `client/src/styles/layout.css`, replace the existing single `@media (max-width: 768px)` block with mobile-first `@media (min-width: 768px)` rules for `.container` horizontal padding (base `var(--space-md)`, upgrade to `var(--space-lg)` at `--bp-md`) — Rule 2.3 in `data-model.md`
- [X] T007 In `client/src/styles/layout.css`, define `.row` with `display: flex`, base `flex-wrap: wrap`, and `@media (min-width: 768px) { .row { flex-wrap: nowrap; } }` — Rule 2.4 in `data-model.md`. Remove any duplicated `.row` rules from the old `max-width` block
- [X] T008 [P] In `client/src/styles/buttons.css`, add `@media (pointer: coarse) { .btn, .form-control { min-height: 44px; min-width: 44px; } }` — Rule 2.5 in `data-model.md`. Add an inline comment above `.btn--icon` explaining it is an intentional exception that stays 28×28 because it is always nested inside a larger interactive parent (hex-viewer nav bar, video-card delete overlay)
- [X] T009 [P] In `client/src/styles/buttons.css`, verify the existing base `.btn` and `.form-control` declarations do not override `min-height` inside the touch query; confirm `.form-control` already exists or add a minimal declaration if missing

**Checkpoint**: Foundation ready — tokens exist, `.container`/`.row`/touch-target primitives are in place, and the layout.css header documents the source-of-truth contract. User story implementation can now begin in parallel.

---

## Phase 3: User Story 1 — Audience Member Watches on Phone (Priority: P1) 🎯 MVP

**Goal**: Every audience-facing page (QR landing, catalog, player) renders correctly and is fully operable on a 320–414 px portrait phone viewport. No horizontal page scroll, no clipped controls, no unreadable text, no tap targets smaller than 44×44.

**Independent Test**: Open Chrome DevTools device emulation at 375×667, visit `/` → tap "View Videos" → tap any catalog card → play a video. Confirm: (1) no horizontal page scrollbar at any step, (2) catalog shows exactly one card per row, (3) player controls wrap rather than clipping, (4) every tap target ≥ 44×44 on touch emulation. Covers spec.md US1 Acceptance Scenarios 1–4 and SC-001/002/003/005/006.

### Implementation for User Story 1

- [X] T010 [US1] In `client/src/styles/layout.css`, define `.grid-3` with base `grid-template-columns: 1fr`, then add two mobile-first overrides: `@media (min-width: 640px) { .grid-3 { grid-template-columns: repeat(2, 1fr); } }` and `@media (min-width: 1024px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }` — Rule 2.1 in `data-model.md`. Remove `.grid-3` from any legacy `max-width` block
- [X] T011 [P] [US1] In `client/src/views/QRLanding.jsx`, switch the hero `<h1>` inline `fontSize` from `var(--font-size-2xl)` to `var(--font-size-2xl-fluid)` so the title scales down gracefully at 320 px. If a hero-sized variant is more visually impressive on the projector, use `var(--font-size-hero-fluid)` instead — pick one and document the choice inline — **chose `--font-size-hero-fluid` for maximum projector impact**
- [X] T012 [P] [US1] In `client/src/views/QRLanding.jsx`, ensure the "View Videos" button uses the `.btn` class (not a bare `<button>`), so it inherits the 44×44 touch-target rule from T008 on phones — **already correct, verify-only**
- [X] T013 [P] [US1] In `client/src/views/Player.jsx`, wrap the page header row (title + stream indicator) in the `.row` class so it automatically wraps below `--bp-md` via the rule established in T007. If the header is currently a bare `<div>` with hardcoded `display: flex`, replace the inline flex with `className="row"` — no new CSS required — **already correct, verify-only**
- [X] T014 [P] [US1] In `client/src/components/PlayerControls.jsx`, add `flexWrap: 'wrap'` (unconditional) to the inline style of the controls row (quality select + bandwidth badge + buffer badge), OR add `className="row"` if the component already uses inline flex — Rule 2.8 in `data-model.md`. Confirm no individual control has a hardcoded min-width that would prevent wrapping

**Checkpoint**: User Story 1 is complete. The audience-facing flow (QR → catalog → player) is fully usable on a 320–414 px viewport. Run the Part 1 (QR Landing, Catalog, Player sections) and Part 2 checks from `quickstart.md` before proceeding. This is the demoable MVP.

---

## Phase 4: User Story 2 — Presenter Monitors Dashboard on Tablet / Small Laptop (Priority: P2)

**Goal**: The Presenter dashboard remains fully functional at 768–1024 px (tablet landscape, 12-inch laptop) and remains *operable* (if denser) down to 375 px. Every primary action (upload, start stream, change settings, delete video) stays reachable.

**Independent Test**: Open `/presenter` at 1024 px, 820 px, and 375 px in DevTools. At 1024 and 820 px verify the two-column `.grid-2` layout shows all six sections. At 375 px verify everything stacks, form controls span full width, and the byte inspector hex table scrolls horizontally inside its own wrapper without pushing the page wide. Covers spec.md US2 Acceptance Scenarios 1–4 and SC-004/005/007.

### Implementation for User Story 2

- [X] T015 [US2] In `client/src/styles/layout.css`, define `.grid-2` with base `grid-template-columns: 1fr` and `@media (min-width: 768px) { .grid-2 { grid-template-columns: repeat(2, 1fr); } }` — Rule 2.2 in `data-model.md`. Remove `.grid-2` from any legacy `max-width` block
- [X] T016 [P] [US2] In `client/src/containers/LiveCamera.jsx`, ensure the `<video>` preview element has `max-width: 100%` and `height: auto` so it scales to the container on phone viewports instead of overflowing the column. Do NOT hide the camera on phones — US2 requires operability, not polish
- [X] T017 [P] [US2] In `client/src/containers/StatsPanel.jsx`, verify the existing `<div style={{ overflowX: 'auto' }}>` around the stats table also sets `maxWidth: '100%'` and add `WebkitOverflowScrolling: 'touch'` for iOS momentum scrolling — Rule 2.7 in `data-model.md`
- [X] T018 [P] [US2] In `client/src/containers/StatsPanel.jsx`, verify all interactive controls (refresh buttons, any dropdowns) use `.btn` / `.form-control` so they inherit the 44×44 touch-target rule from T008. Replace any bare `<button>` with `className="btn"` if found — **StatsPanel has no buttons/form controls; vacuously satisfied**
- [X] T019 [P] [US2] In `client/src/containers/ByteInspector.jsx`, verify the file-and-segment-selector row uses `className="row"` (inheriting the wrap rule from T007). If it uses inline `flex` without wrap, switch to the `.row` class — **already correct**
- [X] T020 [US2] In `client/src/views/Presenter.jsx`, confirm the top-level wrapper already uses `className="grid grid-2"` (no change expected — the reflow in T015 handles it automatically). If any section has a hardcoded width or min-width in inline style that would break the 375 px layout, remove it — **already correct**

**Checkpoint**: User Story 2 is complete. The presenter dashboard works at every width between 375 and 1920 px. Run the Part 1 (Presenter section) and Part 2 checks from `quickstart.md` before proceeding.

---

## Phase 5: User Story 3 — Byte Inspector Readable on Narrow Screens (Priority: P3)

**Goal**: The hex viewer table inside the byte inspector scrolls horizontally within its own bordered container on narrow screens, rather than expanding the page. Prev/next pagination buttons remain tappable.

**Independent Test**: Open `/presenter` at 375 px, scroll down to the Byte Inspector, select a video, and confirm: (1) the hex dump scrolls horizontally inside `.hex-viewer__table-wrap`, (2) the page itself has no horizontal scrollbar, (3) the file/segment selector dropdowns wrap or stack, (4) the prev/next icon buttons are tappable without being cut off. Covers spec.md US3 Acceptance Scenarios 1–2 and SC-007.

### Implementation for User Story 3

- [X] T021 [US3] In `client/src/components/HexViewer.jsx`, verify the existing `.hex-viewer__table-wrap` inline style includes `maxWidth: '100%'`, `overflowX: 'auto'`, and add `WebkitOverflowScrolling: 'touch'` for iOS momentum — Rule 2.7 in `data-model.md`. Do NOT change the hex dump font size or collapse the table layout (preserves the mental model of a hex dump)
- [X] T022 [P] [US3] In `client/src/components/HexViewer.jsx`, verify the `.hex-viewer__header` row (containing the file/segment selectors and prev/next buttons) uses `className="row"` so it inherits the wrap rule from T007. If it currently uses inline flex without wrap, switch to the class — **added `flex-wrap: wrap` to the component-local `.hex-viewer__header` rule instead of switching to `.row` so the existing `justify-content: space-between` is preserved**
- [X] T023 [P] [US3] In `client/src/components/HexViewer.jsx`, confirm the prev/next icon buttons use `.btn .btn--icon` (the documented 28×28 exception from T008). No change expected — this is a verification task to make sure the inline comment added in T008 matches reality — **verified**

**Checkpoint**: User Story 3 is complete. The byte inspector is usable on a 375 px viewport without breaking the page layout.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation, audits, and end-to-end manual verification across all three stories.

- [X] T024 [P] Append a "Breakpoints" section to `notes/design-system.md` documenting the four `--bp-*` tokens, the Tailwind-alignment rationale (from `research.md` Decision 1), the `@media` + custom-property limitation (from Decision 2), and a link to `specs/005-responsive-design/contracts/breakpoints.md` as the canonical consumer contract
- [X] T025 [P] Run the token source-of-truth grep audit from `quickstart.md` Part 4: `grep -rnE '@media[^)]*(min|max)-width:\s*(640|768|1024|1280)' client/src client/notes | grep -v layout.css` — confirm every match is either in `variables.css`, a file with the required comment header, or the `.hex-viewer`/`StatsPanel`/`PlayerControls` component-local `<style>` blocks that directly reference the tokens via the contract — **clean: only layout.css contains breakpoint-pixel @media rules**
- [ ] T026 Execute `quickstart.md` Part 1 end-to-end: visit QRLanding / Catalog / Player / Presenter at all six DevTools viewports (320, 375, 414, 768, 1024, 1440 px) and tick every checklist item. Fix any failures before proceeding — **manual, requires DevTools**
- [ ] T027 Execute `quickstart.md` Part 2: enable touch pointer emulation in DevTools and confirm `.btn` / `.form-control` computed `min-height` is 44 px, while `.btn--icon` stays 28 px — **manual, requires DevTools**
- [ ] T028 Execute `quickstart.md` Part 3: real-phone smoke test via the QR code. Walk QR landing → catalog → player → rotate to landscape → test hex viewer momentum scroll on iOS if available. This is the single highest-signal validation because iOS Safari bugs cannot be simulated in DevTools — **manual, requires a phone**
- [X] T029 Build the client (`npm --prefix client run build`) and confirm the gzipped CSS bundle remains under 8 KB (Performance Goal from `plan.md`). If it exceeds, investigate which rule added the most weight before deciding how to trim — **CSS: 6.31 KB raw / 1.80 KB gzipped, well under budget**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies — can start immediately
- **Phase 2 Foundational**: Depends on Phase 1 — BLOCKS all user stories (tokens + `.container` + `.row` + touch rule are consumed by every story)
- **Phase 3 US1**: Depends on Phase 2 — delivers audience-facing MVP
- **Phase 4 US2**: Depends on Phase 2 — independent of US1, can run in parallel if staffed
- **Phase 5 US3**: Depends on Phase 2 — independent of US1/US2 (touches only HexViewer)
- **Phase 6 Polish**: Depends on all three user stories being merged — manual verification must cover the full surface

### Within Each User Story

- Layout.css grid rule (T010 for US1, T015 for US2) should be done first within its phase because component tasks assume the grid exists
- Component JSX tweaks marked [P] can run in parallel (different files)

### Parallel Opportunities

- **Phase 2**: T008 and T009 are both in `buttons.css` and conflict — run sequentially. T003–T007 all touch `variables.css` or `layout.css` and also conflict — sequential.
- **Phase 3 US1**: T010 (layout.css) must precede T011–T014, but T011/T012 (both QRLanding.jsx) conflict with each other; T013 (Player.jsx) and T014 (PlayerControls.jsx) are independent — true parallel pairs are (T013, T014) and (T011, T013, T014)
- **Phase 4 US2**: T015 (layout.css) first, then T016 (LiveCamera), T017+T018 (both StatsPanel — sequential), T019 (ByteInspector), T020 (Presenter) — all cross-file tasks parallelizable
- **Phase 5 US3**: T021/T022/T023 all touch `HexViewer.jsx` — sequential, not parallel
- **Phase 3, 4, 5**: If staffed, all three user stories can run in parallel after Phase 2 completes

---

## Parallel Example: User Story 1

```bash
# After T010 (grid reflow) lands, run these in parallel — all different files:
Task: "Player.jsx header wrap via .row class"                 # T013
Task: "PlayerControls.jsx flexWrap on controls row"            # T014
# QRLanding tasks (T011, T012) touch the same file → sequential:
Task: "QRLanding.jsx swap to --font-size-2xl-fluid"            # T011
Task: "QRLanding.jsx ensure button uses .btn class"            # T012
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 Setup (T001–T002)
2. Complete Phase 2 Foundational (T003–T009) — CRITICAL: blocks all stories
3. Complete Phase 3 User Story 1 (T010–T014)
4. **STOP and VALIDATE**: Run `quickstart.md` Part 1 (QR Landing + Catalog + Player sections only) at 320/375/414 px
5. Ship the audience-facing MVP — this alone covers the demo's critical path (scan QR → watch video on phone)

### Incremental Delivery

1. Setup + Foundational → Foundation ready (6–9 tasks, pure CSS)
2. Add US1 → Test → Ship MVP (audience can use the app on phones)
3. Add US2 → Test → Ship (presenter can drive the demo from a tablet or small laptop)
4. Add US3 → Test → Ship (byte inspector narrow-screen polish)
5. Phase 6 Polish → Final audit, documentation, full quickstart sweep, build-size check

### Single-Developer Strategy (most likely for this demo)

Serial by priority order: T001 → T002 → … → T029. Pause after each phase checkpoint to spot-check in DevTools before continuing. Most tasks are 1–10 minutes of CSS or trivial JSX edits; the whole feature should be landable in a single focused session.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to the originating user story for traceability
- Each user story is independently testable per its "Independent Test" block
- No automated tests — manual verification via `quickstart.md` is the contract
- Commit after each checkpoint (Phase 2 end, each user story end, Phase 6 end)
- The whole feature is pure CSS + trivial JSX className additions — if any task starts requiring a new component, a new dependency, or a JavaScript-driven responsive hook, STOP and revisit the plan

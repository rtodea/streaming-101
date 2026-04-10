---
description: "Task list for Typography and Design System Refinement"
---

# Tasks: Typography and Design System Refinement

**Input**: Design documents from `/specs/004-typography-design-system/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/design-tokens.md, quickstart.md

**Tests**: No automated test tasks — per constitution the project uses manual browser testing. Acceptance is verified via `quickstart.md` scenarios.

**Organization**: Tasks are grouped by user story. Foundational CSS plumbing must complete before any story can deliver its end state.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All paths are absolute from repo root

## Path Conventions

- Frontend SPA at `client/`
- Styles in `client/src/styles/`
- Static assets (fonts) in `client/public/fonts/`
- Notes in repo-root `notes/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Get the self-hosted font files and their licenses into the project so every subsequent phase can reference them.

- [ ] T001 Create directory `client/public/fonts/` for self-hosted font assets
- [ ] T002 [P] Download Inter variable WOFF2 (OFL 1.1, Inter v4.x) into `client/public/fonts/Inter-Variable.woff2`
- [ ] T003 [P] Download JetBrains Mono variable WOFF2 (OFL 1.1, v2.304+) into `client/public/fonts/JetBrainsMono-Variable.woff2`
- [ ] T004 [P] Add Inter OFL license text at `client/public/fonts/Inter-OFL.txt`
- [ ] T005 [P] Add JetBrains Mono OFL license text at `client/public/fonts/JetBrainsMono-OFL.txt`
- [ ] T006 Verify each WOFF2 file is under 300 KB and both combined stay within the 500 KB budget from plan.md

**Checkpoint**: Font files are present and license-compliant. The CSS layer can now reference them.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the design-token layer and introduce the shared button/form-control stylesheet. Every user story depends on these tokens existing before it can consume them.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T007 Extend `client/src/styles/variables.css` with font-family tokens (`--font-family-sans`, `--font-family-mono`) using the fallback stacks from `contracts/design-tokens.md`
- [ ] T008 Extend `client/src/styles/variables.css` with font-weight tokens (`--font-weight-regular`, `--font-weight-medium`, `--font-weight-semibold`, `--font-weight-bold`) and line-height tokens (`--line-height-tight`, `--line-height-normal`, `--line-height-relaxed`)
- [ ] T009 Extend `client/src/styles/variables.css` with transition tokens (`--transition-fast`, `--transition-normal`) and focus shadow token (`--shadow-focus`) per the contract
- [ ] T010 Verify all existing `--font-size-*` tokens in `client/src/styles/variables.css` match the contract values (xs..hero) and add any missing ones
- [ ] T011 Add `@font-face` declarations for Inter and JetBrains Mono variable fonts at the top of `client/src/styles/reset.css` with `font-display: swap` and `src: url('/fonts/...') format('woff2-variations')`
- [ ] T012 Update `body` rule in `client/src/styles/reset.css` to use `var(--font-family-sans)`, `var(--font-size-base)`, `var(--font-weight-regular)`, `var(--line-height-normal)`
- [ ] T013 Add element-level typography defaults in `client/src/styles/reset.css` for `h1`, `h2`, `h3`, `p`, `small`, `label`, `code`, `pre` per the `data-model.md` Type Style table
- [ ] T014 Create new file `client/src/styles/buttons.css` containing the full `.btn`, `.btn--primary`, `.btn--ghost`, `.btn--danger`, `.btn--icon` rule set from `contracts/design-tokens.md` (including `:disabled`, `:focus-visible`, and `prefers-reduced-motion` block)
- [ ] T015 Add the `.form-control` rule set to `client/src/styles/buttons.css` per the contract (shared with buttons for base/hover/focus parity)
- [ ] T016 Import `./styles/buttons.css` in `client/src/main.jsx` after `layout.css`
- [ ] T017 Run `docker compose up` (or `npm run dev` in `client/`) and verify the app still boots, Inter loads (Network tab shows WOFF2 200 OK), and no console errors appear

**Checkpoint**: Design tokens extended, fonts loaded, `.btn`/`.form-control` classes available globally. User stories can now begin in parallel.

---

## Phase 3: User Story 1 - Clean Professional Typography Across All Pages (Priority: P1) 🎯 MVP

**Goal**: Every page (Presenter, Player, Catalog, QR landing) renders in Inter with a visible hierarchy; hex/code content renders in JetBrains Mono. No component should hardcode a font family or raw px/rem size.

**Independent Test**: Load `/`, `/presenter`, `/catalog`, `/player/<id>` and confirm via DevTools Computed pane that `font-family` resolves to `Inter, ...` on UI chrome and `JetBrains Mono, ...` on the hex viewer. Compare against `quickstart.md` scenarios 1, 2, and 5.

### Implementation for User Story 1

- [ ] T018 [P] [US1] Audit `client/src/views/QRLanding.jsx` inline `<style>` block — replace any hardcoded `font-family`, `font-size`, `font-weight`, or `line-height` with design tokens
- [ ] T019 [P] [US1] Audit `client/src/views/Catalog.jsx` inline `<style>` block — replace hardcoded typography values with tokens
- [ ] T020 [P] [US1] Audit `client/src/views/Player.jsx` inline `<style>` block — replace hardcoded typography values with tokens
- [ ] T021 [P] [US1] Audit `client/src/views/Presenter.jsx` inline `<style>` block — replace hardcoded typography values with tokens
- [ ] T022 [P] [US1] Update `client/src/components/HexViewer.jsx` so the hex dump `<pre>` (and ASCII column) uses `var(--font-family-mono)` and `var(--font-size-sm)` — remove any reference to generic `monospace`
- [ ] T023 [P] [US1] Update `client/src/components/StatBar.jsx` inline `<style>` to use font-size and weight tokens
- [ ] T024 [P] [US1] Update `client/src/components/StatGauge.jsx` inline `<style>` to use font-size and weight tokens
- [ ] T025 [P] [US1] Update `client/src/components/StreamIndicator.jsx` inline `<style>` to use font-size and weight tokens
- [ ] T026 [P] [US1] Update `client/src/components/QRDisplay.jsx` inline `<style>` to use font-size and weight tokens
- [ ] T027 [P] [US1] Update `client/src/components/VideoCard.jsx` inline `<style>` to use font-size and weight tokens (buttons handled in US2)
- [ ] T028 [P] [US1] Update `client/src/components/PlayerControls.jsx` inline `<style>` to use font-size and weight tokens (select styling handled in US2)
- [ ] T029 [P] [US1] Update `client/src/containers/StatsPanel.jsx` inline `<style>` to use font-size and weight tokens
- [ ] T030 [P] [US1] Update `client/src/containers/ByteInspector.jsx` inline `<style>` to use font-size and weight tokens; ensure file/segment selector labels use sans tokens and hex output uses mono tokens
- [ ] T031 [P] [US1] Update `client/src/containers/CatalogList.jsx` inline `<style>` to use font-size and weight tokens
- [ ] T032 [P] [US1] Update `client/src/containers/HlsPlayer.jsx` inline `<style>` to use font-size and weight tokens
- [ ] T033 [P] [US1] Update `client/src/containers/LiveCamera.jsx` inline `<style>` to use font-size and weight tokens (buttons handled in US2)
- [ ] T034 [P] [US1] Update `client/src/containers/VideoUploader.jsx` inline `<style>` to use font-size and weight tokens (buttons handled in US2)
- [ ] T035 [US1] Refine `client/src/styles/layout.css` heading and utility classes to reference the font/size/weight tokens rather than any raw values
- [ ] T036 [US1] Walk through `quickstart.md` Scenario 1 (Typography Applied Everywhere), Scenario 2 (Monospace in Hex Viewer), and Scenario 5 (Font Fallback Offline Mode); fix any regressions

**Checkpoint**: Every page renders in Inter; hex content renders in JetBrains Mono; the fallback stack activates cleanly when WOFF2 requests are blocked. US1 is independently demoable.

---

## Phase 4: User Story 2 - Polished Button and Form Control Styling (Priority: P2)

**Goal**: Every `<button>` in the app uses the shared `.btn` base class plus exactly one variant modifier; every `<select>`, `<input type="file">`, `<input type="range">` uses `.form-control`. Hover and focus-visible states are consistent across the app.

**Independent Test**: Click through `/presenter`, `/catalog`, `/player/<id>`, and `/` and verify per `quickstart.md` Scenarios 3 and 4: primary buttons are filled black, danger buttons are red-outlined, all buttons show hover state within 100ms, keyboard tabbing shows the focus ring, selects/sliders match the button visual language.

### Implementation for User Story 2

- [ ] T037 [P] [US2] Convert the "View Videos" button in `client/src/views/QRLanding.jsx` to `<button className="btn btn--primary">` and remove its inline button styling
- [ ] T038 [P] [US2] Convert the Upload button in `client/src/containers/VideoUploader.jsx` to `.btn .btn--primary`; apply `.form-control` to the `<input type="file">` and the segment-duration `<input type="range">`; remove duplicated inline styles
- [ ] T039 [P] [US2] Convert the Start/Stop live stream buttons in `client/src/containers/LiveCamera.jsx` — Start = `.btn .btn--primary`, Stop (while streaming) = `.btn .btn--danger`; remove inline button styles
- [ ] T040 [P] [US2] Convert the delete button in `client/src/components/VideoCard.jsx` to `.btn .btn--danger .btn--icon`; remove inline button styles
- [ ] T041 [P] [US2] Convert the prev/next pagination buttons in `client/src/components/HexViewer.jsx` to `.btn .btn--ghost .btn--icon`; remove the custom nav-button CSS rules from its inline `<style>` block
- [ ] T042 [P] [US2] Update `client/src/components/PlayerControls.jsx` so the quality `<select>` uses `className="form-control"` and drop the `.player-controls__select` custom block (keep only layout-specific rules)
- [ ] T043 [P] [US2] Update `client/src/containers/ByteInspector.jsx` so its `<select>` dropdowns (file picker, segment picker) use `className="form-control"`; remove any redundant inline select styling
- [ ] T044 [P] [US2] Audit `client/src/containers/CatalogList.jsx` for any `<button>` elements (e.g., pagination, filters) and convert to `.btn .btn--ghost` where appropriate
- [ ] T045 [US2] Grep the `client/src/` tree for any remaining raw `<button>` without a `btn` className and convert each to the correct variant; none should be left styled inline
- [ ] T046 [US2] Grep the `client/src/` tree for any remaining `<select>`, `<input type="range">`, or `<input type="file">` without `form-control` and apply the class
- [ ] T047 [US2] Walk through `quickstart.md` Scenarios 3 (Button Variants) and 4 (Form Controls); verify hover/focus-visible feedback within 100ms per SC-004 and fix any gaps

**Checkpoint**: All buttons share the same base geometry with distinct variants; all form controls match the button visual language. US2 is independently demoable on top of US1.

---

## Phase 5: User Story 3 - Central Design Tokens Reference (Priority: P3)

**Goal**: A single human-readable document captures the rationale for the font choices, the button variant contract, and the rules for consuming tokens so future agents/developers do not hunt through component files.

**Independent Test**: Open `notes/design-system.md` and verify it answers: which fonts and why, where the token source of truth lives, which button variant to pick for a new action, and how to consume tokens in a new component.

### Implementation for User Story 3

- [ ] T048 [US3] Create `notes/design-system.md` with sections: Overview, Font Choices (rationale from `research.md`), Design Tokens (link to `client/src/styles/variables.css` and `specs/004-typography-design-system/contracts/design-tokens.md`), Button Variants table (primary/ghost/danger/icon with when-to-use), Form Control Rule, and Consumer Rules (no hardcoded fonts/sizes/colors)
- [ ] T049 [US3] Add a short "How to add a new component" subsection to `notes/design-system.md` showing a minimal example of a component that references tokens and uses `.btn` / `.form-control` correctly
- [ ] T050 [US3] Cross-link `notes/design-system.md` from the repo-root `README.md` (add one line under the existing notes index if present; otherwise append a "Design system" bullet)

**Checkpoint**: Design system is documented in one place per Principle VIII. US3 is independently demoable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify the accessibility, fallback, and reduced-motion edge cases from the spec; confirm the full `quickstart.md` demo script works end-to-end.

- [ ] T051 [P] Verify `prefers-reduced-motion: reduce` disables button transitions — test with Chrome DevTools Rendering tab → Emulate CSS media feature `prefers-reduced-motion`
- [ ] T052 [P] Verify keyboard tab order across `/presenter` shows the `--shadow-focus` ring on every interactive element via `:focus-visible`
- [ ] T053 [P] Verify the mobile QR landing page at 375px width renders readable text without horizontal scroll (spec Edge Case 2)
- [ ] T054 [P] Block all `*.woff2` requests via DevTools Network tab and confirm text remains readable via fallback stack without layout shift (SC-007, spec Edge Case 1)
- [ ] T055 Run the full `quickstart.md` Demo Script end-to-end on the Presenter dashboard as the final dress rehearsal; capture any visual regressions and fix
- [ ] T056 Remove any now-dead CSS from component inline `<style>` blocks (duplicate button rules, orphan font-family declarations) that were superseded by `buttons.css` or token references

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Phase 2 completion
- **Phase 4 (US2)**: Depends on Phase 2 completion; can run in parallel with Phase 3 since US1 touches typography properties and US2 touches button/form-control classes (minor overlap on a few files — see note below)
- **Phase 5 (US3)**: Depends on Phase 2 completion; documentation can be drafted in parallel with US1/US2 but is most accurate after both ship
- **Phase 6 (Polish)**: Depends on US1, US2, US3 all being in place

### User Story Dependencies

- **US1 (P1)**: Independent of US2/US3 — delivers the typography win alone
- **US2 (P2)**: Independent of US1/US3 on a technical level, but the audience experience is best when US1 ships first (buttons pick up Inter automatically via the base `.btn` class)
- **US3 (P3)**: Pure documentation — depends on the decisions captured in US1/US2 but can be written any time after Phase 2

### File-level Parallelism Caveat

Tasks T018–T034 (US1) and T037–T044 (US2) overlap on these files: `VideoUploader.jsx`, `LiveCamera.jsx`, `VideoCard.jsx`, `HexViewer.jsx`, `PlayerControls.jsx`, `ByteInspector.jsx`, `CatalogList.jsx`. When running in parallel, assign the same file's US1 + US2 tasks to the same worker to avoid merge conflicts. All cross-file `[P]` pairs are safe.

### Within Each User Story

- Token/foundation work before component-level work
- Component edits can run in parallel when they touch different files
- Run `quickstart.md` scenarios for each story as the story-level checkpoint

---

## Parallel Example: User Story 1

```text
# Once Phase 2 is complete, launch these US1 tasks in parallel:
T018 QRLanding typography tokens
T019 Catalog typography tokens
T020 Player typography tokens
T021 Presenter typography tokens
T022 HexViewer mono tokens
T023 StatBar tokens
T024 StatGauge tokens
# ... all T018–T034 can run concurrently (different files)
```

## Parallel Example: User Story 2

```text
# Once Phase 2 is complete, launch these US2 tasks in parallel:
T037 QRLanding button conversion
T040 VideoCard delete button
T041 HexViewer pagination buttons
T042 PlayerControls select → form-control
T043 ByteInspector selects → form-control
# ... all T037–T044 can run concurrently (different files)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (font files in place)
2. Complete Phase 2: Foundational (tokens, buttons.css, @font-face)
3. Complete Phase 3: User Story 1 (typography everywhere)
4. **STOP and VALIDATE**: Run `quickstart.md` Scenarios 1, 2, 5 — this alone is a demo-worthy improvement
5. Ship as MVP

### Incremental Delivery

1. Setup + Foundational → fonts load, tokens available
2. US1 → typography polish across all pages (demo-ready MVP)
3. US2 → button and form-control system (polish pass)
4. US3 → design-system documentation (maintainability)
5. Polish phase → accessibility/fallback verification → final demo

### Parallel Strategy

A single developer can run the `[P]` tasks within each phase serially with very low cost — they are all small CSS token substitutions. If working with multiple agents, split along the file-level parallelism caveat above.

---

## Notes

- `[P]` tasks touch different files and have no ordering dependency on each other
- `[Story]` tag maps each task to a spec user story for traceability
- Every US1 task must preserve existing component layout — this is a typography/token sweep, not a redesign
- Every US2 task must preserve existing component behavior — only the class names and inline style bodies change
- Commit after each user story phase at minimum (or after each task group if preferred)
- Stop at each checkpoint to validate the story via `quickstart.md` before moving on
- Avoid: touching component logic, adding new React components, introducing new dependencies

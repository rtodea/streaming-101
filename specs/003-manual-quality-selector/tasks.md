# Tasks: Manual Quality Selector

**Input**: Design documents from `/specs/003-manual-quality-selector/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Not requested — manual browser testing per constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Extend the useHls hook to expose quality level control — required by both user stories.

- [ ] T001 Add `setLevel` callback and `selectedLevel` state to `useHls` hook, using `hls.currentLevel` API for locking and `-1` for Auto (ABR) in `client/src/hooks/useHls.js`
- [ ] T002 Expose available levels as `{height, index}` array and selected level from `useHls` return value in `client/src/hooks/useHls.js`

**Checkpoint**: Hook API ready — `setLevel(index)` locks quality, `setLevel(-1)` restores ABR, `stats.levels` lists available variants with indices.

---

## Phase 2: User Story 1 - Manual Quality Selection for VOD (Priority: P1) — MVP

**Goal**: Add a quality dropdown to the VOD player with Auto/1080p/720p/480p options.

**Independent Test**: Upload a video, open the player, use the dropdown to switch between quality levels. Video resolution visibly changes and quality indicator updates.

### Implementation for User Story 1

- [ ] T003 [US1] Add quality dropdown to `PlayerControls` component with `levels`, `selectedLevel`, and `onLevelChange` props; render a `<select>` with "Auto" option (value `-1`) plus one option per available level showing `{height}p` in `client/src/components/PlayerControls.jsx`
- [ ] T004 [US1] Style the quality dropdown to match existing black-and-white design system using CSS custom properties in `client/src/components/PlayerControls.jsx`
- [ ] T005 [US1] Wire `useHls` level control to `PlayerControls` in the `HlsPlayer` container: pass `stats.levels`, `stats.selectedLevel`, and `setLevel` as props in `client/src/containers/HlsPlayer.jsx`

**Checkpoint**: VOD player has a working quality dropdown. Selecting a level locks playback; selecting Auto resumes ABR.

---

## Phase 3: User Story 2 - Manual Quality Selection for Live Playback (Priority: P2)

**Goal**: Ensure the same quality dropdown works in the live player context.

**Independent Test**: Start a live camera stream, open the live player, switch quality levels during the broadcast.

### Implementation for User Story 2

- [ ] T006 [US2] Verify the live player route (`/player/:id?live=1`) uses the same `HlsPlayer` container and confirm quality dropdown appears for live HLS streams in `client/src/views/Player.jsx`
- [ ] T007 [US2] Handle dynamic level availability for live streams — update dropdown when new quality levels appear in the manifest (levels may arrive progressively) in `client/src/hooks/useHls.js`

**Checkpoint**: Live player has the same quality dropdown as VOD. Quality switching works during active live streams.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, UX refinements, and verification.

- [ ] T008 Show only available quality levels in the dropdown by filtering out levels not yet present in the HLS manifest in `client/src/components/PlayerControls.jsx`
- [ ] T009 Ensure quality selection persists across segment boundaries (no automatic reset when new segments load) by verifying `hls.currentLevel` stays locked in `client/src/hooks/useHls.js`

---

## Dependencies

```text
T001, T002 (Foundational) → T003, T004, T005 (US1) → T006, T007 (US2) → T008, T009 (Polish)

US1 and US2 share the same HlsPlayer container, so US2 mostly verifies
that the US1 implementation works in the live context.
```

## Parallel Execution

- **Phase 1**: T001 and T002 are sequential (T002 depends on T001's state changes)
- **Phase 2**: T003 and T004 can run in parallel [P] (both modify PlayerControls but different concerns: markup vs style). T005 depends on T003.
- **Phase 3**: T006 and T007 can run in parallel [P] (different files)
- **Phase 4**: T008 and T009 can run in parallel [P] (different files)

## Implementation Strategy

**MVP**: Phase 1 + Phase 2 (User Story 1) delivers a fully functional quality selector for VOD playback.

**Incremental delivery**:
1. Hook changes (T001-T002) — foundation
2. VOD dropdown (T003-T005) — MVP demo-ready
3. Live verification (T006-T007) — full feature
4. Polish (T008-T009) — edge cases

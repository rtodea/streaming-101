# Tasks: Slidev Presentation Slides

**Input**: Design documents from `/specs/006-slidev-presentation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/layouts.md, quickstart.md

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the Slidev sub-project with dependencies, fonts, and global styles

- [X] T001 Create slides/slidev/ directory structure with package.json containing @slidev/cli ^52.x dependency
- [X] T002 Create slides/slidev/style.css with @font-face declarations for Inter and JetBrains Mono variable WOFF2 fonts, monochrome theme overrides (black/white palette)
- [X] T003 [P] Copy Inter and JetBrains Mono WOFF2 font files from client/public/fonts/ to slides/slidev/public/fonts/
- [X] T004 [P] Create slides/slidev/public/images/ directory with a streaming-themed SVG placeholder for the cover slide (play button or waveform graphic)
- [X] T005 Run npm install in slides/slidev/ to install dependencies

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create all 7 custom layouts and the MermaidReveal component — these are required before any slide content can use them

**⚠️ CRITICAL**: No slide content can be authored until layouts and MermaidReveal are ready

- [X] T006 [P] Create slides/slidev/layouts/cover-image.vue — two-column layout: image left 50% (object-fit: cover, full height), default slot right 50% vertically centered; accepts `image` frontmatter prop
- [X] T007 [P] Create slides/slidev/layouts/pros-cons.vue — two equal columns with `::pros::` and `::cons::` named slots; each `<li>` wrapped in v-click for progressive reveal; column headers "Pros" / "Cons"
- [X] T008 [P] Create slides/slidev/layouts/quote.vue — centered quote text (large italic font), attribution below in muted text; accepts `author` and optional `source` frontmatter props
- [X] T009 [P] Create slides/slidev/layouts/full-image.vue — full-bleed image filling entire slide (object-fit: contain, white background), zero padding/chrome; accepts `image` and optional `alt` frontmatter props
- [X] T010 [P] Create slides/slidev/layouts/url-reference.vue — styled link list with bold titles and muted descriptions; default slot for markdown content
- [X] T011 [P] Create slides/slidev/layouts/next-adventure.vue — centered title at top, topic items displayed as card-like list with bold title and description; default slot
- [X] T012 [P] Create slides/slidev/layouts/demo-break.vue — inverted colors (black bg, white text), large centered title, monospace URL below, arrow/switch icon; accepts `title` (default: "Live Demo") and optional `url` frontmatter props
- [X] T013 Create slides/slidev/components/MermaidReveal.vue — custom Vue component that: (1) renders Mermaid diagram source to SVG via mermaid.render(), (2) queries SVG for interaction elements (arrows, nodes, labels), (3) hides all elements beyond current $slidev.nav.clicks count via CSS visibility, (4) auto-detects step count from arrow patterns (->> , -->, ->) for sequence diagrams and edges for flowcharts; accepts `diagram` string prop and optional `steps` number override

**Checkpoint**: All layouts and MermaidReveal component ready — slide content authoring can begin

---

## Phase 3: User Story 1 — Present Slides During the Meetup (Priority: P1) 🎯 MVP

**Goal**: Create the full ~20-slide deck covering the Streaming 101 narrative

**Independent Test**: Navigate to slides in dev server, advance through entire deck, verify all slides render correctly

### Implementation for User Story 1

- [X] T014 [US1] Create slides/slidev/slides.md with headmatter: title "Streaming 101", fonts config (sans: Inter, mono: JetBrains Mono, local: Inter, JetBrains Mono), theme config
- [X] T015 [US1] Add opening slide using cover-image layout with placeholder image and title "Streaming 101: From Pixels to Packets in JavaScript" + subtitle "timjs meetup" in slides/slidev/slides.md
- [X] T016 [US1] Add "What Is a Video?" section slides (3-4 slides): pixel→frame→video hierarchy, raw bytes math table (pixel=3B, frame=6MB, 1sec=180MB/s), compression ratio table (H.264, H.265, VP9, AV1) in slides/slidev/slides.md
- [X] T017 [US1] Add "Compression & Codecs" section slides (2-3 slides): spatial vs temporal compression, I-frames/P-frames/B-frames, checkerboard demo explanation in slides/slidev/slides.md
- [X] T018 [US1] Add demo-break slide for "Upload & Transcode Demo" pointing to /presenter in slides/slidev/slides.md
- [X] T019 [US1] Add "VOD Pipeline" section slide with MermaidReveal component showing the sequence diagram from notes/architecture.md (Creator→API→Storage→FFmpeg→HLS) in slides/slidev/slides.md
- [X] T020 [US1] Add "Adaptive Bitrate Streaming" section slides (2-3 slides): ABR concept, bandwidth vs quality tradeoff, manifest structure in slides/slidev/slides.md
- [X] T021 [US1] Add MermaidReveal slide for ABR viewer flow sequence diagram (Viewer→API→Storage with quality switching loop) in slides/slidev/slides.md
- [X] T022 [US1] Add demo-break slide for "ABR & Quality Selector Demo" pointing to /catalog in slides/slidev/slides.md
- [X] T023 [US1] Add "Live Streaming" section slides (2-3 slides): ingest→transcode→chunk pipeline, HLS segment size vs latency tradeoff in slides/slidev/slides.md
- [X] T024 [US1] Add MermaidReveal slide for live streaming pipeline sequence diagram in slides/slidev/slides.md
- [X] T025 [US1] Add demo-break slide for "Live Stream & Stats Demo" pointing to /presenter in slides/slidev/slides.md
- [X] T026 [US1] Add "Wow Factor" section slides (1-2 slides): audience QR code participation, bandwidth degradation demo explanation in slides/slidev/slides.md
- [X] T027 [US1] Add demo-break slide for "Audience Participation Demo" with QR code mention in slides/slidev/slides.md
- [X] T028 [US1] Add url-reference slide with documentation links (HLS RFC, hls.js, FFmpeg wiki) in slides/slidev/slides.md
- [X] T029 [US1] Add next-adventure slide with topics: WebRTC, DASH, AV1, WebTransport, Media Source Extensions in slides/slidev/slides.md
- [X] T030 [US1] Add closing/thank-you slide in slides/slidev/slides.md
- [X] T031 [US1] Verify full deck navigation: run `npx slidev` in slides/slidev/ and advance through all slides confirming text, tables, code blocks, and MermaidReveal diagrams render correctly

**Checkpoint**: Full slide deck navigable in Slidev dev server — MVP complete

---

## Phase 4: User Story 2 — Step Through MermaidJS Diagrams Progressively (Priority: P1)

**Goal**: Validate and refine the MermaidReveal component with all diagram slides

**Independent Test**: Navigate to each MermaidReveal slide, press NEXT repeatedly, verify one interaction per press; press PREVIOUS to verify backward navigation

### Implementation for User Story 2

- [X] T032 [US2] Test MermaidReveal on VOD pipeline slide (T019): verify each of the ~7 interactions reveals one at a time, backward navigation hides last interaction, final NEXT advances to next slide
- [X] T033 [US2] Test MermaidReveal on ABR viewer flow slide (T021): verify loop interactions and alt branches reveal correctly
- [X] T034 [US2] Test MermaidReveal on live streaming pipeline slide (T024): verify parallel/concurrent interactions reveal correctly
- [X] T035 [US2] Fix any MermaidReveal issues found during testing — adjust SVG element selection, step detection, or CSS visibility logic in slides/slidev/components/MermaidReveal.vue
- [X] T036 [US2] Ensure clicks frontmatter value matches actual step count on each MermaidReveal slide in slides/slidev/slides.md

**Checkpoint**: All MermaidReveal diagrams step through correctly with forward and backward navigation

---

## Phase 5: User Story 3 — Serve Slides Integrated in the Main App (Priority: P2)

**Goal**: Build slides to static assets and serve at /slides via NestJS

**Independent Test**: Run main app, navigate to /slides (deck loads), /presenter (dashboard loads), /catalog (catalog loads) — no route conflicts

### Implementation for User Story 3

- [X] T037 [US3] Add build script to slides/slidev/package.json: `"build": "slidev build --base /slides/ --out dist"`
- [X] T038 [US3] Build the slides by running npm run build in slides/slidev/
- [X] T039 [US3] Add ServeStaticModule.forRoot() entry in server/src/app.module.ts to serve slides/slidev/dist/ at serveRoot '/slides', with exclude patterns for /api/* and /hls/*
- [X] T040 [US3] Test integration: start the NestJS server, verify /slides loads the deck, /slides/index.html serves correctly with all assets (fonts, images, JS)
- [X] T041 [US3] Verify no route conflicts: /presenter, /catalog, /api/health all still work with the slides static module added

**Checkpoint**: Slides served at /slides from the main app alongside all existing routes

---

## Phase 6: User Story 4 — Author and Update Slides Easily (Priority: P2)

**Goal**: Create comprehensive README for slide authoring

**Independent Test**: Follow README to add a new slide, preview in dev server, build for production

### Implementation for User Story 4

- [X] T042 [US4] Create slides/slidev/README.md with sections: Quick Start (install, dev server, build), Slide Basics (frontmatter, separators, navigation), Custom Layouts (all 7 with usage examples and slot names), MermaidReveal Component (usage, how steps are detected, clicks frontmatter), Font Configuration (how to swap fonts by editing headmatter + style.css), Adding Images (public/ directory), Building for Production (build command, where output goes, how NestJS serves it)
- [X] T043 [US4] Add .gitignore in slides/slidev/ to ignore node_modules/ and dist/

**Checkpoint**: README enables any developer to author, preview, and build slides

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [X] T044 [P] Add slides/slidev/ entry to root .gitignore for node_modules and dist if not already covered
- [X] T045 [P] Verify offline capability: build slides, disconnect from internet, serve via NestJS, confirm all fonts and assets load
- [X] T046 Run quickstart.md validation scenarios (sections 3.1 through 3.7)
- [X] T047 Update notes/ with a decision note about Slidev choice and MermaidReveal approach in notes/slidev-choice.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T005 (npm install) — BLOCKS all slide content
- **US1 (Phase 3)**: Depends on all Phase 2 layouts + MermaidReveal
- **US2 (Phase 4)**: Depends on US1 (needs actual diagram slides to test)
- **US3 (Phase 5)**: Depends on US1 (needs built slides); can run parallel with US2
- **US4 (Phase 6)**: Can start after Phase 2; can run parallel with US1/US2/US3
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only — MVP deliverable
- **US2 (P1)**: Depends on US1 (needs diagram slides to validate MermaidReveal)
- **US3 (P2)**: Depends on US1 (needs built slides) — can parallel with US2
- **US4 (P2)**: Independent of other stories — can start after Phase 2

### Parallel Opportunities

- T003 + T004: Font copy and placeholder image creation
- T006–T012: All 7 layouts can be built in parallel (different files)
- US3 + US2: Can run in parallel after US1 is complete
- US4: Can run in parallel with any user story after Phase 2
- T044 + T045: Polish tasks on different files

---

## Parallel Example: Phase 2 Layouts

```bash
# All 7 layouts can be built simultaneously:
Task T006: "cover-image.vue"
Task T007: "pros-cons.vue"
Task T008: "quote.vue"
Task T009: "full-image.vue"
Task T010: "url-reference.vue"
Task T011: "next-adventure.vue"
Task T012: "demo-break.vue"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T005)
2. Complete Phase 2: Foundational — layouts + MermaidReveal (T006–T013)
3. Complete Phase 3: User Story 1 — full slide deck (T014–T031)
4. **STOP and VALIDATE**: Navigate entire deck in Slidev dev server
5. Demo-ready with `npx slidev` even before NestJS integration

### Incremental Delivery

1. Setup + Foundational → Layouts and component ready
2. Add US1 → Full deck navigable → MVP!
3. Add US2 → MermaidReveal validated and polished
4. Add US3 → Slides served at /slides from main app
5. Add US4 → README for ongoing authoring
6. Polish → Offline check, decision documentation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Slide content tasks (T014–T030) are sequential because they all edit slides/slidev/slides.md
- MermaidReveal (T013) is the most complex task — may need iteration in US2 phase
- Font files already exist in client/public/fonts/ — just copy them

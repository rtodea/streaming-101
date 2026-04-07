# Tasks: Streaming Demo Stack

**Input**: Design documents from `/specs/001-streaming-demo-stack/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the spec. Tests are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `client/src/`
- **Backend**: `server/src/`
- **Root**: `docker-compose.yml`, `Dockerfile`s at service root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, package installation, build tooling

- [x] T001 Initialize client project with React 19 + Vite 6 in `client/package.json` and `client/vite.config.js`
- [x] T002 [P] Initialize server project with NestJS 11 + TypeScript in `server/package.json` and `server/tsconfig.json`
- [x] T003 [P] Create CSS foundation: `client/src/styles/variables.css` (all theme tokens — colors, font sizes, spacing, border radii), `client/src/styles/reset.css` (minimal reset), `client/src/styles/layout.css` (grid/flex utilities)
- [x] T004 [P] Create React Router v7 setup with 4 routes in `client/src/main.jsx` (QRLanding /, Catalog /catalog, Player /player/:id, Presenter /presenter) with placeholder view components in `client/src/views/`
- [x] T005 [P] Create `client/Dockerfile` (Node 20, Vite dev server for development, static build for production)
- [x] T006 [P] Create `server/Dockerfile` (Node 20, FFmpeg installed, TypeScript compilation, `--inspect` support via env var)
- [x] T007 Create `docker-compose.yml` at repo root: client service (port 5173), server service (port 3000, inspect port 9229), shared volume `/data/hls`, health checks for both services. Also create `docker-compose.debug.yml` override: expose Node inspect port 9229, set `NODE_OPTIONS=--inspect=0.0.0.0:9229` on server, hybrid mode env vars (e.g., `SERVER_HOST` for client to point at local server)
- [x] T008 Create `notes/debugging.md` with launch configs for VS Code (Node attach + Chrome debug), WebStorm (remote Node attach), and Chrome DevTools (`chrome://inspect`) instructions. Document hybrid mode: how to run server locally while client stays in Docker and vice versa, which env vars to set, which `docker compose` profiles to use

**Checkpoint**: `docker compose up` starts both services (empty shells). Both containers healthy.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core backend infrastructure that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T009 Create NestJS bootstrap with ws adapter in `server/src/main.ts` and root module in `server/src/app.module.ts`. Configure CORS, file upload limit (MAX_UPLOAD_SIZE env var, default 500MB), and static file serving for `/hls/` from `/data/hls/` volume via `server/src/hls/hls.module.ts`
- [x] T010 [P] Create health check endpoint `GET /api/health` in `server/src/health/health.controller.ts` returning service status, uptime, and spawned sub-process count/status (pid, running/exited, exit code)
- [x] T011 [P] Create WebSocket gateway in `server/src/ws/ws.gateway.ts` — accept connections, parse initial handshake message (viewer:connect, presenter:connect, camera:start), route to appropriate handler. Create `server/src/ws/ws.service.ts` for connection tracking (Map of connected viewers/presenter) and broadcast helper
- [x] T012 [P] Create shared `useWebSocket` hook in `client/src/hooks/useWebSocket.js` — native WebSocket with auto-reconnect on close, JSON message send helper, binary send mode, connection state tracking
- [x] T013 [P] Create in-memory Video store in `server/src/videos/videos.service.ts` — Map-based storage for Video entities (from data-model.md), filesystem scan on startup to rebuild state from `/data/hls/vod/`
- [x] T014 [P] Create in-memory StreamSession store in `server/src/streams/streams.service.ts` — Map-based storage for StreamSession entities, state transitions (live/ended)
- [x] T015 [P] Configure structured JSON logging in `server/src/main.ts` — all logs to stdout with `{service, timestamp, correlationId, level, message}` format. Add request logging middleware

**Checkpoint**: Foundation ready — WebSocket accepts connections, health check responds, HLS static files served, both stores initialized. User story implementation can begin.

---

## Phase 3: User Story 1 — VOD Upload & Adaptive Playback (Priority: P1) MVP

**Goal**: Presenter uploads a video, system transcodes to 3 quality levels (480p/720p/1080p), viewer watches with adaptive bitrate via HLS.

**Independent Test**: Upload a sample MP4, wait for transcoding, open `/catalog`, select video, play it, throttle network in DevTools and observe quality switch.

### Implementation for User Story 1

- [x] T016 [US1] Implement video upload endpoint `POST /api/videos/upload` in `server/src/videos/videos.controller.ts` — multipart form, validate format (MP4/WebM/MOV) and size, store to `/data/hls/vod/{id}/original.*`, create Video entity in store
- [x] T017 [US1] Implement FFmpeg VOD transcoding in `server/src/videos/videos.service.ts` — `child_process.spawn` FFmpeg to transcode uploaded file into 480p/720p/1080p HLS segments + master manifest. Track progress via FFmpeg stderr parsing, update Video entity status/progress. Register spawned process with health controller for sub-process visibility
- [x] T018 [US1] Implement `GET /api/videos` and `GET /api/videos/:id` in `server/src/videos/videos.controller.ts` per REST contract
- [x] T019 [US1] Send `transcode:progress` and `transcode:complete`/`transcode:error` WebSocket messages to presenter connection during transcoding (from `videos.service.ts` via `ws.service.ts`)
- [x] T020 [P] [US1] Create `VideoCard` presentational component in `client/src/components/VideoCard.jsx` — thumbnail placeholder, title, status badge (transcoding/ready), progress bar for transcoding
- [x] T021 [P] [US1] Create `StreamIndicator` presentational component in `client/src/components/StreamIndicator.jsx` — Live/VOD/Offline badge
- [x] T022 [US1] Create `CatalogList` smart container in `client/src/containers/CatalogList.jsx` — fetch `GET /api/videos` + `GET /api/streams`, render VideoCard list, auto-refresh on WebSocket transcode:complete events
- [x] T023 [US1] Create `Catalog` view in `client/src/views/Catalog.jsx` — page layout with CatalogList, link each video to `/player/{id}`
- [x] T024 [US1] Create `useHls` hook in `client/src/hooks/useHls.js` — initialize hls.js on a video ref, load source URL, expose events: `LEVEL_SWITCHED` (quality), `FRAG_LOADED` (bandwidth stats), buffer info. Cleanup on unmount
- [x] T025 [US1] Create `HlsPlayer` smart container in `client/src/containers/HlsPlayer.jsx` — use `useHls` hook, report viewer stats (quality, bandwidth, bufferLevel) to server via `useWebSocket` every ~2 seconds as `viewer:stats` messages. Send `viewer:connect` on mount, `viewer:disconnect` on unmount
- [x] T026 [P] [US1] Create `PlayerControls` presentational component in `client/src/components/PlayerControls.jsx` — current quality indicator, bandwidth display, buffer level bar
- [x] T027 [US1] Create `Player` view in `client/src/views/Player.jsx` — fetch video/stream details by `:id` param, render HlsPlayer with HLS manifest URL (`/hls/vod/{id}/master.m3u8` or `/hls/live/{id}/master.m3u8`), show PlayerControls
- [x] T028 [US1] Create `VideoUploader` smart container in `client/src/containers/VideoUploader.jsx` — file input (accept MP4/WebM/MOV), upload via `POST /api/videos/upload` with progress, show transcoding progress from WebSocket `transcode:progress` messages

**Checkpoint**: Full VOD pipeline works end-to-end. Upload → transcode → catalog → playback with ABR. Quality switches visible in DevTools network tab.

---

## Phase 4: User Story 2 — Live Streaming from Camera to Viewers (Priority: P2)

**Goal**: Presenter starts a live stream from browser camera via MediaRecorder + WebSocket. Server transcodes to HLS in real time. Viewers watch with ABR. Presenter can change segment size.

**Independent Test**: Click "Start Live Stream" on `/presenter`, allow camera, open `/catalog` on another tab/device, see live stream appear, play it, change segment size and observe latency change.

### Implementation for User Story 2

- [x] T029 [US2] Create `LiveCamera` smart container in `client/src/containers/LiveCamera.jsx` — `getUserMedia()` for camera access, `MediaRecorder` encoding WebM chunks, open WebSocket with `camera:start` handshake, send binary frames on `ondataavailable`, `camera:stop` on stop button. Show camera preview via `<video>` element
- [x] T030 [US2] Implement camera ingest handler in `server/src/ws/ws.gateway.ts` — on `camera:start` handshake, create StreamSession entity, spawn FFmpeg process (`child_process.spawn`) with stdin pipe for WebM input → multi-quality HLS output to `/data/hls/live/{id}/`. Pipe incoming binary frames to FFmpeg stdin. Register process with health controller
- [x] T031 [US2] Implement live HLS FFmpeg pipeline in `server/src/streams/streams.service.ts` — FFmpeg args for: WebM input from stdin, output 480p/720p/1080p HLS with configurable segment duration (`HLS_SEGMENT_DURATION` env var, default 6s), generate master.m3u8 + variant manifests. Parse FFmpeg stderr for progress events
- [x] T032 [US2] Implement `GET /api/streams` in `server/src/streams/streams.controller.ts` — list active live streams per REST contract
- [x] T033 [US2] Implement `PATCH /api/streams/:id/config` in `server/src/streams/streams.controller.ts` — update segment duration, restart FFmpeg with new segment size at next keyframe boundary
- [x] T034 [US2] Broadcast `stream:started` and `stream:ended` WebSocket messages to all connected clients when a live stream begins/ends (from `streams.service.ts` via `ws.service.ts`)
- [x] T035 [US2] Update `CatalogList` in `client/src/containers/CatalogList.jsx` to show active live streams (from `GET /api/streams`) alongside VOD, auto-update on `stream:started`/`stream:ended` WebSocket events
- [x] T036 [US2] Update `Player` view in `client/src/views/Player.jsx` to detect live vs VOD by ID prefix or type, use correct HLS manifest path (`/hls/live/{id}/master.m3u8`), show `StreamIndicator` live badge

**Checkpoint**: Full live pipeline works. Camera → MediaRecorder → WebSocket → FFmpeg → HLS → hls.js playback. Segment size change causes observable latency difference.

---

## Phase 5: User Story 3 — Presenter Dashboard with Live Stats (Priority: P3)

**Goal**: Real-time dashboard showing viewer count, per-viewer bandwidth/quality, aggregate stats. Presenter controls for upload and segment size. QR code for audience access.

**Independent Test**: Open `/presenter`, connect 3+ viewer tabs, see stats update in real time, throttle one tab's network, confirm dashboard shows quality change within 3 seconds.

### Implementation for User Story 3

- [x] T037 [P] [US3] Create `StatBar` presentational component in `client/src/components/StatBar.jsx` — CSS-only horizontal bar, width driven by CSS custom property, transition animation. Props: label, value, max, unit
- [x] T038 [P] [US3] Create `StatGauge` presentational component in `client/src/components/StatGauge.jsx` — CSS-only circular or large-number gauge. Props: label, value, unit. Designed to be readable from 5 meters on a projector
- [x] T039 [P] [US3] Create `QRDisplay` presentational component in `client/src/components/QRDisplay.jsx` — wrapper around `react-qr-code`, renders URL as SVG QR code. Props: url, size
- [x] T040 [US3] Implement stats aggregation in `server/src/ws/ws.service.ts` — on each `viewer:stats` message, update ViewerSession in memory, compute aggregated stats (viewerCount, avgBandwidth, qualityDistribution), broadcast `stats:update` to presenter connection (throttled to max 2/second)
- [x] T041 [US3] Implement `GET /api/stats` in `server/src/stats/stats.controller.ts` — return current aggregated stats snapshot per REST contract (for initial load before WebSocket connects)
- [x] T042 [US3] Create `StatsPanel` smart container in `client/src/containers/StatsPanel.jsx` — connect to WebSocket as presenter (`presenter:connect`), receive `stats:update` messages, render: viewer count (StatGauge), average bandwidth (StatGauge), quality distribution (StatBar per quality level), per-viewer table (id, quality, bandwidth, buffer)
- [x] T043 [US3] Create `Presenter` view in `client/src/views/Presenter.jsx` — layout combining: VideoUploader (from US1), LiveCamera (from US2), segment size control (slider/input calling `PATCH /api/streams/:id/config`), StatsPanel, QRDisplay (showing current host URL). Full-screen friendly layout for projector
- [x] T044 [US3] Create `QRLanding` view in `client/src/views/QRLanding.jsx` — minimal page that auto-redirects to `/catalog` or shows a welcome message with a "Watch Now" button linking to `/catalog`

**Checkpoint**: All user stories independently functional. Presenter view shows upload + live controls + dashboard + QR code. Stats update in real time. Dashboard readable from across a room.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories, debugging support, fallback content

- [x] T045 [P] Add error handling to all API endpoints — format validation errors per REST contract (400 for bad format/size, 404 for not found), structured error logging
- [x] T046 [P] Add WebSocket error handling — graceful disconnect cleanup (remove ViewerSession on close), reconnect guidance in error messages, handle malformed messages without crashing
- [x] T047 [P] Add edge case handling: upload interruption (discard partial), stream disconnect (viewers see "Stream ended"), transcoding failure (show error on dashboard, make partial qualities available)
- [x] T048 [P] Create pre-recorded fallback content — include a short sample video already transcoded to HLS (480p/720p/1080p) in the Docker volume so the demo works even if live transcoding fails. Place in `/data/hls/vod/fallback/`
- [x] T049 [P] Update `server/src/health/health.controller.ts` to include FFmpeg sub-process details: list all tracked processes with pid, status (running/exited), exit code, stderr tail (last 5 lines). Add Docker Compose `healthcheck` directives for both services
- [x] T050 [P] Review and update `docker-compose.debug.yml` and `notes/debugging.md` (created in T007/T008) — verify inspect port mapping works end-to-end, add any debugging tips discovered during implementation
- [x] T051 Responsive mobile styling for Catalog and Player views — ensure touch-friendly controls and readable text on phone screens (QR code audience path)
- [x] T052 Run `quickstart.md` validation — follow the quickstart guide end-to-end on a fresh clone, verify all steps work, fix any discrepancies

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (VOD) can proceed independently
  - US2 (Live) can proceed independently of US1
  - US3 (Dashboard) depends on US1 and US2 components (VideoUploader, LiveCamera, HlsPlayer)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) — No dependencies on US1 (shares WebSocket gateway but different message types)
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) for backend stats work — BUT the Presenter view (T043) integrates US1's VideoUploader and US2's LiveCamera, so those must be complete first

### Within Each User Story

- Models/services before controllers
- Backend endpoints before frontend containers
- Presentational components (marked [P]) can be built in parallel at any time
- Smart containers depend on their backend endpoints + presentational components
- Views depend on their smart containers

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T006)
- All Foundational tasks marked [P] can run in parallel (T010-T015)
- US1 and US2 backend work can run in parallel (different modules)
- All presentational components across all stories marked [P] can run in parallel
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Parallel: presentational components (no dependencies)
Task: T020 "Create VideoCard in client/src/components/VideoCard.jsx"
Task: T021 "Create StreamIndicator in client/src/components/StreamIndicator.jsx"
Task: T026 "Create PlayerControls in client/src/components/PlayerControls.jsx"

# Sequential: backend pipeline
Task: T016 "Upload endpoint" → T017 "FFmpeg transcoding" → T018 "List/get endpoints" → T019 "WS progress"

# Sequential: frontend pipeline (after backend + components)
Task: T024 "useHls hook" → T025 "HlsPlayer container" → T027 "Player view"
Task: T022 "CatalogList container" → T023 "Catalog view"
Task: T028 "VideoUploader container"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (VOD Upload + Playback)
4. **STOP and VALIDATE**: Upload a video, watch transcoding, play with ABR
5. Deploy/demo if ready — this alone proves the core streaming concept

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → VOD pipeline works → Demo "Wow Factor #2" (bandwidth degradation)
3. Add User Story 2 → Live streaming works → Demo "Wow Factor #1" (segment size tweak)
4. Add User Story 3 → Dashboard ties it all together → Full interactive demo
5. Polish → Error handling, fallback content, debugging configs

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (VOD pipeline)
   - Developer B: User Story 2 (Live pipeline)
   - Both: All presentational components can be split freely
3. User Story 3 integrates after US1 + US2 are ready
4. Polish can be parallelized across team

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Constitution X (Debuggability): T007, T008, T010, T049, T050 ensure debugging support
- Constitution VII (Container-Per-Service): T005, T006, T007 ensure Docker setup
- Constitution VIII (Decision Documentation): T008 goes in `notes/`

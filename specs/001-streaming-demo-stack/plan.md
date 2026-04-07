# Implementation Plan: Streaming Demo Stack

**Branch**: `001-streaming-demo-stack` | **Date**: 2026-04-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-streaming-demo-stack/spec.md`

## Summary

Build a complete streaming demo stack for a timjs meetup presentation: a React SPA (client) and NestJS backend (server) that handle VOD upload + transcoding, live camera streaming via MediaRecorder + WebSocket, HLS adaptive playback, and a real-time presenter dashboard. All containerized with Docker Compose for local development.

## Technical Context

**Language/Version**: JavaScript (ES2024) for React frontend; TypeScript for NestJS backend (decorators require it)
**Primary Dependencies**: React 19, Vite 6, React Router v7, hls.js, react-qr-code (frontend); NestJS 11, ws, @nestjs/serve-static (backend)
**Storage**: Docker volume at `/data/hls/` for video files and HLS segments. No database — all metadata in-memory.
**Testing**: Manual integration testing via Docker Compose. Automated tests optional.
**Target Platform**: Docker containers (linux/amd64), deployed to k3s on tadeo.ro
**Project Type**: Web application (SPA + API server)
**Performance Goals**: 20+ concurrent viewers, <3s stats latency, <10s QR-to-playback
**Constraints**: Max 500 MB uploads (configurable), single live stream at a time, FFmpeg available in server container
**Scale/Scope**: ~50 audience members at a meetup, 1 presenter

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Demo-First | PASS | Every feature is demonstrable in 45 min |
| II. Streaming Correctness | PASS | Industry-standard HLS, proper FFmpeg transcoding |
| III. Audience Interactivity | PASS | QR access, live stats, presenter controls |
| IV. Simplicity & Time Budget | PASS | 12 npm packages total, no database, no auth |
| V. Observability & Live Stats | PASS | WebSocket stats pipeline, real-time dashboard |
| VI. Lean & Clean Code | PASS | Functional JS, plain CSS, ~40-line modules |
| VII. Container-Per-Service | PASS | Dockerfile per service, docker-compose.yml at root |
| VIII. Decision Documentation | PASS | research.md covers all decisions with pros/cons |
| IX. Component-Driven UI | PASS | Smart/dumb split, CSS custom properties, no framework |
| X. Debuggability & Hybrid Dev Mode | PASS | Health endpoint, docker-compose.debug.yml, inspect support, structured logging, notes/debugging.md |

**TypeScript exception**: NestJS requires TypeScript for decorator support. Constitution VI says "No TypeScript unless a dependency demands it" — NestJS demands it. Frontend stays plain JS.

## Project Structure

### Documentation (this feature)

```text
specs/001-streaming-demo-stack/
  plan.md              # This file
  spec.md              # Feature specification
  research.md          # Phase 0 research output
  data-model.md        # Phase 1 data model
  quickstart.md        # Phase 1 quickstart guide
  contracts/
    rest-api.md        # REST endpoint contracts
    websocket-api.md   # WebSocket message contracts
```

### Source Code (repository root)

```text
client/                        # React 19 + Vite 6 SPA
  src/
    components/                # Dumb/presentational
      VideoCard.jsx            # Video thumbnail + info
      PlayerControls.jsx       # Play/pause, quality indicator
      StatBar.jsx              # CSS-only stat bar
      StatGauge.jsx            # CSS-only gauge
      QRDisplay.jsx            # QR code wrapper
      StreamIndicator.jsx      # Live/offline badge
    containers/                # Smart components
      VideoUploader.jsx        # Upload logic + progress
      HlsPlayer.jsx           # hls.js integration + stats reporting
      LiveCamera.jsx           # MediaRecorder + WebSocket
      StatsPanel.jsx           # WebSocket → dashboard data
      CatalogList.jsx          # Fetch + display videos/streams
    views/                     # Route pages
      QRLanding.jsx
      Catalog.jsx
      Player.jsx
      Presenter.jsx
    hooks/
      useWebSocket.js          # Shared WS connection hook
      useHls.js                # hls.js lifecycle hook
    styles/
      variables.css            # All theme tokens (colors, sizes)
      reset.css                # Minimal CSS reset
      layout.css               # Grid/flex layout utilities
    main.jsx                   # App root + router
  index.html
  vite.config.js
  Dockerfile
  package.json

server/                        # NestJS 11
  src/
    app.module.ts              # Root module
    main.ts                    # Bootstrap
    videos/
      videos.controller.ts     # REST: upload, list, get
      videos.service.ts        # Transcoding logic (FFmpeg spawn)
    streams/
      streams.controller.ts    # REST: list, config
      streams.service.ts       # Live stream state management
    ws/
      ws.gateway.ts            # WebSocket gateway (stats + camera)
      ws.service.ts            # Connection tracking, broadcasting
    hls/
      hls.module.ts            # Static file serving config
  tsconfig.json
  Dockerfile
  package.json

docker-compose.yml             # Full stack: client + server + volumes
```

**Structure Decision**: Two top-level directories (`client/`, `server/`) — one per container. No monorepo tooling needed; each has its own `package.json` and `Dockerfile`. The `docker-compose.yml` at the root orchestrates both.

## Complexity Tracking

| Aspect | Why This Approach | Simpler Alternative Rejected Because |
|--------|-------------------|-------------------------------------|
| TypeScript for NestJS | Decorators require it | Plain JS + Babel decorator plugin is fragile and poorly documented for NestJS 11 |
| Two separate npm projects | Container-per-service (Constitution VII) | Single project would mix concerns and complicate Docker builds |

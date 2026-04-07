# Implementation Plan: Delete Uploaded Videos

**Branch**: `002-delete-uploaded-videos` | **Date**: 2026-04-07 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-delete-uploaded-videos/spec.md`

## Summary

Add the ability to delete previously uploaded videos. The presenter can remove any video from the catalog — the system cancels active transcoding, deletes all HLS files from the Docker volume, removes the entity from the in-memory store, and notifies all connected clients via WebSocket. A confirmation prompt prevents accidental deletion.

## Technical Context

**Language/Version**: JavaScript (ES2024) for React frontend; TypeScript for NestJS backend
**Primary Dependencies**: React 19, Vite 6, React Router v7 (frontend); NestJS 11, ws, @nestjs/serve-static (backend) — no new dependencies needed
**Storage**: Docker volume at `/data/hls/` — delete operation removes files from `vod/{id}/` directory
**Testing**: Manual integration testing via Docker Compose
**Target Platform**: Docker containers (linux/amd64)
**Project Type**: Web application (SPA + API server) — extending existing codebase
**Performance Goals**: File cleanup within 10 seconds, catalog update within 3 seconds
**Constraints**: In-memory store (no database), single presenter manages content
**Scale/Scope**: Small feature — 1 new REST endpoint, 1 new WebSocket event, UI changes to 2 existing components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Demo-First | PASS | Delete is demonstrable: upload → delete → gone |
| II. Streaming Correctness | PASS | Properly cleans up HLS manifests and segments |
| III. Audience Interactivity | PASS | Real-time catalog update via WebSocket |
| IV. Simplicity & Time Budget | PASS | 1 endpoint, 1 WS event, minimal UI addition |
| V. Observability & Live Stats | PASS | Delete events logged, dashboard reflects changes |
| VI. Lean & Clean Code | PASS | Extends existing service methods, no new abstractions |
| VII. Container-Per-Service | PASS | No container changes needed |
| VIII. Decision Documentation | PASS | No non-trivial decisions — straightforward CRUD extension |
| IX. Component-Driven UI | PASS | Delete button is presentational, confirmation is a container concern |
| X. Debuggability & Hybrid Dev Mode | PASS | Uses existing structured logging and health endpoint |

## Project Structure

### Documentation (this feature)

```text
specs/002-delete-uploaded-videos/
├── plan.md              # This file
├── data-model.md        # Entity changes
├── contracts/
│   └── rest-api.md      # New DELETE endpoint
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (changes to existing files)

```text
server/src/
├── videos/
│   ├── videos.controller.ts   # Add DELETE /api/videos/:id endpoint
│   └── videos.service.ts      # Add delete method (kill FFmpeg, remove files, remove entity)
└── ws/
    └── ws.gateway.ts           # No changes needed (broadcast via ws.service)

client/src/
├── components/
│   └── VideoCard.jsx           # Add delete button
├── containers/
│   ├── CatalogList.jsx         # Listen for video:deleted WS event
│   └── VideoUploader.jsx       # No changes needed
└── views/
    └── Presenter.jsx           # No changes needed (CatalogList handles it)
```

**Structure Decision**: Pure extension of existing files. No new modules, no new directories.

## Complexity Tracking

No constitution violations. No new complexity introduced.

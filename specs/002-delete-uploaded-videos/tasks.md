# Tasks: Delete Uploaded Videos

**Input**: Design documents from `/specs/002-delete-uploaded-videos/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/

**Tests**: Not explicitly requested in the spec. Tests are omitted.

**Organization**: Tasks are grouped by user story. This is a small feature extending the existing codebase — no setup or foundational phases needed.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Frontend**: `client/src/`
- **Backend**: `server/src/`

---

## Phase 1: User Story 1 — Delete a Video from the Catalog (Priority: P1) MVP

**Goal**: Presenter can delete any video. System kills active transcoding, removes all HLS files, removes entity from store, and notifies all connected clients in real time.

**Independent Test**: Upload a video, wait for transcoding, delete it from the catalog, confirm it disappears from all connected clients and files are removed from the volume.

### Implementation for User Story 1

- [x] T001 [US1] Add `delete` method to `server/src/videos/videos.service.ts` — remove video entity from Map, kill active FFmpeg process (if video status is `transcoding`) via process registry, recursively delete `/data/hls/vod/{id}/` directory and original upload file from `/data/hls/uploads/`
- [x] T002 [US1] Add `DELETE /api/videos/:id` endpoint to `server/src/videos/videos.controller.ts` — call service delete method, return `{ id, deleted: true }` on success, 404 if video not found. After successful delete, broadcast `video:deleted` event via `ws.service.ts`
- [x] T003 [P] [US1] Add delete button to `client/src/components/VideoCard.jsx` — small delete icon/button in the card corner, only rendered when an `onDelete` prop is provided (presenter view passes it, catalog view does not)
- [x] T004 [US1] Update `client/src/containers/CatalogList.jsx` — listen for `video:deleted` WebSocket event and remove the video from local state. When rendered inside the Presenter view, pass `onDelete` callback to VideoCard that calls `DELETE /api/videos/:id`

**Checkpoint**: Videos can be deleted. Files are cleaned up. All connected clients see the removal in real time.

---

## Phase 2: User Story 2 — Confirm Before Deleting (Priority: P2)

**Goal**: A confirmation prompt prevents accidental deletion.

**Independent Test**: Click delete on a video, verify confirmation prompt appears with video title, cancel and verify video remains, confirm and verify video is deleted.

### Implementation for User Story 2

- [x] T005 [US2] Update delete flow in `client/src/containers/CatalogList.jsx` — wrap the `onDelete` callback with a confirmation step: show a confirm dialog (browser `window.confirm` or a simple modal) displaying the video title before executing the DELETE request. Cancel dismisses without action.

**Checkpoint**: Accidental deletes prevented. Full feature complete.

---

## Phase 3: Polish

**Purpose**: Edge cases and cleanup

- [x] T006 [P] Add structured logging for delete operations in `server/src/videos/videos.service.ts` — log video ID, status at time of deletion, files removed, and FFmpeg process kill (if applicable) using the existing JSON log format
- [x] T007 Handle edge case in `server/src/videos/videos.controller.ts` — if a viewer is currently watching the deleted video, the playback will naturally fail when HLS segments are gone. No server-side action needed, but ensure no crash if stats arrive for a deleted video's viewer session

---

## Dependencies & Execution Order

### Phase Dependencies

- **US1 (Phase 1)**: No setup needed — extends existing backend and frontend
- **US2 (Phase 2)**: Depends on US1 (the delete flow must exist before adding confirmation)
- **Polish (Phase 3)**: Can run after US1 is complete

### Within Each User Story

- T001 (service) before T002 (controller) — controller calls service
- T003 (component) can run in parallel with T001/T002 (different codebase)
- T004 (container) depends on T002 (needs the endpoint) and T003 (needs the button)

### Parallel Opportunities

- T001 and T003 can run in parallel (backend service + frontend component)
- T006 and T007 can run in parallel (different concerns in different files)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001–T004 (delete endpoint + UI)
2. **STOP and VALIDATE**: Delete a video, verify files removed, catalog updated
3. Proceed to US2 for confirmation prompt

### Incremental Delivery

1. US1: Delete works end-to-end → Demo-ready
2. US2: Confirmation prompt added → Production-safe
3. Polish: Logging + edge cases → Robust

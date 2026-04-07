# Feature Specification: Delete Uploaded Videos

**Feature Branch**: `002-delete-uploaded-videos`
**Created**: 2026-04-07
**Status**: Draft
**Input**: User description: "have the ability to delete previously uploaded videos"

## User Scenarios & Testing

### User Story 1 - Delete a Video from the Catalog (Priority: P1)

As a presenter, I want to delete a previously uploaded video so that outdated or incorrect recordings no longer appear in the catalog and their storage is reclaimed.

**Why this priority**: Core functionality — without the ability to remove videos, the catalog accumulates stale content and consumes storage indefinitely.

**Independent Test**: Upload a sample video, wait for transcoding to complete, navigate to the catalog or presenter view, delete the video, confirm it disappears from the catalog and its HLS files are removed from storage.

**Acceptance Scenarios**:

1. **Given** a video with status "ready" exists in the catalog, **When** the presenter clicks the delete action on that video, **Then** the system removes the video from the catalog listing and deletes all associated files (original upload and transcoded HLS segments).
2. **Given** a video is currently transcoding, **When** the presenter deletes it, **Then** the system cancels the active transcoding process, removes partial files, and removes the video from the catalog.
3. **Given** a video has been deleted, **When** any user refreshes the catalog, **Then** the deleted video no longer appears in the list.
4. **Given** a viewer is currently watching a video, **When** the presenter deletes that video, **Then** the viewer's playback stops gracefully (stream ends rather than an abrupt error).

---

### User Story 2 - Confirm Before Deleting (Priority: P2)

As a presenter, I want to see a confirmation prompt before a video is permanently deleted so that I don't accidentally remove the wrong video.

**Why this priority**: Prevents accidental data loss. Important for usability but the delete action works without it.

**Independent Test**: Click delete on a video, verify a confirmation dialog appears, click cancel and verify the video remains, click delete again and confirm, verify the video is removed.

**Acceptance Scenarios**:

1. **Given** the presenter clicks delete on a video, **When** the confirmation prompt appears, **Then** it displays the video title and asks "Are you sure you want to delete this video?".
2. **Given** the confirmation prompt is showing, **When** the presenter clicks cancel, **Then** the prompt closes and the video remains unchanged.
3. **Given** the confirmation prompt is showing, **When** the presenter confirms deletion, **Then** the video is deleted and the catalog updates.

---

### Edge Cases

- What happens when a delete request is sent for a video that no longer exists (already deleted or invalid ID)? The system returns a clear "not found" response.
- What happens when file deletion partially fails (e.g., some HLS segments can't be removed)? The video is still removed from the in-memory catalog; orphaned files don't block the operation.
- What happens if the presenter tries to delete a video while it is in "upload_pending" status? The system allows deletion and discards any partially uploaded file.
- What happens if two delete requests arrive for the same video simultaneously? The first succeeds, the second returns "not found" — no errors or crashes.

## Requirements

### Functional Requirements

- **FR-001**: The system MUST provide a way to delete a specific video by its identifier.
- **FR-002**: Deleting a video MUST remove the video entity from the in-memory catalog.
- **FR-003**: Deleting a video MUST remove all associated files from storage — the original upload and all transcoded HLS output (master manifest, variant manifests, segment files).
- **FR-004**: If the video is currently being transcoded, deleting it MUST terminate the active transcoding process before removing files.
- **FR-005**: The delete action MUST be accessible from the presenter interface (only the presenter manages content).
- **FR-006**: The system MUST show a confirmation prompt before executing a permanent delete.
- **FR-007**: After successful deletion, all connected clients MUST see the video removed from the catalog without requiring a manual refresh (real-time update).
- **FR-008**: The system MUST return a clear error message when attempting to delete a video that does not exist.

### Key Entities

- **Video**: Existing entity — delete operation transitions it from any status to removal (entity deleted from store, files purged from volume).
- **HLS Output**: All files under the video's output directory are deleted recursively.

## Success Criteria

### Measurable Outcomes

- **SC-001**: A presenter can delete any video in 2 actions or fewer (click delete, confirm).
- **SC-002**: Deleted video disappears from all connected clients' catalogs within 3 seconds.
- **SC-003**: All storage associated with a deleted video is fully reclaimed within 10 seconds of deletion.
- **SC-004**: Deleting a video that is mid-transcode terminates the process and frees resources within 5 seconds.

## Assumptions

- Only the presenter can delete videos; viewers have no delete capability (no authentication system exists — this follows the existing presenter-only content management pattern).
- This is a demo system — there is no undo/trash/soft-delete. Deletion is immediate and permanent.
- The delete action applies only to VOD uploads, not to live stream recordings (live streams end and their data is separate).
- The existing WebSocket infrastructure (used for transcode:complete events) will be leveraged to notify connected clients of deletions in real time.

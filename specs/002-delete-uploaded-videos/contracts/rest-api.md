# REST API Contract: Delete Uploaded Videos

**Base URL**: `http://{host}:3000/api`

## New Endpoint

### DELETE /api/videos/:id

Delete a video and all associated files.

- **Path Parameter**: `id` (string, UUID) — the video identifier
- **Response 200**:
  ```json
  { "id": "uuid", "deleted": true }
  ```
- **Response 404**:
  ```json
  { "error": "Video not found" }
  ```

**Side effects**:
- Kills active FFmpeg process if video is mid-transcode
- Removes all files under `/data/hls/vod/{id}/`
- Removes original upload file from `/data/hls/uploads/`
- Removes video entity from in-memory store
- Broadcasts `video:deleted` WebSocket event to all connected clients

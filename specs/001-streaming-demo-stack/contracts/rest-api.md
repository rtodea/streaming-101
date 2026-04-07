# REST API Contract

**Base URL**: `http://{host}:3000/api`

## Videos (VOD)

### POST /api/videos/upload

Upload a video file for transcoding.

- **Content-Type**: `multipart/form-data`
- **Field**: `file` (MP4, WebM, or MOV, max 500 MB default)
- **Response 201**:
  ```json
  { "id": "uuid", "title": "filename.mp4", "status": "transcoding" }
  ```
- **Response 400**: `{ "error": "Unsupported format" }` or `{ "error": "File too large" }`

### GET /api/videos

List all uploaded videos.

- **Response 200**:
  ```json
  [
    {
      "id": "uuid",
      "title": "demo.mp4",
      "status": "ready",
      "qualities": ["480p", "720p", "1080p"],
      "transcodingProgress": 100,
      "createdAt": "2026-04-07T10:00:00Z"
    }
  ]
  ```

### GET /api/videos/:id

Get single video details.

- **Response 200**: Same shape as array element above
- **Response 404**: `{ "error": "Video not found" }`

## Streams (Live)

### GET /api/streams

List active live streams.

- **Response 200**:
  ```json
  [
    {
      "id": "uuid",
      "status": "live",
      "segmentDuration": 6,
      "qualities": ["480p", "720p", "1080p"],
      "startedAt": "2026-04-07T10:00:00Z"
    }
  ]
  ```

### PATCH /api/streams/:id/config

Update live stream configuration (presenter only).

- **Body**: `{ "segmentDuration": 2 }`
- **Response 200**: `{ "id": "uuid", "segmentDuration": 2 }`
- **Response 404**: `{ "error": "Stream not found" }`

## HLS Content

### GET /hls/vod/:videoId/master.m3u8

Serve VOD master manifest. Served as static files from the volume.

### GET /hls/live/:sessionId/master.m3u8

Serve live master manifest.

### GET /hls/**/*.ts

Serve HLS segment files. All under `/hls/` are static file serving.

## Dashboard Stats

### GET /api/stats

Current aggregated stats snapshot.

- **Response 200**:
  ```json
  {
    "viewerCount": 23,
    "viewers": [
      {
        "id": "uuid",
        "connectedTo": "video-uuid",
        "currentQuality": "720p",
        "bandwidth": 4500,
        "bufferLevel": 8.2
      }
    ],
    "avgBandwidth": 3800,
    "qualityDistribution": { "480p": 5, "720p": 12, "1080p": 6 }
  }
  ```

# Quickstart: Streaming Demo Stack

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development without containers)
- A webcam (for live streaming demo)

## Start the Full Stack (Docker Compose)

```bash
docker compose up
```

This starts:
- **Frontend** (React SPA): http://localhost:5173
- **Backend** (NestJS API + WebSocket): http://localhost:3000
- **FFmpeg** is installed inside the backend container

## Demo Flow

### 1. VOD Upload & Playback

1. Open **Presenter view**: http://localhost:5173/presenter
2. Upload a video file (MP4, WebM, or MOV)
3. Watch transcoding progress on the dashboard
4. Open **Catalog**: http://localhost:5173/catalog
5. Select the video and play it

### 2. Live Streaming

1. On the **Presenter view**, click "Start Live Stream"
2. Allow camera access in the browser
3. Open the **Catalog** on another device — the live stream appears
4. On the presenter dashboard, change segment size to see latency change

### 3. Audience Demo

1. On the **Presenter view**, note the QR code
2. Audience scans QR → lands on http://{host}:5173/
3. Audience opens catalog, picks a stream
4. Presenter sees viewer stats update in real time on the dashboard
5. Audience covers phone antenna → dashboard shows quality degradation

## Project Structure

```
streaming-101/
  client/                    # React 19 + Vite 6 SPA
    src/
      components/            # Dumb/presentational components
      containers/            # Smart components (data fetching)
      views/                 # 4 route views
        QRLanding.jsx
        Catalog.jsx
        Player.jsx
        Presenter.jsx
      hooks/                 # useWebSocket, useHls, etc.
      styles/                # CSS with custom properties
        variables.css        # All theme tokens
      main.jsx
    Dockerfile
    vite.config.js

  server/                    # NestJS 11 backend
    src/
      videos/                # VOD upload + transcoding
      streams/               # Live stream management
      stats/                 # WebSocket stats gateway
      hls/                   # Static file serving
      main.js
    Dockerfile

  docker-compose.yml         # Full stack orchestration
  notes/                     # Decision documentation
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| MAX_UPLOAD_SIZE | 500MB | Maximum video upload size |
| HLS_SEGMENT_DURATION | 6 | Default HLS segment size (seconds) |
| HLS_OUTPUT_DIR | /data/hls | Where transcoded segments are stored |
| PORT | 3000 | Backend server port |
| CLIENT_PORT | 5173 | Frontend dev server port |

## Key URLs

| URL | Purpose |
|-----|---------|
| / | QR Landing — audience entry point |
| /catalog | Video catalog + live streams |
| /player/:id | VOD or live playback |
| /presenter | Upload, dashboard, live controls |
| /api/* | REST API |
| /hls/* | HLS manifests and segments |
| ws://host:3000/ws | WebSocket (stats + camera ingest) |

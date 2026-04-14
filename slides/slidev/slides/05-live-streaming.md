# Browser Caching: VOD vs Live

HLS chunks are just HTTP responses — the browser (and CDNs) can cache them. But the caching strategy is **opposite** for VOD and live.

<table>
<thead><tr><th></th><th>VOD</th><th>Live</th></tr></thead>
<tbody>
<tr><td v-click><b>Chunks (.ts)</b></td><td v-click>Immutable — cache forever</td><td v-click>Immutable — cache, but short-lived on disk</td></tr>
<tr><td v-click><b>Manifest (.m3u8)</b></td><td v-click>Static — cache aggressively</td><td v-click>Changes every segment — <b>must not cache</b></td></tr>
<tr><td v-click><b>Cache-Control</b></td><td v-click><code>max-age=31536000</code></td><td v-click><code>no-cache</code> or <code>max-age=1</code></td></tr>
<tr><td v-click><b>Seeking</b></td><td v-click>Any chunk instantly (cached)</td><td v-click>Only recent window (old chunks expire)</td></tr>
<tr><td v-click><b>Replay</b></td><td v-click>Free — served from cache</td><td v-click>Impossible unless DVR window configured</td></tr>
</tbody>
</table>

<v-click>

> VOD = cache everything. Live = cache chunks, **never** cache the manifest.

</v-click>

---

# Live Streaming

<v-clicks>

- **Ingest**: Camera → WebRTC/MediaRecorder → WebSocket binary → Server
- **Transcode**: FFmpeg encodes to 1080p + 720p + 480p simultaneously
- **Deliver**: HLS chunks generated on-the-fly → viewers pull via `.m3u8` manifest

</v-clicks>

---

# Segment Size vs Latency

HLS requires **~3 chunks buffered** before playback starts.

<table>
<thead><tr><th>Segment Size</th><th>Chunks Buffered</th><th>Latency</th></tr></thead>
<tbody>
<tr><td v-click>6 seconds</td><td v-click>3</td><td v-click><b>~18s</b></td></tr>
<tr><td v-click>2 seconds</td><td v-click>3</td><td v-click><b>~6s</b></td></tr>
<tr><td v-click>1 second</td><td v-click>3</td><td v-click><b>~3s</b></td></tr>
</tbody>
</table>

<v-click>

Shorter segments = lower latency, but more HTTP requests and less compression efficiency.

</v-click>

---
clicks: 7
---

# Live Streaming Pipeline

<MermaidReveal :diagram="`
sequenceDiagram
    participant Cam as Camera
    participant WS as WebSocket
    participant API as NestJS
    participant T as FFmpeg
    participant S as HLS Storage
    participant V as Viewers
    Cam->>WS: MediaRecorder binary frames
    WS->>API: Binary WebSocket data
    API->>T: Pipe raw input to FFmpeg
    T->>S: Write HLS chunks (.ts)
    T->>S: Update live manifest (.m3u8)
    V->>S: Poll manifest for new chunks
    S-->>V: New .ts chunk → playback
`" />

---
layout: demo-break
title: Live Stream & Stats Demo
url: /presenter
---

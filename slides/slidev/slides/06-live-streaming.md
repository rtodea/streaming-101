# Browser Caching: VOD vs Live

HLS chunks are just HTTP responses, so the browser (and CDNs) can cache them. But the caching strategy is **opposite** for VOD and live.

<table>
<thead><tr><th></th><th>VOD</th><th>Live</th></tr></thead>
<tbody>
<tr><td v-click><b>Chunks (.ts)</b></td><td v-click>Immutable, cache forever</td><td v-click>Immutable, cache but short-lived on disk</td></tr>
<tr><td v-click><b>Manifest (.m3u8)</b></td><td v-click>Static, cache aggressively</td><td v-click>Changes every segment, <b>must not cache</b></td></tr>
<tr><td v-click><b>Cache-Control</b></td><td v-click><code>max-age=31536000</code></td><td v-click><code>no-cache</code> or <code>max-age=1</code></td></tr>
<tr><td v-click><b>Seeking</b></td><td v-click>Any chunk instantly (cached)</td><td v-click>Only recent window (old chunks expire)</td></tr>
<tr><td v-click><b>Replay</b></td><td v-click>Free, served from cache</td><td v-click>Impossible unless DVR window configured</td></tr>
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

# The Rolling Window

FFmpeg's "live" HLS mode is a **sliding window** of recent segments.

<v-clicks>

- `-hls_time 4`: each segment covers ~4 seconds of video
- `-hls_list_size 5`: manifest lists only the most recent 5 segments
- `-hls_flags delete_segments`: older `.ts` files are **erased from disk**

</v-clicks>

<v-click>

Net effect: at any moment, only the last **~20 seconds** of the stream exists. Anything older is gone; the server has no memory.

</v-click>

---

# Window in Motion

<MermaidReveal :diagram="`
flowchart LR
    new[seg-10 new]:::fresh
    s5[seg-05] --> s6[seg-06] --> s7[seg-07] --> s8[seg-08] --> s9[seg-09]
    gone[seg-04 deleted]:::expired
    new --> s5
    s9 --> gone
    classDef fresh fill:#d4edda,stroke:#28a745,color:#155724
    classDef expired fill:#f8d7da,stroke:#dc3545,color:#721c24
`" />

<v-click>

Every 4 seconds: one segment joins the head, one segment drops off the tail. The live edge keeps moving; the past disappears.

</v-click>

---

# Playlist Types

`#EXT-X-PLAYLIST-TYPE` tells the player what kind of manifest this is.

<table>
<thead><tr><th></th><th>VOD</th><th>EVENT</th><th>LIVE <em>(no tag)</em></th></tr></thead>
<tbody>
<tr><td v-click><b>Segments can be removed?</b></td><td v-click>No</td><td v-click>No</td><td v-click>Yes</td></tr>
<tr><td v-click><b>Playlist grows?</b></td><td v-click>No (fixed)</td><td v-click>Yes (append)</td><td v-click>Sliding window</td></tr>
<tr><td v-click><b>Player can scrub back?</b></td><td v-click>Full timeline</td><td v-click>Full timeline</td><td v-click>Only current window</td></tr>
<tr><td v-click><b>Ends with <code>#EXT-X-ENDLIST</code>?</b></td><td v-click>Yes</td><td v-click>When done</td><td v-click>Never</td></tr>
<tr><td v-click><b>FFmpeg flag</b></td><td v-click><code>-hls_playlist_type vod</code></td><td v-click><code>-hls_playlist_type event</code></td><td v-click>default</td></tr>
</tbody>
</table>

<v-click>

> `EVENT` is the sweet spot for live-with-DVR: append-only, scrubbable, and becomes a finished playlist when the stream ends.

</v-click>

---

# DVR: Three Flags Flipped

```ts {all|2-3|2-3|5|all}
// Before: sliding window, ~20s of history
'-hls_list_size', '5',
'-hls_flags', 'delete_segments+append_list',

// After: full DVR + auto-archive
'-hls_playlist_type', 'event',
```

<v-clicks>

- `-hls_list_size` → implicitly `0` (unbounded) under EVENT mode
- No more `delete_segments`; every `.ts` file stays on disk
- When stdin closes, FFmpeg writes `#EXT-X-ENDLIST` → playlist is now a complete VOD

</v-clicks>

---

# Archive: Live → VOD, No Re-encode

When the camera stops, the recording is **already on disk** as HLS segments.

<v-clicks>

1. Close ffmpeg's stdin → it finalizes the last segment + writes `#EXT-X-ENDLIST`
2. `mv /data/hls/live/{id}  →  /data/hls/vod/{id}`
3. Register the directory as a new `Video` entity
4. Broadcast `transcode:complete` → catalog refreshes

</v-clicks>

<v-click>

No transcoding. No copying. Just a filesystem rename, and the exact same bytes are now a VOD.

</v-click>

---

# Archive Sequence

<MermaidReveal :diagram="`
sequenceDiagram
    participant Cam as Camera (client)
    participant WS as WebSocket Gateway
    participant SS as StreamsService
    participant FF as FFmpeg
    participant FS as /data/hls
    participant VS as VideosService
    Cam->>WS: camera:stop (or disconnect)
    WS->>SS: stopLiveStream(id)
    SS->>FF: stdin.end()
    FF->>FS: write final segment
    FF->>FS: append #EXT-X-ENDLIST
    FF-->>SS: process exit
    SS->>FS: rename live/{id} → vod/{id}
    SS->>VS: registerArchivedLive(id, title)
    VS->>WS: broadcast transcode:complete
    WS-->>Cam: catalog has new video
`" />

---

# Storage Layout

```text {all|2-5|6-9|all}
/data/hls/
├── live/                          ← only while recording
│   └── {streamId}/
│       ├── master.m3u8
│       └── 720p/stream.m3u8 + segments
├── vod/                           ← permanent
│   ├── {uploadedVideoId}/         ← from Upload → transcoded
│   └── {archivedStreamId}/        ← from Live → renamed
│       ├── master.m3u8            ← ends with #EXT-X-ENDLIST
│       └── 720p/stream.m3u8 + segments
```

<v-click>

The server rebuilds `VideosService`'s in-memory catalog from `vod/` at startup, so archived streams survive restarts for free.

</v-click>

---
layout: demo-break
title: Live Stream with DVR + Archive Demo
url: /presenter
---

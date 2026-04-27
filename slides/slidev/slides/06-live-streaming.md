# Browser Caching: VOD vs Live

HLS chunks are just HTTP responses, so the browser (and CDNs) can cache them. But the caching strategy is **opposite** for VOD and live.

<div v-click>
<table>
<thead><tr><th></th><th>VOD</th><th>Live</th></tr></thead>
<tbody>
<tr v-click><td><b>Chunks (.ts)</b></td><td>Immutable, cache forever</td><td>Immutable, cache but short-lived on disk</td></tr>
<tr v-click><td><b>Manifest (.m3u8)</b></td><td>Static, cache aggressively</td><td>Changes every segment, <b>must not cache</b></td></tr>
<tr v-click><td><b>Cache-Control</b></td><td><code>max-age=31536000</code></td><td><code>no-cache</code> or <code>max-age=1</code></td></tr>
<tr v-click><td><b>Seeking</b></td><td>Any chunk instantly (cached)</td><td>Only recent window (old chunks expire)</td></tr>
<tr v-click><td><b>Replay</b></td><td>Free, served from cache</td><td>Impossible unless DVR window configured</td></tr>
</tbody>
</table>
</div>


<v-click>

> VOD = cache everything. Live = cache chunks, **never** cache the manifest.

</v-click>

---
clicks: 8
---

# VOD vs Live: How the Client Sees Them

Same `.m3u8` format. Opposite temporal contracts.

<div class="grid grid-cols-2 gap-4 vod-live">

<div>

<h3 class="vod-live__title">VOD: full timeline visible</h3>

<MermaidReveal :diagram="`
sequenceDiagram
    participant C as Client
    participant O as Origin
    C->>O: GET master.m3u8
    O-->>C: variants (1080p / 720p / 480p)
    C->>O: GET 1080p/index.m3u8
    O-->>C: full list + ENDLIST
    C->>O: GET seg_001.ts
    C->>O: GET seg_002.ts
    C->>O: GET seg_003.ts
`" />

</div>

<div>

<h3 class="vod-live__title">Live: peephole on the present</h3>

<MermaidReveal :diagram="`
sequenceDiagram
    participant C as Client
    participant S as Packager
    C->>S: GET live.m3u8
    S-->>C: window: seg 104, 105, 106
    C->>S: GET seg_104.ts
    Note over S: encoding seg_107
    C->>S: GET live.m3u8 (re-poll)
    S-->>C: window: seg 105, 106, 107
    C->>S: GET seg_107.ts
`" />

</div>

</div>

<v-click at="8">

> VOD is a complete book. Live is a ticker tape.

</v-click>

<style scoped>
.vod-live__title { font-size: 0.85em; text-align: center; margin: 0 0 0.2em; font-weight: 600; }
.vod-live :deep(.mermaid-reveal) { padding: 0.3rem; height: auto; }
.vod-live :deep(.mermaid-reveal svg) {
  max-width: 100% !important;
  max-height: 48vh !important;
  display: block;
  margin: 0 auto;
}
blockquote { font-size: 0.9em; margin-top: 0.4em; text-align: center; }
</style>

---

# Live Streaming

<v-clicks>

- **Ingest**: Camera → WebRTC/MediaRecorder → WebSocket binary → Server
- **Transcode**: FFmpeg encodes to 1080p + 720p + 480p simultaneously
- **Deliver**: HLS chunks generated on-the-fly → viewers pull via `.m3u8` manifest

</v-clicks>

---

# Two Clocks Tug at the Stream

Streaming is a fight between two clocks that wish they were identical.

<v-clicks>

- **Producer clock** *(at the encoder)*: ticks every time a frame is captured. Steady at, say, 30 Hz.
- **Consumer clock** *(at the browser GPU)*: ticks every time a frame is drawn. Also 30 Hz.
- The **network** between them is a *time stretcher*. Two packets sent 33 ms apart can arrive 200 ms apart, or 5 ms apart.

</v-clicks>

<v-click>

### The conveyor-belt metaphor

</v-click>

<v-clicks>

- The encoder puts 30 boxes per second onto a belt.
- The player takes 30 boxes per second off the belt.
- If the belt's speed is perfectly constant, the buffer never fills or drains.
- The internet is **not a belt**. It is a series of unreliable couriers, each taking a slightly different amount of time.

</v-clicks>

<v-click>

> The buffer's job is to absorb the difference between the belt the encoder thinks it's on and the one the network actually provides.

</v-click>

<style scoped>
ul { font-size: 0.82em; margin: 0.3em 0; }
ul li { margin: 0.1em 0; }
h3 { font-size: 0.95em; margin: 0.4em 0 0.15em; }
blockquote { font-size: 0.85em; margin-top: 0.4em; }
</style>

---

# Latency vs Jitter: The Real Killer

> Latency is **fixed delay**. Jitter is **variable delay**. Continuity dies on jitter, not latency.

<div v-click>
<table class="lj-table">
<thead><tr><th></th><th>Latency</th><th>Jitter</th></tr></thead>
<tbody>
<tr v-click><td><b>What it is</b></td><td>How long any one packet takes</td><td>How much packet times <em>vary</em></td></tr>
<tr v-click><td><b>Example</b></td><td>Every packet: 200 ms</td><td>100, 900, 50, 300 ms ...</td></tr>
<tr v-click><td><b>Effect on player</b></td><td>Just starts 200 ms later. Smooth.</td><td>"I needed a frame 30 ms ago. Where is it?"</td></tr>
<tr v-click><td><b>Mitigation</b></td><td>None needed</td><td>Pre-buffer enough seconds to absorb the worst spike</td></tr>
</tbody>
</table>
</div>

<v-clicks>

- A perfectly slow link (high latency, zero jitter) plays smoothly. It just sits behind reality.
- A perfectly fast link with bursts (low latency, high jitter) **stutters** unless the buffer is big enough.
- "Average bandwidth" is a misleading number for live. Worst-case **arrival variance** matters more.

</v-clicks>

<v-click>

> A slow, steady stream beats a fast, bursty one. The buffer is a *shock absorber*, not a battery.

</v-click>

<style scoped>
.lj-table { font-size: 0.72em; margin-top: 0.3em; }
.lj-table th, .lj-table td { padding: 0.25em 0.5em; vertical-align: top; }
ul { font-size: 0.75em; margin: 0.25em 0; }
ul li { margin: 0.1em 0; }
blockquote { font-size: 0.82em; margin: 0.3em 0; }
</style>

---
clicks: 7
---

# The Life of One Second of Video

<MermaidReveal :diagram="`
sequenceDiagram
    participant Cam as Camera
    participant Enc as Encoder
    participant Net as Network
    participant Buf as Browser Buffer
    participant GPU as GPU
    Cam->>Enc: 30 raw frames captured (~33 ms each)
    Enc->>Enc: Compress to I, P, B frames (50 to 200 ms)
    Enc->>Net: Send segment over HTTP
    Net->>Buf: Arrive after 100 to 900 ms (jitter!)
    Buf->>Buf: Hold a few seconds as a cushion
    Buf->>GPU: Release at clean 30 Hz
    GPU->>GPU: Decode and draw
`" />

> Jitter goes in, smoothness comes out. The buffer is what bridges them.

<style scoped>
blockquote { font-size: 0.85em; margin-top: 0.5em; text-align: center; }
</style>

---

# Segment Size vs Latency

HLS requires **~3 chunks buffered** before playback starts.

<div v-click>
<table>
<thead><tr><th>Segment Size</th><th>Chunks Buffered</th><th>Latency</th></tr></thead>
<tbody>
<tr v-click><td>6 seconds</td><td>3</td><td><b>~18s</b></td></tr>
<tr v-click><td>2 seconds</td><td>3</td><td><b>~6s</b></td></tr>
<tr v-click><td>1 second</td><td>3</td><td><b>~3s</b></td></tr>
</tbody>
</table>
</div>


<v-click>

Shorter segments = lower latency, but more HTTP requests and less compression efficiency.

</v-click>

---

# Why "Live" Is 7 to 30 Seconds Behind

"Live" TV is a polite fiction. By the time a goal hits your TV, the stadium has already cheered.

<div v-click>
<table class="latency-table">
<thead><tr><th>Stage</th><th>Cost</th><th>Why</th></tr></thead>
<tbody>
<tr v-click><td><b>Encoding</b></td><td>1 to 2 s</td><td>Lookahead for B-frames, motion estimation</td></tr>
<tr v-click><td><b>Segmentation</b></td><td>~6 s</td><td>HLS player wants 3 segments before play. 2 s × 3 = 6 s.</td></tr>
<tr v-click><td><b>CDN propagation</b></td><td>1 to 2 s</td><td>Origin to edge hops; cache fill on first request</td></tr>
<tr v-click><td><b>Player buffer</b></td><td>2 to 10 s</td><td>Headroom for network jitter</td></tr>
<tr v-click><td><b>Total</b></td><td><b>10 to 30 s</b></td><td>Standard HLS, end to end</td></tr>
</tbody>
</table>
</div>

<v-click>

### The faster alternatives

</v-click>

<v-clicks>

- **Low-Latency HLS (LL-HLS)**: streams partial segments before the full one is finished. End-to-end ~1 s.
- **WebRTC**: skips HLS entirely, runs over UDP with no segmentation. ~200 ms. Different protocol, no CDN scale.

</v-clicks>

<v-click>

> HLS's bargain: **pay 7 to 30 s in latency, get infinite scale via plain HTTP CDNs**. For most live, that trade is fine.

</v-click>

<style scoped>
.latency-table { font-size: 0.75em; margin: 0.3em 0; }
.latency-table th, .latency-table td { padding: 0.25em 0.5em; vertical-align: top; }
h3 { font-size: 0.95em; margin: 0.4em 0 0.15em; }
ul { font-size: 0.78em; margin: 0.25em 0; }
ul li { margin: 0.1em 0; }
blockquote { font-size: 0.82em; margin-top: 0.3em; }
</style>

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

# Playlist Types

`#EXT-X-PLAYLIST-TYPE` tells the player what kind of manifest this is.

<div v-click>
<table>
<thead><tr><th></th><th>VOD</th><th>EVENT</th><th>LIVE <em>(no tag)</em></th></tr></thead>
<tbody>
<tr v-click><td><b>Segments can be removed?</b></td><td>No</td><td>No</td><td>Yes</td></tr>
<tr v-click><td><b>Playlist grows?</b></td><td>No (fixed)</td><td>Yes (append)</td><td>Sliding window</td></tr>
<tr v-click><td><b>Player can scrub back?</b></td><td>Full timeline</td><td>Full timeline</td><td>Only current window</td></tr>
<tr v-click><td><b>Ends with <code>#EXT-X-ENDLIST</code>?</b></td><td>Yes</td><td>When done</td><td>Never</td></tr>
<tr v-click><td><b>FFmpeg flag</b></td><td><code>-hls_playlist_type vod</code></td><td><code>-hls_playlist_type event</code></td><td>default</td></tr>
</tbody>
</table>
</div>


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

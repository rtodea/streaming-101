---
layout: demo-break
title: Upload & Transcode Demo
url: /presenter
---

---
clicks: 7
---

# VOD Pipeline

<MermaidReveal :diagram="`
sequenceDiagram
    participant C as Creator
    participant API as NestJS API
    participant T as FFmpeg Transcoder
    participant S as Storage
    C->>API: Upload raw video
    API->>S: Store original file
    API->>T: Trigger transcoding job
    T->>T: Encode 1080p (high)
    T->>T: Encode 720p (medium)
    T->>T: Encode 480p (low)
    T->>S: Store HLS chunks + manifest
`" />

---

# What's an `.m3u8` File?

<v-clicks>

- **M3U** = "MP3 URL" — a playlist format from the Winamp era (1990s)
- **M3U8** = M3U encoded in **UTF-8** (the "8" is the encoding, not a version number)
- Apple adopted it for HLS — it's just a **text file** listing chunk URLs

</v-clicks>

<v-click>

### Master playlist (quality variants)

```
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p/playlist.m3u8
```

</v-click>

<v-click>

### Media playlist (chunks for one quality)

```
#EXTM3U
#EXT-X-TARGETDURATION:6
#EXTINF:6.000,
segment-000.ts
#EXTINF:6.000,
segment-001.ts
#EXTINF:4.120,
segment-002.ts
#EXT-X-ENDLIST
```

</v-click>

---

# The HLS Browser Gap

HLS is an Apple-born standard. Support is fragmented across the desktop web.

<div class="grid grid-cols-2 gap-4">
<div v-click>

### Native Support (Safari/iOS)
- `<video src="stream.m3u8">` works out of the box.
- Browser handles everything (fetch, buffer, quality).
- **Cons:** Very limited control or telemetry.

</div>
<div v-click>

### No Native Support (Chrome/Firefox/Edge)
- Browser has no idea how to parse `.m3u8`.
- Loading it as a `src` results in an error.
- **Solution:** We need a JavaScript "driver" to teach the browser HLS.

</div>
</div>

---

# hls.js: The JavaScript Driver

`hls.js` is a massive library because it re-implements the entire video stack in JS.

<v-clicks>

- **Fetch**: Uses standard `fetch`/`XHR` to download manifests and segments.
- **Transmuxing**: HLS often uses `.ts` (MPEG-TS). Browsers prefer `.mp4` (ISO BMFF). `hls.js` converts bytes on-the-fly in a Web Worker.
- **MSE (Media Source Extensions)**: The "Manual Pump" API that feeds raw bytes into the `<video>` element.
- **ABR Logic**: It monitors your bandwidth and decides when to switch qualities.

</v-clicks>

<v-click>

> Without `hls.js`, HLS streaming would fail for ~80% of desktop users.

</v-click>

---

# Media Source Extensions (MSE)

The `<video>` tag was designed for **one file → one video**. But streaming needs to feed chunks dynamically.

<v-click>

### The problem

</v-click>

<v-clicks>

- `<video src="movie.mp4">` loads one file — no way to switch quality mid-stream
- HLS/DASH need to fetch **small chunks** and stitch them together on the fly
- The browser has no built-in HLS support (except Safari)

</v-clicks>

<v-click>

### MSE — the solution (2013, W3C spec)

</v-click>

<v-clicks>

- JavaScript creates a `MediaSource` object and wires it to `<video>` via a blob URL
- Opens a `SourceBuffer` — a pipe where JS can **push raw media chunks**
- The browser's C++ decoder processes each chunk as if it were part of one continuous file
- This is **exactly** what hls.js does — it's an MSE client

</v-clicks>

---

# MSE: How hls.js Wires It Up

<v-click>

```javascript
// 1. Create a MediaSource and connect it to <video>
const ms = new MediaSource();
video.src = URL.createObjectURL(ms);

// 2. When ready, open a SourceBuffer for the codec
ms.addEventListener('sourceopen', () => {
  const sb = ms.addSourceBuffer('video/mp4; codecs="avc1.64001f"');

  // 3. Fetch an HLS chunk and push it in
  fetch('/hls/720p/segment-001.ts')
    .then(r => r.arrayBuffer())
    .then(data => sb.appendBuffer(data));
});
```

</v-click>

<v-click>

### What this unlocks

</v-click>

<v-clicks>

- **Adaptive bitrate** — switch quality by pushing chunks from a different playlist
- **Live streaming** — keep appending new chunks as they arrive
- **Seeking** — jump to any point by fetching the right chunk and appending it
- **Gap handling** — detect buffering gaps and fetch missing segments

</v-clicks>

<v-click>

> Without MSE, libraries like hls.js, dash.js, and Shaka Player **could not exist**.

</v-click>

---

# MSE: The Byte Pipeline

How `hls.js` talks to the hardware.

<MermaidReveal :diagram="`
flowchart LR
    URL[.m3u8] --> JS[hls.js]
    JS -->|Fetch .ts| Seg[Segment Bytes]
    Seg -->|Transmux| MP4[fMP4 Bytes]
    MP4 -->|SourceBuffer.appendBuffer| MSE[MediaSource API]
    MSE --> V[Video Tag]
    V --> GPU[GPU / Display]
`" />

<v-click>

MSE turned the `<video>` tag from a **Black Box** (we give a URL, it does magic) into a **Sink** (we pump raw bytes, it plays them).

</v-click>

---

# Adaptive Bitrate Streaming (ABR)

<v-clicks>

- The video isn't sent as one file — it's **chopped into small chunks** (2–6 seconds).
- The server provides a **manifest** (`.m3u8`) listing all quality variants and their chunks.
- The player measures **download speed** in real-time and picks the best quality for the next chunk.

</v-clicks>

<v-click>

$$Q^{*} = \arg\max_{q} \; Q(q) \quad \text{s.t.} \quad R(q) \leq B_{\text{estimated}}$$

</v-click>

---
clicks: 8
---

# ABR Viewer Flow

<MermaidReveal :diagram="`
sequenceDiagram
    participant V as Viewer (hls.js)
    participant API as NestJS API
    participant S as HLS Storage
    V->>API: Request video catalog
    API-->>V: Video list
    V->>S: Fetch master.m3u8
    S-->>V: Manifest with quality variants
    V->>V: Select initial quality (start low)
    V->>S: Request chunk from selected stream
    S-->>V: .ts chunk
    V->>V: Append to playback buffer
`" />

---
layout: demo-break
title: ABR & Quality Selector Demo
url: /catalog
---

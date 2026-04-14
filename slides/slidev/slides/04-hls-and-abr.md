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

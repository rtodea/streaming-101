---
theme: default
colorSchema: light
title: 'Streaming 101: From Pixels to Packets in JavaScript'
info: |
  A timjs meetup presentation on how video streaming actually works —
  from raw pixels to HLS adaptive bitrate delivery.
fonts:
  sans: Inter
  mono: JetBrains Mono
  local: Inter, JetBrains Mono
highlighter: shiki
drawings:
  persist: false
transition: slide-left
---

---
layout: cover-image
image: /images/cover-placeholder.svg
---

# Streaming 101

### From Pixels to Packets in JavaScript

<p class="muted">timjs meetup — 2026</p>

---

# What Is a Video, Really?

At the lowest level: a sequence of **frames**, each frame a grid of **pixels**, each pixel a set of **bytes**.

<v-click>

### Pixel → Frame → Video

</v-click>

<table>
<thead><tr><th>Level</th><th>What it is</th><th>Size</th></tr></thead>
<v-clicks><tbody>
<tr><td><b>Pixel</b></td><td>3 bytes (R, G, B)</td><td>3 bytes</td></tr>
<tr><td><b>Frame</b></td><td>1920 × 1080 pixels</td><td><b>~6 MB</b></td></tr>
<tr><td><b>1 second</b></td><td>30 frames</td><td><b>~180 MB/s</b></td></tr>
<tr><td><b>1 minute</b></td><td>60 seconds</td><td><b>~10.8 GB</b></td></tr>
</tbody></v-clicks>
</table>

<v-click>

> Nobody streams raw video. This is why compression exists.

</v-click>

---

# The Math Behind Raw Video

A single 1080p frame at 30 fps:

$$R_{\text{raw}} = 1920 \times 1080 \times 3 \times 30 \approx 178 \text{ MB/s} \approx 1.42 \text{ Gbps}$$

<v-click>

### What compression buys us

</v-click>

<table>
<thead><tr><th>Codec</th><th>Compression</th><th>1080p30 Bitrate</th><th>1 hour</th></tr></thead>
<v-clicks><tbody>
<tr><td>Raw</td><td>1:1</td><td>1.42 Gbps</td><td>625 GB</td></tr>
<tr><td>H.264</td><td>~50:1</td><td>~28 Mbps</td><td>~12.5 GB</td></tr>
<tr><td>H.265</td><td>~100:1</td><td>~14 Mbps</td><td>~6.25 GB</td></tr>
<tr><td>AV1</td><td>~130:1</td><td>~11 Mbps</td><td>~4.8 GB</td></tr>
</tbody></v-clicks>
</table>

---

# Containers vs Codecs

<v-clicks>

- **Container** = the wrapper (MP4, WebM, MKV, TS)
- **Codec** = the compressor (H.264, H.265, VP9, AV1)

</v-clicks>

<v-click>

### How Compression Works (simplified)

</v-click>

<v-clicks>

1. **Spatial** (intra-frame) — compress each frame like a JPEG
2. **Temporal** (inter-frame) — store only the *differences* between frames
3. **Keyframes** (I-frames) — full frames inserted periodically; deltas (P/B-frames) in between

</v-clicks>

---

# Bandwidth vs Quality Tradeoff

Quality follows a **logarithmic** curve with bitrate:

<v-clicks>

- Doubling bitrate does **not** double quality
- Going from 1 → 2 Mbps is far more noticeable than 10 → 11 Mbps
- Below a threshold: quality drops catastrophically (the "potato zone" 🥔)

</v-clicks>

<table>
<thead><tr><th>Connection</th><th>Bandwidth</th><th>Max Quality</th></tr></thead>
<v-clicks><tbody>
<tr><td>3G Mobile</td><td>~2 Mbps</td><td>480p</td></tr>
<tr><td>4G Mobile</td><td>~20 Mbps</td><td>1080p</td></tr>
<tr><td>Home Wi-Fi</td><td>~50 Mbps</td><td>4K</td></tr>
<tr><td>Covered phone 📱🤚</td><td>&lt;1 Mbps</td><td>Buffering</td></tr>
</tbody></v-clicks>
</table>

---

# The Checkerboard Demo

<v-clicks>

- A **static** checkerboard compresses almost perfectly — temporal compression removes everything.
- A **rotating** checkerboard defeats temporal compression — every frame is unique.
- At low bitrates, sharp edges show **blocking artifacts** — the squares smear into gray zones.

</v-clicks>

<v-click>

> This is exactly what happens when your player switches from high to low quality.

</v-click>

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
<v-clicks><tbody>
<tr><td>6 seconds</td><td>3</td><td><b>~18s</b></td></tr>
<tr><td>2 seconds</td><td>3</td><td><b>~6s</b></td></tr>
<tr><td>1 second</td><td>3</td><td><b>~3s</b></td></tr>
</tbody></v-clicks>
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

---

# The Wow Factor

<v-clicks>

- **📱 Audience Participation** — Scan the QR code → join as a viewer → your stats appear live on the dashboard.
- **📊 Live Stats Dashboard** — The presenter sees real-time viewer count, bandwidth, quality distribution, and chunk request rates.
- **🤚 Bandwidth Degradation** — Cover your phone → watch the dashboard react as quality downgrades cascade across viewers.

</v-clicks>

---

# Segment Size Tuning

The presenter tweaks HLS segment duration **live** — and the audience sees latency change in real-time.

<table>
<thead><tr><th>Config</th><th>Before</th><th>After</th></tr></thead>
<v-clicks><tbody>
<tr><td>Segment size</td><td>6s</td><td>2s</td></tr>
<tr><td>Buffered chunks</td><td>3</td><td>3</td></tr>
<tr><td>Latency</td><td>~18s</td><td>~6s</td></tr>
</tbody></v-clicks>
</table>

<v-click>

> The "aha moment" — a single config change dramatically affects the streaming experience.

</v-click>

---
layout: demo-break
title: Audience Participation Demo
url: /presenter
---

---
layout: url-reference
---

# Further Reading

<v-clicks>

- **[HLS Specification (RFC 8216)](https://datatracker.ietf.org/doc/html/rfc8216)** — The RFC behind HTTP Live Streaming
- **[hls.js](https://github.com/video-dev/hls.js)** — The player library powering our viewer
- **[FFmpeg Documentation](https://ffmpeg.org/documentation.html)** — The transcoding engine reference
- **[Web API: MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)** — Browser API for capturing camera streams
- **[Adaptive Streaming (Wikipedia)](https://en.wikipedia.org/wiki/Adaptive_bitrate_streaming)** — Overview of ABR techniques

</v-clicks>

---
layout: next-adventure
---

# Choose Your Next Adventure

<v-clicks>

- **WebRTC** — Real-time peer-to-peer streaming with sub-second latency
- **DASH** — MPEG's alternative to HLS (Dynamic Adaptive Streaming over HTTP)
- **AV1** — Next-gen codec: better than H.265, royalty-free
- **WebTransport** — HTTP/3 based low-latency streaming protocol
- **Media Source Extensions** — The browser API that makes hls.js possible
- **WebCodecs** — Low-level encode/decode directly in the browser

</v-clicks>

---
layout: quote
author: ''
---

# Thank You!

### Questions?

<p class="muted">github.com/timjs/streaming-101</p>

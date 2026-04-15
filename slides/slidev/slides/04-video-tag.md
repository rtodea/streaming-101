# The `<video>` Tag: A Brief History

<v-clicks>

- **Before 2010** — Video on the web meant **Flash Player**, QuickTime, or RealPlayer (browser plugins)
- **2007** — Opera proposes a native `<video>` element for HTML5
- **2010** — Steve Jobs publishes "Thoughts on Flash" — Apple refuses Flash on iOS
- **2011** — Major browsers ship `<video>` support (Chrome, Firefox, Safari, IE9)
- **2012** — YouTube offers HTML5 player as opt-in beta
- **2015** — YouTube defaults to HTML5, Netflix drops Silverlight for HTML5
- **2017** — Flash officially deprecated by Adobe
- **2020** — Flash Player end-of-life — the `<video>` tag won

</v-clicks>

<v-click>

> One HTML tag replaced an entire ecosystem of plugins.

</v-click>

---

# From 3 Lines of HTML to Full Control

The simplest possible video player:

<v-click>

```html
<video src="movie.mp4" controls width="640"></video>
```

</v-click>

<v-click>

### But under the hood, this one tag triggers:

</v-click>

<v-clicks>

- **Network** — HTTP range requests, chunked downloads, caching
- **Demuxing** — Separating video/audio/subtitle tracks from the container
- **Decoding** — Decompressing H.264/VP9/AV1 frames (CPU or GPU)
- **Rendering** — Compositing decoded frames onto the screen via the GPU
- **Audio sync** — Keeping audio and video in lockstep (A/V sync)
- **DRM** — Encrypted Media Extensions (EME) for protected content

</v-clicks>

---

# What Happens When You Press Play

<v-clicks>

- **JavaScript** calls `video.play()` — that's the last "easy" part
- The browser's **C++ media pipeline** takes over (Chromium: `media/`, Firefox: `dom/media/`)
- A **demuxer** (C++) reads the container format and extracts compressed frames
- Frames are sent to a **decoder** — either software (C/C++ via FFmpeg/libvpx) or hardware (GPU)
- Decoded frames land in a **compositor** that paints them to screen via the GPU

</v-clicks>

<v-click>

### The language boundary

</v-click>

<v-clicks>

- **JavaScript** — play/pause, volume, currentTime, events, MediaSource API
- **C/C++** — demuxing, decoding, buffering, A/V sync, DRM decryption
- **GPU (shader code)** — color space conversion (YUV → RGB), scaling, compositing

</v-clicks>

---
clicks: 8
---

# Browser Video Pipeline

<MermaidReveal :diagram="`
sequenceDiagram
    participant JS as JavaScript
    participant C as C++ Media Engine
    participant Dec as Decoder (CPU/GPU)
    participant GPU as GPU Compositor
    participant Scr as Screen
    JS->>C: video.play()
    C->>C: Fetch & demux container
    C->>Dec: Send compressed frame
    Dec->>Dec: Decode (H.264/VP9/AV1)
    Dec->>GPU: Decoded frame (YUV buffer)
    GPU->>GPU: YUV→RGB + scale + composite
    GPU->>Scr: Display frame
    C->>JS: Fire timeupdate event
`" />

---

# Hardware vs Software Decoding

<v-clicks>

- **Software decoding** — CPU runs C/C++ codec libraries (FFmpeg, libvpx, dav1d)
- **Hardware decoding** — Dedicated silicon on the GPU handles it (NVDEC, VideoToolbox, VAAPI)

</v-clicks>

<table>
<thead><tr><th></th><th>Software (CPU)</th><th>Hardware (GPU)</th></tr></thead>
<tbody>
<tr><td v-click><b>Speed</b></td><td v-click>Slower — general-purpose cores</td><td v-click>Much faster — purpose-built circuits</td></tr>
<tr><td v-click><b>Power</b></td><td v-click>High CPU usage, battery drain</td><td v-click>Minimal — dedicated low-power block</td></tr>
<tr><td v-click><b>4K60</b></td><td v-click>Struggles on older CPUs</td><td v-click>Effortless on modern GPUs</td></tr>
<tr><td v-click><b>Codec support</b></td><td v-click>Everything (just compile it)</td><td v-click>Limited to what chip supports</td></tr>
<tr><td v-click><b>Fallback</b></td><td v-click>Always available</td><td v-click>Falls back to software if unsupported</td></tr>
</tbody>
</table>

<v-click>

> Check `chrome://media-internals` to see which decoder your browser chose.

</v-click>

---

# Does a Better GPU Help?

<v-click>

### For decoding — **not really** (past a baseline)

</v-click>

<v-clicks>

- Decoding uses a **fixed-function block** (NVDEC, not CUDA cores) — a $200 GPU decodes 4K just as well as a $1500 one
- What matters: does the GPU support the **codec**? (e.g., AV1 hardware decode needs RTX 30xx+ or Intel Arc)
- More VRAM or CUDA cores do **not** help video playback

</v-clicks>

<v-click>

### For display quality — **the monitor matters more**

</v-click>

<v-clicks>

- **Color vibrancy** — determined by the **panel** (IPS, OLED, HDR support), not the GPU
- **HDR tone mapping** — GPU + OS work together (Windows HDR, macOS EDR)
- **Color accuracy** — ICC profiles managed by the **OS**, calibrated per-display
- **Scaling/sharpness** — GPU handles upscaling (FSR, DLSS), but the browser mostly doesn't use these

</v-clicks>

---

# Who Owns What: Browser vs OS vs Hardware

<table>
<thead><tr><th>Responsibility</th><th>Who handles it</th></tr></thead>
<tbody>
<tr><td v-click>Container parsing (MP4, WebM)</td><td v-click><b>Browser</b> — C++ media stack</td></tr>
<tr><td v-click>Codec decoding (H.264, AV1)</td><td v-click><b>Browser → GPU</b> — hardware if available, else CPU</td></tr>
<tr><td v-click>Color space conversion (YUV→RGB)</td><td v-click><b>GPU</b> — shader or fixed-function</td></tr>
<tr><td v-click>Color management (ICC profiles)</td><td v-click><b>OS</b> — color profiles per display</td></tr>
<tr><td v-click>HDR tone mapping</td><td v-click><b>OS + GPU driver</b> — Windows HDR / macOS EDR</td></tr>
<tr><td v-click>Frame presentation (vsync, tearing)</td><td v-click><b>OS compositor</b> — DWM (Win), Quartz (Mac)</td></tr>
<tr><td v-click>DRM decryption (Widevine, FairPlay)</td><td v-click><b>Browser CDM</b> — sandboxed C++ module</td></tr>
<tr><td v-click>Audio output & sync</td><td v-click><b>Browser → OS</b> — Web Audio / platform APIs</td></tr>
</tbody>
</table>

<v-click>

> The `<video>` tag is JavaScript's thin interface to a **deep C++/GPU/OS stack**.

</v-click>

---

# The `<video>` API Surface

What JavaScript actually controls:

<v-clicks>

- **Playback**: `play()`, `pause()`, `playbackRate`, `currentTime`
- **Source**: `src`, `<source>` elements, `MediaSource` API (for hls.js)
- **Tracks**: `audioTracks`, `textTracks`, `videoTracks`
- **Events**: `timeupdate`, `waiting`, `canplay`, `error`, `ended`
- **Capture**: `captureStream()` — grab frames as a `MediaStream`
- **Canvas bridge**: draw video frames to `<canvas>` for pixel manipulation

</v-clicks>

<v-click>

### What JavaScript **cannot** control:

</v-click>

<v-clicks>

- Which decoder (hardware vs software) is used
- Color management or ICC profile selection
- GPU memory allocation or frame scheduling
- A/V sync algorithm internals

</v-clicks>

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

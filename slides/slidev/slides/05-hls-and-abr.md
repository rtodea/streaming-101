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

- **M3U** = "MP3 URL", a playlist format from the Winamp era (1990s).
- **M3U8** = M3U encoded in **UTF-8** (the "8" is the encoding, not a version number).
- Apple adopted it for HLS. It's just a **text file** listing chunk URLs.

</v-clicks>

<v-click>

### HLS uses two flavors

</v-click>

<v-clicks>

- **Master playlist**: lists the quality *variants* (one entry per resolution/bitrate). Loaded once at startup.
- **Media playlist**: lists the actual `.ts` segments for **one** variant. Refetched periodically for live.

</v-clicks>

---

# Master Playlist: Quality Variants

```ini {all|1|2-3|4-5|6-7|all}
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360
360p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720
720p/playlist.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p/playlist.m3u8
```

<v-clicks>

- **`#EXTM3U`** (line 1): magic header. Every M3U-family file starts with this.
- **`#EXT-X-STREAM-INF`**: declares a variant. `BANDWIDTH` is the target in bps, `RESOLUTION` is pixels.
- The line **after** each `STREAM-INF` is the URL of that variant's media playlist.
- ABR uses these `BANDWIDTH` numbers to decide which variant to request next.

</v-clicks>

<style scoped>
ul { font-size: 0.85em; }
</style>

---

# Reading the BANDWIDTH Numbers

`BANDWIDTH` is **bits per second**, the same unit ISPs quote (and 8× smaller than the bytes per second your file manager shows).

```ini {all|1|2|3|all}
BANDWIDTH=800000   =  800,000 bps   =  800 kbps  =  0.8 Mbps   (360p)
BANDWIDTH=2800000  =  2,800,000 bps =  2.8 Mbps              (720p)
BANDWIDTH=5000000  =  5,000,000 bps =  5.0 Mbps              (1080p)
```

<v-click>

### How that compares to real links

</v-click>

<v-click>

<table class="bw-table">
<thead><tr><th>Link</th><th>Typical sustained speed</th><th>Variants that fit</th></tr></thead>
<tbody>
<tr><td>3G phone</td><td>~2 Mbps</td><td>360p only</td></tr>
<tr><td>4G LTE</td><td>20 to 50 Mbps</td><td>1080p with room</td></tr>
<tr><td><b>5G mid-band</b></td><td>100 to 400 Mbps</td><td>20 to 80 simultaneous 1080p</td></tr>
<tr><td><b>Digi fibre 1 Gbps (RO)</b></td><td>~800 Mbps wired, ~300 over Wi-Fi</td><td>hundreds of 1080p</td></tr>
</tbody>
</table>

</v-click>

<v-click>

### Pen and paper

</v-click>

<v-clicks>

- Digi sells "1 Gbps". In practice the line tops out around 800 Mbps over Ethernet (Wi-Fi cuts that further).
- One 1080p stream wants 5 Mbps. So **800 ÷ 5 ≈ 160 simultaneous 1080p streams** before the line saturates.
- 5G at 200 Mbps gives **200 ÷ 5 = 40** simultaneous 1080p streams. One viewer barely notices the load.
- ABR's real job isn't "find anything that fits". It's "find the highest variant that **survives one slow chunk** without draining the buffer".

</v-clicks>

<style scoped>
pre { font-size: 0.7em; }
h3 { font-size: 0.95em; margin: 0.5em 0 0.2em; }
.bw-table { font-size: 0.75em; margin-top: 0.2em; }
.bw-table th, .bw-table td { padding: 0.2em 0.6em; }
ul { font-size: 0.8em; margin: 0.3em 0; }
ul li { margin: 0.1em 0; }
p { font-size: 0.9em; margin: 0.3em 0; }
</style>

---

# Media Playlist: The Segments

```ini {all|2|3-4|5-6|7-8|9|all}
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

<v-clicks>

- **`#EXT-X-TARGETDURATION:6`**: max segment length the player should expect.
- **`#EXTINF:6.000,`** + filename: this segment lasts 6.000 seconds.
- Next segment, also 6 seconds.
- The last one is **shorter** (4.120s) because the source video didn't divide evenly.
- **`#EXT-X-ENDLIST`**: VOD marker. "No more segments coming." Live playlists omit this.

</v-clicks>

<style scoped>
ul { font-size: 0.85em; }
</style>

---

# What's a `.ts` Segment?

<v-clicks>

- **TS** = **MPEG-2 Transport Stream** (ISO/IEC 13818-1, 1995).
- Designed for **digital TV broadcast** where packets get lost over the air. Had to be self-syncing.
- Format: 188-byte packets, each tagged with a stream ID. A receiver can tune in mid-stream and recover within a few packets.
- HLS reuses TS because those same properties (chunked, joinable, error-tolerant) are exactly what HTTP delivery wants.

</v-clicks>

<v-click>

### Why "segment"?

</v-click>

<v-clicks>

- One `.ts` file = one slice of the timeline (typically 2 to 6 seconds).
- Stitch many segments back-to-back and you reconstruct the whole video.
- VOD segments are immutable. Live segments are appended at the head and (optionally) deleted from the tail.

</v-clicks>

<v-click>

> Modern HLS also supports fMP4 segments (`.m4s`), but `.ts` is still the workhorse.

</v-click>

<style scoped>
ul { font-size: 0.85em; margin: 0.3em 0; }
h3 { font-size: 0.95em; margin: 0.5em 0 0.2em; }
blockquote { font-size: 0.85em; margin-top: 0.4em; }
</style>

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

- `<video src="movie.mp4">` loads one file, with no way to switch quality mid-stream
- HLS/DASH need to fetch **small chunks** and stitch them together on the fly
- The browser has no built-in HLS support (except Safari)

</v-clicks>

<v-click>

### MSE: the solution (2013, W3C spec)

</v-click>

<v-clicks>

- JavaScript creates a `MediaSource` object and wires it to `<video>` via a blob URL
- Opens a `SourceBuffer`, a pipe where JS can **push raw media chunks**
- The browser's C++ decoder processes each chunk as if it were part of one continuous file
- This is **exactly** what hls.js does: it's an MSE client

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

- **Adaptive bitrate**: switch quality by pushing chunks from a different playlist
- **Live streaming**: keep appending new chunks as they arrive
- **Seeking**: jump to any point by fetching the right chunk and appending it
- **Gap handling**: detect buffering gaps and fetch missing segments

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

# Will Browsers Ever Add Native HLS?

> Short answer: no, and that's by design.

<table class="hls-status">
<thead><tr><th>Browser</th><th>Native HLS?</th><th>Notes</th></tr></thead>
<tbody>
<tr><td><b>Safari / iOS</b></td><td>Yes, since 2009</td><td>Apple owns the spec. Native LL-HLS too.</td></tr>
<tr><td><b>Chrome / Edge</b></td><td>No</td><td>No plans. Stable position for a decade.</td></tr>
<tr><td><b>Firefox</b></td><td>No</td><td>Same.</td></tr>
</tbody>
</table>


<v-click>

### Why not?

</v-click>

<v-clicks>

- W3C / Chromium / Mozilla picked **MSE** over bundling protocols. "Give JS the primitives; let userland implement HLS, DASH, or whatever's next."
- HLS is an Apple-authored **informational** RFC (8216), not a multi-vendor W3C/ISO spec. Vendors don't want a single-vendor format baked in.
- DRM (FairPlay vs Widevine vs PlayReady) and codec licensing make a single native pipeline messy.

### Where to read this for yourself

- **Mozilla `standards-positions`** (GitHub): search issues for "HLS".
- **Chromium issue tracker**: search "native HLS support" (long "won't fix, use MSE + hls.js" thread).
- **IETF RFC 8216**: the HLS spec itself. Note its *informational* status.
- **W3C MSE** spec: the official "this is the answer instead" document.

</v-clicks>

<v-click>

### What's actually moving

</v-click>

<v-clicks>

- **WebCodecs** (Chromium shipped, others partial): direct access to hardware encode/decode. Even lower-level than MSE.
- **MoQ** (Media over QUIC): the IETF's next-gen streaming protocol on HTTP/3. If anything ships natively in non-Apple browsers, it'd be this, not HLS.
- **Managed MSE** (Safari 17+): battery-friendly hints. Augments the JS-library model, doesn't replace it.

</v-clicks>

<v-click>

> hls.js is here for the long haul.

</v-click>

<style scoped>
blockquote { font-size: 0.78em; margin: 0.2em 0; }
h3 { font-size: 0.78em; margin: 0.3em 0 0.1em; }
ul { font-size: 0.62em; margin: 0.15em 0; line-height: 1.3; }
ul li { margin: 0.05em 0; }
.hls-status { font-size: 0.7em; margin-top: 0.2em; }
.hls-status th, .hls-status td { padding: 0.18em 0.5em; }
</style>

---

# What MSE Actually Enabled

The bet "ship MSE, not protocols" produced two streaming formats and a small ecosystem of JS players.

<v-click>

### Two protocols ride on top of MSE

</v-click>

<v-clicks>

- **HLS** *(Apple, RFC 8216, 2009)*: `.m3u8` text playlists + `.ts` (or fMP4) segments. The de-facto default for live and OTT video on the open web.
- **MPEG-DASH** *(ISO/IEC 23009-1, 2012)*: vendor-neutral equivalent. XML manifest (`.mpd`), codec-agnostic. The "open standard" answer to HLS.

</v-clicks>

<v-click>

### The JS players that decode them

<table class="players">
<thead><tr><th>Library</th><th>Plays</th><th>What it solves</th><th>In production at</th></tr></thead>
<tbody>
<tr><td><b>hls.js</b></td><td>HLS</td><td>Polyfills HLS for Chrome / Firefox / Edge (Safari plays it natively)</td><td><b>Twitch</b>, JW Player, DAZN</td></tr>
<tr><td><b>dash.js</b></td><td>DASH</td><td>Reference player from the DASH Industry Forum</td><td><b>BBC iPlayer</b>, Akamai demos</td></tr>
<tr><td><b>Shaka Player</b></td><td>HLS + DASH + EME</td><td>One library for both protocols, plus DRM (Widevine / PlayReady / FairPlay) for paid content</td><td><b>YouTube TV</b>, Google web products</td></tr>
</tbody>
</table>


</v-click>

<v-click>

> Netflix and YouTube run their own in-house players, but the *protocols* on the wire are still these two.

</v-click>

<style scoped>
ul { font-size: 0.8em; margin: 0.25em 0; }
ul li { margin: 0.1em 0; }
h3 { font-size: 0.9em; margin: 0.4em 0 0.2em; }
.players { font-size: 0.72em; margin-top: 0.3em; }
.players th, .players td { padding: 0.25em 0.5em; vertical-align: top; }
blockquote { font-size: 0.8em; margin-top: 0.3em; }
</style>

---

# Adaptive Bitrate Streaming (ABR)

<v-clicks>

- The video isn't sent as one file. It's **chopped into small chunks** (2 to 6 seconds).
- The server provides a **manifest** (`.m3u8`) listing all quality variants and their chunks.
- The player measures **download speed** in real-time and picks the best quality for the next chunk.

</v-clicks>

---

# The ABR Rule, in English

> Pick the highest-quality variant you can still download faster than it plays.

<v-click>

Every few seconds the player asks three questions:

</v-click>

<v-clicks>

1. **How fast did I just download the last chunk?** That's my estimated bandwidth.
2. **Which variants fit under that bandwidth?** Anything whose bitrate is lower.
3. **Which of those looks best?** Pick it; that's the next chunk.

</v-clicks>

<v-click>

### The same thing in one line

$$Q^{*} = \arg\max_{q} \; Q(q) \quad \text{s.t.} \quad R(q) \leq B_{\text{estimated}}$$

</v-click>

<v-click>

<table class="abr-symbols">
<thead><tr><th>Symbol</th><th>Means</th></tr></thead>
<tbody>
<tr><td><code>q</code></td><td>one of the variants in the manifest (480p, 720p, 1080p, …)</td></tr>
<tr><td><code>R(q)</code></td><td>bitrate that variant needs (the <code>BANDWIDTH</code> field in <code>.m3u8</code>)</td></tr>
<tr><td><code>Q(q)</code></td><td>how good that variant looks (grows with bitrate, logarithmic)</td></tr>
<tr><td><code>B<sub>estimated</sub></code></td><td>your measured download speed</td></tr>
<tr><td><code>Q*</code></td><td>the winner: best <code>Q(q)</code> whose <code>R(q)</code> still fits under <code>B</code></td></tr>
</tbody>
</table>

</v-click>

<style scoped>
blockquote { font-size: 0.95em; margin: 0.3em 0; }
ol, p { font-size: 0.85em; margin: 0.3em 0; }
ol li { margin: 0.1em 0; }
h3 { font-size: 0.9em; margin: 0.5em 0 0.2em; }
.katex-display { margin: 0.3em 0 !important; }
.katex { font-size: 0.95em !important; }
.abr-symbols { font-size: 0.7em; margin-top: 0.2em; }
.abr-symbols th, .abr-symbols td { padding: 0.15em 0.5em; }
</style>

---

# ABR in Practice

Your phone is on 4G and the player measures **4 Mbps**. The manifest offers three variants:

<table class="abr-table">
<thead><tr><th>Variant</th><th>Bitrate <code>R(q)</code></th><th>Fits under 4 Mbps?</th><th>Picked</th></tr></thead>
<tbody>
<tr><td v-click>480p</td><td v-click>0.8 Mbps</td><td v-click>yes</td><td v-click>no (looks worse)</td></tr>
<tr><td v-click>720p</td><td v-click>2.8 Mbps</td><td v-click>yes</td><td v-click><b>← Q*</b></td></tr>
<tr><td v-click>1080p</td><td v-click>5.0 Mbps</td><td v-click>no (would stall)</td><td v-click>no</td></tr>
</tbody>
</table>


<v-click>

### Real players add a safety margin

Using ~80% of estimated bandwidth leaves headroom so a single slow chunk doesn't empty the buffer and stall playback.

</v-click>

<v-click>

### What happens at the edges

</v-click>

<v-clicks>

- **Pick too high** (1080p at 4 Mbps): chunk takes longer than 4s, buffer drains, spinner appears.
- **Pick too low** (480p at 4 Mbps): safe, but wastes 3.2 Mbps of headroom and looks worse than it needs to.
- **Bandwidth drops mid-stream** (elevator, weak Wi-Fi): next measurement is lower, ABR picks a lower variant for the next chunk. That's the YouTube quality downshift.

</v-clicks>

<style scoped>
p { font-size: 0.85em; margin: 0.3em 0; }
h3 { font-size: 0.9em; margin: 0.5em 0 0.2em; }
ul { font-size: 0.8em; margin: 0.3em 0; }
ul li { margin: 0.15em 0; }
.abr-table { font-size: 0.8em; margin-top: 0.3em; }
.abr-table th, .abr-table td { padding: 0.2em 0.5em; }
</style>

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

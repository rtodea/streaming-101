# The Math Behind Raw Video

A single 1080p frame at 30 fps:

$$R_{\text{raw}} = 1920 \times 1080 \times 3 \times 30 \approx 178 \text{ MB/s} \approx 1.42 \text{ Gbps}$$

<v-click>

### What compression buys us

</v-click>

<table>
<thead><tr><th>Codec</th><th>Compression</th><th>1080p30 Bitrate</th><th>1 hour</th></tr></thead>
<tbody>
<tr><td v-click>Raw</td><td v-click>1:1</td><td v-click>1.42 Gbps</td><td v-click>625 GB</td></tr>
<tr><td v-click>H.264</td><td v-click>~50:1</td><td v-click>~28 Mbps</td><td v-click>~12.5 GB</td></tr>
<tr><td v-click>H.265</td><td v-click>~100:1</td><td v-click>~14 Mbps</td><td v-click>~6.25 GB</td></tr>
<tr><td v-click>AV1</td><td v-click>~130:1</td><td v-click>~11 Mbps</td><td v-click>~4.8 GB</td></tr>
</tbody>
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

1. **Spatial** (intra-frame): compress each frame like a JPEG
2. **Temporal** (inter-frame): store only the *differences* between frames
3. **Keyframes** (I-frames): full frames inserted periodically; deltas (P/B-frames) in between

</v-clicks>

---

# Motion JPEG: Each Frame On Its Own

<div class="grid grid-cols-2 gap-6 items-center mechanism">
<div>
  <img src="/images/compress-motion-jpeg.png" alt="Seven source frames each compressed independently as JPEGs" />
</div>
<div>

<v-clicks>

- The simplest video codec: JPEG-compress every frame.
- Kills **spatial** redundancy (within each frame).
- Ignores that frames 1 and 2 are nearly identical. A bicyclist riding past a tree reprints the tree seven times.

</v-clicks>

</div>
</div>

<style scoped>
.mechanism img { width: 100%; height: auto; max-height: 360px; object-fit: contain; }
.mechanism ul { font-size: 0.95em; }
</style>

---

# MPEG: Frame, Slice, Macroblock, Block, Pixel

<div class="grid grid-cols-2 gap-6 items-center mechanism">
<div>
  <img src="/images/compress-mpeg-intro.png" alt="A frame broken down into slices, macroblocks, blocks, and finally pixels" />
</div>
<div>

<v-clicks>

- Where Motion JPEG stops at the frame, the **MPEG family** (H.264, H.265, AV1) exploits what's similar *between* frames.
- To do that, it first breaks each frame into a hierarchy:
  - **Slice**: an independently decodable strip of the frame.
  - **Macroblock**: the basic unit of motion estimation (typically 16×16 pixels).
  - **Block**: the unit of DCT / transform coding inside a macroblock.
  - **Pixel**: the leaf.
- Everything that follows (motion vectors, I/P/B frame types, quantization) operates on **macroblocks**, not whole frames.

</v-clicks>

</div>
</div>

<style scoped>
.mechanism img { width: 100%; height: auto; max-height: 340px; object-fit: contain; }
.mechanism ul { font-size: 0.9em; }
.mechanism ul ul { font-size: 0.95em; }
</style>

---

# Motion Estimation: Predict, Don't Store

<div class="grid grid-cols-2 gap-6 items-center mechanism">
<div>
  <img src="/images/compress-motion-estimation.png" alt="A reference frame plus a predicted next frame derived by tracking macroblocks" />
</div>
<div>

<v-clicks>

- Frames are divided into **macroblocks** (small pixel tiles).
- For each block, the encoder searches the previous frame for the best match.
- Stored: a **motion vector** ("moved +3, +1") plus a tiny **error term**. Orders of magnitude smaller than raw pixels.
- Heart of every MPEG-family codec (H.264, H.265, AV1).

</v-clicks>

</div>
</div>

<style scoped>
.mechanism img { width: 100%; height: auto; max-height: 360px; object-fit: contain; }
.mechanism ul { font-size: 0.95em; }
</style>

---

# I, P, and B Frames

<div class="grid grid-cols-2 gap-6 items-center mechanism">
<div>
  <img src="/images/compress-b-frame.png" alt="An I-frame on the left, a B-frame in the middle referencing both past and future, and a P-frame on the right" />
</div>
<div>

<v-clicks>

- **I** (intra): complete picture, JPEG-like. Decodable alone. Biggest.
- **P** (predicted): references one earlier frame. "Same as before, but this block moved."
- **B** (bidirectional): references **past and future**. Smallest of the three.

</v-clicks>

<v-click>

> An H.264 stream is mostly B-frames, with occasional P-frames, anchored by rare I-frames.

</v-click>

</div>
</div>

<style scoped>
.mechanism img { width: 100%; height: auto; max-height: 320px; object-fit: contain; }
.mechanism ul { font-size: 0.95em; }
.mechanism blockquote { font-size: 0.9em; }
</style>

---

# GOP: Group of Pictures

<div class="grid grid-cols-2 gap-6 items-center mechanism">
<div>
  <img src="/images/compress-gop.png" alt="Repeating pattern of I B B P... frames every 30, 60, or 90 frames" />
</div>
<div>

<v-clicks>

- A **GOP** is the repeating pattern from one I-frame to the next. Typical sizes: **30, 60, or 90 frames** (1 to 3s at 30 fps).
- **Bigger GOP**: better compression, slower seek, longer recovery after a dropped packet.
- **Smaller GOP**: faster seek, fatter files. Live uses short, Netflix uses long.

</v-clicks>

<v-click>

> HLS segments must start on an I-frame: **GOP size bounds minimum segment duration**.

</v-click>

</div>
</div>

<style scoped>
.mechanism img { width: 100%; height: auto; max-height: 240px; object-fit: contain; }
.mechanism ul { font-size: 0.95em; }
.mechanism blockquote { font-size: 0.9em; }
</style>

---

# Decode Order ≠ Display Order

<div class="grid grid-cols-2 gap-6 items-center mechanism">
<div>
  <img src="/images/compress-pts-dts.png" alt="Frames carry a Presentation Time Stamp and a Decode Time Stamp; the two orderings differ because B-frames depend on future P-frames" />
</div>
<div>

<v-clicks>

- A **B-frame** can only be decoded after its past *and* future references exist. Arrival order ≠ display order.
- Every frame carries two timestamps: **PTS** (present) and **DTS** (decode).
- Player decodes in DTS order, reorders by PTS before rendering. Seeking rewinds to the nearest I-frame and decodes forward.

</v-clicks>

</div>
</div>

<style scoped>
.mechanism img { width: 100%; height: auto; max-height: 340px; object-fit: contain; }
.mechanism ul { font-size: 0.95em; }
</style>

---

# When Does Compression Actually Happen?

<v-clicks>

- **Is the uploaded file already compressed?** Yes. Your phone's camera encodes H.264 in real time. The raw 1.4 Gbps sensor stream is squeezed to ~10 Mbps **before** it touches disk.
- **Is it stored compressed?** Yes, at every stage. The server keeps the uploaded original *and* the re-encoded variants, all compressed.
- **Does compression happen during transmission?** No. HTTP just moves the same compressed bytes. Nothing is re-encoded in flight.
- **Are the lower-quality variants "the compression"?** Yes. Each variant (480p, 720p, 1080p) is a **separate re-encode** at a different target resolution and bitrate.
- So compression runs **twice** in our pipeline: once in the camera at capture, once on the server at transcode. Playback is strictly *decompression*.

</v-clicks>

<style scoped>
ul { font-size: 0.92em; }
</style>

---
clicks: 8
---

# The Compression Pipeline

<MermaidReveal :diagram="`
sequenceDiagram
    participant Cam as Camera Sensor
    participant Phone as Phone (HW encoder)
    participant Srv as Server (FFmpeg)
    participant Disk as Storage
    participant Plr as Player
    Cam->>Phone: Raw pixels (~1.4 Gbps)
    Phone->>Phone: Compress #1 (H.264 in real time)
    Phone->>Srv: Upload compressed .mp4 (~10 Mbps)
    Srv->>Srv: Compress #2 (re-encode per variant)
    Srv->>Disk: Store 480p / 720p / 1080p segments
    Plr->>Disk: GET segment.ts
    Disk-->>Plr: Compressed bytes (no re-encode)
    Plr->>Plr: Decode to pixels for display
`" />

---

# Transcoding: One File, Many Variants

<div class="grid grid-cols-2 gap-6 items-start transcode">
<div>

<v-click>

### The algorithm, per variant

</v-click>

<v-clicks>

1. **Decode** source bytes to raw pixel frames.
2. **Rescale** to the target resolution (1920×1080 → 854×480).
3. **Re-encode** with the target codec + bitrate (H.264 @ 800 kbps for 480p).

</v-clicks>

<v-click>

Repeat for 720p and 1080p. Three passes = three independent compressed files.

</v-click>

</div>
<div>

<v-click>

### What our ffmpeg command does

```bash
ffmpeg -i source.mp4 \
  -vf scale=854:480 \
  -c:v libx264 -b:v 800k \
  -f hls 480p/stream.m3u8
```

</v-click>

<v-click>

### Why not just lower the bitrate?

</v-click>

<v-clicks>

- Keeping 1080p at 800 kbps looks **blocky**. The codec has too many pixels and too few bits.
- Rescaling first gives the codec fewer pixels to care about, so every bit it spends shows up as detail.

</v-clicks>

</div>
</div>

<style scoped>
.transcode ul, .transcode ol { font-size: 0.9em; }
.transcode pre { font-size: 0.75em; }
</style>

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
<tbody>
<tr><td v-click>3G Mobile</td><td v-click>~2 Mbps</td><td v-click>480p</td></tr>
<tr><td v-click>4G Mobile</td><td v-click>~20 Mbps</td><td v-click>1080p</td></tr>
<tr><td v-click>Home Wi-Fi</td><td v-click>~50 Mbps</td><td v-click>4K</td></tr>
<tr><td v-click>Covered phone 📱🤚</td><td v-click>&lt;1 Mbps</td><td v-click>Buffering</td></tr>
</tbody>
</table>

---

# The Checkerboard Demo

<v-clicks>

- A **static** checkerboard compresses almost perfectly. Temporal compression removes everything.
- A **rotating** checkerboard defeats temporal compression; every frame is unique.
- At low bitrates, sharp edges show **blocking artifacts**: the squares smear into gray zones.

</v-clicks>

<v-click>

> This is exactly what happens when your player switches from high to low quality.

</v-click>

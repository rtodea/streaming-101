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

# Vocab: encode, decode, codec

<v-clicks>

- **code**: from Latin *codex*, "a system of rules". Same root as *encrypt*, *cipher*, *codify*.
- **encode** = put **into** code. (`en-` = "into")
- **decode** = take **out of** code. (`de-` = "away from")
- **codec** = a 1970s telephony portmanteau: **CO**(der) + **DEC**(oder).
  - Anything that does both: turn raw pixels into compressed bits, *and* the reverse.

</v-clicks>

<v-click>

> Encoder lives at the **producer** (camera, server). Decoder lives at the **consumer** (player, monitor). Same algorithm, run backwards.

</v-click>

---

# Containers vs Codecs

<v-clicks>

- **Container** (industry term: *wrapper format*) = MP4, WebM, MKV, TS. Holds multiple **streams**: video, audio, subtitles, plus sync metadata.
- **Codec** = the algorithm each stream was compressed with: H.264, H.265, VP9, AV1, Opus, AAC.

</v-clicks>

<v-click>

### Mnemonic: MP4 is to H.264 what ZIP is to deflate

</v-click>

<v-clicks>

- A `.zip` is a **container**. Inside, each file can use a different compression algorithm (deflate, lzma, store).
- A `.mp4` is the same idea: one outer file, several inner streams, each compressed with its own codec.
- The extension tells you the **container**. Only inspecting the bytes (`ffprobe`) tells you the **codecs** inside.

</v-clicks>

<v-click>

> When a video won't play, ask: *which* container *and* *which* codec? Browsers reject combinations they don't understand even when both halves are individually fine.

</v-click>

---

# Motion JPEG: Each Frame On Its Own

<div class="grid grid-cols-2 gap-6 items-center mechanism">
<div>
  <img v-click src="/images/compress-motion-jpeg.png" alt="Seven source frames each compressed independently as JPEGs" />
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
  <img v-click src="/images/compress-mpeg-intro.png" alt="A frame broken down into slices, macroblocks, blocks, and finally pixels" />
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
  <img v-click src="/images/compress-motion-estimation.png" alt="A reference frame plus a predicted next frame derived by tracking macroblocks" />
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
  <img v-click src="/images/compress-b-frame.png" alt="An I-frame on the left, a B-frame in the middle referencing both past and future, and a P-frame on the right" />
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

# But Wait: Cameras Can't See the Future

<div class="grid grid-cols-2 gap-6 items-start mechanism">
<div>

<v-clicks>

### The trick: lookahead

The encoder buffers a few frames before emitting any output. It pretends "the future" already happened by holding back a tiny bit.

- More lookahead → better compression, more latency.
- Less lookahead → lower latency, fatter files.

</v-clicks>

</div>
<div>

<v-clicks>

### Live often skips B-frames entirely

For real-time scenarios, encoders run with `-tune zerolatency` (or equivalent), which **disables B-frames**. You trade compression efficiency for ~0 frames of encode delay.

</v-clicks>

<v-click>

### Where does the actual encoding run?

</v-click>

<v-clicks>

- Not C++ on the camera. **Fixed-function silicon** on the SoC: Apple VideoToolbox, Qualcomm Venus, Samsung MFC, Intel Quick Sync.
- The C/C++ part is the OS driver that feeds frames in and pulls compressed bytes out.

</v-clicks>

</div>
</div>

<style scoped>
ul { font-size: 0.85em; }
h3 { font-size: 1em; margin-top: 0.5em; }
</style>

---
clicks: 7
---

# Live Capture: Sensor to Wire

<MermaidReveal :diagram="`
sequenceDiagram
    participant Sen as Camera Sensor
    participant ISP as Image Signal Processor
    participant Enc as Hardware Encoder (VPU)
    participant App as MediaRecorder API
    participant Net as Network
    Sen->>ISP: Raw Bayer pattern (~1.4 Gbps)
    ISP->>ISP: Demosaic, white balance, exposure
    ISP->>Enc: RGB frames at 30 fps
    Enc->>Enc: Buffer N frames (lookahead, often 0)
    Enc->>Enc: Compress to I and P frames
    Enc->>App: Compressed bytes (VP8 or H.264)
    App->>Net: Send chunk over WebSocket
`" />

---

# GOP: Group of Pictures

<div class="grid grid-cols-2 gap-6 items-center mechanism">
<div>
  <img v-click src="/images/compress-gop.png" alt="Repeating pattern of I B B P... frames every 30, 60, or 90 frames" />
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
  <img v-click src="/images/compress-pts-dts.png" alt="Frames carry a Presentation Time Stamp and a Decode Time Stamp; the two orderings differ because B-frames depend on future P-frames" />
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

# FFmpeg: The Swiss Army Knife of Video

<v-clicks>

- **Created in 2000 by Fabrice Bellard** (also wrote QEMU, TinyCC, and calculated π to a record number of digits).
- **FF** = *Fast Forward*, the tape-deck button. **mpeg** = the codec family it first targeted.
- A set of C **libraries** (`libavcodec`, `libavformat`, `libavfilter`, `libswscale`) plus three CLIs: `ffmpeg` (transcode), `ffprobe` (inspect), `ffplay` (play).
- **Hundreds of codecs, dozens of containers, one unified API.** Before FFmpeg you needed a different tool per format.

</v-clicks>

<v-click>

### Where you find it

</v-click>

<v-clicks>

- VLC, MPV, OBS, Kodi: all built on `libav*`.
- Twitch, Netflix, YouTube transcoding pipelines: FFmpeg under the hood.
- Chrome and Firefox use FFmpeg-derived code for `<video>` decoding.

</v-clicks>

<v-click>

> Our server uses it **twice**: re-encoding uploads into HLS variants (`videos.service.ts`), and converting the live WebM stream into H.264 segments (`streams.service.ts`).

</v-click>

<style scoped>
ul { font-size: 0.85em; margin: 0.3em 0; }
ul li { margin: 0.15em 0; }
h3 { font-size: 0.95em; margin: 0.5em 0 0.2em; }
blockquote { font-size: 0.85em; margin-top: 0.4em; }
</style>

---

# Fabrice Bellard

<div class="grid grid-cols-[3fr_2fr] gap-6 items-start bellard">
<div>

<v-clicks>

- Born 1972, Grenoble. École Polytechnique, then Télécom Paris.
- 1989 *(age 17)*: writes **LZEXE**, an executable compressor for DOS.
- 1997 *(age 25)*: derives the **Bellard formula** for π, ~47% faster than BBP.
- 2000 *(age 28)*: starts **FFmpeg**.
- 2003 *(age 31)*: starts **QEMU**. Modern hardware virtualization (KVM) is built on top of it.
- 2011 *(age 39)*: **JSLinux**, a Linux PC running inside a browser tab.
- 2014 *(age 42)*: **BPG**, a JPEG replacement built on H.265 intra-frame coding.
- 2019 *(age 47)*: **QuickJS**, a tiny embeddable JavaScript engine.

</v-clicks>

<v-click>

### Records and recognition

</v-click>

<v-clicks>

- 2009 *(age 37)* **π record**: ~**2.7 × 10¹²** digits on a single ~$3,000 desktop. Beat the prior record of **~2.58 × 10¹²** (Daisuke Takahashi, Univ. of Tsukuba T2K supercomputer, Aug 2009).
- For scale, today's record sits around **~2.02 × 10¹⁴** digits (StorageReview / Jordan Ranous, 2024) — about **75×** Bellard's, but on a server with ~1 PB of storage.
- 2011 *(age 39)* **O'Reilly Open Source Award** for QEMU. Three **IOCCC** *(International Obfuscated C Code Contest)* wins.

</v-clicks>

<v-click>

### Day job

</v-click>

<v-clicks>

- Co-founded **Amarisoft** in 2012 *(age 40)*, headquartered in **Levallois-Perret** (just outside Paris). Software 4G/5G base stations on commodity hardware.
- Still CTO. Almost no public profile: virtually no interviews, no social media.

</v-clicks>

</div>
<div>
  <img src="/images/bellard.jpg" alt="Portrait of Fabrice Bellard" class="bellard-portrait" />
  <p class="caption">Image: Computer History Museum</p>
</div>
</div>

<style scoped>
.bellard ul { font-size: 0.72em; margin: 0.2em 0; }
.bellard ul li { margin: 0.1em 0; }
.bellard h3 { font-size: 0.85em; margin: 0.45em 0 0.15em; }
.bellard-portrait { width: 100%; height: auto; max-height: 320px; object-fit: cover; border-radius: 0.4em; }
.caption { font-size: 0.6em; color: var(--slidev-theme-accents-1); text-align: center; margin-top: 0.3em; }
</style>

---

# Making the Demo Files with FFmpeg

```bash {all|1-4|6-9|11-14|16-18|all}
# 1. Static checkerboard PNG (geq filter draws each square via pixel coords)
ffmpeg -f lavfi -i "color=white:s=1080x1080" \
  -vf "geq=lum='if(eq(mod(floor(X/135)+floor(Y/135),2),0),255,0)'" \
  -frames:v 1 checkerboard.png

# 2. Rotate it (360 degrees over 10s, defeats temporal compression)
ffmpeg -loop 1 -i checkerboard.png -t 10 \
  -vf "rotate=2*PI*t/10:fillcolor=white:ow=1080:oh=1080" \
  -c:v libx264 -pix_fmt yuv420p checkerboard_rotating.mp4

# 3. Re-encode at four quality tiers (-b:v = target bitrate)
ffmpeg -i checkerboard_rotating.mp4 -c:v libx264 -b:v 5M   high.mp4
ffmpeg -i checkerboard_rotating.mp4 -c:v libx264 -b:v 200k low.mp4
ffmpeg -i checkerboard_rotating.mp4 -c:v libx264 -b:v 50k  potato.mp4

# 4. Stack two clips horizontally for side-by-side viewing
ffmpeg -i high.mp4 -i potato.mp4 \
  -filter_complex "[0:v][1:v]hstack=inputs=2" comparison.mp4
```

<v-click>

> Same input, four output bitrates. The 100× spread (5 Mbps vs 50 kbps) is what produces the artifacts you'll see on the next slide.

</v-click>

<style scoped>
pre { font-size: 0.6em; }
blockquote { font-size: 0.85em; margin-top: 0.5em; }
</style>

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

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

<img src="/images/compress-motion-jpeg.png" alt="Seven source frames each compressed independently as JPEGs" class="mechanism-image" />

<v-clicks>

- The simplest video codec: JPEG-compress every frame and play them in sequence.
- Kills **spatial** redundancy (within each frame) but completely ignores that frames 1 and 2 are nearly identical.
- A bicyclist riding past a tree reprints the tree seven times. That's wasted bits.

</v-clicks>

<style scoped>
.mechanism-image {
  display: block;
  width: 100%;
  max-width: 720px;
  margin: 0 auto 1rem;
}
</style>

---

# Motion Estimation: Predict, Don't Store

<img src="/images/compress-motion-estimation.png" alt="A reference frame plus a predicted next frame derived by tracking macroblocks" class="mechanism-image" />

<v-clicks>

- The encoder divides each frame into **macroblocks** (small pixel tiles) and searches the previous frame for the best match.
- What gets stored is a **motion vector** (the block moved +3 pixels right, +1 down) plus a tiny **error term** for whatever didn't match perfectly.
- Orders of magnitude smaller than storing the block's pixels outright. This is the heart of MPEG-family codecs (H.264, H.265, AV1).

</v-clicks>

<style scoped>
.mechanism-image {
  display: block;
  width: 100%;
  max-width: 640px;
  margin: 0 auto 1rem;
}
</style>

---

# I, P, and B Frames

<img src="/images/compress-b-frame.png" alt="An I-frame on the left, a B-frame in the middle referencing both past and future, and a P-frame on the right" class="mechanism-image" />

<v-clicks>

- **I-frame** (intra): a complete picture, compressed like a JPEG. Decodable on its own, biggest in size.
- **P-frame** (predicted): *"same as the last frame, but this block moved here"*. References one earlier frame.
- **B-frame** (bidirectional): references **both** past and future frames for the best guess. Smallest of the three.

</v-clicks>

<v-click>

> An H.264 stream is mostly B-frames, peppered with occasional P-frames, anchored by rare I-frames.

</v-click>

<style scoped>
.mechanism-image {
  display: block;
  width: 100%;
  max-width: 640px;
  margin: 0 auto 1rem;
}
</style>

---

# GOP: Group of Pictures

<img src="/images/compress-gop.png" alt="Repeating pattern of I B B P... frames every 30, 60, or 90 frames" class="mechanism-image" />

<v-clicks>

- A **GOP** is the repeating pattern from one I-frame to the next. Typical sizes: 30, 60, or 90 frames (1 to 3 seconds at 30 fps).
- **Bigger GOP** = better compression (more frames leaning on one I-frame), but slower seeking and longer recovery after a dropped packet.
- **Smaller GOP** = faster seek and quicker error recovery, but fatter files. Live streaming uses shorter GOPs; Netflix VOD uses longer ones.

</v-clicks>

<v-click>

> Every HLS segment has to start on an I-frame, which is why **GOP size bounds the minimum segment duration**.

</v-click>

<style scoped>
.mechanism-image {
  display: block;
  width: 100%;
  max-width: 780px;
  margin: 0 auto 1rem;
}
</style>

---

# Decode Order ≠ Display Order

<img src="/images/compress-pts-dts.png" alt="Frames carry a Presentation Time Stamp and a Decode Time Stamp; the two orderings differ because B-frames depend on future P-frames" class="mechanism-image" />

<v-clicks>

- A **B-frame** is displayed between two reference frames but can only be decoded **after** both exist. So frames arrive in a different order than they play.
- Every frame carries two timestamps: **PTS** (when to show it) and **DTS** (when to decode it).
- The player decodes in DTS order, then reorders by PTS before sending pixels to the screen. Seeking to an arbitrary timestamp means rewinding to the nearest I-frame and decoding forward.

</v-clicks>

<style scoped>
.mechanism-image {
  display: block;
  width: 100%;
  max-width: 720px;
  margin: 0 auto 1rem;
}
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

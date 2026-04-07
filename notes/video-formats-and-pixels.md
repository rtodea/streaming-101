# Video Formats, Raw Bytes & Quality Degradation Demo

## What Is a Video, Really?

At the lowest level, a video is a sequence of **frames** (images), each frame being a grid of **pixels**, each pixel being a set of **bytes** representing color.

### Pixel → Frame → Video

| Level | What it is | Size example |
|-------|-----------|--------------|
| **Pixel** | 3 bytes (R, G, B) or 4 bytes (R, G, B, A) | 3-4 bytes |
| **Frame** | W × H pixels | 1920×1080 × 3 = **6,220,800 bytes (~6MB)** |
| **1 second** | FPS frames | 30 fps × 6MB = **~180MB/s raw** |
| **1 minute** | 60 seconds | **~10.8 GB raw** |

This is why compression exists. Nobody streams raw video.

---

## The Math Behind Raw Video

### Single Pixel

A pixel in RGB color space uses one byte per channel:

$$
S_{\text{pixel}} = N_{\text{channels}} \times D_{\text{bits per channel}} = 3 \times 8 = 24 \text{ bits} = 3 \text{ bytes}
$$

With alpha (transparency):

$$
S_{\text{pixel (RGBA)}} = 4 \times 8 = 32 \text{ bits} = 4 \text{ bytes}
$$

### Single Frame

For a frame of width $W$ and height $H$:

$$
S_{\text{frame}} = W \times H \times S_{\text{pixel}}
$$

At 1080p (1920×1080, RGB):

$$
S_{\text{frame}} = 1920 \times 1080 \times 3 = 6{,}220{,}800 \text{ bytes} \approx 5.93 \text{ MB}
$$

At 4K (3840×2160, RGB):

$$
S_{\text{frame}}^{4K} = 3840 \times 2160 \times 3 = 24{,}883{,}200 \text{ bytes} \approx 23.7 \text{ MB}
$$

### Raw Video Bitrate

For a video at $f$ frames per second:

$$
R_{\text{raw}} = W \times H \times S_{\text{pixel}} \times f
$$

At 1080p, 30 fps:

$$
R_{\text{raw}} = 1920 \times 1080 \times 3 \times 30 = 186{,}624{,}000 \text{ bytes/s} \approx 178 \text{ MB/s} \approx 1.42 \text{ Gbps}
$$

At 4K, 60 fps:

$$
R_{\text{raw}}^{4K} = 3840 \times 2160 \times 3 \times 60 = 1{,}492{,}992{,}000 \text{ bytes/s} \approx 1.39 \text{ GB/s} \approx 11.2 \text{ Gbps}
$$

### Duration to Storage

For a video of duration $t$ seconds:

$$
S_{\text{total}} = R_{\text{raw}} \times t
$$

| Resolution | FPS | 1 second | 1 minute | 1 hour |
|-----------|-----|----------|----------|--------|
| 1080p | 30 | $\approx 178$ MB | $\approx 10.4$ GB | $\approx 625$ GB |
| 4K | 30 | $\approx 712$ MB | $\approx 41.7$ GB | $\approx 2.44$ TB |
| 4K | 60 | $\approx 1.39$ GB | $\approx 83.4$ GB | $\approx 4.88$ TB |

### Compression Ratio

A codec with compression ratio $C$ reduces the bitrate to:

$$
R_{\text{compressed}} = \frac{R_{\text{raw}}}{C}
$$

| Codec | Typical $C$ | 1080p30 Bitrate | 1 hour at 1080p30 |
|-------|-------------|-----------------|-------------------|
| Raw | $1$ | $1.42$ Gbps | $625$ GB |
| H.264 | $\sim 50$ | $\sim 28$ Mbps | $\sim 12.5$ GB |
| H.265 | $\sim 100$ | $\sim 14$ Mbps | $\sim 6.25$ GB |
| AV1 | $\sim 130$ | $\sim 11$ Mbps | $\sim 4.8$ GB |

### Bandwidth vs Quality Tradeoff

The relationship between bitrate $R$ and perceived quality $Q$ (measured in PSNR, dB) roughly follows a logarithmic curve:

$$
Q \approx Q_{\max} - k \cdot \ln\left(\frac{R_{\text{raw}}}{R}\right)
$$

Where $k$ is a codec-dependent constant. This means:

- Doubling the bitrate does **not** double the quality
- There are diminishing returns — going from 1 Mbps → 2 Mbps is far more noticeable than 10 Mbps → 11 Mbps
- Below a certain threshold $R_{\min}$, quality drops catastrophically (the "potato" zone)

### Streaming Feasibility Check

Given a viewer's bandwidth $B$:

$$
\text{Streamable if } R_{\text{compressed}} \leq B
$$

| Viewer Connection | Bandwidth $B$ | Max Streamable Quality |
|-------------------|---------------|----------------------|
| 3G Mobile | $\sim 2$ Mbps | 480p (low) |
| 4G Mobile | $\sim 20$ Mbps | 1080p (high) |
| Home Wi-Fi | $\sim 50$ Mbps | 4K |
| Covered phone 📱🤚 | $< 1$ Mbps | 360p or buffering |

This is exactly why **Adaptive Bitrate Streaming (ABR)** exists — the player continuously solves:

$$
Q^{*} = \arg\max_{q \in \{low, med, high\}} Q(q) \quad \text{subject to} \quad R(q) \leq B_{\text{estimated}}
$$

---

## Common Video Formats & Containers

### Containers (the "wrapper")

| Container | Extension | Notes |
|-----------|-----------|-------|
| **MP4** | `.mp4` | Most universal. Works everywhere. Uses H.264/H.265 inside. |
| **WebM** | `.webm` | Google's format. Uses VP8/VP9/AV1. Good for web. |
| **MKV** | `.mkv` | Kitchen sink — supports almost any codec. Not great for streaming. |
| **TS** | `.ts` | Transport Stream. Used by HLS for chunked streaming. |
| **FLV** | `.flv` | Legacy Flash format. Still used for RTMP ingest. |

### Codecs (the "compressor")

| Codec | Type | Compression | Notes |
|-------|------|-------------|-------|
| **H.264 (AVC)** | Lossy | ~50:1 | The workhorse. Universal browser support. |
| **H.265 (HEVC)** | Lossy | ~100:1 | 2× better compression, but licensing headaches. |
| **VP9** | Lossy | ~100:1 | Google's answer to H.265. Free, used by YouTube. |
| **AV1** | Lossy | ~130:1 | Next-gen. Free. Slow to encode, great quality. |
| **Raw/YUV** | None | 1:1 | Uncompressed. Huge. Good for demo purposes. |

### How Compression Works (simplified)

1. **Spatial compression (intra-frame):** Each frame is compressed like a JPEG — similar neighboring pixels are grouped.
2. **Temporal compression (inter-frame):** Only the *differences* between frames are stored. If the background doesn't change, it's stored once.
3. **Keyframes (I-frames):** Full frames inserted periodically. Everything between keyframes is stored as deltas (P-frames, B-frames).

> **Demo insight:** A checkerboard that is *static* compresses extremely well (temporal compression removes almost everything). A *rotating* checkerboard forces every frame to be different, making compression work harder and quality differences more visible.

---

## Generating a Checkerboard Video with FFmpeg

FFmpeg has built-in test pattern generators. No external tools needed.

### Static Checkerboard (10 seconds, 30fps, 1080p)

Uses the `geq` (generic equation) filter to generate true alternating black and white squares. Each square is 135×135 pixels (8×8 grid on a 1080×1080 canvas):

```bash
# True checkerboard: alternating filled black/white squares
ffmpeg -f lavfi -i "color=white:s=1080x1080:d=10:rate=30" \
  -vf "geq=lum='if(eq(mod(floor(X/135)+floor(Y/135),2),0),255,0)':cr=128:cb=128" \
  -c:v libx264 -pix_fmt yuv420p checkerboard_static.mp4
```

How `geq` works here:
- `X` and `Y` are the pixel coordinates
- `floor(X/135)` gives the column index, `floor(Y/135)` gives the row index
- `mod(col + row, 2)` alternates between 0 and 1
- If even → white (255), if odd → black (0)

### Rotating Checkerboard (this is the good one)

```bash
# Step 1: Generate a static checkerboard PNG
ffmpeg -f lavfi -i "color=white:s=1080x1080" \
  -vf "geq=lum='if(eq(mod(floor(X/135)+floor(Y/135),2),0),255,0)':cr=128:cb=128" \
  -frames:v 1 checkerboard.png

# Step 2: Animate it with rotation (full 360° over 10 seconds)
ffmpeg -loop 1 -i checkerboard.png -t 10 \
  -vf "rotate=2*PI*t/10:fillcolor=white:ow=1080:oh=1080" \
  -c:v libx264 -pix_fmt yuv420p -r 30 checkerboard_rotating.mp4
```

---

## Showcasing Quality Degradation

### Does Rotation Suffice?

**Yes, rotation is excellent for demonstrating degradation.** Here's why:

- A **static** checkerboard compresses almost perfectly — the sharp black/white edges stay crisp even at low bitrates because temporal compression means only one frame really matters.
- A **rotating** checkerboard defeats temporal compression — every single frame is unique, so the codec must compress each one more aggressively.
- At low bitrates, the sharp edges of the checkerboard pattern will show **blocking artifacts** (the squares become blurry or smeared), which are extremely easy to spot on a geometric pattern.

### Generating the Same Video at Different Quality Levels

```bash
# High quality (~5 Mbps)
ffmpeg -loop 1 -i checkerboard.png -t 10 \
  -vf "rotate=2*PI*t/10:fillcolor=white:ow=1080:oh=1080" \
  -c:v libx264 -b:v 5M -r 30 -pix_fmt yuv420p high.mp4

# Medium quality (~1 Mbps)
ffmpeg -loop 1 -i checkerboard.png -t 10 \
  -vf "rotate=2*PI*t/10:fillcolor=white:ow=1080:oh=1080" \
  -c:v libx264 -b:v 1M -r 30 -pix_fmt yuv420p medium.mp4

# Low quality (~200 Kbps)
ffmpeg -loop 1 -i checkerboard.png -t 10 \
  -vf "rotate=2*PI*t/10:fillcolor=white:ow=1080:oh=1080" \
  -c:v libx264 -b:v 200k -r 30 -pix_fmt yuv420p low.mp4

# Potato quality (~50 Kbps) — for dramatic effect
ffmpeg -loop 1 -i checkerboard.png -t 10 \
  -vf "rotate=2*PI*t/10:fillcolor=white:ow=1080:oh=1080" \
  -c:v libx264 -b:v 50k -r 30 -pix_fmt yuv420p potato.mp4
```

### What the Audience Will See

| Quality | Bitrate | What happens to the checkerboard |
|---------|---------|----------------------------------|
| **High** | 5 Mbps | Crisp edges, smooth rotation, looks perfect |
| **Medium** | 1 Mbps | Slight softening at edges during fast rotation |
| **Low** | 200 Kbps | Visible macro-blocking, edges smear into gray zones |
| **Potato** | 50 Kbps | Barely recognizable as a checkerboard, massive artifacts |

### Extra Demo Ideas Beyond Rotation

If you want to make the demo even more compelling, consider layering these:

1. **Scrolling text overlay** — Text is very sensitive to compression. Add a ticker with `drawtext` filter:
   ```bash
   -vf "rotate=...,drawtext=text='Streaming 101':fontsize=48:fontcolor=white:x=mod(t*200\,w):y=h-60"
   ```

2. **Color gradient background** — Replace the white fill with a gradient. Gradients show **banding artifacts** (smooth gradients become stepped) at low bitrates.

3. **Side-by-side comparison** — Use FFmpeg to stack high and low quality versions:
   ```bash
   ffmpeg -i high.mp4 -i potato.mp4 \
     -filter_complex "[0:v]scale=540:540[left];[1:v]scale=540:540[right];[left][right]hstack" \
     -c:v libx264 comparison.mp4
   ```

### Examining Individual Pixels

To show what "lower quality actually means" at the pixel level (from your use cases):

```bash
# Extract a single frame as raw RGB
ffmpeg -i low.mp4 -vf "select=eq(n\,0)" -frames:v 1 frame_low.png
ffmpeg -i high.mp4 -vf "select=eq(n\,0)" -frames:v 1 frame_high.png

# Zoom into a 64x64 pixel region to see the difference
ffmpeg -i frame_low.png -vf "crop=64:64:500:500,scale=640:640:flags=neighbor" zoom_low.png
ffmpeg -i frame_high.png -vf "crop=64:64:500:500,scale=640:640:flags=neighbor" zoom_high.png
```

The `flags=neighbor` scaling preserves individual pixels (no interpolation), so each pixel becomes a visible 10×10 block on screen — perfect for showing how compression smears sharp edges.

---

## Presentation Flow for This Section

1. **Show the math** — "A 1080p frame is 6MB. At 30fps that's 180MB/s. You can't stream that."
2. **Show the raw checkerboard** — Clean, sharp, geometric
3. **Encode it at 4 quality levels** — Play them side by side
4. **Zoom into pixels** — Show the actual RGB values changing between high and low
5. **Rotate it** — "Now compression has to work harder..." replay the comparison
6. **Connect to ABR** — "This is what happens when your player switches from high to low quality mid-stream"

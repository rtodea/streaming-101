# Demo media

Hand-crafted clips used by the slide deck (`slides/slidev/slides/03-compression.md`)
to show how the **same source** changes size and visible quality once the encoder
is told what bitrate to hit.

All clips are encoded with **libx264** (H.264 / AVC), profile **High**, level **3.2**,
pixel format `yuv420p`, 30 fps, 1080×1080, 10 seconds.

## Files

| File                          | Source                       | Encoder flags                | Bitrate (actual) | Size      | What it shows |
|-------------------------------|------------------------------|------------------------------|------------------|-----------|---------------|
| `checkerboard.png`            | `lavfi color` + `geq` filter | n/a                          | n/a              | 26 KB     | The static source frame |
| `checkerboard_still.mp4`      | loop `checkerboard.png`      | libx264 default (CRF 23)     | 16 kbps          | 24 KB     | Static content compresses to almost nothing |
| `checkerboard_rotating.mp4`   | rotate `checkerboard.png`    | libx264 default (CRF 23)     | 1.56 Mbps        | 1.95 MB   | Rotation defeats temporal compression |
| `high_still.mp4`              | `checkerboard_still.mp4`     | `-b:v 5M`                    | 23 kbps          | 33 KB     | Encoder won't overspend on trivial content |
| `high.mp4`                    | `checkerboard_rotating.mp4`  | `-b:v 5M`                    | 4.47 Mbps        | 5.60 MB   | Forced higher bitrate inflates the file 3× without adding info |
| `low_still.mp4`               | `checkerboard_still.mp4`     | `-b:v 200k`                  | 42 kbps          | 57 KB     | Static still undershoots low target |
| `low.mp4`                     | `checkerboard_rotating.mp4`  | `-b:v 200k`                  | 356 kbps         | 169 KB    | Visible blocking on the rotating squares |
| `potato_still.mp4`            | `checkerboard_still.mp4`     | `-b:v 50k`                   | 34 kbps          | 46 KB     | Static stays clean even at "potato" target |
| `potato.mp4`                  | `checkerboard_rotating.mp4`  | `-b:v 50k`                   | 305 kbps         | 385 KB    | Smear and macroblocks everywhere |
| `comparison.mp4`              | `high.mp4` + `potato.mp4`    | `hstack`                     | 1.77 Mbps        | 2.21 MB   | Side by side high vs potato |

## Why is `high.mp4` larger than `checkerboard_rotating.mp4`?

Both clips are H.264 of the same rotating checkerboard. The difference is **how
many bits the encoder was told to spend per second**.

* `checkerboard_rotating.mp4` was made with libx264's defaults: **CRF 23**,
  variable bitrate. The encoder spent the bits it actually needed for that
  quality target, which came out to **~1.56 Mbps**.
* `high.mp4` was re-encoded with `-b:v 5M`. That switches libx264 into
  average-bitrate mode and tells it to **target 5 Mbps**. The encoder dutifully
  spends the bits, which results in **~4.47 Mbps** and a file roughly **3×
  larger**.

Crucially: re-encoding from a 1.56 Mbps source to a 5 Mbps target does **not**
recover the information already discarded. The file is bigger but no sharper.

## How to regenerate everything

Run from this directory.

```bash
# 1. Static checkerboard PNG (geq filter draws each square via pixel coords)
ffmpeg -y -f lavfi -i "color=white:s=1080x1080" \
  -vf "geq=lum='if(eq(mod(floor(X/135)+floor(Y/135),2),0),255,0)'" \
  -frames:v 1 checkerboard.png

# 2a. Looping the static image, no motion (defaults to CRF 23)
ffmpeg -y -loop 1 -i checkerboard.png -t 10 \
  -c:v libx264 -pix_fmt yuv420p -r 30 checkerboard_still.mp4

# 2b. Rotate it (360 degrees over 10s, defeats temporal compression)
ffmpeg -y -loop 1 -i checkerboard.png -t 10 \
  -vf "rotate=2*PI*t/10:fillcolor=white:ow=1080:oh=1080" \
  -c:v libx264 -pix_fmt yuv420p -r 30 checkerboard_rotating.mp4

# 3. Re-encode the rotating clip at three bitrate tiers
ffmpeg -y -i checkerboard_rotating.mp4 -c:v libx264 -b:v 5M   high.mp4
ffmpeg -y -i checkerboard_rotating.mp4 -c:v libx264 -b:v 200k low.mp4
ffmpeg -y -i checkerboard_rotating.mp4 -c:v libx264 -b:v 50k  potato.mp4

# 4. Same three tiers applied to the static clip (for comparison)
ffmpeg -y -i checkerboard_still.mp4 -c:v libx264 -b:v 5M   high_still.mp4
ffmpeg -y -i checkerboard_still.mp4 -c:v libx264 -b:v 200k low_still.mp4
ffmpeg -y -i checkerboard_still.mp4 -c:v libx264 -b:v 50k  potato_still.mp4

# 5. Stack two rotating clips side by side for the comparison demo
ffmpeg -y -i high.mp4 -i potato.mp4 \
  -filter_complex "[0:v][1:v]hstack=inputs=2" comparison.mp4
```

## Probing a file

```bash
ffprobe -v error -show_format -show_streams high.mp4
```

Useful fields: `codec_name`, `profile`, `level`, `pix_fmt`, `bit_rate`, `width`,
`height`, `r_frame_rate`.

## Where these files are used

The presentation walks the audience through three stories with this set:

1. **Containers vs codecs**: every file is `.mp4` (container) holding **H.264**
   (codec). One container, one codec, very different sizes.
2. **Temporal compression in action**: the `*_still` files vs the rotating
   files. Same encoder, same flags, different motion. Static → tiny. Rotating
   → 80× larger.
3. **Bitrate ≠ quality**: `high.mp4` vs `checkerboard_rotating.mp4` shows that
   forcing a higher target bitrate inflates the file without adding any
   information. `low.mp4` and `potato.mp4` show the opposite, where a low
   target produces visible blocking artifacts.

# What Is a Video, Really?

At the lowest level: a sequence of **frames**, each frame a grid of **pixels**, each pixel a set of **bytes**.

<v-click>

### Pixel → Frame → Video

</v-click>

<table>
<thead><tr><th>Level</th><th>What it is</th><th>Size</th></tr></thead>
<tbody>
<tr><td v-click><b>Pixel</b></td><td v-click>3 bytes (R, G, B)</td><td v-click>3 bytes</td></tr>
<tr><td v-click><b>Frame</b></td><td v-click>1920 × 1080 pixels</td><td v-click><b>~6 MB</b></td></tr>
<tr><td v-click><b>1 second</b></td><td v-click>30 frames</td><td v-click><b>~180 MB/s</b></td></tr>
<tr><td v-click><b>1 minute</b></td><td v-click>60 seconds</td><td v-click><b>~10.8 GB</b></td></tr>
</tbody>
</table>

<v-click>

> Nobody streams raw video. This is why compression exists.

</v-click>

---

# YouTube Quality Tiers: What Do They Mean?

The number is the **vertical pixel count**. More pixels = sharper image, but exponentially more data.

<table>
<thead><tr><th>Label</th><th>Resolution</th><th>Pixels/Frame</th><th>×1080p</th></tr></thead>
<tbody>
<tr><td v-click>360p</td><td v-click>640 × 360</td><td v-click>230,400 ≈ 230K</td><td v-click>0.11×</td></tr>
<tr><td v-click>480p (SD)</td><td v-click>854 × 480</td><td v-click>409,920 ≈ 410K</td><td v-click>0.20×</td></tr>
<tr><td v-click>720p (HD)</td><td v-click>1280 × 720</td><td v-click>921,600 ≈ 922K</td><td v-click>0.44×</td></tr>
<tr><td v-click>1080p (Full HD)</td><td v-click>1920 × 1080</td><td v-click>2,073,600 ≈ 2.07M</td><td v-click>1×</td></tr>
<tr><td v-click>1440p (2K)</td><td v-click>2560 × 1440</td><td v-click>3,686,400 ≈ 3.69M</td><td v-click>1.78×</td></tr>
<tr><td v-click>2160p (4K)</td><td v-click>3840 × 2160</td><td v-click>8,294,400 ≈ 8.29M</td><td v-click>4×</td></tr>
</tbody>
</table>

<v-click>

> "4K" = **4× the pixels** of 1080p, not 4× the width.

</v-click>

---

# Why "p" and Why Vertical?

<v-clicks>

- The **"p"** stands for **progressive scan** (every line drawn each frame, vs **"i"** = interlaced — odd/even lines alternating)
- Early TV standards were defined by **scan lines** (vertical resolution) — 480i (NTSC), 576i (PAL)
- When HD arrived, the same convention stuck: **720p**, **1080i**, **1080p**
- The **horizontal** pixels just follow from the **aspect ratio** (16:9) — given 1080 vertical → 1920 horizontal

</v-clicks>

<v-click>

### So why is 2160p called "4K"?

</v-click>

<v-clicks>

- Cinema (DCI) standard is 4096 × 2160 — the **"4K"** refers to ~4000 **horizontal** pixels
- Consumer "4K" (UHD) is 3840 × 2160 — the name was borrowed from cinema marketing
- Confusingly, **4K switches to horizontal** naming while everything else uses vertical

</v-clicks>

---

# Frame Rate: 30 fps vs 60 fps

The **frame rate** multiplies everything — more frames per second = smoother motion, but double the data.

<table>
<thead><tr><th>Resolution</th><th>30 fps (raw)</th><th>60 fps (raw)</th><th>Difference</th></tr></thead>
<tbody>
<tr><td v-click>720p</td><td v-click>82,944,000 ≈ 79 MB/s</td><td v-click>165,888,000 ≈ 158 MB/s</td><td v-click>2×</td></tr>
<tr><td v-click>1080p</td><td v-click>186,624,000 ≈ 178 MB/s</td><td v-click>373,248,000 ≈ 356 MB/s</td><td v-click>2×</td></tr>
<tr><td v-click>4K</td><td v-click>746,496,000 ≈ 712 MB/s</td><td v-click>1,492,992,000 ≈ 1.4 GB/s</td><td v-click>2×</td></tr>
</tbody>
</table>

<v-clicks>

- **30 fps** — standard for most video (films are 24 fps)
- **60 fps** — gaming, sports, fast motion (YouTube shows "1080p60" badge)
- Higher fps helps with **motion clarity** but doesn't improve still-image sharpness

</v-clicks>

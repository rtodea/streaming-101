# What Is a Video, Really?

<div class="grid grid-cols-2 gap-6 items-center">
<div>

<img src="/images/streaming-101-moving-pictures.png" alt="Filmstrip showing a ball bouncing frame by frame" class="filmstrip" />

</div>
<div>

At the lowest level: a sequence of **frames**, each frame a grid of **pixels**, each pixel a set of **bytes**.

<v-click>

### Pixel → Frame → Video

</v-click>

<v-click>

<table>
<thead><tr><th>Level</th><th>What it is</th><th>Size</th></tr></thead>
<tbody v-clicks>
<tr><td><b>Byte</b></td><td>8 bits (0 or 1), 0–255</td><td>1 byte</td></tr>
<tr><td><b>Pixel</b></td><td>3 bytes (R, G, B)</td><td>3 bytes</td></tr>
<tr><td><b>Frame</b></td><td>1920 × 1080 pixels</td><td><b>~6 MB</b></td></tr>
<tr><td><b>1 second</b></td><td>30 frames</td><td><b>~180 MB/s</b></td></tr>
<tr><td><b>1 minute</b></td><td>60 seconds</td><td><b>~10.8 GB</b></td></tr>
</tbody>
</table>

</v-click>

<v-click>

> Nobody streams raw video. This is why compression exists.

</v-click>

</div>
</div>

<style scoped>
.filmstrip {
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
}
</style>

---

# Why Video Even Works

Video is just still pictures shown fast. Two old ideas explain why your brain experiences "motion."

<v-clicks>

- **Persistence of vision** *(Peter Mark Roget, 1824)*. The same Roget who later compiled the thesaurus. He noticed that the spokes of a wheel, seen through the slats of a fence, appeared continuous. His paper proposed that a retinal image **lingers ~50 ms** after the light is gone.
- **The Phi phenomenon** *(Max Wertheimer, 1912)*. Two dots flashing in different positions are perceived as one dot **moving**. Motion isn't on the screen. It's **invented by the visual cortex**.
- **Why 24 fps?** Silent films ran at 16 to 22 fps to save expensive nitrate stock. When sound-on-film arrived in 1927, the industry needed a *consistent* speed for the optical audio track. 24 fps was the cheapest rate that kept dialog intelligible and dropped the choppiness.

</v-clicks>

<v-click>

> Cinema works not because we're seeing motion, but because our brain *invents* motion from a flicker of stills.

</v-click>

<style scoped>
ul { font-size: 0.85em; }
ul li { margin: 0.25em 0; }
blockquote { font-size: 0.9em; }
</style>

---

# You're Blind Several Times a Minute

Your eyes don't pan smoothly. They jump in **saccades**, 3 to 5 times every second.

<v-clicks>

- During each saccade (~30 to 80 ms) the brain **suppresses vision entirely** to hide the motion blur. *(Erdmann & Dodge, 1898; Volkmann, 1962.)*
- Add it up: roughly **40 minutes of every waking day, you are functionally blind**, and you don't notice.
- The **stopped-clock illusion** is direct proof. Glance quickly at a wall clock and the second hand seems to pause an unusually long beat. Your brain back-fills the saccade with the *first* image it sees on landing. *(Yarrow et al., Nature, 2001.)*

</v-clicks>

<v-click>

> Your visual system drops frames constantly and lies about it.

</v-click>

<style scoped>
ul { font-size: 0.88em; }
ul li { margin: 0.25em 0; }
blockquote { font-size: 0.9em; }
</style>

---

# Blinks Are P-Frames for Your Eyes

You blink 15 to 20 times per minute, ~100 ms each. Roughly **10% of your waking life is spent with your eyes shut.**

<v-clicks>

- The world doesn't go dark. The brain holds the last image in **iconic memory** for ~250 to 500 ms. *(George Sperling, Harvard PhD thesis, 1960.)*
- Whatever didn't change since the previous "frame" is reused. Whatever did is patched in.

</v-clicks>

<v-click>

<table>
<thead><tr><th>Codec trick</th><th>Brain trick</th></tr></thead>
<tbody v-clicks>
<tr><td><b>I-frame</b>: full picture, decodable alone</td><td>A fresh look on saccade landing</td></tr>
<tr><td><b>P-frame</b>: store only what changed</td><td>Reuse iconic memory, patch the delta</td></tr>
<tr><td><b>Buffer</b>: smooth out network jitter</td><td>Smooth out blinks and saccades</td></tr>
</tbody>
</table>

</v-click>

<v-click>

> Compression engineers reinvented, in software, the same shortcuts evolution shipped in our visual cortex.

</v-click>

<style scoped>
ul, p { font-size: 0.85em; }
table { font-size: 0.8em; margin-top: 0.4em; }
table th, table td { padding: 0.25em 0.6em; }
blockquote { font-size: 0.85em; margin-top: 0.3em; }
</style>

---

# You Live ~100 ms in the Past

Vision has a pipeline. Each stage adds latency.

<v-clicks>

- **13 to 20 ms**: photon hits the retina, triggers a chemical signal in a photoreceptor.
- **40 to 60 ms**: signal travels the optic nerve to the visual cortex.
- **100 to 150 ms**: cortex assembles edges, motion, depth into something you "see."

</v-clicks>

<v-click>

### Streaming latencies, for comparison

</v-click>

<v-clicks>

- **Your brain**: ~100 ms.
- **WebRTC video call**: ~200 ms.
- **Low-Latency HLS**: ~1,000 ms.
- **Standard HLS / TV broadcast**: 6 to 30 seconds.

</v-clicks>

<v-click>

> "Real-time" is a lie. Even your own eyes lag ~100 ms behind reality.

</v-click>

<style scoped>
ul { font-size: 0.85em; }
ul li { margin: 0.2em 0; }
h3 { font-size: 0.95em; margin: 0.5em 0 0.2em; }
blockquote { font-size: 0.9em; }
</style>

---
clicks: 6
---

# Your Eye-to-Mind Pipeline

<MermaidReveal :diagram="`
sequenceDiagram
    participant P as Photon
    participant R as Retina (rod or cone)
    participant N as Optic nerve
    participant V as Visual cortex
    participant M as Conscious mind
    P->>R: Hits photoreceptor
    R->>R: Chemical cascade (13 to 20 ms)
    R->>N: Electrical signal
    N->>V: Travel time (40 to 60 ms)
    V->>V: Edge, motion, depth, recognition
    V->>M: 'I see' (100 to 150 ms total)
`" />

---

# Your Brain Is Already Predicting

If the brain has a 100 ms lag, how do you catch a ball?

<v-clicks>

- The visual cortex **extrapolates**. It guesses where moving objects will be ~100 ms ahead of where they currently are, to compensate for its own delay.
- The **flash-lag effect** *(Nijhawan, Nature, 1994)*: a moving ball and a flash that *physically* coincide are perceived with the ball **ahead** of the flash. The brain has already moved on.
- This is exactly the same trick a P-frame uses, but in the *time* dimension instead of *space*.

</v-clicks>

<v-click>

> You're not seeing reality. You're seeing your brain's best guess of where reality is *about to be*.

</v-click>

<style scoped>
ul { font-size: 0.88em; }
ul li { margin: 0.25em 0; }
blockquote { font-size: 0.9em; }
</style>

---

# YouTube Quality Tiers: What Do They Mean?

The number is the **vertical pixel count**. More pixels = sharper image, but exponentially more data.

<v-click>

<table>
<thead><tr><th>Label</th><th>Resolution</th><th>Pixels/Frame</th><th>×1080p</th></tr></thead>
<tbody v-clicks>
<tr><td>360p</td><td>640 × 360</td><td>230,400 ≈ 230K</td><td>0.11×</td></tr>
<tr><td>480p (SD)</td><td>854 × 480</td><td>409,920 ≈ 410K</td><td>0.20×</td></tr>
<tr><td>720p (HD)</td><td>1280 × 720</td><td>921,600 ≈ 922K</td><td>0.44×</td></tr>
<tr><td>1080p (Full HD)</td><td>1920 × 1080</td><td>2,073,600 ≈ 2.07M</td><td>1×</td></tr>
<tr><td>1440p (2K)</td><td>2560 × 1440</td><td>3,686,400 ≈ 3.69M</td><td>1.78×</td></tr>
<tr><td>2160p (4K)</td><td>3840 × 2160</td><td>8,294,400 ≈ 8.29M</td><td>4×</td></tr>
</tbody>
</table>

</v-click>

<v-click>

> "4K" = **4× the pixels** of 1080p, not 4× the width.

</v-click>

---

# Why "p" and Why Vertical?

<v-clicks>

- The **"p"** stands for **progressive scan** (every line drawn each frame, vs **"i"** = interlaced, odd/even lines alternating)
- Early TV standards were defined by **scan lines** (vertical resolution): 480i (NTSC), 576i (PAL)
- When HD arrived, the same convention stuck: **720p**, **1080i**, **1080p**
- The **horizontal** pixels just follow from the **aspect ratio** (16:9): given 1080 vertical → 1920 horizontal

</v-clicks>

<v-click>

### So why is 2160p called "4K"?

</v-click>

<v-clicks>

- Cinema (DCI) standard is 4096 × 2160, and the **"4K"** refers to ~4000 **horizontal** pixels
- Consumer "4K" (UHD) is 3840 × 2160. The name was borrowed from cinema marketing.
- Confusingly, **4K switches to horizontal** naming while everything else uses vertical

</v-clicks>

---

# Frame Rate: 30 fps vs 60 fps

The **frame rate** multiplies everything. More frames per second = smoother motion, but double the data.

<v-click>

<table>
<thead><tr><th>Resolution</th><th>30 fps (raw)</th><th>60 fps (raw)</th><th>Difference</th></tr></thead>
<tbody v-clicks>
<tr><td>720p</td><td>82,944,000 ≈ 79 MB/s</td><td>165,888,000 ≈ 158 MB/s</td><td>2×</td></tr>
<tr><td>1080p</td><td>186,624,000 ≈ 178 MB/s</td><td>373,248,000 ≈ 356 MB/s</td><td>2×</td></tr>
<tr><td>4K</td><td>746,496,000 ≈ 712 MB/s</td><td>1,492,992,000 ≈ 1.4 GB/s</td><td>2×</td></tr>
</tbody>
</table>

</v-click>

<v-clicks>

- **30 fps**: standard for most video (films are 24 fps)
- **60 fps**: gaming, sports, fast motion (YouTube shows "1080p60" badge)
- Higher fps helps with **motion clarity** but doesn't improve still-image sharpness

</v-clicks>

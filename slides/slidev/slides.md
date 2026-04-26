---
theme: default
colorSchema: light
title: 'Streaming 101: From Pixels to Packets in JavaScript'
info: |
  A timjs meetup presentation on how video streaming actually works,
  from raw pixels to HLS adaptive bitrate delivery.
fonts:
  sans: Inter
  mono: JetBrains Mono
  local: Inter, JetBrains Mono
highlighter: shiki
drawings:
  persist: false
transition: slide-left
layout: cover-image
image: /images/no-tv-signal.jpg
---

# Streaming 101

### From Pixels to Packets in JavaScript

<p class="muted">timjs meetup, 2026</p>

---
layout: section-break
title: Pixels & Perception
subtitle: What is a video, and why does the brain see motion?
---

---
src: ./slides/02-pixels-and-video.md
---

---
layout: section-break
title: Compression
subtitle: How a 1.4 Gbps stream becomes 5 Mbps.
---

---
src: ./slides/03-compression.md
---

---
layout: section-break
title: The video tag
subtitle: How the browser plays files we throw at it.
---

---
src: ./slides/04-video-tag.md
---

---
layout: section-break
title: HLS & Adaptive Bitrate
subtitle: Chunked delivery the network can survive.
---

---
src: ./slides/05-hls-and-abr.md
---

---
layout: section-break
title: Live Streaming
subtitle: When the next chunk doesn't exist yet.
---

---
src: ./slides/06-live-streaming.md
---

---
layout: section-break
title: Wrap Up
subtitle: Takeaways, demo, questions.
---

---
src: ./slides/07-demos-and-closing.md
---

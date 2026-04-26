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
title: Eyes Are Liars
subtitle: What a video really is, and why the brain insists it's moving.
---

---
src: ./slides/02-pixels-and-video.md
---

---
layout: section-break
title: Codecs Are Magic
subtitle: How a 1.4 Gbps stream becomes 5 Mbps without you noticing.
---

---
src: ./slides/03-compression.md
---

---
layout: section-break
title: The Tag, Tamed
subtitle: One HTML element, every file format the browser feels like supporting.
---

---
src: ./slides/04-video-tag.md
---

---
layout: section-break
title: Chunked, Cached, Adaptive
subtitle: HLS chops video into bites the network and the CDN can survive.
---

---
src: ./slides/05-hls-and-abr.md
---

---
layout: section-break
title: Live Is Always Late
subtitle: When the next chunk doesn't exist yet, and how we cope.
---

---
src: ./slides/06-live-streaming.md
---

---
layout: section-break
title: Roll Credits
subtitle: Takeaways, one last demo, and your questions.
---

---
src: ./slides/07-demos-and-closing.md
---

# The Wow Factor

<v-clicks>

- **📱 Audience Participation** — Scan the QR code → join as a viewer → your stats appear live on the dashboard.
- **📊 Live Stats Dashboard** — The presenter sees real-time viewer count, bandwidth, quality distribution, and chunk request rates.
- **🤚 Bandwidth Degradation** — Cover your phone → watch the dashboard react as quality downgrades cascade across viewers.

</v-clicks>

---

# Segment Size Tuning

The presenter tweaks HLS segment duration **live** — and the audience sees latency change in real-time.

<table>
<thead><tr><th>Config</th><th>Before</th><th>After</th></tr></thead>
<tbody>
<tr><td v-click>Segment size</td><td v-click>6s</td><td v-click>2s</td></tr>
<tr><td v-click>Buffered chunks</td><td v-click>3</td><td v-click>3</td></tr>
<tr><td v-click>Latency</td><td v-click>~18s</td><td v-click>~6s</td></tr>
</tbody>
</table>

<v-click>

> The "aha moment" — a single config change dramatically affects the streaming experience.

</v-click>

---
layout: demo-break
title: Audience Participation Demo
url: /presenter
---

---
layout: url-reference
---

# Further Reading

<v-clicks>

- **[HLS Specification (RFC 8216)](https://datatracker.ietf.org/doc/html/rfc8216)** — The RFC behind HTTP Live Streaming
- **[hls.js](https://github.com/video-dev/hls.js)** — The player library powering our viewer
- **[FFmpeg Documentation](https://ffmpeg.org/documentation.html)** — The transcoding engine reference
- **[Web API: MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)** — Browser API for capturing camera streams
- **[Adaptive Streaming (Wikipedia)](https://en.wikipedia.org/wiki/Adaptive_bitrate_streaming)** — Overview of ABR techniques

</v-clicks>

---
layout: next-adventure
---

# Choose Your Next Adventure

<v-clicks>

- **WebRTC** — Real-time peer-to-peer streaming with sub-second latency
- **DASH** — MPEG's alternative to HLS (Dynamic Adaptive Streaming over HTTP)
- **AV1** — Next-gen codec: better than H.265, royalty-free
- **WebTransport** — HTTP/3 based low-latency streaming protocol
- **Media Source Extensions** — The browser API that makes hls.js possible
- **WebCodecs** — Low-level encode/decode directly in the browser

</v-clicks>

---
layout: quote
author: ''
---

# Thank You!

### Questions?

<p class="muted">github.com/timjs/streaming-101</p>

---
layout: demo-break
title: Audience Participation Demo
url: /presenter
---

---
layout: next-adventure
class: my-takeaways
---

# My Takeaways

<v-clicks>

- **Video is a magic trick** showing pictures fast enough that the brain invents the motion.
- **There is a lot of engineering** behind every video file, from the capture device to storage to playback.
- **Everyone uses FFmpeg** under the hood for video pipelines (Fabrice Bellard is the GOAT).
- **The network adds complexity** jitter, latency, ABR, all in service of keeping the picture moving.
- **"Live" is never live** neither in your biology nor in your browser.
- **Limited by design** browser standards have to please everybody, and the constraints aren't always obvious.

</v-clicks>

<style scoped>
.my-takeaways :deep(h1) { font-size: 1.3rem !important; margin-bottom: 1rem !important; }
.my-takeaways :deep(ul) { gap: 0.6rem !important; }
.my-takeaways :deep(li) { padding: 0.55rem 0.9rem !important; font-size: 0.78rem; line-height: 1.35; }
.my-takeaways :deep(li strong) { font-size: 0.92rem !important; margin-bottom: 0.15rem !important; }
</style>

---
layout: url-reference
---

# Further Reading

<v-clicks>

- **[HLS Specification (RFC 8216)](https://datatracker.ietf.org/doc/html/rfc8216)**: the RFC behind HTTP Live Streaming
- **[hls.js](https://github.com/video-dev/hls.js)**: the player library powering our viewer
- **[FFmpeg Documentation](https://ffmpeg.org/documentation.html)**: the transcoding engine reference
- **[Web API: MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)**: browser API for capturing camera streams
- **[Adaptive Streaming (Wikipedia)](https://en.wikipedia.org/wiki/Adaptive_bitrate_streaming)**: overview of ABR techniques

</v-clicks>

---
layout: next-adventure
---

# Choose Your Next Adventure

<v-clicks>

- **WebRTC** real-time peer-to-peer streaming with sub-second latency
- **DASH** MPEG's alternative to HLS (Dynamic Adaptive Streaming over HTTP)
- **AV1** next-gen codec, better than H.265, royalty-free
- **WebTransport** HTTP/3 based low-latency streaming protocol
- **Media Source Extensions** the browser API that makes hls.js possible
- **WebCodecs** low-level encode/decode directly in the browser

</v-clicks>

---
layout: cover-image
image: /images/smpte-color-bars.svg
side: right
---

# Buffering Questions...

### Open the floor.

<p class="muted">github.com/rtodea/streaming-101</p>

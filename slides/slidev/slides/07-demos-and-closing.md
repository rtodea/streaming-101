---
layout: demo-break
title: Audience Participation Demo
url: /presenter
---

---

# My Takeaways

<v-clicks>

1. Video is a **magic trick**: showing pictures fast enough that the brain invents motion.
2. There is **a lot of engineering** behind our video files: in the capturing devices, in storing them, in playing them back.
3. **Everyone uses FFmpeg** under the hood for video pipelines.
4. The **network adds an extra layer of complexity**: jitter, latency, ABR, all in service of keeping the picture moving.
5. **"Live" is never live**, neither in your biology nor in your browser.
6. **Browser standards have to please everybody**, and sometimes it's not obvious why things are "limited by design".

</v-clicks>

<style scoped>
ol {
  column-count: 2;
  column-gap: 2.5em;
  font-size: 0.85em;
  margin: 0.4em 0;
  padding-left: 1.5em;
}
ol li { break-inside: avoid; margin: 0.4em 0; padding-left: 0.2em; }
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

# Open Questions and Thanks

<div class="closing">
<div class="closing__text">

### Open Questions?

<p class="muted">github.com/rtodea/streaming-101</p>

</div>
<div class="closing__image">
  <img src="/images/tv-test-pattern.jpg" alt="Vintage TV test pattern with 'please stand by' message" />
</div>
</div>

<style scoped>
.closing { display: grid; grid-template-columns: 3fr 2fr; gap: 2rem; align-items: center; height: 100%; }
.closing__text h3 { font-size: 1.4em; margin-bottom: 0.5em; }
.closing__text p.muted { font-size: 1em; }
.closing__image img { width: 100%; height: auto; max-height: 60vh; object-fit: contain; border-radius: 0.4em; }
</style>

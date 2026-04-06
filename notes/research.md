# Streaming 101: Presentation Research & Planning

## Title Ideas
Given the tight 30-minute timeframe and the focus on JavaScript, here are a few catchy titles for your meetup presentation:
1. **Streaming 101: From Pixels to Packets in JavaScript**
2. **Demystifying Video Streaming: Building a Mini-Netflix in 30 Minutes**
3. **Beyond the Buffer: How Video Streaming Platforms Actually Work**
4. **Pixels in Motion: A Deep Dive into Web Streaming Architectures**
5. **JavaScript on Air: The Mechanics of Live and VOD Streaming**

---

## 1. Presentation Slides (Markdown to Slides)
You need a tool to showcase Markdown-to-Slides conversion. Here are the top contenders:

### **Slidev** (Highly Recommended for JS developers)
*   **Pros:** Built specifically for developers (uses Vue/Vite), supports Vue components inside markdown, excellent syntax highlighting, fast hot-reloading, presentational drawing tools built-in.
*   **Cons:** Requires Node.js environment to run/build (not just a simple HTML file initially).

### **Marp**
*   **Pros:** Very simple, integrates beautifully with VS Code (you can preview slides directly in your editor), outputs to PDF/HTML/PPTX easily.
*   **Cons:** Less customizable than Slidev when it comes to interactive web components.

### **Reveal.js** (via Markdown plugin)
*   **Pros:** The industry standard, highly robust, massive ecosystem of plugins, 3D transitions.
*   **Cons:** Can be slightly heavier to set up from scratch compared to Marp; Markdown is sometimes treated as a secondary citizen to its HTML API.

---

## 2. Application Architecture

### Server Framework: NextJS vs NestJS
For a streaming platform involving video ingestion, transcoding, and live websockets:

*   **NextJS (React Framework)**
    *   **Pros:** Incredible for the Viewer/Creator frontend. Easy routing, great SEO (if it were public), fast UI development.
    *   **Cons:** Not designed for heavy, long-running backend processes like video transcoding (FFmpeg) or complex WebSocket handling for live stats.
*   **NestJS (Node.js Framework)**
    *   **Pros:** Built on Express/Fastify, perfectly suited for heavy backend lifting. Excellent out-of-the-box support for WebSockets (Socket.io) which you *will* need for the "Wow Factor #1" (live viewer counts and stats). Great architecture for microservices (separating the API from the Transcoder).
    *   **Cons:** Heavier learning curve if you are only used to React; you still need a separate frontend (e.g., plain React or NextJS).
*   **Recommendation:** Use **NextJS** for the Frontend (Creator/Viewer UI) and **NestJS** for the Backend (API, WebSockets, FFmpeg spawning). If you must pick only one to save time, a custom **Express** server serving a React SPA might be the fastest to build for a 30-min demo.

### Infrastructure: k3s
*   **Pros:** Lightweight Kubernetes. Great way to show a "real-world" deployment on your server (`tadeo.ro`). You can show how a transcoder pod scales.
*   **Cons:** High risk for a live 30-minute demo. K8s networking (ingress, exposing RTMP ports for live streaming) can be finicky. Ensure you have automated scripts to reset the cluster if something fails.

---

## 3. Answering Use Case Questions

### Use Case: Viewer gets right track based on bandwidth
*   **How "Auto" works behind the scenes (Adaptive Bitrate Streaming - ABR):**
    *   The video isn't sent as one big file. It's chopped into small chunks (e.g., 2 to 6-second segments) using protocols like **HLS** (Apple) or **DASH**.
    *   The server provides a "Manifest" (a `.m3u8` or `.mpd` file) that lists all available qualities (1080p, 720p, 480p) and where to find their chunks.
    *   The browser player (like video.js or hls.js) downloads the first chunk at a low quality to start playing immediately.
    *   While downloading, it calculates the user's bandwidth. If the bandwidth is high enough, the player's algorithm decides to request the *next* 2-second chunk from the 1080p list.
    *   If bandwidth drops, it requests the next chunk from the 480p list. The transition happens seamlessly because the chunks are aligned precisely by keyframes.

### Use Case: Setting up a Live Stream
*   **Is the camera ingest the highest quality available?**
    *   Yes. The creator's streaming software (like OBS or web-based WebRTC) sends a "Mezzanine" or "Ingest" stream to your server. This is the source of truth and the highest quality you will have.
*   **Are there any processing happening on the backend? Do we get the low/medium/high split somewhere?**
    *   **Yes.** This process is called **Transcoding** (specifically, Live Transcoding).
    *   Your backend (e.g., an Nginx-RTMP module or a Node server wrapping FFmpeg) receives the single high-quality 1080p ingest stream.
    *   It immediately runs FFmpeg to decode the video and re-encode it simultaneously into 1080p, 720p, and 480p streams.
    *   It then "Transmuxes" (repackages) these streams into HLS/DASH chunks on the fly so viewers can watch them.

### Use Case: Wow Factor #1 (Live Stats & Tweaks)
*   **What to tweak live to observe delay?**
    *   **HLS Segment Size:** Change the chunk size from 6 seconds to 2 seconds or 1 second.
    *   *Why?* HLS typically requires 3 chunks to be buffered before playback starts. If chunks are 6s, latency is ~18 seconds. If chunks are 1s, latency drops to ~3 seconds. Tweaking this live (and restarting the stream) is a massive "Aha!" moment for the audience.

### Use Case: Wow Factor #2 (Covering phones to simulate poor bandwidth)
*   **Should we do this with Live or VOD (Streams)?**
    *   **Recommendation: Do it with VOD (Pre-recorded stream).**
    *   *Why?* VOD relies purely on chunk downloading (HLS/DASH). When they cover their phones, the player's buffer will drain, it will detect the slow speed, and visually downgrade the quality for the next chunk. It's highly predictable and easy to see.
    *   Live streaming (especially if you try to achieve sub-second latency using WebRTC) handles packet loss differently (dropping frames, stuttering, or disconnecting). Using HLS for live works like VOD, but the inherent live delay might confuse the demonstration. Stick to VOD for the clearest demonstration of Adaptive Bitrate (ABR).

---

## Presentation Timing Strategy (45 mins total)
*   **0-5 min:** Intro & Concept (What is a pixel? What is a raw video frame?)
*   **5-15 min:** VOD Demo (Upload, Transcode, ABR in action - Wow Factor #2)
*   **15-25 min:** Live Stream Architecture (Ingest, FFmpeg, HLS chunking)
*   **25-30 min:** Wow Factor #1 (Live stats, viewer count, tweaking segment size for latency)
*   **30-45 min:** Q&A

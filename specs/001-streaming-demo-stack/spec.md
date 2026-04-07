# Feature Specification: Streaming Demo Stack

**Feature Branch**: `001-streaming-demo-stack`
**Created**: 2026-04-07
**Status**: Draft
**Input**: User description: "Let's build all the different parts of this awesome demo focused on streaming. A client and a server to handle all the webRTC requirements and streaming stuff."

## Clarifications

### Session 2026-04-07

- Q: Live ingest protocol — RTMP, WebRTC, or both? → A: WebRTC only. Browser-based camera capture, no external tools required.
- Q: Accepted video upload formats? → A: Common web formats only — MP4, WebM, MOV. Others rejected.
- Q: Video storage persistence across restarts? → A: Persistent via Docker volume. Future migration to bucket storage possible but not in scope now.
- Q: How many distinct UI views? → A: 4 views — Presenter (upload + dashboard + live controls), Catalog, Player (VOD + live), QR Landing.
- Q: Maximum upload file size? → A: Configurable via environment variable, default 500 MB.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - VOD Upload & Adaptive Playback (Priority: P1)

A presenter uploads a pre-recorded video through a web interface. The system transcodes it into multiple quality levels and produces HLS manifests. An audience member opens the viewer page on their phone (via QR code), picks a video, and watches it. As their network conditions change, playback seamlessly switches between quality levels without interruption.

**Why this priority**: VOD with adaptive bitrate is the foundation of the entire demo. It proves the core pipeline (upload, transcode, chunk, manifest, playback) works end-to-end and directly supports the "Wow Factor #2" bandwidth degradation demo where audience members cover their phone antennas.

**Independent Test**: Upload a sample video, wait for transcoding to complete, open the viewer on a mobile device, play the video, and observe quality switches by throttling the network connection.

**Acceptance Scenarios**:

1. **Given** a presenter on the upload page, **When** they select and submit a video file, **Then** the system accepts the upload, shows a progress indicator, and begins transcoding automatically.
2. **Given** a video that has finished transcoding, **When** a viewer opens the playback page and selects it, **Then** playback starts within 5 seconds at the lowest available quality.
3. **Given** a viewer watching a video on high bandwidth, **When** their bandwidth drops significantly, **Then** the player switches to a lower quality level within 2 chunk cycles without pausing playback.
4. **Given** a viewer watching at low quality, **When** bandwidth recovers, **Then** the player upgrades to a higher quality level within 3 chunk cycles.

---

### User Story 2 - Live Streaming from Camera to Viewers (Priority: P2)

A presenter starts a live stream from their browser camera via WebRTC (no external software needed). The server ingests the stream, transcodes it into multiple quality levels in real time, and produces live HLS segments. Audience members watching on their phones see the live stream with adaptive bitrate, experiencing a latency that visibly changes when the presenter adjusts the HLS segment size.

**Why this priority**: Live streaming is the second major demo pillar and showcases the real-time transcoding pipeline. It directly supports "Wow Factor #1" where the presenter tweaks segment size live to demonstrate the latency trade-off.

**Independent Test**: Start a live stream from a camera, open the viewer on 2+ devices, verify all see the live feed with ABR, then change the segment size and observe latency change.

**Acceptance Scenarios**:

1. **Given** a presenter on the live stream page, **When** they start streaming from their camera, **Then** the server begins ingesting and transcoding the stream, and a "Live" indicator appears within 10 seconds.
2. **Given** an active live stream, **When** a viewer opens the live playback page, **Then** they see the live video playing with no more than 20 seconds of delay (at default 6-second segments).
3. **Given** an active live stream with 6-second segments, **When** the presenter changes the segment size to 1 second via the control panel, **Then** viewers experience reduced latency (under 5 seconds) after the next segment boundary.
4. **Given** a live stream in progress, **When** 10+ viewers connect simultaneously, **Then** all viewers receive the stream without degradation of the source quality.

---

### User Story 3 - Presenter Dashboard with Live Stats (Priority: P3)

While the demo is running (VOD or live), the presenter sees a real-time dashboard showing: number of connected viewers, each viewer's current bandwidth and quality level, chunk request rates, and buffer health. When audience members experience quality changes (e.g., covering their phones), the dashboard reflects these changes within seconds. The presenter can also tweak server parameters (segment size) from this dashboard.

**Why this priority**: The dashboard ties the other stories together into an interactive demo experience. It is the primary visual artifact the audience sees on the projector and powers both "wow factor" moments.

**Independent Test**: Open the dashboard, connect 3+ viewer devices, observe that viewer stats appear and update in real time, then throttle one viewer's connection and confirm the dashboard reflects the quality change.

**Acceptance Scenarios**:

1. **Given** the presenter dashboard is open, **When** a new viewer connects to any stream, **Then** the viewer count updates within 1 second and the new viewer appears in the stats list.
2. **Given** multiple viewers watching a stream, **When** one viewer's quality degrades due to bandwidth, **Then** the dashboard shows the quality change for that viewer within 3 seconds.
3. **Given** the dashboard is displaying stats, **When** the presenter changes the HLS segment size via the control panel, **Then** the change takes effect on the next segment boundary and the dashboard confirms the new setting.
4. **Given** 20+ concurrent viewers, **When** viewing the dashboard, **Then** aggregate stats (average bandwidth, quality distribution chart) are readable from across a room without scrolling.

---

### Edge Cases

- What happens when a video upload is interrupted mid-transfer? The system discards the partial upload and allows re-upload.
- What happens when the live stream source disconnects unexpectedly? Viewers see a "Stream ended" message and the dashboard reflects zero active streams.
- What happens when a viewer's connection drops entirely during playback? The player buffers and retries; if reconnection fails within 30 seconds, a "Connection lost" message is shown.
- What happens when transcoding fails for a particular quality level? The system makes remaining quality levels available and logs the failure visibly on the dashboard.
- What happens when the presenter changes segment size during an active live stream? The change applies at the next keyframe boundary; in-progress segments complete at the old size.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept video file uploads in MP4, WebM, or MOV format and store the original file for transcoding. Other formats MUST be rejected with a clear error message. Maximum file size MUST be configurable via environment variable (default: 500 MB); uploads exceeding the limit MUST be rejected with a clear size error.
- **FR-002**: System MUST transcode uploaded videos into at least 3 quality levels (480p, 720p, 1080p) and produce HLS manifests (.m3u8) with corresponding segment files (.ts).
- **FR-003**: System MUST serve HLS manifests and segments to viewers, enabling adaptive bitrate playback.
- **FR-004**: System MUST ingest a live video stream via WebRTC from the presenter's browser camera. No external streaming software (OBS, etc.) is required.
- **FR-005**: System MUST transcode the live ingest stream into multiple quality levels in real time and produce live HLS segments.
- **FR-006**: System MUST provide a browser-based viewer that plays HLS streams with automatic quality switching based on available bandwidth.
- **FR-007**: System MUST provide a presenter dashboard that displays real-time stats: viewer count, per-viewer bandwidth, current quality level, chunk request rates.
- **FR-008**: System MUST allow the presenter to change HLS segment size from the dashboard, with the change taking effect on the next segment boundary.
- **FR-009**: Viewers MUST be able to access the viewer page by scanning a QR code displayed by the presenter.
- **FR-010**: System MUST broadcast real-time events (viewer connections, quality changes, bandwidth measurements) from viewers to the dashboard via WebSockets.
- **FR-011**: System MUST provide a video catalog page listing all available VOD content and any active live streams.
- **FR-012**: System MUST display transcoding progress to the presenter (percentage complete, current stage) for VOD uploads.
- **FR-013**: System MUST expose a `GET /api/health` endpoint returning service status, uptime, and spawned sub-process health (FFmpeg transcoding workers: pid, running/exited, exit code). Docker Compose services MUST define healthcheck directives.
- **FR-014**: All backend services MUST log to stdout in structured format (JSON) with service identifier, timestamp, and correlation ID (video ID or stream session ID) for cross-service log correlation.
- **FR-015**: System MUST provide 4 distinct UI views: (1) Presenter view combining upload, dashboard, and live stream controls; (2) Catalog view listing available VOD and live streams; (3) Player view for VOD and live playback with adaptive bitrate; (4) QR Landing page that directs audience members to the catalog/player.

### Key Entities

- **Video**: Represents an uploaded or live video source. Attributes: title, source type (VOD/live), transcoding status, available quality levels, creation timestamp.
- **Stream Session**: Represents an active live streaming session. Attributes: stream key, ingest URL, status (live/ended), segment configuration, start time.
- **Viewer Session**: Represents a connected viewer. Attributes: session ID, current quality level, measured bandwidth, buffer health, connected stream/video.
- **HLS Manifest**: The master and variant playlist files that map quality levels to segment URLs. Attributes: master URL, variant URLs per quality, segment duration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A presenter can upload a video and have it ready for multi-quality playback within 3 minutes (for a 1-minute source video).
- **SC-002**: 20+ concurrent viewers can watch the same stream with adaptive bitrate without any viewer experiencing a complete playback stall.
- **SC-003**: Quality switches are visible on the presenter dashboard within 3 seconds of occurring on the viewer's device.
- **SC-004**: When the presenter changes segment size during a live stream, the latency difference is observable by viewers within 30 seconds.
- **SC-005**: The entire demo stack (upload, transcode, live stream, dashboard) can be started locally with a single command.
- **SC-006**: A first-time viewer can go from scanning a QR code to watching video in under 10 seconds.
- **SC-007**: The presenter dashboard is readable from 5 meters away on a standard projector.

## Assumptions

- Audience members have smartphones with modern browsers that support HLS playback (via hls.js for non-Safari browsers).
- The demo venue has a local WiFi network that all audience devices can connect to, or the server is accessible via a public URL.
- The presenter has a USB or built-in camera available for the live streaming portion of the demo.
- Video uploads for VOD are short clips (under 5 minutes) to keep transcoding times reasonable for a live demo.
- The server running the demo has enough CPU for real-time transcoding of at least one live stream into 3 quality levels simultaneously.
- No authentication or user accounts are needed; this is an open demo system.
- Pre-recorded fallback content (already transcoded HLS segments) exists so the demo can proceed even if live transcoding fails on stage.
- Uploaded videos and transcoded segments are stored on a persistent Docker volume that survives container restarts. Bucket storage (S3-compatible) is a future consideration but out of scope for now.

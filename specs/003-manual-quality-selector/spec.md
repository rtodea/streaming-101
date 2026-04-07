# Feature Specification: Manual Quality Selector

**Feature Branch**: `003-manual-quality-selector`  
**Created**: 2026-04-07  
**Status**: Draft  
**Input**: User description: "when opening the video player, I see the quality, but I cannot explicitly enforce it through some dropdown. I would want 4 options = 1 auto and the other 3 (1080p, ...) I would love to do the same also for the live playback video"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manual Quality Selection for VOD Playback (Priority: P1)

As a viewer watching an uploaded video, I want to manually select the streaming quality from a dropdown so that I can override the automatic adaptive bitrate selection and lock playback to a specific resolution.

The dropdown appears in the player controls area and offers four options: Auto (default, uses adaptive bitrate), 1080p, 720p, and 480p. When a specific quality is selected, the player switches to that resolution and stays locked until the viewer changes it again or selects Auto.

**Why this priority**: This is the core feature request. VOD playback is the primary use case and the most commonly used player in the demo. It also provides the clearest demonstration of how quality switching works in HLS.

**Independent Test**: Can be fully tested by uploading a video, opening the player, and switching between quality levels in the dropdown. The video resolution visibly changes and the quality indicator updates to reflect the locked level.

**Acceptance Scenarios**:

1. **Given** a viewer opens a VOD player for a transcoded video, **When** the page loads, **Then** the quality dropdown displays "Auto" as the selected option and the player uses adaptive bitrate.
2. **Given** the quality dropdown is visible, **When** the viewer selects "720p", **Then** the player switches to the 720p stream and the quality indicator shows "720p".
3. **Given** the viewer has manually selected "1080p", **When** they switch back to "Auto", **Then** the player resumes adaptive bitrate selection based on network conditions.
4. **Given** the viewer selects a specific quality, **When** the stream plays, **Then** the player remains locked to that quality level and does not automatically switch.

---

### User Story 2 - Manual Quality Selection for Live Playback (Priority: P2)

As a viewer watching a live camera stream, I want the same quality selector dropdown available in the live player so that I can manually choose the streaming quality during a live session.

The behavior is identical to VOD: four options (Auto, 1080p, 720p, 480p), defaults to Auto, and locks to the selected quality when manually chosen.

**Why this priority**: Extends the same capability to live streams. Depends on the same mechanism as VOD but applied to the live playback context. Slightly lower priority because live streams may have fewer segments available initially.

**Independent Test**: Can be tested by starting a live camera stream from the presenter dashboard, opening the live player on a viewer device, and switching quality levels during the live broadcast.

**Acceptance Scenarios**:

1. **Given** a viewer opens a live stream player, **When** the page loads, **Then** the quality dropdown shows "Auto" as selected and the player uses adaptive bitrate.
2. **Given** the live player is active, **When** the viewer selects "480p", **Then** the player switches to the 480p live stream variant.
3. **Given** the viewer has selected a manual quality during a live stream, **When** new segments arrive, **Then** the player continues fetching segments at the locked quality level.

---

### Edge Cases

- What happens when a quality level is not yet available (e.g., transcoding still in progress for 1080p)? The dropdown should show only available quality levels plus Auto.
- What happens when the viewer selects a quality and then the network degrades severely? The player stays at the selected quality (may buffer) rather than auto-downgrading.
- What happens when the live stream has not produced segments for all quality levels yet? Only available levels should appear in the dropdown.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The player MUST display a quality selector dropdown in the controls area for both VOD and live playback.
- **FR-002**: The dropdown MUST offer four options: Auto, 1080p, 720p, and 480p.
- **FR-003**: The default selection MUST be "Auto", which delegates quality decisions to the adaptive bitrate algorithm.
- **FR-004**: When a specific quality (1080p, 720p, or 480p) is selected, the player MUST lock to that quality level and stop automatic switching.
- **FR-005**: When "Auto" is re-selected, the player MUST resume adaptive bitrate behavior.
- **FR-006**: The quality indicator in the player controls MUST reflect the currently active quality level at all times.
- **FR-007**: The dropdown MUST dynamically show only quality levels that are available in the current stream's HLS manifest.
- **FR-008**: The quality selection MUST persist for the duration of the current playback session (no reset on segment boundaries).

### Key Entities

- **Quality Level**: Represents a selectable resolution option (Auto, 1080p, 720p, 480p) mapped to an HLS variant stream index.
- **Player Session**: The active playback context that tracks the viewer's current quality selection state.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Viewers can switch between all available quality levels within 2 seconds of selecting from the dropdown.
- **SC-002**: Quality selection works identically for both VOD and live playback scenarios.
- **SC-003**: The dropdown correctly reflects available quality levels (does not show unavailable options).
- **SC-004**: 100% of quality switches result in the player actually delivering content at the selected resolution.

## Assumptions

- The existing HLS transcoding pipeline already produces three quality variants (1080p, 720p, 480p) for both VOD and live streams.
- The HLS player library (hls.js) supports programmatic quality level locking via its API.
- The quality selector is a client-side only feature; no server-side changes are required.
- The dropdown uses the same visual styling as existing UI elements (CSS custom properties, black-and-white palette).

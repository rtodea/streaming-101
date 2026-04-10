# Feature Specification: Responsive Design for Mobile Devices

**Feature Branch**: `005-responsive-design`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "add some support for responsive design. Make sure the elements are displayed properly on mobile devices too"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Audience Member Watches on Phone (Priority: P1)

As a meetup attendee who scans the QR code on a projector with a phone, I want every page I land on — the QR landing, the catalog, and the video player — to render correctly on a small phone screen so I can actually browse and watch videos without zooming, horizontal scrolling, or cut-off text.

The QR landing page is the first thing an audience member sees after scanning. If that page is broken on their phone, the entire demo falls apart for anyone in the audience. The catalog and player pages must then let the viewer tap a video thumbnail and watch the stream with usable on-screen controls.

**Why this priority**: This is the single highest-impact mobile scenario. The whole purpose of the QR code is to send audience phones to the app — if the audience-facing pages are not mobile-usable, the interactive portion of the demo breaks. Everything else in this feature builds on this.

**Independent Test**: Can be fully tested by loading the QR landing page, `/catalog`, and `/player/<id>` on a real phone (or Chrome DevTools device emulation at 375×667 and 390×844 viewports) and verifying that: (1) no element overflows the viewport, (2) no horizontal scroll appears, (3) text remains readable without manual zoom, and (4) the primary action (tap "View Videos" → tap a video card → play) works end-to-end with touch.

**Acceptance Scenarios**:

1. **Given** an audience member with a phone held in portrait orientation, **When** they open the QR landing page at a 375 px wide viewport, **Then** the title, description, and "View Videos" button fit on screen without horizontal scroll and the button is large enough to tap comfortably.
2. **Given** a viewer on a phone, **When** they open the catalog page, **Then** the video cards stack in a single column instead of a desktop-style three-column grid, and every card remains fully visible within the screen width.
3. **Given** a viewer tapping a video card on a phone, **When** the player page loads, **Then** the video element fills the available horizontal space with the correct aspect ratio, and the player controls (quality selector, bandwidth, buffer) wrap onto multiple lines rather than overflowing off-screen.
4. **Given** a viewer on a phone, **When** they rotate to landscape orientation, **Then** the video player takes advantage of the wider viewport and the catalog grid may show more than one card per row if space permits.

---

### User Story 2 - Presenter Monitors the Dashboard on Tablet or Small Laptop (Priority: P2)

As a presenter giving the meetup talk from a small laptop, tablet, or the side of the room, I want the Presenter dashboard to remain usable on narrower screens (768–1024 px) so I can glance at live stats, upload videos, start the camera, and see the byte inspector without the two-column layout breaking or interactive controls being cut off.

On phones (<768 px) the Presenter page does not need to be beautiful — it is a presenter-only surface — but it MUST remain functional and MUST NOT crash or become unusable.

**Why this priority**: The presenter is the one person who absolutely needs the dashboard during the demo. They may be running it from a borrowed laptop with a smaller display, a 12-inch MacBook, or an iPad held landscape. Secondary to the audience experience, but still critical for the presenter's workflow.

**Independent Test**: Can be fully tested by loading `/presenter` at 1024 px, 820 px (iPad landscape), and 375 px viewports and verifying that: (1) all six sections (Upload, Live Camera, QR, Videos, Byte Inspector, Live Stats) remain accessible, (2) the layout reflows from two columns to one column below 768 px, (3) form controls, buttons, and the byte inspector table do not overflow, and (4) the presenter can still perform every primary action (upload, start stream, change segment duration, delete video).

**Acceptance Scenarios**:

1. **Given** a presenter on an iPad in landscape (1024 px), **When** they open the Presenter dashboard, **Then** the two-column grid layout displays correctly with all sections fully visible.
2. **Given** a presenter on a small laptop at a width of 820 px, **When** they view the dashboard, **Then** the layout either keeps two columns with reduced gutter or collapses to a single column without content being cut off.
3. **Given** a presenter on a phone-sized viewport (375 px), **When** they view the dashboard, **Then** all sections stack vertically in a single column, form controls take the full width, and the byte inspector hex table scrolls horizontally rather than breaking the page layout.
4. **Given** the Presenter dashboard on any viewport width, **When** the presenter interacts with the segment-duration slider or quality selector, **Then** touch and mouse interaction both work without the target being too small to hit.

---

### User Story 3 - Byte Inspector Table Remains Readable on Narrow Screens (Priority: P3)

As anyone viewing the byte inspector on a narrow screen, I want the hex dump table to remain readable — either by scrolling horizontally within its container or by gracefully compacting — rather than blowing out the layout or making the surrounding page scroll sideways.

**Why this priority**: The hex viewer is inherently wide (monospace, many columns). Handling it well on narrow screens is a polish concern, not a showstopper, but important enough to call out because it is the one component most likely to break responsive layouts.

**Independent Test**: Can be fully tested by loading `/presenter` at 375 px, selecting a video in the byte inspector, and verifying that: (1) the hex dump is scrollable horizontally within its container without causing the page body to scroll, (2) the file/segment selector dropdowns wrap or stack, and (3) the prev/next pagination buttons remain tappable and do not overflow.

**Acceptance Scenarios**:

1. **Given** a user on a narrow viewport, **When** they open the byte inspector, **Then** the hex table scrolls horizontally within its bordered container and the page itself does not acquire a horizontal scrollbar.
2. **Given** a user on a narrow viewport with the file/segment selector visible, **When** the two dropdowns cannot fit side by side, **Then** they wrap or stack gracefully rather than overflowing.

---

### Edge Cases

- What happens on extremely narrow viewports (320 px — iPhone SE)? Content must remain readable and usable; body text must not be smaller than mobile readability thresholds (~14 px minimum).
- What happens when a user rotates between portrait and landscape? The layout must reflow without losing state (selected video, player position, scroll position).
- What happens to the live camera preview on a phone? It is not expected to be usable as a capture device on phones (the camera preview may be hidden or downscaled), but the surrounding page MUST NOT crash.
- What happens when a viewer's on-screen keyboard opens on top of the page (e.g., focusing a text input)? Critical controls must remain reachable via scroll.
- What happens to wide tables (byte inspector, stats viewer table) on narrow screens? They must scroll horizontally inside their own container, not expand the page.
- What happens on touch devices with no hover state? Hover styling must not hide critical affordances — focus and active states must carry the same information.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every page in the app MUST render correctly at viewport widths from 320 px up to 1920 px without introducing a horizontal page-level scrollbar.
- **FR-002**: The QR landing page, catalog, and player views MUST be fully usable on a portrait phone viewport (≥ 375 px wide), including navigation from landing → catalog → player with touch interaction.
- **FR-003**: The catalog grid MUST reflow to a single column on phone viewports and to multiple columns on tablet and desktop viewports.
- **FR-004**: The video player and its controls MUST fit within the available width on phone viewports; controls that do not fit on one line MUST wrap onto multiple lines or stack vertically.
- **FR-005**: The Presenter dashboard MUST remain fully functional (not merely readable) on viewports down to 375 px wide — every primary action (upload, start stream, change settings, delete video) MUST remain reachable and operable.
- **FR-006**: The Presenter dashboard two-column layout MUST collapse to a single column at viewports below a defined breakpoint (tablet/phone boundary).
- **FR-007**: Interactive elements (buttons, form controls, video cards) MUST have a minimum touch target size of 44 × 44 CSS pixels on touch devices, per standard mobile accessibility guidelines.
- **FR-008**: Wide content blocks (hex viewer, stats table) MUST scroll horizontally within their own container on narrow viewports rather than expanding the page width.
- **FR-009**: Text MUST remain readable on narrow viewports — body text MUST NOT be smaller than 14 px, and headings MUST scale down proportionally but remain visibly larger than body text.
- **FR-010**: The app MUST include a correct HTML viewport meta tag so mobile browsers render the layout at device width rather than applying a desktop-zoomed scaling.
- **FR-011**: Images, video elements, and QR codes MUST scale to fit their container on narrow viewports without distorting aspect ratios.
- **FR-012**: The design system's responsive breakpoints MUST be defined in one central location so they can be referenced consistently by every view and component.

### Key Entities *(design-time artifacts)*

- **Breakpoint**: A named viewport-width threshold (e.g., mobile, tablet, desktop) at which layout rules change. Each breakpoint is defined once centrally and referenced by views and components rather than hardcoded.
- **Responsive Layout Rule**: A layout behavior tied to a breakpoint — e.g., "catalog grid is one column below the tablet breakpoint, three columns at or above the desktop breakpoint."

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of pages in the app render without any horizontal page scrollbar at viewport widths of 320, 375, 414, 768, 1024, and 1440 px.
- **SC-002**: An audience member using a 375 px wide phone can go from the QR landing page to watching a video in at most 3 taps, with every tap target at least 44 × 44 CSS pixels.
- **SC-003**: The catalog page shows exactly one card per row at viewports below 640 px and at least two cards per row at viewports ≥ 768 px.
- **SC-004**: The Presenter dashboard collapses from two columns to one column at or below the 768 px breakpoint, and every section remains fully accessible at 375 px.
- **SC-005**: All interactive controls (buttons, dropdowns, sliders, file inputs) have a minimum tap target of 44 × 44 CSS pixels on any viewport.
- **SC-006**: Body text measures at least 14 px on viewports ≥ 320 px, and headings remain visually distinct from body text at every breakpoint.
- **SC-007**: Wide content (hex viewer, stats table) never introduces a page-level horizontal scrollbar at any viewport width between 320 and 1920 px.
- **SC-008**: The responsive breakpoints are defined once in a single central file and referenced by name rather than hardcoded pixel values in individual components.

## Assumptions

- The smallest supported viewport width is 320 px (iPhone SE / legacy Android). Anything narrower is out of scope.
- The audience-facing pages (QR landing, catalog, player) are the top priority for mobile polish; the Presenter dashboard is secondary and is allowed to be denser at phone widths as long as it remains functional.
- The live camera capture on phones is not required to work as an actual broadcaster — phones are expected to be consumers in this demo. If the camera UI is shown at all on phones, it may be hidden or disabled gracefully.
- The existing design tokens, typography scale, and button/form-control classes from feature 004 are already in place and will be reused. This feature adds breakpoint tokens and responsive rules on top of them.
- Touch targets follow WCAG 2.1 AA guidance (44 × 44 CSS pixels).
- Dark mode, landscape-only mode, and extremely narrow wearable viewports (< 320 px) are out of scope.
- Network conditions remain unchanged — this is a layout/presentation feature, not a bandwidth-adaptation feature (adaptive bitrate already exists).
- The responsive work will not alter any streaming, WebSocket, or backend behavior — pipeline correctness is untouched.
- This feature is branched from `004-typography-design-system` (not yet merged to master) because it builds directly on the design tokens and `.btn` / `.form-control` classes introduced there.

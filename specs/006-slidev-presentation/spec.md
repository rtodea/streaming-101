# Feature Specification: Slidev Presentation Slides

**Feature Branch**: `006-slidev-presentation`  
**Created**: 2026-04-13  
**Status**: Draft  
**Input**: User description: "Create presentation slides using Slidev with progressive MermaidJS diagram reveals, served at /slides as part of the main app, with a README teaching slide authoring"

## Clarifications

### Session 2026-04-13

- Q: What image should the opening slide display on the left (50%)? → A: A streaming/video-themed placeholder image (e.g., play button, waveform), easily replaceable by the presenter with their own image later.
- Q: Should the deck include distinct "demo break" transition slides? → A: Yes — visually distinct slides appear at natural transition points to remind the presenter to switch to the live application for demos.
- Q: Should the slides match the app's existing visual style or use a different theme? → A: Monochrome, matching the existing app design system (black/white, Inter + JetBrains Mono fonts).
- Q: Should fonts be easily changeable? → A: Yes — typography is important to the presenter; fonts must be centralized so they can be swapped later without editing individual slides.
- Q: What reusable slide layouts are needed beyond standard content? → A: Pros/cons (numbered items with click-reveal), URL reference, "Choose your next adventure" (further reading links), quote, and full-screen image (for website screenshots).


## User Scenarios & Testing

### User Story 1 - Present Slides During the Meetup (Priority: P1)

The presenter navigates to `/slides` on the main application and delivers a 30-minute "Streaming 101" talk at the timjs JavaScript meetup. The slides cover the core narrative: what a pixel/frame/video is (raw bytes math), why compression exists, how HLS adaptive bitrate streaming works (VOD + live), and the "wow factor" live audience demos. The presenter advances through slides using keyboard or click navigation.

**Why this priority**: Without the slides themselves, the entire presentation cannot happen. This is the core deliverable.

**Independent Test**: Can be fully tested by navigating to `/slides` in a browser and advancing through the entire deck, verifying all slides render correctly and navigation works.

**Acceptance Scenarios**:

1. **Given** the application is running, **When** the presenter visits `/slides`, **Then** the slide deck loads and displays the first slide.
2. **Given** a slide is displayed, **When** the presenter presses the right arrow or clicks, **Then** the next slide or next reveal step is shown.
3. **Given** the deck is loaded, **When** the presenter presses a keyboard shortcut for overview mode, **Then** a grid/overview of all slides is shown for quick navigation.
4. **Given** the full deck, **When** the presenter advances from the first slide to the last, **Then** all slides render correctly including text, tables, code blocks, and diagrams.
5. **Given** the opening slide is displayed, **When** the presenter views it, **Then** the left half shows a placeholder image and the right half shows the talk title and subtitle.
6. **Given** the presenter reaches a section that requires a live demo, **When** that transition slide appears, **Then** it is visually distinct and reminds the presenter to switch to the application.
7. **Given** a pros/cons slide with 4 items per column, **When** the presenter presses NEXT repeatedly, **Then** each numbered item appears one at a time.
8. **Given** a full-screen image slide, **When** the presenter views it, **Then** the screenshot fills the entire slide with no visible padding or UI chrome.

---

### User Story 2 - Step Through MermaidJS Diagrams Progressively (Priority: P1)

When the presenter reaches a slide containing a MermaidJS sequence diagram (e.g., the VOD pipeline, the ABR viewer flow, the live streaming pipeline), each interaction/arrow in the diagram is revealed one at a time on successive NEXT (click/keypress) events. This allows the presenter to narrate each step as it appears, rather than showing the entire diagram at once.

**Why this priority**: This is explicitly marked as a MUST feature by the user. Progressive diagram reveals are essential for the teaching narrative — the presenter needs to walk the audience through complex flows step by step.

**Independent Test**: Can be tested by navigating to any MermaidJS diagram slide and pressing NEXT repeatedly, verifying that each press reveals exactly one new interaction/element until the diagram is complete.

**Acceptance Scenarios**:

1. **Given** a slide with a MermaidJS sequence diagram containing 5 interactions, **When** the presenter presses NEXT, **Then** only the first interaction (arrow + label) is visible.
2. **Given** a partially revealed sequence diagram with 2 of 5 interactions shown, **When** the presenter presses NEXT, **Then** the third interaction appears while the first two remain visible.
3. **Given** a fully revealed diagram (all interactions shown), **When** the presenter presses NEXT, **Then** the presentation advances to the next slide.
4. **Given** a partially revealed diagram, **When** the presenter presses PREVIOUS, **Then** the last revealed interaction is hidden (one step back).
5. **Given** a slide with a MermaidJS graph/flowchart diagram, **When** the presenter presses NEXT, **Then** nodes and edges are revealed progressively in a logical order.

---

### User Story 3 - Serve Slides Integrated in the Main App (Priority: P2)

The built slide deck is accessible at the `/slides` path of the running application, without requiring a separate development server. This means during the live meetup demo, the presenter can switch between the streaming demo app (presenter dashboard, viewer catalog) and the slides seamlessly from the same origin.

**Why this priority**: Integration avoids the need to run a separate Slidev dev server during the talk and provides a polished, unified experience.

**Independent Test**: Can be tested by running the main application and verifying that `/slides` serves the built slide deck while `/presenter`, `/catalog`, and other routes continue working.

**Acceptance Scenarios**:

1. **Given** the main application is running, **When** the presenter visits `/slides`, **Then** the pre-built slide deck is served.
2. **Given** the slides are served at `/slides`, **When** the presenter visits `/presenter`, **Then** the presenter dashboard loads normally (no route conflicts).
3. **Given** the slides are built, **When** the main application starts, **Then** no additional process or server is required for the slides.

---

### User Story 4 - Author and Update Slides Easily (Priority: P2)

The presenter can create new slides or edit existing ones by writing Markdown files in the `slides/slidev` folder. A README explains how to use Slidev: how to add slides, use layouts, embed MermaidJS diagrams, configure progressive reveals, run the dev server for previewing, and build for production.

**Why this priority**: The user explicitly asked to "extend further on" the initial slide basis, so clear documentation is essential for ongoing authoring.

**Independent Test**: Can be tested by following the README instructions to add a new slide, preview it in the Slidev dev server, and verify it appears correctly.

**Acceptance Scenarios**:

1. **Given** the README exists in `slides/slidev/`, **When** the presenter reads it, **Then** they understand how to add a new slide, edit an existing one, and preview changes.
2. **Given** the README instructions, **When** the presenter runs the development server command, **Then** the slides render in a browser with hot-reload on file changes.
3. **Given** the README instructions, **When** the presenter runs the build command, **Then** a static version of the slides is generated that can be served by the main app.
4. **Given** the README instructions, **When** the presenter wants to change fonts, **Then** the README explains where to update the single font configuration and all slides reflect the change.

---

### Edge Cases

- What happens when a MermaidJS diagram has syntax errors? The slide should display a clear error message rather than a blank area.
- What happens when the presenter navigates backward past the first reveal step of a diagram? The presentation should go to the previous slide.
- What happens when the slides are not yet built and the presenter visits `/slides`? A helpful fallback message or 404 should be shown, not a server crash.
- What happens on a narrow/mobile screen? The slides should be viewable but are optimized for a projector/large screen (the primary use case).

## Requirements

### Functional Requirements

- **FR-001**: The system MUST serve a presentation slide deck at the `/slides` path of the main application.
- **FR-002**: The slides MUST cover the core "Streaming 101" narrative: pixels and raw video math, compression and codecs, HLS adaptive bitrate streaming (VOD pipeline), live streaming pipeline, and audience interaction demos.
- **FR-003**: MermaidJS sequence diagrams MUST support progressive reveal — each interaction/arrow revealed on successive NEXT events.
- **FR-004**: MermaidJS graph/flowchart diagrams MUST support progressive reveal — nodes and edges revealed in logical order on successive NEXT events.
- **FR-005**: The presenter MUST be able to navigate forward and backward through reveal steps and slides using keyboard and mouse/click.
- **FR-006**: A README MUST be provided in the slides folder explaining how to author new slides, embed diagrams, configure progressive reveals, run the dev server, and build for production.
- **FR-007**: The slide deck MUST be buildable into static assets that the main application can serve without a separate running process.
- **FR-008**: The initial slide deck MUST provide a foundation/skeleton of approximately 15-25 slides covering the key presentation topics, which the presenter can extend.
- **FR-009**: The slides MUST render correctly on a projector-resolution display (1024x768 and above).
- **FR-010**: The opening slide MUST use a two-column layout with a placeholder image on the left (50% width) and the talk title and subtitle on the right. The image MUST be easily replaceable by swapping a single file.
- **FR-011**: The deck MUST include visually distinct "demo break" transition slides at natural section boundaries, reminding the presenter to switch to the live application for demos.
- **FR-012**: The slide deck MUST use a monochrome visual style consistent with the existing application design system (black/white palette, Inter for body text, JetBrains Mono for code).
- **FR-013**: Typography (font families, sizes, weights) MUST be centralized in a single configuration so the presenter can change fonts later without editing individual slides.
- **FR-014**: The deck MUST include a reusable "pros/cons" slide layout with two columns of numbered items that appear progressively on successive NEXT events.
- **FR-015**: The deck MUST include a "URL reference" slide layout for displaying documentation links with titles and brief descriptions.
- **FR-016**: The deck MUST include a "Choose your next adventure" slide layout for listing adjacent topics and resources the audience can explore after the talk.
- **FR-017**: The deck MUST include a "quote" slide layout for displaying a quotation with attribution, styled distinctively from regular content.
- **FR-018**: The deck MUST include a "full-screen image" slide layout that fills the entire slide area with a single image (intended for website screenshots), with no visible chrome or padding.

### Key Entities

- **Slide Deck**: The complete presentation, composed of ordered slides written in Markdown.
- **Slide**: A single screen of the presentation, potentially containing text, code blocks, tables, images, or diagrams.
- **MermaidJS Diagram**: An embedded diagram (sequence, flowchart, or graph) within a slide that supports progressive step-through.
- **Reveal Step**: A single incremental reveal within a slide — either a bullet point, a diagram interaction, or a content fragment made visible on a NEXT event.
- **Demo Break Slide**: A visually distinct transition slide that signals the presenter to switch from the slide deck to the running application for a live demo.
- **Pros/Cons Slide**: A two-column layout with numbered items that appear progressively on NEXT events.
- **URL Reference Slide**: A layout for displaying documentation links with titles and descriptions.
- **Adventure Slide**: A "Choose your next adventure" layout listing adjacent topics and resources for further exploration.
- **Quote Slide**: A layout for displaying a quotation with attribution, styled distinctively.
- **Full-Screen Image Slide**: A layout that fills the entire slide with a single image (no padding or chrome).

## Success Criteria

### Measurable Outcomes

- **SC-001**: The presenter can deliver the full 30-minute talk navigating only through the `/slides` route, without switching to any external tool for slides.
- **SC-002**: Every MermaidJS sequence diagram with N interactions requires exactly N NEXT presses to fully reveal, with each press showing exactly one new interaction.
- **SC-003**: The initial slide deck contains at least 15 slides covering all major presentation topics (pixels, compression, HLS, VOD, live, audience demos).
- **SC-004**: A new contributor can add a new slide by following the README in under 5 minutes.
- **SC-005**: The built slides load at `/slides` within 3 seconds on a standard connection.

## Assumptions

- The presenter will use a laptop connected to a projector, navigating with keyboard arrows or a presentation clicker (which sends arrow key events).
- The Slidev development server is used only during authoring; the live presentation uses pre-built static assets.
- The existing MermaidJS diagrams from `notes/architecture.md` will be adapted into the slide deck as the basis for progressive reveal demos.
- The slides are a standalone sub-project within the repository (own `package.json` in `slides/slidev/`), not tightly coupled to the React client build pipeline.
- The main application's server can serve the built slide assets as static files at the `/slides` path, similar to how it already serves the client SPA.

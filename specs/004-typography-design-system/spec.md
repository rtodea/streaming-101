# Feature Specification: Typography and Design System Refinement

**Feature Branch**: `004-typography-design-system`  
**Created**: 2026-04-10  
**Status**: Draft  
**Input**: User description: "can we use better typography!? Pick some open source font families. I know we can make things look better. I want someting clean and professional (black and white). Also touch a little the buttons. A design system like experience."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Clean Professional Typography Across All Pages (Priority: P1)

As a meetup attendee or presenter viewing the Streaming 101 app on a projector or phone, I want the interface to use clean, professional open-source typefaces with a clear hierarchy so that every page — Presenter, Player, Catalog — feels cohesive, readable, and visually polished instead of relying on default system fonts.

Headings, body text, labels, stats, and monospace content (hex viewer, code-like output) should each use the appropriate type from a small, deliberately chosen set of fonts. Font sizes, weights, and line-heights should follow a consistent scale defined in one central place.

**Why this priority**: Typography is the single highest-impact visual change for a demo that will be shown on a projector. It affects every page in the app at once and establishes the "design system" foundation that buttons and other components plug into.

**Independent Test**: Can be fully tested by loading any page in the app and verifying that: (1) headings, body text, and monospace content visibly use the new typefaces instead of system defaults, (2) the type hierarchy (h1 > h2 > body > small) is visually distinct, and (3) the appearance is consistent across Presenter, Player, and Catalog pages.

**Acceptance Scenarios**:

1. **Given** a viewer opens any page in the app, **When** the page loads, **Then** all text renders in the chosen professional typeface(s) rather than the browser's default system font.
2. **Given** a page contains headings, body text, and hex/byte content, **When** the user reads the page, **Then** each content type uses the appropriate typeface (sans-serif for UI, monospace for hex content) with a clear visual hierarchy.
3. **Given** the app is viewed on a projector at normal meetup-room distance, **When** the audience looks at headings and stat values, **Then** they can read them from the back of the room without squinting.
4. **Given** the type scale is defined once centrally, **When** a designer wants to adjust sizes or weights, **Then** the change can be made in a single location and propagates everywhere.

---

### User Story 2 - Polished Button and Form Control Styling (Priority: P2)

As a user interacting with the Presenter dashboard (upload, start camera, delete video, change segment duration) or the Player (quality selector), I want buttons and form controls to feel like part of a deliberate design system — consistent padding, hover and focus states, clear affordances — rather than looking like unstyled HTML defaults.

Primary actions (Upload, Start Camera) should look distinctly different from secondary actions (Delete, Stop) and from form controls (dropdowns, sliders). Every interactive element should provide clear hover and focus feedback.

**Why this priority**: Buttons are the second-most visible interactive element after text. Polishing them turns a "developer prototype" feel into a "ready to show an audience" feel. Builds on the typography foundation from US1.

**Independent Test**: Can be fully tested by clicking through the Presenter dashboard and Player controls and verifying that: (1) all buttons share consistent sizing and spacing, (2) primary and secondary button styles are visually distinct, (3) hover and focus states respond to mouse/keyboard interaction, and (4) form controls (select, slider, file input) match the visual language of the buttons.

**Acceptance Scenarios**:

1. **Given** a user hovers over any button, **When** the mouse enters the button area, **Then** the button shows a clear visual hover state (color, border, or background change).
2. **Given** a user tabs through the Presenter dashboard with the keyboard, **When** a button or form control receives focus, **Then** it shows a clear focus outline that meets accessibility contrast requirements.
3. **Given** the Presenter dashboard has both primary actions (Upload, Start Camera) and destructive actions (Delete), **When** the user looks at them, **Then** they can immediately tell which is which from the visual style.
4. **Given** the quality selector dropdown in the Player, **When** a viewer interacts with it, **Then** it matches the visual language of buttons elsewhere in the app rather than looking like an unstyled HTML dropdown.

---

### User Story 3 - Central Design Tokens Reference (Priority: P3)

As a developer or coding agent working on the app, I want a single source of truth for the design system — fonts, type scale, colors, spacing, border radii, shadows, button variants — so that adding a new component or tweaking the look is a matter of reading one file rather than hunting through component styles.

**Why this priority**: Infrastructure for maintainability. Not strictly needed for the demo to look good, but makes future changes (e.g., swapping a font, adjusting spacing) trivial.

**Independent Test**: Can be tested by inspecting the centralized design-tokens file and verifying that every visual property used in the app (font families, sizes, weights, colors, spacing, radii, button styles) is defined there and referenced by components rather than hardcoded.

**Acceptance Scenarios**:

1. **Given** a developer wants to change the primary font, **When** they update the font family token in one central location, **Then** the change applies to every page without editing individual component files.
2. **Given** a new component is added to the app, **When** the component author references design tokens, **Then** the component automatically matches the rest of the app's look and feel.

---

### Edge Cases

- What happens when a user is offline or the font files fail to load? The app should fall back to well-chosen system font stacks (system-ui sans-serif, monospace) so text remains readable.
- What happens on very small phone screens? The type scale should remain readable without horizontal scroll — body text should not be smaller than standard mobile readability thresholds.
- What happens with users who have "prefers-reduced-motion" set? Hover and focus transitions should respect the preference and skip animations.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The app MUST use at most two open-source typefaces — one sans-serif family for UI and body text, one monospace family for hex/code content.
- **FR-002**: The chosen typefaces MUST be self-hosted (bundled with the app) so the demo works on a local network without internet access.
- **FR-003**: The app MUST define a type scale with at least five distinct sizes (xs, sm, base, lg, xl) and at least three weights (regular, medium, bold) centralized in one location.
- **FR-004**: Every page (Presenter, Player, Catalog, Viewer) MUST use the typefaces and type scale consistently — no page should fall back to browser default fonts.
- **FR-005**: Monospace content (hex viewer, JSON preview, code-like display) MUST use the chosen monospace typeface, not the generic system monospace.
- **FR-006**: Buttons MUST have at least two distinct visual variants — a primary style for main actions and a secondary/destructive style for alternate or destructive actions.
- **FR-007**: All interactive elements (buttons, selects, sliders, file inputs) MUST provide visible hover and keyboard-focus states with sufficient contrast.
- **FR-008**: The visual language MUST remain strictly black-and-white with typography-first hierarchy — color may be used sparingly only for semantic meaning (error, success, live indicator).
- **FR-009**: Design tokens (fonts, sizes, weights, spacing, radii, colors, button styles) MUST be defined in a single central location that all components reference.
- **FR-010**: If the bundled font files fail to load, the app MUST fall back gracefully to a well-defined system font stack without layout shift or unreadable text.

### Key Entities *(include if feature involves data)*

- **Design Token**: A named visual property (font family, size, weight, color, spacing, radius, shadow) with a single canonical value, referenced by components instead of hardcoded values.
- **Button Variant**: A named style preset (primary, secondary, destructive, ghost) that applies a consistent combination of colors, borders, padding, and hover/focus states.
- **Type Style**: A named combination of font family, size, weight, and line-height used for a specific content role (heading, body, label, caption, mono).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of visible text in the app renders in the chosen typefaces on first load (no flashes of system default fonts longer than 200ms).
- **SC-002**: Headings on the Presenter dashboard are readable from 10 meters away on a standard 1080p projector.
- **SC-003**: All buttons in the app share consistent height, padding, and border-radius — zero variance across the interface.
- **SC-004**: Every interactive element responds to hover and focus within 100ms with a visible state change.
- **SC-005**: A developer can change the primary font family in a single file and see the change applied across every page without touching any component file.
- **SC-006**: The type scale defines at least 5 sizes and 3 weights, each referenced by name rather than hardcoded numeric values in components.
- **SC-007**: The app remains fully readable and usable if the bundled font files fail to load (graceful fallback to system fonts).

## Assumptions

- Chosen typefaces will be industry-standard open-source fonts commonly used for professional interfaces (e.g., Inter, IBM Plex, JetBrains Mono, Geist, Space Grotesk, or similar). The exact picks will be decided during planning.
- Font files will be bundled and served from the app itself rather than loaded from a CDN or Google Fonts, to honor the constitution's "no external service dependencies" rule.
- The existing CSS custom properties pattern will be extended rather than replaced — current variables for colors, spacing, and sizes stay, but are augmented with font and button tokens.
- The black-and-white palette stays the same; only typography, buttons, and spacing/radii refinements are in scope.
- No framework change — this is a styling refresh, not a migration to Tailwind, CSS-in-JS libraries, or design-system frameworks.
- Dark mode is out of scope for this iteration; the app remains single-theme.

# Phase 1: Data Model — Responsive Design

**Feature**: 005-responsive-design
**Date**: 2026-04-10

This feature has no runtime data model (it is pure CSS/layout). The
"entities" in the spec are design-time artifacts: breakpoint tokens and
responsive layout rules. They are documented here as a contract that
views and components consume.

---

## Entity 1: Breakpoint Token

A named viewport-width threshold at which layout rules change. Defined
exactly once in `client/src/styles/variables.css` under the `:root`
selector and referenced by name (not by raw pixel value) anywhere the
token is consumed outside of `@media` query conditions.

**Fields**:

| Field | Type | Notes |
|-------|------|-------|
| Token name | CSS custom property identifier | Must match `^--bp-[a-z]+$` |
| Minimum viewport width | CSS length (px) | Inclusive lower bound |
| Label | string | Human-readable name (e.g., "tablet portrait") |

**Instances** (the complete set):

| Token | Value | Label | Primary use |
|-------|-------|-------|-------------|
| `--bp-sm` | `640px` | Large phone / small tablet | Catalog grid 1 → 2 columns |
| `--bp-md` | `768px` | Tablet portrait | Presenter dashboard 1 → 2 columns; touch-size boundary |
| `--bp-lg` | `1024px` | Tablet landscape / small laptop | Catalog grid 2 → 3 columns |
| `--bp-xl` | `1280px` | Desktop | Reserved for future max-width tuning; currently unused in media queries |

**Validation rules**:
- Tokens are **mobile-first**: each breakpoint is used with
  `@media (min-width: ...)`, never `max-width`, unless a single specific
  rule cannot be expressed mobile-first.
- The raw pixel values are duplicated into `@media` query conditions
  inside `layout.css` and any component-local `<style>` blocks. Every
  file that duplicates a value **MUST** include a comment header
  pointing back to `variables.css`.
- No component-local `@media` query may use a breakpoint value other
  than one of the four defined here. New breakpoints require updating
  this data model and `variables.css` first.

**State transitions**: N/A — static tokens.

---

## Entity 2: Responsive Layout Rule

A single layout behavior scoped to a named breakpoint. Each rule is
documented below with its token binding, the element(s) it targets, and
the observable effect at each viewport band.

### Rule 2.1 — Catalog Grid Reflow

**Target**: `.grid-3` (used by `CatalogList.jsx`)
**Token**: `--bp-sm` (640 px), `--bp-lg` (1024 px)

| Viewport | Columns | Rationale |
|----------|---------|-----------|
| 0 – 639 px | 1 | Phone: one card fills the screen (SC-003) |
| 640 – 1023 px | 2 | Phone landscape / tablet portrait |
| 1024 px and up | 3 | Tablet landscape / desktop |

**Owner file**: `client/src/styles/layout.css`

---

### Rule 2.2 — Presenter Dashboard Reflow

**Target**: `.grid-2` (used by `Presenter.jsx`)
**Token**: `--bp-md` (768 px)

| Viewport | Columns | Rationale |
|----------|---------|-----------|
| 0 – 767 px | 1 | Phone / narrow — all 6 sections stack (SC-004) |
| 768 px and up | 2 | Tablet portrait and wider — two-column dashboard |

**Owner file**: `client/src/styles/layout.css`

---

### Rule 2.3 — Container Padding

**Target**: `.container`
**Token**: `--bp-md` (768 px)

| Viewport | Horizontal padding |
|----------|-------------------|
| 0 – 767 px | `var(--space-md)` (1 rem) |
| 768 px and up | `var(--space-lg)` (1.5 rem) |

**Owner file**: `client/src/styles/layout.css`

---

### Rule 2.4 — Flex Row Wrapping

**Target**: `.row`
**Token**: `--bp-md` (768 px)

| Viewport | `flex-wrap` |
|----------|-------------|
| 0 – 767 px | `wrap` |
| 768 px and up | `nowrap` (default) |

Allows controls that were designed in a single row (e.g., player
controls, byte-inspector selectors) to break onto multiple lines on
phones without any component-level code changes.

**Owner file**: `client/src/styles/layout.css`

---

### Rule 2.5 — Touch Target Sizing

**Target**: `.btn`, `.form-control`
**Token**: Not a breakpoint — uses `@media (pointer: coarse)`

| Pointer type | Minimum size |
|--------------|--------------|
| Coarse (touch) | `min-height: 44px; min-width: 44px` |
| Fine (mouse) | (unchanged) |

**Owner file**: `client/src/styles/buttons.css`

**Exception**: `.btn--icon` explicitly overrides this rule — icon
buttons remain 28×28 even on touch — because they are only used inside
larger interactive parents (hex-viewer nav bar, video-card delete
overlay) where the tap target is the parent, not the icon itself. This
exception is documented inline in `buttons.css`.

---

### Rule 2.6 — Fluid Display Typography

**Target**: QR landing heading, stat gauges
**Token**: N/A (pure `clamp()` — no breakpoint needed)

| Token | Value |
|-------|-------|
| `--font-size-2xl-fluid` | `clamp(1.75rem, 5vw, 2.5rem)` |
| `--font-size-hero-fluid` | `clamp(2.5rem, 10vw, 4rem)` |

**Consumers**:
- `QRLanding.jsx` — landing page title uses `--font-size-2xl-fluid`
- `StatGauge.jsx` — gauge values use `--font-size-hero-fluid`

**Owner file**: `client/src/styles/variables.css` (token definitions),
consumer files reference via `var(--font-size-*-fluid)`.

---

### Rule 2.7 — Wide-Content Horizontal Scroll

**Target**: `.hex-viewer__table-wrap`, stats table wrapper in
`StatsPanel.jsx`
**Token**: N/A (applies at all viewports)

**Behavior**: The wrapper has `max-width: 100%` and
`overflow-x: auto`. On iOS, `-webkit-overflow-scrolling: touch` enables
momentum scrolling.

**Owner files**: `client/src/components/HexViewer.jsx` (inline
`<style>` block), `client/src/containers/StatsPanel.jsx` (inline
`<style>` block).

---

### Rule 2.8 — Player Controls Wrapping

**Target**: `PlayerControls.jsx` control row
**Token**: N/A (uses `flex-wrap: wrap` unconditionally)

Controls (quality select, bandwidth badge, buffer badge) wrap onto
multiple lines when the viewport cannot accommodate them on a single
row. The breakpoint at which this happens is determined naturally by
the content width, not a fixed media query.

**Owner file**: `client/src/components/PlayerControls.jsx`

---

## Cross-Reference Matrix

| Functional Requirement | Rules that satisfy it |
|------------------------|----------------------|
| FR-001 no horizontal page scroll | 2.3, 2.7 |
| FR-002 audience-facing usable at 375 px | 2.1, 2.6, 2.8 |
| FR-003 catalog single column on phone | 2.1 |
| FR-004 player controls wrap on phone | 2.4, 2.8 |
| FR-005 presenter functional at 375 px | 2.2, 2.4, 2.5 |
| FR-006 presenter two columns collapse at tablet boundary | 2.2 |
| FR-007 44×44 touch targets | 2.5 |
| FR-008 wide content horizontal scroll inside container | 2.7 |
| FR-009 text readability | 2.6 (display sizes only — body already compliant) |
| FR-010 viewport meta tag | existing `client/index.html:5` (verify-only task) |
| FR-011 images/video scale to container | 2.1 (grid) + existing `width: 100%` on media |
| FR-012 central breakpoint tokens | Entity 1 |

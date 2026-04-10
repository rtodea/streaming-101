# Implementation Plan: Responsive Design for Mobile Devices

**Branch**: `005-responsive-design` | **Date**: 2026-04-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-responsive-design/spec.md`

## Summary

Make every page of the Streaming 101 SPA — QR landing, catalog, player, and
presenter dashboard — render correctly and remain fully operable at viewport
widths from 320 px up to 1920 px. Audience-facing pages (QR/catalog/player) are
the top polish priority; the presenter dashboard MUST remain functional at all
widths but is allowed to be denser on phones.

**Technical approach**: Extend the existing CSS custom-property design system
(feature 004) with a central set of breakpoint tokens defined in
`client/src/styles/variables.css`, and consolidate all responsive layout rules
in `layout.css`, plus scoped media queries inside the `<style>` blocks of the
few components that ship their own CSS (`VideoCard`, `HexViewer`,
`StatsPanel`). No new dependencies. No new components. No JavaScript changes
beyond adding `className` hooks to page roots where necessary. The viewport
meta tag is already present in `client/index.html:5`.

## Technical Context

**Language/Version**: JavaScript (ES2024), CSS3 (custom properties, media queries, flex, grid)
**Primary Dependencies**: React 19, Vite 6, React Router v7, hls.js, react-qr-code — all already installed. No new packages.
**Storage**: N/A — layout feature only
**Testing**: Manual viewport testing in Chrome DevTools device emulation at 320/375/414/768/1024/1440 px, plus smoke tests on a real phone via the QR code
**Target Platform**: Modern evergreen browsers (Chrome, Safari, Firefox) on desktop, iOS Safari 15+, Android Chrome 100+
**Project Type**: Web SPA (client only — backend untouched)
**Performance Goals**: No regression in build size — CSS gzipped < 8 KB (currently 5.88 KB). No runtime JS cost (pure CSS feature).
**Constraints**:
  - No page-level horizontal scrollbar at any width between 320 and 1920 px
  - 44×44 CSS pixel minimum touch targets (WCAG 2.1 AA)
  - Body text ≥ 14 px on all viewports
  - Breakpoint values MUST be defined once in `variables.css` as CSS custom properties and referenced by name — no hardcoded px values in component media queries
**Scale/Scope**: 4 route views (QRLanding, Catalog, Player, Presenter), 3 wide components (VideoCard grid, HexViewer, StatsPanel table), ~7 files touched.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Demo-First | ✅ PASS | Responsive layout is directly demonstrable: scan the QR code on a phone and watch the catalog/player work. |
| II. Streaming Correctness | ✅ PASS | No pipeline changes. HLS / WebRTC / FFmpeg untouched. |
| III. Audience Interactivity | ✅ PASS | This feature is *exactly* what audience interactivity requires — the QR landing and catalog/player MUST work on the audience's phones or interactivity collapses. |
| IV. Simplicity & Time Budget | ✅ PASS | Zero new dependencies, no new components, ~7 files modified. Explainable in under 2 minutes: "we added breakpoint tokens and a few media queries." |
| V. Observability & Live Stats | ✅ PASS | Stats panel remains readable; the stats table gets horizontal scroll on narrow screens rather than breaking layout. No metric is lost on phones. |
| VI. Lean & Clean Code | ✅ PASS | Pure CSS changes. No class hierarchies, no new abstractions. Each media query block is short and readable. |
| VII. Container-Per-Service | ✅ PASS | No container or compose changes. |
| VIII. Decision Documentation | ✅ PASS | Breakpoint choice will be documented in `notes/design-system.md` (extend the existing file, not a new one) and in `research.md`. |
| IX. Component-Driven UI & Typography | ✅ PASS | Smart/dumb split untouched. Breakpoints are added as CSS custom properties in the central `variables.css` file — consistent with the Principle IX rule that all tokens live in one root file. |
| X. Debuggability & Hybrid Dev Mode | ✅ PASS | Layout-only feature; debugging flow unchanged. Chrome DevTools device emulation is the primary test surface. |

**Result**: PASS — no violations, no complexity-tracking entries needed.

## Project Structure

### Documentation (this feature)

```text
specs/005-responsive-design/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output (breakpoint choice rationale)
├── data-model.md        # Phase 1 output (breakpoint tokens, layout rules)
├── quickstart.md        # Phase 1 output (how to verify on phone + DevTools)
├── contracts/
│   └── breakpoints.md   # Phase 1 output (token contract consumed by views)
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

This feature touches only the `client/` subtree. No server changes.

```text
client/
├── index.html                              # viewport meta tag (already correct — verify only)
├── src/
│   ├── styles/
│   │   ├── variables.css                   # ← ADD breakpoint tokens (--bp-sm/md/lg/xl)
│   │   ├── layout.css                      # ← EXPAND: multi-step media queries for .grid-2/.grid-3/.container/.page
│   │   ├── reset.css                       # ← no change
│   │   └── buttons.css                     # ← VERIFY .btn min-height ≥ 44 px on touch; add touch-sizing query if needed
│   ├── views/
│   │   ├── QRLanding.jsx                   # ← TWEAK inline styles so title/button scale on narrow screens
│   │   ├── Catalog.jsx                     # ← no change (inherits from layout.css / VideoCard)
│   │   ├── Player.jsx                      # ← TWEAK header row flex-wrap so title + indicator stack on phone
│   │   └── Presenter.jsx                   # ← no structural change (inherits .grid-2 reflow from layout.css)
│   ├── components/
│   │   ├── VideoCard.jsx                   # ← no change (grid handled by parent)
│   │   ├── HexViewer.jsx                   # ← VERIFY .hex-viewer__header wraps on narrow; already has overflow-x on table
│   │   ├── PlayerControls.jsx              # ← ADD flex-wrap so controls stack on phone
│   │   └── StreamIndicator/StatBar/StatGauge/QRDisplay.jsx   # ← no change
│   └── containers/
│       ├── StatsPanel.jsx                  # ← stats table already has overflowX:auto; verify touch target on controls
│       ├── ByteInspector.jsx               # ← VERIFY selectors wrap on narrow; row already has flexWrap
│       ├── VideoUploader.jsx               # ← no change
│       ├── LiveCamera.jsx                  # ← TWEAK video preview width on phone (max-width: 100%)
│       ├── HlsPlayer.jsx                   # ← video already uses width: 100%, no change
│       └── CatalogList.jsx                 # ← no change
└── notes/design-system.md                  # ← APPEND: "Breakpoints" section
```

**Structure Decision**: Frontend-only modification inside the existing
`client/src/` tree. No new directories. Breakpoint tokens live alongside the
existing design tokens in `variables.css` per Principle IX. All cross-cutting
layout rules land in `layout.css`. Component-local media queries only exist
where a component ships its own `<style>` block (HexViewer, PlayerControls,
VideoCard, StatsPanel) and they reference the tokens via `var(--bp-*)` — note
that CSS `@media` queries cannot actually interpolate custom properties, so
the "single source of truth" is enforced by discipline + a comment header in
each file pointing back to `variables.css`. This limitation is called out in
`research.md`.

## Complexity Tracking

> No constitution violations — section intentionally left empty.

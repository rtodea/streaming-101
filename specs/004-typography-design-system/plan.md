# Implementation Plan: Typography and Design System Refinement

**Branch**: `004-typography-design-system` | **Date**: 2026-04-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-typography-design-system/spec.md`

## Summary

Replace the current system font stack with two self-hosted open-source typefaces — **Inter** (variable font) for UI and body text, and **JetBrains Mono** (variable font) for hex/code content. Extend the existing `variables.css` design tokens with font tokens and a button-variant system, introduce a small `.btn`/`.btn--primary`/`.btn--ghost`/`.btn--danger` class set plus `.form-control` styling for selects/inputs/sliders/file inputs, and apply the variants across the existing JSX files so every interactive element picks up the new look. No new dependencies, no framework changes.

## Technical Context

**Language/Version**: JavaScript (ES2024) for React frontend
**Primary Dependencies**: React 19, Vite 6 (already installed). Font files: Inter v4 (OFL) and JetBrains Mono v2.304 (OFL) — self-hosted WOFF2 variable fonts, no new npm packages.
**Storage**: N/A (static asset files only — fonts shipped in `client/public/fonts/`)
**Testing**: Manual browser testing per constitution
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, mobile), projector at meetup venue
**Project Type**: Web application (SPA frontend only — no server changes)
**Performance Goals**: No FOUT longer than 200ms; variable font WOFF2 ≤ 500 KB total download
**Constraints**: Self-hosted fonts (no Google Fonts / external CDN per Constitution + Presentation Constraints); black-and-white palette preserved; existing CSS custom properties pattern extended, not replaced
**Scale/Scope**: ~15 JSX files touched, 1 new CSS file (`buttons.css`), `variables.css` extended, 2 font files added

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Demo-First | PASS | Immediate high-impact visual polish for the meetup presentation |
| II. Streaming Correctness | N/A | Styling feature, no pipeline changes |
| III. Audience Interactivity | PASS | Better legibility on projector = better audience experience |
| IV. Simplicity & Time Budget | PASS | Extends existing CSS vars pattern; no new tooling. Explainable in ~1 minute |
| V. Observability & Live Stats | N/A | Presentation concern only |
| VI. Lean & Clean Code | PASS | Plain CSS, no CSS-in-JS libraries, no design-system frameworks. Button classes are tiny and readable |
| VII. Container-Per-Service | PASS | No new services. Font files bundled in client container at build time |
| VIII. Decision Documentation | PASS | `notes/design-system.md` will document font choice and button variants with rationale |
| IX. Component-Driven UI & Typography | PASS | This feature directly advances Principle IX — typography-first, black-and-white, CSS custom properties, smart/dumb split preserved |
| X. Debuggability | N/A | No runtime behavior changes |

**Specific Principle IX checks**:
- Typography-first with strong hierarchy: enforced via extended type scale
- Black-and-white default: preserved — only typography/buttons change, palette untouched
- CSS custom properties for theming: extended, not replaced
- No CSS frameworks (Tailwind, Bootstrap): confirmed — plain CSS only
- Offline capability ("no external service dependencies"): self-hosted fonts satisfy this

All gates pass. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/004-typography-design-system/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/
    └── design-tokens.md # Design token contract (central reference)
```

### Source Code (repository root)

```text
client/
├── public/fonts/                          # NEW: self-hosted font files
│   ├── Inter-Variable.woff2               # NEW
│   └── JetBrainsMono-Variable.woff2       # NEW
├── src/
│   ├── styles/
│   │   ├── variables.css                  # MODIFY: add font + button tokens
│   │   ├── reset.css                      # MODIFY: @font-face + fallback stack
│   │   ├── layout.css                     # MODIFY: refined heading scale
│   │   └── buttons.css                    # NEW: .btn, .btn--*, .form-control
│   ├── main.jsx                           # MODIFY: import buttons.css
│   ├── components/                        # MODIFY: HexViewer, PlayerControls,
│   │                                      #   QRDisplay, StatBar, StatGauge,
│   │                                      #   StreamIndicator, VideoCard
│   ├── containers/                        # MODIFY: ByteInspector, CatalogList,
│   │                                      #   HlsPlayer, LiveCamera, StatsPanel,
│   │                                      #   VideoUploader
│   └── views/                             # MODIFY: Catalog, Player, Presenter,
│                                          #   QRLanding
notes/
└── design-system.md                       # NEW: font choice + button variants rationale
```

**Structure Decision**: Extends the existing 3-file CSS architecture (`variables.css`, `reset.css`, `layout.css`) with a new `buttons.css` file. All components keep their inline `<style>` blocks for component-local styling but reference design tokens exclusively. Font files are placed in `client/public/fonts/` so Vite serves them as static assets without bundling — simpler to cache and easier to reason about. The `notes/design-system.md` document records the rationale per Principle VIII.

## Complexity Tracking

No violations — table not needed.

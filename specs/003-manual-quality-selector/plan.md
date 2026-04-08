# Implementation Plan: Manual Quality Selector

**Branch**: `003-manual-quality-selector` | **Date**: 2026-04-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-manual-quality-selector/spec.md`

## Summary

Add a quality selector dropdown to the video player controls, offering four options (Auto, 1080p, 720p, 480p) for both VOD and live playback. The dropdown integrates with the existing hls.js hook to programmatically lock or unlock quality levels via `hls.currentLevel`. This is a client-side-only change touching three files: the `useHls` hook (expose level control), `PlayerControls` component (add dropdown), and `HlsPlayer` container (wire them together).

## Technical Context

**Language/Version**: JavaScript (ES2024) for React frontend
**Primary Dependencies**: React 19, hls.js (already installed)
**Storage**: N/A (client-side only)
**Testing**: Manual browser testing (per constitution — automated tests welcome but not mandatory)
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, mobile)
**Project Type**: Web application (SPA frontend)
**Performance Goals**: Quality switch completes within 2 seconds of selection
**Constraints**: Must work for both VOD and live HLS streams; dropdown must fit the existing black-and-white design system
**Scale/Scope**: 3 files modified, 0 new files, ~50 lines of code added

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Demo-First | PASS | Quality selector is highly demonstrable — audience can see resolution change live |
| II. Streaming Correctness | PASS | Uses hls.js standard API (`currentLevel`) — no protocol shortcuts |
| III. Audience Interactivity | PASS | Enhances viewer experience with manual quality control |
| IV. Simplicity & Time Budget | PASS | ~50 lines across 3 files, explainable in under 1 minute |
| V. Observability & Live Stats | PASS | Quality indicator already reports current level; dropdown selection is also visible |
| VI. Lean & Clean Code | PASS | Small functions, no new abstractions, plain JS idioms |
| VII. Container-Per-Service | N/A | No infrastructure changes |
| VIII. Decision Documentation | PASS | No non-trivial decisions — hls.js API is the only viable approach |
| IX. Component-Driven UI | PASS | Smart/dumb split maintained: dropdown is presentational, state lives in hook |
| X. Debuggability | N/A | No new services or processes |

All gates pass. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/003-manual-quality-selector/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
client/src/
├── hooks/
│   └── useHls.js           # MODIFY: add setLevel callback, expose levels + currentLevel
├── components/
│   └── PlayerControls.jsx  # MODIFY: add quality selector dropdown
└── containers/
    └── HlsPlayer.jsx       # MODIFY: pass level props from hook to controls
```

**Structure Decision**: No new files needed. All changes fit within the existing smart/dumb component architecture. The `useHls` hook gains a `setLevel` function, `PlayerControls` gains a dropdown prop, and `HlsPlayer` wires them together.

## Complexity Tracking

No violations — table not needed.

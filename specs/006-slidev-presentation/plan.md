# Implementation Plan: Slidev Presentation Slides

**Branch**: `006-slidev-presentation` | **Date**: 2026-04-13 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-slidev-presentation/spec.md`

## Summary

Create a Slidev-based presentation deck for the "Streaming 101" timjs meetup talk, living in `slides/slidev/` as a standalone sub-project. The deck is built with `--base /slides/` and the NestJS server serves the static output at `/slides`. The critical feature is progressive MermaidJS diagram reveals — implemented via a custom `<MermaidReveal>` Vue component that renders Mermaid SVGs and uses Slidev's `$slidev.nav.clicks` to show/hide elements step-by-step. Custom Slidev layouts provide reusable slide types (cover with image, pros/cons with click-reveal, quote, full-screen image, URL reference, "next adventure", demo break). Typography is centralized in the headmatter `fonts` config + a single `style.css` with `@font-face` declarations, making font swaps trivial.

## Technical Context

**Language/Version**: JavaScript (ES2024) for Slidev config/components; Vue 3 SFC for custom layouts and components  
**Primary Dependencies**: @slidev/cli ^52.x, @slidev/theme-default (or custom theme), mermaid (bundled with Slidev)  
**Storage**: N/A — static files only  
**Testing**: Manual visual verification (slide deck is a presentation, not an application)  
**Target Platform**: Browser (Chrome/Edge on projector, 1024x768+)  
**Project Type**: Standalone sub-project (own package.json in `slides/slidev/`)  
**Performance Goals**: Built slides load at `/slides` within 3 seconds  
**Constraints**: Must build to static assets servable at `/slides` subpath; fonts must be self-hosted (no CDN dependency — demo may run offline)  
**Scale/Scope**: 15-25 slides, 7 custom layouts, 1 custom Vue component (MermaidReveal)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Demo-First | PASS | Slides are the demo itself — the core presentation deliverable |
| II. Streaming Correctness | PASS | Diagrams teach correct HLS/ABR concepts from existing architecture notes |
| III. Audience Interactivity | PASS | QR code and demo break slides facilitate audience engagement |
| IV. Simplicity & Time Budget | PASS | Slidev is the simplest Markdown-to-slides tool; no custom build pipeline |
| V. Observability & Live Stats | N/A | Slides are static content, not a service |
| VI. Lean & Clean Code | PASS | Custom layouts are small Vue SFCs (~30 lines each); MermaidReveal is a single focused component |
| VII. Container-Per-Service | PASS | Slides are built at dev time and served as static files by the existing server — no new container needed |
| VIII. Decision Documentation | PASS | Research.md documents Slidev choice and MermaidReveal approach |
| IX. Component-Driven UI & Typography | PASS | Fonts centralized in headmatter + style.css; custom layouts are presentational components; monochrome palette |
| X. Debuggability & Hybrid Dev Mode | N/A | Slides have their own dev server (`npx slidev`) — standard Vite HMR |

**Post-design re-check**: All gates still pass. No complexity violations.

## Project Structure

### Documentation (this feature)

```text
specs/006-slidev-presentation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── layouts.md       # Layout contract (slot names, props, usage)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
slides/slidev/
├── package.json              # Slidev dependencies (standalone)
├── slides.md                 # Main slide deck (Markdown + frontmatter)
├── style.css                 # Global styles (@font-face, theme overrides)
├── public/
│   ├── fonts/                # Self-hosted WOFF2 (Inter, JetBrains Mono)
│   └── images/               # Slide images (cover placeholder, screenshots)
├── layouts/                  # Custom Slidev layouts
│   ├── cover-image.vue       # Opening slide: image left 50%, text right
│   ├── pros-cons.vue         # Two-column pros/cons with v-click items
│   ├── quote.vue             # Centered quote with attribution
│   ├── full-image.vue        # Full-screen image, no padding
│   ├── url-reference.vue     # Documentation links with descriptions
│   ├── next-adventure.vue    # "Choose your next adventure" links
│   └── demo-break.vue        # Visually distinct "switch to app" reminder
├── components/               # Custom Vue components
│   └── MermaidReveal.vue     # Progressive Mermaid diagram reveal
└── README.md                 # Authoring guide
```

**Structure Decision**: Slides live in `slides/slidev/` as a standalone sub-project with its own `package.json`, completely decoupled from the React client. The NestJS server serves the built output (`slides/slidev/dist/`) at `/slides` via `@nestjs/serve-static` (already installed). No new npm packages needed in client or server.

# Decision: Slidev for Presentation Slides

## Problem

Need a Markdown-to-slides tool for the "Streaming 101" timjs meetup presentation that supports MermaidJS diagrams, code highlighting, and can be served as static files from the main app.

## Options Considered

### Slidev (chosen)
- **Pros**: Built for developers (Vue/Vite), Vue components in Markdown, MermaidJS built-in, code highlighting via Shiki, hot-reload, builds to static SPA, custom layouts via Vue SFCs
- **Cons**: Vue ecosystem only, heavier output than pure HTML slides

### Marp
- **Pros**: Simpler, great VS Code integration, outputs to PDF/HTML/PPTX
- **Cons**: No interactive components (can't build MermaidReveal), limited layout customization

### Reveal.js
- **Pros**: Industry standard, massive plugin ecosystem, HTML-first
- **Cons**: Markdown is secondary, heavier setup, no Vue component integration

## Decision

**Slidev** — the ability to embed custom Vue components (specifically MermaidReveal for progressive diagram reveals) was the deciding factor. Marp cannot do interactive reveals. Reveal.js could via plugins but requires more boilerplate.

## MermaidReveal Approach

Slidev's `v-click` directive doesn't work inside Mermaid code blocks (Mermaid renders to SVG, not Vue DOM). The solution is a custom `<MermaidReveal>` component that:

1. Renders the Mermaid diagram to SVG via `mermaid.render()`
2. Queries the SVG for interaction elements (arrows, nodes)
3. Controls visibility via CSS opacity tied to `$slidev.nav.clicks`

No existing Slidev addon solves this (open issue slidevjs/slidev#1498).

## Integration

Built slides are served at `/slides` by NestJS via `@nestjs/serve-static` (already a dependency). The `--base /slides/` flag ensures all asset paths are prefixed correctly.

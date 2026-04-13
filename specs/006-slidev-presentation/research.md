# Research: Slidev Presentation Slides

## 1. Progressive MermaidJS Reveals

**Decision**: Custom `<MermaidReveal>` Vue component that renders Mermaid SVG and uses CSS visibility tied to Slidev's click counter (`$slidev.nav.clicks`).

**Rationale**: Slidev's `v-click` directive operates on Vue DOM elements, not on the internals of a rendered Mermaid SVG. The Mermaid library renders diagrams as SVG with predictable element IDs (e.g., `flowchart-nodeA-0`, message arrows in sequence diagrams). A custom component can:
1. Render the full Mermaid diagram once as SVG
2. Query the SVG for interaction elements (arrows, nodes, labels)
3. Apply `visibility: hidden` to elements beyond the current click count
4. On each NEXT event (click count increment), reveal the next element

**Alternatives considered**:
- **Multiple slides with classDef hidden**: Works but duplicates the entire diagram per step, bloating the deck and making edits painful. Rejected for maintainability.
- **Hand-crafted SVG with v-click**: Full control but loses Mermaid syntax convenience. Rejected — the user wants MermaidJS specifically.
- **Slidev addon**: No existing addon solves this (open issue #1498 on Slidev repo). Building a full addon is overkill for this project.

## 2. Static Build at Subpath

**Decision**: Build with `npx slidev build --base /slides/ --out dist`.

**Rationale**: Slidev passes `--base` directly to Vite, which prefixes all asset paths. The NestJS server serves the `dist/` folder at `/slides` using `@nestjs/serve-static` (already a dependency). The base path must start and end with `/`.

**Alternatives considered**:
- **Reverse proxy via Nginx**: Adds infrastructure complexity. Rejected — the NestJS server already has serve-static.
- **Embed in Vite client build**: Would couple the slides to the React build pipeline. Rejected — violates the standalone sub-project assumption.

## 3. Custom Layouts

**Decision**: Vue SFC files in `slides/slidev/layouts/` directory. Each layout is a Vue component using `<slot />` and named slots.

**Rationale**: This is Slidev's official mechanism. Layout files are auto-discovered by name. Usage in markdown: `layout: cover-image` in frontmatter, with `::right::` slot sugar for multi-region layouts.

**Required layouts** (7 total):
1. `cover-image.vue` — Opening slide: image left 50%, title/subtitle right
2. `pros-cons.vue` — Two-column with numbered items, `v-click` on each
3. `quote.vue` — Centered quotation with attribution
4. `full-image.vue` — Full-bleed image, zero padding
5. `url-reference.vue` — Links list with titles and descriptions
6. `next-adventure.vue` — "Choose your next adventure" topic cards
7. `demo-break.vue` — Visually distinct "switch to live app" prompt

## 4. Font Configuration

**Decision**: Fonts declared in headmatter (`fonts.sans`, `fonts.mono`, `fonts.local`) and self-hosted via `@font-face` in `style.css`. Font files in `public/fonts/`.

**Rationale**: Centralizing fonts in two places (headmatter + style.css) means swapping fonts requires editing only those two locations. The `fonts.local` property disables Google Fonts CDN, which is critical since the demo may run offline.

**Font files**: Inter Variable WOFF2 and JetBrains Mono Variable WOFF2 — already present in the project at `client/public/fonts/`. These can be copied or symlinked into `slides/slidev/public/fonts/`.

## 5. Serving from NestJS

**Decision**: Add a second `ServeStaticModule.forRoot()` entry in the NestJS `AppModule` pointing at the built slides directory with `serveRoot: '/slides'`.

**Rationale**: `@nestjs/serve-static` (already installed, v5) supports multiple static roots. Adding a second entry for slides does not conflict with the existing client SPA serving. The `renderPath` option can exclude `/api/*` and `/hls/*` routes.

**Key detail**: The slides `index.html` already has `<base href="/slides/">` from the `--base` flag, so all relative asset paths resolve correctly.

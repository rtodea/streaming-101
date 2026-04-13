# streaming-101 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-13

## Active Technologies
- JavaScript (ES2024) for React frontend; TypeScript for NestJS backend + React 19, Vite 6, React Router v7 (frontend); NestJS 11, ws, @nestjs/serve-static (backend) — no new dependencies needed (002-delete-uploaded-videos)
- Docker volume at `/data/hls/` — delete operation removes files from `vod/{id}/` directory (002-delete-uploaded-videos)
- JavaScript (ES2024) for React frontend + React 19, hls.js (already installed) (003-manual-quality-selector)
- N/A (client-side only) (003-manual-quality-selector)
- JavaScript (ES2024) for React frontend + React 19, Vite 6 (already installed). Font files: Inter v4 (OFL) and JetBrains Mono v2.304 (OFL) — self-hosted WOFF2 variable fonts, no new npm packages. (004-typography-design-system)
- N/A (static asset files only — fonts shipped in `client/public/fonts/`) (004-typography-design-system)
- JavaScript (ES2024), CSS3 (custom properties, media queries, flex, grid) + React 19, Vite 6, React Router v7, hls.js, react-qr-code — all already installed. No new packages. (005-responsive-design)
- N/A — layout feature only (005-responsive-design)
- JavaScript (ES2024) for Slidev config/components; Vue 3 SFC for custom layouts and components + @slidev/cli ^52.x, @slidev/theme-default (or custom theme), mermaid (bundled with Slidev) (006-slidev-presentation)
- N/A — static files only (006-slidev-presentation)

- JavaScript (ES2024) for React frontend; TypeScript for NestJS backend (decorators require it) + React 19, Vite 6, React Router v7, hls.js, react-qr-code (frontend); NestJS 11, ws, @nestjs/serve-static (backend) (001-streaming-demo-stack)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

JavaScript (ES2024) for React frontend; TypeScript for NestJS backend (decorators require it): Follow standard conventions

## Recent Changes
- 006-slidev-presentation: Added JavaScript (ES2024) for Slidev config/components; Vue 3 SFC for custom layouts and components + @slidev/cli ^52.x, @slidev/theme-default (or custom theme), mermaid (bundled with Slidev)
- 005-responsive-design: Added JavaScript (ES2024), CSS3 (custom properties, media queries, flex, grid) + React 19, Vite 6, React Router v7, hls.js, react-qr-code — all already installed. No new packages.
- 004-typography-design-system: Added JavaScript (ES2024) for React frontend + React 19, Vite 6 (already installed). Font files: Inter v4 (OFL) and JetBrains Mono v2.304 (OFL) — self-hosted WOFF2 variable fonts, no new npm packages.


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

# streaming-101 Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-10

## Active Technologies
- JavaScript (ES2024) for React frontend; TypeScript for NestJS backend + React 19, Vite 6, React Router v7 (frontend); NestJS 11, ws, @nestjs/serve-static (backend) — no new dependencies needed (002-delete-uploaded-videos)
- Docker volume at `/data/hls/` — delete operation removes files from `vod/{id}/` directory (002-delete-uploaded-videos)
- JavaScript (ES2024) for React frontend + React 19, hls.js (already installed) (003-manual-quality-selector)
- N/A (client-side only) (003-manual-quality-selector)
- JavaScript (ES2024) for React frontend + React 19, Vite 6 (already installed). Font files: Inter v4 (OFL) and JetBrains Mono v2.304 (OFL) — self-hosted WOFF2 variable fonts, no new npm packages. (004-typography-design-system)
- N/A (static asset files only — fonts shipped in `client/public/fonts/`) (004-typography-design-system)

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
- 004-typography-design-system: Added JavaScript (ES2024) for React frontend + React 19, Vite 6 (already installed). Font files: Inter v4 (OFL) and JetBrains Mono v2.304 (OFL) — self-hosted WOFF2 variable fonts, no new npm packages.
- 003-manual-quality-selector: Added JavaScript (ES2024) for React frontend + React 19, hls.js (already installed)
- 002-delete-uploaded-videos: Added JavaScript (ES2024) for React frontend; TypeScript for NestJS backend + React 19, Vite 6, React Router v7 (frontend); NestJS 11, ws, @nestjs/serve-static (backend) — no new dependencies needed


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

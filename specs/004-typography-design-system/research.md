# Research: Typography and Design System Refinement

## Typeface Selection — Sans-Serif (UI + Body)

**Decision**: **Inter** (variable font, OFL-1.1 licensed).

**Rationale**:
- Purpose-designed for screen UIs with excellent legibility at small sizes and on projectors
- Industry-standard in modern web design (Vercel, Linear, Figma, GitHub Primer all use it)
- Variable font: one WOFF2 file covers weights 100–900, reducing HTTP requests and total payload
- Excellent numerals (tabular figures available) — important for live stats on the presenter dashboard
- Open Font License permits self-hosting and redistribution
- Neutral geometric character matches the "clean and professional, black-and-white" brief

**Alternatives considered**:
- **Geist** (Vercel): Newer, also excellent, but Inter is more battle-tested and has broader glyph coverage
- **IBM Plex Sans**: Distinctive but has a corporate/technical personality that may feel heavier
- **Space Grotesk**: Great display face but less optimal for small UI text (labels, stats)
- **System font stack** (current): Inconsistent across OS — the presenter demo would look different on macOS vs Linux projectors

## Typeface Selection — Monospace (Hex / Code)

**Decision**: **JetBrains Mono** (variable font, OFL-1.1 licensed).

**Rationale**:
- Designed specifically for code and hex content — wide characters, clear ambiguity resolution (0/O, 1/l, I)
- Variable font covers weights 100–800 in one WOFF2 file
- Pairs visually with Inter (similar proportions, matching x-height)
- OFL-licensed, free to self-host

**Alternatives considered**:
- **Fira Code**: Popular but slightly narrower characters, less legible at projector distance
- **IBM Plex Mono**: Good pairing with Plex Sans but heavier visual weight
- **Geist Mono**: Newer, less mature
- **Generic `monospace`** (current): No control over appearance across OS

## Font Delivery Strategy

**Decision**: Self-host WOFF2 variable fonts in `client/public/fonts/`, load via `@font-face` with `font-display: swap`.

**Rationale**:
- Constitution Presentation Constraints forbid external service dependencies — the demo must work offline on local networks
- Variable fonts reduce payload vs shipping multiple static weight files (one file ≈ 150–250 KB WOFF2 vs 4–6 files totaling 400+ KB)
- `font-display: swap` means no invisible text — system fallback renders first, Inter/JetBrains Mono swap in when ready (SC-007)
- Placing files in `public/fonts/` (not `src/assets/fonts/`) means Vite serves them directly as static assets — no bundler hashing, easier caching, simpler reasoning

**Alternatives considered**:
- **Google Fonts CDN**: Forbidden by constitution (external dependency)
- **npm `@fontsource/inter`**: Adds a build dependency and bundler complexity for zero benefit — we only need two `.woff2` files
- **Static TTF files per weight**: Larger total payload, more `@font-face` rules

## Button System Design

**Decision**: Use BEM-style classes `.btn`, `.btn--primary`, `.btn--ghost`, `.btn--danger`, `.btn--icon` with a sibling `.form-control` for selects/inputs/sliders.

**Rationale**:
- Four variants cover every existing use case in the app:
  - `.btn--primary` (filled black): Upload, Start Camera, Start Live Stream, "View Videos" (QR landing)
  - `.btn--ghost` (outlined): secondary actions, pagination (hex viewer prev/next)
  - `.btn--danger` (outlined red): Delete video, Stop stream
  - `.btn--icon` (small square): delete-on-card buttons, close buttons
- `.form-control` unifies `<select>`, `<input type="file">`, `<input type="range">` — same border, padding, hover/focus treatment
- BEM naming is obvious on stage — `.btn--primary` reads as "primary button" to the audience
- All styling lives in one `buttons.css` file per Principle IX's "CSS custom properties in a single root file"

**Alternatives considered**:
- **Single `<Button>` React component with variant prop**: More idiomatic React but adds a file and a render layer for zero functional benefit — CSS classes are simpler and portable
- **CSS-in-JS (styled-components)**: Forbidden implicitly by Principle VI's "stay true to JavaScript" — adds runtime overhead and obscures the styling layer
- **Utility framework (Tailwind)**: Explicitly called out in Principle IX as requiring a documented justification; plain CSS with tokens is simpler for a demo

## Type Scale

**Decision**: Extend the existing scale (xs, sm, base, lg, xl, 2xl, hero) with explicit line-heights and weights per size.

| Token | Size | Weight | Line height | Usage |
|-------|------|--------|-------------|-------|
| `--font-size-xs` | 0.75rem (12px) | 500 | 1.4 | Micro labels, table headers |
| `--font-size-sm` | 0.875rem (14px) | 400 | 1.5 | Body small, stat values |
| `--font-size-base` | 1rem (16px) | 400 | 1.5 | Body text |
| `--font-size-lg` | 1.25rem (20px) | 600 | 1.3 | Section headings (h2) |
| `--font-size-xl` | 1.75rem (28px) | 700 | 1.2 | Page titles (h1) |
| `--font-size-2xl` | 2.5rem (40px) | 700 | 1.1 | Landing page hero |
| `--font-size-hero` | 4rem (64px) | 800 | 1.0 | Presenter-view big stats |

**Rationale**: Matches the existing scale so no components break; adds deliberate line-heights and weights so each size has a clear role. "Inter Display" optical axis would be nicer for hero sizes but requires a separate file — the variable font's default optical axis is good enough for this demo.

## Open Font License Compliance

**Decision**: Ship both `OFL.txt` license files alongside the WOFF2 files in `client/public/fonts/`.

**Rationale**: OFL-1.1 requires the license text to accompany redistributed font files. Placing `Inter-OFL.txt` and `JetBrainsMono-OFL.txt` next to the fonts satisfies this with zero ceremony.

**Alternatives considered**:
- License text in a single `LICENSES.md` file: Also valid but less discoverable for users who download the fonts directly
- Not shipping the license: Non-compliant with OFL terms — not an option

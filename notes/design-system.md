# Design System

The Streaming 101 UI has a tiny, deliberate design system built from plain CSS
custom properties plus a BEM-style button class set. Everything lives in three
files under `client/src/styles/`:

| File | Purpose |
|------|---------|
| `variables.css` | Source-of-truth design tokens (fonts, sizes, weights, colors, spacing, radii, transitions, shadows) |
| `reset.css` | `@font-face` rules + element-level typography defaults (`h1`, `h2`, `p`, `label`, `code`, `pre`) |
| `buttons.css` | `.btn` base + `.btn--primary` / `.btn--ghost` / `.btn--danger` / `.btn--icon` variants and the shared `.form-control` |

The full, versioned contract lives in
[specs/004-typography-design-system/contracts/design-tokens.md](../specs/004-typography-design-system/contracts/design-tokens.md).

## Font Choices

### Sans-serif: Inter (v4, variable WOFF2, OFL-1.1)

Used for every UI surface: headings, body, labels, stats, form controls. Inter
is the industry standard for modern web UI (Vercel, Linear, Figma, GitHub
Primer) and is specifically optimized for screens and projectors. The variable
font ships weights 100–900 in a single WOFF2 (~48 KB) so the demo loads fast
and we never have to manage per-weight files. OFL-1.1 permits self-hosting and
redistribution; the license text lives next to the font file.

### Monospace: JetBrains Mono (v2.304+, variable WOFF2, OFL-1.1)

Used for the hex viewer, QR URL, quality badges, and any code-like content.
JetBrains Mono has wide characters and clearly disambiguates `0/O`, `1/l/I` —
critical for reading hex dumps at projector distance. Pairs visually with Inter
(matching x-height, similar proportions). Also a single-file variable WOFF2
(~40 KB).

### Why self-hosted

The constitution's "no external service dependencies" rule means the demo has
to work on a hotel or meetup-venue network without internet. Files live in
`client/public/fonts/` and are served directly by Vite as static assets at
`/fonts/*.woff2`. Both files combined are under 90 KB — well within the 500 KB
budget. `font-display: swap` means no flash of invisible text; the system
fallback stack renders first and the variable font swaps in when the WOFF2
loads.

### Fallback stacks

If the WOFF2 files fail to load entirely, text stays readable via:

```css
--font-family-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont,
  'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
--font-family-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo,
  Consolas, 'Liberation Mono', monospace;
```

## Type Scale

| Token | Size | Typical role |
|-------|------|--------------|
| `--font-size-xs` | 12 px | Micro labels, table headers, mono metadata |
| `--font-size-sm` | 14 px | Body small, stat values, buttons |
| `--font-size-base` | 16 px | Body text |
| `--font-size-lg` | 20 px | Section headings (`h2`) |
| `--font-size-xl` | 28 px | Page titles (`h1`) |
| `--font-size-2xl` | 40 px | Landing page / gauges |
| `--font-size-hero` | 64 px | Presenter hero stats |

Weights: `--font-weight-regular` (400), `--font-weight-medium` (500),
`--font-weight-semibold` (600), `--font-weight-bold` (700).

Line heights: `--line-height-tight` (1.2), `--line-height-normal` (1.5),
`--line-height-relaxed` (1.7).

## Button Variants

Every `<button>` in the app uses `.btn` plus exactly one variant modifier. Do
not write raw `<button>` with inline styles.

| Class | When to use | Visual |
|-------|-------------|--------|
| `.btn .btn--primary` | Main action: Upload, Start Live Stream, View Videos | Filled black, white text, lifts slightly on hover |
| `.btn .btn--ghost` | Secondary / pagination: hex viewer prev/next | Transparent, bordered, hover = light surface fill |
| `.btn .btn--danger` | Destructive: Delete, Stop Stream | Transparent, red-outlined, hover = red fill |
| `.btn .btn--icon` | Compact icon/label button (combine with ghost or danger) | Smaller padding, `xs` font size |

Every variant gets:

- Consistent geometry (padding, radius, font family, transition)
- `:disabled` → opacity 0.4, `cursor: not-allowed`
- `:focus-visible` → `var(--shadow-focus)` ring (keyboard-only)
- `@media (prefers-reduced-motion: reduce)` → transitions disabled

### Form Controls

`<select>`, `<input type="file">`, `<input type="range">`, and text inputs all
get `className="form-control"`. This gives them the same border, radius,
padding, hover and focus treatment as the buttons so the whole interface reads
as one coherent system.

## How to Add a New Component

1. Read a token — never a raw value — for font, size, weight, color, spacing,
   radius, or shadow:

   ```jsx
   <div
     style={{
       fontFamily: 'var(--font-family-sans)',
       fontSize: 'var(--font-size-sm)',
       color: 'var(--color-muted)',
     }}
   >
     ...
   </div>
   ```

2. For any button, use the class set — not inline styles:

   ```jsx
   <button className="btn btn--primary" onClick={...}>Save</button>
   <button className="btn btn--danger btn--icon" aria-label="Delete">×</button>
   ```

3. For any `<select>` / `<input type="file">` / `<input type="range">`:

   ```jsx
   <select className="form-control" ...>...</select>
   ```

4. For mono content (hex, code, URLs, badges), use `var(--font-family-mono)`.

## Consumer Rules

1. **No hardcoded font families** — always `--font-family-sans` / `--font-family-mono`.
2. **No hardcoded font sizes** in `rem`/`px` — always a `--font-size-*` token.
3. **No hardcoded colors** — always a `--color-*` token.
4. **Button markup** — `<button className="btn btn--primary">`; never style a
   raw `<button>` inline.
5. **Form control markup** — apply `className="form-control"` to selects, file
   inputs, range inputs, text inputs.
6. **Breaking changes** — modifying the contract requires updating this file
   and `specs/004-typography-design-system/contracts/design-tokens.md`.

## Changing a Token

To swap the primary font:

```css
/* client/src/styles/variables.css */
--font-family-sans: 'YourFont', system-ui, sans-serif;
```

Every page picks it up automatically without touching any component file. Same
for colors, spacing, or radii.

## Breakpoints

The responsive layer (feature 005) adds four named breakpoint tokens plus a
small set of mobile-first layout rules. The full consumer contract lives in
[specs/005-responsive-design/contracts/breakpoints.md](../specs/005-responsive-design/contracts/breakpoints.md).

### Token set

| Token     | Value   | Typical device                          |
|-----------|---------|-----------------------------------------|
| `--bp-sm` | 640 px  | Large phone / small tablet portrait     |
| `--bp-md` | 768 px  | Tablet portrait (iPad, iPad mini)       |
| `--bp-lg` | 1024 px | Tablet landscape / small laptop         |
| `--bp-xl` | 1280 px | Desktop                                 |

Values are **Tailwind-aligned** so anyone in the audience reading the code
recognizes them immediately. All layout rules are written **mobile-first**
with `@media (min-width: …)`; the base stylesheet targets a 320 px phone
and desktop is the progressive enhancement.

### The `@media` + custom-property limitation

CSS `@media (min-width: var(--bp-md))` **does not work** — the CSSWG spec
does not allow custom-property interpolation inside media query conditions.
As a result the breakpoint tokens are defined once in `variables.css` as the
canonical source of truth, and the raw pixel values are **duplicated** into
`@media` rules inside `layout.css` plus any component-local `<style>` block
that ships its own media queries.

Every file that duplicates the values **MUST** include the comment header
from `breakpoints.md` §Appendix A pointing back to `variables.css`. This is
the enforcement mechanism for "breakpoints defined in a single central file"
in the absence of a working token-interpolation mechanism.

### What the tokens actually do

- `.grid-3` (catalog) reflows 1 → 2 → 3 columns at 0 / 640 / 1024 px
- `.grid-2` (presenter dashboard) reflows 1 → 2 columns at 0 / 768 px
- `.container` horizontal padding grows at 768 px
- `.row` wraps below 768 px and becomes single-line at/above 768 px
- `.btn` and `.form-control` enforce a 44×44 minimum on `@media (pointer: coarse)` — `.btn--icon` is an intentional exception (stays 28×28 because it only lives inside larger interactive parents)
- `--font-size-2xl-fluid` / `--font-size-hero-fluid` use `clamp()` and are the ONLY fluid typography tokens — body text stays fixed at 16 px to avoid the "everything jitters on resize" anti-pattern

### Rule for new components

1. Reference layout via the shared classes (`.container`, `.row`, `.stack`, `.grid-2`, `.grid-3`) and the responsive behavior comes for free.
2. If a component ships its own `<style>` block and needs a media query, copy the comment header from `layout.css` into the component file and use the raw px values — never invent a new breakpoint value.
3. Use `--font-size-*-fluid` only on display-sized headings and large stat values. Body text stays fixed.

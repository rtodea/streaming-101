# Contract: Breakpoint Tokens & Responsive Layout

**Feature**: 005-responsive-design
**Date**: 2026-04-10
**Status**: Stable (v1)

This document is the consumer-facing contract for the responsive design
system. Any view, container, or component that needs to respond to
viewport size MUST reference this contract rather than hardcoding pixel
values or inventing its own breakpoints.

---

## 1. Breakpoint Tokens

Defined in `client/src/styles/variables.css` under `:root`.

```css
:root {
  /* Responsive breakpoints — Tailwind-aligned */
  --bp-sm: 640px;   /* Large phone / small tablet portrait */
  --bp-md: 768px;   /* Tablet portrait */
  --bp-lg: 1024px;  /* Tablet landscape / small laptop */
  --bp-xl: 1280px;  /* Desktop */
}
```

### Usage rules

| Rule | Required? | Notes |
|------|-----------|-------|
| Reference tokens by name for JS / inline-style / container-query consumption | **MUST** | `getComputedStyle(root).getPropertyValue('--bp-md')` is the canonical lookup. |
| Use raw pixel values inside `@media (min-width: …)` conditions | **MUST** | CSS `@media` cannot interpolate custom properties. The raw value MUST match the token. |
| Include a comment header in any file that duplicates a pixel value | **MUST** | Header points back to `variables.css` as the source of truth. See Appendix A for the required header format. |
| Introduce a new breakpoint value | **MUST NOT** without updating this contract, `variables.css`, and `data-model.md` first. | The four tokens above are the complete set. |
| Use `max-width` media queries | **SHOULD NOT** | Prefer mobile-first `min-width`. Only allowed when the rule genuinely cannot be expressed mobile-first. |

---

## 2. Layout Classes (consumed by views)

These class names are defined in `client/src/styles/layout.css` and are
the stable, contract-level hooks that views use to opt into responsive
behavior. Views MUST NOT redefine these classes locally.

| Class | Responsive behavior | Consumers |
|-------|---------------------|-----------|
| `.grid-3` | 1 col → 2 cols at `--bp-sm` → 3 cols at `--bp-lg` | `CatalogList.jsx` |
| `.grid-2` | 1 col → 2 cols at `--bp-md` | `Presenter.jsx` |
| `.container` | Horizontal padding `--space-md` → `--space-lg` at `--bp-md` | All top-level `<div>` page wrappers (QRLanding, Catalog, Player, Presenter) |
| `.row` | `flex-wrap: wrap` below `--bp-md`, `nowrap` at/above | Any horizontal control strip (player controls, byte-inspector selectors) |

### Consumer contract

- A view adds one of these classes to the appropriate wrapper element and
  gets the responsive behavior "for free". No JavaScript is required.
- A view MUST NOT override `grid-template-columns` or `flex-wrap` on
  these classes from inside its own JSX or inline style — that would
  break the single source of truth.

---

## 3. Touch-Target Contract

Defined in `client/src/styles/buttons.css`.

```css
@media (pointer: coarse) {
  .btn,
  .form-control {
    min-height: 44px;
    min-width: 44px;
  }
}
```

### Rules

| Element | Touch minimum | Exception |
|---------|---------------|-----------|
| `.btn` | 44×44 CSS px | `.btn--icon` explicitly opts out — 28×28 — because it is only used inside a larger interactive parent. |
| `.form-control` (inputs, selects, textareas) | 44×44 CSS px | None. |
| Custom interactive elements (plain `<div onClick>`) | Component author's responsibility | Prefer using a `.btn` class rather than inventing new tappables. |

Consumers MUST NOT override `min-height` or `min-width` to shrink a
`.btn` below 44 px on touch devices except by explicitly applying the
`.btn--icon` modifier.

---

## 4. Fluid Typography Tokens

Defined in `client/src/styles/variables.css`.

```css
:root {
  /* Display-size fluid tokens — use ONLY for hero-sized headings */
  --font-size-2xl-fluid:  clamp(1.75rem, 5vw, 2.5rem);
  --font-size-hero-fluid: clamp(2.5rem, 10vw, 4rem);
}
```

### Rules

| Rule | Required? | Notes |
|------|-----------|-------|
| Use `--font-size-*-fluid` only on display headings and large stat values | **MUST** | Applying `clamp()` to body text causes the "everything jitters on resize" anti-pattern. |
| Body text MUST continue to use the fixed `--font-size-base` (16 px) | **MUST** | Already ≥ 14 px at all viewports (SC-006). |
| Consumers reference the tokens by name via `var(--font-size-*-fluid)` | **MUST** | No inline `clamp()` expressions. |

**Current consumers**:
- `client/src/views/QRLanding.jsx` — landing page title
- `client/src/components/StatGauge.jsx` — gauge values

---

## 5. Wide-Content Contract

Any component whose primary content is wider than a phone viewport (hex
dumps, dense tables, wide plots) MUST be wrapped in a container that
satisfies the following:

```css
.wide-wrap {
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;  /* iOS momentum scrolling */
}
```

### Current consumers

| Component | Wrapper element |
|-----------|-----------------|
| `HexViewer.jsx` | `.hex-viewer__table-wrap` |
| `StatsPanel.jsx` | Stats-table wrapper `<div>` |

Wrappers MUST be inside the `.container` (not siblings of it), so that
the page itself never acquires a horizontal scrollbar.

---

## 6. Version & Stability

| Version | Date | Change |
|---------|------|--------|
| v1 | 2026-04-10 | Initial contract — 4 breakpoints, 4 layout classes, touch-target rule, 2 fluid tokens, wide-content wrapper rule. |

**Stability**: Breakpoint values and class names are **stable** for the
lifetime of this demo. Additions require a version bump of this
contract; removals or value changes require a coordinated update to
every consumer listed above.

---

## Appendix A — Required comment header for files that duplicate breakpoint values

Every file that declares a `@media (min-width: …)` rule with one of
the breakpoint pixel values MUST include this comment header near the
top of the file (or inline above the media query if the file has many
unrelated blocks):

```css
/*
 * Breakpoint values MUST match the --bp-* tokens in
 * client/src/styles/variables.css. CSS @media queries cannot
 * interpolate custom properties, so the raw px values are
 * duplicated here by design. If you change one, change the other.
 *
 *   --bp-sm: 640px
 *   --bp-md: 768px
 *   --bp-lg: 1024px
 *   --bp-xl: 1280px
 */
```

This header is the enforcement mechanism for SC-008 ("breakpoints
defined in a single central file") in the presence of the CSS
`@media` + custom-property limitation documented in `research.md`.

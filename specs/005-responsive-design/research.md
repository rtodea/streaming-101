# Phase 0: Research — Responsive Design

**Feature**: 005-responsive-design
**Date**: 2026-04-10

All Technical Context items were fully specified in `plan.md`; no
`NEEDS CLARIFICATION` markers remain. This document records the decisions
behind the small number of open questions that the plan glossed over.

---

## Decision 1 — Breakpoint scale

**Decision**: Four named breakpoints aligned with the Tailwind / Bootstrap
conventions most web developers already carry in muscle memory.

| Token | Min width | Typical device |
|-------|-----------|----------------|
| `--bp-sm` | 640 px | Large phone landscape / small tablet portrait |
| `--bp-md` | 768 px | Tablet portrait (iPad, iPad mini) |
| `--bp-lg` | 1024 px | Tablet landscape / small laptop |
| `--bp-xl` | 1280 px | Desktop |

All tokens live in `client/src/styles/variables.css`. Layout rules use
**mobile-first** media queries: the base rules target the narrowest viewport
and `@media (min-width: var(--bp-X))` progressively upgrades the layout.

**Rationale**:
- Tailwind's `sm/md/lg/xl` values (640/768/1024/1280) are the de-facto
  industry standard. Audience members reading the code on stage will
  recognize them instantly.
- Four breakpoints is enough for the 4 distinct layouts this demo needs
  (phone / tablet portrait / tablet landscape / desktop) without
  over-engineering.
- Mobile-first matches the feature's priority order: the spec prioritizes
  the audience-on-phone story (US1) over the presenter-on-tablet story
  (US2), so the *base* styles should target a phone and desktop is the
  progressive enhancement.
- Success Criterion SC-003 says "one card per row below 640 px, ≥2 cards
  at ≥768 px" — the 640 / 768 split falls out naturally from the chosen
  scale.
- Success Criterion SC-004 says "presenter dashboard collapses at or
  below 768 px" — `--bp-md` is the exact threshold.

**Alternatives considered**:

| Option | Why rejected |
|--------|--------------|
| Two breakpoints only (phone vs desktop at 768 px) | Too coarse — the presenter dashboard needs a distinct tablet-landscape treatment at 1024 px per US2, and the catalog grid needs a 640/768/1024 ramp to deliver 1 → 2 → 3 columns. |
| Five+ breakpoints (add `2xl` at 1536, `xs` at 480) | YAGNI. The demo runs on a projector + phones + one laptop. No use case needs 1536 px or 480 px inflection. Principle IV explicitly rules out speculative breakpoints. |
| Bootstrap 5 values (576/768/992/1200) | Functionally equivalent to Tailwind but less common in modern React codebases; Tailwind naming is more recognizable to the meetup audience. |
| Fluid sizing only (`clamp()` / `min()` everywhere) | Elegant for typography but inadequate for grid reflow — a 3-column grid cannot become a 1-column grid with `clamp()`. Fluid sizing will be used for **typography scaling** inside each breakpoint, but the grid-reflow points still need discrete media queries. |

---

## Decision 2 — Single source of truth for breakpoint values

**Problem**: CSS `@media (min-width: var(--bp-md))` **does not work**. CSS
custom properties cannot be used inside media query conditions per the
current CSSWG spec. This is the first responsive-token pain point every
project hits.

**Decision**: Define the breakpoint pixel values as `--bp-*` custom
properties in `variables.css` for JavaScript / `@container` queries /
inline style consumption, **AND** duplicate the literal pixel values in
`@media` rules inside `layout.css` — with a prominent comment header
pointing back to `variables.css` so future edits keep them in sync.

```css
/* layout.css — header comment */
/*
 * Breakpoint values MUST match the --bp-* tokens in variables.css.
 * CSS media queries cannot interpolate custom properties, so the raw
 * px values are duplicated here by design. If you change one, change
 * the other.
 *
 *   --bp-sm: 640px
 *   --bp-md: 768px
 *   --bp-lg: 1024px
 *   --bp-xl: 1280px
 */
```

**Rationale**:
- This is the simplest working solution and matches what Tailwind, MUI,
  Chakra, and every production design system does under the hood.
- `@container` queries would solve the interpolation problem but add
  conceptual overhead and aren't universally supported in the target
  browsers of this demo's audience phones.
- A build-time token pipeline (PostCSS plugin, Style Dictionary) would
  eliminate the duplication but violates Principle IV (simplicity / time
  budget) for a demo with four breakpoints.

**Alternatives considered**:

| Option | Why rejected |
|--------|--------------|
| Use `@container` queries | Unnecessary complexity for a demo; most cards/views use viewport-relative rules, not container-relative. Safari 15 support is spotty. |
| PostCSS `postcss-custom-media` plugin | Adds a build-time dependency just to avoid writing four pixel values twice. Not worth the cognitive tax at this scale. |
| Drop `--bp-*` tokens entirely, hardcode everywhere | Violates FR-012 and SC-008 ("defined once in a single central file"). The point of the tokens is to be the documented source of truth even if `@media` has to copy them. |

SC-008 is satisfied because the tokens *are* defined once in
`variables.css`; `layout.css` is treated as a "mirror" with an explicit
comment contract, not a parallel source of truth.

---

## Decision 3 — Touch target enforcement

**Decision**: Enforce the 44×44 px minimum touch target globally via
`buttons.css` with a `@media (pointer: coarse)` query that adds
`min-height: 44px` and `min-width: 44px` to `.btn` and `.form-control`.
Desktop pointer devices keep the tighter sizing so the dashboard stays
compact on large screens.

**Rationale**:
- `(pointer: coarse)` is the canonical CSS media feature for "this device
  uses touch" — more reliable than user agent sniffing or viewport-width
  proxies.
- Scoping the larger targets to touch devices only avoids bloating the
  presenter dashboard on a desktop mouse-driven workflow, which is its
  primary use.
- WCAG 2.1 AA requires 44×44 CSS pixels for touch; WCAG 2.2 AA (the
  newer level) relaxes this to 24×24 with exceptions. We target the
  stricter 2.1 AA bar because it is simpler and the user spec calls for
  it explicitly.

**Alternatives considered**:

| Option | Why rejected |
|--------|--------------|
| Apply 44×44 unconditionally on every device | Wastes vertical space on the presenter dashboard; the dashboard is the densest surface in the app. |
| Detect touch via JavaScript and add a class | Adds JS for a pure-CSS problem. Principle VI rules this out. |
| Rely on the existing `.btn--icon` 28×28 geometry and accept the violation on touch | Would fail SC-005 at audit time. |

---

## Decision 4 — Catalog grid reflow rules

**Decision**: `.grid-3` becomes a responsive grid via
`grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))` at the
base (mobile) level, then is explicitly tightened at each breakpoint:

```css
.grid-3 {
  grid-template-columns: 1fr;              /* base: phone — one column */
}
@media (min-width: 640px) {
  .grid-3 { grid-template-columns: repeat(2, 1fr); }  /* sm: 2 columns */
}
@media (min-width: 1024px) {
  .grid-3 { grid-template-columns: repeat(3, 1fr); }  /* lg: 3 columns */
}
```

**Rationale**:
- Guarantees SC-003 exactly: 1 card below 640 px, ≥2 at 768 px (the 640→1024
  band shows 2), 3 at ≥1024 px.
- Explicit `1fr` columns keep VideoCard width predictable — the hover box
  shadow and aspect-ratio thumb stay aligned.

**Alternatives considered**:

| Option | Why rejected |
|--------|--------------|
| Pure `auto-fill, minmax(280px, 1fr)` with no breakpoints | The 2-column regime becomes fuzzy (could be 1 or 2 cards depending on container width), making SC-003 hard to verify. |
| `flex-wrap` on a flex row | Harder to get equal-width cards; grid is the right tool. |

---

## Decision 5 — Presenter dashboard reflow rule

**Decision**: `.grid-2` collapses from two columns to one below `--bp-md`
(768 px). No intermediate state. The two-column layout applies for
everything ≥ 768 px.

**Rationale**:
- Matches SC-004 verbatim.
- iPad landscape (1024 px) and iPad portrait (768 px) both keep the
  two-column layout, which is the user-requested behavior in US2
  Acceptance Scenario 1.
- Simpler than a 3-step reflow (dashboard has only two columns so there
  is nothing meaningful to do at an intermediate width).

**Alternatives considered**:

| Option | Why rejected |
|--------|--------------|
| Reflow at 1024 px instead of 768 px | Would push iPad portrait into single-column mode, violating US2 AS1. |
| Use CSS subgrid for row alignment across the two columns | Subgrid is nice-to-have for desktop but doesn't help mobile reflow. Adds complexity for minimal payoff. |

---

## Decision 6 — Typography scaling

**Decision**: Keep the existing type-scale tokens (`--font-size-xs`
through `--font-size-hero`) unchanged. Use `clamp()` only on the two
display-sized tokens consumed by the QR landing page heading and the
presenter dashboard stat gauges:

```css
/* variables.css — added to the existing scale */
--font-size-2xl-fluid: clamp(1.75rem, 5vw, 2.5rem);
--font-size-hero-fluid: clamp(2.5rem, 10vw, 4rem);
```

`QRLanding.jsx` and `StatGauge.jsx` switch to the `-fluid` variants.
Nothing else changes — body text stays 16 px, `xs` stays 12 px (body
text is already ≥ 14 px per SC-006; `xs` is used only for tiny metadata
badges where 12 px is still readable on a phone at arm's length).

**Rationale**:
- `clamp()` lets the hero heading shrink gracefully on a 320 px viewport
  without falling off the screen, while keeping the impressive 64 px
  size on the projector — critical for the Demo-First principle.
- Scoping fluid typography to the two hero-sized tokens avoids the
  "everything jitters as you resize" anti-pattern.
- Body text (`--font-size-base` = 16 px = 1 rem) already exceeds the
  14 px floor from SC-006, so no change is needed there.

**Alternatives considered**:

| Option | Why rejected |
|--------|--------------|
| Apply `clamp()` to every size in the scale | Over-engineering; most sizes already work at all viewports. |
| Scale-down via media query overrides | Works but is more code and harder to tune than `clamp()`. |
| Increase `xs` to 14 px globally | Would break the hex-viewer metadata and stats-table headers, which intentionally use smaller type. 12 px is fine there — those are metadata labels, not body text. |

---

## Decision 7 — Wide content (hex viewer, stats table)

**Decision**: Both wide components already use a wrapping `<div>` with
`overflow-x: auto` around the table. The remaining work is:

1. Ensure the wrapper's **`max-width`** is `100%` so it never forces the
   page to scroll.
2. Add `-webkit-overflow-scrolling: touch` for iOS momentum scrolling.
3. Add a subtle right-edge fade (optional polish) to hint scrollability.

**Rationale**:
- The base structure is correct; this is just tightening. No refactor
  needed.
- Momentum scrolling is the one iOS-specific polish item worth adding
  because it materially improves the feel on audience phones.

**Alternatives considered**:

| Option | Why rejected |
|--------|--------------|
| Collapse the hex viewer into a vertical "per-row" card layout on phones | Destroys the mental model of a hex dump (rows are the point). |
| Reduce font-size of hex below 10 px to fit without scrolling | Fails SC-006 / accessibility. |

---

## Summary

| Item | Decision |
|------|----------|
| Breakpoint scale | `sm 640 / md 768 / lg 1024 / xl 1280` (Tailwind-aligned) |
| Source of truth | `variables.css` for tokens + mirrored pixel values in `layout.css` media queries with comment header |
| Touch targets | 44×44 via `@media (pointer: coarse)` scoped to `.btn` and `.form-control` |
| Catalog grid | 1 / 2 / 3 columns at 0 / 640 / 1024 px |
| Presenter grid | 1 / 2 columns at 0 / 768 px |
| Typography scaling | `clamp()` on `--font-size-2xl` and `--font-size-hero` only |
| Wide content | Existing horizontal-scroll wrappers, tightened and given iOS momentum |

Ready for Phase 1.

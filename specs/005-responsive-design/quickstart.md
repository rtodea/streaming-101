# Quickstart: Verify Responsive Design

**Feature**: 005-responsive-design
**Date**: 2026-04-10
**Audience**: Anyone validating that the responsive design pass works.

This guide shows how to verify every success criterion (SC-001 … SC-008)
from `spec.md` in under ten minutes using Chrome DevTools and, for the
final smoke test, a real phone via the app's own QR code.

---

## Prerequisites

1. The dev stack is running:
   ```bash
   docker compose up --build
   ```
   Frontend: `http://localhost:5173`
   Backend: `http://localhost:3000`

2. At least one video has been uploaded via the Presenter dashboard so
   the catalog is non-empty (otherwise the catalog-reflow check is
   trivial).

3. You have Chrome (or any Chromium-based browser) with DevTools.

---

## Part 1 — DevTools device emulation (6 viewports)

Open `http://localhost:5173`, then press **F12** → click the **Toggle
device toolbar** icon (Ctrl+Shift+M) → choose **Responsive** mode.

For each viewport width below, set the width manually in the top bar
and walk through the checklist.

### Viewport matrix

| Width | Purpose | Pages to visit |
|-------|---------|----------------|
| **320 px** | Smallest supported (iPhone SE 1st gen) | QRLanding, Catalog, Player, Presenter |
| **375 px** | Modern phone portrait | QRLanding, Catalog, Player, Presenter |
| **414 px** | Large phone (iPhone Pro Max) | Catalog, Player |
| **768 px** | Tablet portrait (breakpoint boundary) | Catalog, Presenter |
| **1024 px** | Tablet landscape / small laptop | Catalog, Presenter |
| **1440 px** | Desktop | Catalog, Presenter |

### Per-viewport checklist

At each width, visit each listed page and confirm:

- [ ] **SC-001** — No horizontal page-level scrollbar appears at the
  window edge. (DevTools shows the document width equals the viewport
  width exactly.)
- [ ] **SC-006** — Body text looks readable without manual zoom. Right-
  click any paragraph → Inspect → computed `font-size` is ≥ 14 px.
- [ ] Images, video elements, and QR codes fit inside their card/parent
  and do not overflow (**FR-011**).

### Page-specific checks

#### QR Landing (`/`)

- [ ] At 320 px, the hero title shrinks but never wraps off-screen.
  Inspect the h1 → computed `font-size` should be within the `clamp()`
  bounds (27–40 px for `--font-size-2xl-fluid`, or 40–64 px if the
  landing uses `--font-size-hero-fluid`).
- [ ] The "View Videos" button is at least 44 px tall (SC-005). Right-
  click → Inspect → check computed `min-height`.

#### Catalog (`/catalog`)

- [ ] At 320–639 px: exactly **one** card per row (**SC-003**).
- [ ] At 640–1023 px: exactly **two** cards per row.
- [ ] At 1024 px and up: exactly **three** cards per row.
- [ ] Video card thumbnails keep their aspect ratio at all widths.

#### Player (`/player/<id>`)

- [ ] The video element width matches the container width (no
  horizontal overflow).
- [ ] `PlayerControls` (quality select, bandwidth badge, buffer badge)
  wrap onto multiple lines at ≤ 375 px rather than clipping off-screen
  (**FR-004**, **SC-001**).
- [ ] At ≤ 375 px, the page header (title + stream indicator) is either
  stacked or wrapped — not truncated.

#### Presenter (`/presenter`)

- [ ] At **375 px**: all six sections (Upload, Live Camera, QR,
  Videos, Byte Inspector, Live Stats) stack vertically in a single
  column, form controls span the full width, and the hex viewer table
  scrolls horizontally **within its wrapper** (not the page).
- [ ] At **768 px**: the two-column `.grid-2` layout is active and
  every section is fully visible (**SC-004**).
- [ ] At **1024 px**: still two-column, gutters look correct.
- [ ] Segment-duration slider and quality selector have tap targets
  ≥ 44 × 44 on touch emulation (**SC-005**).
- [ ] The stats table inside `StatsPanel` scrolls horizontally inside
  its own wrapper and never pushes the page wider (**SC-007**).

---

## Part 2 — Touch pointer emulation

DevTools device toolbar → **More options** (three-dot menu) → **Show
media queries** → enable **Touch**. This makes `@media (pointer:
coarse)` match.

Confirm:

- [ ] `.btn` and `.form-control` computed `min-height` is 44 px.
- [ ] `.btn--icon` (prev/next in HexViewer, delete overlay on
  VideoCard) computed `min-height` stays at 28 px — the documented
  exception.
- [ ] On the presenter dashboard with touch enabled, buttons feel
  finger-sized.

---

## Part 3 — Real phone smoke test (highest-fidelity check)

This is the demo's actual use case and the only test that catches iOS
Safari bugs that DevTools cannot simulate.

1. Ensure your phone and laptop are on the same Wi-Fi.
2. From the Presenter dashboard on your laptop, scan the QR code with
   your phone's camera app. Tap the notification to open the URL.
3. On the phone, walk through:
   - [ ] QR landing → "View Videos" tap target feels comfortable and
     reaches the catalog without zoom.
   - [ ] Catalog shows one card per row, tap a card.
   - [ ] Player loads, video auto-plays or plays on tap, controls are
     reachable, quality selector opens and closes without clipping.
   - [ ] Rotate to landscape — layout reflows, no content lost.
   - [ ] (iOS only) Swipe horizontally inside the hex viewer wrapper on
     the presenter page — momentum scrolling should feel natural thanks
     to `-webkit-overflow-scrolling: touch`.

---

## Part 4 — Token source-of-truth audit (SC-008)

Purely a code-reading check:

- [ ] `client/src/styles/variables.css` contains the four `--bp-*`
  tokens under `:root`.
- [ ] `client/src/styles/layout.css` has the required comment header
  (see `contracts/breakpoints.md` Appendix A) above any `@media (min-
  width: …)` rule.
- [ ] Grep for hardcoded pixel breakpoint values outside the token file
  and `layout.css`:
  ```bash
  grep -rnE '@media[^)]*(min|max)-width:\s*(640|768|1024|1280)' \
    client/src client/notes | grep -v layout.css
  ```
  Any matches MUST have the comment-header reference. No component
  should define a bespoke breakpoint value.

---

## Acceptance

Feature 005 is "done" when every checkbox above is ticked on at least
one verifier's pass AND the smoke test on a real phone (Part 3) passes.

If any checkbox fails, file the failure against the corresponding
FR-/SC-number from `spec.md` and iterate on `layout.css` or the
offending component before resuming demo prep.

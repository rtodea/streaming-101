# Quickstart: Typography and Design System Refinement

## Test Scenario 1: Typography Applied Everywhere

1. Start the stack: `docker compose up`
2. Open `http://localhost:5173/` (QR landing page)
3. Verify the "Streaming 101" title and "View Videos" button use **Inter** (not system default)
4. Open DevTools → Computed tab, inspect any `<h1>` or `<body>` — the `font-family` should resolve to `Inter, ...`
5. Navigate to `/presenter`, `/catalog`, and `/player/<id>`
6. Confirm all four pages consistently use Inter for UI text

## Test Scenario 2: Monospace Font in Hex Viewer

1. Open `/presenter` and upload a small video
2. Open the Byte Inspector, select any file (original, manifest, segment)
3. Verify the hex dump and ASCII column use **JetBrains Mono**
4. In DevTools, inspect the hex viewer `<pre>` — `font-family` should resolve to `JetBrains Mono, ...`

## Test Scenario 3: Button Variants

1. Navigate to `/presenter`
2. Verify the Upload button is filled black (`.btn--primary`)
3. Verify the Start Live Stream button is filled black; when streaming, the Stop button is red-outlined (`.btn--danger`)
4. Hover over each button — a visible hover state appears within 100ms
5. Tab through the dashboard with the keyboard — each button shows a focus ring on `:focus-visible`
6. On a video card, the delete button should be red-outlined icon-style (`.btn--danger.btn--icon`)

## Test Scenario 4: Form Controls

1. On `/presenter`, verify the segment duration slider has consistent styling (not raw browser default)
2. On the Player page, verify the quality dropdown uses `.form-control` styling matching the buttons
3. Open the Byte Inspector — both `<select>` dropdowns should match the quality dropdown visually

## Test Scenario 5: Font Fallback (Offline Mode)

1. Open DevTools → Network tab → disable cache and block requests matching `*.woff2`
2. Reload any page
3. Verify text is still readable — fonts fall back to system stack without layout shift
4. No `FOUT` lasting longer than 200ms should be visible

## Test Scenario 6: Design Token Change Propagation

1. Edit `client/src/styles/variables.css`
2. Change `--font-family-sans` to a different font (e.g., `Courier New`)
3. Save the file — Vite HMR refreshes all pages
4. Confirm every page picks up the new font without any component file being touched

## Demo Script

During the presentation:
1. Open the Presenter dashboard — audience sees the clean Inter typography
2. Zoom into the hex viewer to show the JetBrains Mono monospace
3. Hover over buttons to show the consistent hover and focus states
4. Open DevTools to show a single `variables.css` file controlling the entire look

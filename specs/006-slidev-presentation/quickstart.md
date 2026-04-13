# Quickstart: Slidev Presentation Slides

## Prerequisites

- Node.js 18+
- The main application running (for `/slides` integration test)

## 1. Install & Dev Server

```bash
cd slides/slidev
npm install
npx slidev          # Opens http://localhost:3030
```

Hot-reload is automatic — edit `slides.md` and see changes instantly.

## 2. Build for Production

```bash
cd slides/slidev
npx slidev build --base /slides/ --out dist
```

The built assets land in `slides/slidev/dist/` and are served by the NestJS server at `/slides`.

## 3. Verify Integration

### 3.1 Slides load at /slides

1. Build the slides (step 2 above)
2. Start the main app: `docker compose up` (or run the server locally)
3. Navigate to `http://localhost:3000/slides`
4. **Expected**: Slide deck loads, first slide visible

### 3.2 No route conflicts

1. With the app running, navigate to `http://localhost:3000/presenter`
2. **Expected**: Presenter dashboard loads normally
3. Navigate to `http://localhost:3000/catalog`
4. **Expected**: Video catalog loads normally

### 3.3 Navigation works

1. Open `/slides` in browser
2. Press right arrow 20+ times
3. **Expected**: Slides advance, including v-click reveal steps
4. Press left arrow 5 times
5. **Expected**: Slides go back, v-click steps reverse

### 3.4 MermaidReveal progressive reveal

1. Navigate to a slide containing `<MermaidReveal>`
2. **Expected**: Diagram visible but all interactions hidden
3. Press NEXT repeatedly
4. **Expected**: Each press reveals exactly one interaction (arrow + label)
5. Press PREVIOUS
6. **Expected**: Last revealed interaction hides
7. After all interactions revealed, press NEXT
8. **Expected**: Advances to next slide

### 3.5 Custom layouts render

1. Navigate to the opening slide (cover-image layout)
2. **Expected**: Image on left 50%, title on right
3. Navigate to a pros/cons slide
4. **Expected**: Two columns, items appear one-by-one on NEXT
5. Navigate to a demo-break slide
6. **Expected**: Inverted colors, distinct from content slides
7. Navigate to a full-image slide
8. **Expected**: Image fills entire slide, no padding
9. Navigate to a quote slide
10. **Expected**: Quote centered, attribution below

### 3.6 Font configuration

1. Open `slides/slidev/slides.md` headmatter
2. Change `fonts.sans` from `Inter` to `Georgia`
3. Run dev server
4. **Expected**: All body text uses Georgia
5. Revert to `Inter`

### 3.7 Offline capability

1. Build the slides
2. Disconnect from internet
3. Start the server and navigate to `/slides`
4. **Expected**: Slides load correctly (all fonts/assets self-hosted)

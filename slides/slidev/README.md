# Streaming 101 — Slidev Presentation

A [Slidev](https://sli.dev) presentation for the "Streaming 101" timjs meetup talk.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server with hot-reload (http://localhost:3030)
npm run dev

# Build for production (output in dist/)
npm run build
```

The built slides are served by the main NestJS app at `/slides`.

## Slide Basics

All slides live in **`slides.md`** — a single Markdown file. Slides are separated by `---` on its own line.

### Frontmatter

Each slide can have YAML frontmatter:

```md
---
layout: cover-image
image: /images/my-photo.png
clicks: 5
---

# Slide Title

Content here...
```

### Navigation

| Key | Action |
|-----|--------|
| → / Space / Click | Next slide or reveal step |
| ← / Backspace | Previous slide or reveal step |
| `o` | Toggle overview mode |
| `d` | Toggle dark mode |
| `f` | Toggle fullscreen |

### Progressive Reveals

**`<v-clicks>`** (plural) — automatically reveals each child element on NEXT. Best for lists:

```md
<v-clicks>

- First item (appears on click 1)
- Second item (appears on click 2)
- Third item (appears on click 3)

</v-clicks>
```

**`<v-click>`** (singular) — reveals a single block on NEXT. Best for standalone content (tables, quotes, formulas):

```md
<v-click>

| Col A | Col B |
|-------|-------|
| data  | data  |

</v-click>
```

You can mix both in the same slide — `<v-clicks>` for lists, `<v-click>` for everything else.

## Custom Layouts

Use a custom layout via `layout:` in frontmatter. Available layouts:

### `cover-image` — Opening slide

Image on left (50%), content on right.

```md
---
layout: cover-image
image: /images/cover-placeholder.svg
---

# Title
### Subtitle
```

**To replace the cover image**: swap the file at `public/images/cover-placeholder.svg` (or change the `image` prop).

### `pros-cons` — Two-column comparison

Items appear one at a time on NEXT.

```md
---
layout: pros-cons
---

::pros::

1. Fast hot-reload
2. Vue components in slides
3. Markdown-native

::cons::

1. Requires Node.js
2. Vue-only ecosystem
3. No native PPT export
```

### `quote` — Centered quotation

```md
---
layout: quote
author: Douglas Adams
source: The Hitchhiker's Guide
---

Time is an illusion. Lunchtime doubly so.
```

### `full-image` — Full-screen image

Perfect for website screenshots. No padding, no chrome.

```md
---
layout: full-image
image: /images/screenshot.png
alt: Description of the screenshot
---
```

### `url-reference` — Documentation links

```md
---
layout: url-reference
---

# Further Reading

- **[Link Title](https://...)** — Description
- **[Another Link](https://...)** — Description
```

### `next-adventure` — Further exploration

```md
---
layout: next-adventure
---

# Choose Your Next Adventure

- **Topic A** — Brief description
- **Topic B** — Brief description
```

### `demo-break` — Switch to live app

Inverted colors (black bg) to visually break from content slides.

```md
---
layout: demo-break
title: Upload Demo
url: /presenter
---
```

## MermaidReveal Component

Progressive reveal of MermaidJS diagrams — each NEXT press shows one more interaction.

```md
---
clicks: 5
---

# Diagram Title

<MermaidReveal :diagram="`
sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello
    B-->>A: Hi there
    A->>B: How are you?
    B-->>A: Great!
    A->>B: Bye
`" />
```

**Important**: Set `clicks` in frontmatter to match the number of arrows in your diagram.

### How steps are detected

- **Sequence diagrams**: Each arrow (`->>`, `-->`, `->`) = 1 step
- **Flowcharts**: Each node + each edge = 1 step each

Override with the `steps` prop: `<MermaidReveal :diagram="..." :steps="3" />`

## Font Configuration

Fonts are controlled in **two places**:

### 1. Headmatter in `slides.md`

```yaml
fonts:
  sans: Inter          # Body text font
  mono: JetBrains Mono # Code font
  local: Inter, JetBrains Mono  # Prevent CDN loading
```

### 2. `@font-face` in `style.css`

```css
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Variable.woff2') format('woff2');
  /* ... */
}
```

**To swap fonts**:
1. Place your `.woff2` files in `public/fonts/`
2. Update the `@font-face` declarations in `style.css`
3. Update the `fonts` section in `slides.md` headmatter

## Adding Images

Place images in `public/images/`. Reference them in slides as `/images/filename.png`.

## Building for Production

```bash
npm run build
```

This runs `slidev build --base /slides/ --out dist`, producing static files in `dist/` with all asset paths prefixed with `/slides/`.

The NestJS server serves this directory at `/slides` via `@nestjs/serve-static`.

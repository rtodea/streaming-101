# Layout Contracts: Slidev Presentation Slides

**Version**: 1.0  
**Consumer**: Slide authors (markdown frontmatter + slot sugar)

## Contract Format

Each layout is a Vue SFC in `slides/slidev/layouts/`. Slide authors interact with layouts via frontmatter (`layout:` key) and slot sugar (`::slotname::` separators).

---

## 1. cover-image

**Purpose**: Opening slide — image on left (50%), title and subtitle on right.

**Frontmatter props**:

| Prop  | Type   | Required | Description                          |
|-------|--------|----------|--------------------------------------|
| image | string | yes      | Path to image (relative to `public/`) |

**Slots**: `default` (title + subtitle content on the right side)

**Usage**:
```md
---
layout: cover-image
image: /images/cover-placeholder.svg
---

# Streaming 101
### From Pixels to Packets in JavaScript
```

**Visual contract**: Left 50% shows the image (object-fit: cover, full height). Right 50% vertically centers the default slot content.

---

## 2. pros-cons

**Purpose**: Two-column comparison with numbered items that appear on successive NEXT events.

**Frontmatter props**: none

**Slots**: `pros`, `cons`

**Usage**:
```md
---
layout: pros-cons
---

::pros::

1. Simple setup
2. Fast hot-reload
3. Vue components in slides

::cons::

1. Requires Node.js
2. Vue-only ecosystem
3. No native PPT export
```

**Visual contract**: Two equal columns. Left column headed "Pros" (or first `<h3>` in slot). Right column headed "Cons". Each `<li>` is wrapped in `v-click` so items appear one at a time on NEXT.

---

## 3. quote

**Purpose**: Centered quotation with attribution.

**Frontmatter props**:

| Prop   | Type   | Required | Description        |
|--------|--------|----------|--------------------|
| author | string | yes      | Quote attribution  |
| source | string | no       | Source (book, talk) |

**Slots**: `default` (the quote text)

**Usage**:
```md
---
layout: quote
author: Douglas Adams
source: The Hitchhiker's Guide to the Galaxy
---

Time is an illusion. Lunchtime doubly so.
```

**Visual contract**: Quote text centered, large italic font. Author and source below in smaller muted text. Generous vertical padding.

---

## 4. full-image

**Purpose**: Full-bleed image filling the entire slide (for website screenshots).

**Frontmatter props**:

| Prop  | Type   | Required | Description                          |
|-------|--------|----------|--------------------------------------|
| image | string | yes      | Path to image (relative to `public/`) |
| alt   | string | no       | Alt text for accessibility           |

**Slots**: none

**Usage**:
```md
---
layout: full-image
image: /images/youtube-network-tab.png
alt: Chrome DevTools showing HLS chunk requests
---
```

**Visual contract**: Image fills entire slide area (object-fit: contain on white background). No padding, no title bar, no slide chrome.

---

## 5. url-reference

**Purpose**: Display documentation links with titles and brief descriptions.

**Frontmatter props**: none

**Slots**: `default` (markdown list of links with descriptions)

**Usage**:
```md
---
layout: url-reference
---

# Further Reading

- **[HLS Specification](https://datatracker.ietf.org/doc/html/rfc8216)** — The RFC behind HTTP Live Streaming
- **[hls.js Documentation](https://github.com/video-dev/hls.js)** — The player library we use
- **[FFmpeg Wiki](https://trac.ffmpeg.org/wiki)** — Transcoding reference
```

**Visual contract**: Links displayed as a styled list with title (bold, linked) and description (muted text below). Generous spacing between items.

---

## 6. next-adventure

**Purpose**: "Choose your next adventure" — topic cards for further exploration.

**Frontmatter props**: none

**Slots**: `default` (markdown content with topic cards)

**Usage**:
```md
---
layout: next-adventure
---

# Choose Your Next Adventure

- **WebRTC** — Real-time peer-to-peer streaming
- **DASH** — The MPEG alternative to HLS
- **AV1** — Next-gen codec (better than H.265, royalty-free)
- **WebTransport** — HTTP/3 based low-latency streaming
```

**Visual contract**: Title centered at top. Topics displayed as card-like items in a grid or vertical list. Each item has a bold title and a short description.

---

## 7. demo-break

**Purpose**: Visually distinct transition slide reminding the presenter to switch to the live app.

**Frontmatter props**:

| Prop  | Type   | Required | Description                              |
|-------|--------|----------|------------------------------------------|
| title | string | no       | Demo title (default: "Live Demo")        |
| url   | string | no       | URL to show (e.g., `/presenter`)         |

**Slots**: none

**Usage**:
```md
---
layout: demo-break
title: VOD Upload & Transcode
url: /presenter
---
```

**Visual contract**: Inverted colors (black background, white text) to visually break from content slides. Large centered title. URL displayed below in monospace. A "switch to app" icon or arrow indicator.

---

## MermaidReveal Component Contract

**Purpose**: Progressive reveal of MermaidJS diagrams.

**Props**:

| Prop    | Type   | Required | Description                              |
|---------|--------|----------|------------------------------------------|
| diagram | string | yes      | Mermaid diagram source code              |
| steps   | number | no       | Override auto-detected step count        |

**Usage in slides**:
```md
---
clicks: 5
---

<MermaidReveal :diagram="`
sequenceDiagram
  participant C as Creator
  participant API as NestJS API
  participant T as FFmpeg
  participant S as Storage
  C->>API: Upload raw video
  API->>S: Store original file
  API->>T: Trigger transcoding
  T->>S: Store HLS chunks
  T->>API: Job complete
`" />
```

**Behavior contract**:
- On slide load: diagram renders but all interactions are hidden
- Each NEXT press reveals one interaction (arrow + label + participant activation)
- PREVIOUS hides the last revealed interaction
- After all interactions are revealed, the next NEXT advances to the next slide
- The component auto-detects the number of steps from the diagram source (counts `->>`, `-->`, `->` arrows for sequence diagrams; edges for flowcharts)
- The `clicks` frontmatter value should match the number of diagram steps

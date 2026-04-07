<!--
Sync Impact Report
===================
Version change: 1.4.1 → 1.5.0 (MINOR — new principle added)
Modified principles: none
Added sections:
  - Principle IX. Component-Driven UI & Typography
Removed sections: none
Templates requiring updates:
  - .specify/templates/plan-template.md — ✅ no updates needed
  - .specify/templates/spec-template.md — ✅ no updates needed
  - .specify/templates/tasks-template.md — ✅ no updates needed
  - .specify/templates/checklist-template.md — ✅ no updates needed
  - .specify/templates/agent-file-template.md — ✅ no updates needed
  - .specify/templates/commands/ — no command files present
Follow-up TODOs: none
-->

# Streaming 101 Constitution

## Core Principles

### I. Demo-First

Every feature MUST be demonstrable in a live meetup setting within
a 45-minute window. Code that cannot be shown, explained, or
interacted with by the audience is out of scope. Prioritize
visual impact and "aha moments" over production-grade robustness.

**Rationale**: This is a timjs meetup presentation, not a
production system. The audience learns by seeing things work
(and break) in real time.

### II. Streaming Correctness

All video pipeline stages (ingest, transcode, chunk, manifest,
playback) MUST use industry-standard protocols and formats:
HLS for delivery, RTMP for ingest, FFmpeg for transcoding.
Shortcuts that produce technically incorrect streaming behavior
(e.g., missing keyframe alignment, broken manifests) are
forbidden even in demo code.

**Rationale**: The presentation teaches how streaming actually
works. Incorrect implementations would teach the wrong mental
model.

### III. Audience Interactivity

The system MUST support real-time audience participation:
QR-code access from mobile devices, live bandwidth/quality
stats via WebSockets, and presenter controls to tweak
parameters (segment size, quality levels) during the demo.

**Rationale**: The two "wow factors" — live stats dashboard
and bandwidth degradation demo — are the presentation's
core differentiators.

### IV. Simplicity & Time Budget

Start with the simplest working implementation. YAGNI applies
aggressively: no auth, no user accounts, no persistent database
unless a demo scenario requires it. Each feature MUST justify
its inclusion against the 45-minute time budget. If a feature
cannot be explained in under 2 minutes, it is too complex.

**Rationale**: A 30-minute talk with 15 minutes of Q&A leaves
no room for accidental complexity.

### V. Observability & Live Stats

All streaming pipeline stages MUST emit structured logs or
real-time metrics that can be displayed on the presenter
dashboard. Text I/O and WebSocket events are the primary
debugging and demonstration tools.

- **Live stats are a deliverable, not a nice-to-have**: The
  presenter dashboard MUST display real-time viewer count,
  per-viewer bandwidth, current quality level, and chunk
  request rates. These stats are a core demo artifact shown
  to the audience — they MUST work reliably on stage.
- **Every service MUST expose metrics via WebSocket events**:
  The NestJS backend MUST aggregate and broadcast stats from
  all connected viewers. The FFmpeg transcoder MUST emit
  progress events (frames encoded, current bitrate, segment
  completion). The HLS player MUST report playback metrics
  (buffer level, quality switches, download speed) back to
  the WebSocket hub.
- **Stats MUST be visually obvious**: Metrics displayed on the
  presenter dashboard MUST update in real time (sub-second for
  viewer counts, per-chunk for quality/bandwidth). Use charts
  or gauges that the back row of the meetup room can read.
- **Stats drive the "wow factors"**: When audience members
  cover their phones (bandwidth degradation demo), the
  dashboard MUST visibly reflect quality downgrades within
  seconds. When the presenter tweaks HLS segment size, the
  latency change MUST be observable on the dashboard.

**Rationale**: Making the invisible visible (bitrate switches,
chunk requests, transcoding progress) is the educational core
of the presentation. The live stats dashboard is what turns
a lecture into an interactive experience — it MUST be treated
as a first-class feature, not an afterthought.

### VI. Lean & Clean Code

Code MUST be as lean as possible so it can be read and
explained on stage. Apply Uncle Bob's Clean Code principles:
small functions with clear names, single responsibility, no
dead code, no premature abstractions.

- **Favor functional over OOP**: Use pure functions, composition,
  and higher-order functions. Avoid classes unless the framework
  (e.g., NestJS decorators) requires them. No inheritance
  hierarchies, no abstract base classes, no design-pattern
  gymnastics.
- **Stay true to JavaScript**: Use plain JS idioms — arrow
  functions, destructuring, template literals, Promises/async-
  await, array methods (map/filter/reduce). No TypeScript unless
  a dependency demands it. No transpiler-heavy syntax that
  obscures what the code actually does.
- **Nothing too fancy**: No monads, no point-free pipelines, no
  FP libraries (Ramda, fp-ts). If a junior JS developer cannot
  read the code in 30 seconds, it is too clever.
- **Showcase-ready**: Every module MUST be short enough to fit
  on a single slide or terminal screen (~40 lines max). If it
  does not fit, split it.

**Rationale**: The audience is JavaScript developers at a
meetup. The code itself is part of the presentation — it MUST
be immediately readable without explanation of exotic patterns
or type-system machinery.

### VII. Container-Per-Service

Every piece of software in this project MUST have its own
Dockerfile and be independently containerizable. Services
MUST be composable via a root `docker-compose.yml` that
brings the full stack up locally without requiring k3s or
any Kubernetes tooling.

- **Own Dockerfile**: Each service (NextJS frontend, NestJS
  backend, FFmpeg transcoder) MUST have a dedicated Dockerfile
  at its own directory root.
- **Docker Compose as dev baseline**: A `docker-compose.yml`
  at the repo root MUST define all services, volumes, and
  networks needed to run the complete demo stack. Running
  `docker compose up` MUST be sufficient to test any iteration
  locally.
- **k3s is production-only**: Kubernetes manifests are for the
  final deployment to tadeo.ro / todea.eu. All development and
  iteration testing MUST work via Docker Compose first. Do NOT
  require k3s to verify changes.
- **Parity**: The Docker Compose environment MUST mirror the
  k3s deployment in terms of service topology (same ports,
  same environment variables, same volume mounts) so that
  anything working locally works on the cluster.

**Rationale**: Iterating against a full k3s cluster is slow
and fragile. Docker Compose gives fast, reproducible local
testing while keeping each service independently buildable
and deployable.

### VIII. Decision Documentation

Every non-trivial implementation decision MUST be documented
in the `notes/` directory so that other developers and coding
agents can understand the reasoning without archeology.

- **When to write a note**: Any time a decision involves
  choosing between alternatives (framework A vs B, protocol
  X vs Y, architecture trade-off), the chosen option and the
  rejected alternatives MUST be recorded with pros, cons, and
  the deciding factor.
- **Where**: The `notes/` directory at the repo root. One file
  per topic (e.g., `notes/framework-choice.md`,
  `notes/hls-vs-dash.md`). Use descriptive filenames.
- **What to include**: Problem statement, options considered,
  pros/cons for each, final decision and why. Keep it concise
  — a few bullet points per option, not an essay.
- **Implementation details**: When a piece of the system has
  non-obvious wiring, configuration, or behavior, document it
  in `notes/` rather than burying it in code comments. Link
  from code comments to the relevant note if needed.
- **Visualize with MermaidJS**: Notes MUST include MermaidJS
  diagrams wherever a flow, sequence, or relationship exists.
  Prefer sequence diagrams for request/response and pipeline
  flows. Use flowcharts (`graph TD/LR`) for architecture and
  decision trees. Use other diagram types (state, class,
  Gantt) when they fit. Text explanations alone are not
  enough when a diagram would clarify.
- **Agent-readable**: Notes MUST be written in plain Markdown
  with clear headings and inline MermaidJS blocks so that
  coding agents (Claude, Copilot, etc.) can parse them for
  context. Avoid screenshots or images as the sole source of
  information — use MermaidJS instead.

**Rationale**: This project is built iteratively with AI
coding agents alongside human developers. Decisions made in
one session are invisible in the next unless written down.
The `notes/` directory is the shared memory that keeps
everyone — human and agent — aligned.

### IX. Component-Driven UI & Typography

All UI work — regardless of framework — MUST follow
component-driven design with a clear smart/dumb split.
Styling MUST be typography-first, black-and-white by default,
and easily tweakable.

- **Smart vs dumb components**: Dumb (presentational)
  components MUST be pure: they receive props and render UI.
  No data fetching, no side effects, no WebSocket connections
  inside them. Smart (container) components own the data —
  they fetch, subscribe, and pass results down as props. This
  split MUST be enforced even if it feels like overkill for a
  demo; it keeps the code readable and swappable.
- **Framework-agnostic mindset**: The component split applies
  whether using React (NextJS), Vue, or plain DOM. If the
  framework changes, the presentational components MUST be
  portable with minimal rewiring.
- **Typography-first styling**: Default to a black-and-white
  palette with strong typographic hierarchy — large headings,
  clear body text, generous whitespace. Color MUST be used
  sparingly and only for semantic meaning (e.g., red for
  errors, green for healthy stats, accent for interactive
  elements).
- **CSS custom properties for theming**: All colors, font
  sizes, spacing values, and border radii MUST be defined as
  CSS custom properties (variables) in a single root file.
  Tweaking the visual feel MUST require changing only variable
  values, not hunting through component styles.
- **No CSS frameworks unless justified**: Prefer plain CSS
  with custom properties over Tailwind, Bootstrap, or similar.
  If a CSS framework is used, it MUST be documented in
  `notes/` with the rationale and a decision note per
  Principle VIII.

**Rationale**: The demo runs on a projector and on audience
phones. High-contrast, typographic design is readable in both
contexts. The smart/dumb split keeps UI code demo-friendly —
you can show a presentational component in isolation without
explaining data plumbing. CSS variables make last-minute
visual tweaks trivial.

## Presentation Constraints

- **Stack**: NextJS (frontend), NestJS (backend API +
  WebSockets), FFmpeg (transcoding), k3s (deployment on
  tadeo.ro / todea.eu).
- **Protocols**: HLS for delivery, RTMP for live ingest,
  WebSockets (Socket.io) for real-time stats.
- **Player**: hls.js in the browser for ABR playback.
- **Audience access**: QR code to a mobile-friendly viewer page.
- **Local dev**: Docker Compose at the repo root for iteration
  and testing. k3s is deployment-only.
- **No external service dependencies** beyond what runs in the
  Docker Compose stack (or k3s cluster on deploy). The demo
  MUST work without internet if the audience is on a local
  network.
- **Fallback plan**: Pre-recorded segments and cached HLS
  manifests MUST exist so the demo can proceed even if live
  transcoding fails on stage.

## Development Workflow

- **Slide tooling**: Slidev (primary) or Marp (fallback) for
  Markdown-to-slides conversion.
- **Commit discipline**: Small, working increments. Each commit
  SHOULD leave the demo in a runnable state.
- **Local testing**: `docker compose up` for iteration testing.
  Manual integration testing against the running containers.
  Automated tests are welcome but not mandatory given the demo
  nature of the project.
- **Deployment**: k3s manifests MUST be version-controlled.
  A single `make deploy` or equivalent script MUST bring the
  full stack up on the cluster. Locally, `docker compose up`
  is the equivalent.

## Governance

This constitution is the authoritative guide for all design
and scope decisions in the Streaming 101 project. When in
doubt, refer back to these principles.

- **Amendments** require updating this file, incrementing the
  version, and recording the change in the Sync Impact Report
  comment block at the top of this document.
- **Versioning** follows semantic versioning: MAJOR for
  principle removals/redefinitions, MINOR for new principles
  or material expansions, PATCH for clarifications and wording.
- **Compliance** is checked during plan creation via the
  Constitution Check gate in plan-template.md.

**Version**: 1.5.0 | **Ratified**: 2026-04-06 | **Last Amended**: 2026-04-07

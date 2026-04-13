# Data Model: Typography and Design System Refinement

This feature introduces no runtime data entities. The "entities" from the spec are design-time artifacts: CSS custom properties and class names. They are captured here for traceability.

## Design Token (CSS Custom Property)

Named visual property defined once in `client/src/styles/variables.css` and referenced by components.

| Category | Token | Example value |
|----------|-------|---------------|
| Font family | `--font-family-sans` | `"Inter", system-ui, sans-serif` |
| Font family | `--font-family-mono` | `"JetBrains Mono", ui-monospace, monospace` |
| Font size | `--font-size-xs` .. `--font-size-hero` | 0.75rem .. 4rem |
| Font weight | `--font-weight-regular` / `--font-weight-medium` / `--font-weight-semibold` / `--font-weight-bold` | 400 / 500 / 600 / 700 |
| Line height | `--line-height-tight` / `--line-height-normal` / `--line-height-relaxed` | 1.2 / 1.5 / 1.7 |
| Color | `--color-bg` / `--color-text` / `--color-muted` / `--color-border` / `--color-surface` / `--color-accent` / `--color-error` / `--color-success` / `--color-live` | (unchanged from current) |
| Spacing | `--space-xs` .. `--space-2xl` | (unchanged from current) |
| Radius | `--radius-sm` / `--radius-md` / `--radius-lg` | (unchanged from current) |
| Transition | `--transition-fast` / `--transition-normal` | 150ms / 300ms ease |
| Shadow | `--shadow-focus` | `0 0 0 3px rgba(0,0,0,0.15)` |

## Button Variant

Named class preset in `client/src/styles/buttons.css`.

| Class | Purpose | Visual |
|-------|---------|--------|
| `.btn` | Base button (never used alone) | shared padding, radius, font, transition |
| `.btn--primary` | Main actions (Upload, Start Camera, View Videos) | filled black, white text, hover = slightly lifted |
| `.btn--ghost` | Secondary / pagination | transparent bg, black border, hover = light surface fill |
| `.btn--danger` | Destructive (Delete, Stop) | transparent bg, red border + red text, hover = red fill |
| `.btn--icon` | Compact icon button | small square, subtle hover |
| `.btn:disabled` | Disabled state | opacity 0.4, cursor not-allowed |
| `.btn:focus-visible` | Keyboard focus | `--shadow-focus` ring |

## Form Control Variant

| Class | Applies to | Visual |
|-------|-----------|--------|
| `.form-control` | `<select>`, `<input type="file">`, `<input type="range">`, `<input type="text">` | same padding/border/radius as buttons, hover and focus states matching |

## Type Style

Semantic combination of tokens applied via element selectors in `reset.css` / `layout.css`, not as a separate class.

| Role | Element | Tokens used |
|------|---------|-------------|
| Page title | `h1` | `--font-size-xl`, `--font-weight-bold`, `--line-height-tight` |
| Section heading | `h2` | `--font-size-lg`, `--font-weight-semibold`, `--line-height-tight` |
| Body | `body`, `p` | `--font-size-base`, `--font-weight-regular`, `--line-height-normal` |
| Small | `small`, `.text-sm` | `--font-size-sm`, `--font-weight-regular` |
| Label | `label`, `th` | `--font-size-xs`, `--font-weight-medium`, `text-transform: uppercase`, `letter-spacing: 0.05em` |
| Mono | `code`, `pre`, `.mono` | `--font-family-mono`, `--font-size-sm` |

No state transitions. No validation rules beyond CSS type correctness (browser enforces).

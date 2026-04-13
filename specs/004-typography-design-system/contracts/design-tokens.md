# Design Tokens Contract

This is the public contract for the Streaming 101 design system. Any component added to the app MUST consume these tokens rather than hardcoding values.

## Font Families

```css
--font-family-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, Consolas, monospace;
```

Fallback stacks MUST be retained so the app stays readable if font files fail to load (FR-010, SC-007).

## Type Scale

```css
--font-size-xs:   0.75rem;   /* 12px */
--font-size-sm:   0.875rem;  /* 14px */
--font-size-base: 1rem;      /* 16px */
--font-size-lg:   1.25rem;   /* 20px */
--font-size-xl:   1.75rem;   /* 28px */
--font-size-2xl:  2.5rem;    /* 40px */
--font-size-hero: 4rem;      /* 64px */
```

## Weights

```css
--font-weight-regular:  400;
--font-weight-medium:   500;
--font-weight-semibold: 600;
--font-weight-bold:     700;
```

## Line Heights

```css
--line-height-tight:   1.2;
--line-height-normal:  1.5;
--line-height-relaxed: 1.7;
```

## Colors (unchanged — documented here for completeness)

```css
--color-bg:      #ffffff;
--color-text:    #111111;
--color-muted:   #666666;
--color-border:  #dddddd;
--color-surface: #f7f7f7;
--color-accent:  #0066ff;
--color-success: #22aa44;
--color-error:   #dd3333;
--color-live:    #dd3333;
```

## Spacing (unchanged)

```css
--space-xs:  0.25rem;
--space-sm:  0.5rem;
--space-md:  1rem;
--space-lg:  1.5rem;
--space-xl:  2rem;
--space-2xl: 3rem;
```

## Radii (unchanged)

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
```

## Transitions

```css
--transition-fast:   150ms ease;
--transition-normal: 300ms ease;
```

## Focus Ring

```css
--shadow-focus: 0 0 0 3px rgba(0, 0, 0, 0.15);
```

## Button Classes

All buttons in the app MUST use the `.btn` base class plus exactly one variant modifier.

### `.btn` (base)

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  line-height: 1;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color var(--transition-fast), color var(--transition-fast), border-color var(--transition-fast), transform var(--transition-fast);
  user-select: none;
}
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.btn:focus-visible { outline: none; box-shadow: var(--shadow-focus); }
@media (prefers-reduced-motion: reduce) {
  .btn { transition: none; }
}
```

### `.btn--primary`

```css
.btn--primary {
  background: var(--color-text);
  color: var(--color-bg);
  border-color: var(--color-text);
}
.btn--primary:hover:not(:disabled) { transform: translateY(-1px); }
```

### `.btn--ghost`

```css
.btn--ghost {
  background: transparent;
  color: var(--color-text);
  border-color: var(--color-border);
}
.btn--ghost:hover:not(:disabled) {
  background: var(--color-surface);
  border-color: var(--color-text);
}
```

### `.btn--danger`

```css
.btn--danger {
  background: transparent;
  color: var(--color-error);
  border-color: var(--color-error);
}
.btn--danger:hover:not(:disabled) {
  background: var(--color-error);
  color: var(--color-bg);
}
```

### `.btn--icon`

```css
.btn--icon {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-size-xs);
}
```

## Form Control Class

```css
.form-control {
  font-family: var(--font-family-sans);
  font-size: var(--font-size-sm);
  padding: var(--space-sm) var(--space-md);
  background: var(--color-bg);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}
.form-control:hover { border-color: var(--color-text); }
.form-control:focus-visible {
  outline: none;
  border-color: var(--color-text);
  box-shadow: var(--shadow-focus);
}
```

## Consumer Rules

1. **No hardcoded font families** — always reference `--font-family-sans` or `--font-family-mono`
2. **No hardcoded font sizes in rem/px** — always reference a `--font-size-*` token
3. **No hardcoded colors** — always reference a `--color-*` token
4. **Button markup** — use `<button className="btn btn--primary">` (or variant); never style raw `<button>` inline
5. **Form control markup** — apply `className="form-control"` to selects, file inputs, range inputs, text inputs
6. **Breaking changes** — modifying this contract requires updating `notes/design-system.md`

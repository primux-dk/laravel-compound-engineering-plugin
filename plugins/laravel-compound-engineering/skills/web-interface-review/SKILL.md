---
name: web-interface-review
description: This skill should be used when reviewing web UI code for accessibility, performance, and UX compliance. It applies when reviewing React, Vue, HTML/CSS, or any frontend code against web interface best practices including a11y, focus states, forms, animations, and touch interactions.
---

# Web Interface Review

Review web UI code against Vercel's Web Interface Guidelines for accessibility, performance, and UX compliance.

## Quick Start

When asked to review frontend code, analyze files against these categories and report findings grouped by file using `file:line` notation.

```
src/components/Button.tsx:15 - Icon button missing aria-label
src/components/Modal.tsx:42 - Missing overscroll-behavior: contain
```

## Review Checklist

### Accessibility

- [ ] Icon buttons have `aria-label`
- [ ] Form controls have associated labels
- [ ] Interactive elements have keyboard handlers (`onKeyDown`/`onKeyUp`)
- [ ] Semantic HTML used over generic divs
- [ ] Headings follow hierarchical order
- [ ] Skip links present for main content

### Focus States

- [ ] Interactive elements have visible focus: `focus-visible:ring-*` or equivalent
- [ ] No `outline: none` without replacement focus indicator
- [ ] Focus order follows logical reading order

### Forms

- [ ] Inputs have correct `type` attribute
- [ ] Inputs have appropriate `autocomplete` attribute
- [ ] Labels are clickable (using `htmlFor`/`for`)
- [ ] Error messages displayed inline near inputs
- [ ] Submit buttons enabled until request starts (no premature disable)

### Animation

- [ ] `prefers-reduced-motion` honored with reduced variants
- [ ] Animations use only `transform` and `opacity`
- [ ] No `transition: all` (specify properties explicitly)

### Typography

- [ ] Ellipses use `…` not `...`
- [ ] Curly quotes used where appropriate
- [ ] Non-breaking spaces (`&nbsp;`) in appropriate contexts

### Content Handling

- [ ] Text containers handle overflow (`truncate` or `line-clamp`)
- [ ] Empty states have fallback UI
- [ ] Long content doesn't break layouts

### Images

- [ ] Images have explicit `width` and `height`
- [ ] Below-fold images use `loading="lazy"`
- [ ] Alt text provided for meaningful images

### Performance

- [ ] Large lists (>50 items) virtualized
- [ ] No layout reads during render (avoid `getBoundingClientRect` in render)
- [ ] DOM operations batched

### Navigation

- [ ] URLs reflect application state
- [ ] Stateful UI is deep-linkable
- [ ] Destructive actions require confirmation

### Touch

- [ ] Interactive elements use `touch-action: manipulation`
- [ ] Modals use `overscroll-behavior: contain`

### Internationalization

- [ ] Dates use `Intl.DateTimeFormat` not hardcoded formats
- [ ] Numbers use `Intl.NumberFormat` not hardcoded separators

## Anti-Patterns

Flag these issues immediately:

| Pattern | Issue |
|---------|-------|
| `user-scalable=no` | Blocks accessibility zoom |
| `transition: all` | Performance issue, specify properties |
| `outline: none` or `outline-0` | Removes focus indicator without replacement |
| Unlabeled `<input>` | Missing accessible name |
| `<img>` without dimensions | Causes layout shift |
| Hardcoded date formats | Breaks i18n |

## Output Format

Group findings by file with VS Code-compatible line references:

```
## src/components/Button.tsx

- :15 - Icon button missing `aria-label`
- :23 - Using `outline-none` without `focus-visible:ring-*`

## src/components/Modal.tsx

- :42 - Missing `overscroll-behavior: contain` for modal overlay
- :67 - `transition: all` should specify properties explicitly
```

**Severity Levels:**
- **Critical**: Accessibility blockers, broken functionality
- **Warning**: Performance issues, UX problems
- **Info**: Best practice suggestions

State issues concisely. Skip explanation unless non-obvious.

## Guidelines

- Review only the code provided, don't make assumptions about other files
- Use `file:line` notation compatible with VS Code navigation
- Prioritize accessibility issues over style preferences
- Group related issues together
- Provide fix suggestions only when asked

## Reference

For the complete guidelines specification, see [guidelines.md](./references/guidelines.md).

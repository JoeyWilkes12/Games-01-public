# Claude Model Guidelines

This document provides guidance for Claude models working on this codebase.

## Mobile-First Development

This application must be **mobile-compatible**. Follow these principles:

### 1. Mobile-First CSS
Write CSS with mobile as the default baseline, then add desktop overrides:

```css
/* Mobile defaults (base styles) */
.component {
    width: 100%;
    padding: 1rem;
}

/* Desktop overrides */
@media (min-width: 768px) {
    .component {
        width: 50%;
        padding: 2rem;
    }
}
```

### 2. Responsive Breakpoints
Use consistent breakpoints across the application:
- **Mobile**: Default (< 768px)
- **Tablet**: `@media (min-width: 768px)`
- **Desktop**: `@media (min-width: 1024px)`
- **Large Desktop**: `@media (min-width: 1200px)`

### 3. Touch-Friendly Targets
Ensure interactive elements are at least 44x44px on touch devices:

```css
@media (pointer: coarse) {
    .btn {
        min-height: 48px;
        min-width: 48px;
    }
}
```

### 4. Viewport Considerations
- Avoid fixed positioning that may obscure content on small screens
- Test overlapping elements (buttons, modals, fixed elements)
- Ensure scrollable content is accessible

### 5. Testing Requirements
Always test changes in:
1. Mobile viewport (390x844 - iPhone 14 Pro)
2. Tablet viewport (768x1024 - iPad)
3. Desktop viewport (1280x800)

## Code Style

- Use semantic HTML5 elements
- Prefer CSS custom properties (variables) for theming
- Include appropriate ARIA labels for accessibility
- Test with keyboard navigation

## File Organization

- Game-specific CSS should be in `style.css` within each game folder
- Shared styles go in the root `style.css`
- Use descriptive class names following BEM-lite conventions

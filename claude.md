# CLAUDE.md - Mobile-First Development Guidelines

**Mission:** Build responsive, touch-friendly web applications that work flawlessly on mobile devices first, then scale up to desktop.

## 📱 Mobile-First Principles

### 1. Breakpoint Strategy (Mobile → Desktop)
```css
/* Base: Mobile (320px - 767px) */
/* Default styles go here */

/* Tablet: md: (768px+) */
@media (min-width: 768px) { }

/* Desktop: lg: (1024px+) */
@media (min-width: 1024px) { }

/* Large Desktop: xl: (1280px+) */
@media (min-width: 1280px) { }
```

### 2. Touch Target Sizes
- **Minimum touch target**: 44x44px (Apple HIG) / 48x48px (Material Design)
- Use the `.touch-target` utility class for interactive elements
- Ensure adequate spacing between touch targets (8px minimum)

### 3. Responsive Typography
```
Mobile: Base 16px, headings 1.5-2.5rem
Tablet: Base 16px, headings 2-3rem  
Desktop: Base 16px, headings 2.5-4rem
```

## 🎨 Component Design Patterns

### Cards
- Stack vertically on mobile (single column)
- Grid layout on tablet+ (2-3 columns)
- Maximum 4 columns on large desktop

### Navigation
- Bottom navigation or hamburger menu on mobile
- Sidebar or top nav on desktop
- Always accessible within thumb reach on mobile

### Modals
- Full-screen on mobile
- Centered overlay on desktop
- Swipe-to-dismiss support where appropriate

### Forms
- Single column on mobile
- Labels above inputs (not inline)
- Large touch targets for inputs
- Appropriate keyboard types (tel, email, number)

## 📐 Layout Guidelines

### Safe Areas
- Respect device notches and safe area insets
- Use `env(safe-area-inset-*)` for edge-to-edge layouts

### Scroll Behavior
- Native momentum scrolling (`-webkit-overflow-scrolling: touch`)
- Avoid horizontal scroll on mobile
- Pull-to-refresh patterns where applicable

### Content Priority
- Most important content visible without scrolling
- Progressive disclosure for secondary content
- Collapsible sections for complex interfaces

## ⚡ Performance Considerations

### Images
- Use responsive images with srcset
- Lazy loading for below-fold content
- WebP format with fallbacks

### Animations
- Prefer CSS transforms over layout properties
- Use `will-change` sparingly
- Respect `prefers-reduced-motion`

### Bundle Size
- Code split by route
- Lazy load heavy components
- Tree-shake unused code

## 🧪 Testing Checklist

### Viewport Testing
- [ ] iPhone SE (375px)
- [ ] iPhone 14 Pro (390px)
- [ ] iPad (768px)
- [ ] iPad Pro (1024px)
- [ ] Desktop (1280px+)

### Interaction Testing
- [ ] Touch targets accessible
- [ ] Swipe gestures work
- [ ] Keyboard navigation
- [ ] Focus states visible
- [ ] Screen reader compatible

### Performance Testing
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.9s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Largest Contentful Paint < 2.5s

## 🔧 Tailwind CSS Mobile-First Classes

### Common Patterns
```jsx
// Responsive grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"

// Responsive text
className="text-base md:text-lg lg:text-xl"

// Responsive padding
className="p-4 md:p-6 lg:p-8"

// Responsive flex direction
className="flex flex-col md:flex-row"

// Hide/show by breakpoint
className="hidden md:block"  // Hidden on mobile
className="md:hidden"        // Hidden on tablet+
```

## 📋 Commit Conventions

When making mobile-first changes:
```
feat(mobile): add responsive navigation
fix(touch): increase button tap targets
style(responsive): adjust grid for tablet breakpoint
```

## 🚀 Quick Start Commands

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run Playwright tests
npm test

# Run tests with visible browser
npm run test:headed
```

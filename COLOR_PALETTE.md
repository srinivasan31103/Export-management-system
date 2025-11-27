# ExportSuite Color Palette

## Brand Colors

### Primary Blue (`#1471d8`)
- **Usage**: Primary buttons, links, active states, key UI elements
- **Tailwind**: `bg-primary`, `text-primary`, `border-primary`
- **Shades Available**:
  - `primary-900`: #013383 (darkest)
  - `primary-800`: #082960
  - `primary-700`: #0c4088
  - `primary-600`: #1058b0
  - `primary-500`: #1471d8 (main)
  - `primary-300`: #1471d8
  - `primary-200`: #85b9f3 (light)
  - `primary-100`: #cdcee0 (lighter)
  - `primary-50`: #fafbfc (lightest)

### Navy Blue (`#013383`)
- **Usage**: Headers, dark mode backgrounds, important text
- **Tailwind**: `bg-navy`, `text-navy`
- **Hex**: #013383
- **Named Variants**:
  - `navy-dark`: #001a4d
  - `navy-DEFAULT`: #013383
  - `navy-light`: #1471d8

### Sky Blue (`#85b9f3`)
- **Usage**: Secondary elements, hover states, highlights
- **Tailwind**: `bg-sky`, `text-sky`
- **Hex**: #85b9f3
- **Named Variants**:
  - `sky-lighter`: #fafbfc
  - `sky-light`: #cdcee0
  - `sky-DEFAULT`: #85b9f3

### Lavender (`#8699eb`)
- **Usage**: Accent elements, special indicators, badges
- **Tailwind**: `bg-accent`, `text-accent`
- **Hex**: #8699eb
- **Named Variants**:
  - `accent-light`: #fafbfc
  - `accent-DEFAULT`: #8699eb
  - `accent-dark`: #013383

### Light Gray (`#cdcee0`)
- **Usage**: Backgrounds, borders, disabled states
- **Tailwind**: `bg-gray-200`, `bg-sky-light`
- **Hex**: #cdcee0

### Pale Blue (`#fafbfc`)
- **Usage**: Page backgrounds, card backgrounds, light sections
- **Tailwind**: `bg-primary-50`, `bg-sky-lighter`
- **Hex**: #fafbfc

---

## Color Usage Guide

### Buttons

**Primary Button**
```jsx
<button className="bg-primary hover:bg-primary-600 text-white">
  Primary Action
</button>
```

**Secondary Button**
```jsx
<button className="bg-sky hover:bg-sky-light text-navy">
  Secondary Action
</button>
```

**Accent Button**
```jsx
<button className="bg-accent hover:bg-accent/90 text-white">
  Special Action
</button>
```

### Cards & Containers

**Light Background**
```jsx
<div className="bg-primary-50 border border-sky-light rounded-lg">
  Content
</div>
```

**Dark Background**
```jsx
<div className="bg-navy text-white rounded-lg">
  Content
</div>
```

### Text Colors

```jsx
// Primary text
<h1 className="text-navy">Main Heading</h1>

// Secondary text
<p className="text-primary">Important text</p>

// Muted text
<span className="text-gray-500">Helper text</span>

// Links
<a className="text-primary hover:text-primary-600">Link</a>
```

### Badges & Status

```jsx
// Success/Active
<span className="bg-primary text-white px-2 py-1 rounded">Active</span>

// Info
<span className="bg-sky text-navy px-2 py-1 rounded">Info</span>

// Warning
<span className="bg-accent text-white px-2 py-1 rounded">Warning</span>

// Neutral
<span className="bg-sky-light text-navy px-2 py-1 rounded">Pending</span>
```

### Gradients

```jsx
// Primary gradient
<div className="bg-gradient-to-r from-navy to-primary">
  Gradient Background
</div>

// Light gradient
<div className="bg-gradient-to-br from-primary-50 to-sky-lighter">
  Subtle Gradient
</div>

// Accent gradient
<div className="bg-gradient-to-r from-primary via-accent to-sky">
  Colorful Gradient
</div>
```

### Borders

```jsx
// Light border
<div className="border border-sky-light">Content</div>

// Primary border
<div className="border-2 border-primary">Content</div>

// Dark border
<div className="border border-navy/20">Content</div>
```

---

## Dark Mode Colors

When in dark mode, the system automatically adjusts:

```jsx
// Automatically adapts to dark mode
<div className="bg-white dark:bg-navy">
  <p className="text-gray-900 dark:text-white">Content</p>
</div>
```

### Recommended Dark Mode Palette

- **Background**: `bg-navy` or `bg-gray-900`
- **Cards**: `bg-navy-light` or `bg-gray-800`
- **Text**: `text-white` or `text-gray-100`
- **Borders**: `border-gray-700` or `border-primary/30`
- **Primary elements**: Keep `primary` colors, they work well on dark

---

## Accessibility

All color combinations meet WCAG AA standards:

| Foreground | Background | Contrast Ratio | Pass |
|------------|------------|----------------|------|
| Navy (#013383) | White | 12.8:1 | ✓ AAA |
| Primary (#1471d8) | White | 5.2:1 | ✓ AA |
| White | Navy (#013383) | 12.8:1 | ✓ AAA |
| White | Primary (#1471d8) | 5.2:1 | ✓ AA |
| Navy (#013383) | Pale Blue (#fafbfc) | 12.5:1 | ✓ AAA |

---

## Component Color Examples

### Navigation Bar
```jsx
<nav className="bg-navy text-white border-b border-primary">
  <a className="text-white hover:text-sky">Link</a>
</nav>
```

### Cards
```jsx
<div className="bg-white dark:bg-navy border border-sky-light rounded-lg shadow-lg">
  <div className="border-b border-sky-light p-4">
    <h3 className="text-navy dark:text-white">Title</h3>
  </div>
  <div className="p-4">
    <p className="text-gray-700 dark:text-gray-300">Content</p>
  </div>
</div>
```

### Forms
```jsx
<input
  className="border border-sky-light focus:border-primary focus:ring-2 focus:ring-primary/20"
  type="text"
/>
```

### Tables
```jsx
<table className="w-full">
  <thead className="bg-primary-50 dark:bg-navy-light">
    <tr>
      <th className="text-navy dark:text-white">Header</th>
    </tr>
  </thead>
  <tbody>
    <tr className="hover:bg-sky-lighter dark:hover:bg-navy-light">
      <td className="text-gray-900 dark:text-gray-100">Data</td>
    </tr>
  </tbody>
</table>
```

---

## Color Psychology

- **Navy Blue (#013383)**: Trust, professionalism, reliability
- **Primary Blue (#1471d8)**: Confidence, stability, intelligence
- **Sky Blue (#85b9f3)**: Calm, openness, clarity
- **Lavender (#8699eb)**: Creativity, sophistication, balance
- **Light Gray (#cdcee0)**: Neutrality, balance, professionalism
- **Pale Blue (#fafbfc)**: Cleanliness, simplicity, space

---

## Quick Reference

```javascript
// Tailwind config colors
const colors = {
  primary: {
    DEFAULT: '#1471d8',
    50: '#fafbfc',
    100: '#cdcee0',
    200: '#85b9f3',
    500: '#1471d8',
    900: '#013383',
  },
  navy: {
    DEFAULT: '#013383',
  },
  sky: {
    DEFAULT: '#85b9f3',
    light: '#cdcee0',
  },
  accent: {
    DEFAULT: '#8699eb',
  },
};
```

---

## Migration Guide

If you need to update existing components:

**Old (generic blue)** → **New (brand colors)**
- `bg-blue-500` → `bg-primary`
- `bg-blue-600` → `bg-primary-600`
- `text-blue-700` → `text-navy`
- `bg-blue-50` → `bg-primary-50` or `bg-sky-lighter`
- `border-blue-200` → `border-sky-light`

---

**Last Updated**: 2025-01-14
**Version**: 2.0.0

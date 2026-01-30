# Palette's UX Learning Journal

## 2024-05-23 - Initial Setup
**Learning:** This file was created to track UX and accessibility learnings for the project.
**Action:** Consult this file before making changes to understand past decisions and constraints.

## 2024-05-23 - Icon-only Buttons Accessibility
**Learning:** Many icon-only buttons (using `Button` component or native `button`) rely on `title` tooltip but lack `aria-label`, making them inaccessible to screen readers.
**Action:** Always add `aria-label` to icon-only buttons, especially when the button content is purely visual (icon). Ensure internal icons are `aria-hidden="true"`.

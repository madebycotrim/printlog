# Palette's Journal

## 2025-02-18 - Accessible Accordion Pattern
**Learning:** The existing FAQ accordion implementation lacked ARIA attributes, making it inaccessible to screen readers. React's `useId` hook provides a clean way to generate stable, unique IDs for linking controls to their regions in mapped components.
**Action:** Always use `useId` for generating IDs in accessible components like accordions, tabs, and modals to ensuring proper `aria-controls` and `aria-labelledby` associations.

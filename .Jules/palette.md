## 2025-05-20 - Floating Action Button Overlap
**Learning:** Sibling elements with fixed positioning at the same `bottom` coordinate (e.g., `bottom-6`) will overlap. When a menu expands upwards from the bottom, it needs to be vertically offset (e.g., `bottom-24`) to sit visually *above* the trigger button, ensuring content visibility and avoiding touch target conflicts.
**Action:** Always verify FAB menu positioning with content to ensure it doesn't obscure the trigger or get obscured by it. Use distinct vertical spacing.

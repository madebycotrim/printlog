## 2025-02-19 - Accessible Floating Action Menus
**Learning:** Floating Action Button (FAB) menus are often treated as simple toggles, but they function as modal dialogs when open. They require `role="dialog"`, `aria-modal="true"`, and `Escape` key support to be accessible to screen readers and keyboard users.
**Action:** Always wrap FAB menu content in a container with dialog roles and ensure the trigger communicates state via `aria-expanded`.

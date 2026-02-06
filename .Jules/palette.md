## 2025-02-09 - Accessible FAB Pattern
**Learning:** FAB menus implemented as custom overlays need `role='dialog'` and `aria-modal='true'` to be perceptible as separate contexts for screen readers. The `FloatingQuickActions` component was previously invisible to AT users as a menu.
**Action:** Ensure all floating menus in the app implement the dialog pattern (attributes + eventually focus management) rather than just visual toggling.

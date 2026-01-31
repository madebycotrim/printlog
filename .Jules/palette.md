## 2025-02-18 - Floating Action Button Accessibility
**Learning:** Floating Action Buttons (FABs) often serve as primary navigation but lack context for screen readers when they use icon-only designs. Also, they frequently miss keyboard traps or escape key listeners when they open menus.
**Action:** Always wrap FAB menus in `role="dialog"` with `aria-modal="true"`, ensure `Escape` closes them, and toggle `aria-label` on the trigger based on state.

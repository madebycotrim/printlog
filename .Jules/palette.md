## 2026-01-22 - Accessibility in Floating Actions
**Learning:** Adding `role="dialog"` and `aria-modal="true"` to custom floating menus (like `FloatingQuickActions`) significantly improves screen reader navigation by signalling a context switch, even without a full focus trap.
**Action:** Always verify that "floating" or "popover" style components have explicit ARIA roles and labels, as they often fall outside the natural tab order or are appended to the DOM in ways that can be confusing without semantic cues.

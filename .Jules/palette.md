## 2026-01-23 - Accessibility of Animated Popovers
**Learning:** `opacity-0` and `pointer-events-none` are insufficient for hiding interactive elements. Keyboard users can still tab into "hidden" buttons, creating a confusing focus trap.
**Action:** Always combine opacity transitions with `invisible` (visibility: hidden) or `inert` when the element should be inaccessible.

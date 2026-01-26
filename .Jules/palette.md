## 2025-02-18 - [Hidden Interactive Elements]
**Learning:** Elements hidden with `opacity-0` and `pointer-events-none` remain in the accessibility tree and keyboard tab order, creating "ghost" focus traps.
**Action:** Always pair `opacity-0` with `visibility: hidden` (Tailwind `invisible`) for conditionally shown interactive content.

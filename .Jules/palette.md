## 2025-02-18 - Missing ARIA Labels on Icon Buttons
**Learning:** Several floating action buttons and close buttons use icons without text labels or `aria-label` attributes, making them inaccessible to screen readers.
**Action:** Always check `onClick` handlers on buttons that contain only icons. Ensure `aria-label` is present and describes the action (e.g., "Open menu", "Close").

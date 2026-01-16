## 2024-05-23 - Accessibility in Icon-only Buttons
**Learning:** Icon-only buttons (like 'Clear Search', 'View Mode') are common for a clean UI but often lack accessible names, making them unusable for screen reader users.
**Action:** Always add `aria-label` to icon-only buttons and `aria-hidden="true"` to the decorative icon inside. Use `aria-pressed` for toggle buttons to indicate state.

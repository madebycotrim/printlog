## 2024-05-22 - [Accordion Accessibility]
**Learning:** Hidden content in accordions is often implemented with `opacity-0` and `max-h-0` for animation purposes, meaning the content remains in the DOM. Standard testing matchers like `toBeInTheDocument` will pass even when content is visually hidden.
**Action:** Use specific class checks (e.g., `toHaveClass('opacity-0')`) or `toBeVisible()` (if styles are parsed) to verify toggle states in tests. Always pair toggles with `aria-expanded` and `aria-controls` for screen readers.

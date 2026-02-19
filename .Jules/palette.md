## 2026-02-19 - Accessibility: Linking Labels to Inputs
**Learning:** Reusable `input` components often miss label associations when using complex rendering logic or custom IDs. React's `useId` provides a seamless way to generate unique IDs for `htmlFor` attributes, ensuring accessibility without burdening the parent component with manual ID management.
**Action:** Default to `const id = useId()` in all form primitives, falling back to `props.id` only when explicitly provided, and always bind `htmlFor` on the label.

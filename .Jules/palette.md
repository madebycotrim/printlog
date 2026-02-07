## 2024-05-22 - Handling Accessibility in CSS Transitions
**Learning:** Elements using `opacity-0` and `pointer-events-none` for fade-out transitions remain in the accessibility tree and can trap keyboard focus.
**Action:** Use the `inert` attribute (React 19+) on the container when it is visually hidden to remove it and its children from the accessibility tree without breaking CSS transitions.

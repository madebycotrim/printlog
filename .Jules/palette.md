# Palette's UX Journal 🎨

## 2025-02-23 - Floating Action Button Accessibility

**Learning:** When using the `inert` attribute for accessibility (to hide content from screen readers and keyboard while keeping it in the DOM for transitions), relying on a `ref` callback to set the property is brittle because the callback may not re-run on state updates. Using a `useEffect` hook to toggle `element.inert` based on the open/closed state is the reliable pattern in React.

**Action:** Always wrap `inert` property toggles in `useEffect` for dynamic elements.

## 2025-02-23 - CSS Transitions and Accessibility

**Learning:** Tailwind's `invisible` class applies `visibility: hidden` immediately, which can cut off opacity transitions. To support smooth fade-out transitions while maintaining accessibility, use `opacity-0` combined with `inert` (or `aria-hidden="true"` + `tabIndex="-1"`) instead of `visibility: hidden`. This allows the visual transition to complete while immediately removing the element from the accessibility tree.

**Action:** Use `opacity-0 pointer-events-none inert` for accessible fade transitions.

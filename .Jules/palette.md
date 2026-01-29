# Palette's UX Journal

This journal tracks critical UX and accessibility insights, ensuring we build a more intuitive and inclusive application.

## 2026-01-29 - Accessibility in Auth Forms
**Learning:** Auth forms often lack basic accessibility features like explicit label associations and accessible toggles, making them difficult for screen reader users despite being critical for entry.
**Action:** Always verify `htmlFor` matches `id` on inputs, and ensure icon-only buttons (like password toggles) have dynamic `aria-label`s reflecting their current state.

## 2025-02-18 - Form Accessibility Pattern
**Learning:** Forms (like Login) were using labels without `htmlFor`/`id` association, relying on visual nesting. This breaks screen reader associations and click-to-focus behavior.
**Action:** Always verify `htmlFor` matches `id` on inputs, even when visually grouped.

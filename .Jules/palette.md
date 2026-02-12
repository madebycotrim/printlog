## 2026-02-12 - Automatic Label Association
**Learning:** Reusable input components often fail accessibility checks because developers forget to pass unique IDs for `htmlFor`.
**Action:** Always implement `React.useId()` in base input components to ensure `label` and `input` are programmatically associated by default.

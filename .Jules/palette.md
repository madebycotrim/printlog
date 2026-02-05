## 2025-02-19 - [UnifiedInput Accessibility Gap]
**Learning:** The core `UnifiedInput` component relied on visual proximity for labels but lacked programmatic association, affecting all forms using it.
**Action:** Use `React.useId()` in core form components to ensure robust label-input association without requiring manual ID prop drilling.

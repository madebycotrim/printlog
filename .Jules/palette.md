## 2025-05-23 - Icon-only Elements Accessibility Gap
**Learning:** Many interactive components (UnifiedInput time fields, FloatingQuickActions buttons) rely solely on icons without accessible names or labels, making them inaccessible to screen readers.
**Action:** Systematically audit and add `aria-label` to all icon-only buttons and inputs during component updates.

## 2024-05-22 - Automatic Form Label Association
**Learning:** Reusable input components often suffer from missing or duplicate IDs, breaking label association for screen readers. `useId` provides a robust, zero-config solution.
**Action:** Always implement `useId` in base form components (`Input`, `Select`, `Checkbox`) to ensure `htmlFor` and `id` match automatically without forcing consumers to generate IDs manually.

## 2026-01-21 - Clerk Auth & Headless Verification
**Learning:** This app uses Clerk for authentication, which redirects unauthenticated users to a login page immediately. In a headless environment (like Playwright in CI or sandbox) without configured credentials, it's impossible to verify protected routes like `/calculadora` visually.
**Action:** For future verification of protected routes, rely on component-level unit tests (Vitest + Testing Library) which can render components in isolation, rather than full e2e integration tests, unless mock auth is available.

## 2026-01-24 - [Keyboard Accessible Tooltips]
**Learning:** Pure CSS tooltips relying on `group-hover` are invisible to keyboard users. Adding `tabIndex="0"`, `aria-label`, and `group-focus-visible:block` is a low-effort pattern to make them accessible without JavaScript state.
**Action:** When creating hover-reveal interactions, always pair `hover` classes with `focus-visible` classes and ensure the trigger is focusable.

## 2026-02-11 - FAB Menu Overlap
**Learning:** Fixed positioning FAB menus directly over their triggers (e.g., `bottom-6`) creates visual overlap and can obscure the trigger button or menu items, especially during transitions or on mobile.
**Action:** Always offset the menu container vertically (e.g., `bottom-20`) relative to the FAB trigger to ensure clear separation and prevent accidental clicks or visual clutter.

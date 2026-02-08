## 2024-05-22 - Floating Action Button Menu Positioning
**Learning:** Floating Action Buttons (FABs) menu positioning often overlaps the trigger button if they share the same anchor coordinates, making it difficult for keyboard users (and mouse users if touch targets overlap). Moving the menu vertically above the trigger ensures clear separation and better focus visibility.
**Action:** Always check the stacking context and visual overlap of FAB menus. Ensure the menu container has sufficient margin or positioning offset from the trigger button.

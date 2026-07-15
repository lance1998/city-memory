## 2025-07-07 - Global Keyboard Accessibility for Pseudo-Buttons
**Learning:** Adding `tabindex="0"` and `role="button"` makes `div`/`span` elements focusable and semantic, but it does *not* automatically trigger `click` handlers when pressing `Enter` or `Space` (unlike native `<button>` elements). This is a common accessibility trap in apps that heavily rely on pseudo-buttons.
**Action:** When adding accessibility to non-native interactive elements across an application, establish a global `keydown` event listener to delegate `Enter` and `Space` key presses to `document.activeElement.click()`, ensuring consistent keyboard accessibility without having to refactor every single component.

## 2025-07-15 - Compound ARIA labels for icon-text buttons
**Learning:** When buttons visually show an icon and a number (like a like count), screen readers will only read the number. Adding a compound `aria-label` that includes both the action's intent/state and the count (e.g., '点赞, 15') provides adequate context.
**Action:** Always construct and dynamically update a compound `aria-label` for pseudo-buttons that visually display only a numerical count.

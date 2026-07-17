## 2025-07-07 - Global Keyboard Accessibility for Pseudo-Buttons
**Learning:** Adding `tabindex="0"` and `role="button"` makes `div`/`span` elements focusable and semantic, but it does *not* automatically trigger `click` handlers when pressing `Enter` or `Space` (unlike native `<button>` elements). This is a common accessibility trap in apps that heavily rely on pseudo-buttons.
**Action:** When adding accessibility to non-native interactive elements across an application, establish a global `keydown` event listener to delegate `Enter` and `Space` key presses to `document.activeElement.click()`, ensuring consistent keyboard accessibility without having to refactor every single component.

## 2026-07-17 - [Compound ARIA Labels for Icon-Text Count Buttons]
**Learning:** When adding accessibility to pseudo-buttons containing both an icon and a numeric count (like "Likes: 15"), it's crucial to construct a compound `aria-label` that includes both the action's intent/state and the count (e.g., "点赞, 15" or "取消点赞, 15") rather than just the action name.
**Action:** Always extract and append the associated count text to the `aria-label` when applying accessibility attributes to social interaction buttons.

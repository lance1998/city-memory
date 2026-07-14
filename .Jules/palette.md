## 2025-07-07 - Global Keyboard Accessibility for Pseudo-Buttons
**Learning:** Adding `tabindex="0"` and `role="button"` makes `div`/`span` elements focusable and semantic, but it does *not* automatically trigger `click` handlers when pressing `Enter` or `Space` (unlike native `<button>` elements). This is a common accessibility trap in apps that heavily rely on pseudo-buttons.
**Action:** When adding accessibility to non-native interactive elements across an application, establish a global `keydown` event listener to delegate `Enter` and `Space` key presses to `document.activeElement.click()`, ensuring consistent keyboard accessibility without having to refactor every single component.

## 2025-07-07 - Contextual ARIA Labels for Icon-Text Buttons
**Learning:** When icon-text buttons only display a numeric count visually (e.g., a heart icon next to "10"), screen readers will only read the number if an explicit `aria-label` is not provided. This deprives visually impaired users of critical context (e.g., they hear "10" instead of "点赞, 10").
**Action:** Always construct and dynamically update compound `aria-label`s for such buttons that combine the action's intent (and state, like "取消点赞") with the visual text/count.

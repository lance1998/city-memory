## 2025-07-07 - Global Keyboard Accessibility for Pseudo-Buttons
**Learning:** Adding `tabindex="0"` and `role="button"` makes `div`/`span` elements focusable and semantic, but it does *not* automatically trigger `click` handlers when pressing `Enter` or `Space` (unlike native `<button>` elements). This is a common accessibility trap in apps that heavily rely on pseudo-buttons.
**Action:** When adding accessibility to non-native interactive elements across an application, establish a global `keydown` event listener to delegate `Enter` and `Space` key presses to `document.activeElement.click()`, ensuring consistent keyboard accessibility without having to refactor every single component.

## 2025-07-07 - Dynamic Compound ARIA Labels for Icon-Count Buttons
**Learning:** Adding simple `aria-label`s to icon-only buttons is straightforward, but when buttons display visual numeric counts (like likes or comments) alongside icons, screen readers need both the intent and the count. Just labeling it "Like" hides the count, and not labeling it at all only reads the number.
**Action:** Always construct and dynamically update a compound `aria-label` that includes both the action's intent and the numeric count (e.g., "点赞, 15") for these composite pseudo-buttons to provide adequate context.

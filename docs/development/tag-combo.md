# Implementation Plan: Generic Combobox & Tag-Specific Implementation

This document outlines the steps to create a reusable, cross-platform combobox component and its specific implementation for managing tags. The approach separates the generic UI from the application-specific logic for better reusability and scalability.

---

## Phase 1: Build the Generic `Combobox` Component (✓ Done)

**Objective:** Create a reusable, "headless" `Combobox` component that handles UI, state, and user interaction, but remains agnostic about its data.

- **Step 1.1: Create `Combobox.tsx`:**
  - ✅ Created the file at `packages/ui/src/components/Combobox.tsx`.
- **Step 1.2: Define Generic Props:**
  - ✅ The component accepts props like `inputValue`, `onInputValueChange`, `items`, `onSelectItem`, `renderItem`, and `isLoading`.
- **Step 1.3: Implement UI Shell:**
  - ✅ Use a standard Tamagui `Input` for text entry and a `Popover` for the dropdown.
  - ✅ Basic UI structure is complete for both web and mobile.

**Verification:** A generic, non-functional combobox can be rendered. It has the right look and feel for both web and mobile platforms.

**Notes:**

- The initial implementation used a custom `CInput` component, which caused a render-loop bug on the web. This was resolved by replacing it with a standard Tamagui `Input`.

---

## Phase 2: Create the `TagCombobox` Smart Component (✓ Done)

**Objective:** Implement a "smart" container that uses the generic `Combobox` and orchestrates the tag-specific logic.

- **Step 2.1: Create `TagCombobox.tsx`:**
  - ✅ Created the file at `packages/app/features/tags/components/TagCombobox.tsx`.
- **Step 2.2: Integrate `Combobox`:**
  - ✅ The `TagCombobox` renders the generic `Combobox` from `packages/ui`.
  - ✅ It passes the necessary props (data and callbacks) to the generic component.
- **Step 2.3: Integrate into `TagListContainer`:**
  - ✅ Integrated the new `TagCombobox` component into `packages/app/components/tags/TagListContainer.tsx`.

**Verification:** The `TagListContainer` displays the new combobox component, powered by the generic UI.

---

## Phase 3: Scalable Data Fetching & Autocomplete (✓ Done)

**Objective:** Implement a performant, server-side search for tags.

- **Step 3.1: Implement Debounced Search Hook:**
  - ✅ Implemented `useSearchTags` hook that fetches tags from the backend based on the user's input.
  - ✅ Uses a debounce mechanism to avoid sending excessive requests while the user is typing.
- **Step 3.2: Connect to `TagCombobox`:**
  - ✅ Connected `TagCombobox.tsx` to use the `useSearchTags` hook to get a filtered list of tags.
  - ✅ Passes the `userId` to the search hook for authentication.

**Verification:** As you type in the input, a dropdown appears showing a filtered list of existing tags fetched from the server.

---

## Phase 4: Tag Assignment & Creation Logic (✓ Done)

**Objective:** Connect the component to the backend for assigning and creating tags, with a clear and explicit UX.

- **Step 4.1: Implement Explicit "Create" Option:**
  - ✅ In `TagCombobox.tsx`, if the search query doesn't match any existing tags, a special item `Create new tag: "[query]"` is added to the dropdown list.
- **Step 4.2: Handle Tag Assignment:**
  - ✅ When a user selects an _existing_ tag from the list, the `useAssignTags` mutation is called.
  - ✅ The input field is cleared on success.
- **Step 4.3: Handle Tag Creation:**
  - ✅ When the user selects the "Create new tag..." option, the `useCreateTag` mutation is called.
  - ✅ On success, `useAssignTags` is immediately called with the newly created tag's ID.
  - ✅ The input field is cleared on success.

**Verification:** Selecting a tag adds it. Typing a new name and selecting the "Create" option creates and adds the tag.

---

## Phase 5: UI Polish & Robust Error Handling (✓ Done)

**Objective:** Ensure the component is responsive, provides clear feedback, and handles failures gracefully.

- ✅ **Step 5.1: Enhance Loading Indicators:**
  - **Action:** Ensured `TagCombobox` correctly passes the `isLoading` state to the `Combobox` component.

- ✅ **Step 5.2: Implement Comprehensive Error Handling & Feedback:**
  - **Action:** Added `onError` callbacks to the mutations in `TagListContainer.tsx` and implemented a `Text` component to display contextual error messages below the input.

- ✅ **Step 5.3: Implement Robust Keyboard Navigation (Web-Only):**

  - **Objective:** Add full, reliable keyboard navigation to the generic `Combobox` component for web users.

  - **Platform Strategy:** The implementation uses two separate files to handle platform-specific logic:
    - `Combobox.tsx`: The web version, which contains the full keyboard navigation and ARIA attributes.
    - `Combobox.native.tsx`: The mobile version, which remains a simple, touch-focused component.

  - **Implementation Journey & Final Solution:**
    1.  **Initial Approach (Failed):** The initial attempt involved using a generic `useKeyboardHandling` hook and attaching an `onKeyDown` handler to the Tamagui `<Input>` component. This failed because the Tamagui component's complex internal event system on the web prevented the browser's default actions (like cursor movement) from being stopped reliably.
    2.  **Final Approach (Success):** To bypass the library's event system, a more direct approach was implemented:
        - A `useRef` was used to get a direct reference to the underlying HTML `<input>` element.
        - A `useEffect` hook now adds a `keydown` event listener directly to this element whenever the popover is open.
        - This listener handles all keyboard logic (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`) and calls `e.preventDefault()` to ensure it has exclusive control, which finally solved the issue.

- ✅ **Step 5.4: Accessibility (ARIA):**
  - **Action:** Added all necessary ARIA attributes to the web version (`Combobox.tsx`), including `role="combobox"`, `aria-expanded`, `aria-activedescendant`, and more, to ensure the component is fully accessible to screen readers.

- 🚧 **Step 5.5: Visual Polish & User Experience:**
  - ✅ **Hover/Focus States:** Implemented clear visual feedback for hovered and focused items in the dropdown list.
  - ✅ **Empty State:** The "No results found" message is styled and functional.
  - 🚧 **Clear Input Button:** A small "x" button to quickly clear the `inputValue` has not been implemented yet.
  - ✅ **Input Styling:** The input field's styling is consistent with other inputs in the application.

**Verification:** The component feels robust, provides clear visual feedback for all states (loading, error, success), and is fully usable with both mouse and keyboard on the web.
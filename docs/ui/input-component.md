# Input Component System Documentation

This document explains the usage and purpose of the core input components defined in:
- `packages/ui/src/components/parts/inputParts.tsx`
- `packages/ui/src/components/InputWithLabel.tsx`

---

## 1. `inputParts.tsx`: The Base Input System

This file provides a **composable, themeable, and type-safe input component system** for Tamagui-based UI apps. It defines the foundational `Input` component and its statics, enabling you to build rich input UIs with icons, sections, buttons, and more.

### Key Features
- **Composable API:** Use `Input.Box`, `Input.Area`, `Input.Section`, `Input.Icon`, `Input.Button`, etc. for flexible layouts.
- **Design Token Safety:** Uses `tamaguiTokenChecker` to safely access tokens for radius, spacing, font size, etc.
- **Variants and Theming:** Supports size, color, and other variants for consistent design system usage.
- **Cross-Platform:** Works on both web and React Native via Tamagui primitives.

### Example Usage
```tsx
import { Input } from '@bbook/ui';
import { User } from '@tamagui/lucide-icons';

<Input size="$3">
  <Input.Box>
    <Input.Section>
      <Input.Icon>
        <User />
      </Input.Icon>
    </Input.Section>
    <Input.Section>
      <Input.Area placeholder="Your email" />
    </Input.Section>
    <Input.Section>
      <Input.Button>
        <Input.Icon>
          <User />
        </Input.Icon>
      </Input.Button>
    </Input.Section>
  </Input.Box>
</Input>
```

### Tips
- Use the statics (`Box`, `Area`, `Section`, etc.) to compose any input layout you need.
- You can extend these components or wrap them for custom behaviors.
- All styling and theming is handled via Tamagui tokens and context.

---

## 2. `InputWithLabel.tsx`: Example Wrapper Component

This file is intended as a **convenience wrapper** for common input+label patterns. It typically combines a label and an input into a single component for easier usage in forms.

### Example Usage
```tsx
import { InputWithLabel } from '@bbook/ui';

<InputWithLabel label="Email" placeholder="Enter your email" />
```

### Customization
- You can copy and modify `InputWithLabel.tsx` to create other wrappers (e.g., for validation, error display, etc.).
- Under the hood, it uses the base `Input` system from `inputParts.tsx`.

---

## When to Use Which?
- Use the **base `Input` system** (`inputParts.tsx`) for maximum flexibility and when building complex, custom input UIs.
- Use **`InputWithLabel`** for quick form fields or when you want a simple labeled input with minimal boilerplate.

---

## Extending and Best Practices
- Always use `tamaguiTokenChecker` for dynamic token access in custom components.
- Prefer composition (using the provided statics) over inheritance for custom layouts.
- For cross-platform compatibility, stick to Tamagui primitives and avoid web/RN-specific APIs in these components.

---

For further customization or advanced patterns, refer to the source code in these files and Tamagui’s official documentation.

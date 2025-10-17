# @sv-sdk/ui

UI component library built with Svelte 5 and Tailwind CSS for the SV-SDK platform.

## Features

- **Svelte 5** - Modern reactive framework with runes
- **Tailwind CSS** - Utility-first CSS framework
- **Accessibility** - WCAG 2.1 Level AA compliant
- **Dark Mode** - Built-in dark mode support
- **TypeScript** - Full type safety
- **Responsive** - Mobile-first design
- **Customizable** - Design tokens for theming

## Installation

```bash
pnpm add @sv-sdk/ui
```

## Setup

### 1. Import Styles

In your app's root layout or `+layout.svelte`:

```svelte
<script>
  import '@sv-sdk/ui/styles'
</script>
```

### 2. Configure Tailwind

In your `tailwind.config.ts`:

```typescript
import uiConfig from '@sv-sdk/ui/tailwind.config'

export default {
  ...uiConfig,
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/@sv-sdk/ui/**/*.{html,js,svelte,ts}',
  ],
}
```

## Components

### Button

```svelte
<script>
  import { Button } from '@sv-sdk/ui'
</script>

<Button variant="primary" size="md" onclick={() => console.log('clicked')}>
  Click Me
</Button>

<Button variant="secondary" loading>
  Processing...
</Button>

<Button variant="outline" disabled>
  Disabled
</Button>
```

**Props**:
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean
- `fullWidth`: boolean

### Input

```svelte
<script>
  import { Input } from '@sv-sdk/ui'

  let email = $state('')
  let error = $state('')
</script>

<Input
  type="email"
  label="Email Address"
  bind:value={email}
  placeholder="you@example.com"
  {error}
  required
/>
```

**Props**:
- `type`: 'text' | 'email' | 'password' | etc.
- `label`: string
- `error`: string
- `value`: string (bindable)
- `required`: boolean
- `disabled`: boolean

### Alert

```svelte
<script>
  import { Alert } from '@sv-sdk/ui'
</script>

<Alert variant="info" title="Information">
  This is an informational message.
</Alert>

<Alert variant="success" dismissible onDismiss={() => console.log('dismissed')}>
  Operation completed successfully!
</Alert>

<Alert variant="error" title="Error Occurred">
  Something went wrong. Please try again.
</Alert>
```

**Props**:
- `variant`: 'info' | 'success' | 'warning' | 'error'
- `title`: string
- `dismissible`: boolean
- `onDismiss`: () => void

### Modal

```svelte
<script>
  import { Modal, Button } from '@sv-sdk/ui'

  let showModal = $state(false)
</script>

<Button onclick={() => showModal = true}>Open Modal</Button>

<Modal bind:open={showModal} title="Confirm Action" size="md">
  <p>Are you sure you want to perform this action?</p>

  <div class="flex gap-2 mt-4">
    <Button variant="primary">Confirm</Button>
    <Button variant="outline" onclick={() => showModal = false}>Cancel</Button>
  </div>
</Modal>
```

**Props**:
- `open`: boolean (bindable)
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `closeOnBackdrop`: boolean
- `closeOnEscape`: boolean
- `onClose`: () => void

### Card

```svelte
<script>
  import { Card } from '@sv-sdk/ui'
</script>

<Card>
  <h3 class="text-lg font-semibold mb-2">Card Title</h3>
  <p>Card content goes here.</p>
</Card>
```

### Spinner

```svelte
<script>
  import { Spinner } from '@sv-sdk/ui'
</script>

<Spinner size="md" />
```

## Design Tokens

```typescript
import { colors, typography, spacing, shadows } from '@sv-sdk/ui/tokens'

// Use in your components
const primaryColor = colors.primary[500]
const baseFontSize = typography.fontSize.base
const cardPadding = spacing[6]
```

## Dark Mode

Components automatically support dark mode using Tailwind's `dark:` variants.

Toggle dark mode:

```svelte
<script>
  function toggleDarkMode() {
    document.documentElement.classList.toggle('dark')
  }
</script>

<button onclick={toggleDarkMode}>
  Toggle Dark Mode
</button>
```

## Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus indicators
- ✅ ARIA attributes
- ✅ Color contrast (4.5:1 minimum)
- ✅ Semantic HTML

## Customization

Override Tailwind classes:

```svelte
<Button class="bg-purple-600 hover:bg-purple-700">
  Custom Color
</Button>
```

## Component Roadmap

**Current** (Phase 7):
- ✅ Button
- ✅ Input
- ✅ Alert
- ✅ Modal
- ✅ Card
- ✅ Spinner

**Planned**:
- TextArea
- Select
- Checkbox
- Radio
- Switch
- Table
- Dropdown
- Toast
- Badge
- Progress
- Skeleton
- DatePicker
- Tabs
- Accordion
- And more...

## Testing

```bash
# Run tests
pnpm test

# Watch mode
pnpm test:watch
```

## Best Practices

1. **Use semantic HTML** - Proper element tags
2. **Add ARIA labels** - For screen readers
3. **Support keyboard nav** - Tab, Enter, Escape, Arrow keys
4. **Test with keyboard only** - Ensure all features accessible
5. **Check color contrast** - Use tools like axe DevTools
6. **Provide text alternatives** - For images and icons

## License

MIT


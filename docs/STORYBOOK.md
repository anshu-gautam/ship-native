# Storybook for React Native

Complete guide for using Storybook to develop and document UI components in isolation.

## Overview

Storybook provides an interactive UI for developing, testing, and documenting React Native components in isolation from your app.

## Features

- 📚 Component Documentation - Document components with interactive examples
- 🎨 Visual Development - Develop UI components in isolation
- 🔧 Interactive Controls - Modify component props in real-time
- 📱 On-Device UI - View stories directly on iOS/Android devices
- ✅ Quality Assurance - Test components in different states

## Installation

Already installed! Storybook is configured and ready to use.

**Dependencies:**
```json
{
  "@storybook/react-native": "^10.0.7",
  "@storybook/addon-ondevice-controls": "^10.0.7",
  "@storybook/addon-ondevice-actions": "^10.0.7"
}
```

## Running Storybook

### Start Storybook Mode

```bash
npm run storybook
```

This starts Expo with the `STORYBOOK_ENABLED` environment variable, which switches your app to Storybook mode.

### Viewing Stories

1. Run `npm run storybook`
2. Open the app on iOS Simulator, Android Emulator, or physical device
3. The Storybook UI will display all available stories
4. Navigate through stories and interact with controls

## Writing Stories

### Basic Story Structure

Create a `.stories.tsx` file next to your component:

**Button.stories.tsx**
```tsx
import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  decorators: [
    (Story) => (
      <View style={{ padding: 20 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline'],
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    title: 'Click Me',
    onPress: () => console.log('Pressed'),
    variant: 'primary',
  },
};
```

### Story Types

**Multiple States:**
```tsx
export const Primary: Story = {
  args: { title: 'Primary', variant: 'primary' },
};

export const Secondary: Story = {
  args: { title: 'Secondary', variant: 'secondary' },
};

export const Disabled: Story = {
  args: { title: 'Disabled', disabled: true },
};
```

**Custom Render:**
```tsx
export const Complex: Story = {
  render: (args) => (
    <View>
      <Button {...args} title="First" />
      <Button {...args} title="Second" />
    </View>
  ),
};
```

## Controls & Addons

### On-Device Controls

Modify props in real-time using the controls addon:

```tsx
argTypes: {
  variant: {
    control: 'select',
    options: ['primary', 'secondary', 'outline'],
  },
  disabled: {
    control: 'boolean',
  },
  size: {
    control: 'select',
    options: ['small', 'medium', 'large'],
  },
}
```

**Available Controls:**
- `text` - Text input
- `boolean` - Toggle switch
- `select` - Dropdown menu
- `number` - Number input
- `color` - Color picker
- `object` - JSON editor

### On-Device Actions

Log component interactions:

```tsx
import { action } from '@storybook/addon-ondevice-actions';

export const WithAction: Story = {
  args: {
    onPress: action('button-press'),
    onChange: action('value-change'),
  },
};
```

## Decorators

Decorators wrap stories with additional UI or functionality.

### Global Decorators

Add to `.storybook/preview.tsx`:
```tsx
export const decorators = [
  (Story) => (
    <SafeAreaProvider>
      <Story />
    </SafeAreaProvider>
  ),
];
```

### Component Decorators

Add to individual story files:
```tsx
const meta: Meta<typeof Component> = {
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#F5F5F5' }}>
        <Story />
      </View>
    ),
  ],
};
```

## Best Practices

### 1. Document All Visual States

```tsx
export const Default: Story = { args: { ... } };
export const Hover: Story = { args: { ... } };
export const Disabled: Story = { args: { ... } };
export const Loading: Story = { args: { ... } };
export const Error: Story = { args: { ... } };
```

### 2. Use Meaningful Names

```tsx
// ✅ Good
export const PrimaryLargeButton: Story = { ... };

// ❌ Bad
export const Story1: Story = { ... };
```

### 3. Add Descriptions

```tsx
const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    notes: 'A reusable button component with multiple variants and sizes.',
  },
};
```

### 4. Group Related Stories

```tsx
// Use forward slashes to create hierarchy
title: 'Components/Buttons/PrimaryButton',
title: 'Components/Buttons/SecondaryButton',
title: 'Components/Forms/Input',
```

## Story Organization

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx
│   │   └── Button.test.tsx
│   └── Input/
│       ├── Input.tsx
│       ├── Input.stories.tsx
│       └── Input.test.tsx
```

## Generating Story Index

When you add new stories, regenerate the story index:

```bash
npm run storybook:generate
```

This updates `.storybook/storybook.requires.ts` with all story imports.

## Switching Between App and Storybook

### Method 1: Environment Variable

```bash
# Run Storybook
STORYBOOK_ENABLED=true npm start

# Run normal app
npm start
```

### Method 2: Conditional Entry Point

**App.tsx (or index.js):**
```tsx
const StorybookUIRoot = require('./.storybook').default;
const App = require('./src/app').default;

export default process.env.STORYBOOK_ENABLED === 'true'
  ? StorybookUIRoot
  : App;
```

## Examples

### Button Component Stories

See: `src/components/Button.stories.tsx`

- Primary, Secondary, Outline, Danger variants
- Small, Medium, Large sizes
- Disabled and Loading states
- Full width option

### ErrorBoundary Stories

See: `src/components/ErrorBoundary.stories.tsx`

- Default (no error)
- With error
- Custom fallback
- Interactive error trigger

## Troubleshooting

### Stories Not Appearing

1. Ensure story file matches pattern: `*.stories.tsx`
2. Run `npm run storybook:generate`
3. Restart the dev server

### Controls Not Working

Check that `@storybook/addon-ondevice-controls` is in addons:

```ts
// .storybook/main.ts
addons: ['@storybook/addon-ondevice-controls']
```

### TypeScript Errors

Ensure you have the correct types:
```bash
npm install --save-dev @storybook/react-native
```

## Resources

- [Storybook React Native Docs](https://storybook.js.org/docs/react-native)
- [Writing Stories](https://storybook.js.org/docs/react/writing-stories/introduction)
- [Controls Addon](https://storybook.js.org/docs/react/essentials/controls)
- [Actions Addon](https://storybook.js.org/docs/react/essentials/actions)

## Next Steps

1. **Create More Stories**: Document all your UI components
2. **Visual Testing**: Use stories for visual regression testing
3. **Accessibility Testing**: Test components with screen readers
4. **Component Library**: Build a comprehensive component library

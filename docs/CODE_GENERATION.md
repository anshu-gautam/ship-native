# Code Generation Scripts

Automated code generation to quickly scaffold new components and screens with proper structure and boilerplate.

## Overview

These scripts help you maintain consistency across your codebase by generating:
- **Components** with tests, stories, and TypeScript types
- **Screens** with Expo Router integration and proper structure

## Features

- ⚡ **Fast Scaffolding** - Generate components and screens in seconds
- 📝 **Complete Boilerplate** - Includes component, tests, and Storybook stories
- ✅ **Best Practices** - Follows project conventions and TypeScript patterns
- 🎨 **Consistent Structure** - Ensures all code follows the same patterns

## Generate Component

Creates a new component with all necessary files.

### Usage

```bash
npm run generate:component <ComponentName>
```

### Example

```bash
npm run generate:component Card
```

### Generated Files

```
src/components/Card/
├── Card.tsx           # Main component file
├── Card.test.tsx      # Jest tests
├── Card.stories.tsx   # Storybook stories
└── index.ts           # Barrel export
```

### Component Structure

**Card.tsx:**
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface CardProps {
  // Component props with JSDoc comments
}

export const Card: React.FC<CardProps> = (props) => {
  return (
    <View style={styles.container}>
      {/* Component implementation */}
    </View>
  );
};

const styles = StyleSheet.create({
  // Component styles
});
```

**Card.test.tsx:**
```tsx
import { render, screen } from '@testing-library/react-native';
import { Card } from './Card';

describe('Card', () => {
  it('renders correctly', () => {
    render(<Card />);
    // Test assertions
  });
});
```

**Card.stories.tsx:**
```tsx
import type { Meta, StoryObj } from '@storybook/react-native';
import { Card } from './Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
};

export default meta;
export const Default: Story = { args: {} };
```

### Naming Rules

- **Must be PascalCase**: `MyComponent` ✅
- **Invalid examples**:
  - `myComponent` ❌ (camelCase)
  - `my-component` ❌ (kebab-case)
  - `my_component` ❌ (snake_case)

## Generate Screen

Creates a new screen for Expo Router.

### Usage

```bash
npm run generate:screen <screen-name> [--with-tests]
```

### Examples

```bash
# Basic screen
npm run generate:screen profile

# Screen with tests
npm run generate:screen settings --with-tests
```

### Generated Files

**Without tests:**
```
app/(app)/
└── profile.tsx       # Screen file
```

**With tests:**
```
app/(app)/
├── profile.tsx       # Screen file
└── __tests__/
    └── profile.test.tsx  # Jest tests
```

### Screen Structure

**profile.tsx:**
```tsx
import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container}>
        <ScrollView>
          {/* Screen content */}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
```

### Naming Rules

- **Must be kebab-case**: `my-screen` ✅
- **Invalid examples**:
  - `MyScreen` ❌ (PascalCase)
  - `myScreen` ❌ (camelCase)
  - `my_screen` ❌ (snake_case)

### Route Mapping

| Screen Name | Route | Component Name |
|-------------|-------|----------------|
| `profile` | `/(app)/profile` | `ProfileScreen` |
| `user-settings` | `/(app)/user-settings` | `UserSettingsScreen` |
| `about-us` | `/(app)/about-us` | `AboutUsScreen` |

## Workflow

### Creating a New Component

1. **Generate the component:**
   ```bash
   npm run generate:component Button
   ```

2. **Implement the component:**
   Edit `src/components/Button/Button.tsx`

3. **Write tests:**
   Add tests to `src/components/Button/Button.test.tsx`

4. **Create stories:**
   Add stories to `src/components/Button/Button.stories.tsx`

5. **Update Storybook index:**
   ```bash
   npm run storybook:generate
   ```

6. **Run tests:**
   ```bash
   npm test
   ```

### Creating a New Screen

1. **Generate the screen:**
   ```bash
   npm run generate:screen dashboard --with-tests
   ```

2. **Implement the screen:**
   Edit `app/(app)/dashboard.tsx`

3. **Add navigation:**
   Link to the screen from another component:
   ```tsx
   import { router } from 'expo-router';

   <Button
     title="Go to Dashboard"
     onPress={() => router.push('/(app)/dashboard')}
   />
   ```

4. **Test the screen:**
   ```bash
   npm test app/(app)/__tests__/dashboard.test.tsx
   ```

## Best Practices

### Components

1. **Use descriptive names**: `UserCard` > `Card`
2. **Export props interface**: Always export `ComponentProps`
3. **Document props**: Add JSDoc comments
4. **Write tests first**: TDD approach recommended
5. **Create meaningful stories**: Show all states and variants

### Screens

1. **One feature per screen**: Keep screens focused
2. **Use layout components**: Wrap in `SafeAreaView`
3. **Configure Stack.Screen**: Set title and header options
4. **Handle loading/error states**: Always handle async operations
5. **Add analytics**: Track screen views

## Advanced Usage

### Component with Custom Props

After generation, enhance the component:

```tsx
export interface ButtonProps {
  /** Button text */
  title: string;
  /** Press handler */
  onPress: () => void;
  /** Visual variant */
  variant?: 'primary' | 'secondary';
  /** Size variant */
  size?: 'small' | 'medium' | 'large';
  /** Disabled state */
  disabled?: boolean;
}
```

### Screen with Data Fetching

```tsx
export default function ProfileScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  return (
    <>
      <Stack.Screen options={{ title: 'Profile' }} />
      <SafeAreaView style={styles.container}>
        {/* Render profile data */}
      </SafeAreaView>
    </>
  );
}
```

### Component with Hooks

```tsx
export const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  useEffect(() => {
    if (debouncedQuery) {
      onSearch(debouncedQuery);
    }
  }, [debouncedQuery, onSearch]);

  return (
    <TextInput
      value={query}
      onChangeText={setQuery}
      placeholder="Search..."
    />
  );
};
```

## Customizing Templates

Templates are located in the generator scripts. To customize:

1. **Open generator script:**
   - Components: `scripts/generate-component.js`
   - Screens: `scripts/generate-screen.js`

2. **Modify templates:**
   ```js
   const componentTemplate = `
   // Your custom template here
   `;
   ```

3. **Save and use:**
   ```bash
   npm run generate:component MyComponent
   ```

## Troubleshooting

### Component Already Exists

```bash
❌ Error: Component "Button" already exists
```

**Solution:** Use a different name or delete the existing component.

### Invalid Name Format

```bash
❌ Error: Component name must be in PascalCase
```

**Solution:** Use PascalCase for components (e.g., `MyButton`).

```bash
❌ Error: Screen name must be in kebab-case
```

**Solution:** Use kebab-case for screens (e.g., `my-screen`).

### File Permission Errors

```bash
❌ Error: EACCES: permission denied
```

**Solution:** Make scripts executable:
```bash
chmod +x scripts/generate-component.js
chmod +x scripts/generate-screen.js
```

## Examples

### Generate Multiple Components

```bash
npm run generate:component Card
npm run generate:component Avatar
npm run generate:component Badge
npm run generate:component Modal
```

### Generate App Screens

```bash
npm run generate:screen home --with-tests
npm run generate:screen profile --with-tests
npm run generate:screen settings --with-tests
npm run generate:screen about --with-tests
```

## Next Steps

After generating components and screens:

1. ✅ Run type-check: `npm run type-check`
2. ✅ Run tests: `npm test`
3. ✅ View in Storybook: `npm run storybook`
4. ✅ Lint code: `npm run lint`
5. ✅ Commit changes: `git add . && git commit -m "feat: add <name>"`

# Design System Documentation

Complete design system guide for consistent UI/UX across the application.

## Overview

This design system provides a comprehensive set of design tokens, components, and guidelines to ensure visual and functional consistency throughout the app.

## Table of Contents

- [Colors](#colors)
- [Typography](#typography)
- [Spacing](#spacing)
- [Layout](#layout)
- [Components](#components)
- [Icons](#icons)
- [Animations](#animations)
- [Accessibility](#accessibility)
- [Dark Mode](#dark-mode)
- [Best Practices](#best-practices)

---

## Colors

### Color Palette

#### Primary Colors

```typescript
// Brand colors
const primary = {
  50: '#E3F2FD',
  100: '#BBDEFB',
  200: '#90CAF9',
  300: '#64B5F6',
  400: '#42A5F5',
  500: '#2196F3',  // Main
  600: '#1E88E5',
  700: '#1976D2',
  800: '#1565C0',
  900: '#0D47A1',
};
```

#### Secondary Colors

```typescript
const secondary = {
  50: '#F3E5F5',
  100: '#E1BEE7',
  200: '#CE93D8',
  300: '#BA68C8',
  400: '#AB47BC',
  500: '#9C27B0',  // Main
  600: '#8E24AA',
  700: '#7B1FA2',
  800: '#6A1B9A',
  900: '#4A148C',
};
```

#### Neutral Colors

```typescript
const neutral = {
  0: '#FFFFFF',
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#EEEEEE',
  300: '#E0E0E0',
  400: '#BDBDBD',
  500: '#9E9E9E',
  600: '#757575',
  700: '#616161',
  800: '#424242',
  900: '#212121',
  1000: '#000000',
};
```

#### Semantic Colors

```typescript
const semantic = {
  success: {
    light: '#81C784',
    main: '#4CAF50',
    dark: '#388E3C',
  },
  warning: {
    light: '#FFB74D',
    main: '#FF9800',
    dark: '#F57C00',
  },
  error: {
    light: '#E57373',
    main: '#F44336',
    dark: '#D32F2F',
  },
  info: {
    light: '#64B5F6',
    main: '#2196F3',
    dark: '#1976D2',
  },
};
```

### Usage Guidelines

**Primary:** Use for main actions, CTAs, and brand elements
**Secondary:** Use for secondary actions and complementary UI
**Neutral:** Use for text, backgrounds, and borders
**Semantic:** Use for status messages and feedback

### Color Contrast

All color combinations meet WCAG 2.1 Level AA standards:

| Combination | Contrast Ratio | WCAG Level |
|-------------|---------------|------------|
| Primary 500 on White | 4.5:1 | AA |
| Neutral 900 on White | 16:1 | AAA |
| White on Primary 500 | 4.5:1 | AA |

---

## Typography

### Font Families

```typescript
const fonts = {
  heading: 'Inter-Bold',
  body: 'Inter-Regular',
  mono: 'Menlo',
};
```

### Type Scale

```typescript
const fontSizes = {
  xs: 12,    // 12px - Captions, labels
  sm: 14,    // 14px - Body text (small)
  md: 16,    // 16px - Body text (default)
  lg: 18,    // 18px - Body text (large)
  xl: 20,    // 20px - Subheading
  '2xl': 24, // 24px - Heading 3
  '3xl': 30, // 30px - Heading 2
  '4xl': 36, // 36px - Heading 1
  '5xl': 48, // 48px - Display
};
```

### Font Weights

```typescript
const fontWeights = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};
```

### Line Heights

```typescript
const lineHeights = {
  tight: 1.2,   // Headings
  normal: 1.5,  // Body text
  relaxed: 1.75, // Large body text
};
```

### Typography Components

```tsx
// Heading 1
<Text style={{
  fontFamily: fonts.heading,
  fontSize: fontSizes['4xl'],
  fontWeight: fontWeights.bold,
  lineHeight: fontSizes['4xl'] * lineHeights.tight,
}}>
  Main Title
</Text>

// Body text
<Text style={{
  fontFamily: fonts.body,
  fontSize: fontSizes.md,
  fontWeight: fontWeights.regular,
  lineHeight: fontSizes.md * lineHeights.normal,
}}>
  Body paragraph text
</Text>

// Caption
<Text style={{
  fontFamily: fonts.body,
  fontSize: fontSizes.xs,
  fontWeight: fontWeights.regular,
  color: neutral[600],
}}>
  Caption or label
</Text>
```

---

## Spacing

### Spacing Scale

Based on 4px base unit for consistency:

```typescript
const spacing = {
  0: 0,
  1: 4,    // 4px
  2: 8,    // 8px
  3: 12,   // 12px
  4: 16,   // 16px
  5: 20,   // 20px
  6: 24,   // 24px
  8: 32,   // 32px
  10: 40,  // 40px
  12: 48,  // 48px
  16: 64,  // 64px
  20: 80,  // 80px
  24: 96,  // 96px
};
```

### Usage Guidelines

- **0-2 (0-8px):** Component internal spacing
- **3-4 (12-16px):** Space between related elements
- **5-6 (20-24px):** Space between component groups
- **8-12 (32-48px):** Section spacing
- **16-24 (64-96px):** Page layout spacing

---

## Layout

### Grid System

12-column responsive grid:

```typescript
const grid = {
  columns: 12,
  gutter: spacing[4], // 16px
  margin: spacing[4], // 16px
};
```

### Container Widths

```typescript
const containerWidth = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  full: '100%',
};
```

### Breakpoints

```typescript
const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};
```

### Border Radius

```typescript
const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};
```

### Shadows

```typescript
const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};
```

---

## Components

### Button

#### Variants

**Primary Button**
```tsx
<TouchableOpacity
  style={{
    backgroundColor: primary[500],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.md,
    minHeight: 44, // Touch target
  }}
>
  <Text style={{
    color: neutral[0],
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  }}>
    Primary Action
  </Text>
</TouchableOpacity>
```

**Secondary Button**
```tsx
<TouchableOpacity
  style={{
    backgroundColor: 'transparent',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: primary[500],
    minHeight: 44,
  }}
>
  <Text style={{
    color: primary[500],
    fontSize: fontSizes.md,
    fontWeight: fontWeights.semibold,
  }}>
    Secondary Action
  </Text>
</TouchableOpacity>
```

**Text Button**
```tsx
<TouchableOpacity
  style={{
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    minHeight: 44,
  }}
>
  <Text style={{
    color: primary[500],
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
  }}>
    Text Action
  </Text>
</TouchableOpacity>
```

#### Sizes

```typescript
const buttonSizes = {
  sm: {
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[4],
    fontSize: fontSizes.sm,
  },
  md: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    fontSize: fontSizes.md,
  },
  lg: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    fontSize: fontSizes.lg,
  },
};
```

### Input Field

```tsx
<View style={{ marginBottom: spacing[4] }}>
  <Text style={{
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    color: neutral[700],
    marginBottom: spacing[2],
  }}>
    Label
  </Text>
  <TextInput
    style={{
      borderWidth: 1,
      borderColor: neutral[300],
      borderRadius: borderRadius.md,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      fontSize: fontSizes.md,
      color: neutral[900],
      minHeight: 44,
    }}
    placeholder="Enter text..."
    placeholderTextColor={neutral[400]}
  />
</View>
```

### Card

```tsx
<View style={{
  backgroundColor: neutral[0],
  borderRadius: borderRadius.lg,
  padding: spacing[4],
  ...shadows.md,
}}>
  <Text style={{
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.bold,
    marginBottom: spacing[2],
  }}>
    Card Title
  </Text>
  <Text style={{
    fontSize: fontSizes.md,
    color: neutral[600],
  }}>
    Card content goes here
  </Text>
</View>
```

### Badge

```tsx
<View style={{
  backgroundColor: semantic.success.main,
  borderRadius: borderRadius.full,
  paddingVertical: spacing[1],
  paddingHorizontal: spacing[3],
}}>
  <Text style={{
    color: neutral[0],
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.semibold,
  }}>
    Badge
  </Text>
</View>
```

---

## Icons

### Icon Sizes

```typescript
const iconSizes = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
};
```

### Usage

```tsx
import { Ionicons } from '@expo/vector-icons';

<Ionicons
  name="checkmark-circle"
  size={iconSizes.md}
  color={semantic.success.main}
/>
```

### Guidelines

- Use consistent icon library (@expo/vector-icons)
- Match icon size to text size
- Maintain 44x44 minimum touch target for interactive icons
- Use semantic colors for status icons
- Always provide accessibility labels

---

## Animations

### Duration

```typescript
const duration = {
  fast: 150,
  normal: 300,
  slow: 500,
};
```

### Easing

```typescript
import { Easing } from 'react-native';

const easing = {
  easeIn: Easing.in(Easing.ease),
  easeOut: Easing.out(Easing.ease),
  easeInOut: Easing.inOut(Easing.ease),
  spring: Easing.elastic(1),
};
```

### Common Animations

**Fade In**
```tsx
const fadeAnim = useRef(new Animated.Value(0)).current;

Animated.timing(fadeAnim, {
  toValue: 1,
  duration: duration.normal,
  easing: easing.easeOut,
  useNativeDriver: true,
}).start();

<Animated.View style={{ opacity: fadeAnim }}>
  {/* Content */}
</Animated.View>
```

**Slide In**
```tsx
const slideAnim = useRef(new Animated.Value(100)).current;

Animated.spring(slideAnim, {
  toValue: 0,
  useNativeDriver: true,
}).start();

<Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
  {/* Content */}
</Animated.View>
```

---

## Accessibility

### Touch Targets

Minimum touch target size: **44x44pt** (iOS) / **48x48dp** (Android)

```tsx
<TouchableOpacity
  style={{
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  }}
  accessibilityLabel="Close"
  accessibilityRole="button"
>
  <Icon name="close" size={24} />
</TouchableOpacity>
```

### Color Contrast

All text must meet WCAG 2.1 Level AA:
- Normal text: 4.5:1 minimum
- Large text (18pt+): 3:1 minimum

### Labels

Always provide accessibility labels for interactive elements:

```tsx
<TouchableOpacity
  accessibilityLabel="Submit form"
  accessibilityHint="Submits the registration form"
  accessibilityRole="button"
>
  <Text>Submit</Text>
</TouchableOpacity>
```

---

## Dark Mode

### Color Tokens (Dark)

```typescript
const darkColors = {
  background: {
    primary: neutral[900],
    secondary: neutral[800],
    tertiary: neutral[700],
  },
  text: {
    primary: neutral[50],
    secondary: neutral[300],
    tertiary: neutral[500],
  },
  border: neutral[700],
};
```

### Implementation

```tsx
import { useColorScheme } from 'react-native';

function ThemedComponent() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={{
      backgroundColor: isDark ? darkColors.background.primary : neutral[0],
    }}>
      <Text style={{
        color: isDark ? darkColors.text.primary : neutral[900],
      }}>
        Themed text
      </Text>
    </View>
  );
}
```

---

## Best Practices

### Do's

✅ Use design tokens consistently
✅ Maintain minimum touch target sizes (44x44)
✅ Ensure sufficient color contrast (4.5:1)
✅ Provide accessibility labels for all interactive elements
✅ Use semantic color names (success, error, warning)
✅ Follow spacing scale (multiples of 4px)
✅ Use appropriate font sizes for hierarchy
✅ Test in both light and dark modes
✅ Keep animations subtle and purposeful
✅ Use proper component variants (primary, secondary, etc.)

### Don'ts

❌ Don't use arbitrary spacing values
❌ Don't skip accessibility properties
❌ Don't nest touchable components
❌ Don't use colors outside the defined palette
❌ Don't create tiny touch targets (<44px)
❌ Don't use low contrast text combinations
❌ Don't hardcode font sizes
❌ Don't forget to test on actual devices
❌ Don't use long, verbose labels
❌ Don't override platform conventions unnecessarily

---

## Component Checklist

When creating a new component:

- [ ] Uses design tokens for colors
- [ ] Uses spacing scale consistently
- [ ] Uses typography scale
- [ ] Meets minimum touch target size
- [ ] Passes color contrast requirements
- [ ] Has proper accessibility labels
- [ ] Has accessibility role defined
- [ ] Supports dark mode
- [ ] Has proper TypeScript types
- [ ] Is responsive to different screen sizes
- [ ] Has consistent border radius
- [ ] Uses semantic colors appropriately
- [ ] Has focus states defined
- [ ] Has loading states (if applicable)
- [ ] Has error states (if applicable)
- [ ] Follows platform conventions
- [ ] Is tested on iOS and Android

---

## Design Tokens File

Create a centralized tokens file:

```typescript
// src/theme/tokens.ts
export const tokens = {
  colors: {
    primary,
    secondary,
    neutral,
    semantic,
  },
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  spacing,
  borderRadius,
  shadows,
  iconSizes,
  duration,
  easing,
};
```

Usage:

```tsx
import { tokens } from '@/theme/tokens';

<View style={{
  padding: tokens.spacing[4],
  backgroundColor: tokens.colors.primary[500],
  borderRadius: tokens.borderRadius.md,
}}>
  {/* Content */}
</View>
```

---

## Resources

- [Material Design](https://material.io/design)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [React Native Styling](https://reactnative.dev/docs/style)
- [Expo Vector Icons](https://icons.expo.fyi/)

---

## Maintenance

This design system should be:
- **Reviewed quarterly** for consistency
- **Updated** when adding new components
- **Versioned** alongside the app
- **Documented** with examples
- **Enforced** through code reviews
- **Tested** for accessibility compliance

For questions or suggestions, contact the design team or open an issue in the repository.

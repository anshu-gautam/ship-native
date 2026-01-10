# Accessibility Testing Guide

Complete guide to testing and ensuring accessibility (a11y) in your React Native app.

## Overview

This project includes comprehensive accessibility testing tools:

- ✅ WCAG 2.1 Level AA/AAA compliance checking
- ✅ Color contrast validation
- ✅ Touch target size validation
- ✅ Accessibility label validation
- ✅ Screen reader testing utilities
- ✅ Automated accessibility linting
- ✅ Runtime accessibility auditing

## Quick Start

```bash
# Run accessibility linter
npm run lint:a11y

# Run all tests (including accessibility tests)
npm test
```

## Accessibility Standards

### WCAG 2.1 Compliance Levels

| Level | Requirements | Use Case |
|-------|-------------|----------|
| **A** | Basic accessibility | Minimum requirement |
| **AA** | Recommended standard | Most apps should target this |
| **AAA** | Enhanced accessibility | Government/high-security apps |

### Color Contrast Requirements

| Text Type | Level AA | Level AAA |
|-----------|----------|-----------|
| Normal text | 4.5:1 | 7:1 |
| Large text (18pt+/14pt+ bold) | 3:1 | 4.5:1 |

### Touch Target Sizes

| Platform | Minimum Size |
|----------|--------------|
| iOS | 44x44 points |
| Android | 48x48 dp |

## Using the Accessibility Auditor

### In Tests (Jest)

```typescript
import {
  AccessibilityAuditor,
  validateColorContrast,
  validateTouchTargetSize,
  validateAccessibilityLabel,
  a11yTestHelpers,
} from '@/lib/accessibility';

describe('MyButton', () => {
  it('meets accessibility standards', () => {
    const auditor = new AccessibilityAuditor();

    // Audit the button
    auditor.auditInteractiveElement({
      label: 'Submit form',
      width: 48,
      height: 48,
      foreground: '#000000',
      background: '#FFFFFF',
      elementName: 'Submit Button',
    });

    // Generate report
    const report = auditor.generateReport();

    expect(report.passed).toBe(true);
    expect(report.wcagLevel).toBe('AAA');
    expect(report.score).toBe(100);
  });
});
```

### Individual Validators

```typescript
// Validate color contrast
const contrastResult = validateColorContrast('#000000', '#FFFFFF');
console.log(contrastResult);
// {
//   ratio: 21,
//   passesAA: true,
//   passesAAA: true,
//   level: 'AAA'
// }

// Validate touch target size
const sizeResult = validateTouchTargetSize(48, 48);
console.log(sizeResult); // { valid: true }

// Validate accessibility label
const labelResult = validateAccessibilityLabel('Submit form');
console.log(labelResult); // { valid: true }
```

### Test Helpers

```typescript
import { a11yTestHelpers } from '@/lib/accessibility';

// Assert element has valid accessibility label
const element = { props: { accessibilityLabel: 'Submit' } };
const result = a11yTestHelpers.assertHasAccessibilityLabel(element);
expect(result.pass).toBe(true);

// Assert touch target size
const result2 = a11yTestHelpers.assertHasTouchTargetSize(element);

// Assert color contrast
const result3 = a11yTestHelpers.assertColorContrast(
  '#000000',
  '#FFFFFF',
  'AA'
);
```

## Using the React Hook

```typescript
import { useAccessibilityAudit } from '@/hooks/useAccessibilityAudit';

function MyComponent() {
  const { audit, report, issues, reset } = useAccessibilityAudit();

  useEffect(() => {
    // Audit component on mount
    audit.interactiveElement({
      label: 'Submit',
      width: 100,
      height: 50,
      foreground: '#000',
      background: '#FFF',
      elementName: 'Submit Button',
    });

    // Check for issues
    if (issues.length > 0) {
      console.warn('Accessibility issues found:', issues);
    }

    // Generate report
    const finalReport = report();
    console.log('A11y Score:', finalReport.score);
    console.log('WCAG Level:', finalReport.wcagLevel);

    return () => reset();
  }, []);

  return <View>{/* ... */}</View>;
}
```

## Screen Reader Testing

### Check if Screen Reader is Enabled

```typescript
import { isScreenReaderEnabled } from '@/lib/accessibility';

const enabled = await isScreenReaderEnabled();
if (enabled) {
  console.log('Screen reader is active');
}
```

### Announce to Screen Reader

```typescript
import { announceForAccessibility } from '@/lib/accessibility';

// Announce important messages
announceForAccessibility('Form submitted successfully');
```

### Set Accessibility Focus

```typescript
import { setAccessibilityFocus } from '@/lib/accessibility';
import { findNodeHandle } from 'react-native';

const buttonRef = useRef(null);

const focusButton = () => {
  const reactTag = findNodeHandle(buttonRef.current);
  if (reactTag) {
    setAccessibilityFocus(reactTag);
  }
};
```

## Automated Linting

### Run Accessibility Linter

```bash
npm run lint:a11y
```

This checks for common accessibility issues:
- Missing accessibility labels
- Invalid accessibility properties
- Nested touchable components
- Invalid accessibility roles
- Missing hints for complex components

### ESLint Rules

Configured in `.eslintrc.js`:

```javascript
'react-native-a11y/has-accessibility-props': 'warn',
'react-native-a11y/has-valid-accessibility-role': 'error',
'react-native-a11y/no-nested-touchables': 'error',
// ... and more
```

## Building Accessible Components

### Button Component

```typescript
import { TouchableOpacity, Text } from 'react-native';

function AccessibleButton({ onPress, label, hint }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityRole="button"
      style={{ minWidth: 48, minHeight: 48 }}
    >
      <Text>{label}</Text>
    </TouchableOpacity>
  );
}

// Usage
<AccessibleButton
  label="Submit form"
  hint="Submits the registration form"
  onPress={handleSubmit}
/>
```

### Image Component

```typescript
<Image
  source={profilePic}
  accessibilityLabel="Profile picture of John Doe"
  accessibilityRole="image"
  style={{ width: 100, height: 100 }}
/>
```

### Form Input

```typescript
<TextInput
  accessibilityLabel="Email address"
  accessibilityHint="Enter your email for login"
  placeholder="Email"
  autoComplete="email"
  textContentType="emailAddress"
/>
```

### Loading State

```typescript
<View
  accessibilityLabel="Loading"
  accessibilityLiveRegion="polite"
  accessible={true}
>
  <ActivityIndicator />
</View>
```

## Color Contrast Examples

### Good Contrast (WCAG AAA)

```typescript
// Black on white: 21:1
<Text style={{ color: '#000000', backgroundColor: '#FFFFFF' }}>
  High contrast text
</Text>

// Dark gray on white: 7:1
<Text style={{ color: '#595959', backgroundColor: '#FFFFFF' }}>
  AAA compliant text
</Text>
```

### Minimum Contrast (WCAG AA)

```typescript
// Gray on white: 4.5:1
<Text style={{ color: '#767676', backgroundColor: '#FFFFFF' }}>
  AA compliant text
</Text>
```

### Poor Contrast (Fails WCAG)

```typescript
// ❌ Light gray on white: 1.5:1
<Text style={{ color: '#CCCCCC', backgroundColor: '#FFFFFF' }}>
  Poor contrast - avoid this
</Text>
```

## Touch Target Examples

### Good Touch Targets

```typescript
// ✅ Meets minimum size
<TouchableOpacity style={{ width: 48, height: 48 }}>
  <Icon name="close" size={24} />
</TouchableOpacity>

// ✅ Larger is better
<TouchableOpacity style={{ width: 60, height: 60 }}>
  <Text>Submit</Text>
</TouchableOpacity>
```

### Poor Touch Targets

```typescript
// ❌ Too small - hard to tap
<TouchableOpacity style={{ width: 20, height: 20 }}>
  <Icon name="close" size={16} />
</TouchableOpacity>

// Fix: Add padding or increase size
<TouchableOpacity
  style={{ width: 48, height: 48, padding: 14 }}
>
  <Icon name="close" size={20} />
</TouchableOpacity>
```

## Accessibility Labels Best Practices

### Good Labels

```typescript
// ✅ Descriptive and concise
<TouchableOpacity accessibilityLabel="Delete message">
  <Icon name="trash" />
</TouchableOpacity>

// ✅ Indicates state
<TouchableOpacity
  accessibilityLabel={`${isMuted ? 'Unmute' : 'Mute'} notifications`}
>
  <Icon name={isMuted ? 'bell-off' : 'bell'} />
</TouchableOpacity>

// ✅ Provides context
<Image
  accessibilityLabel="Product photo: Red running shoes"
  source={productImage}
/>
```

### Poor Labels

```typescript
// ❌ Too generic
<TouchableOpacity accessibilityLabel="Button">

// ❌ Too verbose
<TouchableOpacity accessibilityLabel="This is a button that when pressed will delete the currently selected message from your inbox permanently">

// ❌ No label at all
<TouchableOpacity onPress={handleDelete}>
```

## Testing Checklist

Use this checklist for each screen:

### Visual

- [ ] All text meets minimum 4.5:1 contrast ratio (AA)
- [ ] Important text meets 7:1 contrast ratio (AAA)
- [ ] Touch targets are at least 48x48dp (Android) / 44x44pt (iOS)
- [ ] Focus indicators are clearly visible

### Labels

- [ ] All interactive elements have accessibility labels
- [ ] Labels are concise and descriptive
- [ ] Images have meaningful alt text
- [ ] Decorative elements are marked as such

### Screen Reader

- [ ] Navigate screen using TalkBack (Android) / VoiceOver (iOS)
- [ ] All interactive elements are reachable
- [ ] Reading order makes sense
- [ ] Form inputs announce their purpose
- [ ] Error messages are announced

### Dynamic Content

- [ ] Loading states announce to screen reader
- [ ] Errors announce to screen reader
- [ ] Success messages announce to screen reader
- [ ] Live regions update appropriately

## Testing with Real Screen Readers

### iOS (VoiceOver)

1. Enable: Settings → Accessibility → VoiceOver
2. Triple-click home/side button to toggle
3. Swipe right/left to navigate
4. Double-tap to activate

### Android (TalkBack)

1. Enable: Settings → Accessibility → TalkBack
2. Volume keys shortcut to toggle
3. Swipe right/left to navigate
4. Double-tap to activate

## Common Issues and Fixes

### Issue: Missing accessibility labels

```typescript
// ❌ Bad
<TouchableOpacity onPress={handlePress}>
  <Icon name="close" />
</TouchableOpacity>

// ✅ Good
<TouchableOpacity
  onPress={handlePress}
  accessibilityLabel="Close"
  accessibilityRole="button"
>
  <Icon name="close" />
</TouchableOpacity>
```

### Issue: Nested touchables

```typescript
// ❌ Bad - nested touchables confuse screen readers
<TouchableOpacity>
  <View>
    <TouchableOpacity>
      <Text>Nested button</Text>
    </TouchableOpacity>
  </View>
</TouchableOpacity>

// ✅ Good - single touchable
<TouchableOpacity accessibilityLabel="Complete action">
  <View>
    <Text>Complete action</Text>
  </View>
</TouchableOpacity>
```

### Issue: Poor color contrast

```typescript
// ❌ Bad - fails WCAG
const styles = StyleSheet.create({
  text: {
    color: '#CCCCCC',
    backgroundColor: '#FFFFFF',
  },
});

// ✅ Good - passes WCAG AA
const styles = StyleSheet.create({
  text: {
    color: '#767676',
    backgroundColor: '#FFFFFF',
  },
});
```

### Issue: Small touch targets

```typescript
// ❌ Bad - too small
<TouchableOpacity style={{ width: 24, height: 24 }}>
  <Icon name="close" size={20} />
</TouchableOpacity>

// ✅ Good - meets minimum
<TouchableOpacity
  style={{
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  }}
>
  <Icon name="close" size={20} />
</TouchableOpacity>
```

## Automated Testing

### Jest Test Example

```typescript
import { render } from '@testing-library/react-native';
import { a11yTestHelpers } from '@/lib/accessibility';
import MyButton from './MyButton';

describe('MyButton Accessibility', () => {
  it('has valid accessibility label', () => {
    const { getByRole } = render(<MyButton label="Submit" />);
    const button = getByRole('button');

    const result = a11yTestHelpers.assertHasAccessibilityLabel(
      button,
      'Submit'
    );
    expect(result.pass).toBe(true);
  });

  it('has sufficient touch target size', () => {
    const { getByRole } = render(<MyButton label="Submit" />);
    const button = getByRole('button');

    const result = a11yTestHelpers.assertHasTouchTargetSize(button);
    expect(result.pass).toBe(true);
  });

  it('has good color contrast', () => {
    const result = a11yTestHelpers.assertColorContrast(
      '#000000',
      '#FFFFFF',
      'AA'
    );
    expect(result.pass).toBe(true);
  });
});
```

## Continuous Integration

Add to your CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Accessibility Linting
  run: npm run lint:a11y

- name: Run Tests (including a11y)
  run: npm test
```

## Resources

### Official Documentation

- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [iOS Accessibility](https://developer.apple.com/accessibility/)
- [Android Accessibility](https://developer.android.com/guide/topics/ui/accessibility)

### Tools

- [Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

### Testing

- [Accessibility Scanner (Android)](https://play.google.com/store/apps/details?id=com.google.android.apps.accessibility.auditor)
- [Accessibility Inspector (Xcode)](https://developer.apple.com/library/archive/documentation/Accessibility/Conceptual/AccessibilityMacOSX/OSXAXTestingApps.html)

## Summary

Accessibility is not optional - it's a requirement for inclusive app design. This testing infrastructure helps you:

1. **Catch issues early** with automated linting
2. **Validate compliance** with WCAG standards
3. **Test systematically** with comprehensive utilities
4. **Monitor quality** with scoring and reporting
5. **Build confidently** with clear guidelines

Remember: **Accessibility benefits everyone**, not just users with disabilities.

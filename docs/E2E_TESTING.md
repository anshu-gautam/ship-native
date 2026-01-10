# E2E Testing with Maestro

This project uses [Maestro](https://maestro.mobile.dev/) for end-to-end testing. Maestro is a simple, declarative mobile UI testing framework that works for both iOS and Android.

## Why Maestro?

- **Simpler than Detox** - YAML-based, no complex setup
- **Cross-platform** - Same tests work on iOS and Android
- **No code needed** - Declarative syntax
- **Fast execution** - Built-in wait mechanisms
- **Better reliability** - Handles flakiness automatically

## Installation

### macOS (Homebrew)
```bash
brew tap mobile-dev-inc/tap
brew install maestro
```

### Linux/macOS (curl)
```bash
curl -Ls "https://get.maestro.mobile.dev" | bash
export PATH="$PATH":"$HOME/.maestro/bin"
```

### Windows
```bash
# Use WSL2 and follow Linux instructions
```

Verify installation:
```bash
maestro --version
```

## Running Tests

### Run all tests
```bash
maestro test .maestro/
```

### Run specific test
```bash
maestro test .maestro/auth-flow.yaml
maestro test .maestro/navigation-flow.yaml
maestro test .maestro/payment-flow.yaml
```

### Run with specific device
```bash
# iOS Simulator
maestro test .maestro/ --device "iPhone 15 Pro"

# Android Emulator
maestro test .maestro/ --device "Pixel 7"
```

### Run on real device
```bash
# Connect device via USB
maestro test .maestro/ --device <device-id>
```

## Available Tests

### 1. Authentication Flow (`auth-flow.yaml`)
Tests the complete authentication flow:
- Sign up with email/password
- Sign out
- Sign in with existing account
- Error handling

### 2. Navigation Flow (`navigation-flow.yaml`)
Tests app navigation:
- Navigate between tabs
- Go to profile/settings
- Back navigation
- Deep linking

### 3. Payment Flow (`payment-flow.yaml`)
Tests subscription purchase:
- View subscription plans
- Select plan
- Pricing display
- Restore purchases
- Cancel flow

## Writing New Tests

Create a new `.yaml` file in `.maestro/` directory:

```yaml
appId: ${APP_ID}
---
- launchApp
- tapOn: "Button Text"
- inputText: "Text to enter"
- assertVisible: "Expected text"
- scroll
- swipe
```

### Common Commands

#### Navigation
```yaml
- tapOn: "Button"           # Tap on element
- tapOn:                    # Tap with options
    text: "Button"
    index: 0
- longPressOn: "Element"    # Long press
- swipe:                     # Swipe gesture
    direction: UP
```

#### Input
```yaml
- inputText: "Hello"        # Type text
- eraseText                 # Clear text field
- hideKeyboard              # Dismiss keyboard
```

#### Assertions
```yaml
- assertVisible: "Text"     # Element is visible
- assertNotVisible: "Text"  # Element is not visible
- assertTrue: ${VALUE}      # Condition is true
```

#### Wait
```yaml
- waitForAnimationToEnd
- waitUntilVisible: "Element"
- runFlow:                  # Run sub-flow
    file: other-test.yaml
```

## CI/CD Integration

Tests run automatically on GitHub Actions. See `.github/workflows/e2e-tests.yml`.

### Run locally before pushing
```bash
# Start metro bundler
npm start

# In another terminal, run Maestro tests
maestro test .maestro/
```

## Debugging

### Record video
```bash
maestro test .maestro/auth-flow.yaml --record
```

### Studio mode (interactive)
```bash
maestro studio
```

### View logs
```bash
maestro test .maestro/ --debug
```

## Best Practices

1. **Use unique test IDs** - Add `testID` prop to components
2. **Wait for animations** - Add `waitForAnimationToEnd`
3. **Use environment variables** - Keep sensitive data in env
4. **Keep tests independent** - Each test should clean up
5. **Test happy paths first** - Then add error scenarios

## Troubleshooting

### Test fails randomly
- Add `waitForAnimationToEnd` before assertions
- Increase timeout in config
- Check for flaky animations

### Element not found
- Verify element has `testID` prop
- Check if element is visible on screen
- Use `waitUntilVisible` before interaction

### App doesn't launch
- Verify `appId` in config matches your bundle ID
- Check if app is installed on device/simulator
- Try `maestro test --clear-state`

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [Command Reference](https://maestro.mobile.dev/api-reference/commands)
- [Examples](https://github.com/mobile-dev-inc/maestro/tree/main/examples)

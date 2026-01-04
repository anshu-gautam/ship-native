# App Store Screenshots Guide

Complete guide to generating professional screenshots for App Store and Play Store submissions using automated testing.

## Overview

This project includes automated screenshot generation using Maestro E2E testing framework. Screenshots are generated for all required device sizes and can be customized for different app scenarios.

## Quick Start

```bash
# Generate screenshots for iOS
npm run screenshots:ios

# Generate screenshots for Android
npm run screenshots:android

# Generate for both platforms
npm run screenshots:all
```

## Prerequisites

### 1. Install Maestro

```bash
# macOS/Linux
curl -fsSL "https://get.maestro.mobile.dev" | bash

# Verify installation
maestro --version
```

### 2. Build Your App

**iOS:**
```bash
# Development build
npx expo run:ios

# Or production build
eas build --platform ios --profile preview
```

**Android:**
```bash
# Development build
npx expo run:android

# Or production build
eas build --platform android --profile preview
```

## Supported Devices

### iOS

| Device | Screen Size | Resolution | App Store Requirement |
|--------|------------|------------|----------------------|
| iPhone 15 Pro Max | 6.7" | 1290x2796 | Required |
| iPhone 15 Pro | 6.1" | 1179x2556 | Required |
| iPhone SE (3rd gen) | 4.7" | 750x1334 | Optional |
| iPad Pro (12.9") | 12.9" | 2048x2732 | Required for iPad |

### Android

| Device | Screen Size | Resolution | Play Store Requirement |
|--------|------------|------------|----------------------|
| Pixel 7 Pro | 6.7" | 1440x3120 | Required |
| Pixel 7 | 6.3" | 1080x2400 | Required |
| Pixel Tablet | 10.95" | 1600x2560 | Required for Tablet |

## Screenshot Scenarios

The generator creates screenshots for these scenarios:

1. **Onboarding** - Welcome screen and app introduction
2. **Home** - Main dashboard and primary features
3. **Features** - Showcase of key functionality
4. **Profile** - User profile and settings
5. **Dark Mode** - App in dark theme

## Directory Structure

```
screenshots/
├── ios/
│   ├── iPhone-15-Pro-Max/
│   │   ├── onboarding.png
│   │   ├── home.png
│   │   ├── features.png
│   │   ├── profile.png
│   │   └── dark-mode.png
│   ├── iPhone-15-Pro/
│   └── iPad-Pro/
├── android/
│   ├── Pixel-7-Pro/
│   │   ├── onboarding.png
│   │   ├── home.png
│   │   └── ...
│   ├── Pixel-7/
│   └── Pixel-Tablet/
└── index.html (Preview page)
```

## Customizing Screenshots

### Adding New Scenarios

1. **Update the scenarios array** in `scripts/generate-screenshots.js`:

```javascript
const SCREENSHOT_SCENARIOS = [
  // ... existing scenarios
  {
    name: 'messaging',
    title: 'Messaging',
    description: 'Chat and messaging features',
  },
];
```

2. **Create a Maestro flow** in `.maestro/screenshots/messaging.yaml`:

```yaml
# Messaging Screenshot Flow
appId: com.yourcompany.yourapp

---

- launchApp
- waitForAnimationToEnd

# Navigate to messaging
- tapOn: "Messages"
- waitForAnimationToEnd

# Take screenshot
- takeScreenshot: messaging
```

### Customizing Existing Flows

Edit the YAML files in `.maestro/screenshots/`:

```yaml
# .maestro/screenshots/home.yaml

appId: com.yourcompany.yourapp

---

- launchApp
- waitForAnimationToEnd

# Custom navigation
- tapOn: "Skip Onboarding"
- tapOn: "Home Tab"

# Wait for data to load
- wait: 2000

# Scroll to specific position
- scroll

# Take screenshot
- takeScreenshot: home

# Capture additional views
- tapOn: "Featured"
- takeScreenshot: home_featured
```

## Maestro Flow Tips

### Common Actions

```yaml
# Tap element
- tapOn: "Button Text"
- tapOn:
    id: "button-id"

# Input text
- inputText: "test@example.com"

# Scroll
- scroll
- scroll:
    direction: UP

# Wait
- wait: 1000  # milliseconds
- waitForAnimationToEnd

# Take screenshot
- takeScreenshot: screenshot-name

# Assert element exists
- assertVisible: "Welcome"

# Toggle switch
- toggleSwitch: "Dark Mode"

# Navigate back
- back
```

### Best Practices

**1. Always wait for animations:**
```yaml
- tapOn: "Next"
- waitForAnimationToEnd
- takeScreenshot: next-screen
```

**2. Wait for content to load:**
```yaml
- tapOn: "Dashboard"
- wait: 2000  # Wait for API data
- takeScreenshot: dashboard
```

**3. Use descriptive screenshot names:**
```yaml
# Good
- takeScreenshot: home_dashboard_logged_in

# Avoid
- takeScreenshot: screen1
```

**4. Hide sensitive data:**
```yaml
# Use test accounts
- inputText:
    id: "email"
    text: "demo@example.com"
```

## Screenshot Requirements

### iOS App Store

**iPhone:**
- 6.7" display (required): 1290 x 2796 pixels
- 6.5" display (required): 1284 x 2778 pixels
- 5.5" display (optional): 1242 x 2208 pixels

**iPad:**
- 12.9" display (required): 2048 x 2732 pixels

**Requirements:**
- Minimum 1 screenshot, maximum 10
- JPG or PNG format
- RGB color space
- No alpha channels
- Max file size: 500 MB

### Google Play Store

**Phone:**
- Minimum dimension: 320px
- Maximum dimension: 3840px
- Minimum screenshots: 2
- Maximum screenshots: 8

**Tablet (if supporting tablets):**
- 7-inch screenshots required
- 10-inch screenshots required

**Requirements:**
- JPG or 24-bit PNG (no alpha)
- Minimum: 2 screenshots
- Maximum: 8 screenshots

## Viewing Generated Screenshots

After generation, open `screenshots/index.html` in your browser:

```bash
# macOS
open screenshots/index.html

# Linux
xdg-open screenshots/index.html

# Windows
start screenshots/index.html
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/screenshots.yml
name: Generate Screenshots

on:
  push:
    tags:
      - 'v*'

jobs:
  screenshots:
    runs-on: macos-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Maestro
        run: |
          curl -fsSL "https://get.maestro.mobile.dev" | bash
          echo "$HOME/.maestro/bin" >> $GITHUB_PATH

      - name: Build iOS app
        run: eas build --platform ios --profile preview --local

      - name: Generate iOS screenshots
        run: npm run screenshots:ios

      - name: Build Android app
        run: eas build --platform android --profile preview --local

      - name: Generate Android screenshots
        run: npm run screenshots:android

      - name: Upload screenshots
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: screenshots/
```

## Troubleshooting

### Issue: Maestro not found

```bash
# Install Maestro
curl -fsSL "https://get.maestro.mobile.dev" | bash

# Add to PATH
export PATH="$HOME/.maestro/bin:$PATH"
```

### Issue: App not found

Ensure your app is built and running:

```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### Issue: Screenshots are blank

**Causes:**
- App didn't finish loading
- Wrong screen captured

**Solutions:**
- Add longer wait times
- Check navigation steps
- Verify element IDs

```yaml
# Add more wait time
- waitForAnimationToEnd
- wait: 3000  # Wait for content
- takeScreenshot: screen
```

### Issue: Element not found

**Solutions:**
- Use accessibility labels
- Check element text exact match
- Try using test IDs

```yaml
# Use accessibility label
- tapOn:
    label: "Submit Button"

# Use test ID
- tapOn:
    id: "submit-button-test-id"
```

### Issue: Wrong device resolution

Verify device configuration in the script matches your requirements.

## Advanced Customization

### Device-Specific Scenarios

```javascript
// In scripts/generate-screenshots.js

const DEVICE_SPECIFIC_SCENARIOS = {
  'iPad Pro': ['tablet-dashboard', 'tablet-split-view'],
  'iPhone SE': ['compact-mode'],
};
```

### Localization

Generate screenshots for different languages:

```yaml
# .maestro/screenshots/home-es.yaml

- launchApp
  env:
    LOCALE: es

- waitForAnimationToEnd
- takeScreenshot: home-es
```

### Custom Filters/Framing

Add device frames using tools like:
- [Screenshot Framer](https://www.screenshotframer.com/)
- [Devices by Facebook](https://facebook.github.io/design/devices)
- [AppLaunchpad](https://theapplaunchpad.com/)

## Best Practices

### Do's

✅ Use real or realistic data
✅ Show key features prominently
✅ Use light and dark mode variants
✅ Highlight unique selling points
✅ Show user benefits, not just UI
✅ Keep text minimal and readable
✅ Use high-quality images
✅ Test on actual devices
✅ Update screenshots with each major release
✅ Localize for major markets

### Don'ts

❌ Don't show placeholder text
❌ Don't include sensitive/personal data
❌ Don't use lorem ipsum
❌ Don't show errors or bugs
❌ Don't include competitor names
❌ Don't use poor quality images
❌ Don't show outdated UI
❌ Don't violate platform guidelines
❌ Don't mislead users about features
❌ Don't use copyrighted content

## Screenshot Checklist

Before submission:

- [ ] All required device sizes covered
- [ ] Screenshots are high quality (not blurry)
- [ ] No placeholder or dummy text
- [ ] All text is legible
- [ ] Key features are highlighted
- [ ] Screenshots represent current version
- [ ] Light and dark modes (if supported)
- [ ] Proper aspect ratios maintained
- [ ] No sensitive data visible
- [ ] Localized for target markets
- [ ] File sizes under limits
- [ ] Correct file formats (JPG/PNG)
- [ ] RGB color space (no CMYK)
- [ ] No alpha channels (iOS)
- [ ] Screenshots tell a story
- [ ] Complies with platform guidelines

## App Store Optimization

### Screenshot Order

1. **First screenshot is most important** - Users see it in search results
2. **Tell a story** - Guide users through your app's value
3. **Lead with benefits** - Show what users gain, not just features
4. **Progressive detail** - Start broad, get specific

### Adding Text Overlays

While the script generates raw screenshots, you can add text overlays using:

- **Figma** - Design screenshots with overlays
- **Sketch** - Mac app for design
- **Canva** - Online design tool
- **Screenshot Designer** - Specialized tools

**Text overlay tips:**
- Keep it brief (5-7 words)
- Use large, readable fonts
- High contrast with background
- Consistent branding
- Highlight key benefits

## Resources

- [Maestro Documentation](https://maestro.mobile.dev/)
- [App Store Screenshots Guidelines](https://developer.apple.com/app-store/product-page/)
- [Google Play Screenshot Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Screenshot Sizes Reference](https://appradar.com/blog/app-store-screenshot-sizes)
- [ASO Best Practices](https://developer.apple.com/app-store/app-store-optimization/)

## Support

For issues or questions:
- Check Maestro logs: `~/.maestro/logs`
- Review flow files: `.maestro/screenshots/`
- Verify device configurations in script
- Test flows manually: `maestro test .maestro/screenshots/home.yaml`

---

**Last Updated:** 2025-01-15
**Maintainer:** Development Team

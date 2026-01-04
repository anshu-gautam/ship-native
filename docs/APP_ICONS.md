# App Icon & Splash Screen Generator

Guide for generating app icons and splash screens for iOS and Android.

## Overview

Generate all required app icon sizes and splash screens from a single source image.

## Requirements

### App Icon Source

- **Format**: PNG with transparency
- **Size**: 1024x1024 pixels
- **Color**: RGB or RGBA
- **Location**: `assets/icon-source.png`

**Design Guidelines:**
- Use simple, recognizable design
- Avoid thin lines (min 2px)
- Test on small sizes (reduce to 29x29px)
- Ensure good contrast
- Don't include text (use app name instead)

### Splash Screen Source

- **Format**: PNG
- **Size**: 1242x2688 pixels (iPhone 14 Pro Max)
- **Aspect Ratio**: Safe area in center
- **Location**: `assets/splash-source.png`

**Design Guidelines:**
- Keep content in center 50%
- Use brand colors
- Simple logo or branding
- No text (auto-added by system)

## Quick Start

### 1. Create Source Images

**Using Figma:**
1. Create 1024x1024px frame for icon
2. Design your icon
3. Export as PNG (2x or higher)
4. Save as `assets/icon-source.png`

**Using Photoshop:**
1. New file: 1024x1024px, 72 DPI
2. Design on transparent background
3. Save as PNG-24
4. Save as `assets/icon-source.png`

**Using Online Tools:**
- [Figma](https://figma.com)
- [Canva](https://canva.com)
- [Adobe Express](https://www.adobe.com/express/)

### 2. Generate Icons

```bash
npm run generate:icons
```

This will:
1. Update `app.json` with paths
2. Run `expo prebuild` to generate assets
3. Create iOS and Android icons
4. Create splash screens

### 3. Verify Generated Assets

**iOS:**
```
ios/YourApp/Images.xcassets/AppIcon.appiconset/
├── App-Icon-20x20@1x.png
├── App-Icon-20x20@2x.png
├── App-Icon-20x20@3x.png
├── App-Icon-29x29@1x.png
├── App-Icon-29x29@2x.png
├── App-Icon-29x29@3x.png
├── App-Icon-40x40@1x.png
├── App-Icon-40x40@2x.png
├── App-Icon-40x40@3x.png
├── App-Icon-60x60@2x.png
├── App-Icon-60x60@3x.png
├── App-Icon-76x76@1x.png
├── App-Icon-76x76@2x.png
├── App-Icon-83.5x83.5@2x.png
└── App-Icon-1024x1024@1x.png
```

**Android:**
```
android/app/src/main/res/
├── mipmap-mdpi/ic_launcher.png (48x48)
├── mipmap-hdpi/ic_launcher.png (72x72)
├── mipmap-xhdpi/ic_launcher.png (96x96)
├── mipmap-xxhdpi/ic_launcher.png (144x144)
├── mipmap-xxxhdpi/ic_launcher.png (192x192)
└── mipmap-xxxhdpi/ic_launcher_round.png (192x192)
```

## Manual Generation

### Using Expo

**Update app.json:**
```json
{
  "expo": {
    "icon": "./assets/icon-source.png",
    "splash": {
      "image": "./assets/splash-source.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "icon": "./assets/icon-source.png"
    },
    "android": {
      "icon": "./assets/icon-source.png",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

**Generate:**
```bash
npx expo prebuild --clean
```

### Using Online Tools

**App Icon Generator:**
- [App Icon Generator](https://appicon.co/)
- [MakeAppIcon](https://makeappicon.com/)
- [Icon Kitchen](https://icon.kitchen/)

**Process:**
1. Upload 1024x1024px icon
2. Download generated assets
3. Copy to appropriate directories

## Android Adaptive Icons

Android 8.0+ uses adaptive icons with foreground and background layers.

### Create Adaptive Icon

**assets/adaptive-icon.png:**
- Size: 1024x1024px
- Design in safe zone (centered 864x864px)
- Transparent background

**app.json:**
```json
{
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundColor": "#FFFFFF"
    }
  }
}
```

### Testing Adaptive Icons

Use Android Studio's Image Asset Studio:
1. Open Android Studio
2. Right-click `res` → New → Image Asset
3. Upload foreground image
4. Preview different shapes

## Splash Screen Customization

### Configure Splash Screen

**app.json:**
```json
{
  "splash": {
    "image": "./assets/splash-source.png",
    "resizeMode": "contain",  // or "cover"
    "backgroundColor": "#FFFFFF"
  }
}
```

**Resize Modes:**
- `contain`: Scale to fit (recommended)
- `cover`: Fill screen (may crop)
- `native`: No scaling

### Dark Mode Splash

**app.json:**
```json
{
  "splash": {
    "image": "./assets/splash.png",
    "dark": {
      "image": "./assets/splash-dark.png",
      "backgroundColor": "#000000"
    }
  }
}
```

## Testing

### iOS Simulator

```bash
npm run ios
```

Check icon on:
- Home screen
- App switcher
- Settings → General → iPhone Storage
- Spotlight search

### Android Emulator

```bash
npm run android
```

Check icon on:
- Home screen
- App drawer
- Recent apps
- Settings → Apps

### Physical Devices

Always test on real devices:
- Various screen sizes
- Different OS versions
- Light and dark modes

## Common Issues

### Icon Appears Blurry

**Problem:** Source image too small

**Solution:**
- Use minimum 1024x1024px
- Export at 2x or higher
- Use PNG format

### Icon Edges Cut Off

**Problem:** Design too close to edges

**Solution:**
- Keep design within safe area
- Add 10% padding around edges
- Test on round icon shapes (Android)

### Splash Screen Stretches

**Problem:** Wrong resize mode

**Solution:**
```json
{
  "splash": {
    "resizeMode": "contain"  // Don't use "cover"
  }
}
```

### Transparent Background Shows Black

**Problem:** Android doesn't support transparency

**Solution:**
```json
{
  "splash": {
    "backgroundColor": "#FFFFFF"  // Set explicit color
  }
}
```

## Best Practices

### 1. Simple Designs

```
✅ Good:
- Simple geometric shapes
- Bold colors
- Clear silhouette
- Recognizable at small sizes

❌ Bad:
- Detailed illustrations
- Thin lines
- Small text
- Complex gradients
```

### 2. Test All Sizes

```bash
# Generate icons
npm run generate:icons

# Test on multiple devices
npm run ios
npm run android
```

### 3. Brand Consistency

Match your brand colors and style:
- Use brand colors
- Match website/marketing
- Consistent across platforms

### 4. Accessibility

- High contrast
- Distinct from system apps
- Readable in dark mode

### 5. Platform Guidelines

**iOS:**
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/app-icons)
- No transparency
- No rounded corners (system adds)
- Fill entire square

**Android:**
- [Material Design Guidelines](https://material.io/design/iconography/product-icons.html)
- Support adaptive icons
- Test different shapes
- Provide foreground/background layers

## Icon Design Checklist

- [ ] 1024x1024px PNG source
- [ ] Transparent or solid background
- [ ] Design within safe area
- [ ] No text in icon
- [ ] Tested at small sizes (29x29px)
- [ ] High contrast
- [ ] Brand consistent
- [ ] Works in light and dark modes
- [ ] Generated assets verified
- [ ] Tested on iOS simulator
- [ ] Tested on Android emulator
- [ ] Tested on physical devices

## Resources

### Design Tools
- [Figma](https://figma.com) - Free design tool
- [Sketch](https://sketch.com) - Mac design tool
- [Adobe XD](https://www.adobe.com/products/xd.html) - Free design tool

### Generators
- [App Icon Generator](https://appicon.co/)
- [MakeAppIcon](https://makeappicon.com/)
- [Icon Kitchen](https://icon.kitchen/)

### Guidelines
- [iOS HIG](https://developer.apple.com/design/human-interface-guidelines/)
- [Material Design](https://material.io/design)
- [Expo Icons](https://docs.expo.dev/guides/app-icons/)

### Inspiration
- [Dribbble](https://dribbble.com/tags/app-icon)
- [Behance](https://www.behance.net/search?search=app+icon)
- [App Icon Book](https://www.appiconbook.com/)

## Next Steps

1. **Design Icon**: Create 1024x1024px PNG
2. **Design Splash**: Create 1242x2688px PNG
3. **Generate**: Run `npm run generate:icons`
4. **Test**: iOS and Android simulators
5. **Submit**: Include in app store submissions

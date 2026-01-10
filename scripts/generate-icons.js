#!/usr/bin/env node

/**
 * App Icon Generator
 *
 * Generates app icons for iOS and Android from a single source image
 * Uses expo-cli to generate icons
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SOURCE_ICON = 'assets/icon-source.png';
const SOURCE_SPLASH = 'assets/splash-source.png';
const APP_JSON = 'app.json';

console.log('🎨 App Icon & Splash Screen Generator\n');

// Check if source files exist
if (!fs.existsSync(SOURCE_ICON)) {
  console.error(`❌ Error: Source icon not found at ${SOURCE_ICON}`);
  console.log('\n📝 Instructions:');
  console.log('   1. Create a 1024x1024px PNG image');
  console.log(`   2. Save it as ${SOURCE_ICON}`);
  console.log('   3. Run this script again');
  process.exit(1);
}

if (!fs.existsSync(SOURCE_SPLASH)) {
  console.error(`❌ Error: Source splash screen not found at ${SOURCE_SPLASH}`);
  console.log('\n📝 Instructions:');
  console.log('   1. Create a 1242x2688px PNG image');
  console.log(`   2. Save it as ${SOURCE_SPLASH}`);
  console.log('   3. Run this script again');
  process.exit(1);
}

// Check if app.json exists
if (!fs.existsSync(APP_JSON)) {
  console.error(`❌ Error: ${APP_JSON} not found`);
  process.exit(1);
}

console.log('✅ Source files found\n');

// Read app.json
let appConfig;
try {
  const appConfigContent = fs.readFileSync(APP_JSON, 'utf8');
  appConfig = JSON.parse(appConfigContent);
} catch (error) {
  console.error('❌ Error reading app.json:', error.message);
  process.exit(1);
}

// Update app.json with icon and splash paths
console.log('📝 Updating app.json...');

if (!appConfig.expo) {
  appConfig.expo = {};
}

appConfig.expo.icon = `./${SOURCE_ICON}`;
appConfig.expo.splash = {
  image: `./${SOURCE_SPLASH}`,
  resizeMode: 'contain',
  backgroundColor: '#ffffff',
  ...(appConfig.expo.splash || {}),
};

// Write updated app.json
fs.writeFileSync(APP_JSON, JSON.stringify(appConfig, null, 2));
console.log('✅ Updated app.json\n');

// Run expo prebuild to generate native assets
console.log('🔨 Generating native assets...');
console.log('   This may take a few minutes...\n');

try {
  execSync('npx expo prebuild --clean', {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  console.log('\n✨ Icons and splash screens generated successfully!\n');
  console.log('📍 Generated files:');
  console.log('   iOS: ios/YourApp/Images.xcassets/AppIcon.appiconset/');
  console.log('   Android: android/app/src/main/res/mipmap-*/');
  console.log('   Splash: Both platforms\n');

  console.log('🎯 Next steps:');
  console.log('   1. Review generated icons');
  console.log('   2. Build your app: npm run build:ios or npm run build:android');
  console.log('   3. Test on physical devices\n');
} catch (error) {
  console.error('\n❌ Error generating assets:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('   - Ensure expo-cli is installed');
  console.log('   - Check that source images meet size requirements');
  console.log('   - Try running: npx expo install --fix\n');
  process.exit(1);
}

#!/usr/bin/env node

/**
 * Screen Generator Script
 *
 * Generates a new screen for Expo Router with:
 * - Screen file in app directory
 * - Optional test file
 * - Proper expo-router setup
 */

const fs = require('fs');
const path = require('path');

// Get screen name from command line arguments
const screenName = process.argv[2];
const includeTests = process.argv.includes('--with-tests');

if (!screenName) {
  console.error('❌ Error: Screen name is required');
  console.log('\nUsage: npm run generate:screen <screen-name> [--with-tests]');
  console.log('Example: npm run generate:screen profile');
  console.log('Example: npm run generate:screen settings --with-tests');
  process.exit(1);
}

// Validate screen name (kebab-case)
if (!/^[a-z][a-z0-9-]*$/.test(screenName)) {
  console.error('❌ Error: Screen name must be in kebab-case (e.g., my-screen)');
  process.exit(1);
}

// Convert kebab-case to PascalCase for component name
const componentName = screenName
  .split('-')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join('');

const screenPath = path.join(process.cwd(), 'app', `(app)`, screenName);

// Check if screen already exists
if (fs.existsSync(`${screenPath}.tsx`)) {
  console.error(`❌ Error: Screen "${screenName}" already exists`);
  process.exit(1);
}

// Screen Template
const screenTemplate = `/**
 * ${componentName} Screen
 *
 * TODO: Add screen description
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ${componentName}Screen() {
  return (
    <>
      <Stack.Screen
        options={{
          title: '${componentName}',
          headerShown: true,
        }}
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>${componentName}</Text>
          <Text style={styles.description}>
            TODO: Implement ${componentName} screen
          </Text>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
});
`;

// Test Template
const testTemplate = `/**
 * ${componentName} Screen Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ${componentName}Screen from './${screenName}';

// Mock expo-router
jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
}));

describe('${componentName}Screen', () => {
  it('renders correctly', () => {
    render(<${componentName}Screen />);
    expect(screen.getByText('${componentName}')).toBeTruthy();
  });

  // TODO: Add more tests
});
`;

// Write screen file
fs.writeFileSync(`${screenPath}.tsx`, screenTemplate);
console.log(`✅ Created: ${screenName}.tsx`);

// Write test file if requested
if (includeTests) {
  const testPath = path.join(process.cwd(), 'app', `(app)`, '__tests__');

  // Create __tests__ directory if it doesn't exist
  if (!fs.existsSync(testPath)) {
    fs.mkdirSync(testPath, { recursive: true });
  }

  fs.writeFileSync(path.join(testPath, `${screenName}.test.tsx`), testTemplate);
  console.log(`✅ Created: __tests__/${screenName}.test.tsx`);
}

console.log(`\n✨ Screen "${screenName}" generated successfully!\n`);
console.log('📍 Location:', `app/(app)/${screenName}.tsx`);
console.log('🔗 Route:', `/(app)/${screenName}`);
console.log('\n📝 Next steps:');
console.log(`   1. Implement the screen in ${screenName}.tsx`);
console.log('   2. Add navigation link from another screen');
console.log('   3. Test the route in your app\n');

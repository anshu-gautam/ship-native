/**
 * ESLint Configuration for Accessibility Checks
 *
 * This config is specifically for accessibility linting.
 * The main linting is handled by Biome (biome.json).
 *
 * Run: npm run lint:a11y
 */

module.exports = {
  root: true,
  extends: ['@react-native-community', 'plugin:react-native-a11y/all'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['react-native-a11y'],
  rules: {
    // Accessibility rules
    'react-native-a11y/has-accessibility-hint': 'warn',
    'react-native-a11y/has-valid-accessibility-state': 'error',
    'react-native-a11y/has-valid-accessibility-value': 'error',
    'react-native-a11y/has-valid-accessibility-live-region': 'error',
    'react-native-a11y/has-valid-accessibility-role': 'error',
    'react-native-a11y/has-valid-accessibility-states': 'error',
    'react-native-a11y/has-valid-important-for-accessibility': 'error',
    'react-native-a11y/no-nested-touchables': 'error',
    'react-native-a11y/has-accessibility-props': 'warn',
    'react-native-a11y/has-valid-accessibility-actions': 'error',
    'react-native-a11y/has-valid-accessibility-ignores-invert-colors': 'warn',
    'react-native-a11y/has-valid-accessibility-descriptors': 'error',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  ignorePatterns: [
    'node_modules/',
    '.expo/',
    'dist/',
    'build/',
    'android/',
    'ios/',
    '*.config.js',
    '*.config.ts',
    'babel.config.js',
    'jest.config.js',
    'scripts/',
  ],
};

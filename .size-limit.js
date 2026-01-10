/**
 * Bundle Size Limits Configuration
 *
 * This file defines size limits for your app bundles to prevent bundle bloat.
 * CI will fail if these limits are exceeded.
 */

module.exports = [
  {
    name: 'App Entry Point',
    path: 'node_modules/expo-router/entry.js',
    limit: '500 B',
  },
  {
    name: 'Core Dependencies',
    path: 'node_modules/{react,react-native,expo}/index.js',
    limit: '500 KB',
  },
  {
    name: 'All Dependencies',
    path: 'node_modules/**/*.js',
    limit: '5 MB',
    ignore: ['**/*.test.js', '**/*.spec.js', '**/tests/**'],
  },
];

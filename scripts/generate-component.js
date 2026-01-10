#!/usr/bin/env node

/**
 * Component Generator Script
 *
 * Generates a new React Native component with all necessary files:
 * - Component file (.tsx)
 * - Test file (.test.tsx)
 * - Story file (.stories.tsx)
 * - Index file (index.ts)
 */

const fs = require('fs');
const path = require('path');

// Get component name from command line arguments
const componentName = process.argv[2];

if (!componentName) {
  console.error('❌ Error: Component name is required');
  console.log('\nUsage: npm run generate:component <ComponentName>');
  console.log('Example: npm run generate:component Button');
  process.exit(1);
}

// Validate component name (PascalCase)
if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
  console.error('❌ Error: Component name must be in PascalCase (e.g., MyComponent)');
  process.exit(1);
}

const componentDir = path.join(process.cwd(), 'src', 'components', componentName);

// Check if component already exists
if (fs.existsSync(componentDir)) {
  console.error(`❌ Error: Component "${componentName}" already exists`);
  process.exit(1);
}

// Create component directory
fs.mkdirSync(componentDir, { recursive: true });
console.log(`📁 Created directory: ${componentDir}`);

// Component Template
const componentTemplate = `/**
 * ${componentName} Component
 *
 * TODO: Add component description
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface ${componentName}Props {
  /** TODO: Add prop descriptions */
}

export const ${componentName}: React.FC<${componentName}Props> = (props) => {
  return (
    <View style={styles.container}>
      <Text>${componentName} Component</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
`;

// Test Template
const testTemplate = `/**
 * ${componentName} Component Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ${componentName} } from './${componentName}';

describe('${componentName}', () => {
  it('renders correctly', () => {
    render(<${componentName} />);
    expect(screen.getByText('${componentName} Component')).toBeTruthy();
  });

  // TODO: Add more tests
});
`;

// Story Template
const storyTemplate = `/**
 * ${componentName} Stories
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { ${componentName} } from './${componentName}';

const meta: Meta<typeof ${componentName}> = {
  title: 'Components/${componentName}',
  component: ${componentName},
  decorators: [
    (Story) => (
      <View style={{ padding: 20, backgroundColor: '#F5F5F5', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    // TODO: Add controls
  },
};

export default meta;

type Story = StoryObj<typeof ${componentName}>;

export const Default: Story = {
  args: {
    // TODO: Add default props
  },
};
`;

// Index Template
const indexTemplate = `export { ${componentName} } from './${componentName}';
export type { ${componentName}Props } from './${componentName}';
`;

// Write files
const files = [
  { name: `${componentName}.tsx`, content: componentTemplate },
  { name: `${componentName}.test.tsx`, content: testTemplate },
  { name: `${componentName}.stories.tsx`, content: storyTemplate },
  { name: 'index.ts', content: indexTemplate },
];

files.forEach(({ name, content }) => {
  const filePath = path.join(componentDir, name);
  fs.writeFileSync(filePath, content);
  console.log(`✅ Created: ${name}`);
});

console.log(`\n✨ Component "${componentName}" generated successfully!\n`);
console.log('📍 Location:', componentDir);
console.log('\n📝 Next steps:');
console.log(`   1. Implement the component in ${componentName}.tsx`);
console.log(`   2. Add tests in ${componentName}.test.tsx`);
console.log(`   3. Add stories in ${componentName}.stories.tsx`);
console.log(`   4. Run: npm run storybook:generate\n`);

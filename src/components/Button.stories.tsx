/**
 * Button Stories
 *
 * Storybook stories for the Button component
 */

import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  decorators: [
    (Story: React.ComponentType) => (
      <View style={{ padding: 20, backgroundColor: '#F5F5F5', flex: 1 }}>
        <Story />
      </View>
    ),
  ],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'danger'],
    },
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
    },
    disabled: {
      control: 'boolean',
    },
    loading: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    title: 'Primary Button',
    onPress: () => console.log('Primary button pressed'),
    variant: 'primary',
    size: 'medium',
  },
};

export const Secondary: Story = {
  args: {
    title: 'Secondary Button',
    onPress: () => console.log('Secondary button pressed'),
    variant: 'secondary',
    size: 'medium',
  },
};

export const Outline: Story = {
  args: {
    title: 'Outline Button',
    onPress: () => console.log('Outline button pressed'),
    variant: 'outline',
    size: 'medium',
  },
};

export const Danger: Story = {
  args: {
    title: 'Danger Button',
    onPress: () => console.log('Danger button pressed'),
    variant: 'danger',
    size: 'medium',
  },
};

export const Small: Story = {
  args: {
    title: 'Small Button',
    onPress: () => console.log('Small button pressed'),
    variant: 'primary',
    size: 'small',
  },
};

export const Large: Story = {
  args: {
    title: 'Large Button',
    onPress: () => console.log('Large button pressed'),
    variant: 'primary',
    size: 'large',
  },
};

export const Disabled: Story = {
  args: {
    title: 'Disabled Button',
    onPress: () => console.log('This should not fire'),
    variant: 'primary',
    size: 'medium',
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    title: 'Loading Button',
    onPress: () => console.log('Loading button pressed'),
    variant: 'primary',
    size: 'medium',
    loading: true,
  },
};

export const FullWidth: Story = {
  args: {
    title: 'Full Width Button',
    onPress: () => console.log('Full width button pressed'),
    variant: 'primary',
    size: 'medium',
    fullWidth: true,
  },
};

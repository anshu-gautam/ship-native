/**
 * Storybook Configuration
 *
 * Sets up Storybook view for React Native
 */

import { getStorybookUI } from '@storybook/react-native';
import './storybook.requires';

const StorybookUIRoot = getStorybookUI({
  // Enable on-device UI for controlling stories
  enableWebsockets: true,

  // Optional: Configure websocket port for remote control
  // host: 'localhost',
  // port: 7007,
});

export const view = StorybookUIRoot;

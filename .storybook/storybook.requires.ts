/**
 * Storybook Story Loader
 *
 * Auto-generated file that imports all stories
 * This file is regenerated when you add new stories
 */

// Auto-import all .stories files
const getStories = () => {
  return {
    './src/components/Button.stories.tsx': require('../src/components/Button.stories.tsx'),
    './src/components/ErrorBoundary.stories.tsx': require('../src/components/ErrorBoundary.stories.tsx'),
  };
};

export const stories = getStories();

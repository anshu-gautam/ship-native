# Visual Regression Testing

Guide for visual regression testing with Chromatic and Percy.

## Overview

Visual regression testing helps catch unintended UI changes by:
- 📸 **Taking screenshots** of your components
- 🔍 **Comparing** with previous versions
- ⚠️ **Flagging differences** for review
- ✅ **Preventing** visual bugs in production

## Chromatic (Recommended)

Chromatic is built specifically for Storybook and offers the best integration.

### Setup

1. **Install Chromatic:**
   ```bash
   npm install --save-dev chromatic
   ```

2. **Create Account:**
   - Visit [chromatic.com](https://www.chromatic.com/)
   - Sign up with GitHub
   - Create a new project

3. **Get Project Token:**
   ```bash
   npx chromatic --project-token=<your-token>
   ```

4. **Add to package.json:**
   ```json
   {
     "scripts": {
       "chromatic": "chromatic --project-token=YOUR_TOKEN"
     }
   }
   ```

### Configuration

**.chromatic.config.json** (already created):
```json
{
  "projectId": "YOUR_PROJECT_ID",
  "buildScriptName": "storybook:build",
  "storybookBuildDir": ".storybook-static",
  "autoAcceptChanges": "main",
  "exitZeroOnChanges": true,
  "exitOnceUploaded": true
}
```

### Usage

**Run Visual Tests:**
```bash
npm run chromatic
```

**In CI/CD:**

**.github/workflows/visual-tests.yml:**
```yaml
name: Visual Tests

on:
  pull_request:
    branches: [main, develop]

jobs:
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Required for Chromatic

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          token: ${{ secrets.GITHUB_TOKEN }}
```

### Review Process

1. **Run Tests:**
   ```bash
   npm run chromatic
   ```

2. **Review Changes:**
   - Open Chromatic dashboard
   - Review visual diffs
   - Accept or reject changes

3. **Merge:**
   - Once approved, merge PR
   - Baseline updated automatically

## Percy (Alternative)

Percy is another popular visual testing platform.

### Setup

1. **Install Percy:**
   ```bash
   npm install --save-dev @percy/cli @percy/storybook
   ```

2. **Create Account:**
   - Visit [percy.io](https://percy.io/)
   - Create a project

3. **Add Percy Token:**
   ```bash
   export PERCY_TOKEN=your_token_here
   ```

4. **Add to package.json:**
   ```json
   {
     "scripts": {
       "percy": "percy storybook:build"
     }
   }
   ```

### Usage

**Run Percy:**
```bash
PERCY_TOKEN=your_token npm run percy
```

**In CI/CD:**
```yaml
- name: Percy Test
  run: npx percy storybook .storybook-static
  env:
    PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
```

## Manual Visual Testing

For budget-conscious projects, use manual screenshot comparison:

### Setup

**scripts/visual-test.js:**
```javascript
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function takeScreenshots() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const stories = [
    'button--primary',
    'button--secondary',
    'error-boundary--default',
  ];

  for (const story of stories) {
    await page.goto(`http://localhost:6006/?path=/story/${story}`);
    await page.waitForTimeout(1000);

    const screenshot = await page.screenshot();
    fs.writeFileSync(
      path.join(__dirname, '../screenshots', `${story}.png`),
      screenshot
    );
  }

  await browser.close();
}

takeScreenshots();
```

**Run:**
```bash
npm run storybook &  # Start storybook
node scripts/visual-test.js  # Take screenshots
```

## Best Practices

### 1. Test Key Components

Focus on:
- UI components (buttons, cards, forms)
- Critical user flows
- Complex layouts
- Responsive designs

### 2. Stable Selectors

Use consistent data-testid attributes:
```tsx
<Button data-testid="submit-button">Submit</Button>
```

### 3. Handle Dynamic Content

Mock dynamic data for consistent screenshots:
```tsx
// In stories
export const Default: Story = {
  parameters: {
    date: new Date('2024-01-01'),  // Fixed date
  },
};
```

### 4. Ignore Animations

Disable animations for consistent screenshots:
```tsx
export const Default: Story = {
  parameters: {
    chromatic: { delay: 300 },  // Wait for animations
  },
};
```

### 5. Mobile & Desktop

Test both viewport sizes:
```tsx
export const Mobile: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

export const Desktop: Story = {
  parameters: {
    viewport: { defaultViewport: 'desktop' },
  },
};
```

## Ignoring Changes

### Ignore Regions

Ignore dynamic areas:
```tsx
export const WithDynamicContent: Story = {
  parameters: {
    chromatic: {
      diffThreshold: 0.3,  // Allow 30% difference
      diffIncludeAntiAliasing: false,
    },
  },
};
```

### Disable for Specific Stories

```tsx
export const SkipVisualTest: Story = {
  parameters: {
    chromatic: { disable: true },
  },
};
```

## Turbo Snap (Chromatic)

Speed up tests by only testing changed components:

**.chromatic.config.json:**
```json
{
  "projectId": "YOUR_PROJECT_ID",
  "onlyChanged": true,  // TurboSnap
  "externals": ["public/**"]
}
```

## Cost Optimization

### Free Tier Limits

- **Chromatic**: 5,000 snapshots/month free
- **Percy**: 5,000 snapshots/month free

### Reduce Snapshots

1. **Conditional Testing:**
   ```yaml
   - name: Run Chromatic
     if: github.event_name == 'pull_request'  # Only on PRs
   ```

2. **Test Key Stories:**
   Only test critical user-facing components

3. **Use TurboSnap:**
   Only test changed components

## Example Workflow

**Full Visual Testing Workflow:**

1. **Develop Component:**
   ```tsx
   // src/components/Card.tsx
   export const Card = ({ title, description }) => (
     <View style={styles.card}>
       <Text style={styles.title}>{title}</Text>
       <Text>{description}</Text>
     </View>
   );
   ```

2. **Write Stories:**
   ```tsx
   // src/components/Card.stories.tsx
   export const Default: Story = {
     args: {
       title: 'Card Title',
       description: 'Card description',
     },
   };

   export const LongContent: Story = {
     args: {
       title: 'Very Long Card Title That Wraps',
       description: 'A much longer description...',
     },
   };
   ```

3. **Run Visual Tests:**
   ```bash
   npm run chromatic
   ```

4. **Review Changes:**
   - Check Chromatic dashboard
   - Review visual diffs
   - Accept changes

5. **Merge PR:**
   - Visual tests pass
   - Baseline updated

## Troubleshooting

### Tests Failing Inconsistently

**Problem:** Screenshots differ slightly between runs

**Solution:**
```tsx
export const Story: Story = {
  parameters: {
    chromatic: {
      diffThreshold: 0.1,  // Allow 10% difference
      pauseAnimationAtEnd: true,
    },
  },
};
```

### Fonts Not Loading

**Problem:** Font rendering differs

**Solution:**
```tsx
// Wait for fonts
export const Story: Story = {
  parameters: {
    chromatic: { delay: 1000 },
  },
};
```

### Large Diffs on Text

**Problem:** Anti-aliasing differences

**Solution:**
```tsx
export const Story: Story = {
  parameters: {
    chromatic: {
      diffIncludeAntiAliasing: false,
    },
  },
};
```

## Resources

- [Chromatic Docs](https://www.chromatic.com/docs/)
- [Percy Docs](https://docs.percy.io/)
- [Storybook Visual Testing](https://storybook.js.org/docs/react/writing-tests/visual-testing)
- [Puppeteer](https://pptr.dev/) - For manual testing

## Next Steps

1. **Choose Platform**: Chromatic or Percy
2. **Set Up Account**: Create project and get token
3. **Add to CI/CD**: Automate visual tests
4. **Write Stories**: For key components
5. **Review Process**: Establish team workflow

#!/usr/bin/env node

/**
 * App Store Screenshots Generator
 *
 * Generates screenshots for App Store and Play Store submissions
 * using Maestro E2E testing framework.
 *
 * Usage:
 *   node scripts/generate-screenshots.js [platform]
 *   npm run screenshots:ios
 *   npm run screenshots:android
 *   npm run screenshots:all
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function exec(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'inherit', ...options });
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return '';
  }
}

/**
 * Device configurations for screenshots
 */
const DEVICE_CONFIGS = {
  ios: [
    {
      name: 'iPhone 15 Pro Max',
      size: '6.7"',
      resolution: '1290x2796',
      modelId: 'iPhone15,3',
    },
    {
      name: 'iPhone 15 Pro',
      size: '6.1"',
      resolution: '1179x2556',
      modelId: 'iPhone15,2',
    },
    {
      name: 'iPhone SE (3rd generation)',
      size: '4.7"',
      resolution: '750x1334',
      modelId: 'iPhone14,6',
    },
    {
      name: 'iPad Pro (12.9-inch)',
      size: '12.9"',
      resolution: '2048x2732',
      modelId: 'iPad13,11',
    },
  ],
  android: [
    {
      name: 'Pixel 7 Pro',
      size: '6.7"',
      resolution: '1440x3120',
      modelId: 'pixel_7_pro',
    },
    {
      name: 'Pixel 7',
      size: '6.3"',
      resolution: '1080x2400',
      modelId: 'pixel_7',
    },
    {
      name: 'Pixel Tablet',
      size: '10.95"',
      resolution: '1600x2560',
      modelId: 'pixel_tablet',
    },
  ],
};

/**
 * Screenshot scenarios
 */
const SCREENSHOT_SCENARIOS = [
  {
    name: 'onboarding',
    title: 'Onboarding',
    description: 'Welcome screen and onboarding flow',
  },
  {
    name: 'home',
    title: 'Home Screen',
    description: 'Main dashboard and features',
  },
  {
    name: 'features',
    title: 'Key Features',
    description: 'Core functionality showcase',
  },
  {
    name: 'profile',
    title: 'User Profile',
    description: 'Profile and settings',
  },
  {
    name: 'dark-mode',
    title: 'Dark Mode',
    description: 'Dark theme support',
  },
];

class ScreenshotGenerator {
  constructor(platform = 'all') {
    this.platform = platform.toLowerCase();
    this.rootDir = process.cwd();
    this.screenshotsDir = path.join(this.rootDir, 'screenshots');
    this.maestroDir = path.join(this.rootDir, '.maestro');
    this.flowsDir = path.join(this.maestroDir, 'screenshots');
  }

  /**
   * Main generation flow
   */
  async run() {
    try {
      log('\n📸 Starting screenshot generation...\\n', COLORS.bright);

      // 1. Setup
      this.checkPrerequisites();
      this.setupDirectories();

      // 2. Generate Maestro flows if needed
      this.generateMaestroFlows();

      // 3. Generate screenshots
      if (this.platform === 'ios' || this.platform === 'all') {
        await this.generateForPlatform('ios');
      }

      if (this.platform === 'android' || this.platform === 'all') {
        await this.generateForPlatform('android');
      }

      // 4. Organize screenshots
      this.organizeScreenshots();

      // 5. Generate index
      this.generateIndex();

      log('\\n✅ Screenshot generation completed successfully!\\n', COLORS.green);
      log('Screenshots saved to:', COLORS.bright);
      log(`   ${this.screenshotsDir}\\n`, COLORS.reset);

      return { success: true };
    } catch (error) {
      log(`\\n❌ Screenshot generation failed: ${error.message}\\n`, COLORS.red);
      process.exit(1);
    }
  }

  /**
   * Check prerequisites
   */
  checkPrerequisites() {
    log('📋 Checking prerequisites...', COLORS.cyan);

    // Check Maestro
    try {
      exec('maestro --version', { stdio: 'pipe' });
      log('✓ Maestro installed', COLORS.green);
    } catch (error) {
      throw new Error(
        'Maestro is not installed. Install it with: curl -fsSL "https://get.maestro.mobile.dev" | bash'
      );
    }

    // Check if app is built
    if (this.platform === 'ios' || this.platform === 'all') {
      const iosAppPath = path.join(this.rootDir, 'ios', 'build');
      if (!fs.existsSync(iosAppPath)) {
        log('⚠️  iOS app not built. Run: npm run ios', COLORS.yellow);
      }
    }

    if (this.platform === 'android' || this.platform === 'all') {
      const androidAppPath = path.join(this.rootDir, 'android', 'app', 'build');
      if (!fs.existsSync(androidAppPath)) {
        log('⚠️  Android app not built. Run: npm run android', COLORS.yellow);
      }
    }
  }

  /**
   * Setup directories
   */
  setupDirectories() {
    log('\\n📁 Setting up directories...', COLORS.cyan);

    // Create screenshots directory
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }

    // Create flows directory
    if (!fs.existsSync(this.flowsDir)) {
      fs.mkdirSync(this.flowsDir, { recursive: true });
    }

    log('✓ Directories created', COLORS.green);
  }

  /**
   * Generate Maestro screenshot flows
   */
  generateMaestroFlows() {
    log('\\n🎬 Generating Maestro flows...', COLORS.cyan);

    SCREENSHOT_SCENARIOS.forEach((scenario) => {
      const flowPath = path.join(this.flowsDir, `${scenario.name}.yaml`);

      if (!fs.existsSync(flowPath)) {
        const flow = this.generateFlowTemplate(scenario);
        fs.writeFileSync(flowPath, flow);
        log(`✓ Created flow: ${scenario.name}.yaml`, COLORS.green);
      } else {
        log(`  Flow exists: ${scenario.name}.yaml`, COLORS.reset);
      }
    });
  }

  /**
   * Generate Maestro flow template
   */
  generateFlowTemplate(scenario) {
    return `# ${scenario.title} Screenshot Flow
#
# This flow navigates to ${scenario.description} and captures screenshots

appId: com.yourcompany.yourapp

---

# Launch app
- launchApp

# Wait for app to load
- waitForAnimationToEnd

# Navigate to ${scenario.title}
${this.getNavigationSteps(scenario.name)}

# Wait for content to load
- waitForAnimationToEnd
- wait: 1000

# Take screenshot
- takeScreenshot: ${scenario.name}

# Additional screenshots for this scenario
${this.getAdditionalScreenshotSteps(scenario.name)}
`;
  }

  /**
   * Get navigation steps for scenario
   */
  getNavigationSteps(scenarioName) {
    const steps = {
      onboarding: `# Already on onboarding screen on first launch`,

      home: `# Tap "Get Started" or "Skip" to reach home
- tapOn: "Get Started"`,

      features: `# Navigate to features
- tapOn: "Get Started"
- tapOn: "Features"`,

      profile: `# Navigate to profile
- tapOn: "Get Started"
- tapOn: "Profile"`,

      'dark-mode': `# Enable dark mode
- tapOn: "Get Started"
- tapOn: "Settings"
- tapOn: "Dark Mode"
- toggleSwitch: "Dark Mode Toggle"
- back`,
    };

    return steps[scenarioName] || '# Navigate to screen';
  }

  /**
   * Get additional screenshot steps
   */
  getAdditionalScreenshotSteps(scenarioName) {
    const steps = {
      features: `# Scroll and capture more features
- scroll
- takeScreenshot: ${scenarioName}_2
- scroll
- takeScreenshot: ${scenarioName}_3`,

      profile: `# Capture different profile sections
- scroll
- takeScreenshot: ${scenarioName}_settings`,
    };

    return steps[scenarioName] || '';
  }

  /**
   * Generate screenshots for platform
   */
  async generateForPlatform(platform) {
    log(`\\n📱 Generating ${platform.toUpperCase()} screenshots...\\n`, COLORS.cyan);

    const devices = DEVICE_CONFIGS[platform];

    for (const device of devices) {
      log(`  Device: ${device.name} (${device.size})`, COLORS.bright);

      for (const scenario of SCREENSHOT_SCENARIOS) {
        try {
          await this.captureScreenshot(platform, device, scenario);
          log(`    ✓ ${scenario.title}`, COLORS.green);
        } catch (error) {
          log(`    ✗ ${scenario.title}: ${error.message}`, COLORS.red);
        }
      }

      log('');
    }
  }

  /**
   * Capture screenshot for device and scenario
   */
  async captureScreenshot(platform, device, scenario) {
    const flowPath = path.join(this.flowsDir, `${scenario.name}.yaml`);

    const command = platform === 'ios'
      ? `maestro test ${flowPath} --device "${device.modelId}"`
      : `maestro test ${flowPath} --device "${device.modelId}"`;

    try {
      exec(command, { stdio: 'pipe' });
    } catch (error) {
      // Maestro will save screenshots even if test fails
      // Log warning but continue
      log(`    ⚠️  Flow completed with warnings: ${scenario.name}`, COLORS.yellow);
    }
  }

  /**
   * Organize screenshots into platform/device folders
   */
  organizeScreenshots() {
    log('\\n📂 Organizing screenshots...', COLORS.cyan);

    // Maestro saves screenshots to ./maestro_screenshots
    const maestroScreenshotsDir = path.join(this.rootDir, 'maestro_screenshots');

    if (!fs.existsSync(maestroScreenshotsDir)) {
      log('⚠️  No screenshots found to organize', COLORS.yellow);
      return;
    }

    // Move to organized structure
    const screenshots = fs.readdirSync(maestroScreenshotsDir);

    screenshots.forEach((file) => {
      if (!file.endsWith('.png')) return;

      // Determine platform and device from filename
      const platform = file.includes('iPhone') || file.includes('iPad') ? 'ios' : 'android';
      const deviceName = this.extractDeviceName(file);

      // Create destination directory
      const destDir = path.join(this.screenshotsDir, platform, deviceName);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      // Move file
      const srcPath = path.join(maestroScreenshotsDir, file);
      const destPath = path.join(destDir, file);
      fs.renameSync(srcPath, destPath);
    });

    log('✓ Screenshots organized', COLORS.green);
  }

  /**
   * Extract device name from screenshot filename
   */
  extractDeviceName(filename) {
    if (filename.includes('iPhone 15 Pro Max')) return 'iPhone-15-Pro-Max';
    if (filename.includes('iPhone 15 Pro')) return 'iPhone-15-Pro';
    if (filename.includes('iPhone SE')) return 'iPhone-SE';
    if (filename.includes('iPad Pro')) return 'iPad-Pro';
    if (filename.includes('Pixel 7 Pro')) return 'Pixel-7-Pro';
    if (filename.includes('Pixel 7')) return 'Pixel-7';
    if (filename.includes('Pixel Tablet')) return 'Pixel-Tablet';
    return 'unknown';
  }

  /**
   * Generate index.html for viewing screenshots
   */
  generateIndex() {
    log('\\n📄 Generating index...', COLORS.cyan);

    const html = this.generateIndexHTML();
    const indexPath = path.join(this.screenshotsDir, 'index.html');
    fs.writeFileSync(indexPath, html);

    log('✓ Index generated', COLORS.green);
    log(`  View at: file://${indexPath}`, COLORS.reset);
  }

  /**
   * Generate index HTML
   */
  generateIndexHTML() {
    const platforms = ['ios', 'android'];
    let sections = '';

    platforms.forEach((platform) => {
      const platformDir = path.join(this.screenshotsDir, platform);
      if (!fs.existsSync(platformDir)) return;

      const devices = fs.readdirSync(platformDir);

      sections += `
        <section>
          <h2>${platform.toUpperCase()} Screenshots</h2>
          ${devices.map((device) => {
            const deviceDir = path.join(platformDir, device);
            if (!fs.statSync(deviceDir).isDirectory()) return '';

            const screenshots = fs.readdirSync(deviceDir).filter((f) => f.endsWith('.png'));

            return `
              <div class="device-group">
                <h3>${device.replace(/-/g, ' ')}</h3>
                <div class="screenshots">
                  ${screenshots
                    .map(
                      (screenshot) => `
                    <div class="screenshot">
                      <img src="${platform}/${device}/${screenshot}" alt="${screenshot}">
                      <p>${screenshot.replace('.png', '').replace(/_/g, ' ')}</p>
                    </div>
                  `
                    )
                    .join('')}
                </div>
              </div>
            `;
          }).join('')}
        </section>
      `;
    });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>App Screenshots</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #f5f5f5;
      padding: 40px 20px;
    }

    header {
      text-align: center;
      margin-bottom: 60px;
    }

    h1 {
      font-size: 36px;
      color: #333;
      margin-bottom: 10px;
    }

    h2 {
      font-size: 28px;
      color: #555;
      margin: 40px 0 20px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    h3 {
      font-size: 20px;
      color: #666;
      margin: 30px 0 15px;
    }

    .device-group {
      background: white;
      border-radius: 12px;
      padding: 30px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .screenshots {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .screenshot {
      text-align: center;
    }

    .screenshot img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transition: transform 0.3s ease;
    }

    .screenshot img:hover {
      transform: scale(1.05);
    }

    .screenshot p {
      margin-top: 10px;
      font-size: 14px;
      color: #666;
      text-transform: capitalize;
    }

    @media (max-width: 768px) {
      .screenshots {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>📱 App Store Screenshots</h1>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </header>

  <main>
    ${sections}
  </main>
</body>
</html>`;
  }
}

// Run screenshot generation
const platform = process.argv[2] || 'all';
const validPlatforms = ['ios', 'android', 'all'];

if (!validPlatforms.includes(platform.toLowerCase())) {
  log(`❌ Invalid platform: ${platform}`, COLORS.red);
  log('Usage: node scripts/generate-screenshots.js [ios|android|all]', COLORS.yellow);
  process.exit(1);
}

const generator = new ScreenshotGenerator(platform);
generator.run();

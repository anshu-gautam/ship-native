#!/usr/bin/env node

/**
 * Automated Release Script
 *
 * Handles version bumping, changelog generation, and release automation
 *
 * Usage:
 *   node scripts/release.js [patch|minor|major]
 *   npm run release:patch
 *   npm run release:minor
 *   npm run release:major
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
    return execSync(command, { encoding: 'utf8', ...options }).trim();
  } catch (error) {
    if (!options.ignoreError) {
      throw error;
    }
    return '';
  }
}

class ReleaseManager {
  constructor(releaseType) {
    this.releaseType = releaseType || 'patch';
    this.rootDir = process.cwd();
    this.packageJsonPath = path.join(this.rootDir, 'package.json');
    this.appJsonPath = path.join(this.rootDir, 'app.json');
    this.changelogPath = path.join(this.rootDir, 'CHANGELOG.md');
  }

  /**
   * Main release flow
   */
  async run() {
    try {
      log('\n🚀 Starting release process...\n', COLORS.bright);

      // 1. Pre-flight checks
      this.checkGitStatus();
      this.checkBranch();

      // 2. Run tests
      await this.runTests();

      // 3. Bump version
      const newVersion = this.bumpVersion();

      // 4. Generate changelog
      await this.generateChangelog(newVersion);

      // 5. Update native version codes
      this.updateNativeVersions(newVersion);

      // 6. Commit changes
      this.commitChanges(newVersion);

      // 7. Create git tag
      this.createTag(newVersion);

      // 8. Generate release notes
      const releaseNotes = this.generateReleaseNotes(newVersion);

      log('\n✅ Release completed successfully!\n', COLORS.green);
      log(`📦 Version: ${newVersion}`, COLORS.cyan);
      log(`🏷️  Tag: v${newVersion}`, COLORS.cyan);
      log('\nNext steps:', COLORS.bright);
      log('1. Review the changes:', COLORS.yellow);
      log(`   git show v${newVersion}`, COLORS.reset);
      log('2. Push to remote:', COLORS.yellow);
      log(`   git push origin main --tags`, COLORS.reset);
      log('3. Build and submit:', COLORS.yellow);
      log(`   npm run build:production`, COLORS.reset);
      log(`   eas submit -p ios`, COLORS.reset);
      log(`   eas submit -p android`, COLORS.reset);

      return { version: newVersion, releaseNotes };
    } catch (error) {
      log(`\n❌ Release failed: ${error.message}\n`, COLORS.red);
      process.exit(1);
    }
  }

  /**
   * Check git status
   */
  checkGitStatus() {
    const status = exec('git status --porcelain');
    if (status) {
      throw new Error(
        'Working directory is not clean. Commit or stash changes before releasing.'
      );
    }
    log('✓ Git working directory is clean', COLORS.green);
  }

  /**
   * Check current branch
   */
  checkBranch() {
    const branch = exec('git rev-parse --abbrev-ref HEAD');
    if (branch !== 'main' && branch !== 'master') {
      const proceed = process.argv.includes('--force');
      if (!proceed) {
        throw new Error(
          `You are on branch '${branch}'. Releases should be made from 'main' or 'master'. Use --force to override.`
        );
      }
      log(`⚠️  Proceeding on branch '${branch}' (--force used)`, COLORS.yellow);
    } else {
      log(`✓ On ${branch} branch`, COLORS.green);
    }
  }

  /**
   * Run tests
   */
  async runTests() {
    log('\n📝 Running tests...', COLORS.cyan);

    try {
      // Type check
      exec('npm run type-check');
      log('✓ TypeScript checks passed', COLORS.green);

      // Unit tests
      exec('npm test -- --passWithNoTests');
      log('✓ All tests passed', COLORS.green);

      // Lint
      exec('npm run lint', { ignoreError: true });
      log('✓ Linting completed', COLORS.green);
    } catch (error) {
      throw new Error(`Tests failed: ${error.message}`);
    }
  }

  /**
   * Bump version in package.json
   */
  bumpVersion() {
    log(`\n📦 Bumping version (${this.releaseType})...`, COLORS.cyan);

    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    const currentVersion = packageJson.version;

    // Parse current version
    const [major, minor, patch] = currentVersion.split('.').map(Number);

    // Calculate new version
    let newVersion;
    switch (this.releaseType) {
      case 'major':
        newVersion = `${major + 1}.0.0`;
        break;
      case 'minor':
        newVersion = `${major}.${minor + 1}.0`;
        break;
      case 'patch':
      default:
        newVersion = `${major}.${minor}.${patch + 1}`;
        break;
    }

    // Update package.json
    packageJson.version = newVersion;
    fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

    log(`✓ Version bumped: ${currentVersion} → ${newVersion}`, COLORS.green);
    return newVersion;
  }

  /**
   * Update native version codes
   */
  updateNativeVersions(version) {
    log('\n📱 Updating native version codes...', COLORS.cyan);

    try {
      const appJson = JSON.parse(fs.readFileSync(this.appJsonPath, 'utf8'));

      // Update version
      appJson.expo.version = version;

      // Update iOS build number
      const iosBuildNumber = appJson.expo.ios?.buildNumber || '1';
      appJson.expo.ios = appJson.expo.ios || {};
      appJson.expo.ios.buildNumber = String(parseInt(iosBuildNumber) + 1);

      // Update Android version code
      const androidVersionCode = appJson.expo.android?.versionCode || 1;
      appJson.expo.android = appJson.expo.android || {};
      appJson.expo.android.versionCode = androidVersionCode + 1;

      fs.writeFileSync(this.appJsonPath, JSON.stringify(appJson, null, 2) + '\n');

      log(`✓ iOS build number: ${appJson.expo.ios.buildNumber}`, COLORS.green);
      log(`✓ Android version code: ${appJson.expo.android.versionCode}`, COLORS.green);
    } catch (error) {
      log(`⚠️  Could not update app.json: ${error.message}`, COLORS.yellow);
    }
  }

  /**
   * Generate changelog from git commits
   */
  async generateChangelog(version) {
    log('\n📝 Generating changelog...', COLORS.cyan);

    try {
      // Get last tag
      const lastTag = exec('git describe --tags --abbrev=0', { ignoreError: true }) || '';

      // Get commits since last tag
      const commitRange = lastTag ? `${lastTag}..HEAD` : 'HEAD';
      const commits = exec(`git log ${commitRange} --pretty=format:"%h|%s|%an|%ad" --date=short`)
        .split('\n')
        .filter(Boolean);

      if (commits.length === 0) {
        log('⚠️  No new commits since last release', COLORS.yellow);
        return;
      }

      // Categorize commits
      const categories = {
        features: [],
        fixes: [],
        docs: [],
        chores: [],
        other: [],
      };

      commits.forEach((commit) => {
        const [hash, message] = commit.split('|');

        if (message.startsWith('feat:') || message.startsWith('feat(')) {
          categories.features.push({ hash, message: message.replace(/^feat(\([^)]+\))?:\s*/, '') });
        } else if (message.startsWith('fix:') || message.startsWith('fix(')) {
          categories.fixes.push({ hash, message: message.replace(/^fix(\([^)]+\))?:\s*/, '') });
        } else if (message.startsWith('docs:') || message.startsWith('docs(')) {
          categories.docs.push({ hash, message: message.replace(/^docs(\([^)]+\))?:\s*/, '') });
        } else if (
          message.startsWith('chore:') ||
          message.startsWith('chore(') ||
          message.startsWith('build:') ||
          message.startsWith('ci:')
        ) {
          categories.chores.push({ hash, message: message.replace(/^(chore|build|ci)(\([^)]+\))?:\s*/, '') });
        } else {
          categories.other.push({ hash, message });
        }
      });

      // Build changelog entry
      let changelogEntry = `\n## [${version}] - ${new Date().toISOString().split('T')[0]}\n\n`;

      if (categories.features.length > 0) {
        changelogEntry += '### ✨ Features\n\n';
        categories.features.forEach(({ hash, message }) => {
          changelogEntry += `- ${message} (${hash})\n`;
        });
        changelogEntry += '\n';
      }

      if (categories.fixes.length > 0) {
        changelogEntry += '### 🐛 Bug Fixes\n\n';
        categories.fixes.forEach(({ hash, message }) => {
          changelogEntry += `- ${message} (${hash})\n`;
        });
        changelogEntry += '\n';
      }

      if (categories.docs.length > 0) {
        changelogEntry += '### 📚 Documentation\n\n';
        categories.docs.forEach(({ hash, message }) => {
          changelogEntry += `- ${message} (${hash})\n`;
        });
        changelogEntry += '\n';
      }

      if (categories.chores.length > 0) {
        changelogEntry += '### 🔧 Maintenance\n\n';
        categories.chores.forEach(({ hash, message }) => {
          changelogEntry += `- ${message} (${hash})\n`;
        });
        changelogEntry += '\n';
      }

      // Update CHANGELOG.md
      let changelog = '';
      if (fs.existsSync(this.changelogPath)) {
        changelog = fs.readFileSync(this.changelogPath, 'utf8');
      } else {
        changelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
      }

      // Insert new entry after header
      const headerEnd = changelog.indexOf('\n\n') + 2;
      changelog = changelog.slice(0, headerEnd) + changelogEntry + changelog.slice(headerEnd);

      fs.writeFileSync(this.changelogPath, changelog);

      log(`✓ Changelog updated with ${commits.length} commits`, COLORS.green);
    } catch (error) {
      log(`⚠️  Could not generate changelog: ${error.message}`, COLORS.yellow);
    }
  }

  /**
   * Commit version bump changes
   */
  commitChanges(version) {
    log('\n💾 Committing changes...', COLORS.cyan);

    exec('git add package.json app.json CHANGELOG.md');
    exec(`git commit -m "chore: release v${version}"`);

    log(`✓ Changes committed`, COLORS.green);
  }

  /**
   * Create git tag
   */
  createTag(version) {
    log('\n🏷️  Creating git tag...', COLORS.cyan);

    exec(`git tag -a v${version} -m "Release v${version}"`);

    log(`✓ Tag created: v${version}`, COLORS.green);
  }

  /**
   * Generate release notes
   */
  generateReleaseNotes(version) {
    log('\n📋 Generating release notes...', COLORS.cyan);

    try {
      // Get commits for this release
      const lastTag = exec('git describe --tags --abbrev=0 HEAD^', { ignoreError: true }) || '';
      const commitRange = lastTag ? `${lastTag}..v${version}` : `v${version}`;

      const commits = exec(`git log ${commitRange} --pretty=format:"%s"`)
        .split('\n')
        .filter(Boolean);

      const features = commits.filter((c) => c.startsWith('feat:')).map((c) => c.replace('feat: ', ''));
      const fixes = commits.filter((c) => c.startsWith('fix:')).map((c) => c.replace('fix: ', ''));

      let notes = `# Release v${version}\n\n`;

      if (features.length > 0) {
        notes += '## New Features\n\n';
        features.forEach((f) => (notes += `- ${f}\n`));
        notes += '\n';
      }

      if (fixes.length > 0) {
        notes += '## Bug Fixes\n\n';
        fixes.forEach((f) => (notes += `- ${f}\n`));
        notes += '\n';
      }

      // Save release notes
      const releaseNotesPath = path.join(this.rootDir, `RELEASE_NOTES_${version}.md`);
      fs.writeFileSync(releaseNotesPath, notes);

      log(`✓ Release notes saved to RELEASE_NOTES_${version}.md`, COLORS.green);

      return notes;
    } catch (error) {
      log(`⚠️  Could not generate release notes: ${error.message}`, COLORS.yellow);
      return '';
    }
  }
}

// Run release
const releaseType = process.argv[2] || 'patch';
if (!['patch', 'minor', 'major'].includes(releaseType)) {
  log(`❌ Invalid release type: ${releaseType}`, COLORS.red);
  log('Usage: node scripts/release.js [patch|minor|major]', COLORS.yellow);
  process.exit(1);
}

const manager = new ReleaseManager(releaseType);
manager.run();

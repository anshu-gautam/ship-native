# Automated Release Workflow

Complete guide to the automated release system including version bumping, changelog generation, and app store deployment.

## Overview

The release workflow automates:
- ✅ Version bumping (semver)
- ✅ Native build number increments
- ✅ Changelog generation from git commits
- ✅ Git tagging
- ✅ Release notes creation
- ✅ GitHub Releases
- ✅ App Store builds (iOS + Android)
- ✅ OTA updates via EAS

## Quick Start

```bash
# Patch release (1.0.0 → 1.0.1)
npm run release:patch

# Minor release (1.0.0 → 1.1.0)
npm run release:minor

# Major release (1.0.0 → 2.0.0)
npm run release:major
```

## Release Process

### 1. Prepare for Release

**Prerequisites:**
- Clean git working directory
- All tests passing
- On `main` or `master` branch
- No uncommitted changes

**Pre-flight checks:**
```bash
# Check current status
git status

# Run tests
npm test

# Type check
npm run type-check

# Lint
npm run lint
```

### 2. Run Release Script

```bash
# For bug fixes and minor changes
npm run release:patch

# For new features (backwards compatible)
npm run release:minor

# For breaking changes
npm run release:major
```

**What happens automatically:**

1. **Pre-flight Checks**
   - Verifies git is clean
   - Confirms on correct branch
   - Runs all tests
   - Runs type checking
   - Runs linting

2. **Version Bumping**
   - Updates `package.json` version
   - Increments iOS build number
   - Increments Android version code
   - Updates `app.json`

3. **Changelog Generation**
   - Parses git commits since last tag
   - Categorizes changes (features, fixes, docs, chores)
   - Updates `CHANGELOG.md`
   - Creates version entry

4. **Git Operations**
   - Commits version bump
   - Creates git tag (`v1.0.0`)
   - Generates release notes

5. **Ready to Push**
   - Shows next steps
   - Provides push commands

### 3. Push Release

```bash
# Push commits and tags to remote
git push origin main --tags
```

**This triggers GitHub Actions:**
- Creates GitHub Release
- Builds iOS app (EAS)
- Builds Android app (EAS)
- Publishes OTA update
- Submits to App Store (optional)
- Submits to Google Play (optional)

## Commit Message Format

The changelog generator categorizes commits using [Conventional Commits](https://www.conventionalcommits.org/):

### Commit Types

| Type | Description | Changelog Section |
|------|-------------|-------------------|
| `feat:` | New feature | ✨ Features |
| `fix:` | Bug fix | 🐛 Bug Fixes |
| `docs:` | Documentation | 📚 Documentation |
| `chore:` | Maintenance | 🔧 Maintenance |
| `build:` | Build system | 🔧 Maintenance |
| `ci:` | CI/CD | 🔧 Maintenance |
| `perf:` | Performance | ✨ Features |
| `refactor:` | Code refactor | 🔧 Maintenance |
| `test:` | Tests | (not in changelog) |

### Examples

```bash
# Feature
git commit -m "feat: add dark mode support"
git commit -m "feat(auth): implement biometric login"

# Bug fix
git commit -m "fix: resolve crash on Android 12"
git commit -m "fix(payments): handle Stripe error correctly"

# Documentation
git commit -m "docs: update README with setup instructions"

# Maintenance
git commit -m "chore: upgrade dependencies"
git commit -m "build: update build configuration"
```

## Semantic Versioning

We follow [Semantic Versioning](https://semver.org/):

### Version Format: `MAJOR.MINOR.PATCH`

**MAJOR** (`1.0.0` → `2.0.0`)
- Breaking changes
- Incompatible API changes
- Requires user action

**Examples:**
- Removed deprecated API
- Changed authentication flow
- Major UI redesign

**MINOR** (`1.0.0` → `1.1.0`)
- New features
- Backwards compatible
- No breaking changes

**Examples:**
- Added new screen/feature
- New API endpoints
- Enhanced existing feature

**PATCH** (`1.0.0` → `1.0.1`)
- Bug fixes
- Backwards compatible
- No new features

**Examples:**
- Fixed crash
- Resolved UI issue
- Performance improvement

## GitHub Actions Workflow

The `.github/workflows/release.yml` workflow triggers on git tags:

### Jobs

**1. Create GitHub Release**
- Extracts changelog for version
- Creates GitHub Release
- Attaches release notes
- Marks as pre-release if version contains `-` (e.g., `1.0.0-beta`)

**2. Build iOS**
- Uses EAS Build
- Profile: `production`
- Submits to App Store Connect (optional)

**3. Build Android**
- Uses EAS Build
- Profile: `production`
- Submits to Google Play Console (optional)

**4. Publish OTA Update**
- Uses EAS Update
- Branch: `production`
- Updates live apps immediately

**5. Notifications**
- Slack notification (if configured)
- Discord notification (if configured)

## Configuration

### Required Secrets

Add these to GitHub repository secrets:

```
EXPO_TOKEN                           # Expo account token
EXPO_APPLE_APP_SPECIFIC_PASSWORD     # Apple App-Specific Password (optional)
SLACK_WEBHOOK_URL                    # Slack webhook (optional)
DISCORD_WEBHOOK_URL                  # Discord webhook (optional)
```

### EAS Build Profiles

Ensure `eas.json` has production profile:

```json
{
  "build": {
    "production": {
      "distribution": "store",
      "env": {
        "NODE_ENV": "production"
      },
      "ios": {
        "resourceClass": "m-medium"
      },
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD123456"
      },
      "android": {
        "serviceAccountKeyPath": "./service-account.json",
        "track": "production"
      }
    }
  }
}
```

## Manual Release Steps

If you prefer manual control:

### 1. Version Bump

```bash
# Edit package.json manually
{
  "version": "1.1.0"
}

# Edit app.json manually
{
  "expo": {
    "version": "1.1.0",
    "ios": {
      "buildNumber": "2"
    },
    "android": {
      "versionCode": 2
    }
  }
}
```

### 2. Update Changelog

```bash
# Edit CHANGELOG.md
## [1.1.0] - 2024-11-15

### Added
- New feature X
- New feature Y

### Fixed
- Bug Z
```

### 3. Commit and Tag

```bash
git add package.json app.json CHANGELOG.md
git commit -m "chore: release v1.1.0"
git tag -a v1.1.0 -m "Release v1.1.0"
git push origin main --tags
```

### 4. Build and Submit

```bash
# Build for both platforms
eas build --platform all --profile production

# Submit iOS
eas submit --platform ios --latest

# Submit Android
eas submit --platform android --latest

# Publish OTA update
eas update --branch production --message "Release v1.1.0"
```

## Pre-release Versions

For beta/alpha releases:

```bash
# Manually set version
npm version 1.1.0-beta.1

# Create pre-release tag
git tag -a v1.1.0-beta.1 -m "Beta release v1.1.0-beta.1"

# Push
git push origin main --tags
```

**GitHub will mark it as pre-release automatically.**

## Hotfix Workflow

For urgent production fixes:

### 1. Create hotfix branch

```bash
git checkout -b hotfix/critical-bug main
```

### 2. Fix the issue

```bash
# Make changes
git commit -m "fix: resolve critical production bug"
```

### 3. Release hotfix

```bash
# Patch version bump
npm run release:patch

# Or manually
git tag -a v1.0.1 -m "Hotfix v1.0.1"
```

### 4. Merge back

```bash
git checkout main
git merge hotfix/critical-bug
git push origin main --tags
```

## Rollback

If a release has issues:

### Rollback OTA Update

```bash
# Revert to previous update
eas update --branch production --message "Rollback to stable"
```

### Rollback App Store

- iOS: Use App Store Connect to rollback
- Android: Use Google Play Console phased rollout pause

## Troubleshooting

### "Working directory is not clean"

```bash
# Stash changes
git stash

# Or commit changes
git add .
git commit -m "chore: prepare for release"
```

### "Not on main branch"

```bash
# Switch to main
git checkout main

# Or use --force flag (not recommended)
node scripts/release.js patch --force
```

### "Tests failed"

```bash
# Fix failing tests first
npm test

# Fix type errors
npm run type-check

# Fix lint errors
npm run lint
```

### Build failed on GitHub Actions

1. Check GitHub Actions logs
2. Verify secrets are configured
3. Check EAS Build logs: `eas build:list`
4. Retry: Re-push the tag or trigger workflow manually

### Version conflict

```bash
# Delete local tag
git tag -d v1.0.1

# Delete remote tag
git push origin :refs/tags/v1.0.1

# Create new release
npm run release:patch
```

## Best Practices

### 1. Release Frequency

- **Patch**: As needed for bugs (weekly/bi-weekly)
- **Minor**: Monthly for new features
- **Major**: Quarterly for big changes

### 2. Testing Before Release

```bash
# Full test suite
npm test

# E2E tests
maestro test .maestro/

# Build locally first
eas build --platform all --profile preview --local
```

### 3. Changelog Quality

- Write clear, user-focused messages
- Group related changes
- Link to issues/PRs
- Include breaking changes prominently

### 4. Communication

- Announce major releases in advance
- Document breaking changes
- Provide migration guides
- Use release notes effectively

## Automation Tips

### Auto-release on merge to main

Add to `.github/workflows/auto-release.yml`:

```yaml
name: Auto Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Bump version and push tag
        run: |
          npm run release:patch
          git push origin main --tags
```

### Release candidates

```bash
# Create RC
npm version 1.1.0-rc.1

# Test thoroughly

# Promote to stable
npm version 1.1.0
```

## Related

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)

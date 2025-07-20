# 🚀 Simple Deployment Guide

This guide covers the simplified CI/CD pipeline that's easy to understand and maintain while still providing essential deployment capabilities.

## 🎯 Overview

The simplified deployment approach focuses on:
- **Easy to understand** deployment logic
- **Minimal configuration** required
- **Essential features only** (no enterprise complexity)
- **Standard Azure Static Web Apps** deployment
- **Basic security scanning** (optional)

## 🏗️ Simple Architecture

### Deployment Flow
```
📝 Code Push → 🔨 Build & Test → 🚀 Deploy
     ↓              ↓              ↓
   Branches       Unit Tests     Azure SWA
     Tags         Security       Environments
```

### Environment Strategy

| Environment | Trigger | Version Format | Purpose |
|-------------|---------|----------------|---------|
| **Development** | `main`, `develop` branches | `branch-sha-timestamp` | Development testing |
| **Staging** | `main` branch, pre-release tags | `branch-sha-timestamp` or tag | Integration testing |
| **Production** | Production tags (`v1.2.3`) | `v1.2.3` | Live application |

## ⚙️ Setup Instructions

### 1. Replace Complex Workflow

Simply replace your current workflow with the simplified version:

```bash
# Remove the complex workflow (optional - keep as backup)
mv .github/workflows/enhanced-ci-cd.yml .github/workflows/enhanced-ci-cd.yml.backup

# The new simple workflow is already created at:
# .github/workflows/simple-ci-cd.yml
```

### 2. Required Secrets

Set up these Azure Static Web Apps secrets in your repository:

```bash
# GitHub Repository Settings > Secrets and Variables > Actions > Secrets
AZURE_STATIC_WEB_APPS_API_TOKEN_DEV      # Development environment token
AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING  # Staging environment token  
AZURE_STATIC_WEB_APPS_API_TOKEN_PROD     # Production environment token

# Optional: Security scanning
SONAR_TOKEN                              # SonarCloud token (if using SonarCloud)
```

### 3. Optional Variables

Configure these repository variables for customization:

```bash
# GitHub Repository Settings > Secrets and Variables > Actions > Variables
ENABLE_SONAR=true                        # Enable SonarCloud scanning
ENABLE_CHECKMARX=false                   # Enable Checkmarx scanning (disabled by default)
```

## 🚀 How It Works

### Automatic Deployments

**Main Branch:**
- Pushes to `main` deploy to Development + Staging
- Simple and predictable

**Develop Branch:**
- Pushes to `develop` deploy to Development only
- Good for feature integration

**Staging Branch:**
- Pushes to `staging` deploy to Staging only
- Direct staging testing

### Tag-Based Production Deployments

**Production Release:**
```bash
# Create a production tag
git tag v1.2.3
git push origin v1.2.3

# This automatically:
# 1. Builds and tests the code
# 2. Deploys to production
# 3. Creates a GitHub release
```

**Pre-Release Testing:**
```bash
# Create a pre-release tag
git tag v1.2.3-beta.1
git push origin v1.2.3-beta.1

# This deploys to staging for testing
```

### Manual Deployments

Use GitHub Actions UI for manual deployments:

1. Go to **Actions** tab in your repository
2. Select **Simple CI/CD Pipeline**
3. Click **Run workflow**
4. Choose your target environment
5. Optionally disable security scans for faster deployment

## 📋 Common Workflows

### Feature Development
```bash
# Work on feature branch
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature

# Create PR to develop
# After merge to develop → automatic development deployment
```

### Release Process
```bash
# Merge develop to main
git checkout main
git merge develop
git push origin main

# This deploys to development + staging automatically

# After staging validation, create production release
git tag v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3

# Production deployment happens automatically
```

### Hotfix Process
```bash
# Create hotfix from main
git checkout -b hotfix/critical-fix
git commit -m "Fix critical issue"
git push origin hotfix/critical-fix

# Create PR to main, after merge:
git checkout main
git pull origin main

# Create hotfix release
git tag v1.2.4 -m "Hotfix version 1.2.4"
git push origin v1.2.4
```

## 🔧 Customization

### Build Configuration

The pipeline works with standard npm scripts:

```json
{
  "scripts": {
    "build": "react-scripts build",     // or your build command
    "test": "react-scripts test --ci",  // or your test command  
    "lint": "eslint src/"               // optional linting
  }
}
```

### Security Scanning

**Enable SonarCloud:**
```bash
# Set repository variable
gh variable set ENABLE_SONAR --body "true"

# Add SonarCloud token secret
gh secret set SONAR_TOKEN --body "your-sonar-token"
```

**Disable Security Scans Temporarily:**
- Use manual workflow dispatch
- Uncheck "Enable security scans"
- Deploy faster for urgent fixes

### Different Output Directory

If your build outputs to a different directory, update the workflow:

```yaml
# In simple-ci-cd.yml, change this line:
output_location: "build"

# To your output directory:
output_location: "dist"  # or "public", etc.
```

## 📊 Monitoring

### Deployment Status

Check deployment status in:
- **GitHub Actions** tab for workflow results
- **Environments** tab for deployment history
- **Azure Portal** for Static Web Apps status

### Version Tracking

- **Development/Staging:** Uses branch name + short SHA + timestamp
- **Production:** Uses git tag version
- **GitHub Releases:** Automatically created for production tags

## 🛠️ Troubleshooting

### Common Issues

**Build Fails:**
```bash
# Check if you have the right npm scripts
npm run build  # Should work locally
npm run test   # Should work locally

# Update package.json scripts if needed
```

**Deployment Token Errors:**
```bash
# Verify Azure Static Web Apps tokens are set correctly
gh secret list

# Get new tokens from Azure Portal if needed
```

**Security Scan Failures:**
```bash
# Disable temporarily for urgent deployments
# Use manual workflow dispatch with security scans disabled

# Or set repository variable
gh variable set ENABLE_SONAR --body "false"
```

### Emergency Deployment

For urgent production fixes:

```bash
# 1. Use manual workflow dispatch
# 2. Select "production" environment  
# 3. Disable security scans checkbox
# 4. Deploy immediately

# Or push a production tag (bypasses manual steps)
git tag v1.2.3-hotfix.1
git push origin v1.2.3-hotfix.1
```

## 🔄 Migration from Complex Setup

### Step-by-Step Migration

1. **Backup Current Setup:**
```bash
cp .github/workflows/enhanced-ci-cd.yml .github/workflows/enhanced-ci-cd.yml.backup
```

2. **Test Simple Workflow:**
```bash
# The simple workflow is already created
# Test it with a small change first
```

3. **Remove Complex Workflows (Optional):**
```bash
# After confirming simple workflow works
rm .github/workflows/enhanced-ci-cd.yml.backup
rm .github/workflows/pr-protection.yml  # if not needed
```

4. **Cleanup Complex Actions (Optional):**
```bash
# Remove complex custom actions if not used elsewhere
rm -rf .github/actions/enhanced-deploy
rm -rf .github/actions/security-scan
# Keep .github/actions/azure-keyvault if you use Key Vault
```

### What You Keep vs. What You Lose

**✅ Keep (Essential Features):**
- Multi-environment deployments
- Automatic and manual deployments
- Version tracking
- Basic security scanning
- GitHub releases
- Azure Static Web Apps integration

**❌ Lose (Enterprise Features):**
- Complex approval workflows
- GPG signature verification
- Deployment time windows
- Risk assessment matrix
- Advanced security validations
- Complex pre-production strategies
- Enterprise compliance features

## 📚 Best Practices

### Simple Branching Strategy

```
main        # Production-ready code
├── develop # Integration branch
└── feature/* # Feature branches
```

### Tagging Strategy

```bash
# Production releases
v1.0.0, v1.1.0, v2.0.0

# Pre-releases  
v1.1.0-beta.1, v1.1.0-rc.1

# Hotfixes
v1.0.1, v1.0.2
```

### Development Workflow

1. **Feature Development:** feature/* → develop → development environment
2. **Integration Testing:** develop → main → staging environment  
3. **Production Release:** main → tag → production environment

## 🔗 Related Documentation

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SonarCloud Setup](https://sonarcloud.io/documentation/)

---
*This simplified approach maintains essential CI/CD capabilities while being much easier to understand and maintain.*
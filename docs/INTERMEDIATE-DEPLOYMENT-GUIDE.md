# 🎯 Intermediate Production-Grade Deployment Guide

This guide covers the intermediate deployment approach that combines production-grade features with maintainable complexity - giving you the best of both worlds.

## 🎯 Overview

The intermediate approach provides:
- ✅ **All deployment features you requested** (dev/staging short SHA, pre-prod/prod semantic tags)
- ✅ **Production-grade security** (configurable thresholds, risk assessment)
- ✅ **Manageable complexity** (single workflow, clear logic)
- ✅ **Comprehensive controls** (manual overrides, approval workflows)
- ✅ **Enterprise features** (without overwhelming complexity)

## 🏗️ Architecture & Strategy

### Environment Deployment Flow
```
🔧 Development → 🧪 Staging → 🎯 Pre-Production → 🏭 Production
     ↓              ↓              ↓              ↓
 Short SHA      Short SHA     Semantic Ver   Semantic Ver
 Fast Feedback  Integration   RC Testing     Final Release
 Low Risk       Low Risk      Medium Risk    High Risk
```

### Deployment Triggers & Versioning

| Environment | Trigger | Version Format | Risk Level | Approval |
|-------------|---------|----------------|------------|----------|
| **Development** | Branches (feature/*, develop, main) | `dev-{sha}-{timestamp}` | LOW | None |
| **Staging** | Branches (main, staging), Alpha/Beta tags | `staging-{sha}-{timestamp}` | LOW | None |
| **Pre-Production** | Pre-release tags (v1.2.3-rc.1, v1.2.3-pre.1) | `v1.2.3-rc.1` | MEDIUM | Optional |
| **Production** | Semantic tags (v1.2.3) | `v1.2.3` | HIGH/CRITICAL | Required |

## ⚙️ Setup Instructions

### 1. Switch to Intermediate Workflow

```bash
# Option 1: Backup existing and switch
mv .github/workflows/enhanced-ci-cd.yml .github/workflows/enhanced-ci-cd.yml.backup

# The intermediate workflow is ready at:
# .github/workflows/intermediate-ci-cd.yml
```

### 2. Required Secrets

```bash
# Azure Static Web Apps deployment tokens
AZURE_STATIC_WEB_APPS_API_TOKEN_DEV       # Development environment
AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING   # Staging environment  
AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD   # Pre-production environment
AZURE_STATIC_WEB_APPS_API_TOKEN_PROD      # Production environment

# Security scanning (optional but recommended)
SONAR_TOKEN                               # SonarCloud authentication
CHECKMARX_CLIENT                          # Checkmarx client ID
CHECKMARX_SECRET                          # Checkmarx client secret
```

### 3. Configurable Repository Variables

```bash
# Security Scan Controls
ENABLE_SONAR_SCAN=true                    # Enable SonarCloud analysis
ENABLE_CHECKMARX_SCAN=true                # Enable Checkmarx security scanning

# Quality Gate Thresholds
MIN_CODE_COVERAGE=80                      # Minimum code coverage percentage
MAX_CRITICAL_VULNERABILITIES=0           # Maximum critical vulnerabilities
MAX_HIGH_VULNERABILITIES=2               # Maximum high vulnerabilities

# Checkmarx Configuration
CHECKMARX_SCAN_TYPES=sca,sast,kics       # Scan types (comma-separated)

# Optional Controls
REQUIRE_PATCH_APPROVAL=false             # Require approval for patch releases
```

## 🚀 Deployment Strategies

### Development Environment (Short SHA)

**Automatic Deployments:**
```bash
# Feature development
git checkout -b feature/new-feature
git push origin feature/new-feature
# → Deploys to development with version: dev-a1b2c3d-20241225-1430

# Integration branch
git checkout develop
git push origin develop
# → Deploys to development with version: dev-a1b2c3d-20241225-1445

# Main branch
git checkout main
git push origin main
# → Deploys to development + staging
```

### Staging Environment (Short SHA)

**Automatic Deployments:**
```bash
# Main branch commits
git push origin main
# → staging-a1b2c3d-20241225-1500

# Alpha/Beta testing
git tag v1.2.3-alpha.1
git push origin v1.2.3-alpha.1
# → staging-a1b2c3d-20241225-1515
```

### Pre-Production Environment (Semantic Versioning)

**Release Candidate Testing:**
```bash
# Release candidate
git tag v1.2.3-rc.1 -m "Release candidate 1.2.3"
git push origin v1.2.3-rc.1
# → Deploys to pre-production with version: v1.2.3-rc.1

# Pre-release testing
git tag v1.2.3-pre.1 -m "Pre-release 1.2.3"
git push origin v1.2.3-pre.1
# → Deploys to pre-production with version: v1.2.3-pre.1
```

### Production Environment (Semantic Versioning)

**Production Releases:**
```bash
# Patch release (medium risk)
git tag v1.2.3 -m "Production release 1.2.3"
git push origin v1.2.3
# → Risk: MEDIUM, Approval: Optional

# Minor release (high risk)
git tag v1.3.0 -m "Minor release 1.3.0"
git push origin v1.3.0
# → Risk: HIGH, Approval: Required

# Major release (critical risk)
git tag v2.0.0 -m "Major release 2.0.0"
git push origin v2.0.0
# → Risk: CRITICAL, Approval: Required
```

## 🎛️ Manual Deployment Controls

### Workflow Dispatch Options

Access via: **GitHub Actions → Intermediate Production-Grade CI/CD → Run workflow**

**Environment Selection:**
- Development
- Staging
- Pre-Production (requires approval)
- Production (requires approval)

**Security Controls:**
- Enable/disable SonarCloud analysis
- Enable/disable Checkmarx security scanning
- Force version override (production only)

### Emergency Deployment

For urgent production fixes:

```bash
# Method 1: Direct tag deployment
git tag v1.2.4-hotfix.1 -m "Emergency hotfix"
git push origin v1.2.4-hotfix.1

# Method 2: Manual workflow dispatch
# 1. Go to GitHub Actions
# 2. Select workflow
# 3. Choose "production" environment
# 4. Optionally disable security scans for speed
# 5. Run deployment
```

## 🎯 Composite Actions Architecture

### Clean Security Scanning with Reusable Actions

The intermediate workflow uses **composite actions** to maintain clean, readable workflow files while providing comprehensive security scanning:

**Benefits:**
- ✅ **Clean workflow files** - Complex scan logic moved to reusable actions
- ✅ **Consistent behavior** - Same scan configuration across all environments  
- ✅ **Easy maintenance** - Centralized action updates affect all workflows
- ✅ **Simple customization** - Change variables without workflow modifications

**Available Composite Actions:**
- 🔬 **SonarCloud Analysis** (`.github/actions/sonar-analysis`)
- 🔒 **Checkmarx Security Scan** (`.github/actions/checkmarx-scan`)

> 📖 **Composite Actions Guide**: See [Composite Actions README](.github/actions/README.md) for detailed configuration.

## 🛡️ Security & Quality Controls

### Risk-Based Deployment Strategy

**Risk Assessment Matrix:**

| Release Type | Risk Level | Quality Checks | Approval Required | Example |
|--------------|------------|----------------|-------------------|---------|
| **Patch** | MEDIUM | Standard | Optional | v1.2.3 → v1.2.4 |
| **Minor** | HIGH | Enhanced | Required | v1.2.0 → v1.3.0 |
| **Major** | CRITICAL | Maximum | Required | v1.0.0 → v2.0.0 |

### Security Scanning Integration

**SonarCloud Analysis:**
- Automatic code quality assessment
- Configurable coverage thresholds
- Quality gate evaluation
- Integration with deployment decisions

**Checkmarx Security Scanning:**
- SAST, SCA, and KICS scans
- Configurable scan types and thresholds
- Vulnerability assessment
- Risk-based failure handling

### Quality Gate Thresholds

**Configurable Thresholds (via Repository Variables):**
```bash
# SonarCloud Quality Gates
MIN_CODE_COVERAGE=80                    # Minimum overall coverage
MIN_BRANCH_COVERAGE=70                  # Minimum branch coverage  
SONAR_MAINTAINABILITY_RATING=A          # Target maintainability (A-E)
SONAR_RELIABILITY_RATING=A              # Target reliability (A-E)
SONAR_SECURITY_RATING=A                 # Target security (A-E)
MAX_BLOCKER_ISSUES=0                    # Maximum blocker issues
MAX_CRITICAL_ISSUES=0                   # Maximum critical issues
MAX_MAJOR_ISSUES=5                      # Maximum major issues

# Checkmarx Security Thresholds
MAX_CRITICAL_VULNERABILITIES=0          # SAST critical limit
MAX_HIGH_VULNERABILITIES=2              # SAST high limit
MAX_MEDIUM_VULNERABILITIES=10           # SAST medium limit
MAX_SCA_CRITICAL=0                      # SCA critical limit
MAX_SCA_HIGH=2                          # SCA high limit
MAX_KICS_HIGH=0                         # KICS high limit

# Scan Configuration
CHECKMARX_SCAN_TYPES=sca,sast,kics      # Enabled scan types
CHECKMARX_PRESET="Checkmarx Default"    # Scan preset
CHECKMARX_INCREMENTAL=true              # Enable incremental scanning
```

## 📋 Common Workflows

### Feature Development Workflow

```bash
# 1. Create feature branch
git checkout -b feature/user-authentication
git commit -m "feat: add user authentication"
git push origin feature/user-authentication
# → Automatic deployment to development

# 2. Create PR to develop
# → PR checks run automatically

# 3. Merge to develop
# → Automatic deployment to development

# 4. Merge develop to main
# → Automatic deployment to development + staging
```

### Release Workflow

```bash
# 1. Prepare release branch
git checkout -b release/1.2.0
git push origin release/1.2.0
# → Automatic deployment to staging + pre-production

# 2. Create release candidate
git tag v1.2.0-rc.1 -m "Release candidate 1.2.0"
git push origin v1.2.0-rc.1
# → Deployment to pre-production for final testing

# 3. Create production release
git tag v1.2.0 -m "Production release 1.2.0"
git push origin v1.2.0
# → Production deployment with risk assessment and approval
```

### Hotfix Workflow

```bash
# 1. Create hotfix branch from main
git checkout -b hotfix/critical-security-fix
git commit -m "fix: resolve critical security vulnerability"
git push origin hotfix/critical-security-fix
# → Automatic deployment to development + staging

# 2. Merge to main after testing
git checkout main
git merge hotfix/critical-security-fix
git push origin main

# 3. Create hotfix release
git tag v1.2.4 -m "Hotfix: critical security fix"
git push origin v1.2.4
# → Production deployment with medium risk assessment
```

## 📊 Monitoring & Observability

### Deployment Tracking

**Version Information:**
- Development: `dev-{sha}-{timestamp}`
- Staging: `staging-{sha}-{timestamp}`
- Pre-Production/Production: Semantic versions

**Risk Assessment:**
- Automatic risk level determination
- Approval workflow triggers
- Quality gate evaluation

### Comprehensive Reporting

**Deployment Summary includes:**
- Environment deployment status
- Version information for each environment
- Quality and security check results
- Risk assessment and approval status

## 🔧 Customization Options

### Build Configuration

**Standard npm Scripts:**
```json
{
  "scripts": {
    "build": "react-scripts build",
    "test": "react-scripts test --coverage --ci",
    "lint": "eslint src/"
  }
}
```

### Security Scan Customization

**Enable/Disable Scans:**
```bash
# Repository variables
gh variable set ENABLE_SONAR_SCAN --body "false"
gh variable set ENABLE_CHECKMARX_SCAN --body "false"

# Or use workflow dispatch for one-time overrides
```

**Threshold Customization:**
```bash
# Adjust quality thresholds
gh variable set MIN_CODE_COVERAGE --body "90"
gh variable set MAX_HIGH_VULNERABILITIES --body "0"

# Customize scan types
gh variable set CHECKMARX_SCAN_TYPES --body "sast,sca"
```

### Version Override

**Production Version Override:**
```bash
# Use workflow dispatch with force_version input
# Example: Force deploy as v1.2.3-hotfix.2
```

## 🛠️ Troubleshooting

### Common Issues

**Deployment Blocked by Quality Gate:**
```bash
# Check quality check results
gh run view --log

# Temporarily disable for urgent fixes
# Use workflow dispatch with security scans disabled
```

**Risk Assessment Blocks Deployment:**
```bash
# Major releases require approval
# Check GitHub Environments for approval settings

# For emergencies, use manual workflow dispatch
```

**Version Generation Issues:**
```bash
# Check existing tags
git tag -l "v*" | sort -V

# Force version if needed
# Use workflow dispatch with force_version input
```

### Emergency Procedures

**Critical Production Issue:**
```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-issue-v1.2.4

# 2. Apply fix and create tag
git tag v1.2.4 -m "Emergency hotfix"

# 3. Push for immediate deployment
git push origin v1.2.4

# 4. Monitor deployment in GitHub Actions
```

## 📚 Migration Guide

### From Simple to Intermediate

**Benefits of Upgrading:**
- Risk-based deployment strategies
- Enhanced security scanning
- Quality gate enforcement
- Production-grade controls
- Approval workflows

**Migration Steps:**
```bash
# 1. Switch workflow files
mv .github/workflows/simple-ci-cd.yml .github/workflows/simple-ci-cd.yml.backup

# 2. Add pre-production environment secrets
# AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD

# 3. Configure quality thresholds
# Set repository variables for thresholds

# 4. Test with a small change
```

### From Enterprise to Intermediate

**What You Keep:**
- All deployment features
- Security scanning
- Risk assessment
- Quality gates
- Approval workflows

**What You Lose:**
- GPG signature verification
- Deployment time windows
- Complex enterprise validations
- Advanced compliance features

**Migration Steps:**
```bash
# 1. Switch to intermediate workflow
mv .github/workflows/enhanced-ci-cd.yml .github/workflows/enhanced-ci-cd.yml.backup

# 2. Remove complex custom actions (optional)
# Keep essential ones like azure-keyvault

# 3. Test deployment pipeline
```

## 🎯 Best Practices

### Version Management

**Semantic Versioning Strategy:**
- Major versions: Breaking changes (v2.0.0)
- Minor versions: New features (v1.2.0)
- Patch versions: Bug fixes (v1.1.1)
- Pre-releases: Testing versions (v1.2.0-rc.1)

### Branch Strategy

**Recommended GitFlow:**
```
main           # Production-ready code
├── develop    # Integration branch
├── release/*  # Release preparation
├── hotfix/*   # Critical fixes
└── feature/*  # Feature development
```

### Security Practices

**Quality Gates:**
- Maintain high code coverage standards
- Zero tolerance for critical vulnerabilities
- Regular dependency updates
- Automated security scanning

**Risk Management:**
- Use appropriate risk levels for releases
- Require approvals for high-risk deployments
- Test thoroughly in pre-production
- Maintain rollback capabilities

## 🔗 Related Documentation

- [Simple Deployment Guide](./SIMPLE-DEPLOYMENT-GUIDE.md) - For easier maintenance
- [Production-Grade Deployment](./14-PRODUCTION-GRADE-DEPLOYMENT.md) - For maximum enterprise features
- [Configurable Thresholds](./12-CONFIGURABLE-THRESHOLDS.md) - Detailed threshold configuration
- [Versioning Strategy](./13-VERSIONING-STRATEGY.md) - Environment-specific versioning

---
*This intermediate approach provides production-grade deployment capabilities while maintaining reasonable complexity and ease of maintenance.*
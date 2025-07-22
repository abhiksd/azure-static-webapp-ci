# Shared Workflow Migration Guide

## Overview

This guide explains how to migrate from the current intermediate CI/CD workflow to a shared workflow architecture that promotes reusability and maintainability across multiple frontend applications.

## Architecture Overview

### Current Architecture (Before)
```
Frontend App Repository
├── .github/
│   ├── workflows/
│   │   ├── intermediate-ci-cd.yml        # Full CI/CD pipeline
│   │   └── pr-protection.yml             # PR security checks
│   └── actions/                          # Composite actions
│       ├── sonar-analysis/
│       ├── checkmarx-scan/
│       └── deploy-static-app/
```

### New Shared Architecture (After)
```
Shared CI/CD Repository (NEW)
├── .github/
│   ├── workflows/
│   │   └── shared-ci-cd.yml              # Reusable workflow
│   └── actions/                          # Composite actions
│       ├── sonar-analysis/
│       ├── checkmarx-scan/
│       └── deploy-static-app/

Frontend App Repository (UPDATED)
├── .github/
│   └── workflows/
│       ├── ci-cd.yml                     # Calls shared workflow
│       └── pr-security-check.yml         # Standalone PR checks
```

## Migration Steps

### Step 1: Create Shared CI/CD Repository

1. **Create a new repository** for shared workflows:
   ```bash
   # Example repository name
   your-org/shared-ci-cd-workflows
   ```

2. **Move files to shared repository**:
   - `.github/workflows/shared-ci-cd.yml` (the reusable workflow)
   - `.github/actions/` (all composite actions)
   - Documentation files

### Step 2: Set Up Shared Repository

Copy these files from the current repository to the shared repository:

```bash
# Composite Actions (move all)
cp -r .github/actions/ shared-repo/.github/actions/

# Workflow (use the new shared workflow)
cp shared-ci-cd.yml shared-repo/.github/workflows/

# Documentation
cp *.md shared-repo/
```

### Step 3: Update Frontend Application

In your frontend application repository:

1. **Remove old workflows and actions**:
   ```bash
   rm .github/workflows/intermediate-ci-cd.yml
   rm -rf .github/actions/
   ```

2. **Add new workflows**:
   - `ci-cd.yml` (calls shared workflow)
   - `pr-security-check.yml` (standalone)

3. **Update repository settings**

## File Structure Details

### Shared Repository Structure
```
shared-ci-cd-workflows/
├── .github/
│   ├── workflows/
│   │   └── shared-ci-cd.yml              # Main reusable workflow
│   └── actions/
│       ├── sonar-analysis/
│       │   └── action.yml
│       ├── checkmarx-scan/
│       │   └── action.yml
│       └── deploy-static-app/
│           └── action.yml
├── AZURE_DEPLOYMENT_TROUBLESHOOTING.md
├── CHECKMARX_TROUBLESHOOTING.md
├── FRONTEND_CHECKMARX_OPTIMIZATION.md
├── INTEGRATION_GUIDE.md
├── README.md
└── configs/
    ├── sonar-project.properties
    ├── staticwebapp.config.json
    └── frontend.gitignore
```

### Frontend Application Structure
```
your-frontend-app/
├── .github/
│   └── workflows/
│       ├── ci-cd.yml                     # Calls shared workflow
│       └── pr-security-check.yml         # Standalone PR checks
├── src/
├── public/
├── package.json
└── README.md
```

## Workflow Configuration

### Frontend Application CI/CD (`ci-cd.yml`)

```yaml
name: Frontend Application CI/CD

on:
  push:
    branches: [main, develop, staging, preprod]
  workflow_dispatch:
    inputs:
      environment:
        type: choice
        options: [development, staging, pre-production, production]

jobs:
  call-shared-workflow:
    uses: your-org/shared-ci-cd-workflows/.github/workflows/shared-ci-cd.yml@main
    with:
      # Customize for your app
      node-version: '18'
      output-location: 'build'        # or 'dist' for Vite
      build-command: 'npm run build'
      min-code-coverage: '75'
      max-high-vulnerabilities: '5'
    secrets:
      AZURE_STATIC_WEB_APPS_API_TOKEN_DEV: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_DEV }}
      AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING }}
      AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD }}
      AZURE_STATIC_WEB_APPS_API_TOKEN_PROD: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_PROD }}
      SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      CHECKMARX_CLIENT_ID: ${{ secrets.CHECKMARX_CLIENT_ID }}
      CHECKMARX_SECRET: ${{ secrets.CHECKMARX_SECRET }}
      CHECKMARX_TENANT: ${{ secrets.CHECKMARX_TENANT }}
```

### PR Security Check (`pr-security-check.yml`)

This stays in the frontend application for PR-specific security validation:

```yaml
name: PR Security Check

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  pr-security-scan:
    runs-on: ubuntu-latest
    steps:
      # Standalone security scanning for PRs
      # Does not require shared workflows
```

## Repository Secrets Configuration

### Shared Repository Secrets
The shared repository doesn't need secrets - they're passed from calling repositories.

### Frontend Application Secrets

Set these secrets in **each frontend application repository**:

#### Required Azure Secrets:
```
AZURE_STATIC_WEB_APPS_API_TOKEN_DEV
AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING
AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD
AZURE_STATIC_WEB_APPS_API_TOKEN_PROD
```

#### Required Security Scanning Secrets:
```
SONAR_TOKEN
CHECKMARX_CLIENT_ID
CHECKMARX_SECRET
CHECKMARX_TENANT
CHECKMARX_BASE_URI (optional)
```

### Repository Variables

Set these variables in **each frontend application repository**:

#### SonarCloud Variables:
```
SONAR_ORGANIZATION
SONAR_HOST_URL (optional, defaults to sonarcloud.io)
SONAR_SKIP_SSL_VERIFICATION (optional, defaults to false)
```

#### Quality Gate Variables:
```
MIN_CODE_COVERAGE (optional, defaults to 80)
MAX_CRITICAL_VULNERABILITIES (optional, defaults to 0)
MAX_HIGH_VULNERABILITIES (optional, defaults to 2)
ENABLE_SONAR_SCAN (optional, defaults to true)
ENABLE_CHECKMARX_SCAN (optional, defaults to true)
```

## Benefits of Shared Workflow Architecture

### ✅ **Centralized Maintenance**
- Update CI/CD logic in one place
- Bug fixes apply to all frontend applications
- Consistent deployment patterns across projects

### ✅ **Reduced Duplication**
- No need to copy workflow files across repositories
- Composite actions maintained centrally
- Single source of truth for CI/CD best practices

### ✅ **Easier Updates**
- Version-controlled shared workflows (`@main`, `@v1.2.3`)
- Gradual rollout of changes
- Easy rollback if issues occur

### ✅ **Improved Security**
- Centralized security scanning logic
- Consistent vulnerability thresholds
- Easier to audit and update security practices

### ✅ **Flexible Configuration**
- Each frontend app can customize build settings
- Environment-specific configurations
- Optional features (enable/disable scans)

## Customization Options

### Per-Application Customization

Each frontend application can customize:

```yaml
with:
  # Build settings
  node-version: '18'                    # Node.js version
  output-location: 'build'              # Build output directory
  build-command: 'npm run build'       # Custom build command
  install-command: 'npm ci'            # Custom install command
  
  # Quality thresholds
  min-code-coverage: '75'               # Coverage requirement
  max-critical-vulnerabilities: '0'     # Critical vuln limit
  max-high-vulnerabilities: '5'         # High vuln limit
  
  # Feature toggles
  enable-sonar: true                    # Enable SonarCloud
  enable-checkmarx: true                # Enable Checkmarx
  skip-deployment: false                # Skip deployment
```

### Framework-Specific Examples

#### React Application:
```yaml
with:
  output-location: 'build'
  build-command: 'npm run build'
  install-command: 'npm ci'
```

#### Vue/Vite Application:
```yaml
with:
  output-location: 'dist'
  build-command: 'npm run build'
  install-command: 'npm install'
```

#### Next.js Application:
```yaml
with:
  output-location: 'out'
  build-command: 'npm run build && npm run export'
  install-command: 'npm ci'
```

## Migration Checklist

### ✅ **Pre-Migration**
- [ ] Create shared CI/CD repository
- [ ] Move composite actions to shared repository  
- [ ] Test shared workflow with one frontend application
- [ ] Document any custom configurations needed

### ✅ **Migration**
- [ ] Update frontend application workflow files
- [ ] Configure repository secrets and variables
- [ ] Remove old workflow files and actions
- [ ] Update documentation and README files

### ✅ **Post-Migration**
- [ ] Test all deployment environments
- [ ] Verify security scanning works correctly
- [ ] Validate PR security checks function properly
- [ ] Monitor first few deployments for issues

### ✅ **Validation**
- [ ] All environments deploy successfully
- [ ] SonarCloud analysis runs and reports results
- [ ] Checkmarx scans complete without errors
- [ ] PR security checks provide proper feedback
- [ ] Azure Static Web Apps deployments work correctly

## Troubleshooting

### Common Issues

#### 1. **Shared workflow not found**
```
Error: Workflow file not found in repository
```
**Solution**: Ensure the shared repository path and file name are correct:
```yaml
uses: your-org/shared-ci-cd-workflows/.github/workflows/shared-ci-cd.yml@main
```

#### 2. **Secrets not available**
```
Error: Required secret not provided
```
**Solution**: Verify all required secrets are set in the frontend repository.

#### 3. **Composite action not found**
```
Error: Action 'sonar-analysis' not found
```
**Solution**: Ensure composite actions are properly copied to the shared repository.

#### 4. **Permission denied**
```
Error: Repository not accessible
```
**Solution**: Ensure the shared repository is accessible to the frontend repository (same organization or public).

## Advanced Usage

### Version Pinning
Pin to specific versions for stability:
```yaml
uses: your-org/shared-ci-cd-workflows/.github/workflows/shared-ci-cd.yml@v1.2.3
```

### Conditional Deployment
Skip deployment based on conditions:
```yaml
with:
  skip-deployment: ${{ github.event_name == 'pull_request' }}
```

### Multiple Environments
Deploy to multiple environments:
```yaml
with:
  environment: ${{ github.ref == 'refs/heads/main' && 'production' || 'development' }}
```

## Support and Maintenance

### Updating Shared Workflows
1. **Make changes** in the shared repository
2. **Test changes** with a single frontend application
3. **Create a new tag/release** for the shared workflow
4. **Update frontend applications** to use the new version
5. **Monitor deployments** for any issues

### Getting Help
- Check troubleshooting documentation in shared repository
- Review workflow logs in GitHub Actions
- Validate repository secrets and variables configuration
- Test with minimal configuration first

The shared workflow architecture provides a robust, maintainable, and scalable solution for frontend CI/CD pipelines! 🚀
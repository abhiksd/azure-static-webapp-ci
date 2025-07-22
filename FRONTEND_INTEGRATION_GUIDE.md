# Frontend Application Integration Guide

This guide provides step-by-step instructions for integrating the shared CI/CD workflow into your frontend application repository.

## Prerequisites

### Required Resources
- **Frontend application repository** (React, Vue, Angular, Next.js, etc.)
- **Azure Static Web Apps** resources (dev, staging, pre-prod, prod)
- **SonarCloud** organization and project setup
- **Checkmarx AST** account and tenant
- **GitHub repository** with Actions enabled

### Access Requirements
- **Admin access** to frontend repository for secrets configuration
- **Azure portal access** for Static Web Apps API tokens
- **SonarCloud admin access** for token generation
- **Checkmarx admin access** for client credentials

## Integration Steps

### Step 1: Create CI/CD Workflow

Create `.github/workflows/ci-cd.yml` in your frontend repository:

```yaml
name: Frontend Application CI/CD

on:
**push:
****branches: [main, develop, staging, preprod]
****tags: ['v*']
**pull_request:
****branches: [main, develop]
**workflow_dispatch:
****inputs:
******environment:
********description: 'Target environment'
********required: true
********default: 'development'
********type: choice
********options:
********- development
********- staging
********- pre-production
********- production

jobs:
**call-shared-workflow:
****uses: YOUR_ORG/shared-ci-cd-workflows/.github/workflows/shared-ci-cd.yml@main
****with:
******# Build configuration (customize for your app)
******node-version: '18'****************# Node.js version
******app-location: '/'**************** # Source code location
******output-location: 'build'**********# Build output directory (use 'dist' for Vite/Vue)
******build-command: 'npm run build'****# Build command
******install-command: 'npm ci'******** # Install command
****
******# Environment
******environment: ${{ github.event.inputs.environment || 'development' }}
****
******# All configuration is now centralized in the shared workflow repository
******# No overrides needed - everything controlled via repository variables
**
****secrets:
******# Azure Static Web Apps API tokens
******AZURE_STATIC_WEB_APPS_API_TOKEN_DEV: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_DEV }}
******AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING }}
******AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD }}
******AZURE_STATIC_WEB_APPS_API_TOKEN_PROD: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_PROD }}
****
******# Security scanning secrets
******SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
******CHECKMARX_CLIENT_ID: ${{ secrets.CHECKMARX_CLIENT_ID }}
******CHECKMARX_SECRET: ${{ secrets.CHECKMARX_SECRET }}
******CHECKMARX_TENANT: ${{ secrets.CHECKMARX_TENANT }}
******CHECKMARX_BASE_URI: ${{ secrets.CHECKMARX_BASE_URI }}

**# Optional: Add post-deployment steps specific to your app
**post-deployment:
****needs: call-shared-workflow
****runs-on: ubuntu-latest
****if: always()
**
****steps:
******- name: Deployment Results
********run: |
**********echo "## Deployment Results" >> $GITHUB_STEP_SUMMARY
**********echo "**Version**: ${{ needs.call-shared-workflow.outputs.version }}" >> $GITHUB_STEP_SUMMARY
********
**********if [ -n "${{ needs.call-shared-workflow.outputs.dev-url }}" ]; then
************echo "🔗 **Development**: [${{ needs.call-shared-workflow.outputs.dev-url }}](${{ needs.call-shared-workflow.outputs.dev-url }})" >> $GITHUB_STEP_SUMMARY
**********fi
********
**********if [ -n "${{ needs.call-shared-workflow.outputs.prod-url }}" ]; then
************echo "🔗 **Production**: [${{ needs.call-shared-workflow.outputs.prod-url }}](${{ needs.call-shared-workflow.outputs.prod-url }})" >> $GITHUB_STEP_SUMMARY
**********fi
```

### Step 2: Add PR Security Check

Copy the PR security check workflow to `.github/workflows/pr-security-check.yml`:

```bash
# Download from shared repository
curl -o .github/workflows/pr-security-check.yml \
**https://raw.githubusercontent.com/YOUR_ORG/shared-ci-cd-workflows/main/pr-security-check.yml
```

### Step 3: Configure Repository Secrets

#### Azure Static Web Apps Secrets

For each environment, get the API token from Azure portal:

1. **Go to Azure Portal** → Static Web Apps
2. **Select your Static Web App
3. **Go to Overview** → Manage deployment token
4. **Copy the deployment token

Set these secrets in your frontend repository:

```
Repository Settings → Secrets and variables → Actions → Secrets

AZURE_STATIC_WEB_APPS_API_TOKEN_DEV******= "deployment-token-for-dev"
AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING**= "deployment-token-for-staging"
AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD**= "deployment-token-for-preprod"
AZURE_STATIC_WEB_APPS_API_TOKEN_PROD**** = "deployment-token-for-production"
```

#### SonarCloud Secrets

1. **Go to SonarCloud** → My Account → Security
2. **Generate a token** with appropriate permissions
3. **Note your organization name

Set these secrets:

```
SONAR_TOKEN = "your-sonarcloud-token"
```

Set this variable:

```
Repository Settings → Secrets and variables → Actions → Variables

SONAR_ORGANIZATION = "your-sonarcloud-org"
```

#### Checkmarx Secrets

1. **Go to Checkmarx AST Portal** → Settings → API Keys
2. **Create new API key/client** with scanning permissions
3. **Note your tenant name

Set these secrets:

```
CHECKMARX_CLIENT_ID**= "your-client-id"
CHECKMARX_SECRET**** = "your-client-secret"
CHECKMARX_TENANT**** = "your-tenant-name"
CHECKMARX_BASE_URI** = "https://ast.checkmarx.net"**# (optional)
```

### Step 4: Framework-Specific Configuration

#### React Applications

```yaml
with:
**output-location: 'build'
**build-command: 'npm run build'
**install-command: 'npm ci'
```

#### Vue.js Applications

```yaml
with:
**output-location: 'dist'
**build-command: 'npm run build'
**install-command: 'npm install'
```

#### Next.js Applications

```yaml
with:
**output-location: 'out'
**build-command: 'npm run build && npm run export'
**install-command: 'npm ci'
```

#### Angular Applications

```yaml
with:
**output-location: 'dist/your-app-name'
**build-command: 'npm run build -- --prod'
**install-command: 'npm ci'
```

### Step 5: Configure SonarCloud Project

Create `sonar-project.properties` in your project root:

```properties
# SonarCloud Configuration
sonar.projectKey=your-org_your-repo-name
sonar.organization=your-sonarcloud-org

# Project Information
sonar.projectName=Your Frontend App
sonar.projectVersion=1.0

# Source Configuration
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.js,**/*.test.jsx,**/*.test.ts,**/*.test.tsx,**/*.spec.js,**/*.spec.jsx,**/*.spec.ts,**/*.spec.tsx

# Coverage Configuration
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/*.test.js,**/*.test.jsx,**/*.test.ts,**/*.test.tsx,**/*.spec.js,**/*.spec.jsx,**/*.spec.ts,**/*.spec.tsx,src/index.js,src/index.tsx

# Exclusions
sonar.exclusions=node_modules/**,build/**,dist/**,public/**,coverage/**,*.config.js,*.config.ts
```

### Step 6: Update package.json Scripts

Ensure your `package.json` includes required scripts:

```json
{
**"scripts": {
****"build": "react-scripts build",
****"test": "react-scripts test --watchAll=false",
****"test:coverage": "react-scripts test --coverage --watchAll=false",
****"sonar": "sonar-scanner"
**},
**"jest": {
****"collectCoverageFrom": [
******"src/**/*.{js,jsx,ts,tsx}",
******"!src/index.js",
******"!src/index.tsx",
******"!src/reportWebVitals.js",
******"!src/**/*.test.{js,jsx,ts,tsx}",
******"!src/**/*.spec.{js,jsx,ts,tsx}"
****]
**}
}
```

### Step 7: Configure Azure Static Web Apps (Optional)

If you need custom routing or configuration, create `staticwebapp.config.json` in your project root:

```json
{
**"routes": [
****{
******"route": "/*",
******"serve": "/index.html",
******"statusCode": 200
****}
**],
**"globalHeaders": {
****"X-Content-Type-Options": "nosniff",
****"X-Frame-Options": "DENY",
****"X-XSS-Protection": "1; mode=block"
**}
}
```

**Note**: This step is optional. Azure Static Web Apps will work with default configuration for most frontend applications.

## Environment Configuration

### Development Environment
- **Branch**: `develop` or `development`
- **Auto-deploy**: On push to develop branch
- **URL**: Will be provided in deployment summary

### Staging Environment
- **Branch**: `staging`
- **Auto-deploy**: On push to staging branch
- **URL**: Will be provided in deployment summary

### Pre-Production Environment
- **Branch**: `preprod` or `pre-production`
- **Auto-deploy**: On push to preprod branch
- **URL**: Will be provided in deployment summary

### Production Environment
- **Branch**: `main` or `master`
- **Auto-deploy**: On push to main branch or tag creation
- **URL**: Will be provided in deployment summary

## Validation Steps

### Step 1: Test Build Locally
```bash
npm ci
npm run build
npm test
```

### Step 2: Test First Deployment
1. **Push to develop branch
2. **Check GitHub Actions** for workflow execution
3. **Verify deployment** in Azure Static Web Apps
4. **Check security scans** in SonarCloud and Checkmarx

### Step 3: Test PR Security Check
1. **Create a test PR
2. **Check PR security scan** execution
3. **Verify PR comments** with security results

### Step 4: Test Production Deployment
1. **Create a release tag** or push to main
2. **Check production deployment
3. **Verify all environments** are working

## Troubleshooting

### Common Issues

#### 1. Build Failures
- **Check Node.js version** matches your local environment
- **Verify build command** in workflow configuration
- **Check dependencies** in package.json

#### 2. Deployment Failures
- **Verify Azure API tokens** are correct and not expired
- **Check output location** matches your build configuration
- **Validate Azure Static Web Apps** resource exists

#### 3. Security Scan Failures
- **SonarCloud**: Check organization and token permissions
- **Checkmarx**: Verify client credentials and tenant name
- **Review scan logs** in GitHub Actions

#### 4. Permission Errors
- **Check repository secrets** are properly set
- **Verify API token permissions** in Azure and SonarCloud
- **Ensure workflow has necessary permissions

### Getting Help

1. **Check workflow logs** in GitHub Actions
2. **Review troubleshooting documentation**:
** - `AZURE_DEPLOYMENT_TROUBLESHOOTING.md`
** - `CHECKMARX_TROUBLESHOOTING.md`
3. **Validate configuration** against examples
4. **Create issue** in shared workflow repository

## Monitoring and Maintenance

### Regular Tasks
- **Monitor deployment success** rates
- **Review security scan results
- **Update dependencies** regularly
- **Rotate API tokens** as needed

### Performance Monitoring
- **Check build times** and optimize if needed
- **Monitor deployment performance
- **Review security scan duration

### Updates
- **Pin shared workflow version** for stability: `@v1.0.0`
- **Test updates** in non-production environments first
- **Follow semantic versioning** for shared workflow updates

## Best Practices

### Security
- **Use repository secrets** for sensitive data
- **Rotate tokens** regularly
- **Monitor security scan results
- **Keep dependencies updated

### Performance
- **Use npm ci** instead of npm install
- **Enable build caching** where possible
- **Optimize bundle size
- **Monitor deployment times

### Maintenance
- **Pin dependency versions** for consistency
- **Use semantic versioning** for releases
- **Document environment-specific configurations
- **Regular testing** of all deployment environments

This integration guide ensures your frontend application is properly configured for the shared CI/CD workflow with comprehensive deployment and security scanning capabilities! 
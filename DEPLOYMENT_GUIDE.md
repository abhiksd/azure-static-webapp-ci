# Deployment Guide

## 📁 Files Created

This guide provides a comprehensive overview of all the files created for the production-grade GitHub Actions workflow system.

### 🔧 GitHub Actions Workflows

#### Main Workflows
- `.github/workflows/ci-cd.yml` - Main CI/CD pipeline with multi-environment deployment
- `.github/workflows/branch-protection.yml` - Branch protection enforcement and PR validation
- `.github/workflows/semantic-release.yml` - Automated semantic versioning and release management

#### Composite Actions
- `.github/actions/setup-node/action.yml` - Node.js setup with caching and dependency installation
- `.github/actions/security-scan/action.yml` - Security scanning with SonarCloud and Checkmarx
- `.github/actions/azure-keyvault/action.yml` - Azure Key Vault secrets retrieval
- `.github/actions/deploy-static-app/action.yml` - Azure Static Web Apps deployment

### 📋 Templates and Configuration

#### Repository Templates
- `.github/CODEOWNERS` - Code review assignments and ownership
- `.github/ISSUE_TEMPLATE/bug_report.md` - Bug report template
- `.github/ISSUE_TEMPLATE/feature_request.md` - Feature request template
- `.github/PULL_REQUEST_TEMPLATE/pull_request_template.md` - Pull request template

#### Environment Configuration
- `environments/development.json` - Development environment configuration
- `environments/staging.json` - Staging environment configuration
- `environments/pre-production.json` - Pre-production environment configuration
- `environments/production.json` - Production environment configuration
- `.env.example` - Environment variables template

#### Documentation
- `README.md` - Comprehensive documentation
- `DEPLOYMENT_GUIDE.md` - This deployment guide

## 🚀 Quick Setup

### 1. Repository Setup
```bash
# Clone or initialize your repository
git clone <your-repo-url>
cd <your-repo>

# Copy environment template
cp .env.example .env

# Install dependencies (if you have package.json)
npm install
```

### 2. GitHub Repository Configuration

#### Secrets Setup
Navigate to your GitHub repository → Settings → Secrets and add:

**Azure Configuration:**
```
AZURE_CREDENTIALS_DEV
AZURE_CREDENTIALS_STAGING
AZURE_CREDENTIALS_PROD
AZURE_KEYVAULT_NAME_DEV
AZURE_KEYVAULT_NAME_STAGING
AZURE_KEYVAULT_NAME_PROD
```

**Azure Static Web Apps:**
```
AZURE_STATIC_WEB_APPS_API_TOKEN_DEV
AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING
AZURE_STATIC_WEB_APPS_API_TOKEN_PROD
```

**Security Scanning:**
```
SONAR_TOKEN
CHECKMARX_USERNAME
CHECKMARX_PASSWORD
CHECKMARX_SERVER
```

**Notifications (Optional):**
```
SLACK_WEBHOOK_URL
TEAMS_WEBHOOK_URL
```

### 3. Azure Resources Setup

#### Create Azure Service Principals
```bash
# For each environment (dev, staging, prod)
az ad sp create-for-rbac --name "sp-myapp-dev" --role contributor --scopes /subscriptions/YOUR_SUBSCRIPTION_ID
```

#### Create Azure Key Vaults
```bash
# For each environment
az keyvault create --name "kv-myapp-dev" --resource-group "rg-myapp-dev" --location "East US"
```

#### Create Azure Static Web Apps
```bash
# For each environment
az staticwebapp create --name "swa-myapp-dev" --resource-group "rg-myapp-dev" --location "East US"
```

### 4. Branch Setup
```bash
# Create and push branches
git checkout -b develop
git push -u origin develop

git checkout main
git push -u origin main
```

### 5. Enable Branch Protection
The branch protection workflow will automatically configure protection rules, but you can also set them manually:

- Go to Settings → Branches
- Add rule for `main` branch
- Add rule for `develop` branch

## 🔄 Workflow Triggers

### Development Deployment
- **Trigger**: Push to `develop` branch
- **Version**: Short SHA (e.g., `a1b2c3d`)
- **Environment**: Development

### Staging Deployment
- **Trigger**: Push to `main` branch
- **Version**: Short SHA (e.g., `a1b2c3d`)
- **Environment**: Staging

### Pre-Production Deployment
- **Trigger**: Push to `release/**` branch
- **Version**: Release version (e.g., `1.2.3`)
- **Environment**: Pre-Production

### Production Deployment
- **Trigger**: Semantic release tag
- **Version**: Semantic version (e.g., `v1.2.3`)
- **Environment**: Production

## 🔐 Security Features

### Branch Protection
- **Main Branch**: Requires 2 approvals
- **Develop Branch**: Requires 1 approval
- **Required Checks**: All security scans must pass

### Security Scanning
- **SonarCloud**: Code quality and security analysis
- **Checkmarx**: SAST security vulnerability scanning
- **Dependency Scanning**: Automated dependency vulnerability checks

### Secrets Management
- **Azure Key Vault**: All application secrets stored securely
- **Environment Isolation**: Separate Key Vaults per environment
- **Automatic Rotation**: Support for secret rotation

## 📊 Monitoring and Notifications

### Deployment Tracking
- Automatic GitHub issues created for deployments
- Deployment status tracking
- Health check monitoring
- Performance metrics collection

### Notifications
- **Slack**: Deployment notifications
- **Microsoft Teams**: Deployment notifications
- **Email**: Failure notifications
- **GitHub**: Issue creation for tracking

## 🛠️ Customization

### Environment Variables
Update the environment configuration files:
- `environments/development.json`
- `environments/staging.json`
- `environments/pre-production.json`
- `environments/production.json`

### Security Scanning
Customize security scanning thresholds in:
- `.github/actions/security-scan/action.yml`

### Deployment Configuration
Modify deployment settings in:
- `.github/actions/deploy-static-app/action.yml`

## 🔍 Troubleshooting

### Common Issues
1. **Deployment Failures**: Check Azure Static Web Apps logs
2. **Security Scan Failures**: Review SonarCloud/Checkmarx results
3. **Permission Errors**: Verify Azure service principal permissions
4. **Secret Retrieval Errors**: Check Azure Key Vault access policies

### Debug Steps
1. Enable debug logging in workflows
2. Check Action outputs and artifacts
3. Review deployment summaries
4. Monitor health check results

## 📚 Additional Resources

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Semantic Release Documentation](https://semantic-release.gitbook.io/)

## ✅ Pre-Deployment Checklist

- [ ] All GitHub secrets configured
- [ ] Azure resources created
- [ ] Service principals configured
- [ ] Key Vaults set up with secrets
- [ ] Branch protection rules enabled
- [ ] SonarCloud project created
- [ ] Checkmarx project configured
- [ ] Team notifications configured
- [ ] CODEOWNERS file updated with your team
- [ ] Package.json scripts configured
- [ ] Environment configurations updated

## 🚀 Go Live

Once all prerequisites are met:

1. Push code to `develop` branch
2. Verify development deployment
3. Create PR from `develop` to `main`
4. Verify all checks pass
5. Merge PR to trigger staging deployment
6. Create `release/v1.0.0` branch for pre-production testing
7. Verify pre-production deployment
8. Merge release branch to `main` to trigger semantic release
9. Verify production deployment

Your production-grade CI/CD pipeline is now ready! 🎉
# Shared CI/CD Workflows for Frontend Applications

A centralized repository containing reusable GitHub Actions workflows and composite actions for frontend CI/CD pipelines with Azure Static Web Apps deployment and security scanning.

## 🏗️ Repository Structure

```
├── .github/
│   ├── workflows/
│   │   └── shared-ci-cd.yml              # Main reusable workflow
│   └── actions/                          # Composite actions
│       ├── sonar-analysis/               # SonarCloud scanning
│       ├── checkmarx-scan/               # Checkmarx security scanning
│       └── deploy-static-app/            # Azure Static Web Apps deployment
├── pr-security-check.yml                # Standalone PR security validation
├── frontend-app-workflow-example.yml    # Example frontend app workflow
├── setup-shared-repository.sh           # Automated migration script
└── docs/                                 # Documentation
```

## 🚀 Quick Start

### For Frontend Applications

Create `.github/workflows/ci-cd.yml` in your frontend app:

```yaml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop, staging]
  workflow_dispatch:

jobs:
  deploy:
    uses: YOUR_ORG/shared-ci-cd-workflows/.github/workflows/shared-ci-cd.yml@main
    with:
      node-version: '18'
      output-location: 'build'        # or 'dist' for Vite/Vue
      build-command: 'npm run build'
    secrets:
      AZURE_STATIC_WEB_APPS_API_TOKEN_DEV: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_DEV }}
      AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING }}
      AZURE_STATIC_WEB_APPS_API_TOKEN_PROD: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_PROD }}
      SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
      CHECKMARX_CLIENT_ID: ${{ secrets.CHECKMARX_CLIENT_ID }}
      CHECKMARX_SECRET: ${{ secrets.CHECKMARX_SECRET }}
      CHECKMARX_TENANT: ${{ secrets.CHECKMARX_TENANT }}
```

### For PR Security Checks

Copy `pr-security-check.yml` to your frontend app at `.github/workflows/pr-security-check.yml`.

## ⚙️ Configuration

### Shared Repository Variables

Set these variables in this shared repository for organization-wide defaults:

#### Security Scanning Controls:
```
ENABLE_SONAR_SCAN = "true"
ENABLE_CHECKMARX_SCAN = "true"
```

#### Quality Gate Thresholds:
```
MIN_CODE_COVERAGE = "80"
MAX_CRITICAL_VULNERABILITIES = "0"
MAX_HIGH_VULNERABILITIES = "2"
```

#### SonarCloud Configuration:
```
SONAR_HOST_URL = "https://sonarcloud.io"
SONAR_SKIP_SSL_VERIFICATION = "false"
```

#### Checkmarx Configuration:
```
CHECKMARX_SCAN_TYPES = "sast,sca"
CHECKMARX_PRESET = "Checkmarx Default"
```

### Frontend Application Secrets

Set these secrets in each frontend application repository:

#### Required Azure Secrets:
- `AZURE_STATIC_WEB_APPS_API_TOKEN_DEV`
- `AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING`
- `AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD`
- `AZURE_STATIC_WEB_APPS_API_TOKEN_PROD`

#### Required Security Scanning Secrets:
- `SONAR_TOKEN`
- `CHECKMARX_CLIENT_ID`
- `CHECKMARX_SECRET`
- `CHECKMARX_TENANT`

#### Optional Variables in Frontend Apps:
- `SONAR_ORGANIZATION`

## 🔧 Features

### ✅ **Centralized CI/CD Pipeline**
- Build, test, and deploy frontend applications
- Multi-environment deployment (dev, staging, pre-prod, prod)
- Automatic version generation and deployment strategy

### ✅ **Security Scanning**
- **SonarCloud Analysis** - Code quality and coverage analysis
- **Checkmarx AST** - Security vulnerability scanning
- Configurable quality gates and thresholds

### ✅ **Azure Static Web Apps Integration**
- Automated deployment to Azure Static Web Apps
- Docker permission fixes for reliable deployments
- Health checks and deployment validation

### ✅ **Flexible Configuration**
- Centralized defaults with override capability
- Framework-agnostic (React, Vue, Angular, Next.js)
- Environment-specific configurations

## 📋 Migration

### Automated Migration

Use the provided migration script:

```bash
./setup-shared-repository.sh
```

### Manual Setup

1. **Copy workflows and actions** from this repository
2. **Set up repository variables** for organization defaults
3. **Update frontend applications** to use shared workflow
4. **Configure secrets** in each frontend repository

## 📚 Documentation

- [`SHARED_WORKFLOW_MIGRATION_GUIDE.md`](SHARED_WORKFLOW_MIGRATION_GUIDE.md) - Complete migration guide
- [`AZURE_DEPLOYMENT_TROUBLESHOOTING.md`](AZURE_DEPLOYMENT_TROUBLESHOOTING.md) - Azure deployment issues
- [`CHECKMARX_TROUBLESHOOTING.md`](CHECKMARX_TROUBLESHOOTING.md) - Checkmarx authentication help
- [`SHARED_WORKFLOW_CENTRALIZATION_UPDATE.md`](SHARED_WORKFLOW_CENTRALIZATION_UPDATE.md) - Architecture details

## 🎯 Benefits

### **Centralized Maintenance**
- Update CI/CD logic once, applies to all frontend apps
- Consistent deployment patterns across projects
- Easier security updates and compliance

### **Simplified Frontend Apps**
- Minimal workflow configuration required
- Focus on application code, not CI/CD complexity
- Standardized quality gates and security scanning

### **Better Governance**
- Organization-wide security standards
- Centralized control over quality thresholds
- Audit trail for configuration changes

## 🔍 Troubleshooting

### Common Issues

1. **Workflow not found**: Ensure repository path is correct
2. **Secrets not available**: Verify secrets are set in frontend repository
3. **Permission denied**: Check Azure deployment token permissions
4. **Security scan failures**: Review troubleshooting documentation

### Getting Help

1. Check the troubleshooting documentation
2. Review workflow logs in GitHub Actions
3. Validate repository secrets and variables
4. Create an issue in this repository

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Maintained by:** DevOps Team  
**Last Updated:** 2024

For questions or support, please create an issue in this repository.
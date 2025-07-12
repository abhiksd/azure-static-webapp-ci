# Production-Grade GitHub Actions Workflow for Azure Static Web Apps

This repository contains a comprehensive, production-ready GitHub Actions workflow system for deploying Node.js frontend applications to Azure Static Web Apps with multi-environment support, automated security scanning, and semantic versioning.

## 🚀 Features

- **Multi-Environment Deployment**: Development, Staging, and Production environments
- **Semantic Versioning**: Automated version management with semantic-release
- **Security Scanning**: Integrated SonarCloud and Checkmarx scanning
- **Branch Protection**: Automated PR validation and branch protection rules
- **Azure Key Vault Integration**: Secure secrets management
- **Composite Actions**: Reusable, modular GitHub Actions components
- **Comprehensive Testing**: Unit, integration, and E2E testing support
- **Automated Notifications**: Slack and Teams integration
- **Quality Gates**: Mandatory security and quality checks

## 📋 Requirements

### Prerequisites
- Node.js 18+ application
- Azure subscription with Static Web Apps service
- Azure Key Vault for secrets management
- SonarCloud account for code quality analysis
- Checkmarx account for security scanning

### Repository Secrets

Configure the following secrets in your GitHub repository:

#### Azure Configuration
```
AZURE_CREDENTIALS_DEV          # Service principal for development
AZURE_CREDENTIALS_STAGING      # Service principal for staging
AZURE_CREDENTIALS_PROD         # Service principal for production
AZURE_KEYVAULT_NAME_DEV       # Development Key Vault name
AZURE_KEYVAULT_NAME_STAGING   # Staging Key Vault name
AZURE_KEYVAULT_NAME_PROD      # Production Key Vault name
```

#### Azure Static Web Apps
```
AZURE_STATIC_WEB_APPS_API_TOKEN_DEV      # Development deployment token
AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING  # Staging deployment token
AZURE_STATIC_WEB_APPS_API_TOKEN_PROD     # Production deployment token
```

#### Security Scanning
```
SONAR_TOKEN                   # SonarCloud authentication token
CHECKMARX_USERNAME           # Checkmarx username
CHECKMARX_PASSWORD           # Checkmarx password
CHECKMARX_SERVER             # Checkmarx server URL
```

#### Notifications (Optional)
```
SLACK_WEBHOOK_URL            # Slack webhook for notifications
TEAMS_WEBHOOK_URL            # Microsoft Teams webhook
```

## 🏗️ Architecture

### Workflow Structure
```
.github/
├── workflows/
│   ├── ci-cd.yml              # Main CI/CD pipeline
│   ├── branch-protection.yml  # Branch protection enforcement
│   └── semantic-release.yml   # Automated versioning
├── actions/
│   ├── setup-node/           # Node.js setup with caching
│   ├── security-scan/        # Security scanning composite action
│   ├── azure-keyvault/       # Azure Key Vault integration
│   └── deploy-static-app/    # Azure Static Web Apps deployment
├── ISSUE_TEMPLATE/           # Issue templates
├── PULL_REQUEST_TEMPLATE/    # PR templates
└── CODEOWNERS               # Code review assignments
```

### Environment Strategy

| Environment | Branch | Trigger | Version Format | URL |
|-------------|---------|---------|----------------|-----|
| Development | `develop` | Push to develop | Short SHA | `https://dev-app.azurestaticapps.net` |
| Staging | `main` | Push to main | Short SHA | `https://staging-app.azurestaticapps.net` |
| Production | `main` | Semantic release tag | Semantic version | `https://prod-app.azurestaticapps.net` |

## 🔄 CI/CD Pipeline

### Pull Request Validation
When a PR is opened against `main` or `develop`:
1. **Code Quality**: Linting and formatting checks
2. **Testing**: Unit and integration tests
3. **Security Scanning**: SonarCloud and Checkmarx scans
4. **Regression Testing**: E2E tests
5. **Branch Protection**: Enforce protection rules

### Development Deployment
On push to `develop` branch:
1. **Build**: Compile application for development
2. **Secrets**: Retrieve from Azure Key Vault
3. **Deploy**: Deploy to development environment
4. **Verify**: Health check and smoke tests

### Staging Deployment
On push to `main` branch:
1. **Build**: Compile application for staging
2. **Testing**: Full test suite including E2E
3. **Secrets**: Retrieve from Azure Key Vault
4. **Deploy**: Deploy to staging environment
5. **Verify**: Health check and integration tests

### Production Deployment
On semantic release tag:
1. **Build**: Compile application for production
2. **Testing**: Complete test suite including performance
3. **Security**: Full security scan
4. **Secrets**: Retrieve from Azure Key Vault
5. **Deploy**: Deploy to production environment
6. **Verify**: Health check and monitoring setup
7. **Notify**: Send deployment notifications

## 🔧 Configuration

### Environment Configuration
Each environment has its own configuration file in the `environments/` directory:

- `environments/development.json`
- `environments/staging.json`
- `environments/production.json`

### Application Configuration
Copy `.env.example` to `.env` and configure your environment variables:

```bash
cp .env.example .env
```

### Package.json Scripts
Ensure your `package.json` includes the following scripts:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "build:prod": "NODE_ENV=production npm run build",
    "test": "react-scripts test",
    "test:coverage": "npm test -- --coverage --watchAll=false",
    "test:e2e": "cypress run",
    "test:performance": "lighthouse-ci",
    "lint": "eslint src/**/*.{js,jsx,ts,tsx}",
    "lint:fix": "eslint src/**/*.{js,jsx,ts,tsx} --fix"
  }
}
```

## 🔐 Security

### Branch Protection Rules
- **Main Branch**: Requires 2 approvals, no direct pushes
- **Develop Branch**: Requires 1 approval, allows merge after checks
- **Required Checks**: All security scans and tests must pass

### Security Scanning
- **SonarCloud**: Code quality and security analysis
- **Checkmarx**: SAST security scanning
- **Dependency Check**: Automated dependency vulnerability scanning

### Secrets Management
- All secrets stored in Azure Key Vault
- Environment-specific Key Vaults
- Automatic secret rotation support
- Secrets masked in logs

## 📊 Monitoring and Notifications

### Deployment Tracking
- Automatic deployment issues created
- Deployment status tracking
- Health check monitoring
- Performance metrics collection

### Notifications
- Slack notifications for deployments
- Microsoft Teams integration
- Email notifications for failures
- GitHub issue creation for tracking

## 🛠️ Development Workflow

### Feature Development
1. Create feature branch from `develop`
2. Implement feature with tests
3. Create PR against `develop`
4. Pass all quality gates
5. Merge after approval

### Release Process
1. Merge `develop` into `main`
2. Semantic release creates version tag
3. Automatic production deployment
4. Post-deployment verification

### Hotfix Process
1. Create hotfix branch from `main`
2. Implement fix with tests
3. Create PR against `main`
4. Emergency deployment process

## 🔍 Troubleshooting

### Common Issues

#### Deployment Failures
- Check Azure Static Web Apps logs
- Verify Key Vault permissions
- Ensure all secrets are configured
- Check build output directory

#### Security Scan Failures
- Review SonarCloud quality gate
- Check Checkmarx scan results
- Update vulnerable dependencies
- Fix code quality issues

#### Test Failures
- Run tests locally first
- Check test environment setup
- Verify mock data and fixtures
- Review test coverage requirements

### Debugging
- Enable debug logging in workflows
- Check Action outputs and artifacts
- Review deployment summaries
- Monitor health check results

## 📚 Documentation

### Additional Resources
- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Semantic Release Documentation](https://semantic-release.gitbook.io/)

### Team Guidelines
- Follow conventional commit format
- Include comprehensive PR descriptions
- Add appropriate labels to issues
- Update documentation with changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests and documentation
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact the DevOps team
- Check the troubleshooting guide
- Review the FAQ section

---

**Note**: This workflow system is designed for production use and includes comprehensive security, quality, and monitoring features. Ensure all prerequisites are met before deployment.
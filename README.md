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
# Note: Using Azure Managed Identity - no service principal credentials needed
# Key Vault names are stored as repository variables (not secrets)
# These can be found in Repository Settings > Secrets and variables > Actions > Variables
```

#### 🎛️ Configurable Security & Quality Parameters

The following repository variables control security scanning and quality gates:

**Scan Control:**
```
ENABLE_SONAR_SCAN=true          # Enable/disable SonarCloud analysis
ENABLE_CHECKMARX_SCAN=true      # Enable/disable Checkmarx security scanning
ENABLE_DEPENDENCY_SCAN=true     # Enable/disable dependency vulnerability scanning
ENABLE_LICENSE_SCAN=false       # Enable/disable license compliance checking
SECURITY_GATE_ENABLED=true      # Enable/disable overall security gate
```

**Checkmarx Configuration:**
```
CHECKMARX_SCAN_TYPES=sca,sast,kics    # Scan types (comma-separated)
CHECKMARX_PRESET=Checkmarx Default    # Security scan preset
CHECKMARX_INCREMENTAL=true            # Use incremental scanning
MAX_CRITICAL_VULNERABILITIES=0        # Maximum critical vulnerabilities
MAX_HIGH_VULNERABILITIES=2            # Maximum high vulnerabilities  
MAX_MEDIUM_VULNERABILITIES=10         # Maximum medium vulnerabilities
```

**SonarCloud Configuration:**
```
MIN_CODE_COVERAGE=80                  # Minimum code coverage (%)
MIN_BRANCH_COVERAGE=70                # Minimum branch coverage (%)
SONAR_MAINTAINABILITY_RATING=A        # Target maintainability rating
SONAR_RELIABILITY_RATING=A            # Target reliability rating
SONAR_SECURITY_RATING=A               # Target security rating
MAX_BLOCKER_ISSUES=0                  # Maximum blocker issues
MAX_CRITICAL_ISSUES=0                 # Maximum critical issues
MAX_MAJOR_ISSUES=5                    # Maximum major issues
```

> 📖 **Complete Configuration Guide**: See [Configurable Thresholds](docs/12-CONFIGURABLE-THRESHOLDS.md) for detailed configuration options and examples.

#### Azure Static Web Apps
```
AZURE_STATIC_WEB_APPS_API_TOKEN_DEV      # Development deployment token
AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING  # Staging deployment token
AZURE_STATIC_WEB_APPS_API_TOKEN_PROD     # Production deployment token
```

#### Security Scanning
```
SONAR_TOKEN                   # SonarCloud authentication token
CHECKMARX_CLIENT             # Checkmarx client ID
CHECKMARX_SECRET             # Checkmarx client secret
CHECKMARX_SERVER             # Checkmarx server URL
```

#### Notifications (Optional)
```
SLACK_WEBHOOK_URL            # Slack webhook for notifications
TEAMS_WEBHOOK_URL            # Microsoft Teams webhook
```

## 🚀 Deployment Strategies

Choose the deployment approach that fits your team's needs:

### 🏭 Enterprise-Grade (Maximum Features)
For large teams requiring comprehensive security and compliance controls.

### 🎯 Intermediate (Recommended)
Production-grade features with manageable complexity - **best of both worlds**.

**Intermediate Deployment Features:**
- ✅ **All deployment features you requested** (dev/staging short SHA, pre-prod/prod semantic tags)
- ✅ **Production-grade security** (configurable thresholds, risk assessment, quality gates)
- ✅ **Manageable complexity** (single workflow file, clear logic, easy to understand)
- ✅ **Comprehensive controls** (manual overrides, approval workflows, emergency deployments)
- ✅ **Risk-based strategies** (automatic risk assessment, approval requirements)
- ✅ **Enterprise features** (without overwhelming complexity)

**Perfect for:** Most teams wanting production-grade CI/CD without enterprise complexity.

> 📖 **Intermediate Guide**: See [Intermediate Deployment Guide](docs/INTERMEDIATE-DEPLOYMENT-GUIDE.md) for complete setup.

### 🚀 Simplified (Easy to Maintain)  
For smaller teams wanting essential features without complexity.

**Simple Deployment Features:**
- ✅ **Easy to understand** deployment logic (3 environments, simple rules)
- ✅ **Minimal configuration** required (just Azure Static Web Apps tokens)
- ✅ **Essential features only** (build, test, deploy, version tracking)
- ✅ **Optional security scanning** (SonarCloud, Checkmarx - easily disabled)
- ✅ **Standard workflows** (branch → dev/staging, tags → production)
- ✅ **Quick setup** (works with any React/Node.js/static site project)

**Perfect for:** Small teams, personal projects, startups, or teams that want CI/CD without complexity.

> 📖 **Simple Guide**: See [Simple Deployment Guide](docs/SIMPLE-DEPLOYMENT-GUIDE.md) for easy setup instructions.

---

## 🏭 Enterprise-Grade Deployment Strategy

Our enterprise-level deployment pipeline implements comprehensive security controls and risk management:

### Environment Promotion Flow
```
🔧 Development → 🧪 Staging → 🎯 Pre-Production → 🏭 Production
     ↓              ↓              ↓              ↓
 Short SHA      Short SHA     Semantic Ver   Semantic Ver
 Basic Tests    Integration   Full Testing   Enterprise
 Fast Feedback  User Testing  Security       Validation
```

### Deployment Triggers & Versioning

| Environment | Trigger | Version Format | Security Level | Approval |
|-------------|---------|----------------|----------------|----------|
| **Development** | Branches (feature/*, develop) | `dev-{sha}-{timestamp}` | Basic | None |
| **Staging** | Branches (main, staging) | `staging-{sha}-{timestamp}` | Standard | Optional |
| **Pre-Production** | Tags (v1.2.3-rc.1) | `v1.2.3-rc.1` | Enhanced | Required for RC |
| **Production** | Tags (v1.2.3) | `v1.2.3` | Maximum | Mandatory |

### Production-Grade Controls

- ✅ **GPG-signed tag verification** for production releases
- ✅ **Deployment time windows** (business hours enforcement)
- ✅ **Risk-based approval workflows** (major/minor/patch releases)
- ✅ **Comprehensive security scanning** (SAST, SCA, KICS)
- ✅ **Documentation requirements** (CHANGELOG.md validation)
- ✅ **Emergency deployment overrides** for critical fixes
- ✅ **Automated rollback capabilities** with health checks

> 📖 **Enterprise Guide**: See [Production-Grade Deployment](docs/14-PRODUCTION-GRADE-DEPLOYMENT.md) for complete implementation details.

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
| Pre-Production | `release/**` | Push to release branch | Release version | `https://preprod-app.azurestaticapps.net` |
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

### Pre-Production Deployment
On push to `release/**` branch:
1. **Build**: Compile application for pre-production
2. **Testing**: Complete test suite including performance
3. **Security**: Full security scan
4. **Secrets**: Retrieve from Azure Key Vault
5. **Deploy**: Deploy to pre-production environment
6. **Verify**: Health check and integration tests

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
- `environments/pre-production.json`
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
1. Create `release/vX.Y.Z` branch from `develop`
2. Deploy to pre-production for testing
3. Merge release branch into `main`
4. Semantic release creates version tag
5. Automatic production deployment
6. Post-deployment verification

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
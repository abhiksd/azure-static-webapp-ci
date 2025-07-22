# 🎛️ Shared Workflow Variables Configuration

This document outlines all the centralized variables that control the behavior of the shared CI/CD workflow. These variables are configured at the shared repository level, providing consistent configuration across all frontend applications.

## 🏗️ Build Configuration Variables

Configure these variables in your shared CI/CD repository under **Settings > Secrets and variables > Actions > Variables**:

### Core Build Settings

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `NODE_VERSION` | `18` | Node.js version for all build and deployment jobs |
| `APP_LOCATION` | `/` | Source code location relative to repository root |
| `OUTPUT_LOCATION` | `build` | Built application output directory (e.g., `dist` for Vite/Vue, `build` for React) |
| `BUILD_COMMAND` | `npm run build` | Command to build the application |
| `INSTALL_COMMAND` | `npm ci` | Command to install dependencies |

### Example Build Configurations

**React Applications:**
```bash
NODE_VERSION=18
APP_LOCATION=/
OUTPUT_LOCATION=build
BUILD_COMMAND=npm run build
INSTALL_COMMAND=npm ci
```

**Vue/Vite Applications:**
```bash
NODE_VERSION=18
APP_LOCATION=/
OUTPUT_LOCATION=dist
BUILD_COMMAND=npm run build
INSTALL_COMMAND=npm ci
```

**Angular Applications:**
```bash
NODE_VERSION=18
APP_LOCATION=/
OUTPUT_LOCATION=dist/my-app
BUILD_COMMAND=npm run build:prod
INSTALL_COMMAND=npm ci
```

## 🔒 Security Scanning Configuration

### Security Scan Controls

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `ENABLE_SONAR_SCAN` | `true` | Enable/disable SonarCloud analysis |
| `ENABLE_CHECKMARX_SCAN` | `true` | Enable/disable Checkmarx security scanning |

### SonarCloud Configuration

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `SONAR_HOST_URL` | `https://sonarcloud.io` | SonarCloud/SonarQube server URL |
| `SONAR_SKIP_SSL_VERIFICATION` | `false` | Skip SSL verification for self-signed certificates |
| `SONAR_ORGANIZATION` | *(required)* | Your SonarCloud organization key |

### Quality Gate Thresholds

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `MIN_CODE_COVERAGE` | `75` | Minimum code coverage percentage required |
| `MAX_BLOCKER_ISSUES` | `0` | Maximum blocker issues allowed |
| `MAX_CRITICAL_ISSUES` | `0` | Maximum critical issues allowed |

### Checkmarx Configuration

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `CHECKMARX_SCAN_TYPES` | `sast,sca` | Types of scans to perform (sast, sca, kics) |
| `CHECKMARX_PRESET` | `Checkmarx Default` | Scan preset to use |
| `MAX_CRITICAL_VULNERABILITIES` | `0` | Maximum critical vulnerabilities allowed |
| `MAX_HIGH_VULNERABILITIES` | `5` | Maximum high vulnerabilities allowed |

## 🚀 Deployment Configuration

### Deployment Controls

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `SKIP_DEPLOYMENT` | `false` | Skip all deployment steps |
| `FORCE_VERSION` | *(empty)* | Override version for all deployments |

## 📋 Variable Configuration Steps

### 1. Configure Variables in Shared Repository

1. Go to your shared CI/CD repository
2. Navigate to **Settings > Secrets and variables > Actions**
3. Click on the **Variables** tab
4. Add each variable with its desired value

### 2. Organizational Standards

Set these variables to enforce organizational standards across all frontend applications:

```bash
# Standardize Node.js version
NODE_VERSION=18

# Enforce security scanning
ENABLE_SONAR_SCAN=true
ENABLE_CHECKMARX_SCAN=true

# Set quality standards
MIN_CODE_COVERAGE=80
MAX_CRITICAL_VULNERABILITIES=0
MAX_HIGH_VULNERABILITIES=3

# Configure SonarCloud
SONAR_ORGANIZATION=your-org-key
SONAR_HOST_URL=https://sonarcloud.io
```

### 3. Application-Specific Overrides

For different application types, create separate shared repositories or use environment-specific configurations:

**For Multiple Framework Support:**
- Create separate shared workflow repositories for React, Vue, Angular
- Each repository can have framework-specific defaults
- Teams choose the appropriate shared workflow repository

**For Environment-Specific Configuration:**
- Use different variable values for development vs. production environments
- Consider using GitHub Environments for environment-specific variables

## 🔄 Updating Configuration

### Impact of Changes

When you update variables in the shared repository:
- ✅ **Immediate effect** on new workflow runs
- ✅ **Applies to all** frontend applications using the shared workflow
- ✅ **No changes needed** in individual frontend repositories
- ⚠️ **Test thoroughly** before updating production variables

### Best Practices

1. **Version Control**: Document variable changes in your shared repository
2. **Testing**: Test variable changes in a development environment first
3. **Communication**: Notify teams when changing variables that affect quality gates
4. **Monitoring**: Monitor deployments after variable changes
5. **Rollback**: Keep track of previous values for quick rollback if needed

## 🎯 Benefits of Centralized Configuration

### ✅ Consistency
- All applications use the same Node.js version
- Consistent quality standards across projects
- Uniform security scanning configuration

### ✅ Efficiency
- No need to update multiple repositories for configuration changes
- Single point of control for organizational standards
- Simplified onboarding for new projects

### ✅ Governance
- Centralized control over security and quality requirements
- Easy to enforce organizational policies
- Audit trail for configuration changes

### ✅ Maintenance
- Reduce configuration drift between projects
- Easy to update all applications simultaneously
- Simplified troubleshooting and support

## 🚨 Important Notes

1. **Required Secrets**: Repository secrets (tokens, credentials) must still be configured in each frontend repository
2. **Environment Override**: The `environment` parameter remains as an input for runtime selection
3. **Backup Strategy**: Document current variable values before making changes
4. **Testing Protocol**: Always test configuration changes in a non-production environment first

---

## 📞 Support

For questions about variable configuration:
1. Check this documentation first
2. Review the [SHARED_WORKFLOW_MIGRATION_GUIDE.md](./SHARED_WORKFLOW_MIGRATION_GUIDE.md)
3. Consult your DevOps team for organization-specific configurations
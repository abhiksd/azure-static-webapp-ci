# Shared Workflow Variables Configuration

This document outlines the **optional organizational variables** that can be configured to customize the shared CI/CD workflow behavior. Most settings use standardized defaults and **do not require repository variables**.

## Standardized Configuration (No Variables Needed)

The following are **hardcoded in workflows** with enterprise-standard defaults:

### Build Configuration (Standardized)
- **Node.js Version**: `18` (industry standard LTS)
- **App Location**: `/` (repository root)
- **Output Location**: `build` (React/Next.js standard)
- **Build Command**: `npm run build` (industry standard)
- **Install Command**: `npm ci` (enterprise standard for CI)

### Security Configuration (Standardized)
- **SonarCloud Scanning**: Always enabled (`true`)
- **Checkmarx Scanning**: Always enabled (`true`)
- **SSL Verification**: Always enabled (`false` for skip)
- **Blocker Issues**: Zero tolerance (`0`)
- **Critical Issues**: Zero tolerance (`0`)
- **Checkmarx Scan Types**: `sast,sca` (recommended security coverage)
- **Checkmarx Preset**: `Checkmarx Default` (standard preset)

## Required Repository Variables

Only 2 variables need to be configured:

### Essential Configuration

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `SONAR_ORGANIZATION` | *Required* | Your SonarCloud organization ID |
| `SONAR_HOST_URL` | `https://sonarcloud.io` | SonarCloud/SonarQube server URL (optional: only for on-premise) |

### Quality Thresholds (Enterprise Standards - Not Configurable)

These are now **hardcoded** as enterprise security standards:
- **Code Coverage**: `75%` (CI/CD) / `80%` (PR) - Industry benchmarks
- **Critical Vulnerabilities**: `0` - Zero tolerance security policy  
- **High Vulnerabilities**: `5` (CI/CD) / `2` (PR) - Risk-based limits

## Setup Instructions

Set these in the shared CI/CD repository under **Settings > Secrets and variables > Actions > Variables**:

### Standard Setup (SonarCloud.io)

```bash
# Required: Your SonarCloud organization
SONAR_ORGANIZATION=your-sonarcloud-org
```

### On-Premise Setup (SonarQube)

```bash
# Required: Your SonarCloud organization  
SONAR_ORGANIZATION=your-sonarcloud-org

# Required: Your on-premise SonarQube server
SONAR_HOST_URL=https://sonar.company.com
```

## Benefits of Simplified Configuration

### Reduced Complexity
- **No build variables needed** - standardized across industry
- **No security control variables** - always enabled for compliance
- **Fewer repository settings** - only customize what's truly organizational

### Enterprise Standards
- **Consistent Node.js version** across all applications
- **Standardized build processes** reduce support burden
- **Mandatory security scanning** ensures compliance
- **Zero tolerance for critical issues** maintains security posture

### Easy Adoption
- **Copy workflows and go** - minimal configuration required
- **Industry-standard defaults** work for most organizations
- **Override only when necessary** for specific organizational requirements

## Migration from Complex Configuration

If you previously configured many variables, you can safely remove these **standardized variables**:

```bash
# These can be REMOVED from repository variables:
NODE_VERSION=18                     # Now hardcoded
APP_LOCATION=/                      # Now hardcoded
OUTPUT_LOCATION=build               # Now hardcoded
BUILD_COMMAND=npm run build         # Now hardcoded
INSTALL_COMMAND=npm ci              # Now hardcoded
ENABLE_SONAR_SCAN=true             # Now hardcoded
ENABLE_CHECKMARX_SCAN=true         # Now hardcoded
SONAR_SKIP_SSL_VERIFICATION=false  # Now hardcoded
MIN_CODE_COVERAGE=75               # Now hardcoded (75 CI/CD, 80 PR)
MAX_CRITICAL_VULNERABILITIES=0     # Now hardcoded
MAX_HIGH_VULNERABILITIES=5         # Now hardcoded (5 CI/CD, 2 PR)
MAX_BLOCKER_ISSUES=0               # Now hardcoded
MAX_CRITICAL_ISSUES=0              # Now hardcoded
CHECKMARX_SCAN_TYPES=sast,sca      # Now hardcoded
CHECKMARX_PRESET=Checkmarx Default # Now hardcoded
SKIP_DEPLOYMENT=false              # Now hardcoded
FORCE_VERSION=                     # Now hardcoded
```

**Keep only these essential variables:**
```bash
# Required for all organizations:
SONAR_ORGANIZATION=your-org        # Your SonarCloud organization

# Optional for on-premise only:
SONAR_HOST_URL=https://sonar.com   # Only if using on-premise SonarQube
```
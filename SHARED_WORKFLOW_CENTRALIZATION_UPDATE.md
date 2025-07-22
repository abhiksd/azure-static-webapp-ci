# Shared Workflow Centralization Update

## Overview

This update centralizes control variables in the shared workflow repository and splits security scanning into separate jobs for better modularity and control.

## Key Changes Made

### 1. **Centralized Variables in Shared Workflow**

Variables are now controlled primarily in the shared repository with optional caller overrides:

#### **Security Scanning Controls (Centralized)**
```yaml
env:
  # Centralized with caller override capability
  ENABLE_SONAR: ${{ inputs.enable-sonar || vars.ENABLE_SONAR_SCAN || 'true' }}
  ENABLE_CHECKMARX: ${{ inputs.enable-checkmarx || vars.ENABLE_CHECKMARX_SCAN || 'true' }}
```

#### **SonarCloud Configuration (Centralized)**
```yaml
  # SonarQube/SonarCloud configuration (centralized)
  SONAR_HOST_URL: ${{ vars.SONAR_HOST_URL || 'https://sonarcloud.io' }}
  SONAR_SKIP_SSL_VERIFICATION: ${{ vars.SONAR_SKIP_SSL_VERIFICATION || 'false' }}
```

#### **Quality Gate Thresholds (Centralized with Override)**
```yaml
  # Quality gate thresholds (centralized with caller override capability)
  MIN_CODE_COVERAGE: ${{ inputs.min-code-coverage || vars.MIN_CODE_COVERAGE || '80' }}
  MAX_CRITICAL_VULNERABILITIES: ${{ inputs.max-critical-vulnerabilities || vars.MAX_CRITICAL_VULNERABILITIES || '0' }}
  MAX_HIGH_VULNERABILITIES: ${{ inputs.max-high-vulnerabilities || vars.MAX_HIGH_VULNERABILITIES || '2' }}
  MAX_BLOCKER_ISSUES: ${{ vars.MAX_BLOCKER_ISSUES || '0' }}
  MAX_CRITICAL_ISSUES: ${{ vars.MAX_CRITICAL_ISSUES || '0' }}
```

#### **Checkmarx Configuration (Centralized)**
```yaml
  # Checkmarx configuration (centralized)
  CHECKMARX_SCAN_TYPES: ${{ vars.CHECKMARX_SCAN_TYPES || 'sast,sca' }}
  CHECKMARX_PRESET: ${{ vars.CHECKMARX_PRESET || 'Checkmarx Default' }}
```

### 2. **Separate Security Jobs**

Split the combined `security-scan` job into two dedicated jobs:

#### **SonarCloud Analysis Job**
```yaml
sonar-analysis:
  runs-on: ubuntu-latest
  needs: [build-and-test]
  if: always() && (vars.ENABLE_SONAR_SCAN != 'false' && inputs.enable-sonar != false)
  outputs:
    status: ${{ steps.sonar-scan.outputs.status }}
    coverage: ${{ steps.sonar-scan.outputs.coverage }}
```

#### **Checkmarx Security Scan Job**
```yaml
checkmarx-scan:
  runs-on: ubuntu-latest
  needs: [build-and-test]
  if: always() && (vars.ENABLE_CHECKMARX_SCAN != 'false' && inputs.enable-checkmarx != false)
  outputs:
    status: ${{ steps.checkmarx-security.outputs.status }}
    critical-count: ${{ steps.checkmarx-security.outputs.critical-count }}
    high-count: ${{ steps.checkmarx-security.outputs.high-count }}
```

### 3. **Enhanced Workflow Outputs**

Added more detailed outputs for better visibility:

```yaml
outputs:
  # Quality metrics (enhanced)
  sonar-status: ${{ jobs.sonar-analysis.outputs.status }}
  sonar-coverage: ${{ jobs.sonar-analysis.outputs.coverage }}
  checkmarx-status: ${{ jobs.checkmarx-scan.outputs.status }}
  checkmarx-critical: ${{ jobs.checkmarx-scan.outputs.critical-count }}
  checkmarx-high: ${{ jobs.checkmarx-scan.outputs.high-count }}
```

### 4. **Updated Deployment Dependencies**

All deployment jobs now depend on both security jobs:

```yaml
needs: [detect-deployment, build-and-test, sonar-analysis, checkmarx-scan]
```

### 5. **Enhanced Deployment Summary**

Added security scan results to the deployment summary:

```yaml
echo "## Security Scan Results" >> $GITHUB_STEP_SUMMARY
echo "✅ **SonarCloud**: PASSED (Coverage: 85%)" >> $GITHUB_STEP_SUMMARY
echo "✅ **Checkmarx**: PASSED (Critical: 0, High: 2)" >> $GITHUB_STEP_SUMMARY
```

## Configuration in Shared Repository

### **Repository Variables** (Set in shared repository)

#### **Security Scanning Controls:**
```
ENABLE_SONAR_SCAN = "true"
ENABLE_CHECKMARX_SCAN = "true"
```

#### **SonarCloud Configuration:**
```
SONAR_HOST_URL = "https://sonarcloud.io"
SONAR_SKIP_SSL_VERIFICATION = "false"
```

#### **Quality Gate Thresholds:**
```
MIN_CODE_COVERAGE = "80"
MAX_CRITICAL_VULNERABILITIES = "0"
MAX_HIGH_VULNERABILITIES = "2"
MAX_BLOCKER_ISSUES = "0"
MAX_CRITICAL_ISSUES = "0"
```

#### **Checkmarx Configuration:**
```
CHECKMARX_SCAN_TYPES = "sast,sca"
CHECKMARX_PRESET = "Checkmarx Default"
```

## Simplified Frontend Application Workflow

Frontend applications now need minimal configuration:

```yaml
jobs:
  call-shared-workflow:
    uses: your-org/shared-ci-cd-workflows/.github/workflows/shared-ci-cd.yml@main
    with:
      # Build configuration (required)
      node-version: '18'
      output-location: 'build'
      build-command: 'npm run build'
      install-command: 'npm ci'
      
      # Optional overrides (only if different from shared defaults)
      min-code-coverage: '75'          # override only if needed
      max-high-vulnerabilities: '5'    # override only if needed
      
    secrets:
      # Only secrets need to be passed
      AZURE_STATIC_WEB_APPS_API_TOKEN_DEV: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_DEV }}
      # ... other secrets
```

## Benefits of Centralization

### ✅ **Centralized Control**
- All quality gates and security configurations managed in shared repository
- Consistent standards across all frontend applications
- Easy to update thresholds organization-wide

### ✅ **Simplified Frontend Apps**
- Minimal configuration required in each frontend app
- Only secrets and build-specific settings needed
- Override capability for special cases

### ✅ **Better Modularity**
- Separate jobs for SonarCloud and Checkmarx
- Independent failure/success for each security tool
- Better parallel execution and visibility

### ✅ **Enhanced Visibility**
- Detailed outputs for coverage and vulnerability counts
- Better deployment summaries with security results
- Clear job separation in GitHub Actions UI

### ✅ **Flexible Override System**
Priority order for configuration:
1. **Caller input** (highest priority - for special cases)
2. **Shared repository variables** (organization defaults)
3. **Hardcoded defaults** (fallback values)

## Migration Impact

### **For Shared Repository Administrators:**
- Set repository variables for organization-wide defaults
- Update thresholds centrally as needed
- Monitor security compliance across all applications

### **For Frontend Application Teams:**
- Remove most configuration from workflow files
- Keep only build-specific and override configurations
- Secrets management remains the same

### **For Security Teams:**
- Central visibility into all scan configurations
- Consistent security standards enforcement
- Easy to audit and update security policies

## Variable Configuration Examples

### **Strict Security Organization:**
```
MIN_CODE_COVERAGE = "90"
MAX_CRITICAL_VULNERABILITIES = "0"
MAX_HIGH_VULNERABILITIES = "0"
```

### **Moderate Security Organization:**
```
MIN_CODE_COVERAGE = "75"
MAX_CRITICAL_VULNERABILITIES = "0"
MAX_HIGH_VULNERABILITIES = "5"
```

### **Custom SonarQube Server:**
```
SONAR_HOST_URL = "https://sonarqube.company.com"
SONAR_SKIP_SSL_VERIFICATION = "true"
```

This centralized approach provides better governance while maintaining flexibility for individual applications! 🎯
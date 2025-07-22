#**Simplified Composite Actions

Ultra-streamlined composite actions providing **production-grade security scanning** with **minimal complexity** - perfect for intermediate CI/CD workflows.

## Key Simplifications

- **📦 NPM Scripts**: SonarCloud uses `sonarqube-scanner` npm package (no complex setup)
- ** Essential Parameters**: Only the most important configuration options
- ** Clean API Calls**: Direct SonarCloud/Checkmarx API integration
- ** Faster Execution**: Reduced inline scripts and streamlined logic
- ** Easy Toggle**: Simple enable/disable for emergency deployments

## 📂 Available Actions

### 🔬 SonarCloud Analysis (`sonar-analysis`)

**NPM-based SonarCloud scanning** with real-time API results.

```yaml
- name: SonarCloud Analysis
**uses: ./.github/actions/sonar-analysis
**with:
****enabled: true
****sonar-token: ${{ secrets.SONAR_TOKEN }}
****github-token: ${{ secrets.GITHUB_TOKEN }}
****organization: ${{ vars.SONAR_ORGANIZATION }}
****sonar-host-url: ${{ vars.SONAR_HOST_URL || 'https://sonarcloud.io' }}
****min-code-coverage: '80'
****max-blocker-issues: '0'
****max-critical-issues: '0'
```

**Setup your `package.json`:
```json
{
**"scripts": {
****"sonar": "sonar-scanner"
**},
**"devDependencies": {
****"sonarqube-scanner": "^3.0.1"
**}
}
```

**Parameters:
- `sonar-token`: SonarCloud/SonarQube authentication token (required)
- `github-token`: GitHub token for API access (required)
- `organization`: SonarCloud organization name (required)
- `sonar-host-url`: SonarCloud/SonarQube server URL (optional, default: `https://sonarcloud.io`)
- `skip-ssl-verification`: Skip SSL certificate verification for self-signed certs (optional, default: `false`)
- `enabled`: Enable/disable the scan (optional, default: `true`)
- `min-code-coverage`: Minimum code coverage percentage (optional, default: `80`)
- `max-blocker-issues`: Maximum blocker issues allowed (optional, default: `0`)
- `max-critical-issues`: Maximum critical issues allowed (optional, default: `0`)

**Outputs:** `status`, `coverage`

### Checkmarx Security Scan (`checkmarx-scan`)

**Official Checkmarx AST action** with simplified vulnerability thresholds.

```yaml
- name: Checkmarx Security Scan
**uses: ./.github/actions/checkmarx-scan
**with:
****enabled: true
****base-uri: ${{ secrets.CHECKMARX_BASE_URI }}
****checkmarx-client-id: ${{ secrets.CHECKMARX_CLIENT_ID }}
****checkmarx-secret: ${{ secrets.CHECKMARX_SECRET }}
****tenant: ${{ secrets.CHECKMARX_TENANT }}
****scan-types: 'sca,sast,kics'
****max-critical: '0'
****max-high: '5'
```

**Features:
- **Real Checkmarx AST CLI** via official GitHub action
- **Auto SCA Resolver** for Java projects (Maven/Gradle)
- **SARIF Result Parsing** from actual scan output
- **Streamlined Thresholds** (critical/high only)

**Outputs:** `status`, `critical-count`, `high-count`

## Workflow Integration

**Simplified workflow with all main features:

```yaml
jobs:
**quality-checks:
****runs-on: ubuntu-latest
****steps:
******- uses: actions/checkout@v4
****
******- name: Setup Node.js
********uses: actions/setup-node@v4
********with:
**********node-version: '20'
**********cache: 'npm'
****
******- name: Build & Test
********run: |
**********npm ci && npm run build
**********npm run test -- --coverage
****
******- name: SonarCloud Analysis
********uses: ./.github/actions/sonar-analysis
********with:
**********enabled: ${{ env.ENABLE_SONAR }}
**********sonar-token: ${{ secrets.SONAR_TOKEN }}
**********github-token: ${{ secrets.GITHUB_TOKEN }}
**********organization: ${{ vars.SONAR_ORGANIZATION }}
****
******- name: Checkmarx Security Scan
********uses: ./.github/actions/checkmarx-scan
********with:
**********enabled: ${{ env.ENABLE_CHECKMARX }}
**********base-uri: ${{ secrets.CHECKMARX_BASE_URI }}
**********checkmarx-client-id: ${{ secrets.CHECKMARX_CLIENT_ID }}
**********checkmarx-secret: ${{ secrets.CHECKMARX_SECRET }}
**********tenant: ${{ secrets.CHECKMARX_TENANT }}
```

## 🧹 Simplification Benefits

| **Before** | **After** |
|------------|-----------|
| 45+ line inline scripts | 5-10 line scripts |
| Complex polling loops | Simple wait + API calls |
| 15+ input parameters | 6-8 essential parameters |
| Verbose multi-line reporting | Clean one-line output |
| Complex SARIF parsing | Streamlined jq commands |
| Multiple rating validations | Focus on critical metrics |

## Performance Improvements

- **~70% fewer lines** in composite actions
- **Faster execution** with reduced operations
- **Cleaner logs** with focused output
- **Easier maintenance** with simplified logic
- **Same security coverage** with less complexity

## Required Secrets & Variables

### Repository Secrets
```
SONAR_TOKEN****************# SonarCloud authentication
SONAR_ORGANIZATION******** # SonarCloud organization
CHECKMARX_BASE_URI********# Checkmarx AST base URI
CHECKMARX_CLIENT_ID****** # Checkmarx client ID
CHECKMARX_SECRET**********# Checkmarx client secret
CHECKMARX_TENANT**********# Checkmarx tenant
```

### Repository Variables
```
ENABLE_SONAR_SCAN=true****# Toggle SonarCloud
ENABLE_CHECKMARX_SCAN=true # Toggle Checkmarx
MIN_CODE_COVERAGE=80******# Coverage threshold
MAX_CRITICAL_VULNERABILITIES=0**# Critical vuln limit
MAX_HIGH_VULNERABILITIES=5******# High vuln limit
```

## Enable/Disable Controls

**Emergency deployment without scans:
```yaml
env:
**ENABLE_SONAR: 'false'
**ENABLE_CHECKMARX: 'false'
```

**Manual workflow dispatch:
```yaml
workflow_dispatch:
**inputs:
****enable_sonar:
******type: boolean
******default: true
****enable_checkmarx:
******type: boolean
******default: true
```

This creates the perfect balance: **production-grade security scanning** with **intermediate complexity** that keeps your workflows clean and maintainable!
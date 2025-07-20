# 🎯 Composite Actions for Intermediate CI/CD

This directory contains streamlined composite actions that maintain **intermediate complexity** - providing production-grade security scanning while keeping workflows clean and manageable.

## 📂 Available Actions

### 🔬 SonarCloud Analysis (`sonar-analysis`)

Comprehensive SonarCloud analysis with configurable quality gates and coverage thresholds.

**Features:**
- ✅ **Real-time SonarCloud API integration** with fallback handling
- ✅ **Essential quality metrics** (coverage, ratings, issue counts)
- ✅ **Configurable thresholds** with simple validation logic
- ✅ **Easy enable/disable** functionality
- ✅ **Clean, readable reporting** 
- ✅ **Production-grade** without overwhelming complexity

**Usage:**
```yaml
- name: SonarCloud Analysis
  uses: ./.github/actions/sonar-analysis
  with:
    enabled: true
    sonar-token: ${{ secrets.SONAR_TOKEN }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
    min-code-coverage: '80'
    sonar-maintainability-rating: 'A'
    max-critical-issues: '0'
```

**Outputs:**
- `quality-gate`: Quality gate status (PASSED/FAILED)
- `coverage`: Code coverage percentage
- `scan-status`: Overall scan status (PASSED/FAILED/SKIPPED)

### 🔒 Checkmarx Security Scan (`checkmarx-scan`)

Comprehensive Checkmarx security scanning with configurable vulnerability thresholds.

**Features:**
- ✅ **Real Checkmarx AST CLI integration** with official GitHub action
- ✅ **SCA Resolver support** for Java projects (auto-detected)
- ✅ **Multiple scan types** (SAST, SCA, KICS)
- ✅ **Real SARIF result parsing** from AST output files
- ✅ **Essential vulnerability metrics** with threshold validation
- ✅ **Production-grade** scanning with intermediate complexity

**Usage:**
```yaml
- name: Checkmarx Security Scan
  uses: ./.github/actions/checkmarx-scan
  with:
    enabled: true
    checkmarx-client: ${{ secrets.CHECKMARX_CLIENT }}
    checkmarx-secret: ${{ secrets.CHECKMARX_SECRET }}
    scan-types: 'sca,sast,kics'
    max-critical-vulnerabilities: '0'
    max-high-vulnerabilities: '2'
```

**Outputs:**
- `scan-status`: Overall scan status (PASSED/FAILED/SKIPPED)
- `critical-count`: Number of critical vulnerabilities
- `threshold-passed`: Whether thresholds were met

## ⚙️ Configuration Options

### SonarCloud Configuration

**Repository Variables:**
```bash
# Quality gate thresholds
MIN_CODE_COVERAGE=80                    # Minimum overall coverage
MIN_BRANCH_COVERAGE=70                  # Minimum branch coverage
MIN_LINE_COVERAGE=80                    # Minimum line coverage

# Quality ratings (A-E)
SONAR_MAINTAINABILITY_RATING=A          # Target maintainability
SONAR_RELIABILITY_RATING=A              # Target reliability
SONAR_SECURITY_RATING=A                 # Target security

# Issue count limits
MAX_BLOCKER_ISSUES=0                    # Maximum blocker issues
MAX_CRITICAL_ISSUES=0                   # Maximum critical issues
MAX_MAJOR_ISSUES=5                      # Maximum major issues

# Coverage exclusions
SONAR_COVERAGE_EXCLUSIONS="**/node_modules/**,**/dist/**,**/build/**,**/coverage/**,**/*.test.*,**/*.spec.*"
```

**Secrets:**
```bash
SONAR_TOKEN                             # SonarCloud authentication token
```

### Checkmarx Configuration

**Repository Variables:**
```bash
# Vulnerability thresholds - SAST
MAX_CRITICAL_VULNERABILITIES=0          # SAST critical limit
MAX_HIGH_VULNERABILITIES=2              # SAST high limit
MAX_MEDIUM_VULNERABILITIES=10           # SAST medium limit

# Vulnerability thresholds - SCA
MAX_SCA_CRITICAL=0                      # SCA critical limit
MAX_SCA_HIGH=2                          # SCA high limit

# Vulnerability thresholds - KICS
MAX_KICS_HIGH=0                         # KICS high limit

# Scan configuration
CHECKMARX_SCAN_TYPES="sca,sast,kics"   # Enabled scan types
CHECKMARX_PRESET="Checkmarx Default"    # Scan preset
CHECKMARX_INCREMENTAL=true              # Enable incremental scanning

# Exclusions
CHECKMARX_EXCLUDE_FOLDERS="node_modules,dist,build,coverage"
CHECKMARX_EXCLUDE_FILES="*.min.js,*.bundle.js"
```

**Secrets:**
```bash
CHECKMARX_CLIENT_ID                     # Checkmarx AST client ID
CHECKMARX_SECRET                        # Checkmarx AST client secret
CHECKMARX_TENANT                        # Checkmarx AST tenant name
CHECKMARX_BASE_URI                      # Checkmarx AST base URI (optional)
```

## 🔧 Action Configuration Details

### SonarCloud Action Inputs

| Input | Description | Default | Required |
|-------|-------------|---------|----------|
| `enabled` | Enable SonarCloud analysis | `true` | No |
| `sonar-token` | SonarCloud authentication token | - | Yes |
| `github-token` | GitHub token for PR analysis | - | Yes |
| `min-code-coverage` | Minimum code coverage percentage | `80` | No |
| `min-branch-coverage` | Minimum branch coverage percentage | `70` | No |
| `sonar-maintainability-rating` | Target maintainability rating | `A` | No |
| `sonar-reliability-rating` | Target reliability rating | `A` | No |
| `sonar-security-rating` | Target security rating | `A` | No |
| `max-blocker-issues` | Maximum blocker issues | `0` | No |
| `max-critical-issues` | Maximum critical issues | `0` | No |
| `max-major-issues` | Maximum major issues | `5` | No |
| `coverage-exclusions` | Files to exclude from coverage | See default | No |
| `fail-on-quality-gate` | Fail if quality gate fails | `true` | No |

### Checkmarx Action Inputs

| Input | Description | Default | Required |
|-------|-------------|---------|----------|
| `enabled` | Enable Checkmarx scanning | `true` | No |
| `checkmarx-client` | Checkmarx client ID | - | Yes |
| `checkmarx-secret` | Checkmarx client secret | - | Yes |
| `checkmarx-server` | Checkmarx server URL | Default server | No |
| `scan-types` | Scan types (comma-separated) | `sca,sast,kics` | No |
| `max-critical-vulnerabilities` | Max SAST critical vulns | `0` | No |
| `max-high-vulnerabilities` | Max SAST high vulns | `2` | No |
| `max-medium-vulnerabilities` | Max SAST medium vulns | `10` | No |
| `max-sca-critical` | Max SCA critical vulns | `0` | No |
| `max-sca-high` | Max SCA high vulns | `2` | No |
| `max-kics-high` | Max KICS high issues | `0` | No |
| `preset` | Checkmarx scan preset | `Checkmarx Default` | No |
| `incremental` | Enable incremental scanning | `true` | No |
| `exclude-folders` | Folders to exclude | `node_modules,dist,build,coverage` | No |
| `exclude-files` | Files to exclude | `*.min.js,*.bundle.js` | No |
| `fail-on-threshold` | Fail on threshold breach | `true` | No |

## 🚀 Usage Examples

### Basic Usage (Intermediate Workflow)

```yaml
- name: SonarCloud Analysis
  uses: ./.github/actions/sonar-analysis
  with:
    enabled: ${{ vars.ENABLE_SONAR_SCAN || 'true' }}
    sonar-token: ${{ secrets.SONAR_TOKEN }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
    min-code-coverage: ${{ vars.MIN_CODE_COVERAGE || '80' }}

- name: Checkmarx Security Scan
  uses: ./.github/actions/checkmarx-scan
  with:
    enabled: ${{ vars.ENABLE_CHECKMARX_SCAN || 'true' }}
    checkmarx-client: ${{ secrets.CHECKMARX_CLIENT }}
    checkmarx-secret: ${{ secrets.CHECKMARX_SECRET }}
    scan-types: ${{ vars.CHECKMARX_SCAN_TYPES || 'sca,sast,kics' }}
```

### Advanced Configuration

```yaml
- name: Comprehensive SonarCloud Analysis
  uses: ./.github/actions/sonar-analysis
  with:
    enabled: true
    sonar-token: ${{ secrets.SONAR_TOKEN }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
    min-code-coverage: '85'
    min-branch-coverage: '75'
    sonar-maintainability-rating: 'A'
    sonar-reliability-rating: 'A'
    sonar-security-rating: 'A'
    max-blocker-issues: '0'
    max-critical-issues: '0'
    max-major-issues: '3'
    coverage-exclusions: '**/node_modules/**,**/dist/**,**/*.test.*'
    fail-on-quality-gate: true

- name: Comprehensive Checkmarx Scan
  uses: ./.github/actions/checkmarx-scan
  with:
    enabled: true
    checkmarx-client: ${{ secrets.CHECKMARX_CLIENT }}
    checkmarx-secret: ${{ secrets.CHECKMARX_SECRET }}
    scan-types: 'sca,sast,kics'
    max-critical-vulnerabilities: '0'
    max-high-vulnerabilities: '1'
    max-medium-vulnerabilities: '5'
    max-sca-critical: '0'
    max-sca-high: '1'
    max-kics-high: '0'
    preset: 'High Coverage'
    incremental: true
    exclude-folders: 'node_modules,dist,build'
    exclude-files: '*.min.js,*.bundle.js'
    fail-on-threshold: true
```

### Emergency Deployment (Disable Scans)

```yaml
- name: SonarCloud Analysis (Emergency Skip)
  uses: ./.github/actions/sonar-analysis
  with:
    enabled: false  # Skip for emergency deployment
    sonar-token: ${{ secrets.SONAR_TOKEN }}
    github-token: ${{ secrets.GITHUB_TOKEN }}

- name: Checkmarx Security Scan (Emergency Skip)
  uses: ./.github/actions/checkmarx-scan
  with:
    enabled: false  # Skip for emergency deployment
    checkmarx-client: ${{ secrets.CHECKMARX_CLIENT }}
    checkmarx-secret: ${{ secrets.CHECKMARX_SECRET }}
```

## 🛠️ Benefits of Composite Actions

### 🎯 Intermediate Complexity Benefits

**For Workflow Maintainability:**
- ✅ **Clean workflow files** - Complex scan logic moved to reusable actions
- ✅ **Consistent behavior** - Same scan configuration across all environments
- ✅ **Easy updates** - Centralized action updates affect all workflows
- ✅ **Readable workflows** - Focus on deployment logic, not scan details

**For Configuration Management:**
- ✅ **Centralized configuration** - All scan options in one place
- ✅ **Environment-specific overrides** - Use variables for different environments
- ✅ **Default values** - Sensible defaults with override capability
- ✅ **Validation logic** - Built-in parameter validation

**For Team Productivity:**
- ✅ **Faster onboarding** - Simple action usage vs. complex inline scripts
- ✅ **Reduced errors** - Tested, reusable components
- ✅ **Clear documentation** - Self-documenting action parameters
- ✅ **Quick customization** - Change variables without workflow modifications

## 🔧 Customization Guide

### Adjusting Quality Thresholds

**For Stricter Quality Gates:**
```bash
# Set higher coverage requirements
gh variable set MIN_CODE_COVERAGE --body "90"
gh variable set MIN_BRANCH_COVERAGE --body "85"

# Stricter issue limits
gh variable set MAX_MAJOR_ISSUES --body "0"
```

**For More Permissive Gates:**
```bash
# Lower coverage for legacy projects
gh variable set MIN_CODE_COVERAGE --body "60"

# Allow more issues during migration
gh variable set MAX_HIGH_VULNERABILITIES --body "5"
```

### Scan Type Configuration

**SAST Only (Faster Scans):**
```bash
gh variable set CHECKMARX_SCAN_TYPES --body "sast"
```

**SCA + KICS (Dependency + Infrastructure):**
```bash
gh variable set CHECKMARX_SCAN_TYPES --body "sca,kics"
```

**Full Security Suite:**
```bash
gh variable set CHECKMARX_SCAN_TYPES --body "sca,sast,kics"
```

## 🔗 Integration with Intermediate Workflow

These composite actions are specifically designed for the intermediate CI/CD workflow, providing:

- **Clean separation** of deployment logic and security scanning
- **Maintainable complexity** - neither too simple nor overwhelming
- **Production-grade features** without enterprise complexity
- **Easy enable/disable** for emergency situations
- **Comprehensive configuration** without too many options

The actions automatically integrate with the intermediate workflow's:
- Risk-based deployment strategies
- Environment-specific versioning
- Quality gate enforcement
- Emergency deployment capabilities

---
*These composite actions maintain the perfect balance of features and complexity for production-grade CI/CD.*
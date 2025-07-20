# 🎯 Configurable Security & Quality Thresholds

This guide covers all configurable thresholds for security scanning and quality gates, allowing teams to customize the CI/CD pipeline according to their specific requirements and quality standards.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Repository Variables Configuration](#repository-variables-configuration)
3. [Checkmarx Configuration](#checkmarx-configuration)
4. [SonarCloud Configuration](#sonarcloud-configuration)
5. [Quality Gate Thresholds](#quality-gate-thresholds)
6. [Configuration Examples](#configuration-examples)
7. [Threshold Tuning Guide](#threshold-tuning-guide)

## 🎯 Overview

The CI/CD pipeline supports extensive customization through GitHub repository variables. All thresholds have sensible defaults but can be adjusted to match your project's requirements.

### ✅ **Benefits of Configurable Thresholds**

- **Flexibility**: Adapt to different project requirements and maturity levels
- **Gradual Improvement**: Start with relaxed thresholds and gradually tighten them
- **Environment-Specific Rules**: Different thresholds for development vs production
- **Team Autonomy**: Teams can adjust thresholds without modifying workflows
- **Easy Tuning**: Modify thresholds through GitHub UI without code changes

## 🔧 Repository Variables Configuration

All thresholds are configured using GitHub repository variables. Go to:
`Repository Settings > Secrets and variables > Actions > Variables`

### 📊 **Scan Control Variables**

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_SONAR_SCAN` | `true` | Enable/disable SonarCloud analysis |
| `ENABLE_CHECKMARX_SCAN` | `true` | Enable/disable Checkmarx security scanning |
| `ENABLE_DEPENDENCY_SCAN` | `true` | Enable/disable dependency vulnerability scanning |
| `ENABLE_LICENSE_SCAN` | `false` | Enable/disable license compliance checking |
| `SECURITY_GATE_ENABLED` | `true` | Enable/disable overall security gate |

## 🔒 Checkmarx Configuration

### **Scan Types & Settings**

| Variable | Default | Description |
|----------|---------|-------------|
| `CHECKMARX_SCAN_TYPES` | `sca,sast,kics` | Scan types (comma-separated) |
| `CHECKMARX_PRESET` | `Checkmarx Default` | Security scan preset |
| `CHECKMARX_INCREMENTAL` | `true` | Use incremental scanning |
| `CHECKMARX_EXCLUDE_FOLDERS` | `node_modules,dist,build,coverage` | Folders to exclude |
| `CHECKMARX_EXCLUDE_FILES` | `*.min.js,*.bundle.js` | File patterns to exclude |

### **Available Scan Types**

- **`sast`**: Static Application Security Testing
- **`sca`**: Software Composition Analysis (dependency vulnerabilities)
- **`kics`**: Infrastructure as Code Security scanning

### **SAST Vulnerability Thresholds**

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_CRITICAL_VULNERABILITIES` | `0` | Maximum critical SAST vulnerabilities |
| `MAX_HIGH_VULNERABILITIES` | `2` | Maximum high SAST vulnerabilities |
| `MAX_MEDIUM_VULNERABILITIES` | `10` | Maximum medium SAST vulnerabilities |

### **SCA Vulnerability Thresholds**

| Variable | Default | Description |
|----------|---------|-------------|
| *SCA Critical* | `0` | No critical dependency vulnerabilities allowed |
| *SCA High* | `2` | Maximum high dependency vulnerabilities |

### **KICS Infrastructure Security Thresholds**

| Variable | Default | Description |
|----------|---------|-------------|
| *KICS High* | `0` | No high-severity IaC issues allowed in production |

## 🔬 SonarCloud Configuration

### **Coverage Thresholds**

| Variable | Default | Description |
|----------|---------|-------------|
| `MIN_CODE_COVERAGE` | `80` | Minimum overall code coverage (%) |
| `MIN_BRANCH_COVERAGE` | `70` | Minimum branch coverage (%) |
| `MIN_LINE_COVERAGE` | `80` | Minimum line coverage (%) |

### **Quality Ratings**

| Variable | Default | Description |
|----------|---------|-------------|
| `SONAR_MAINTAINABILITY_RATING` | `A` | Target maintainability rating |
| `SONAR_RELIABILITY_RATING` | `A` | Target reliability rating |
| `SONAR_SECURITY_RATING` | `A` | Target security rating |

### **Code Quality Thresholds**

| Variable | Default | Description |
|----------|---------|-------------|
| `SONAR_DUPLICATED_LINES_DENSITY` | `3.0` | Maximum duplicated lines density (%) |
| `MAX_COMPLEXITY_THRESHOLD` | `10` | Maximum cyclomatic complexity |
| `MAX_TECHNICAL_DEBT_MINUTES` | `60` | Maximum technical debt (minutes) |
| `MIN_SECURITY_HOTSPOT_REVIEW_RATE` | `100` | Minimum security hotspot review rate (%) |

### **Issue Thresholds**

| Variable | Default | Description |
|----------|---------|-------------|
| `MAX_BLOCKER_ISSUES` | `0` | Maximum blocker issues |
| `MAX_CRITICAL_ISSUES` | `0` | Maximum critical issues |
| `MAX_MAJOR_ISSUES` | `5` | Maximum major issues |

### **Exclusion Patterns**

| Variable | Default | Description |
|----------|---------|-------------|
| `SONAR_COVERAGE_EXCLUSIONS` | `**/node_modules/**,**/dist/**,**/build/**,**/coverage/**,**/*.test.js,**/*.spec.js` | Files/folders excluded from analysis |

## 🚪 Quality Gate Thresholds

The security gate evaluation uses all configured thresholds to determine if a PR can be merged:

### **Scoring System**

- **Starting Score**: 100 points
- **Test Failures**: -20 points
- **Coverage Below Threshold**: -15 points
- **Linting Failures**: -10 points
- **SonarCloud Quality Gate Failure**: -25 points
- **Critical Vulnerabilities**: -30 points per violation
- **High Vulnerabilities**: -20 points per violation
- **Medium Vulnerabilities**: -10 points per violation

### **Production vs Development Rules**

- **Production Changes**: Stricter enforcement of all thresholds
- **Development Changes**: Some thresholds are warnings only
- **Security Issues**: Always block regardless of environment

## 📋 Configuration Examples

### **Strict Production Configuration**

```yaml
# High-security production environment
ENABLE_SONAR_SCAN=true
ENABLE_CHECKMARX_SCAN=true
CHECKMARX_SCAN_TYPES=sca,sast,kics
MIN_CODE_COVERAGE=90
MIN_BRANCH_COVERAGE=85
MAX_CRITICAL_VULNERABILITIES=0
MAX_HIGH_VULNERABILITIES=0
MAX_MEDIUM_VULNERABILITIES=2
SONAR_MAINTAINABILITY_RATING=A
SONAR_RELIABILITY_RATING=A
SONAR_SECURITY_RATING=A
MAX_BLOCKER_ISSUES=0
MAX_CRITICAL_ISSUES=0
MAX_MAJOR_ISSUES=2
```

### **Development-Friendly Configuration**

```yaml
# More relaxed for development teams
ENABLE_SONAR_SCAN=true
ENABLE_CHECKMARX_SCAN=true
CHECKMARX_SCAN_TYPES=sast,sca
MIN_CODE_COVERAGE=70
MIN_BRANCH_COVERAGE=60
MAX_CRITICAL_VULNERABILITIES=0
MAX_HIGH_VULNERABILITIES=5
MAX_MEDIUM_VULNERABILITIES=20
SONAR_MAINTAINABILITY_RATING=B
SONAR_RELIABILITY_RATING=A
SONAR_SECURITY_RATING=A
MAX_BLOCKER_ISSUES=0
MAX_CRITICAL_ISSUES=2
MAX_MAJOR_ISSUES=10
```

### **Legacy Project Configuration**

```yaml
# Gradual improvement for legacy codebases
ENABLE_SONAR_SCAN=true
ENABLE_CHECKMARX_SCAN=true
CHECKMARX_SCAN_TYPES=sast
MIN_CODE_COVERAGE=50
MIN_BRANCH_COVERAGE=40
MAX_CRITICAL_VULNERABILITIES=0
MAX_HIGH_VULNERABILITIES=10
MAX_MEDIUM_VULNERABILITIES=50
SONAR_MAINTAINABILITY_RATING=C
SONAR_RELIABILITY_RATING=B
SONAR_SECURITY_RATING=A
MAX_BLOCKER_ISSUES=0
MAX_CRITICAL_ISSUES=5
MAX_MAJOR_ISSUES=25
```

### **SAST-Only Configuration**

```yaml
# Only static analysis, no dependency scanning
ENABLE_SONAR_SCAN=true
ENABLE_CHECKMARX_SCAN=true
ENABLE_DEPENDENCY_SCAN=false
CHECKMARX_SCAN_TYPES=sast
MIN_CODE_COVERAGE=80
MAX_CRITICAL_VULNERABILITIES=0
MAX_HIGH_VULNERABILITIES=3
SONAR_SECURITY_RATING=A
```

## 🎯 Threshold Tuning Guide

### **Step 1: Baseline Assessment**

1. **Run Initial Scan**: Execute the pipeline with default settings
2. **Analyze Results**: Review current code quality and security metrics
3. **Document Current State**: Record baseline measurements

### **Step 2: Set Realistic Targets**

```bash
# Example: If current coverage is 65%
MIN_CODE_COVERAGE=70  # Slight improvement target

# If current vulnerabilities: Critical=0, High=8, Medium=15
MAX_CRITICAL_VULNERABILITIES=0  # Always 0
MAX_HIGH_VULNERABILITIES=5      # Gradual reduction
MAX_MEDIUM_VULNERABILITIES=12   # Manageable reduction
```

### **Step 3: Gradual Improvement**

1. **Month 1**: Set achievable targets
2. **Month 2**: Tighten thresholds by 10-20%
3. **Month 3**: Approach industry standards
4. **Ongoing**: Maintain and incrementally improve

### **Step 4: Environment-Specific Tuning**

Consider different thresholds for:
- **Feature Branches**: More relaxed for experimentation
- **Main Branch**: Stricter for production readiness
- **Release Branches**: Strictest for production releases

## 🚨 Troubleshooting Common Issues

### **Quality Gate Always Failing**

1. **Check Current Metrics**: Review actual vs required thresholds
2. **Adjust Gradually**: Don't jump to strict thresholds immediately
3. **Focus on Critical Issues**: Address blockers and critical issues first

### **Scans Taking Too Long**

1. **Optimize Exclusions**: Add more specific exclusion patterns
2. **Incremental Scans**: Enable incremental scanning for Checkmarx
3. **Selective Scanning**: Disable scans not relevant to your tech stack

### **False Positives**

1. **Refine Exclusions**: Add specific file/folder exclusions
2. **Update Scan Rules**: Customize Checkmarx presets
3. **SonarCloud Rules**: Configure quality profiles in SonarCloud

## 📚 Best Practices

### ✅ **Do's**

- **Start Conservative**: Begin with relaxed thresholds and gradually improve
- **Monitor Trends**: Track metrics over time, not just point-in-time
- **Team Buy-in**: Involve development team in threshold setting
- **Regular Review**: Adjust thresholds based on team capabilities
- **Document Changes**: Track why thresholds were changed

### ❌ **Don'ts**

- **Set Unrealistic Targets**: Don't set thresholds impossible to achieve
- **Ignore Context**: Consider project type, team size, and timeline
- **Set and Forget**: Regularly review and adjust thresholds
- **One Size Fits All**: Different projects may need different standards
- **Skip Security**: Never compromise on critical security thresholds

## 🔗 Related Documentation

- [PR Protection Guide](06-PR-PROTECTION-GUIDE.md) - Overview of security scanning
- [Security Best Practices](08-SECURITY-BEST-PRACTICES.md) - Security guidelines
- [Troubleshooting](07-TROUBLESHOOTING.md) - Common issues and solutions
- [Operations Runbook](09-OPERATIONS-RUNBOOK.md) - Daily operations

---

**Need Help?**
If you need assistance with threshold configuration, refer to the [Troubleshooting Guide](07-TROUBLESHOOTING.md) or contact your DevOps team.
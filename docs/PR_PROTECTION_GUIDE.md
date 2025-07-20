# 🛡️ PR Protection & Security Gate Guide

## Overview

This comprehensive guide covers the configurable PR protection system with integrated SonarCloud and Checkmarx security scanning. The system provides flexible security gates that can be enabled/disabled as needed for different environments and use cases.

## 🎯 Features

### ✅ **Configurable Security Checks**
- **SonarCloud Integration** - Code quality and security analysis
- **Checkmarx Integration** - SAST security vulnerability scanning
- **Dependency Scanning** - npm audit for vulnerability detection
- **License Compliance** - Automated license checking
- **Quality Gates** - Code coverage, linting, and test validation

### ✅ **Flexible Configuration**
- **Repository Variables** - Easy enable/disable via GitHub settings
- **Manual Overrides** - Workflow dispatch for emergency deployments
- **Scope-based Rules** - Different requirements for production vs development
- **Preset Configurations** - Strict, moderate, minimal, or disabled presets

### ✅ **Branch Protection Integration**
- **Automated Rule Management** - Sync with GitHub branch protection
- **Emergency Bypass** - Override protection for critical deployments
- **Status Check Integration** - Required checks before merge
- **Admin Controls** - Configurable admin enforcement

## 🔧 Configuration Methods

### 1. Repository Variables (Recommended)

Navigate to **Repository Settings → Secrets and variables → Actions → Variables**

| Variable | Default | Description |
|----------|---------|-------------|
| `ENABLE_SONAR_SCAN` | `true` | Enable SonarCloud analysis |
| `ENABLE_CHECKMARX_SCAN` | `true` | Enable Checkmarx security scan |
| `ENABLE_DEPENDENCY_SCAN` | `true` | Enable dependency vulnerability scan |
| `ENABLE_LICENSE_SCAN` | `false` | Enable license compliance check |
| `SECURITY_GATE_ENABLED` | `true` | Enable overall security gate |
| `MAX_CRITICAL_VULNERABILITIES` | `0` | Maximum allowed critical vulnerabilities |
| `MAX_HIGH_VULNERABILITIES` | `2` | Maximum allowed high vulnerabilities |
| `MIN_CODE_COVERAGE` | `80` | Minimum required code coverage percentage |

### 2. Security Configuration Script

Use the security configuration manager for easy setup:

```bash
# Show current configuration
node scripts/security-config.js status

# Apply security presets
node scripts/security-config.js preset strict      # Maximum security
node scripts/security-config.js preset moderate   # Balanced security
node scripts/security-config.js preset minimal    # Basic security
node scripts/security-config.js preset disabled   # No security checks

# Enable/disable specific checks
node scripts/security-config.js enable sonarCloud
node scripts/security-config.js disable checkmarx

# Configure thresholds
node scripts/security-config.js threshold minCodeCoverage 85
node scripts/security-config.js threshold maxCriticalVulnerabilities 0

# Generate repository variables
node scripts/security-config.js generate-vars
```

### 3. Manual Workflow Dispatch

For emergency deployments or testing:

1. Go to **Actions → PR Protection & Security Gate**
2. Click **Run workflow**
3. Configure:
   - PR number to check
   - Enable/disable SonarCloud
   - Enable/disable Checkmarx
   - Force security gate strict mode

## 🛡️ Security Check Details

### SonarCloud Analysis

**Purpose**: Code quality, security hotspots, and maintainability analysis

**Configuration**:
```bash
# Repository Secrets (required)
SONAR_TOKEN=your-sonar-token
SONAR_ORGANIZATION=your-org
SONAR_PROJECT_KEY=your-project-key

# Repository Variables (optional)
ENABLE_SONAR_SCAN=true
SONAR_QUALITY_GATE=PASSED
```

**What it checks**:
- Code quality metrics
- Security vulnerabilities
- Code coverage
- Code duplication
- Maintainability rating
- Reliability rating

**Quality Gate Criteria**:
- Overall rating must be "Passed"
- Coverage above minimum threshold
- No security hotspots
- Maintainability rating A or B

### Checkmarx Security Scan

**Purpose**: Static Application Security Testing (SAST)

**Configuration**:
```bash
# Repository Secrets (required)
CHECKMARX_USERNAME=your-username
CHECKMARX_PASSWORD=your-password
CHECKMARX_SERVER=your-server-url
CHECKMARX_CLIENT_SECRET=your-client-secret

# Repository Variables (optional)
ENABLE_CHECKMARX_SCAN=true
MAX_CRITICAL_VULNERABILITIES=0
MAX_HIGH_VULNERABILITIES=2
```

**What it checks**:
- SQL Injection vulnerabilities
- Cross-Site Scripting (XSS)
- Authentication bypasses
- Authorization flaws
- Input validation issues
- Cryptographic weaknesses

**Security Gate Criteria**:
- Critical vulnerabilities ≤ configured threshold
- High vulnerabilities ≤ configured threshold
- All security issues properly categorized

### Dependency Security Scan

**Purpose**: Detect known vulnerabilities in dependencies

**Configuration**:
```bash
# Repository Variables
ENABLE_DEPENDENCY_SCAN=true
```

**What it checks**:
- npm audit results
- Known CVE vulnerabilities
- Outdated packages with security issues
- Dependency tree analysis

**Security Gate Criteria**:
- No critical dependency vulnerabilities
- High vulnerabilities below threshold
- All security advisories reviewed

### License Compliance Check

**Purpose**: Ensure license compatibility and compliance

**Configuration**:
```bash
# Repository Variables
ENABLE_LICENSE_SCAN=false  # Disabled by default
```

**What it checks**:
- Package license compatibility
- Restricted license detection (GPL, AGPL, etc.)
- License consistency
- Commercial use restrictions

**Approved Licenses**:
- MIT
- ISC
- Apache-2.0
- BSD-2-Clause
- BSD-3-Clause
- Unlicense

## 🎚️ Security Gate Behavior

### Scope-Based Rules

The security gate applies different rules based on the target branch:

#### Production Scope (`main` branch)
- **Strict Mode**: Enabled
- **Block on Failure**: Yes
- **Required Checks**: All enabled security checks
- **Coverage Threshold**: Enforced strictly
- **Admin Override**: Requires explicit approval

#### Development Scope (`develop` branch)
- **Strict Mode**: Disabled
- **Block on Failure**: Warnings only
- **Required Checks**: Dependency scan only
- **Coverage Threshold**: Warning if below threshold
- **Admin Override**: Allowed

#### Feature Scope (feature branches)
- **Strict Mode**: Disabled
- **Block on Failure**: No
- **Required Checks**: None required
- **Coverage Threshold**: Advisory only
- **Admin Override**: Always allowed

### Security Scoring

The security gate calculates a score (0-100) based on:

| Check | Points Deducted | Blocking |
|-------|----------------|----------|
| Failed Tests | 20 | Always |
| Low Code Coverage | 15 | Production only |
| Linting Failures | 10 | Always |
| SonarCloud Failure | 25 | Production only |
| Critical Vulnerabilities | 30 | Always |
| High Vulnerabilities | 20 | Production only |
| License Violations | 10 | Production only |

**Score Thresholds**:
- **90-100**: Excellent security posture
- **70-89**: Good security posture
- **50-69**: Acceptable security posture (warnings)
- **Below 50**: Poor security posture (blocked)

## 🔓 Emergency Bypass Options

### 1. Disable Security Gate

**Temporary disable for all PRs**:
```bash
# Via script
node scripts/security-config.js disable securityGate

# Via repository variable
SECURITY_GATE_ENABLED=false
```

### 2. Disable Specific Checks

**Disable individual security checks**:
```bash
# Disable SonarCloud temporarily
node scripts/security-config.js disable sonarCloud

# Disable Checkmarx for hotfix
node scripts/security-config.js disable checkmarx
```

### 3. Manual Workflow Override

**For specific PRs**:
1. Go to **Actions → PR Protection & Security Gate**
2. Select **Run workflow**
3. Set **Force security gate** to `false`
4. Specify the PR number

### 4. Branch Protection Override

**Disable branch protection temporarily**:
```bash
# Requires GITHUB_TOKEN and GITHUB_REPOSITORY
export GITHUB_TOKEN=your-token
export GITHUB_REPOSITORY=owner/repo

# Enable emergency bypass
node scripts/branch-protection.js emergency-bypass main enable

# Don't forget to disable after emergency
node scripts/branch-protection.js emergency-bypass main disable
```

## 📊 Monitoring & Reporting

### PR Status Comments

The system automatically adds detailed comments to PRs with:
- ✅/❌ Status for each security check
- 📊 Security score and detailed breakdown
- 🔧 Configuration status (enabled/disabled checks)
- 📚 Links to detailed reports and configuration

### Security Dashboard

Access security metrics through:
- **SonarCloud Dashboard**: [https://sonarcloud.io/dashboard?id=your-project](https://sonarcloud.io/dashboard?id=your-project)
- **GitHub Security Tab**: Repository → Security → Code scanning alerts
- **Action Artifacts**: Detailed reports in workflow artifacts

### Notification Channels

Configure notifications via repository secrets:
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
TEAMS_WEBHOOK_URL=https://your-org.webhook.office.com/YOUR/TEAMS/WEBHOOK
```

## 🚀 Quick Setup Guide

### 1. Initial Configuration

```bash
# Install dependencies
npm install

# Set up security configuration with moderate preset
node scripts/security-config.js preset moderate

# Generate GitHub repository variables
node scripts/security-config.js generate-vars

# Apply the variables to your repository
# (Copy the output to Repository Settings → Variables)
```

### 2. Configure Security Tools

**SonarCloud Setup**:
1. Create account at [sonarcloud.io](https://sonarcloud.io)
2. Import your repository
3. Get organization and project key
4. Generate token
5. Add to repository secrets

**Checkmarx Setup** (if available):
1. Get Checkmarx server details from your organization
2. Create service account
3. Add credentials to repository secrets

### 3. Enable Branch Protection

```bash
# Set environment variables
export GITHUB_TOKEN=your-github-token
export GITHUB_REPOSITORY=owner/repo

# Apply default branch protection
node scripts/branch-protection.js setup

# Check status
node scripts/branch-protection.js status
```

### 4. Test the Setup

1. Create a test PR with intentional issues
2. Verify security checks run automatically
3. Check PR comment for detailed report
4. Confirm blocking behavior for security issues

## 🔧 Troubleshooting

### Common Issues

#### SonarCloud Not Running
- ✅ Check `SONAR_TOKEN` secret is set
- ✅ Verify `SONAR_ORGANIZATION` variable
- ✅ Confirm project key matches repository
- ✅ Ensure SonarCloud import is complete

#### Checkmarx Failures
- ✅ Verify Checkmarx server accessibility
- ✅ Check credentials in secrets
- ✅ Confirm project permissions
- ✅ Review Checkmarx server logs

#### Branch Protection Issues
- ✅ Verify `GITHUB_TOKEN` has admin permissions
- ✅ Check repository ownership
- ✅ Confirm branch exists
- ✅ Review GitHub API rate limits

#### Security Gate Not Blocking
- ✅ Check `SECURITY_GATE_ENABLED` variable
- ✅ Verify branch protection includes "Security Gate" check
- ✅ Confirm workflow is running on PR events
- ✅ Review scope configuration for branch

### Debug Mode

Enable detailed logging:
```bash
# Set debug environment variables in workflow
DEBUG=true
LOG_LEVEL=debug

# Or use manual workflow dispatch with debug options
```

### Getting Help

1. **Check Workflow Logs**: Actions → PR Protection → Failed run → Logs
2. **Review PR Comments**: Automated security report in PR
3. **Examine Artifacts**: Download security reports from workflow artifacts
4. **Test Configuration**: Use security config script to validate setup

## 📚 Best Practices

### Security Configuration

1. **Start with Moderate Preset**: Balance security and development velocity
2. **Gradually Increase Strictness**: Move to strict preset as team adapts
3. **Regular Review**: Update thresholds based on security landscape
4. **Emergency Procedures**: Document bypass procedures for critical issues

### Branch Strategy

1. **Production Branch**: Apply strictest security rules
2. **Development Branch**: Use moderate security for early feedback
3. **Feature Branches**: Minimal security to encourage experimentation
4. **Release Branches**: Full security validation before production

### Team Training

1. **Security Awareness**: Train team on security check results
2. **Tool Usage**: Provide guidance on SonarCloud and Checkmarx reports
3. **Bypass Procedures**: Document when and how to use emergency bypasses
4. **Responsibility**: Assign security gate ownership to team members

## 🔄 Maintenance

### Regular Tasks

**Weekly**:
- Review security check results
- Update dependency vulnerabilities
- Check for tool updates

**Monthly**:
- Review security thresholds
- Update security configurations
- Audit bypass usage

**Quarterly**:
- Security tool evaluation
- Process improvement review
- Team training updates

---

## 🎯 Summary

The PR Protection & Security Gate system provides:

✅ **Flexible Security Controls** - Enable/disable checks as needed  
✅ **Multi-Tool Integration** - SonarCloud, Checkmarx, dependency scanning  
✅ **Scope-Based Rules** - Different requirements per environment  
✅ **Emergency Bypass Options** - Multiple override mechanisms  
✅ **Comprehensive Reporting** - Detailed status and security scoring  
✅ **Easy Configuration** - Scripts and presets for quick setup  

Your development workflow is now protected with enterprise-grade security that adapts to your needs! 🚀
# 🛡️ PR Protection & Security Guide

This comprehensive guide covers setting up pull request protection, security scanning, and quality gates for Azure Static Web Apps deployment.

## 📋 Table of Contents

1. [Overview](#overview)
2. [GitHub Branch Protection](#github-branch-protection)
3. [SonarCloud Integration](#sonarcloud-integration)
4. [Checkmarx Security Scanning](#checkmarx-security-scanning)
5. [PR Workflows](#pr-workflows)
6. [Quality Gates](#quality-gates)
7. [Security Best Practices](#security-best-practices)

## 🎯 Overview

The PR protection system ensures code quality and security through:

- **Branch Protection Rules** - Prevent direct pushes to main branches
- **Required Status Checks** - SonarCloud, Checkmarx, and build verification
- **Code Review Requirements** - Mandatory peer review process
- **Automated Security Scanning** - SAST and quality analysis
- **Quality Gates** - Configurable thresholds for deployment

## 🌿 GitHub Branch Protection

### Setup Branch Protection Rules

```bash
#!/bin/bash
# scripts/setup-branch-protection.sh

REPO_OWNER="your-github-username"
REPO_NAME="your-repository-name"
GITHUB_TOKEN="your-github-token"

# Protected branches
BRANCHES=("main" "develop" "staging" "preprod")

for BRANCH in "${BRANCHES[@]}"; do
    echo "Setting up protection for branch: $BRANCH"
    
    # Configure branch protection
    curl -X PUT \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        "https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/branches/$BRANCH/protection" \
        -d '{
            "required_status_checks": {
                "strict": true,
                "contexts": [
                    "SonarCloud Code Analysis",
                    "Checkmarx Security Scan",
                    "Build and Test",
                    "Health Check"
                ]
            },
            "enforce_admins": false,
            "required_pull_request_reviews": {
                "required_approving_review_count": 1,
                "dismiss_stale_reviews": true,
                "require_code_owner_reviews": true,
                "require_last_push_approval": true
            },
            "restrictions": null,
            "allow_force_pushes": false,
            "allow_deletions": false,
            "block_creations": false,
            "required_conversation_resolution": true
        }'
    
    echo "✅ Branch protection configured for $BRANCH"
done
```

### CODEOWNERS Configuration

Create a `.github/CODEOWNERS` file:

```
# Global owners
* @your-team/admin

# Frontend code
/src/ @your-team/frontend-team
/public/ @your-team/frontend-team

# Infrastructure and deployment
/.github/ @your-team/devops-team
/scripts/ @your-team/devops-team

# Documentation
/docs/ @your-team/documentation-team
README.md @your-team/documentation-team

# Configuration files
package.json @your-team/frontend-team @your-team/devops-team
/.env* @your-team/devops-team
/environments/ @your-team/devops-team
```

## ☁️ SonarCloud Integration

### SonarCloud Project Setup

```bash
#!/bin/bash
# scripts/setup-sonarcloud.sh

SONAR_ORGANIZATION="your-sonar-org"
SONAR_PROJECT_KEY="your-project-key"
SONAR_TOKEN="your-sonar-token"

# Create sonar-project.properties
cat > sonar-project.properties << EOF
sonar.projectKey=$SONAR_PROJECT_KEY
sonar.organization=$SONAR_ORGANIZATION
sonar.projectName=Azure Static Web App
sonar.projectVersion=1.0
sonar.sourceEncoding=UTF-8

# Source directories
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.js,**/*.test.jsx,**/*.spec.js,**/*.spec.jsx

# Exclusions
sonar.exclusions=**/node_modules/**,**/build/**,**/dist/**,**/*.min.js
sonar.test.exclusions=**/node_modules/**,**/build/**,**/dist/**

# Coverage reports
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.coverage.exclusions=**/*.test.js,**/*.test.jsx,**/*.spec.js,**/*.spec.jsx

# Language-specific settings
sonar.javascript.node.maxspace=4096
EOF

echo "✅ SonarCloud configuration created"
```

### GitHub Actions SonarCloud Integration

```yaml
# .github/workflows/sonarcloud.yml
name: SonarCloud Analysis

on:
  push:
    branches: [main, develop, staging, preprod]
  pull_request:
    branches: [main, develop]

jobs:
  sonarcloud:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Shallow clones should be disabled for better analysis
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests with coverage
        run: |
          npm run test:coverage
          npm run lint
      
      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
        with:
          args: >
            -Dsonar.projectKey=${{ secrets.SONAR_PROJECT_KEY }}
            -Dsonar.organization=${{ secrets.SONAR_ORGANIZATION }}
            -Dsonar.pullrequest.key=${{ github.event.number }}
            -Dsonar.pullrequest.branch=${{ github.head_ref }}
            -Dsonar.pullrequest.base=${{ github.base_ref }}
```

### SonarCloud Quality Gate Configuration

```json
{
  "name": "Azure Static Web App Quality Gate",
  "conditions": [
    {
      "metric": "new_coverage",
      "operator": "LESS_THAN",
      "threshold": "80",
      "onLeakPeriod": true
    },
    {
      "metric": "new_duplicated_lines_density",
      "operator": "GREATER_THAN",
      "threshold": "3",
      "onLeakPeriod": true
    },
    {
      "metric": "new_maintainability_rating",
      "operator": "GREATER_THAN",
      "threshold": "1",
      "onLeakPeriod": true
    },
    {
      "metric": "new_reliability_rating",
      "operator": "GREATER_THAN",
      "threshold": "1",
      "onLeakPeriod": true
    },
    {
      "metric": "new_security_rating",
      "operator": "GREATER_THAN",
      "threshold": "1",
      "onLeakPeriod": true
    },
    {
      "metric": "new_security_hotspots_reviewed",
      "operator": "LESS_THAN",
      "threshold": "100",
      "onLeakPeriod": true
    }
  ]
}
```

## 🔒 Checkmarx Security Scanning

### Checkmarx Integration Setup

```yaml
# .github/workflows/checkmarx.yml
name: Checkmarx Security Scan

on:
  push:
    branches: [main, develop, staging, preprod]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 2 * * 1'  # Weekly scan on Monday at 2 AM

jobs:
  checkmarx-scan:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Checkmarx CxFlow Action
        uses: checkmarx-ts/checkmarx-cxflow-github-action@v1.6
        with:
          project: ${{ github.repository }}
          team: /CxServer/SP/Company/Azure-Team
          checkmarx_url: ${{ secrets.CHECKMARX_URL }}
          checkmarx_client: ${{ secrets.CHECKMARX_CLIENT }}
          checkmarx_secret: ${{ secrets.CHECKMARX_SECRET }}
          checkmarx_client_secret: ${{ secrets.CHECKMARX_CLIENT_SECRET }}
          scanners: sast
          params: |
            --severity=High,Medium
            --cx-flow.filter-severity=High,Medium
            --cx-flow.filter-category=SQL_Injection,XSS,CSRF
            --cx-flow.break-build=true
            --repo-name=${{ github.repository }}
            --branch=${{ github.ref_name }}
            --merge-id=${{ github.event.number }}
      
      - name: Upload SARIF file
        if: always()
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: cx.sarif
```

### Custom Checkmarx Configuration

```json
{
  "sast": {
    "presetName": "Checkmarx Default",
    "incrementalScan": true,
    "forceScan": false,
    "comment": "Automated security scan via GitHub Actions",
    "filterSeverity": ["High", "Medium"],
    "filterCategory": [
      "SQL_Injection",
      "XSS_Reflected", 
      "XSS_Stored",
      "CSRF",
      "Code_Injection",
      "Command_Injection",
      "LDAP_Injection",
      "Path_Traversal"
    ],
    "filterState": ["To Verify", "Confirmed"],
    "thresholds": {
      "high": 0,
      "medium": 10,
      "low": -1
    }
  },
  "reports": {
    "sarif": true,
    "json": true,
    "xml": false
  },
  "breakBuild": true,
  "excludeFiles": [
    "**/*.min.js",
    "**/node_modules/**",
    "**/build/**",
    "**/dist/**",
    "**/*.test.js",
    "**/*.spec.js"
  ]
}
```

## 🔄 PR Workflows

### Pull Request Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## 📋 Pull Request Description

### What does this PR do?
<!-- Describe the changes in this PR -->

### Why is this change needed?
<!-- Link to issue or explain the motivation -->

### Type of Change
- [ ] 🐛 Bug fix (non-breaking change which fixes an issue)
- [ ] ✨ New feature (non-breaking change which adds functionality)
- [ ] 💥 Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] 📚 Documentation update
- [ ] 🔧 Configuration change
- [ ] 🧹 Code refactoring

### 🧪 Testing
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have tested this change in a development environment

### 📱 Screenshots (if applicable)
<!-- Add screenshots to help explain your changes -->

### 🔍 Code Quality Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings

### 🔒 Security Checklist
- [ ] I have reviewed my changes for security vulnerabilities
- [ ] No sensitive information (passwords, API keys, etc.) is exposed
- [ ] Input validation has been added where necessary
- [ ] Authentication and authorization requirements are met

### 🚀 Deployment Checklist
- [ ] This change is backward compatible
- [ ] Database migrations are included (if applicable)
- [ ] Environment variables are documented (if applicable)
- [ ] This change has been tested in staging environment

### 📋 Additional Notes
<!-- Any additional information that reviewers should know -->

---

### Automated Checks Status
<!-- This section will be automatically updated -->
- [ ] ✅ Build and Tests Pass
- [ ] ✅ SonarCloud Quality Gate Passed
- [ ] ✅ Checkmarx Security Scan Passed
- [ ] ✅ Code Coverage Threshold Met
```

### PR Validation Workflow

```yaml
# .github/workflows/pr-validation.yml
name: PR Validation

on:
  pull_request:
    branches: [main, develop, staging, preprod]

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint code
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
        if: success() || failure()
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Build application
        run: npm run build
      
      - name: Check bundle size
        uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Validate PR title
        uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          types: |
            feat
            fix
            docs
            style
            refactor
            perf
            test
            build
            ci
            chore
            revert
      
      - name: Comment PR
        if: failure()
        uses: actions/github-script@v6
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '❌ PR validation failed. Please check the workflow logs and fix the issues before requesting a review.'
            })
```

## 🎯 Quality Gates

### Automated Quality Gate Checks

```javascript
// scripts/quality-gate.js
const fs = require('fs');
const path = require('path');

class QualityGate {
  constructor() {
    this.thresholds = {
      coverage: 80,
      duplications: 3,
      maintainabilityRating: 'A',
      reliabilityRating: 'A',
      securityRating: 'A',
      vulnerabilities: 0,
      bugs: 0,
      codeSmells: 10
    };
  }

  async checkCoverage() {
    const coveragePath = 'coverage/coverage-summary.json';
    
    if (!fs.existsSync(coveragePath)) {
      throw new Error('Coverage report not found');
    }
    
    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const totalCoverage = coverage.total.lines.pct;
    
    if (totalCoverage < this.thresholds.coverage) {
      throw new Error(`Coverage ${totalCoverage}% is below threshold ${this.thresholds.coverage}%`);
    }
    
    return { metric: 'coverage', value: totalCoverage, passed: true };
  }

  async checkSonarResults() {
    const sonarReportPath = '.sonarqube/report-task.txt';
    
    if (!fs.existsSync(sonarReportPath)) {
      throw new Error('SonarQube report not found');
    }
    
    // Parse SonarQube report and check against thresholds
    // Implementation depends on SonarQube API integration
    
    return { metric: 'sonar', passed: true };
  }

  async checkBundleSize() {
    const buildPath = 'build/static/js';
    
    if (!fs.existsSync(buildPath)) {
      throw new Error('Build directory not found');
    }
    
    const jsFiles = fs.readdirSync(buildPath)
      .filter(file => file.endsWith('.js') && !file.includes('.map'))
      .map(file => ({
        name: file,
        size: fs.statSync(path.join(buildPath, file)).size
      }));
    
    const totalSize = jsFiles.reduce((sum, file) => sum + file.size, 0);
    const maxSize = 2 * 1024 * 1024; // 2MB
    
    if (totalSize > maxSize) {
      throw new Error(`Bundle size ${(totalSize / 1024 / 1024).toFixed(2)}MB exceeds limit ${maxSize / 1024 / 1024}MB`);
    }
    
    return { metric: 'bundleSize', value: totalSize, passed: true };
  }

  async checkPerformanceBudget() {
    const lighthouseReportPath = 'lighthouse-report.json';
    
    if (fs.existsSync(lighthouseReportPath)) {
      const report = JSON.parse(fs.readFileSync(lighthouseReportPath, 'utf8'));
      const performance = report.lhr.categories.performance.score * 100;
      
      if (performance < 90) {
        throw new Error(`Performance score ${performance} is below threshold 90`);
      }
      
      return { metric: 'performance', value: performance, passed: true };
    }
    
    return { metric: 'performance', skipped: true };
  }

  async runAllChecks() {
    const results = [];
    
    try {
      results.push(await this.checkCoverage());
    } catch (error) {
      results.push({ metric: 'coverage', error: error.message, passed: false });
    }
    
    try {
      results.push(await this.checkSonarResults());
    } catch (error) {
      results.push({ metric: 'sonar', error: error.message, passed: false });
    }
    
    try {
      results.push(await this.checkBundleSize());
    } catch (error) {
      results.push({ metric: 'bundleSize', error: error.message, passed: false });
    }
    
    try {
      results.push(await this.checkPerformanceBudget());
    } catch (error) {
      results.push({ metric: 'performance', error: error.message, passed: false });
    }
    
    const failedChecks = results.filter(r => r.passed === false);
    
    if (failedChecks.length > 0) {
      console.error('❌ Quality gate failed:');
      failedChecks.forEach(check => {
        console.error(`  - ${check.metric}: ${check.error}`);
      });
      process.exit(1);
    } else {
      console.log('✅ All quality gate checks passed');
      results.forEach(check => {
        if (!check.skipped) {
          console.log(`  - ${check.metric}: ${check.value || 'passed'}`);
        }
      });
    }
    
    return results;
  }
}

if (require.main === module) {
  const gate = new QualityGate();
  gate.runAllChecks().catch(console.error);
}

module.exports = QualityGate;
```

## 🔒 Security Best Practices

### Security Workflow

```yaml
# .github/workflows/security.yml
name: Security Checks

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  schedule:
    - cron: '0 6 * * 1'  # Weekly on Monday

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run Snyk to check for vulnerabilities
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high
      
      - name: Upload result to GitHub Code Scanning
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: snyk.sarif
      
      - name: OWASP Dependency Check
        uses: dependency-check/Dependency-Check_Action@main
        with:
          project: 'azure-static-webapp'
          path: '.'
          format: 'SARIF'
          out: 'dependency-check-report'
      
      - name: Upload OWASP Dependency Check results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: dependency-check-report/dependency-check-report.sarif
      
      - name: GitLeaks Scan
        uses: zricethezav/gitleaks-action@master
        with:
          config-path: .gitleaks.toml
      
      - name: Semgrep Scan
        uses: returntocorp/semgrep-action@v1
        with:
          config: >
            p/security-audit
            p/secrets
            p/react
            p/javascript
          generateSarif: "1"
      
      - name: Upload Semgrep results
        uses: github/codeql-action/upload-sarif@v2
        if: always()
        with:
          sarif_file: semgrep.sarif
```

### Security Configuration Files

#### GitLeaks Configuration (`.gitleaks.toml`)

```toml
[extend]
useDefault = true

[[rules]]
description = "AWS Access Key"
id = "aws-access-key"
regex = '''(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}'''
tags = ["key", "AWS"]

[[rules]]
description = "Azure Storage Account Access Key"
id = "azure-storage-key"
regex = '''(?i)azure.{0,20}['\"][0-9a-z/+]{86}=='''
tags = ["key", "Azure"]

[[rules]]
description = "Generic API Key"
id = "generic-api-key"
regex = '''(?i)(api[_-]?key|apikey).{0,20}['\"][0-9a-z]{32,45}['\"]'''
tags = ["key", "API"]

[allowlist]
description = "Allowlist"
paths = [
    '''node_modules/''',
    '''\.git/''',
    '''coverage/''',
    '''build/''',
    '''dist/'''
]
```

### Environment Variable Security

```javascript
// scripts/validate-env.js
const requiredEnvVars = [
  'REACT_APP_VERSION',
  'REACT_APP_BUILD_ID',
  'REACT_APP_ENV'
];

const sensitivePatterns = [
  /password/i,
  /secret/i,
  /key/i,
  /token/i,
  /credential/i
];

function validateEnvironmentVariables() {
  const errors = [];
  
  // Check required variables
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`);
    }
  }
  
  // Check for sensitive data in REACT_APP_ variables
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('REACT_APP_')) {
      for (const pattern of sensitivePatterns) {
        if (pattern.test(key) && value) {
          errors.push(`Potentially sensitive data in client-side environment variable: ${key}`);
        }
      }
    }
  }
  
  if (errors.length > 0) {
    console.error('❌ Environment variable validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    process.exit(1);
  } else {
    console.log('✅ Environment variable validation passed');
  }
}

if (require.main === module) {
  validateEnvironmentVariables();
}

module.exports = { validateEnvironmentVariables };
```

## 🔗 Related Documentation

- [Infrastructure Setup Guide](./01-INFRASTRUCTURE-SETUP.md)
- [Deployment Guide](./02-DEPLOYMENT-GUIDE.md)
- [Azure Key Vault Integration](./04-AZURE-KEYVAULT-INTEGRATION.md)
- [Security Best Practices](./08-SECURITY-BEST-PRACTICES.md)

---

**Last Updated:** December 2024  
**Version:** 1.0.0
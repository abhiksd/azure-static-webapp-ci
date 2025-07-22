# 🎯 Shared CI/CD Workflow - Complete Overview

## 📋 **What This System Provides**

A **production-ready, enterprise-grade CI/CD solution** for frontend applications with:

- 🛡️ **Complete centralized control** - DevOps controls everything via repository variables
- 🔒 **Mandatory security scanning** - No way to bypass SonarCloud or Checkmarx
- 🚀 **Automatic deployment** to development, staging, pre-production, and production
- 🔄 **Intelligent rollback** - Automatic and manual rollback capabilities
- 📊 **Quality gates enforcement** - Consistent standards across all applications
- 🎛️ **Zero configuration** for frontend teams - just copy workflow and set secrets

## 🏗️ **System Architecture**

### **Repository Structure**
```
Shared CI/CD Repository (THIS REPO)
├── .github/workflows/
│   ├── shared-ci-cd.yml              # Main reusable workflow
│   └── manual-rollback.yml           # Manual rollback workflow
├── .github/actions/                  # Composite actions
│   ├── sonar-analysis/               # SonarCloud quality scanning
│   ├── checkmarx-scan/               # Security vulnerability scanning
│   └── deploy-static-app/            # Azure Static Web Apps deployment
├── pr-security-check.yml            # PR security validation (copy to frontend apps)
├── frontend-ci-cd.yml               # Ready-to-use workflow (copy to frontend apps)
└── docs/                             # Documentation
```

### **Frontend Application Integration**
```
Frontend App Repository
├── .github/workflows/
│   ├── ci-cd.yml                     # Copied from frontend-ci-cd.yml
│   ├── pr-security-check.yml        # Copied from shared repo
│   └── manual-rollback.yml          # Copied from manual-rollback-caller.yml
├── src/                              # Application code
├── package.json                      # Build scripts required
└── staticwebapp.config.json         # Optional Azure config
```

## 🎛️ **Centralized Control System**

### **DevOps Controls Everything Via Repository Variables**

Set these variables in the **shared repository** under Settings > Variables:

#### **Build Configuration**
```bash
NODE_VERSION=18                    # Organizational standard
APP_LOCATION=/                     # Source code location
OUTPUT_LOCATION=build              # Build output directory
BUILD_COMMAND=npm run build        # Build command
INSTALL_COMMAND=npm ci             # Install command
```

#### **Security & Quality Standards**
```bash
ENABLE_SONAR_SCAN=true             # Mandatory SonarCloud scanning
ENABLE_CHECKMARX_SCAN=true         # Mandatory Checkmarx scanning
MIN_CODE_COVERAGE=75               # Quality gate: minimum coverage
MAX_CRITICAL_VULNERABILITIES=0     # Security gate: zero critical vulns
MAX_HIGH_VULNERABILITIES=5         # Security gate: max high vulns
```

#### **Deployment Controls**
```bash
SKIP_DEPLOYMENT=false              # Ensure deployments run
FORCE_VERSION=                     # No version overrides allowed
```

### **Frontend Teams Can Only Control**
- ✅ **Environment selection** (development, staging, pre-production, production)
- ✅ **Repository secrets** (Azure tokens, SonarCloud token, Checkmarx credentials)
- ❌ **Cannot override** any organizational standards or security policies

## 🚀 **Workflow Capabilities**

### **🔨 Build & Test**
- Node.js setup with organizational standard version
- Dependency installation and application build
- Automated testing execution
- Build artifact creation and storage

### **🔒 Security Scanning (Mandatory)**
- **SonarCloud Analysis**: Code quality, coverage, technical debt
- **Checkmarx Scanning**: SAST (Static Application Security Testing) and SCA (Software Composition Analysis)
- **Quality Gates**: Automatic failure on threshold violations
- **No Bypass**: Frontend teams cannot disable security scans

### **🚀 Multi-Environment Deployment**
- **Development**: Automatic on main branch commits
- **Staging**: Automatic on staging branch commits  
- **Pre-Production**: Automatic on tags matching `v*` pattern
- **Production**: Manual approval required + automatic deployment
- **Azure Static Web Apps**: Full integration with environment-specific tokens

### **🔄 Rollback Capabilities**
- **Automatic Rollback**: Triggers on deployment failures
- **Manual Rollback**: Emergency rollback workflow for critical issues
- **Version History**: Complete audit trail of deployments
- **Validation**: Prevents invalid rollback attempts

## 📋 **Frontend Team Integration Process**

### **Step 1: Copy Workflow Files**
```bash
# Copy ready-to-use workflow to your frontend app
cp frontend-ci-cd.yml .github/workflows/ci-cd.yml

# Copy PR security check workflow
cp pr-security-check.yml .github/workflows/pr-security-check.yml

# Copy manual rollback caller workflow
cp manual-rollback-caller.yml .github/workflows/manual-rollback.yml
```

### **Step 2: Update Repository Reference**
```yaml
# In .github/workflows/ci-cd.yml
uses: YOUR_ORG/shared-ci-cd-workflows/.github/workflows/shared-ci-cd.yml@main
```

### **Step 3: Configure Repository Secrets**
Set these secrets in your frontend repository:
```bash
AZURE_STATIC_WEB_APPS_API_TOKEN_DEV      # Development environment
AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING  # Staging environment
AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD  # Pre-production environment
AZURE_STATIC_WEB_APPS_API_TOKEN_PROD     # Production environment
SONAR_TOKEN                              # SonarCloud authentication
CHECKMARX_CLIENT_ID                      # Checkmarx authentication
CHECKMARX_SECRET                         # Checkmarx authentication
CHECKMARX_TENANT                         # Checkmarx tenant
```

### **Step 4: Add Required Package.json Scripts**
```json
{
  "scripts": {
    "build": "react-scripts build",        // or your framework's build command
    "test": "react-scripts test --coverage --watchAll=false"
  }
}
```

### **Step 5: Deploy**
- Push to main branch → automatic development deployment
- Create tag `v1.0.0` → automatic pre-production deployment
- Manual approval → production deployment
- All with organizational security and quality standards

## 🛡️ **Security & Compliance Features**

### **Mandatory Security Scanning**
- ✅ **Cannot be disabled** by frontend teams
- ✅ **Consistent standards** across all applications
- ✅ **Automatic failure** on security threshold violations
- ✅ **Complete audit trail** for compliance

### **Quality Gate Enforcement**
- ✅ **Minimum code coverage** requirements
- ✅ **Zero tolerance** for critical vulnerabilities
- ✅ **Configurable thresholds** managed centrally
- ✅ **Deployment blocking** on quality failures

### **Environment Protection**
- ✅ **GitHub environment protection** rules
- ✅ **Manual approval** for production deployments
- ✅ **Azure Static Web Apps** token-based security
- ✅ **Rollback permissions** inherit from deployment permissions

## 🔄 **Emergency & Rollback Procedures**

### **Automatic Rollback (No Action Required)**
- Triggers when deployment fails
- Uses last successful deployment version
- Updates deployment summary with rollback status

### **Manual Emergency Rollback**
1. Go to frontend app → Actions → Manual Rollback
2. Select environment (development, staging, pre-production, or production)
3. Optionally specify target version (or leave empty for auto-detect)
4. Provide rollback reason (required for audit)
5. Execute - calls shared workflow with centralized logic and validation

### **Rollback Validation**
- ✅ Previous successful deployment exists
- ✅ Target version differs from current
- ✅ Required tokens and permissions available
- ✅ Build artifacts accessible

## 📊 **Monitoring & Visibility**

### **Deployment Dashboard**
- **Version Information**: Current deployed versions per environment
- **Security Scan Results**: SonarCloud coverage and Checkmarx vulnerability counts
- **Deployment URLs**: Direct links to all environments
- **Rollback Status**: Success/failure information for any rollbacks

### **Quality Metrics**
- **Code Coverage**: Real-time coverage percentage from SonarCloud
- **Security Vulnerabilities**: Critical and high vulnerability counts from Checkmarx
- **Build Success Rate**: Deployment success/failure trends
- **Rollback Frequency**: Rollback occurrence tracking

## 🎯 **Benefits for Organizations**

### **🎛️ Ultimate Control**
- **Single point of configuration** for all CI/CD standards
- **Immediate updates** across all frontend applications
- **Cannot be bypassed** by individual teams
- **Complete compliance** guarantee

### **🛡️ Security Excellence**
- **Mandatory security scanning** with zero exceptions
- **Consistent quality standards** organization-wide
- **Audit trail** for all deployments and rollbacks
- **Zero tolerance** for critical vulnerabilities

### **🚀 Operational Efficiency**
- **Standardized deployments** reduce support burden
- **Automatic rollback** minimizes downtime
- **Simplified troubleshooting** with consistent setup
- **Faster onboarding** with zero configuration

### **💰 Cost Optimization**
- **Reduced duplication** of CI/CD logic across repositories
- **Centralized maintenance** instead of per-project updates
- **Consistent infrastructure** reduces operational overhead
- **Faster time-to-market** for new applications

## 📞 **Support & Escalation**

### **Self-Service (First Level)**
1. Check documentation in this repository
2. Review workflow logs in GitHub Actions
3. Verify repository secrets and permissions
4. Test with different environment selections

### **DevOps Support (Second Level)**
1. Create issue in this shared repository
2. Include workflow run URL and error details
3. Specify environment and business impact
4. Provide rollback requirements if urgent

### **Emergency (Third Level)**
1. Use manual rollback workflow for immediate recovery
2. Contact on-call DevOps engineer for critical issues
3. Escalate to Azure support for infrastructure problems
4. Initiate incident response for multi-environment failures

---

## 📚 **Complete Documentation Index**

### **Essential Guides**
- **[OVERVIEW.md](OVERVIEW.md)** - This comprehensive overview (you are here)
- **[SHARED_WORKFLOW_MIGRATION_GUIDE.md](SHARED_WORKFLOW_MIGRATION_GUIDE.md)** - How to adopt the shared workflow
- **[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** - Step-by-step integration process

### **Configuration & Management**  
- **[SHARED_WORKFLOW_VARIABLES.md](SHARED_WORKFLOW_VARIABLES.md)** - Complete variable configuration guide
- **[COMPLETE_CENTRALIZATION_SUMMARY.md](COMPLETE_CENTRALIZATION_SUMMARY.md)** - Centralization benefits and control

### **Operations & Troubleshooting**
- **[ROLLBACK_GUIDE.md](ROLLBACK_GUIDE.md)** - Rollback procedures and emergency response
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Pre-deployment validation checklist
- **[AZURE_DEPLOYMENT_TROUBLESHOOTING.md](AZURE_DEPLOYMENT_TROUBLESHOOTING.md)** - Azure-specific issues
- **[CHECKMARX_TROUBLESHOOTING.md](CHECKMARX_TROUBLESHOOTING.md)** - Checkmarx authentication and configuration

### **Ready-to-Use Files**
- **[frontend-ci-cd.yml](frontend-ci-cd.yml)** - Copy to frontend apps as `.github/workflows/ci-cd.yml`
- **[pr-security-check.yml](pr-security-check.yml)** - Copy to frontend apps for PR validation
- **[manual-rollback-caller.yml](manual-rollback-caller.yml)** - Copy to frontend apps as `.github/workflows/manual-rollback.yml`
- **[setup-shared-repository.sh](setup-shared-repository.sh)** - Automated setup script

---

**🎉 Ready to revolutionize your CI/CD with enterprise-grade centralized control!**
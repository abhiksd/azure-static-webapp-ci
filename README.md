# 🚀 Shared Frontend CI/CD Workflows

Enterprise-grade, centralized CI/CD solution for frontend applications with complete DevOps control, mandatory security scanning, and intelligent rollback capabilities.

> **📖 NEW USERS: Start with [OVERVIEW.md](OVERVIEW.md) for complete system documentation**

## 🎯 **What This Provides**

- 🛡️ **Complete centralized control** - DevOps controls everything via repository variables
- 🔒 **Mandatory security scanning** - No way to bypass SonarCloud or Checkmarx  
- 🚀 **Automatic deployment** to development, staging, pre-production, and production
- 🔄 **Intelligent rollback** - Automatic and manual rollback capabilities
- 📊 **Quality gates enforcement** - Consistent standards across all applications
- 🎛️ **Zero configuration** for frontend teams - just copy workflow and set secrets

## 📁 **Repository Structure**

```
├── .github/workflows/
│   ├── shared-ci-cd.yml              # Main reusable workflow
│   └── manual-rollback.yml           # Manual rollback workflow
├── .github/actions/                  # Composite actions
│   ├── sonar-analysis/               # SonarCloud scanning
│   ├── checkmarx-scan/               # Checkmarx security scanning
│   └── deploy-static-app/            # Azure Static Web Apps deployment
├── pr-security-check.yml            # PR security validation (copy to frontend apps)
├── frontend-ci-cd.yml               # Ready-to-use workflow (copy to frontend apps)
└── setup-shared-repository.sh       # Automated migration script
```

## ⚡ **Quick Start**

### **1. Copy Workflow to Frontend App**
```bash
# Copy ready-to-use workflow
cp frontend-ci-cd.yml .github/workflows/ci-cd.yml

# Copy PR security check
cp pr-security-check.yml .github/workflows/pr-security-check.yml
```

### **2. Update Repository Reference**
```yaml
# In .github/workflows/ci-cd.yml
uses: YOUR_ORG/shared-ci-cd-workflows/.github/workflows/shared-ci-cd.yml@main
```

### **3. Set Repository Secrets**
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

### **4. Deploy**
- Push to main → automatic development deployment
- Create tag `v1.0.0` → automatic pre-production deployment  
- Manual approval → production deployment
- All with organizational security and quality standards

## 🎛️ **Centralized Control** 

### **DevOps Controls Everything (Repository Variables)**
```bash
NODE_VERSION=18                    # Organizational standard
OUTPUT_LOCATION=build              # Framework-specific
BUILD_COMMAND=npm run build        # Standardized build
ENABLE_SONAR_SCAN=true             # Mandatory scanning
ENABLE_CHECKMARX_SCAN=true         # Mandatory security
MIN_CODE_COVERAGE=75               # Quality gates
MAX_CRITICAL_VULNERABILITIES=0     # Security gates
```

### **Frontend Teams Control Only**
- ✅ Environment selection (development, staging, pre-production, production)
- ✅ Repository secrets (Azure tokens, SonarCloud token, Checkmarx credentials)
- ❌ Cannot override any organizational standards or security policies

## 🔄 **Rollback Capabilities**

### **Automatic Rollback**
- Triggers on deployment failures
- Uses last successful deployment
- No manual intervention required

### **Manual Emergency Rollback**
1. Actions → Manual Rollback
2. Select environment  
3. Specify version (optional)
4. Provide reason
5. Execute with validation

## 📚 **Documentation Index**

### **🎯 Essential (Start Here)**
- **[📖 OVERVIEW.md](OVERVIEW.md)** - **Complete system overview and architecture**
- **[⚡ QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - **Quick reference for common tasks**
- **[🚀 SHARED_WORKFLOW_MIGRATION_GUIDE.md](SHARED_WORKFLOW_MIGRATION_GUIDE.md)** - How to adopt shared workflows
- **[⚙️ FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** - Step-by-step integration

### **🎛️ Configuration & Management**  
- **[🔧 SHARED_WORKFLOW_VARIABLES.md](SHARED_WORKFLOW_VARIABLES.md)** - Variable configuration guide
- **[🔒 COMPLETE_CENTRALIZATION_SUMMARY.md](COMPLETE_CENTRALIZATION_SUMMARY.md)** - Centralization benefits

### **🛠️ Operations & Troubleshooting**
- **[🔄 ROLLBACK_GUIDE.md](ROLLBACK_GUIDE.md)** - Rollback procedures and emergency response
- **[📋 DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Pre-deployment validation
- **[🌐 AZURE_DEPLOYMENT_TROUBLESHOOTING.md](AZURE_DEPLOYMENT_TROUBLESHOOTING.md)** - Azure issues
- **[🔐 CHECKMARX_TROUBLESHOOTING.md](CHECKMARX_TROUBLESHOOTING.md)** - Checkmarx authentication

## 🎯 **Benefits**

### **🎛️ Ultimate Control**
- Single point of configuration for all CI/CD standards
- Immediate updates across all frontend applications
- Cannot be bypassed by individual teams
- Complete compliance guarantee

### **🛡️ Security Excellence**
- Mandatory security scanning with zero exceptions
- Consistent quality standards organization-wide
- Audit trail for all deployments and rollbacks
- Zero tolerance for critical vulnerabilities

### **🚀 Operational Efficiency**
- Standardized deployments reduce support burden
- Automatic rollback minimizes downtime
- Simplified troubleshooting with consistent setup
- Faster onboarding with zero configuration

### **💰 Cost Optimization**
- Reduced duplication of CI/CD logic across repositories
- Centralized maintenance instead of per-project updates
- Consistent infrastructure reduces operational overhead
- Faster time-to-market for new applications

## 📞 **Support**

1. **Self-Service**: Check documentation and workflow logs
2. **DevOps Support**: Create issue in this repository with workflow details
3. **Emergency**: Use manual rollback workflow + contact on-call engineer

---

**🎉 Ready to revolutionize your CI/CD with enterprise-grade centralized control!**

For complete system documentation, **start with [OVERVIEW.md](OVERVIEW.md)**.
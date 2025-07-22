# ⚡ Quick Reference Guide

## 🚀 **New Frontend App Integration (5 Minutes)**

### **Step 1: Copy Files**
```bash
# Copy workflow files to your frontend app
cp frontend-ci-cd.yml .github/workflows/ci-cd.yml
cp pr-security-check.yml .github/workflows/pr-security-check.yml
```

### **Step 2: Update Repository Reference**
```yaml
# In .github/workflows/ci-cd.yml
uses: YOUR_ORG/shared-ci-cd-workflows/.github/workflows/shared-ci-cd.yml@main
```

### **Step 3: Set Secrets**
Go to your frontend repository → Settings → Secrets → Add these:
```
AZURE_STATIC_WEB_APPS_API_TOKEN_DEV
AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING  
AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD
AZURE_STATIC_WEB_APPS_API_TOKEN_PROD
SONAR_TOKEN
CHECKMARX_CLIENT_ID
CHECKMARX_SECRET
CHECKMARX_TENANT
```

### **Step 4: Deploy**
- Push to main → development deployment
- Create tag `v1.0.0` → pre-production deployment
- Manual approval → production deployment

---

## 🎛️ **DevOps Configuration (Centralized Control)**

### **Essential Repository Variables**
Set in shared repository → Settings → Variables:
```bash
# Core Build Configuration
NODE_VERSION=18
OUTPUT_LOCATION=build
BUILD_COMMAND=npm run build
INSTALL_COMMAND=npm ci

# Security & Quality (Mandatory)
ENABLE_SONAR_SCAN=true
ENABLE_CHECKMARX_SCAN=true
MIN_CODE_COVERAGE=75
MAX_CRITICAL_VULNERABILITIES=0
MAX_HIGH_VULNERABILITIES=5
```

### **Framework-Specific Configurations**
```bash
# React Apps
OUTPUT_LOCATION=build

# Vue/Vite Apps
OUTPUT_LOCATION=dist

# Angular Apps
OUTPUT_LOCATION=dist/app-name
BUILD_COMMAND=npm run build:prod
```

---

## 🔄 **Emergency Rollback (2 Minutes)**

### **Manual Rollback**
1. Go to shared repository → Actions → Manual Rollback
2. Select environment: `pre-production` or `production`
3. Target version: Leave empty for auto-detect or specify version
4. Reason: Required for audit (e.g., "Critical bug in payment flow")
5. Run workflow

### **Automatic Rollback**
- Happens automatically on deployment failures
- No action required
- Check deployment summary for rollback status

---

## 🔧 **Common Troubleshooting**

### **"Workflow not found"**
```bash
# Check repository reference
uses: YOUR_ORG/shared-ci-cd-workflows/.github/workflows/shared-ci-cd.yml@main
```

### **"Secrets not available"**
```bash
# Verify secrets in frontend repository Settings → Secrets
# Required: AZURE_*, SONAR_TOKEN, CHECKMARX_*
```

### **"Deployment failed"**
```bash
# Check Azure Static Web Apps tokens
# Verify build outputs in correct location
# Review deployment logs
```

### **"Security scan failed"**
```bash
# SonarCloud: Check SONAR_TOKEN and organization
# Checkmarx: Verify CHECKMARX_* credentials
# Review quality gate thresholds
```

---

## 📋 **Package.json Requirements**

### **Required Scripts**
```json
{
  "scripts": {
    "build": "react-scripts build",              // Framework build command
    "test": "react-scripts test --coverage --watchAll=false"
  }
}
```

### **Framework Examples**
```json
// React
"build": "react-scripts build"

// Vue
"build": "vue-cli-service build"

// Angular  
"build": "ng build --prod"

// Next.js
"build": "next build && next export"

// Vite
"build": "vite build"
```

---

## 📚 **Quick Documentation Access**

### **Essential Reading**
- **[OVERVIEW.md](OVERVIEW.md)** - Complete system overview (START HERE)
- **[FRONTEND_INTEGRATION_GUIDE.md](FRONTEND_INTEGRATION_GUIDE.md)** - Detailed integration steps
- **[ROLLBACK_GUIDE.md](ROLLBACK_GUIDE.md)** - Emergency procedures

### **Configuration**
- **[SHARED_WORKFLOW_VARIABLES.md](SHARED_WORKFLOW_VARIABLES.md)** - All variable options
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Pre-deployment validation

### **Troubleshooting**
- **[AZURE_DEPLOYMENT_TROUBLESHOOTING.md](AZURE_DEPLOYMENT_TROUBLESHOOTING.md)** - Azure issues
- **[CHECKMARX_TROUBLESHOOTING.md](CHECKMARX_TROUBLESHOOTING.md)** - Checkmarx authentication

---

## 🚨 **Emergency Contacts**

### **Support Escalation**
1. **Self-Service**: Check documentation and workflow logs
2. **DevOps Team**: Create issue with workflow run URL
3. **Emergency**: Use manual rollback + contact on-call engineer

### **Critical Issues**
- Use manual rollback workflow immediately
- Document issue for post-incident review
- Contact DevOps team with business impact details

---

## ✅ **What Frontend Teams Cannot Control**

- ❌ Security scan enable/disable
- ❌ Quality gate thresholds
- ❌ Build configuration (Node.js version, commands)
- ❌ Deployment process
- ❌ Organizational standards

## ✅ **What Frontend Teams Can Control**

- ✅ Environment selection for deployment
- ✅ Repository secrets (tokens and credentials)
- ✅ Package.json scripts and dependencies
- ✅ Application code and configuration

---

**Need more details? Start with [OVERVIEW.md](OVERVIEW.md) for complete documentation.**
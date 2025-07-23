# Environment-Level Secrets Migration Guide

## 🎯 Overview

This migration moves from **repository-level secrets** with environment-specific names to **environment-level secrets** with generic names. This provides better security isolation and makes adding new environments (like QA) much easier.

## 🔄 Migration Summary

### **Before** (Repository-level secrets):
```yaml
secrets:
  AZURE_STATIC_WEB_APPS_API_TOKEN_DEV: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_DEV }}
  AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING }}
  AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD }}
  AZURE_STATIC_WEB_APPS_API_TOKEN_PROD: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_PROD }}
```

### **After** (Environment-level secrets):
```yaml
secrets:
  AZURE_STATIC_WEB_APPS_API_TOKEN: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
```

## 📋 Required Setup Steps

### **Step 1: Create GitHub Environments**

In each frontend repository:

1. Go to **Settings** → **Environments**
2. Create the following environments:
   - `development`
   - `staging`
   - `qa` ⭐ **(NEW)**
   - `pre-production`
   - `production`

### **Step 2: Configure Environment-Level Secrets**

For **each environment**, add the secret:

| Environment | Secret Name | Secret Value |
|-------------|-------------|--------------|
| `development` | `AZURE_STATIC_WEB_APPS_API_TOKEN` | Your dev Azure token |
| `staging` | `AZURE_STATIC_WEB_APPS_API_TOKEN` | Your staging Azure token |
| `qa` | `AZURE_STATIC_WEB_APPS_API_TOKEN` | Your QA Azure token ⭐ |
| `pre-production` | `AZURE_STATIC_WEB_APPS_API_TOKEN` | Your preprod Azure token |
| `production` | `AZURE_STATIC_WEB_APPS_API_TOKEN` | Your prod Azure token |

### **Step 3: Update Frontend Repository Workflows**

Copy the updated workflow files from this repository to your frontend applications:

```bash
# Copy updated caller workflows to your frontend repo
cp frontend-ci-cd.yml .github/workflows/frontend-ci-cd.yml
cp manual-rollback-caller.yml .github/workflows/manual-rollback.yml
cp pr-security-check-caller.yml .github/workflows/pr-security-check.yml
```

### **Step 4: Remove Old Repository Secrets**

After confirming the new setup works, remove these repository-level secrets:

- ❌ `AZURE_STATIC_WEB_APPS_API_TOKEN_DEV`
- ❌ `AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING`
- ❌ `AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD`
- ❌ `AZURE_STATIC_WEB_APPS_API_TOKEN_PROD`

## 🆕 QA Environment Features

### **Automatic QA Deployment**
Push to `qa` branch triggers automatic QA deployment:
```bash
git checkout -b qa
git push origin qa
```

### **Manual QA Deployment**
Deploy any branch/tag to QA environment:
1. Go to **Actions** → **Frontend Application CI/CD**
2. Click **Run workflow**
3. Select:
   - **Branch**: Any branch or tag
   - **Environment**: `qa`

### **QA Rollback Support**
Rollback QA environment to any previous version:
1. Go to **Actions** → **Manual Rollback**
2. Select:
   - **Environment**: `qa`
   - **Target Version**: Any version/SHA
   - **Reason**: Your rollback reason

## ✅ Benefits

### **🔒 Enhanced Security**
- **Environment Isolation**: Secrets are scoped to specific environments
- **Principle of Least Privilege**: Each environment only has access to its own secrets
- **Audit Trail**: Clear environment-specific access logs

### **🚀 Operational Improvements**
- **Easier Environment Addition**: Adding new environments requires no code changes
- **Simplified Secret Management**: Same secret name across all environments
- **Better Environment Protection**: Can add approval rules per environment

### **🎯 QA Environment Benefits**
- **Dedicated QA Environment**: Isolated testing environment
- **Flexible QA Deployments**: Deploy any branch/version to QA
- **QA Branch Auto-deployment**: Push to `qa` branch auto-deploys
- **QA Rollback Capability**: Full rollback support for QA

## 🔍 How Environment Resolution Works

When a deployment job runs with `environment: qa`, GitHub automatically:

1. **Resolves Secrets**: `${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}` → QA environment's token
2. **Applies Environment Rules**: Any approval requirements for QA environment
3. **Provides Environment Context**: Job shows as deploying to "qa" environment
4. **Logs Environment Activity**: All activity logged under QA environment

## 🧪 Testing the Migration

### **Test 1: Manual QA Deployment**
```bash
# Test manual workflow dispatch to QA
Actions → Frontend Application CI/CD → Run workflow
Branch: main
Environment: qa
```

### **Test 2: QA Branch Auto-deployment**
```bash
# Test automatic QA deployment
git checkout -b qa
git push origin qa
```

### **Test 3: QA Rollback**
```bash
# Test QA rollback functionality
Actions → Manual Rollback
Environment: qa
Target Version: v1.0.0
Reason: Testing rollback functionality
```

## 🔧 Troubleshooting

### **Issue**: "Secret not found"
**Solution**: Ensure `AZURE_STATIC_WEB_APPS_API_TOKEN` is set in the target environment

### **Issue**: "Environment doesn't exist"
**Solution**: Create the environment in repository Settings → Environments

### **Issue**: "Invalid environment"
**Solution**: Use exact environment names: `development`, `staging`, `qa`, `pre-production`, `production`

## 📚 Updated Workflow Capabilities

### **Supported Environments**
- ✅ `development` - Auto-deploy on develop branch
- ✅ `staging` - Auto-deploy on staging branch  
- ✅ `qa` - Auto-deploy on qa branch ⭐ **(NEW)**
- ✅ `pre-production` - Auto-deploy on release tags
- ✅ `production` - Manual approval required

### **Manual Deployment Options**
- ✅ Deploy any branch/tag to any environment
- ✅ Manual rollback to any previous version
- ✅ PR security checks with environment context

### **Auto-deployment Triggers**
- ✅ `develop` branch → `development` environment
- ✅ `staging` branch → `staging` environment
- ✅ `qa` branch → `qa` environment ⭐ **(NEW)**
- ✅ `release/*` branches → `pre-production` environment
- ✅ `main` branch → `production` environment (with approval)

---

## 🎉 Migration Complete!

Your deployment system now supports:
- **Environment-level secret security**
- **QA environment for testing**
- **Flexible manual deployments**
- **Comprehensive rollback capabilities**
- **Simplified secret management**
# 🔄 Migration Guide: Service Principal to Managed Identity

This guide helps you migrate from Azure Service Principal authentication to Azure Managed Identity for enhanced security and simplified credential management.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Migration Steps](#migration-steps)
4. [Validation](#validation)
5. [Rollback Plan](#rollback-plan)
6. [Post-Migration Cleanup](#post-migration-cleanup)

## 🎯 Overview

### Benefits of Managed Identity

- ✅ **No Stored Credentials**: Eliminates the need to store service principal credentials in GitHub secrets
- ✅ **Automatic Rotation**: Azure automatically manages identity lifecycle
- ✅ **Improved Security**: Reduces credential exposure and theft risk
- ✅ **Simplified Management**: No manual credential rotation required
- ✅ **RBAC Integration**: Better integration with Azure RBAC

### Migration Impact

- **GitHub Secrets**: Service principal credentials can be removed
- **Key Vault Access**: Switches from Access Policies to RBAC
- **Workflows**: Minimal changes to GitHub Actions workflows
- **Downtime**: Zero downtime migration with proper planning

## 🔧 Prerequisites

Before starting the migration:

1. **GitHub Runners**: Must support managed identity (Azure-hosted or properly configured self-hosted)
2. **Permissions**: Azure subscription contributor or owner role
3. **Access**: GitHub repository admin access
4. **Tools**: Azure CLI and GitHub CLI installed

## 📝 Migration Steps

### Step 1: Backup Current Configuration

```bash
#!/bin/bash
# Create backup of current configuration

echo "🔄 Creating backup of current configuration..."

# Backup GitHub secrets
mkdir -p migration-backup
gh secret list --repo "$GITHUB_REPO" > migration-backup/github-secrets.txt

# Backup Key Vault access policies
for env in dev staging preprod prod; do
    KV_NAME="myapp-kv-${env}-eastus2"
    az keyvault show --name "$KV_NAME" --query "properties.accessPolicies" > "migration-backup/${env}-access-policies.json"
done

echo "✅ Backup completed"
```

### Step 2: Configure Managed Identity

```bash
#!/bin/bash
# Set up managed identity permissions

# Variables
PROJECT_NAME="myapp"
LOCATION_SHORT="eastus2"
GITHUB_REPO="username/repository-name"
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Get managed identity ID (this should work if runners are properly configured)
if ! az account show >/dev/null 2>&1; then
    echo "❌ Managed identity not configured on runners"
    echo "Please contact your infrastructure team to enable managed identity"
    exit 1
fi

MANAGED_IDENTITY_ID=$(az account show --query user.name -o tsv)
echo "✅ Managed Identity ID: $MANAGED_IDENTITY_ID"

# Grant RBAC permissions for each environment
for env in dev staging preprod prod; do
    KV_NAME="${PROJECT_NAME}-kv-${env}-${LOCATION_SHORT}"
    RG_NAME="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
    
    echo "🔧 Configuring permissions for $KV_NAME..."
    
    # Enable RBAC authorization on Key Vault
    az keyvault update \
        --name "$KV_NAME" \
        --enable-rbac-authorization true
    
    # Grant Key Vault Secrets User role
    az role assignment create \
        --assignee "$MANAGED_IDENTITY_ID" \
        --role "Key Vault Secrets User" \
        --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RG_NAME/providers/Microsoft.KeyVault/vaults/$KV_NAME"
    
    echo "✅ Permissions configured for $KV_NAME"
done
```

### Step 3: Update GitHub Repository Configuration

```bash
#!/bin/bash
# Update GitHub repository variables

echo "🔧 Updating GitHub repository configuration..."

# Convert secrets to variables (Key Vault names are not sensitive)
for env in dev staging preprod prod; do
    KV_NAME="${PROJECT_NAME}-kv-${env}-${LOCATION_SHORT}"
    
    case "$env" in
        "dev") VAR_NAME="AZURE_KEYVAULT_NAME_DEV" ;;
        "staging") VAR_NAME="AZURE_KEYVAULT_NAME_STAGING" ;;
        "preprod") VAR_NAME="AZURE_KEYVAULT_NAME_PREPROD" ;;
        "prod") VAR_NAME="AZURE_KEYVAULT_NAME_PROD" ;;
    esac
    
    # Set as repository variable
    gh variable set "$VAR_NAME" --body "$KV_NAME" --repo "$GITHUB_REPO"
    echo "✅ Set variable: $VAR_NAME"
done

echo "✅ GitHub configuration updated"
```

### Step 4: Update GitHub Actions Workflows

Create a backup of your workflows and update them to use managed identity:

```bash
# Backup current workflows
cp -r .github/workflows migration-backup/workflows-backup

# The workflows are already updated in this repository
# Key changes:
# 1. Removed azure/login action steps
# 2. Updated azure-keyvault action to use managed identity
# 3. Changed secrets to variables for Key Vault names
```

### Step 5: Test the Migration

```bash
#!/bin/bash
# Test managed identity authentication

echo "🧪 Testing managed identity configuration..."

# Test Azure CLI authentication
if az account show >/dev/null 2>&1; then
    echo "✅ Azure CLI authenticated with managed identity"
else
    echo "❌ Azure CLI authentication failed"
    exit 1
fi

# Test Key Vault access for each environment
for env in dev staging preprod prod; do
    KV_NAME="${PROJECT_NAME}-kv-${env}-${LOCATION_SHORT}"
    
    echo "🔍 Testing access to $KV_NAME..."
    
    if az keyvault secret list --vault-name "$KV_NAME" --query "length(@)" -o tsv >/dev/null 2>&1; then
        SECRET_COUNT=$(az keyvault secret list --vault-name "$KV_NAME" --query "length(@)" -o tsv)
        echo "✅ Access verified for $KV_NAME ($SECRET_COUNT secrets)"
    else
        echo "❌ Cannot access $KV_NAME"
        echo "Check RBAC permissions and Key Vault configuration"
    fi
done

echo "✅ Testing completed"
```

## ✅ Validation

### Validate GitHub Actions

Run a test deployment to ensure the workflows work correctly:

```bash
# Trigger a workflow run
gh workflow run "Enhanced CI/CD Pipeline" --repo "$GITHUB_REPO"

# Check the run status
gh run list --repo "$GITHUB_REPO" --limit 1
```

### Validate Key Vault Access

```bash
# Test secret retrieval
for env in dev staging preprod prod; do
    KV_NAME="${PROJECT_NAME}-kv-${env}-${LOCATION_SHORT}"
    
    echo "Testing secret retrieval from $KV_NAME..."
    az keyvault secret show --vault-name "$KV_NAME" --name "API-Key" --query "value" -o tsv
done
```

### Validate RBAC Permissions

```bash
# Check role assignments
MANAGED_IDENTITY_ID=$(az account show --query user.name -o tsv)

for env in dev staging preprod prod; do
    KV_NAME="${PROJECT_NAME}-kv-${env}-${LOCATION_SHORT}"
    RG_NAME="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
    
    echo "Checking role assignments for $KV_NAME..."
    az role assignment list \
        --assignee "$MANAGED_IDENTITY_ID" \
        --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RG_NAME/providers/Microsoft.KeyVault/vaults/$KV_NAME" \
        --query "[].{Role:roleDefinitionName,Scope:scope}" -o table
done
```

## 🔙 Rollback Plan

If issues occur during migration, follow this rollback procedure:

### Step 1: Restore Access Policies

```bash
#!/bin/bash
# Restore original access policies

echo "🔄 Rolling back to service principal authentication..."

for env in dev staging preprod prod; do
    KV_NAME="myapp-kv-${env}-eastus2"
    
    # Disable RBAC and restore access policies
    az keyvault update \
        --name "$KV_NAME" \
        --enable-rbac-authorization false
    
    # Restore access policies from backup
    if [ -f "migration-backup/${env}-access-policies.json" ]; then
        echo "Restoring access policies for $KV_NAME..."
        # You'll need to manually restore access policies from the backup
        echo "⚠️ Manually restore access policies from migration-backup/${env}-access-policies.json"
    fi
done
```

### Step 2: Restore GitHub Secrets

```bash
# Restore service principal credentials (you'll need to recreate these)
echo "⚠️ Manually restore AZURE_CREDENTIALS secrets for each environment"
echo "Refer to migration-backup/github-secrets.txt for the secret names"
```

### Step 3: Restore Workflows

```bash
# Restore original workflows
cp -r migration-backup/workflows-backup/* .github/workflows/
```

## 🧹 Post-Migration Cleanup

After successful migration and validation:

### Remove Unused GitHub Secrets

```bash
#!/bin/bash
# Remove service principal credentials

echo "🧹 Cleaning up unused GitHub secrets..."

# List of secrets to remove (service principal credentials)
SECRETS_TO_REMOVE=(
    "AZURE_CREDENTIALS_DEV"
    "AZURE_CREDENTIALS_STAGING"
    "AZURE_CREDENTIALS_PROD"
)

for secret in "${SECRETS_TO_REMOVE[@]}"; do
    if gh secret list --repo "$GITHUB_REPO" --json name -q '.[].name' | grep -q "$secret"; then
        gh secret delete "$secret" --repo "$GITHUB_REPO"
        echo "✅ Removed secret: $secret"
    else
        echo "ℹ️ Secret not found: $secret"
    fi
done
```

### Disable Service Principal (Optional)

```bash
# If the service principal is no longer needed anywhere
SP_APP_ID="your-service-principal-app-id"

echo "⚠️ WARNING: This will disable the service principal completely"
read -p "Are you sure you want to disable service principal $SP_APP_ID? (y/N): " confirm

if [[ $confirm == [yY] ]]; then
    az ad sp update --id "$SP_APP_ID" --set "accountEnabled=false"
    echo "✅ Service principal disabled"
else
    echo "ℹ️ Service principal left active"
fi
```

### Remove RBAC Role Assignments from Service Principal

```bash
# Remove role assignments from the old service principal
SP_OBJECT_ID="your-service-principal-object-id"

for env in dev staging preprod prod; do
    KV_NAME="${PROJECT_NAME}-kv-${env}-${LOCATION_SHORT}"
    RG_NAME="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
    
    # Remove role assignments
    az role assignment delete \
        --assignee "$SP_OBJECT_ID" \
        --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RG_NAME/providers/Microsoft.KeyVault/vaults/$KV_NAME" \
        2>/dev/null || echo "ℹ️ No role assignments found for $KV_NAME"
done
```

## 📊 Migration Checklist

- [ ] Backup current configuration
- [ ] Verify managed identity is available on runners
- [ ] Configure RBAC permissions for Key Vaults
- [ ] Enable RBAC authorization on Key Vaults
- [ ] Update GitHub repository variables
- [ ] Update GitHub Actions workflows
- [ ] Test managed identity authentication
- [ ] Validate Key Vault access
- [ ] Run test deployments
- [ ] Monitor for issues
- [ ] Remove unused GitHub secrets
- [ ] Disable old service principal (optional)
- [ ] Document the migration

## 🚨 Common Issues and Solutions

### Issue: "Access denied" after migration

**Solution:**
```bash
# Check RBAC permissions
az role assignment list --assignee $(az account show --query user.name -o tsv)

# Ensure Key Vault has RBAC enabled
az keyvault show --name "myapp-kv-prod-eastus2" --query "properties.enableRbacAuthorization"
```

### Issue: "Azure CLI is not authenticated"

**Solution:**
```bash
# This indicates managed identity is not configured on the runner
# Contact your infrastructure team to enable managed identity
echo "Runner needs managed identity configuration at the infrastructure level"
```

### Issue: Secrets not found

**Solution:**
```bash
# Verify secrets exist in Key Vault
az keyvault secret list --vault-name "myapp-kv-prod-eastus2"

# Check secret permissions
az role assignment list --scope "/subscriptions/{sub-id}/resourceGroups/{rg}/providers/Microsoft.KeyVault/vaults/{kv-name}"
```

## 📚 Additional Resources

- [Azure Managed Identity Documentation](https://docs.microsoft.com/en-us/azure/active-directory/managed-identities-azure-resources/)
- [Key Vault RBAC Guide](https://docs.microsoft.com/en-us/azure/key-vault/general/rbac-guide)
- [GitHub Actions Azure Integration](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/configuring-openid-connect-in-azure)

---

**Need Help?**
If you encounter issues during migration, refer to the [Troubleshooting Guide](07-TROUBLESHOOTING.md) or contact your Azure administrator.
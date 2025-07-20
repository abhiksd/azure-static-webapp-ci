# 🏗️ Azure Infrastructure Setup Guide

This guide provides step-by-step instructions for creating Azure infrastructure for multi-environment Azure Static Web Apps deployment.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Planning](#environment-planning)
4. [Azure Resource Creation](#azure-resource-creation)
5. [DNS Configuration](#dns-configuration)
6. [Networking Setup](#networking-setup)
7. [Resource Tagging](#resource-tagging)
8. [Verification](#verification)

## 🎯 Overview

This setup creates a complete multi-environment infrastructure supporting:

- **4 Environments**: Development, Staging, Pre-Production, Production
- **Azure Static Web Apps** with custom domains
- **Azure Key Vault** for secret management
- **Application Insights** for monitoring
- **DNS zones** for custom domains
- **Resource groups** for organization

## 📋 Prerequisites

Before starting, ensure you have:

- **Azure Subscription** with Contributor access
- **Azure CLI** installed and logged in
- **Custom Domain** (optional but recommended)
- **GitHub Account** with repository access
- **PowerShell** or **Bash** terminal

### Install Required Tools

```bash
# Install Azure CLI (if not already installed)
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login to Azure
az login

# Set your subscription
az account set --subscription "your-subscription-id"

# Install GitHub CLI (optional but helpful)
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

## 🗺️ Environment Planning

### Environment Structure

| Environment | Purpose | Domain | Resource Suffix |
|------------|---------|---------|-----------------|
| **Development** | Feature development and testing | `dev.yourdomain.com` | `-dev` |
| **Staging** | Integration testing and UAT | `staging.yourdomain.com` | `-staging` |
| **Pre-Production** | Production-like testing | `preprod.yourdomain.com` | `-preprod` |
| **Production** | Live application | `yourdomain.com` | `-prod` |

### Resource Naming Convention

```
Format: {project}-{resource}-{environment}-{region}
Example: myapp-swa-dev-eastus2
```

## 🏗️ Azure Resource Creation

### Step 1: Set Environment Variables

```bash
# Project Configuration
PROJECT_NAME="myapp"
LOCATION="East US 2"
GITHUB_REPO="username/repository-name"
DOMAIN_NAME="yourdomain.com"  # Optional

# Generated Variables
LOCATION_SHORT="eastus2"
DATE_SUFFIX=$(date +%Y%m%d)
```

### Step 2: Create Resource Groups

```bash
# Create resource groups for each environment
environments=("dev" "staging" "preprod" "prod")

for env in "${environments[@]}"; do
    RG_NAME="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
    
    echo "Creating resource group: $RG_NAME"
    az group create \
        --name "$RG_NAME" \
        --location "$LOCATION" \
        --tags \
            Environment="$env" \
            Project="$PROJECT_NAME" \
            CreatedDate="$(date -u +%Y-%m-%d)" \
            ManagedBy="Azure-CLI"
            
    echo "✅ Resource group $RG_NAME created"
done
```

### Step 3: Create Azure Key Vaults

```bash
# Create Key Vaults for each environment
for env in "${environments[@]}"; do
    RG_NAME="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
    KV_NAME="${PROJECT_NAME}-kv-${env}-${LOCATION_SHORT}"
    
    echo "Creating Key Vault: $KV_NAME"
    az keyvault create \
        --name "$KV_NAME" \
        --resource-group "$RG_NAME" \
        --location "$LOCATION" \
        --sku Standard \
        --enabled-for-deployment true \
        --enabled-for-disk-encryption true \
        --enabled-for-template-deployment true \
        --tags \
            Environment="$env" \
            Project="$PROJECT_NAME" \
            CreatedDate="$(date -u +%Y-%m-%d)"
    
    echo "✅ Key Vault $KV_NAME created"
done
```

### Step 4: Create Application Insights

```bash
# Create Application Insights for monitoring
for env in "${environments[@]}"; do
    RG_NAME="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
    AI_NAME="${PROJECT_NAME}-ai-${env}-${LOCATION_SHORT}"
    
    echo "Creating Application Insights: $AI_NAME"
    az monitor app-insights component create \
        --app "$AI_NAME" \
        --location "$LOCATION" \
        --resource-group "$RG_NAME" \
        --kind "web" \
        --application-type "web" \
        --tags \
            Environment="$env" \
            Project="$PROJECT_NAME" \
            CreatedDate="$(date -u +%Y-%m-%d)"
    
    # Get the instrumentation key
    INSTRUMENTATION_KEY=$(az monitor app-insights component show \
        --app "$AI_NAME" \
        --resource-group "$RG_NAME" \
        --query "instrumentationKey" \
        --output tsv)
    
    # Store in Key Vault
    KV_NAME="${PROJECT_NAME}-kv-${env}-${LOCATION_SHORT}"
    az keyvault secret set \
        --vault-name "$KV_NAME" \
        --name "ApplicationInsights-InstrumentationKey" \
        --value "$INSTRUMENTATION_KEY"
    
    echo "✅ Application Insights $AI_NAME created and key stored in Key Vault"
done
```

### Step 5: Create Azure Static Web Apps

```bash
# Create Static Web Apps for each environment
for env in "${environments[@]}"; do
    RG_NAME="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
    SWA_NAME="${PROJECT_NAME}-swa-${env}-${LOCATION_SHORT}"
    
    echo "Creating Static Web App: $SWA_NAME"
    az staticwebapp create \
        --name "$SWA_NAME" \
        --resource-group "$RG_NAME" \
        --source "https://github.com/${GITHUB_REPO}" \
        --location "$LOCATION" \
        --branch "$env" \
        --app-location "." \
        --build-location "build" \
        --login-with-github \
        --tags \
            Environment="$env" \
            Project="$PROJECT_NAME" \
            CreatedDate="$(date -u +%Y-%m-%d)"
    
    # Get deployment token for GitHub Actions
    DEPLOYMENT_TOKEN=$(az staticwebapp secrets list \
        --name "$SWA_NAME" \
        --resource-group "$RG_NAME" \
        --query "properties.apiKey" \
        --output tsv)
    
    # Store deployment token in Key Vault
    KV_NAME="${PROJECT_NAME}-kv-${env}-${LOCATION_SHORT}"
    az keyvault secret set \
        --vault-name "$KV_NAME" \
        --name "StaticWebApp-DeploymentToken" \
        --value "$DEPLOYMENT_TOKEN"
    
    echo "✅ Static Web App $SWA_NAME created and token stored in Key Vault"
done
```

### Step 6: Configure Custom Domains (Optional)

```bash
# Create DNS Zone (only once for the domain)
if [ ! -z "$DOMAIN_NAME" ]; then
    MAIN_RG="${PROJECT_NAME}-rg-prod-${LOCATION_SHORT}"
    DNS_ZONE_NAME="$DOMAIN_NAME"
    
    echo "Creating DNS Zone: $DNS_ZONE_NAME"
    az network dns zone create \
        --resource-group "$MAIN_RG" \
        --name "$DNS_ZONE_NAME" \
        --tags \
            Project="$PROJECT_NAME" \
            CreatedDate="$(date -u +%Y-%m-%d)"
    
    # Get name servers
    echo "📋 DNS Name Servers (configure these with your domain registrar):"
    az network dns zone show \
        --resource-group "$MAIN_RG" \
        --name "$DNS_ZONE_NAME" \
        --query "nameServers" \
        --output table
    
    # Configure custom domains for each environment
    declare -A domain_mapping=(
        ["dev"]="dev.$DOMAIN_NAME"
        ["staging"]="staging.$DOMAIN_NAME"
        ["preprod"]="preprod.$DOMAIN_NAME"
        ["prod"]="$DOMAIN_NAME"
    )
    
    for env in "${environments[@]}"; do
        RG_NAME="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
        SWA_NAME="${PROJECT_NAME}-swa-${env}-${LOCATION_SHORT}"
        CUSTOM_DOMAIN="${domain_mapping[$env]}"
        
        echo "Configuring custom domain $CUSTOM_DOMAIN for $SWA_NAME"
        
        # Add custom domain to Static Web App
        az staticwebapp hostname set \
            --name "$SWA_NAME" \
            --resource-group "$RG_NAME" \
            --hostname "$CUSTOM_DOMAIN"
        
        # Create DNS CNAME record
        if [ "$env" = "prod" ]; then
            # For root domain, create ALIAS record
            DEFAULT_DOMAIN=$(az staticwebapp show \
                --name "$SWA_NAME" \
                --resource-group "$RG_NAME" \
                --query "defaultHostname" \
                --output tsv)
            
            az network dns record-set cname set-record \
                --resource-group "$MAIN_RG" \
                --zone-name "$DNS_ZONE_NAME" \
                --record-set-name "@" \
                --cname "$DEFAULT_DOMAIN"
        else
            # For subdomains, create CNAME record
            DEFAULT_DOMAIN=$(az staticwebapp show \
                --name "$SWA_NAME" \
                --resource-group "$RG_NAME" \
                --query "defaultHostname" \
                --output tsv)
            
            SUBDOMAIN="${domain_mapping[$env]%.*.$DOMAIN_NAME}"
            az network dns record-set cname set-record \
                --resource-group "$MAIN_RG" \
                --zone-name "$DNS_ZONE_NAME" \
                --record-set-name "$SUBDOMAIN" \
                --cname "$DEFAULT_DOMAIN"
        fi
        
        echo "✅ Custom domain $CUSTOM_DOMAIN configured for $SWA_NAME"
    done
fi
```

### Step 7: Create Storage Accounts (for additional assets)

```bash
# Create storage accounts for each environment
for env in "${environments[@]}"; do
    RG_NAME="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
    # Storage account names must be lowercase and unique
    STORAGE_NAME="${PROJECT_NAME}st${env}${LOCATION_SHORT}"
    
    echo "Creating Storage Account: $STORAGE_NAME"
    az storage account create \
        --name "$STORAGE_NAME" \
        --resource-group "$RG_NAME" \
        --location "$LOCATION" \
        --sku "Standard_LRS" \
        --kind "StorageV2" \
        --access-tier "Hot" \
        --allow-blob-public-access false \
        --tags \
            Environment="$env" \
            Project="$PROJECT_NAME" \
            CreatedDate="$(date -u +%Y-%m-%d)"
    
    # Get storage connection string
    CONN_STRING=$(az storage account show-connection-string \
        --name "$STORAGE_NAME" \
        --resource-group "$RG_NAME" \
        --query "connectionString" \
        --output tsv)
    
    # Store in Key Vault
    KV_NAME="${PROJECT_NAME}-kv-${env}-${LOCATION_SHORT}"
    az keyvault secret set \
        --vault-name "$KV_NAME" \
        --name "Storage-ConnectionString" \
        --value "$CONN_STRING"
    
    echo "✅ Storage Account $STORAGE_NAME created and connection string stored"
done
```

## 🔧 Resource Tagging Strategy

Apply consistent tags across all resources:

```bash
# Standard tags for all resources
STANDARD_TAGS=(
    "Project=$PROJECT_NAME"
    "Environment=$env"
    "CreatedDate=$(date -u +%Y-%m-%d)"
    "ManagedBy=Azure-CLI"
    "CostCenter=IT"
    "Owner=DevOps-Team"
)

# Apply tags to all resources in resource group
for env in "${environments[@]}"; do
    RG_NAME="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
    
    # Get all resources in the resource group
    RESOURCE_IDS=$(az resource list \
        --resource-group "$RG_NAME" \
        --query "[].id" \
        --output tsv)
    
    # Apply tags to each resource
    for RESOURCE_ID in $RESOURCE_IDS; do
        az resource update \
            --ids "$RESOURCE_ID" \
            --set tags.Project="$PROJECT_NAME" \
            --set tags.Environment="$env" \
            --set tags.CreatedDate="$(date -u +%Y-%m-%d)" \
            --set tags.ManagedBy="Azure-CLI"
    done
    
    echo "✅ Tags applied to all resources in $RG_NAME"
done
```

## 🔍 Verification

### Step 1: Verify Resource Creation

```bash
# Check all resource groups
echo "📋 Created Resource Groups:"
az group list \
    --tag Project="$PROJECT_NAME" \
    --query "[].{Name:name, Location:location, Environment:tags.Environment}" \
    --output table

# Check Static Web Apps
echo "📋 Created Static Web Apps:"
for env in "${environments[@]}"; do
    RG_NAME="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
    SWA_NAME="${PROJECT_NAME}-swa-${env}-${LOCATION_SHORT}"
    
    DEFAULT_DOMAIN=$(az staticwebapp show \
        --name "$SWA_NAME" \
        --resource-group "$RG_NAME" \
        --query "defaultHostname" \
        --output tsv)
    
    echo "$env: https://$DEFAULT_DOMAIN"
done
```

### Step 2: Test Connectivity

```bash
# Test each Static Web App
for env in "${environments[@]}"; do
    RG_NAME="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
    SWA_NAME="${PROJECT_NAME}-swa-${env}-${LOCATION_SHORT}"
    
    DEFAULT_DOMAIN=$(az staticwebapp show \
        --name "$SWA_NAME" \
        --resource-group "$RG_NAME" \
        --query "defaultHostname" \
        --output tsv)
    
    echo "Testing $env environment: https://$DEFAULT_DOMAIN"
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEFAULT_DOMAIN")
    
    if [ "$HTTP_STATUS" = "200" ] || [ "$HTTP_STATUS" = "404" ]; then
        echo "✅ $env environment is accessible"
    else
        echo "❌ $env environment returned HTTP $HTTP_STATUS"
    fi
done
```

### Step 3: Export Configuration

```bash
# Create configuration file for GitHub Actions
cat > infrastructure-config.json << EOF
{
  "project": "$PROJECT_NAME",
  "location": "$LOCATION",
  "environments": {
EOF

for i, env in "${!environments[@]}"; do
    RG_NAME="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
    SWA_NAME="${PROJECT_NAME}-swa-${env}-${LOCATION_SHORT}"
    KV_NAME="${PROJECT_NAME}-kv-${env}-${LOCATION_SHORT}"
    
    DEFAULT_DOMAIN=$(az staticwebapp show \
        --name "$SWA_NAME" \
        --resource-group "$RG_NAME" \
        --query "defaultHostname" \
        --output tsv)
    
    cat >> infrastructure-config.json << EOF
    "$env": {
      "resourceGroup": "$RG_NAME",
      "staticWebApp": "$SWA_NAME",
      "keyVault": "$KV_NAME",
      "defaultDomain": "$DEFAULT_DOMAIN"
    }$([ $i -eq $((${#environments[@]}-1)) ] && echo "" || echo ",")
EOF
done

cat >> infrastructure-config.json << EOF
  }
}
EOF

echo "✅ Configuration exported to infrastructure-config.json"
```

## 🧹 Cleanup (if needed)

```bash
# Delete all resources (use with caution!)
read -p "⚠️  Are you sure you want to delete all resources? (yes/no): " confirm
if [ "$confirm" = "yes" ]; then
    for env in "${environments[@]}"; do
        RG_NAME="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
        echo "Deleting resource group: $RG_NAME"
        az group delete --name "$RG_NAME" --yes --no-wait
    done
    echo "🗑️ Deletion initiated for all resource groups"
else
    echo "Cleanup cancelled"
fi
```

## 📝 Next Steps

After completing the infrastructure setup:

1. **[Configure Environment Variables](./03-ENVIRONMENT-CONFIGURATION.md)** - Set up environment-specific configurations
2. **[Set up Azure Key Vault Integration](./04-AZURE-KEYVAULT-INTEGRATION.md)** - Configure secret management
3. **[Deploy Applications](./02-DEPLOYMENT-GUIDE.md)** - Deploy your applications to each environment
4. **[Set up Monitoring](./05-MONITORING-GUIDE.md)** - Configure health checks and monitoring

## 🔗 Related Documentation

- [Environment Configuration Guide](./03-ENVIRONMENT-CONFIGURATION.md)
- [Azure Key Vault Integration](./04-AZURE-KEYVAULT-INTEGRATION.md)
- [Deployment Guide](./02-DEPLOYMENT-GUIDE.md)
- [Troubleshooting Guide](./07-TROUBLESHOOTING.md)

---

**Last Updated:** December 2024  
**Version:** 1.0.0
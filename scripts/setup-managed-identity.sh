#!/bin/bash

# Azure Managed Identity Setup Script for GitHub Actions
# This script helps configure Azure managed identity for GitHub Actions runners

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if Azure CLI is installed
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if GitHub CLI is installed
    if ! command -v gh &> /dev/null; then
        log_error "GitHub CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        log_error "jq is not installed. Please install it first."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Function to verify Azure authentication
verify_azure_auth() {
    log_info "Verifying Azure CLI authentication..."
    
    if ! az account show >/dev/null 2>&1; then
        log_error "Azure CLI is not authenticated. Please run 'az login' first."
        exit 1
    fi
    
    SUBSCRIPTION_ID=$(az account show --query id -o tsv)
    SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
    
    log_success "Authenticated to Azure subscription: $SUBSCRIPTION_NAME (${SUBSCRIPTION_ID:0:8}****)"
}

# Function to get user input
get_user_input() {
    echo
    log_info "Please provide the following information:"
    
    read -p "Project name (e.g., myapp): " PROJECT_NAME
    read -p "Azure location (e.g., East US 2): " LOCATION
    read -p "Location short code (e.g., eastus2): " LOCATION_SHORT
    read -p "GitHub repository (owner/repo): " GITHUB_REPO
    
    # Validate inputs
    if [[ -z "$PROJECT_NAME" || -z "$LOCATION" || -z "$LOCATION_SHORT" || -z "$GITHUB_REPO" ]]; then
        log_error "All fields are required"
        exit 1
    fi
    
    log_success "Configuration collected"
}

# Function to create or verify Key Vaults
setup_key_vaults() {
    log_info "Setting up Azure Key Vaults..."
    
    local environments=("dev" "staging" "preprod" "prod")
    
    for env in "${environments[@]}"; do
        local rg_name="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
        local kv_name="${PROJECT_NAME}-kv-${env}-${LOCATION_SHORT}"
        
        log_info "Processing Key Vault: $kv_name"
        
        # Check if resource group exists
        if ! az group show --name "$rg_name" >/dev/null 2>&1; then
            log_warning "Resource group $rg_name does not exist. Creating..."
            az group create --name "$rg_name" --location "$LOCATION"
            log_success "Created resource group: $rg_name"
        fi
        
        # Check if Key Vault exists
        if ! az keyvault show --name "$kv_name" >/dev/null 2>&1; then
            log_warning "Key Vault $kv_name does not exist. Creating..."
            az keyvault create \
                --name "$kv_name" \
                --resource-group "$rg_name" \
                --location "$LOCATION" \
                --sku Standard \
                --enabled-for-deployment true \
                --enabled-for-disk-encryption true \
                --enabled-for-template-deployment true \
                --enable-soft-delete true \
                --soft-delete-retention-days 90 \
                --enable-purge-protection true \
                --enable-rbac-authorization true \
                --tags \
                    Environment="$env" \
                    Project="$PROJECT_NAME" \
                    CreatedDate="$(date -u +%Y-%m-%d)" \
                    Purpose="Secret Management"
            
            log_success "Created Key Vault: $kv_name"
        else
            log_success "Key Vault already exists: $kv_name"
        fi
        
        # Store Key Vault info for later use
        echo "$env:$kv_name" >> /tmp/keyvaults.txt
    done
}

# Function to configure RBAC permissions
setup_rbac_permissions() {
    log_info "Setting up RBAC permissions for managed identity..."
    
    # Get current user for admin access
    local current_user_id=$(az ad signed-in-user show --query id -o tsv)
    local subscription_id=$(az account show --query id -o tsv)
    
    while IFS=':' read -r env kv_name; do
        local rg_name="${PROJECT_NAME}-rg-${env}-${LOCATION_SHORT}"
        local kv_scope="/subscriptions/$subscription_id/resourceGroups/$rg_name/providers/Microsoft.KeyVault/vaults/$kv_name"
        
        log_info "Setting up permissions for $kv_name..."
        
        # Grant current user Key Vault Administrator role
        az role assignment create \
            --assignee "$current_user_id" \
            --role "Key Vault Administrator" \
            --scope "$kv_scope" \
            >/dev/null 2>&1 || log_warning "Role assignment may already exist for user"
        
        log_success "RBAC configured for $kv_name"
    done < /tmp/keyvaults.txt
}

# Function to create sample secrets
create_sample_secrets() {
    log_info "Creating sample secrets in Key Vaults..."
    
    while IFS=':' read -r env kv_name; do
        log_info "Adding sample secrets to $kv_name..."
        
        # Create environment-specific sample secrets
        az keyvault secret set --vault-name "$kv_name" --name "API-Key" --value "${env}-api-key-$(date +%s)" >/dev/null
        az keyvault secret set --vault-name "$kv_name" --name "Database-ConnectionString" --value "Server=${env}-db;Database=${PROJECT_NAME};Trusted_Connection=yes;" >/dev/null
        az keyvault secret set --vault-name "$kv_name" --name "Storage-ConnectionString" --value "DefaultEndpointsProtocol=https;AccountName=${env}storage;AccountKey=$(openssl rand -base64 32);" >/dev/null
        az keyvault secret set --vault-name "$kv_name" --name "ApplicationInsights-InstrumentationKey" --value "$(uuidgen)" >/dev/null
        az keyvault secret set --vault-name "$kv_name" --name "JWT-Secret" --value "$(openssl rand -base64 64)" >/dev/null
        
        log_success "Sample secrets created for $kv_name"
    done < /tmp/keyvaults.txt
}

# Function to configure GitHub repository variables
setup_github_variables() {
    log_info "Setting up GitHub repository variables..."
    
    # Check if authenticated to GitHub
    if ! gh auth status >/dev/null 2>&1; then
        log_error "GitHub CLI is not authenticated. Please run 'gh auth login' first."
        exit 1
    fi
    
    # Set Key Vault names as repository variables
    while IFS=':' read -r env kv_name; do
        local var_name
        case "$env" in
            "dev") var_name="AZURE_KEYVAULT_NAME_DEV" ;;
            "staging") var_name="AZURE_KEYVAULT_NAME_STAGING" ;;
            "preprod") var_name="AZURE_KEYVAULT_NAME_PREPROD" ;;
            "prod") var_name="AZURE_KEYVAULT_NAME_PROD" ;;
        esac
        
        log_info "Setting GitHub variable: $var_name"
        gh variable set "$var_name" --body "$kv_name" --repo "$GITHUB_REPO"
        log_success "Set variable: $var_name = $kv_name"
    done < /tmp/keyvaults.txt
}

# Function to verify setup
verify_setup() {
    log_info "Verifying setup..."
    
    # Test Key Vault access
    while IFS=':' read -r env kv_name; do
        log_info "Testing access to $kv_name..."
        
        if az keyvault secret list --vault-name "$kv_name" --query "length(@)" -o tsv >/dev/null 2>&1; then
            local secret_count=$(az keyvault secret list --vault-name "$kv_name" --query "length(@)" -o tsv)
            log_success "Access verified for $kv_name ($secret_count secrets)"
        else
            log_error "Cannot access $kv_name"
        fi
    done < /tmp/keyvaults.txt
    
    # Test GitHub variables
    log_info "Verifying GitHub variables..."
    local vars=$(gh variable list --repo "$GITHUB_REPO" --json name -q '.[].name' | grep -c "AZURE_KEYVAULT_NAME" || echo "0")
    log_success "GitHub variables configured: $vars"
}

# Function to generate documentation
generate_documentation() {
    local doc_file="managed-identity-setup-summary.md"
    
    log_info "Generating setup documentation..."
    
    cat > "$doc_file" << EOF
# Azure Managed Identity Setup Summary

**Generated on:** $(date)
**Project:** $PROJECT_NAME
**GitHub Repository:** $GITHUB_REPO

## Key Vaults Created

EOF

    while IFS=':' read -r env kv_name; do
        echo "- **$env:** $kv_name" >> "$doc_file"
    done < /tmp/keyvaults.txt

    cat >> "$doc_file" << EOF

## GitHub Variables Configured

- AZURE_KEYVAULT_NAME_DEV
- AZURE_KEYVAULT_NAME_STAGING  
- AZURE_KEYVAULT_NAME_PREPROD
- AZURE_KEYVAULT_NAME_PROD

## Next Steps

1. **Configure GitHub Runners with Managed Identity:**
   - Ensure your GitHub Actions runners are deployed with managed identity enabled
   - Grant the managed identity "Key Vault Secrets User" role on each Key Vault

2. **Test the Setup:**
   - Run your GitHub Actions workflow to verify Key Vault access
   - Check the Azure Key Vault action logs for successful authentication

3. **Add Environment-Specific Secrets:**
   - Replace sample secrets with actual values for each environment
   - Follow the secret naming conventions in the documentation

## Managed Identity Permissions Required

For each Key Vault, the GitHub runner's managed identity needs:
- **Role:** Key Vault Secrets User
- **Scope:** Key Vault resource

## Troubleshooting

If you encounter authentication issues:
1. Verify the runner has managed identity enabled
2. Check RBAC permissions on the Key Vault
3. Ensure the Key Vault uses RBAC authorization (not access policies)
4. Review the GitHub Actions logs for detailed error messages

## Security Notes

- ✅ No service principal credentials stored in GitHub
- ✅ Uses Azure RBAC for fine-grained access control
- ✅ Secrets are automatically masked in GitHub logs
- ✅ Each environment has isolated Key Vault access
EOF

    log_success "Documentation generated: $doc_file"
}

# Function to cleanup temporary files
cleanup() {
    rm -f /tmp/keyvaults.txt
}

# Main execution
main() {
    echo "🔐 Azure Managed Identity Setup Script"
    echo "====================================="
    echo
    
    check_prerequisites
    verify_azure_auth
    get_user_input
    
    echo
    log_info "Starting setup process..."
    
    setup_key_vaults
    setup_rbac_permissions
    create_sample_secrets
    setup_github_variables
    verify_setup
    generate_documentation
    
    cleanup
    
    echo
    log_success "Setup completed successfully!"
    echo
    log_info "Important reminders:"
    echo "  1. Configure your GitHub runners with managed identity"
    echo "  2. Grant the managed identity 'Key Vault Secrets User' role"
    echo "  3. Test the setup by running your CI/CD pipeline"
    echo "  4. Replace sample secrets with actual values"
    echo
    log_info "Documentation saved to: managed-identity-setup-summary.md"
}

# Trap to ensure cleanup
trap cleanup EXIT

# Run main function
main "$@"
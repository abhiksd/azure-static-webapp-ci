#!/bin/bash

set -e

# JFrog Artifactory Repository Setup Script
# This script helps create the required repositories in JFrog Artifactory

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
JFROG_URL=""
JFROG_USERNAME=""
JFROG_ACCESS_TOKEN=""

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} JFrog Repository Setup${NC}"
    echo -e "${BLUE}================================${NC}"
    echo ""
}

print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

get_jfrog_credentials() {
    print_step "Getting JFrog Artifactory credentials"
    
    read -p "Enter your JFrog Artifactory URL (e.g., https://yourorg.jfrog.io): " JFROG_URL
    if [ -z "$JFROG_URL" ]; then
        print_error "JFrog URL is required"
        exit 1
    fi
    
    read -p "Enter your JFrog username: " JFROG_USERNAME
    if [ -z "$JFROG_USERNAME" ]; then
        print_error "JFrog username is required"
        exit 1
    fi
    
    read -s -p "Enter your JFrog access token: " JFROG_ACCESS_TOKEN
    echo ""
    if [ -z "$JFROG_ACCESS_TOKEN" ]; then
        print_error "JFrog access token is required"
        exit 1
    fi
    
    # Remove trailing slash from URL
    JFROG_URL="${JFROG_URL%/}"
    
    print_info "Credentials configured for: $JFROG_URL"
}

test_connection() {
    print_step "Testing JFrog connection"
    
    response=$(curl -s -w "%{http_code}" -u "$JFROG_USERNAME:$JFROG_ACCESS_TOKEN" "$JFROG_URL/artifactory/api/system/ping" -o /dev/null)
    
    if [ "$response" -eq 200 ]; then
        print_info "Connection successful"
    else
        print_error "Connection failed (HTTP $response). Please check your credentials."
        exit 1
    fi
}

create_repository() {
    local repo_name="$1"
    local repo_description="$2"
    local retention_days="$3"
    
    print_info "Creating repository: $repo_name"
    
    # Check if repository already exists
    response=$(curl -s -w "%{http_code}" -u "$JFROG_USERNAME:$JFROG_ACCESS_TOKEN" \
        "$JFROG_URL/artifactory/api/repositories/$repo_name" -o /dev/null)
    
    if [ "$response" -eq 200 ]; then
        print_warning "Repository $repo_name already exists"
        return 0
    fi
    
    # Create repository configuration
    cat > "/tmp/repo_config_$repo_name.json" << EOF
{
    "key": "$repo_name",
    "rclass": "local",
    "packageType": "generic",
    "description": "$repo_description",
    "notes": "Created by setup script for frontend CI/CD pipeline",
    "includesPattern": "**/*",
    "excludesPattern": "",
    "repoLayoutRef": "simple-default",
    "handleReleases": true,
    "handleSnapshots": true,
    "maxUniqueSnapshots": 0,
    "maxUniqueTags": 0,
    "suppressPomConsistencyChecks": false,
    "blackedOut": false,
    "propertySets": ["artifactory"],
    "archiveBrowsingEnabled": false,
    "calculateYumMetadata": false,
    "yumRootDepth": 0,
    "dockerApiVersion": "V2",
    "enableFileListsIndexing": false,
    "optionalIndexCompressionFormats": ["bz2", "lzma", "xz"],
    "downloadRedirect": false,
    "blockPushingSchema1": true,
    "xrayIndex": true
}
EOF
    
    # Add retention policy if specified
    if [ -n "$retention_days" ] && [ "$retention_days" -gt 0 ]; then
        cat > "/tmp/cleanup_policy_$repo_name.json" << EOF
{
    "retentionPolicy": {
        "enabled": true,
        "retentionDays": $retention_days,
        "includeReleases": false
    }
}
EOF
    fi
    
    # Create repository
    response=$(curl -s -w "%{http_code}" -u "$JFROG_USERNAME:$JFROG_ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -X PUT "$JFROG_URL/artifactory/api/repositories/$repo_name" \
        -d @"/tmp/repo_config_$repo_name.json" -o /dev/null)
    
    if [ "$response" -eq 200 ] || [ "$response" -eq 201 ]; then
        print_info "Repository $repo_name created successfully"
    else
        print_error "Failed to create repository $repo_name (HTTP $response)"
        cat "/tmp/repo_config_$repo_name.json"
        return 1
    fi
    
    # Clean up temp files
    rm -f "/tmp/repo_config_$repo_name.json"
    rm -f "/tmp/cleanup_policy_$repo_name.json"
}

setup_repositories() {
    print_step "Setting up frontend repositories"
    
    # Create repositories with different retention policies
    create_repository "frontend-snapshots" "Development and feature branch artifacts" "30"
    create_repository "frontend-releases" "Release candidate artifacts" "90"
    create_repository "frontend-production" "Production-ready artifacts" "365"
    
    print_info "All repositories created successfully"
}

create_access_tokens() {
    print_step "Creating access tokens for CI/CD"
    
    print_info "Creating tokens for different environments..."
    
    # CI/CD token with full access to frontend repositories
    cat > "/tmp/cicd_token.json" << EOF
{
    "scope": "applied-permissions/groups:readers applied-permissions/groups:deployers",
    "username": "cicd-pipeline",
    "description": "CI/CD pipeline access token",
    "expires_in": 31536000,
    "refreshable": true,
    "audience": "jfrt@*"
}
EOF
    
    print_warning "Manual step required: Create access tokens in JFrog UI"
    echo "1. Go to: $JFROG_URL/ui/admin/security/access_tokens"
    echo "2. Create a new token with scope: 'applied-permissions/groups:readers applied-permissions/groups:deployers'"
    echo "3. Use this token in your GitHub repository secrets as JFROG_ACCESS_TOKEN"
    
    rm -f "/tmp/cicd_token.json"
}

setup_permissions() {
    print_step "Setting up repository permissions"
    
    print_warning "Manual step required: Configure repository permissions"
    echo "1. Go to: $JFROG_URL/ui/admin/security/permissions"
    echo "2. Create permission sets for each repository:"
    echo "   - frontend-snapshots: Read/Write for CI/CD users"
    echo "   - frontend-releases: Read/Write for CI/CD users"
    echo "   - frontend-production: Read/Write for CI/CD users, Read for all users"
    echo "3. Assign appropriate users/groups to each permission set"
}

print_summary() {
    print_step "Setup Summary"
    
    echo ""
    echo -e "${GREEN}JFrog Artifactory setup completed!${NC}"
    echo ""
    echo "Repositories created:"
    echo "  - frontend-snapshots (30-day retention)"
    echo "  - frontend-releases (90-day retention)"
    echo "  - frontend-production (365-day retention)"
    echo ""
    echo "Next steps:"
    echo "1. Configure access tokens and permissions in JFrog UI"
    echo "2. Add JFrog credentials to your GitHub organization secrets:"
    echo "   - JFROG_URL: $JFROG_URL"
    echo "   - JFROG_USERNAME: $JFROG_USERNAME"
    echo "   - JFROG_ACCESS_TOKEN: [Create new token]"
    echo "3. Test the setup by running a CI/CD pipeline"
    echo ""
    echo "Repository URLs:"
    echo "  - Snapshots: $JFROG_URL/ui/repos/tree/General/frontend-snapshots"
    echo "  - Releases: $JFROG_URL/ui/repos/tree/General/frontend-releases"
    echo "  - Production: $JFROG_URL/ui/repos/tree/General/frontend-production"
}

validate_repositories() {
    print_step "Validating repository setup"
    
    repos=("frontend-snapshots" "frontend-releases" "frontend-production")
    
    for repo in "${repos[@]}"; do
        response=$(curl -s -w "%{http_code}" -u "$JFROG_USERNAME:$JFROG_ACCESS_TOKEN" \
            "$JFROG_URL/artifactory/api/repositories/$repo" -o /dev/null)
        
        if [ "$response" -eq 200 ]; then
            print_info "Repository $repo: OK"
        else
            print_error "Repository $repo: Failed (HTTP $response)"
        fi
    done
}

# Main execution
main() {
    print_header
    get_jfrog_credentials
    test_connection
    setup_repositories
    validate_repositories
    create_access_tokens
    setup_permissions
    print_summary
}

# Check if script is being sourced or executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
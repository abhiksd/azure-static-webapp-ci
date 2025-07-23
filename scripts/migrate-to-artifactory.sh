#!/bin/bash

set -e

# Migration script for JFrog Artifactory integration
# This script helps migrate frontend projects to use the new CI/CD pipeline with JFrog Artifactory

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ORG_NAME=""
APP_NAME=""
APP_LOCATION="/"
OUTPUT_LOCATION="build"

print_header() {
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} JFrog Artifactory Migration${NC}"
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

get_user_input() {
    print_step "Gathering configuration information"
    
    read -p "Enter your GitHub organization name: " ORG_NAME
    if [ -z "$ORG_NAME" ]; then
        print_error "Organization name is required"
        exit 1
    fi
    
    read -p "Enter your application name: " APP_NAME
    if [ -z "$APP_NAME" ]; then
        print_error "Application name is required"
        exit 1
    fi
    
    read -p "Enter app location (default: /): " input_app_location
    APP_LOCATION="${input_app_location:-/}"
    
    read -p "Enter output location (default: build): " input_output_location
    OUTPUT_LOCATION="${input_output_location:-build}"
    
    echo ""
    print_info "Configuration:"
    echo "  Organization: $ORG_NAME"
    echo "  Application: $APP_NAME"
    echo "  App Location: $APP_LOCATION"
    echo "  Output Location: $OUTPUT_LOCATION"
    echo ""
    
    read -p "Continue with this configuration? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "Migration cancelled"
        exit 0
    fi
}

check_prerequisites() {
    print_step "Checking prerequisites"
    
    # Check if we're in a git repository
    if [ ! -d ".git" ]; then
        print_error "This script must be run from the root of a git repository"
        exit 1
    fi
    
    # Check if .github directory exists
    if [ ! -d ".github" ]; then
        mkdir -p ".github/workflows"
        print_info "Created .github/workflows directory"
    elif [ ! -d ".github/workflows" ]; then
        mkdir -p ".github/workflows"
        print_info "Created .github/workflows directory"
    fi
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_warning "package.json not found. Make sure this is a Node.js project."
    fi
    
    echo "Prerequisites check completed"
}

backup_existing_workflows() {
    print_step "Backing up existing workflows"
    
    if [ -d ".github/workflows" ] && [ "$(ls -A .github/workflows)" ]; then
        backup_dir=".github/workflows.backup.$(date +%Y%m%d-%H%M%S)"
        mkdir -p "$backup_dir"
        cp -r .github/workflows/* "$backup_dir/" 2>/dev/null || true
        print_info "Existing workflows backed up to: $backup_dir"
    else
        print_info "No existing workflows found"
    fi
}

create_workflow_files() {
    print_step "Creating new workflow files"
    
    # Create main CI/CD workflow
    cat > .github/workflows/ci-cd.yml << EOF
name: Frontend CI/CD with Artifactory

on:
  push:
    branches: [main, develop, sqe, preprod, qa]
    tags: ['v*']
  pull_request:
    branches: [main, develop]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'development'
        type: choice
        options:
        - development
        - sqe
        - qa
        - pre-production
        - production

jobs:
  ci-cd:
    uses: ${ORG_NAME}/shared-ci-cd-workflows/.github/workflows/shared-ci-cd-artifactory.yml@main
    with:
      environment: \${{ github.event.inputs.environment || 'development' }}
      app-location: '${APP_LOCATION}'
      output-location: '${OUTPUT_LOCATION}'
      app-name: '${APP_NAME}'
    
    secrets:
      AZURE_STATIC_WEB_APPS_API_TOKEN: \${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
      SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
      CHECKMARX_CLIENT_ID: \${{ secrets.CHECKMARX_CLIENT_ID }}
      CHECKMARX_SECRET: \${{ secrets.CHECKMARX_SECRET }}
      CHECKMARX_TENANT: \${{ secrets.CHECKMARX_TENANT }}
      CHECKMARX_BASE_URI: \${{ secrets.CHECKMARX_BASE_URI }}
      JFROG_URL: \${{ secrets.JFROG_URL }}
      JFROG_USERNAME: \${{ secrets.JFROG_USERNAME }}
      JFROG_ACCESS_TOKEN: \${{ secrets.JFROG_ACCESS_TOKEN }}
EOF
    
    # Create manual deployment workflow
    cat > .github/workflows/manual-deployment.yml << EOF
name: Manual Deployment

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        type: choice
        options:
        - development
        - sqe
        - qa
        - pre-production
        - production
      artifact-version:
        description: 'Artifact version (leave empty to list available versions)'
        required: false
        type: string
      repository:
        description: 'Artifact repository'
        required: false
        default: 'frontend-releases'
        type: choice
        options:
        - frontend-snapshots
        - frontend-releases
        - frontend-production
      reason:
        description: 'Deployment reason'
        required: true
        type: string

jobs:
  manual-deploy:
    uses: ${ORG_NAME}/shared-ci-cd-workflows/.github/workflows/manual-deployment-artifactory.yml@main
    with:
      environment: \${{ github.event.inputs.environment }}
      app-name: '${APP_NAME}'
      artifact-version: \${{ github.event.inputs.artifact-version }}
      repository: \${{ github.event.inputs.repository }}
      reason: \${{ github.event.inputs.reason }}
      app-location: '${APP_LOCATION}'
      output-location: '${OUTPUT_LOCATION}'
    
    secrets:
      AZURE_STATIC_WEB_APPS_API_TOKEN: \${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
      JFROG_URL: \${{ secrets.JFROG_URL }}
      JFROG_USERNAME: \${{ secrets.JFROG_USERNAME }}
      JFROG_ACCESS_TOKEN: \${{ secrets.JFROG_ACCESS_TOKEN }}
EOF
    
    print_info "Workflow files created:"
    echo "  - .github/workflows/ci-cd.yml"
    echo "  - .github/workflows/manual-deployment.yml"
}

create_secrets_checklist() {
    print_step "Creating secrets configuration checklist"
    
    cat > SECRETS_SETUP.md << EOF
# Repository Secrets Configuration

Configure the following secrets in your GitHub repository (Settings > Secrets and variables > Actions):

## Azure Static Web Apps
- \`AZURE_STATIC_WEB_APPS_API_TOKEN\` - Azure Static Web Apps deployment token

## Security Scanning (Optional)
- \`SONAR_TOKEN\` - SonarCloud authentication token
- \`CHECKMARX_CLIENT_ID\` - Checkmarx client ID
- \`CHECKMARX_SECRET\` - Checkmarx client secret
- \`CHECKMARX_TENANT\` - Checkmarx tenant name
- \`CHECKMARX_BASE_URI\` - Checkmarx base URI (optional)

## JFrog Artifactory (Required)
- \`JFROG_URL\` - JFrog Artifactory URL (e.g., https://yourorg.jfrog.io)
- \`JFROG_USERNAME\` - JFrog username
- \`JFROG_ACCESS_TOKEN\` - JFrog access token

## Repository Variables
Configure in Settings > Secrets and variables > Actions > Variables tab:
- \`SONAR_ORGANIZATION\` - SonarCloud organization name

## Next Steps
1. Configure all required secrets in your GitHub repository
2. Ensure your package.json has the required build and test scripts
3. Test the workflow by pushing to a branch or running manual deployment
4. Delete this file once setup is complete

EOF
    
    print_info "Created SECRETS_SETUP.md with configuration instructions"
}

validate_package_json() {
    print_step "Validating package.json configuration"
    
    if [ ! -f "package.json" ]; then
        print_warning "package.json not found"
        return
    fi
    
    # Check for required scripts
    if ! grep -q '"build"' package.json; then
        print_warning "No 'build' script found in package.json"
        echo "Add a build script like: \"build\": \"react-scripts build\""
    fi
    
    if ! grep -q '"test"' package.json; then
        print_warning "No 'test' script found in package.json"
        echo "Add a test script like: \"test\": \"react-scripts test --coverage --watchAll=false\""
    fi
    
    print_info "package.json validation completed"
}

print_summary() {
    print_step "Migration Summary"
    
    echo ""
    echo -e "${GREEN}Migration completed successfully!${NC}"
    echo ""
    echo "Files created/modified:"
    echo "  - .github/workflows/ci-cd.yml"
    echo "  - .github/workflows/manual-deployment.yml"
    echo "  - SECRETS_SETUP.md"
    echo ""
    echo "Next steps:"
    echo "1. Review SECRETS_SETUP.md and configure repository secrets"
    echo "2. Ensure your package.json has required build and test scripts"
    echo "3. Commit and push the new workflow files"
    echo "4. Test the deployment by pushing to a branch"
    echo ""
    echo -e "${YELLOW}Important:${NC} Make sure the shared-ci-cd-workflows repository is accessible to your organization"
}

# Main execution
main() {
    print_header
    get_user_input
    check_prerequisites
    backup_existing_workflows
    create_workflow_files
    create_secrets_checklist
    validate_package_json
    print_summary
}

# Check if script is being sourced or executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
#!/bin/bash

# Shared Workflow Repository Setup Script
# This script helps you set up a new shared CI/CD repository

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SHARED_REPO_NAME="shared-ci-cd-workflows"
CURRENT_DIR=$(pwd)

echo -e "${BLUE}🚀 Shared Workflow Repository Setup${NC}"
echo "================================================"

# Function to print colored output
print_step() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -d ".github/workflows" ] || [ ! -d ".github/actions" ]; then
    print_error "Please run this script from the root of your CI/CD repository (should contain .github/workflows and .github/actions)"
    exit 1
fi

print_step "Current directory validated"

# Get organization/user name
echo -e "${BLUE}📝 Repository Configuration${NC}"
read -p "Enter your GitHub organization/username: " GITHUB_ORG
read -p "Enter shared repository name [${SHARED_REPO_NAME}]: " CUSTOM_REPO_NAME
SHARED_REPO_NAME=${CUSTOM_REPO_NAME:-$SHARED_REPO_NAME}

echo ""
echo -e "${BLUE}📋 Migration Plan${NC}"
echo "Organization: ${GITHUB_ORG}"
echo "Shared Repository: ${SHARED_REPO_NAME}"
echo "Full Repository: ${GITHUB_ORG}/${SHARED_REPO_NAME}"
echo ""

read -p "Proceed with migration? (y/N): " CONFIRM
if [[ ! $CONFIRM =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

# Create shared repository directory structure
SHARED_DIR="../${SHARED_REPO_NAME}"
print_step "Creating shared repository structure in ${SHARED_DIR}"

mkdir -p "${SHARED_DIR}/.github/workflows"
mkdir -p "${SHARED_DIR}/.github/actions"
mkdir -p "${SHARED_DIR}/configs"

# Copy shared workflow
print_step "Copying shared workflow"
cp "shared-ci-cd.yml" "${SHARED_DIR}/.github/workflows/" 2>/dev/null || echo "shared-ci-cd.yml not found, will be created"

# Copy composite actions
print_step "Copying composite actions"
if [ -d ".github/actions/sonar-analysis" ]; then
    cp -r ".github/actions/sonar-analysis" "${SHARED_DIR}/.github/actions/"
fi

if [ -d ".github/actions/checkmarx-scan" ]; then
    cp -r ".github/actions/checkmarx-scan" "${SHARED_DIR}/.github/actions/"
fi

if [ -d ".github/actions/deploy-static-app" ]; then
    cp -r ".github/actions/deploy-static-app" "${SHARED_DIR}/.github/actions/"
fi

# Copy additional actions if they exist
for action_dir in .github/actions/*/; do
    if [ -d "$action_dir" ]; then
        action_name=$(basename "$action_dir")
        if [[ ! "$action_name" =~ ^(sonar-analysis|checkmarx-scan|deploy-static-app)$ ]]; then
            print_step "Copying additional action: $action_name"
            cp -r "$action_dir" "${SHARED_DIR}/.github/actions/"
        fi
    fi
done

# Copy documentation files
print_step "Copying documentation"
for doc in *.md; do
    if [ -f "$doc" ] && [[ ! "$doc" =~ ^(README\.md)$ ]]; then
        cp "$doc" "${SHARED_DIR}/"
    fi
done

# Copy config files
print_step "Copying configuration files"
if [ -d "configs" ]; then
    cp -r configs/* "${SHARED_DIR}/configs/" 2>/dev/null || true
fi

# Create shared repository README
print_step "Creating shared repository README"
cat > "${SHARED_DIR}/README.md" << EOF
# Shared CI/CD Workflows

This repository contains reusable GitHub Actions workflows and composite actions for frontend applications.

## Overview

This shared workflow repository provides:
- 🔄 **Reusable CI/CD workflows** for frontend applications
- 🧩 **Composite actions** for common tasks (SonarCloud, Checkmarx, Azure deployment)
- 📚 **Documentation** and troubleshooting guides
- ⚙️ **Configuration templates** for different frontend frameworks

## Usage

### In your frontend application repository:

\`\`\`yaml
name: Frontend CI/CD

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    uses: ${GITHUB_ORG}/${SHARED_REPO_NAME}/.github/workflows/shared-ci-cd.yml@main
    with:
      node-version: '18'
      output-location: 'build'
      build-command: 'npm run build'
    secrets:
      AZURE_STATIC_WEB_APPS_API_TOKEN_DEV: \${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_DEV }}
      SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
      CHECKMARX_CLIENT_ID: \${{ secrets.CHECKMARX_CLIENT_ID }}
      CHECKMARX_SECRET: \${{ secrets.CHECKMARX_SECRET }}
      CHECKMARX_TENANT: \${{ secrets.CHECKMARX_TENANT }}
\`\`\`

## Workflows

### \`shared-ci-cd.yml\`
Main reusable workflow for frontend CI/CD with:
- Build and test steps
- Security scanning (SonarCloud, Checkmarx)
- Multi-environment deployment (dev, staging, pre-prod, prod)
- Azure Static Web Apps integration

## Composite Actions

### \`sonar-analysis\`
SonarCloud analysis with configurable quality gates

### \`checkmarx-scan\`
Checkmarx AST security scanning for frontend applications

### \`deploy-static-app\`
Azure Static Web Apps deployment with permission fixes

## Documentation

- \`SHARED_WORKFLOW_MIGRATION_GUIDE.md\` - Complete migration guide
- \`AZURE_DEPLOYMENT_TROUBLESHOOTING.md\` - Azure deployment issues
- \`CHECKMARX_TROUBLESHOOTING.md\` - Checkmarx authentication help

## Configuration

See \`configs/\` directory for:
- SonarCloud project configuration
- Azure Static Web Apps configuration
- Framework-specific templates

## Support

For issues or questions:
1. Check the troubleshooting documentation
2. Review workflow logs in GitHub Actions
3. Validate repository secrets and variables
4. Create an issue in this repository

---
Generated by shared workflow migration script
EOF

# Create frontend app example
print_step "Creating frontend application example workflow"
mkdir -p "${SHARED_DIR}/examples"

cat > "${SHARED_DIR}/examples/frontend-ci-cd.yml" << EOF
# Example frontend application workflow
# Place this file in your frontend app at: .github/workflows/ci-cd.yml

name: Frontend Application CI/CD

on:
  push:
    branches: [main, develop, staging, preprod]
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
        - staging
        - pre-production
        - production

jobs:
  call-shared-workflow:
    uses: ${GITHUB_ORG}/${SHARED_REPO_NAME}/.github/workflows/shared-ci-cd.yml@main
    with:
      # Customize these for your application
      node-version: '18'
      output-location: 'build'        # Change to 'dist' for Vite/Vue
      build-command: 'npm run build'
      install-command: 'npm ci'
      
      # Quality thresholds
      min-code-coverage: '75'
      max-critical-vulnerabilities: '0'
      max-high-vulnerabilities: '5'
      
      # Environment
      environment: \${{ github.event.inputs.environment || 'development' }}
    
    secrets:
      # Set these secrets in your frontend repository
      AZURE_STATIC_WEB_APPS_API_TOKEN_DEV: \${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_DEV }}
      AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING: \${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING }}
      AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD: \${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD }}
      AZURE_STATIC_WEB_APPS_API_TOKEN_PROD: \${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN_PROD }}
      
      SONAR_TOKEN: \${{ secrets.SONAR_TOKEN }}
      CHECKMARX_CLIENT_ID: \${{ secrets.CHECKMARX_CLIENT_ID }}
      CHECKMARX_SECRET: \${{ secrets.CHECKMARX_SECRET }}
      CHECKMARX_TENANT: \${{ secrets.CHECKMARX_TENANT }}
      CHECKMARX_BASE_URI: \${{ secrets.CHECKMARX_BASE_URI }}
EOF

# Copy the standalone PR security check
cp "pr-security-check.yml" "${SHARED_DIR}/examples/" 2>/dev/null || echo "pr-security-check.yml not found, will be created"

# Create .gitignore for shared repository
print_step "Creating .gitignore"
cat > "${SHARED_DIR}/.gitignore" << EOF
# Dependencies
node_modules/
npm-debug.log*

# Build outputs
build/
dist/
out/

# Environment files
.env*

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Runtime data
*.pid
*.seed
*.pid.lock

# Coverage directory
coverage/

# Temporary files
*.tmp
*.temp

# Core dumps
core
*.core
EOF

print_step "Migration structure created successfully!"
echo ""
echo -e "${BLUE}📁 Shared Repository Structure:${NC}"
echo "${SHARED_DIR}/"
echo "├── .github/"
echo "│   ├── workflows/"
echo "│   │   └── shared-ci-cd.yml"
echo "│   └── actions/"
echo "│       ├── sonar-analysis/"
echo "│       ├── checkmarx-scan/"
echo "│       └── deploy-static-app/"
echo "├── examples/"
echo "│   ├── frontend-ci-cd.yml"
echo "│   └── pr-security-check.yml"
echo "├── configs/"
echo "├── *.md (documentation)"
echo "└── README.md"
echo ""

echo -e "${BLUE}🔧 Next Steps:${NC}"
echo "1. cd ${SHARED_DIR}"
echo "2. git init"
echo "3. git add ."
echo "4. git commit -m 'Initial shared workflow repository'"
echo "5. Create repository on GitHub: ${GITHUB_ORG}/${SHARED_REPO_NAME}"
echo "6. git remote add origin https://github.com/${GITHUB_ORG}/${SHARED_REPO_NAME}.git"
echo "7. git push -u origin main"
echo ""

print_warning "Remember to:"
print_warning "- Update your frontend applications to use the shared workflow"
print_warning "- Configure repository secrets and variables in each frontend app"
print_warning "- Test the shared workflow before removing old workflows"

echo ""
print_step "Shared repository setup complete! 🎉"
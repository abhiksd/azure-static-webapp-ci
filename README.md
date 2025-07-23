# Frontend CI/CD with JFrog Artifactory

Enterprise-grade CI/CD pipeline for frontend applications with JFrog Artifactory artifact management and Azure Static Web Apps deployment.

## Features

- **Centralized Artifact Management** - JFrog Artifactory integration for reliable artifact storage and retrieval
- **Multi-Environment Deployment** - Automated deployment to development, staging, pre-production, and production
- **Security Scanning** - Integrated SonarCloud and Checkmarx security analysis
- **Manual Deployment** - Flexible manual deployment with artifact selection
- **Version Management** - Semantic versioning for releases with automated tagging
- **Deployment Tracking** - Complete audit trail of deployments and artifacts

## Quick Start

### 1. Setup JFrog Artifactory

Run the JFrog setup script to create required repositories:

```bash
./scripts/setup-jfrog-repositories.sh
```

This creates three repositories:
- `frontend-snapshots` - Development artifacts (30-day retention)
- `frontend-releases` - Release candidates (90-day retention)  
- `frontend-production` - Production artifacts (365-day retention)

### 2. Migrate Frontend Project

Use the migration script to update your frontend project:

```bash
# Run in your frontend project directory
curl -sSL https://raw.githubusercontent.com/YOUR_ORG/shared-ci-cd-workflows/main/scripts/migrate-to-artifactory.sh | bash
```

Or download and run manually:

```bash
wget https://raw.githubusercontent.com/YOUR_ORG/shared-ci-cd-workflows/main/scripts/migrate-to-artifactory.sh
chmod +x migrate-to-artifactory.sh
./migrate-to-artifactory.sh
```

### 3. Configure Secrets

Add required secrets to your GitHub repository (Settings > Secrets and variables > Actions):

#### Required Secrets
```
AZURE_STATIC_WEB_APPS_API_TOKEN  # Azure deployment token
JFROG_URL                        # https://yourorg.jfrog.io
JFROG_USERNAME                   # JFrog username
JFROG_ACCESS_TOKEN              # JFrog access token
```

#### Optional Security Scanning Secrets
```
SONAR_TOKEN                     # SonarCloud token
CHECKMARX_CLIENT_ID            # Checkmarx client ID
CHECKMARX_SECRET               # Checkmarx secret
CHECKMARX_TENANT               # Checkmarx tenant
```

### 4. Deploy

Push code to trigger automatic deployment:

```bash
git push origin develop        # → Development environment
git push origin release/1.2.3  # → Pre-production environment
git push origin main           # → Production environment
```

Or use manual deployment for specific artifact versions.

## Architecture

### Repository Structure

```
JFrog Artifactory:
├── frontend-snapshots/         # Development builds
│   └── {app-name}/
│       ├── {app}-{sha}-{timestamp}.tar.gz
│       └── {app}-{sha}-{timestamp}.tar.gz.sha256
├── frontend-releases/          # Release candidates
│   └── {app-name}/
│       ├── {app}-v1.2.3.tar.gz
│       └── {app}-v1.2.3.tar.gz.sha256
└── frontend-production/        # Production releases
    └── {app-name}/
        ├── {app}-v1.2.3.tar.gz
        └── {app}-v1.2.3.tar.gz.sha256
```

### Workflow Process

```
1. Code Push/PR
   ↓
2. Build & Test (Node.js)
   ↓
3. Security Scans (SonarCloud + Checkmarx)
   ↓
4. Create Artifact (tar.gz with metadata)
   ↓
5. Push to JFrog Artifactory
   ↓
6. Fetch Artifact for Deployment
   ↓
7. Deploy to Azure Static Web Apps
   ↓
8. Update Deployment Metadata
```

## Deployment Strategy

### Automatic Deployment

| Branch/Tag | Environment | Artifact Repository | Version Format |
|------------|-------------|-------------------|----------------|
| `develop` | Development | frontend-snapshots | `{sha}-{timestamp}` |
| `sqe` | SQE | frontend-snapshots | `{sha}-{timestamp}` |
| `qa` | QA | frontend-snapshots | `{sha}-{timestamp}` |
| `release/*` | Pre-production | frontend-releases | `v{x.y.z}` |
| `v*` tags | Production | frontend-production | `v{x.y.z}` |

### Manual Deployment

Use the manual deployment workflow to:
- Deploy specific artifact versions to any environment
- List available artifacts before deployment
- Deploy with custom deployment reason for audit trail

## Migration Guide

### From Existing CI/CD

1. **Backup Current Setup**
   ```bash
   cp -r .github/workflows .github/workflows.backup
   ```

2. **Run Migration Script**
   ```bash
   ./scripts/migrate-to-artifactory.sh
   ```

3. **Configure Secrets**
   - Add JFrog credentials to repository secrets
   - Keep existing Azure and security scanning secrets

4. **Test Deployment**
   ```bash
   git push origin develop  # Test development deployment
   ```

5. **Update Organization**
   - Train teams on new manual deployment capabilities
   - Update deployment procedures documentation

### Key Changes

- **Artifacts** - Build output now stored in JFrog Artifactory
- **Deployment** - Fetch artifacts from JFrog instead of rebuilding
- **Manual Process** - Enhanced manual deployment with artifact selection
- **Versioning** - Improved version management with semantic versioning
- **Tracking** - Complete deployment audit trail

## Workflows

### Main CI/CD Workflow

Location: `.github/workflows/shared-ci-cd-artifactory.yml`

**Jobs:**
1. `generate-version` - Create version and determine artifact repository
2. `determine-deployment` - Decide which environments to deploy to
3. `build-and-test` - Build application and run tests
4. `security-scans` - Run SonarCloud and Checkmarx scans
5. `build-and-publish` - Package and upload artifact to JFrog
6. `deploy-*` - Deploy to specific environments from artifacts

### Manual Deployment Workflow

Location: `.github/workflows/manual-deployment-artifactory.yml`

**Features:**
- List available artifacts when no version specified
- Validate artifact existence before deployment
- Deploy to any environment with audit trail
- Support for all artifact repositories

## Scripts

### Migration Script

`scripts/migrate-to-artifactory.sh` - Migrate frontend projects to use JFrog Artifactory CI/CD

**Features:**
- Interactive configuration
- Backup existing workflows
- Generate workflow files
- Create secrets checklist
- Validate package.json

### JFrog Setup Script

`scripts/setup-jfrog-repositories.sh` - Set up required JFrog Artifactory repositories

**Features:**
- Create all required repositories
- Configure retention policies
- Validate repository setup
- Generate setup instructions

## Security & Compliance

### Artifact Security
- SHA256 checksums for all artifacts
- Artifact integrity validation before deployment
- Access control via JFrog permissions
- Audit trail for all artifact operations

### Deployment Security
- Environment-specific approval gates
- Manual approval required for production
- Deployment reason tracking
- Complete deployment history

### Scanning Integration
- SonarCloud for code quality and coverage
- Checkmarx for security vulnerability scanning
- Quality gates enforcement
- Security scan results in deployment metadata

## Troubleshooting

### Common Issues

**Artifact not found**
- Check artifact version format
- Verify repository permissions
- Ensure artifact was successfully uploaded

**JFrog authentication failed**
- Verify JFROG_URL format (include https://)
- Check access token permissions
- Validate username/token combination

**Deployment failed**
- Check Azure Static Web Apps token
- Verify artifact integrity
- Review deployment logs

### Support

1. Check workflow logs in GitHub Actions
2. Verify JFrog repository contents
3. Validate all required secrets are configured
4. Review artifact metadata for deployment history

## Documentation

- **[README.md](README.md)** - This comprehensive overview and quick start guide
- **[MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)** - Step-by-step migration from existing CI/CD
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Complete issue resolution guide
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Architecture and component overview

## Files and Structure

```
shared-ci-cd-workflows/
├── .github/
│   ├── actions/                          # Reusable composite actions
│   └── workflows/                        # Shared workflow definitions
├── scripts/                              # Migration and setup scripts
├── templates/                            # Frontend application templates
├── README.md                             # Main documentation (this file)
├── MIGRATION_GUIDE.md                    # Migration instructions
├── TROUBLESHOOTING.md                    # Issue resolution guide
└── PROJECT_STRUCTURE.md                 # Architecture overview
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Test changes with example application
4. Submit pull request with documentation updates
5. Update documentation for any new features

## License

MIT License - see LICENSE file for details.
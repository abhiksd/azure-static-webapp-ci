# Project Structure

This document outlines the complete structure of the JFrog Artifactory CI/CD implementation.

## Repository Layout

```
shared-ci-cd-workflows/
├── .github/
│   ├── actions/
│   │   ├── deploy-from-artifactory/
│   │   │   └── action.yml                    # JFrog artifact deployment action
│   │   ├── deploy-static-app/
│   │   │   └── action.yml                    # Azure Static Web Apps deployment
│   │   ├── sonar-analysis/
│   │   │   └── action.yml                    # SonarCloud security scanning
│   │   └── checkmarx-scan/
│   │       └── action.yml                    # Checkmarx security scanning
│   └── workflows/
│       ├── shared-ci-cd-artifactory.yml     # Main CI/CD workflow with JFrog
│       ├── manual-deployment-artifactory.yml # Manual deployment workflow
│       ├── shared-ci-cd.yml                 # Legacy workflow (compatibility)
│       ├── manual-rollback.yml              # Legacy rollback (compatibility)
│       └── shared-pr-security.yml           # PR security checks
├── scripts/
│   ├── migrate-to-artifactory.sh            # Frontend project migration script
│   └── setup-jfrog-repositories.sh          # JFrog repository setup script
├── templates/
│   ├── frontend-ci-cd-artifactory.yml       # Template for frontend projects
│   └── manual-deployment.yml                # Template for manual deployment
├── README.md                                 # Main documentation
├── MIGRATION_GUIDE.md                        # Migration instructions
├── TROUBLESHOOTING.md                        # Issue resolution guide
└── PROJECT_STRUCTURE.md                     # This file
```

## Core Components

### Enhanced Workflows

#### Main CI/CD Workflow (`shared-ci-cd-artifactory.yml`)
- **Purpose:** Complete CI/CD pipeline with JFrog Artifactory integration
- **Features:** 
  - Build once, deploy many strategy
  - Artifact management with versioning
  - Security scanning integration
  - Multi-environment deployment

#### Manual Deployment Workflow (`manual-deployment-artifactory.yml`)
- **Purpose:** Flexible manual deployment with artifact selection
- **Features:**
  - List available artifacts
  - Deploy specific versions
  - Environment-specific deployment
  - Audit trail for manual deployments

### Composite Actions

#### Deploy from Artifactory (`deploy-from-artifactory/action.yml`)
- **Purpose:** Fetch artifacts from JFrog and deploy to Azure
- **Process:**
  1. Setup JFrog CLI
  2. Download and verify artifact
  3. Deploy to Azure Static Web Apps
  4. Update deployment metadata

### Migration Tools

#### Frontend Migration Script (`migrate-to-artifactory.sh`)
- **Purpose:** Automate frontend project migration
- **Features:**
  - Interactive configuration
  - Workflow file generation
  - Secrets checklist creation
  - Backup existing workflows

#### JFrog Setup Script (`setup-jfrog-repositories.sh`)
- **Purpose:** Create required JFrog repositories
- **Creates:**
  - `frontend-snapshots` (30-day retention)
  - `frontend-releases` (90-day retention)
  - `frontend-production` (365-day retention)

### Templates

#### Frontend Application Templates
- `templates/frontend-ci-cd-artifactory.yml` - Main CI/CD workflow
- `templates/manual-deployment.yml` - Manual deployment workflow

## Workflow Architecture

### Build and Deployment Flow

```
1. Code Push/PR Trigger
   ↓
2. Generate Version & Determine Strategy
   ↓
3. Build & Test Application
   ↓ (parallel)
4. Security Scans (SonarCloud + Checkmarx)
   ↓
5. Package & Publish Artifact to JFrog
   ↓ (parallel deployment to multiple environments)
6. Fetch Artifact → Deploy to Azure Static Web Apps
   ↓
7. Update Deployment Metadata
```

### Artifact Management Strategy

#### Repository Structure in JFrog
```
frontend-snapshots/          # Development builds
├── app1/
│   ├── app1-a1b2c3d4-20240123-120000.tar.gz
│   ├── app1-a1b2c3d4-20240123-120000.tar.gz.sha256
│   └── metadata.json
frontend-releases/           # Release candidates  
├── app1/
│   ├── app1-v1.2.3.tar.gz
│   ├── app1-v1.2.3.tar.gz.sha256
│   └── metadata.json
frontend-production/         # Production releases
├── app1/
│   ├── app1-v1.2.3.tar.gz
│   ├── app1-v1.2.3.tar.gz.sha256
│   └── metadata.json
```

#### Version Strategy
- **Development/Feature branches:** `{sha}-{timestamp}`
- **Release branches:** `v{x.y.z}` (auto-tagged)
- **Production tags:** `v{x.y.z}` (from git tags)

### Environment Mapping

| Branch/Tag | Environment | Repository | Auto Deploy |
|-----------|-------------|------------|-------------|
| `develop` | Development | frontend-snapshots | Yes |
| `sqe` | SQE | frontend-snapshots | Yes |
| `qa` | QA | frontend-snapshots | Yes |
| `release/*` | Pre-production | frontend-releases | Yes |
| `v*` tags | Production | frontend-production | Manual approval |

## Frontend Project Integration

### Required Files (Created by Migration)

```
your-frontend-app/
├── .github/workflows/
│   ├── ci-cd.yml                    # Main CI/CD workflow
│   └── manual-deployment.yml       # Manual deployment workflow
├── SECRETS_SETUP.md                # Secrets configuration guide
└── package.json                    # Must have build/test scripts
```

### Required Secrets

#### Repository Level
```
AZURE_STATIC_WEB_APPS_API_TOKEN     # Azure deployment token
JFROG_URL                           # JFrog Artifactory URL
JFROG_USERNAME                      # JFrog username
JFROG_ACCESS_TOKEN                  # JFrog access token
```

#### Optional Security Scanning
```
SONAR_TOKEN                         # SonarCloud token
CHECKMARX_CLIENT_ID                 # Checkmarx credentials
CHECKMARX_SECRET
CHECKMARX_TENANT
CHECKMARX_BASE_URI
```

## Migration Process

### Phase 1: Infrastructure Setup
1. Run `setup-jfrog-repositories.sh` to create JFrog repositories
2. Configure organization-level JFrog secrets
3. Deploy enhanced workflows to shared repository

### Phase 2: Application Migration
1. Run `migrate-to-artifactory.sh` in each frontend project
2. Configure application-specific secrets
3. Test deployment to development environment

### Phase 3: Validation
1. Test all deployment scenarios
2. Validate manual deployment workflow
3. Train teams on new capabilities

## Security Features

### Artifact Security
- SHA256 checksums for integrity verification
- Access control via JFrog permissions
- Audit trail for all artifact operations
- Retention policies for compliance

### Deployment Security
- Environment-specific approval gates
- Manual approval required for production
- Deployment reason tracking for manual deployments
- Complete deployment history

### Scanning Integration
- Mandatory SonarCloud code quality analysis
- Checkmarx security vulnerability scanning
- Quality gates enforcement
- Security scan results in deployment metadata

## Monitoring and Maintenance

### Health Monitoring
- JFrog repository health checks
- Azure Static Web Apps deployment monitoring
- GitHub Actions workflow success rates
- Artifact retention policy compliance

### Maintenance Tasks
- Regular cleanup of expired artifacts
- Security token rotation
- Performance optimization
- Documentation updates

This structure provides a complete, enterprise-grade CI/CD solution with JFrog Artifactory integration while maintaining compatibility with existing deployments.
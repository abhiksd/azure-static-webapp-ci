# Migration Guide: JFrog Artifactory Integration

This guide walks you through migrating from the existing CI/CD pipeline to the enhanced version with JFrog Artifactory integration.

## Overview

The new pipeline adds JFrog Artifactory for artifact management while maintaining all existing functionality:

- **Build once, deploy many** - Artifacts are built once and reused for all environments
- **Enhanced manual deployment** - Select specific artifact versions for deployment
- **Improved audit trail** - Complete tracking of artifacts and deployments
- **Simplified rollbacks** - Deploy any previous artifact version easily

## Prerequisites

Before starting the migration, ensure you have:

- [ ] Admin access to your GitHub organization
- [ ] JFrog Artifactory instance with admin permissions
- [ ] Existing CI/CD pipeline working correctly
- [ ] Access to all environment secrets

## Migration Steps

### Phase 1: JFrog Artifactory Setup

#### 1.1 Set up JFrog Repositories

Run the repository setup script in the shared workflows repository:

```bash
cd shared-ci-cd-workflows
./scripts/setup-jfrog-repositories.sh
```

This creates:
- `frontend-snapshots` (30-day retention)
- `frontend-releases` (90-day retention)
- `frontend-production` (365-day retention)

#### 1.2 Configure JFrog Access

1. Create CI/CD access token in JFrog:
   - Go to JFrog UI > Administration > Security > Access Tokens
   - Create token with scope: `applied-permissions/groups:readers applied-permissions/groups:deployers`
   - Save token securely

2. Add organization-level secrets in GitHub:
   - `JFROG_URL` - Your JFrog Artifactory URL
   - `JFROG_USERNAME` - Service account username
   - `JFROG_ACCESS_TOKEN` - Access token from step 1

### Phase 2: Update Shared Workflows Repository

#### 2.1 Deploy New Workflows

The shared workflows repository now includes:

```
.github/workflows/
├── shared-ci-cd-artifactory.yml           # Enhanced CI/CD with JFrog
├── manual-deployment-artifactory.yml      # Manual deployment workflow
├── shared-ci-cd.yml                       # Legacy workflow (kept for compatibility)
└── manual-rollback.yml                    # Legacy rollback (kept for compatibility)
```

#### 2.2 Update Documentation

Replace old documentation with:
- Updated README.md
- New migration guide
- Comprehensive troubleshooting guide

### Phase 3: Frontend Application Migration

#### 3.1 Automatic Migration (Recommended)

Run the migration script in each frontend application:

```bash
cd your-frontend-app
curl -sSL https://raw.githubusercontent.com/YOUR_ORG/shared-ci-cd-workflows/main/scripts/migrate-to-artifactory.sh | bash
```

The script will:
- Backup existing workflows
- Create new workflow files
- Generate secrets configuration checklist
- Validate package.json

#### 3.2 Manual Migration

If you prefer manual migration:

1. **Backup existing workflows:**
   ```bash
   cp -r .github/workflows .github/workflows.backup
   ```

2. **Copy template workflows:**
   ```bash
   # Main CI/CD workflow
   cp templates/frontend-ci-cd-artifactory.yml .github/workflows/ci-cd.yml
   
   # Manual deployment workflow
   cp templates/manual-deployment.yml .github/workflows/manual-deployment.yml
   ```

3. **Update workflow references:**
   - Replace `YOUR_ORG` with your GitHub organization
   - Replace `YOUR_APP_NAME` with your application name
   - Adjust `app-location` and `output-location` if needed

#### 3.3 Configure Secrets

Add JFrog secrets to each frontend repository:

```bash
JFROG_URL                        # Same as organization secret
JFROG_USERNAME                   # Same as organization secret  
JFROG_ACCESS_TOKEN              # Same as organization secret
```

Keep existing secrets:
```bash
AZURE_STATIC_WEB_APPS_API_TOKEN  # Azure deployment token
SONAR_TOKEN                      # SonarCloud token (optional)
CHECKMARX_CLIENT_ID             # Checkmarx credentials (optional)
CHECKMARX_SECRET                
CHECKMARX_TENANT                
```

### Phase 4: Testing and Validation

#### 4.1 Test Development Deployment

```bash
git checkout -b test-artifactory-migration
git push origin test-artifactory-migration
```

Verify:
- [ ] Build completes successfully
- [ ] Artifact appears in JFrog `frontend-snapshots`
- [ ] Deployment to development environment works
- [ ] Application loads correctly

#### 4.2 Test Manual Deployment

1. Go to GitHub Actions > Manual Deployment
2. Leave artifact-version empty and run
3. Verify it lists available artifacts
4. Run again with specific version
5. Verify deployment succeeds

#### 4.3 Test Release Process

```bash
git checkout -b release/1.0.0
git push origin release/1.0.0
```

Verify:
- [ ] Auto-creates tag `v1.0.0`
- [ ] Artifact appears in JFrog `frontend-releases`
- [ ] Deploys to pre-production environment
- [ ] Production deployment requires manual approval

### Phase 5: Team Training

#### 5.1 New Manual Deployment Process

Train teams on enhanced manual deployment:

1. **List Available Artifacts:**
   - Run manual deployment without version
   - Review available versions and metadata

2. **Deploy Specific Version:**
   - Run manual deployment with version
   - Provide deployment reason
   - Monitor deployment progress

3. **Environment Management:**
   - Understand artifact repositories
   - Know which versions are deployment-ready

#### 5.2 Version Management

Explain new versioning strategy:

- **Development:** `{sha}-{timestamp}` format
- **Releases:** `v{x.y.z}` semantic versioning
- **Automatic tagging:** From `release/*` branches

## Migration Checklist

### Shared Repository

- [ ] JFrog repositories created and configured
- [ ] Organization secrets configured
- [ ] New workflows deployed
- [ ] Documentation updated
- [ ] Legacy workflows marked as deprecated

### Per Frontend Application

- [ ] Existing workflows backed up
- [ ] New workflows deployed and configured
- [ ] Repository secrets configured
- [ ] Test deployment successful
- [ ] Manual deployment tested
- [ ] Team trained on new process

### Organization

- [ ] All applications migrated
- [ ] Legacy workflows disabled
- [ ] Monitoring and alerting updated
- [ ] Documentation distributed
- [ ] Support procedures updated

## Rollback Plan

If issues occur during migration:

### Immediate Rollback

1. **Restore old workflows:**
   ```bash
   rm -rf .github/workflows
   mv .github/workflows.backup .github/workflows
   ```

2. **Use legacy shared workflow:**
   ```yaml
   # In ci-cd.yml
   uses: YOUR_ORG/shared-ci-cd-workflows/.github/workflows/shared-ci-cd.yml@main
   ```

### Gradual Migration

1. **Pilot Group:** Migrate 1-2 applications first
2. **Validation Period:** Run both old and new for comparison
3. **Phased Rollout:** Migrate remaining applications in batches
4. **Sunset Legacy:** Disable old workflows after full migration

## Troubleshooting

### Common Issues

**JFrog Authentication Failed**
```bash
# Test connection manually
curl -u username:token https://yourorg.jfrog.io/artifactory/api/system/ping
```

**Artifact Not Found**
- Check artifact naming convention
- Verify repository permissions
- Review JFrog repository contents

**Deployment Failed**
- Verify Azure Static Web Apps token
- Check artifact integrity
- Review deployment logs

**Build Differences**
- Compare build output between old and new workflows
- Verify environment variables
- Check dependency versions

### Support Resources

1. **Workflow Logs:** GitHub Actions detailed logs
2. **JFrog UI:** Repository browser and artifact metadata
3. **Documentation:** This guide and README.md
4. **Team Support:** DevOps team escalation

## Benefits After Migration

### For Development Teams

- **Faster deployments** - No rebuild for each environment
- **Reliable rollbacks** - Deploy any previous version easily
- **Better visibility** - Complete deployment history
- **Flexible deployment** - Manual deployment when needed

### For DevOps Teams

- **Centralized artifacts** - Single source of truth
- **Improved security** - Artifact integrity validation
- **Better compliance** - Complete audit trail
- **Simplified maintenance** - Centralized workflow management

### For Organization

- **Cost optimization** - Reduced build times and resource usage
- **Risk reduction** - Immutable deployments and easy rollbacks
- **Compliance improvement** - Complete artifact and deployment tracking
- **Operational excellence** - Standardized deployment processes

## Post-Migration

### Cleanup

After successful migration:

1. **Remove backup workflows:**
   ```bash
   rm -rf .github/workflows.backup
   ```

2. **Archive legacy documentation**
3. **Update team procedures**
4. **Schedule legacy workflow removal**

### Optimization

Consider these enhancements:

1. **Artifact retention policies** - Adjust based on usage patterns
2. **Performance monitoring** - Track deployment times and success rates
3. **Additional environments** - Add staging or testing environments
4. **Integration improvements** - Enhance with additional tools

This completes the migration to JFrog Artifactory integration. The new pipeline provides enhanced artifact management while maintaining all existing capabilities.
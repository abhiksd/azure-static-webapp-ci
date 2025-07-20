# Environment-Specific Versioning Strategy

This document outlines the versioning strategy used across different deployment environments to provide optimal traceability and release management.

## 🏷️ Versioning Overview

Our deployment pipeline uses different versioning strategies optimized for each environment's purpose:

| Environment | Version Format | Example | Purpose |
|-------------|----------------|---------|---------|
| **Development** | `dev-{SHORT_SHA}-{TIMESTAMP}` | `dev-a1b2c3d-20241225-1430` | Fast iteration tracking |
| **Staging** | `staging-{SHORT_SHA}-{TIMESTAMP}` | `staging-a1b2c3d-20241225-1445` | Pre-production validation |
| **Pre-Production** | `v{MAJOR}.{MINOR}.{PATCH}-pre.{SHORT_SHA}` | `v1.2.3-pre.a1b2c3d` | Release candidate |
| **Production** | `v{MAJOR}.{MINOR}.{PATCH}` | `v1.2.3` | Semantic versioning |

## 🎯 Strategy Benefits

### Development & Staging Environments
**Short SHA + Timestamp Tags**
- ✅ **Fast Deployment**: No dependency on semantic analysis
- ✅ **Clear Traceability**: Direct mapping to commits
- ✅ **Unique Identification**: Timestamp prevents conflicts
- ✅ **Development Friendly**: Easy to identify recent changes

### Pre-Production & Production Environments  
**Semantic Versioning**
- ✅ **Professional Releases**: Industry-standard versioning
- ✅ **Change Impact**: Version numbers indicate change significance
- ✅ **Release Notes**: Automatic changelog generation
- ✅ **Dependency Management**: Clear compatibility tracking

## 🔄 Version Generation Logic

### Automatic Version Generation

The pipeline automatically generates appropriate versions for each environment:

```bash
# Development Environment
dev-a1b2c3d-20241225-1430

# Staging Environment  
staging-a1b2c3d-20241225-1445

# Pre-Production/Production (auto-increment)
v1.2.4-pre.a1b2c3d  # Pre-release
v1.2.4               # Production (when semantic-release runs)
```

### Semantic Release Integration

For production deployments, the system integrates with semantic-release:

1. **Tagged Commits**: If a semantic tag exists, it's used directly
2. **Auto-increment**: Otherwise, increments patch version with pre-release suffix
3. **Final Release**: Semantic-release creates the final production tag

## 🚀 Deployment Workflow Integration

### Enhanced CI/CD Pipeline

```yaml
# Version generation step
- name: Generate Environment-Specific Versions
  run: |
    # Short SHA for dev/staging
    DEV_VERSION="dev-${SHORT_SHA}-${TIMESTAMP}"
    STAGING_VERSION="staging-${SHORT_SHA}-${TIMESTAMP}"
    
    # Semantic version for pre-prod/production
    SEMANTIC_VERSION="v1.2.3-pre.${SHORT_SHA}"
```

### Environment-Specific Deployment

```yaml
# Development deployment
- uses: ./.github/actions/enhanced-deploy
  with:
    version: ${{ needs.detect-changes.outputs.dev-version }}

# Production deployment  
- uses: ./.github/actions/enhanced-deploy
  with:
    version: ${{ needs.detect-changes.outputs.semantic-version }}
```

## 📊 Version Tracking & Monitoring

### Deployment Dashboard

Each environment tracks its own version independently:

```
🏷️ Current Deployments:
  Development:    dev-a1b2c3d-20241225-1430
  Staging:        staging-a1b2c3d-20241225-1445  
  Pre-Production: v1.2.4-pre.a1b2c3d
  Production:     v1.2.3
```

### Health Check Integration

Version information is embedded in:
- Health check endpoints
- Application headers
- Monitoring metadata
- Error reporting tags

## 🔧 Configuration

### Repository Variables

Control versioning behavior through repository variables:

```yaml
# Semantic release configuration
SEMANTIC_RELEASE_ENABLED: true
SEMANTIC_RELEASE_DRY_RUN: false

# Version format customization
VERSION_PREFIX: v
TIMESTAMP_FORMAT: "%Y%m%d-%H%M"
SHORT_SHA_LENGTH: 7
```

### Manual Overrides

Workflow dispatch allows manual version control:

```yaml
workflow_dispatch:
  inputs:
    force_version:
      description: 'Override version (production only)'
      required: false
    skip_semantic_release:
      description: 'Skip semantic versioning'
      type: boolean
      default: false
```

## 🔍 Troubleshooting

### Common Issues

**1. Version Conflicts**
```bash
# Problem: Duplicate timestamps in rapid deployments
# Solution: Includes seconds in timestamp format

# Problem: Invalid semantic versions
# Solution: Fallback to v1.0.0-pre.{sha} format
```

**2. Missing Tags**
```bash
# Check for existing tags
git tag -l "v*" | head -10

# Verify semantic-release configuration
cat .releaserc.json

# Manual semantic tag creation (emergency)
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

**3. Deployment Mismatches**
```bash
# Verify version in deployed application
curl https://yourapp.com/api/version

# Check deployment logs
az webapp log show --name your-app --resource-group your-rg
```

## 📚 Best Practices

### Development Team Guidelines

1. **Commit Messages**: Use conventional commits for semantic-release
   ```
   feat: add new user authentication
   fix: resolve login timeout issue
   docs: update API documentation
   ```

2. **Branch Strategy**: Align with versioning needs
   ```
   main -> production releases (v1.2.3)
   develop -> pre-release versions (v1.2.4-pre.abc123)
   feature/* -> development deployments (dev-abc123-timestamp)
   ```

3. **Release Planning**: Coordinate semantic releases
   - Schedule releases for low-traffic periods
   - Prepare rollback plans for major versions
   - Test pre-release versions thoroughly

### Operations Guidelines

1. **Version Monitoring**: Track version deployment across environments
2. **Rollback Procedures**: Maintain version-specific rollback capabilities  
3. **Change Tracking**: Correlate versions with change requests and incidents

## 🔗 Related Documentation

- [Enhanced Deployment Guide](./05-ENHANCED-DEPLOYMENT-GUIDE.md)
- [Environment Configuration](./03-ENVIRONMENT-CONFIGURATION.md)
- [Troubleshooting Guide](./07-TROUBLESHOOTING.md)
- [Operations Runbook](./09-OPERATIONS-RUNBOOK.md)

---
*This versioning strategy balances development velocity with production stability, providing clear traceability across all environments.*
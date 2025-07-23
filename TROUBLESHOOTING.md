# Troubleshooting Guide

This guide helps resolve common issues with the JFrog Artifactory CI/CD pipeline.

## Quick Diagnostics

### Check Pipeline Status

1. **Workflow Status:** GitHub Actions tab in your repository
2. **Artifact Status:** JFrog Artifactory repository browser
3. **Deployment Status:** Azure Static Web Apps deployment center
4. **Logs:** GitHub Actions workflow logs

### Common Symptoms

| Symptom | Likely Cause | Quick Fix |
|---------|--------------|-----------|
| Build fails | Missing dependencies or scripts | Check package.json |
| Artifact upload fails | JFrog authentication | Verify JFrog secrets |
| Deployment fails | Azure token invalid | Check Azure token |
| Artifact not found | Wrong version or repository | Verify artifact exists |

## JFrog Artifactory Issues

### Authentication Problems

**Error:** `401 Unauthorized` or `403 Forbidden`

**Causes:**
- Invalid JFrog credentials
- Expired access token
- Insufficient permissions

**Solutions:**

1. **Test connection manually:**
   ```bash
   curl -u username:token https://yourorg.jfrog.io/artifactory/api/system/ping
   ```

2. **Verify secrets in GitHub:**
   - `JFROG_URL` - Correct format with https://
   - `JFROG_USERNAME` - Valid username
   - `JFROG_ACCESS_TOKEN` - Valid, non-expired token

3. **Check JFrog permissions:**
   - User has read/write access to frontend repositories
   - Token scope includes required permissions

4. **Regenerate access token:**
   - Go to JFrog UI > Administration > Security > Access Tokens
   - Create new token with proper scope
   - Update GitHub secrets

### Repository Not Found

**Error:** `Repository 'frontend-snapshots' not found`

**Solutions:**

1. **Verify repository exists:**
   ```bash
   curl -u username:token https://yourorg.jfrog.io/artifactory/api/repositories/frontend-snapshots
   ```

2. **Create missing repositories:**
   ```bash
   ./scripts/setup-jfrog-repositories.sh
   ```

3. **Check repository permissions:**
   - Verify user has access to repository
   - Check repository configuration

### Artifact Upload Failures

**Error:** `Failed to upload artifact`

**Causes:**
- Network connectivity issues
- Repository permissions
- File size limits
- Storage quota exceeded

**Solutions:**

1. **Check artifact size:**
   ```bash
   ls -lh your-app-*.tar.gz
   ```

2. **Verify repository storage:**
   - Check JFrog storage quota
   - Review retention policies

3. **Test upload manually:**
   ```bash
   jf rt upload artifact.tar.gz frontend-snapshots/your-app/
   ```

### Artifact Download Failures

**Error:** `Artifact not found for download`

**Solutions:**

1. **List available artifacts:**
   ```bash
   jf rt search "frontend-snapshots/your-app/*.tar.gz" --sort-by=created --sort-order=desc
   ```

2. **Check artifact naming:**
   - Verify version format matches expected pattern
   - Check repository name

3. **Verify artifact integrity:**
   ```bash
   jf rt search "frontend-snapshots/your-app/your-app-version.tar.gz" --props
   ```

## GitHub Actions Issues

### Workflow Not Triggering

**Causes:**
- Branch protection rules
- Workflow file syntax errors
- Missing repository permissions

**Solutions:**

1. **Check workflow syntax:**
   ```bash
   # Validate YAML syntax
   yamllint .github/workflows/ci-cd.yml
   ```

2. **Verify trigger conditions:**
   ```yaml
   on:
     push:
       branches: [main, develop, sqe, preprod, qa]
   ```

3. **Check repository settings:**
   - Actions enabled in repository settings
   - Workflow permissions configured

### Build Failures

**Error:** `npm install failed` or `npm run build failed`

**Solutions:**

1. **Check package.json:**
   ```json
   {
     "scripts": {
       "build": "react-scripts build",
       "test": "react-scripts test --coverage --watchAll=false"
     }
   }
   ```

2. **Verify Node.js version:**
   ```yaml
   env:
     NODE_VERSION: '18'
   ```

3. **Check dependencies:**
   ```bash
   npm audit
   npm ci
   npm run build
   ```

### Secret Configuration Issues

**Error:** `Secret JFROG_URL is not set`

**Solutions:**

1. **Add missing secrets:**
   - Go to repository Settings > Secrets and variables > Actions
   - Add required secrets

2. **Verify secret names (case-sensitive):**
   ```
   AZURE_STATIC_WEB_APPS_API_TOKEN
   JFROG_URL
   JFROG_USERNAME
   JFROG_ACCESS_TOKEN
   ```

3. **Check secret scope:**
   - Repository-level secrets for app-specific values
   - Organization-level secrets for shared values

## Azure Static Web Apps Issues

### Deployment Token Issues

**Error:** `Invalid Azure Static Web Apps token`

**Solutions:**

1. **Regenerate deployment token:**
   - Go to Azure Portal > Static Web Apps
   - Select your app > Manage deployment token
   - Copy new token to GitHub secrets

2. **Verify token format:**
   ```
   Token should start with: swa-
   Example: swa-1234567890abcdef...
   ```

3. **Check environment-specific tokens:**
   - Ensure correct token for target environment
   - Verify token hasn't expired

### Deployment Failures

**Error:** `Deployment failed with status 422`

**Solutions:**

1. **Check build output:**
   ```bash
   # Verify build directory exists and contains files
   ls -la build/
   ```

2. **Validate staticwebapp.config.json:**
   ```json
   {
     "routes": [
       {
         "route": "/*",
         "serve": "/index.html",
         "statusCode": 200
       }
     ]
   }
   ```

3. **Review deployment logs:**
   - Check GitHub Actions logs
   - Review Azure deployment center

## Security Scanning Issues

### SonarCloud Issues

**Error:** `SonarCloud analysis failed`

**Solutions:**

1. **Check SonarCloud token:**
   - Verify token is valid and not expired
   - Ensure token has project permissions

2. **Verify organization configuration:**
   ```yaml
   env:
     SONAR_ORGANIZATION: your-org-name
   ```

3. **Check sonar-project.properties:**
   ```properties
   sonar.projectKey=your-project-key
   sonar.organization=your-org-name
   sonar.sources=src
   sonar.coverage.exclusions=**/*.test.js,**/*.spec.js
   ```

### Checkmarx Issues

**Error:** `Checkmarx scan failed`

**Solutions:**

1. **Verify Checkmarx credentials:**
   ```
   CHECKMARX_CLIENT_ID
   CHECKMARX_SECRET
   CHECKMARX_TENANT
   CHECKMARX_BASE_URI (optional)
   ```

2. **Check scan configuration:**
   ```yaml
   env:
     CHECKMARX_SCAN_TYPES: 'sast,sca'
   ```

3. **Review Checkmarx logs:**
   - Check for authentication errors
   - Verify scan policy compliance

## Version Management Issues

### Tag Creation Failures

**Error:** `Failed to create tag v1.2.3`

**Solutions:**

1. **Check branch name format:**
   ```bash
   # Correct format for release branches
   release/1.2.3
   release/2.0.0
   ```

2. **Verify repository permissions:**
   - GitHub Actions has permission to create tags
   - No protected tag rules preventing creation

3. **Manual tag creation:**
   ```bash
   git tag v1.2.3
   git push origin v1.2.3
   ```

### Version Conflicts

**Error:** `Tag v1.2.3 already exists`

**Solutions:**

1. **Use new version number:**
   ```bash
   git checkout -b release/1.2.4
   ```

2. **Delete existing tag (if appropriate):**
   ```bash
   git tag -d v1.2.3
   git push origin :refs/tags/v1.2.3
   ```

## Manual Deployment Issues

### Artifact Listing Failures

**Error:** `No artifacts found in repository`

**Solutions:**

1. **Check repository name:**
   - `frontend-snapshots` for development
   - `frontend-releases` for releases
   - `frontend-production` for production

2. **Verify application name:**
   ```bash
   jf rt search "frontend-snapshots/your-app/*.tar.gz"
   ```

3. **Check artifact retention:**
   - Artifacts may have been cleaned up
   - Review retention policies

### Deployment Validation Failures

**Error:** `Artifact validation failed`

**Solutions:**

1. **Check artifact integrity:**
   ```bash
   # Download and verify checksum
   jf rt download "frontend-releases/your-app/your-app-v1.2.3.tar.gz" ./
   jf rt download "frontend-releases/your-app/your-app-v1.2.3.tar.gz.sha256" ./
   sha256sum -c your-app-v1.2.3.tar.gz.sha256
   ```

2. **Verify artifact format:**
   - Correct naming convention
   - Valid tar.gz archive

## Performance Issues

### Slow Builds

**Causes:**
- Large dependencies
- Inefficient build process
- Network latency

**Solutions:**

1. **Optimize dependencies:**
   ```bash
   npm audit
   npm prune
   ```

2. **Use build caching:**
   ```yaml
   - uses: actions/setup-node@v4
     with:
       node-version: '18'
       cache: 'npm'
   ```

3. **Parallel processing:**
   - Security scans run in parallel with other jobs
   - Multiple deployment jobs run concurrently

### Large Artifacts

**Solutions:**

1. **Optimize build output:**
   ```bash
   # Check build size
   du -sh build/
   
   # Optimize assets
   npm run build:analyze
   ```

2. **Exclude unnecessary files:**
   ```bash
   # In packaging step, exclude source maps for production
   tar --exclude='*.map' -czf artifact.tar.gz -C build .
   ```

## Monitoring and Alerting

### Set Up Monitoring

1. **GitHub Actions notifications:**
   - Configure repository notifications
   - Set up Slack/Teams integration

2. **JFrog monitoring:**
   - Monitor storage usage
   - Set up retention policy alerts

3. **Azure monitoring:**
   - Monitor application performance
   - Set up deployment failure alerts

### Health Checks

Regular health checks to prevent issues:

```bash
# Weekly health check script
#!/bin/bash

# Check JFrog connectivity
curl -s -u $JFROG_USERNAME:$JFROG_ACCESS_TOKEN $JFROG_URL/artifactory/api/system/ping

# Check repository storage
jf rt curl -XGET "/api/storageinfo"

# List recent artifacts
jf rt search "frontend-*/your-app/*.tar.gz" --limit=10
```

## Getting Help

### Escalation Path

1. **Self-Service:**
   - Check this troubleshooting guide
   - Review workflow logs
   - Test components individually

2. **Team Support:**
   - Create issue in shared workflows repository
   - Include workflow run URL and logs
   - Describe environment and impact

3. **Vendor Support:**
   - JFrog support for Artifactory issues
   - Azure support for Static Web Apps issues
   - GitHub support for Actions issues

### Useful Commands

```bash
# JFrog CLI debugging
jf rt ping
jf rt curl -XGET "/api/system/info"

# GitHub CLI debugging
gh workflow list
gh run list --workflow=ci-cd.yml

# Azure CLI debugging
az staticwebapp list
az staticwebapp show --name your-app
```

### Log Collection

When reporting issues, include:

1. **GitHub Actions logs** - Full workflow log output
2. **JFrog logs** - Artifactory operation logs
3. **Azure logs** - Static Web Apps deployment logs
4. **Configuration** - Workflow files and settings (sanitized)
5. **Environment** - Repository, branch, and timing information

This troubleshooting guide covers the most common issues. For complex problems, follow the escalation path and provide detailed information for faster resolution.
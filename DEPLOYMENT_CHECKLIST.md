# Frontend Application Deployment Checklist

Use this checklist to ensure proper integration and deployment of your frontend application with the shared CI/CD workflow.

## Pre-Integration Checklist

### Prerequisites Verified

- [ ] **Frontend application** is working locally
- [ ] **Node.js version** is specified (recommend v18+)
- [ ] **Build command** works locally (`npm run build`)
- [ ] **Test command** works locally (`npm test`)
- [ ] **GitHub repository** has Actions enabled
- [ ] **Admin access** to repository for secrets configuration

### Azure Resources Ready

- [ ] **Azure subscription** access
- [ ] **Azure Static Web Apps** created for each environment:
**- [ ] Development environment
**- [ ] Staging environment
**- [ ] Pre-production environment
**- [ ] Production environment
- [ ] **Deployment tokens** collected from each Azure Static Web App

### Security Tools Setup

#### SonarCloud:
- [ ] **SonarCloud account** access
- [ ] **Organization** created/exists
- [ ] **Project** created for your repository
- [ ] **API token** generated with appropriate permissions

#### Checkmarx:
- [ ] **Checkmarx AST account** access
- [ ] **Tenant name** identified
- [ ] **API client** created with scanning permissions
- [ ] **Client ID and Secret** obtained

## Integration Checklist

### Workflow Files Created

- [ ] **Main CI/CD workflow** created at `.github/workflows/ci-cd.yml`
- [ ] **PR security check** copied to `.github/workflows/pr-security-check.yml`
- [ ] **Shared workflow reference** updated with correct organization/repository

### Repository Secrets Configured

#### Azure Static Web Apps:
- [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN_DEV`
- [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING`
- [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD`
- [ ] `AZURE_STATIC_WEB_APPS_API_TOKEN_PROD`

#### SonarCloud:
- [ ] `SONAR_TOKEN`

#### Checkmarx:
- [ ] `CHECKMARX_CLIENT_ID`
- [ ] `CHECKMARX_SECRET`
- [ ] `CHECKMARX_TENANT`
- [ ] `CHECKMARX_BASE_URI` (if using custom server)

### Repository Variables Configured

- [ ] `SONAR_ORGANIZATION`

### Project Configuration Files

- [ ] **SonarCloud config** created: `sonar-project.properties`
- [ ] **Azure Static Web Apps config** created: `staticwebapp.config.json` (optional)
- [ ] **Package.json scripts** updated with required commands:
**- [ ] `build` command
**- [ ] `test` command
**- [ ] `test:coverage` command (optional)

### Framework-Specific Configuration

#### React Applications:
- [ ] `output-location: 'build'`
- [ ] `build-command: 'npm run build'`
- [ ] React build works locally

#### Vue.js Applications:
- [ ] `output-location: 'dist'`
- [ ] `build-command: 'npm run build'`
- [ ] Vue build works locally

#### Next.js Applications:
- [ ] `output-location: 'out'`
- [ ] `build-command: 'npm run build && npm run export'`
- [ ] Next.js build and export works locally

#### Angular Applications:
- [ ] `output-location: 'dist/your-app-name'`
- [ ] `build-command: 'npm run build -- --prod'`
- [ ] Angular build works locally

## Testing Checklist

### Local Testing

- [ ] **Dependencies install** successfully: `npm ci`
- [ ] **Build succeeds** locally: `npm run build`
- [ ] **Tests pass** locally: `npm test`
- [ ] **Build output directory** exists and contains files

### First Deployment Test

- [ ] **Push to develop branch** triggers workflow
- [ ] **Build job** completes successfully
- [ ] **SonarCloud analysis** runs (if enabled)
- [ ] **Checkmarx scan** runs (if enabled)
- [ ] **Development deployment** succeeds
- [ ] **Deployment URL** is accessible
- [ ] **Application loads** correctly

### PR Security Check Test

- [ ] **Create test PR** from feature branch
- [ ] **PR security workflow** triggers automatically
- [ ] **Security scans** complete successfully
- [ ] **PR comment** posted with security results
- [ ] **PR status checks** show proper results

### Multi-Environment Testing

- [ ] **Staging deployment** works (push to staging branch)
- [ ] **Pre-production deployment** works (push to preprod branch)
- [ ] **Production deployment** works (push to main branch)
- [ ] **All environment URLs** are accessible
- [ ] **Environment-specific configurations** work correctly

## Security Validation

### SonarCloud Integration

- [ ] **Project appears** in SonarCloud dashboard
- [ ] **Code analysis** results visible
- [ ] **Coverage reports** uploaded (if available)
- [ ] **Quality gate status** displayed correctly
- [ ] **Security hotspots** identified (if any)

### Checkmarx Integration

- [ ] **Scan results** appear in Checkmarx portal
- [ ] **SAST results** generated for code analysis
- [ ] **SCA results** generated for dependency scanning
- [ ] **Vulnerability counts** match workflow outputs
- [ ] **Security thresholds** enforced correctly

### Security Compliance

- [ ] **Critical vulnerabilities** within acceptable limits
- [ ] **High vulnerabilities** within acceptable limits
- [ ] **Code coverage** meets minimum threshold
- [ ] **Security policies** compliance verified

## Production Readiness

### Performance Validation

- [ ] **Build times** are reasonable (< 10 minutes)
- [ ] **Deployment times** are acceptable (< 5 minutes)
- [ ] **Application performance** is satisfactory
- [ ] **Bundle size** is optimized

### Monitoring Setup

- [ ] **Deployment success/failure** notifications configured
- [ ] **Security scan results** monitored
- [ ] **Application health checks** working
- [ ] **Error monitoring** in place (optional)

### Documentation

- [ ] **Team informed** about new CI/CD process
- [ ] **Deployment procedures** documented
- [ ] **Troubleshooting guide** accessible
- [ ] **Emergency contacts** identified

## Post-Deployment Validation

### Deployment Verification

- [ ] **All environments** accessible via provided URLs
- [ ] **Application functionality** working correctly
- [ ] **Static assets** loading properly
- [ ] **Routing** working correctly (SPA)
- [ ] **API endpoints** functioning (if applicable)

### Security Verification

- [ ] **HTTPS** enabled on all environments
- [ ] **Security headers** properly configured
- [ ] **Content Security Policy** working
- [ ] **No sensitive information** exposed

### Operational Verification

- [ ] **Deployment logs** accessible in GitHub Actions
- [ ] **Azure Static Web Apps** logs available
- [ ] **Monitoring alerts** configured
- [ ] **Backup procedures** documented

## Troubleshooting Checklist

### Common Issues Resolved

- [ ] **Workflow file syntax** validated
- [ ] **Secrets spelling** verified (case-sensitive)
- [ ] **Repository permissions** confirmed
- [ ] **API token validity** checked
- [ ] **Build output location** matches configuration
- [ ] **Node.js version** compatibility verified

### Security Issues Resolved

- [ ] **SonarCloud organization** permissions verified
- [ ] **Checkmarx tenant** access confirmed
- [ ] **API rate limits** not exceeded
- [ ] **Token expiration dates** noted
- [ ] **Network connectivity** to security services confirmed

## Success Metrics

### Deployment Success Indicators

- [ ] **Build success rate** > 95%
- [ ] **Deployment success rate** > 95%
- [ ] **Security scan completion** > 90%
- [ ] **Average build time** < 10 minutes
- [ ] **Average deployment time** < 5 minutes

### Security Metrics

- [ ] **Critical vulnerabilities** = 0
- [ ] **High vulnerabilities** ≤ threshold
- [ ] **Code coverage** ≥ minimum threshold
- [ ] **Security scan frequency** meets requirements
- [ ] **Vulnerability remediation time** tracked

## Final Validation

### Complete Integration Verified

- [ ] **End-to-end deployment** successful for all environments
- [ ] **Security scanning** integrated and functional
- [ ] **Team training** completed on new workflow
- [ ] **Documentation** complete and accessible
- [ ] **Monitoring and alerting** operational
- [ ] **Backup and recovery** procedures tested

### Sign-off

- [ ] **Development Team** approval
- [ ] **DevOps Team** approval
- [ ] **Security Team** approval
- [ ] **Operations Team** approval

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Approved By:** _______________

**Notes:
_________________________________
_________________________________
_________________________________

This checklist ensures comprehensive validation of your frontend application deployment with the shared CI/CD workflow! 
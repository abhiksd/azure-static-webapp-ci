# 🔧 Troubleshooting Guide

This comprehensive troubleshooting guide helps you diagnose and resolve common issues with Azure Static Web Apps deployment, monitoring, and operations.

## 📋 Table of Contents

1. [Common Issues](#common-issues)
2. [Deployment Problems](#deployment-problems)
3. [Build & CI/CD Issues](#build--cicd-issues)
4. [Azure Key Vault Issues](#azure-key-vault-issues)
5. [Monitoring & Health Check Issues](#monitoring--health-check-issues)
6. [Performance Issues](#performance-issues)
7. [Security & Authentication Issues](#security--authentication-issues)
8. [Diagnostic Tools](#diagnostic-tools)

## 🚨 Common Issues

### Issue: Application Not Loading

**Symptoms:**
- Blank page or 404 errors
- Console errors about missing resources
- Static assets not loading

**Diagnosis:**
```bash
# Check if the deployment was successful
az staticwebapp show --name "myapp-swa-prod-eastus2" --resource-group "myapp-rg-prod-eastus2"

# Check the deployment status
curl -I https://yourdomain.com

# Verify DNS resolution
nslookup yourdomain.com
dig yourdomain.com
```

**Solutions:**
1. **Check Build Configuration:**
   ```json
   // Verify build location in package.json
   {
     "scripts": {
       "build": "react-scripts build"
     }
   }
   ```

2. **Verify Static Web App Configuration:**
   ```yaml
   # In GitHub Actions workflow
   - name: Deploy to Azure Static Web Apps
     uses: Azure/static-web-apps-deploy@v1
     with:
       app_location: "."
       build_location: "build"  # Ensure this matches your build output
   ```

3. **Check Custom Domain Setup:**
   ```bash
   # Verify custom domain configuration
   az staticwebapp hostname list --name "myapp-swa-prod-eastus2" --resource-group "myapp-rg-prod-eastus2"
   ```

### Issue: Environment Variables Not Working

**Symptoms:**
- Features not working correctly across environments
- Configuration values showing as undefined
- Environment detection failing

**Diagnosis:**
```bash
# Check environment variables in browser console
console.log('REACT_APP_ENV:', process.env.REACT_APP_ENV);
console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);

# Verify build-time variables
npm run build 2>&1 | grep REACT_APP_
```

**Solutions:**
1. **Verify Environment Variable Naming:**
   ```bash
   # Only REACT_APP_ prefixed variables are available in browser
   REACT_APP_API_URL=https://api.example.com  # ✅ Correct
   API_URL=https://api.example.com            # ❌ Not available in browser
   ```

2. **Check GitHub Actions Configuration:**
   ```yaml
   - name: Build Application
     run: |
       export REACT_APP_ENV="${{ matrix.environment }}"
       export REACT_APP_API_URL="${{ env.API_URL }}"
       npm run build:prod
   ```

3. **Validate Environment Detection:**
   ```javascript
   // src/utils/environment.js
   export function getEnvironmentInfo() {
     console.log('Current hostname:', window.location.hostname);
     console.log('Environment variables:', {
       REACT_APP_ENV: process.env.REACT_APP_ENV,
       REACT_APP_BUILD_ID: process.env.REACT_APP_BUILD_ID
     });
   }
   ```

## 🚀 Deployment Problems

### Issue: GitHub Actions Deployment Failing

**Symptoms:**
- GitHub Actions workflow failing
- "Resource not found" errors
- Authentication failures

**Diagnosis:**
```bash
# Check GitHub Actions logs
gh run list --workflow=enhanced-ci-cd.yml --limit=5
gh run view <run-id> --log

# Verify Azure credentials
az account show
az staticwebapp list --output table
```

**Common Deployment Errors and Solutions:**

#### 1. **Authentication Error**
```
Error: The Azure Static Web Apps deployment token is invalid
```

**Solution:**
```bash
# Regenerate deployment token
az staticwebapp secrets list --name "myapp-swa-prod-eastus2" --resource-group "myapp-rg-prod-eastus2"

# Update GitHub secret
gh secret set AZURE_STATIC_WEB_APPS_API_TOKEN_PROD --body "new-token"
```

#### 2. **Build Timeout**
```
Error: Build process timed out after 10 minutes
```

**Solution:**
```yaml
# Optimize build in GitHub Actions
- name: Build Application
  run: |
    export NODE_OPTIONS="--max-old-space-size=4096"
    npm ci --prefer-offline --no-audit
    npm run build:prod
```

#### 3. **Resource Group Not Found**
```
Error: Resource group 'myapp-rg-prod-eastus2' not found
```

**Solution:**
```bash
# Verify resource group exists
az group list --output table | grep myapp

# Create if missing
az group create --name "myapp-rg-prod-eastus2" --location "East US 2"
```

### Issue: Deployment Succeeds but Changes Not Visible

**Symptoms:**
- Deployment reported as successful
- Old version still showing
- Changes not reflected in production

**Diagnosis:**
```bash
# Check deployment history
az staticwebapp show --name "myapp-swa-prod-eastus2" --resource-group "myapp-rg-prod-eastus2" --query "defaultHostname"

# Verify build output
ls -la build/
cat build/static/js/*.js | grep "BUILD_ID"

# Check CDN cache
curl -H "Cache-Control: no-cache" https://yourdomain.com/api/version
```

**Solutions:**
1. **Clear Browser Cache:**
   ```bash
   # Force refresh in browser
   Ctrl+F5 (Windows/Linux) or Cmd+Shift+R (Mac)
   ```

2. **Verify Build Process:**
   ```bash
   # Check if build includes latest changes
   npm run build
   grep -r "your-recent-change" build/
   ```

3. **Check Static Web App Configuration:**
   ```yaml
   # Ensure app_location and build_location are correct
   app_location: "."
   build_location: "build"
   action: "upload"
   skip_app_build: false
   ```

## 🔨 Build & CI/CD Issues

### Issue: NPM Install Failures

**Symptoms:**
- Package installation errors
- Dependency resolution conflicts
- Out of memory errors during install

**Diagnosis:**
```bash
# Check npm cache
npm cache verify

# Check package-lock.json integrity
npm ci --dry-run

# Check Node.js version compatibility
node --version
npm --version
```

**Solutions:**
1. **Clear NPM Cache:**
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Fix Dependency Conflicts:**
   ```bash
   # Check for audit issues
   npm audit
   npm audit fix

   # Resolve peer dependency warnings
   npm install --legacy-peer-deps
   ```

3. **Optimize for CI/CD:**
   ```yaml
   - name: Setup Node.js
     uses: actions/setup-node@v4
     with:
       node-version: '18'
       cache: 'npm'
   
   - name: Install dependencies
     run: |
       npm ci --prefer-offline --no-audit
     env:
       NODE_OPTIONS: "--max-old-space-size=4096"
   ```

### Issue: Test Failures in CI/CD

**Symptoms:**
- Tests passing locally but failing in CI
- Timeout errors in test execution
- Environment-specific test failures

**Diagnosis:**
```bash
# Run tests locally with CI environment
CI=true npm test

# Check test coverage
npm run test:coverage

# Run tests with debugging
npm test -- --verbose --detectOpenHandles
```

**Solutions:**
1. **Fix Environment-Specific Issues:**
   ```javascript
   // tests/setup.js
   // Mock browser APIs not available in Node.js
   global.matchMedia = global.matchMedia || function () {
     return {
       matches: false,
       addListener: function () {},
       removeListener: function () {}
     };
   };
   ```

2. **Increase Test Timeout:**
   ```json
   // package.json
   {
     "scripts": {
       "test": "react-scripts test --testTimeout=10000"
     }
   }
   ```

3. **Optimize Test Performance:**
   ```yaml
   # GitHub Actions optimization
   - name: Run tests
     run: npm test -- --coverage --ci --maxWorkers=2
     env:
       CI: true
   ```

## 🔐 Azure Key Vault Issues

### Issue: Key Vault Access Denied (Managed Identity)

**Symptoms:**
- "Access denied" errors when retrieving secrets
- Authentication failures in GitHub Actions
- Secrets showing as undefined
- "Azure CLI is not authenticated" errors

**Diagnosis:**
```bash
# Test managed identity authentication
az account show

# Test Key Vault access
az keyvault secret show --vault-name "myapp-kv-prod-eastus2" --name "API-Key"

# Check RBAC permissions
az role assignment list --assignee $(az account show --query user.name -o tsv) --scope /subscriptions/<subscription-id>/resourceGroups/<rg-name>/providers/Microsoft.KeyVault/vaults/<vault-name>

# Verify Key Vault RBAC is enabled
az keyvault show --name "myapp-kv-prod-eastus2" --query "properties.enableRbacAuthorization"
```

**Solutions:**
1. **Configure Managed Identity on Runner:**
   ```bash
   # Ensure GitHub runner has managed identity enabled (done during deployment)
   # This cannot be fixed from the workflow - contact your infrastructure team
   
   # Verify managed identity is working
   az account show
   ```

2. **Grant RBAC Permissions:**
   ```bash
   # Get managed identity ID
   MANAGED_IDENTITY_ID=$(az account show --query user.name -o tsv)
   
   # Grant Key Vault Secrets User role
   az role assignment create \
     --assignee "$MANAGED_IDENTITY_ID" \
     --role "Key Vault Secrets User" \
     --scope "/subscriptions/<subscription-id>/resourceGroups/<rg-name>/providers/Microsoft.KeyVault/vaults/<vault-name>"
   ```

3. **Enable RBAC Authorization on Key Vault:**
   ```bash
   # Enable RBAC authorization (required for managed identity)
   az keyvault update \
     --name "myapp-kv-prod-eastus2" \
     --enable-rbac-authorization true
   ```

4. **Check Network Restrictions:**
   ```bash
   # Allow GitHub Actions IP ranges (if using network restrictions)
   az keyvault update --name "myapp-kv-prod-eastus2" --bypass AzureServices --default-action Allow
   
   # Or allow managed identity specifically
   az keyvault network-rule add \
     --name "myapp-kv-prod-eastus2" \
     --vnet-name <vnet-name> \
     --subnet <subnet-name>
   ```

### Issue: Secret Not Found

**Symptoms:**
- "Secret not found" errors
- Null or undefined secret values
- Workflow failures when retrieving secrets

**Diagnosis:**
```bash
# List all secrets in Key Vault
az keyvault secret list --vault-name "myapp-kv-prod-eastus2" --output table

# Check secret name and version
az keyvault secret show --vault-name "myapp-kv-prod-eastus2" --name "API-Key" --query "name"
```

**Solutions:**
1. **Verify Secret Names:**
   ```bash
   # Secret names are case-sensitive
   az keyvault secret show --vault-name "myapp-kv-prod-eastus2" --name "API-Key"  # ✅
   az keyvault secret show --vault-name "myapp-kv-prod-eastus2" --name "api-key"  # ❌
   ```

2. **Create Missing Secrets:**
   ```bash
   # Create the missing secret
   az keyvault secret set --vault-name "myapp-kv-prod-eastus2" --name "API-Key" --value "your-secret-value"
   ```

3. **Fix GitHub Actions Secret Retrieval:**
   ```yaml
   - name: Get Secrets from Key Vault
     run: |
       # Use exact secret name
       API_KEY=$(az keyvault secret show --vault-name "${{ env.KEYVAULT_NAME }}" --name "API-Key" --query "value" --output tsv)
       echo "::add-mask::$API_KEY"
       echo "API_KEY=$API_KEY" >> $GITHUB_ENV
   ```

## 📊 Monitoring & Health Check Issues

### Issue: Health Checks Failing

**Symptoms:**
- Health endpoints returning 500 errors
- Inconsistent health check results
- False positive alerts

**Diagnosis:**
```bash
# Test health endpoint manually
curl -v https://yourdomain.com/api/health

# Check health check logs
az monitor app-insights query \
  --app "myapp-ai-prod-eastus2" \
  --analytics-query "requests | where url contains 'health' | order by timestamp desc"

# Verify health check configuration
npm run health-check -- --environment=production
```

**Solutions:**
1. **Fix Health Check Endpoint:**
   ```javascript
   // api/health.js
   router.get('/health', async (req, res) => {
     try {
       const healthChecks = {
         timestamp: new Date().toISOString(),
         status: 'healthy',
         checks: {}
       };
       
       // Add timeout to external checks
       const checkPromises = [
         checkDatabase().catch(e => ({ status: 'unhealthy', error: e.message })),
         checkExternalAPIs().catch(e => ({ status: 'unhealthy', error: e.message }))
       ];
       
       const results = await Promise.allSettled(checkPromises);
       // Process results...
       
       res.status(200).json(healthChecks);
     } catch (error) {
       res.status(503).json({ status: 'unhealthy', error: error.message });
     }
   });
   ```

2. **Adjust Health Check Timeouts:**
   ```javascript
   // src/context/HealthContext.js
   const checkHealth = async () => {
     try {
       const controller = new AbortController();
       const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
       
       const response = await fetch('/api/health', {
         signal: controller.signal
       });
       
       clearTimeout(timeoutId);
       // Process response...
     } catch (error) {
       if (error.name === 'AbortError') {
         console.warn('Health check timed out');
       }
     }
   };
   ```

3. **Configure Alert Thresholds:**
   ```bash
   # Adjust alert sensitivity
   az monitor metrics alert update \
     --name "health-check-alert" \
     --condition "avg healthCheck/failed > 3" \
     --window-size 10m \
     --evaluation-frequency 5m
   ```

### Issue: Application Insights Not Collecting Data

**Symptoms:**
- No telemetry data in Application Insights
- Missing user sessions or page views
- Custom events not appearing

**Diagnosis:**
```bash
# Check Application Insights configuration
az monitor app-insights component show --app "myapp-ai-prod-eastus2" --resource-group "myapp-rg-prod-eastus2"

# Verify instrumentation key
echo $REACT_APP_APP_INSIGHTS_KEY

# Check browser console for errors
# Look for Application Insights initialization errors
```

**Solutions:**
1. **Verify Instrumentation Key:**
   ```javascript
   // src/utils/analytics.js
   export function initializeAppInsights() {
     const instrumentationKey = process.env.REACT_APP_APP_INSIGHTS_KEY;
     
     if (!instrumentationKey) {
       console.error('❌ Application Insights instrumentation key not found');
       return null;
     }
     
     console.log('✅ Initializing Application Insights with key:', instrumentationKey.substring(0, 8) + '...');
     // Rest of initialization...
   }
   ```

2. **Fix CORS Issues:**
   ```javascript
   // Application Insights configuration
   const appInsights = new ApplicationInsights({
     config: {
       instrumentationKey,
       enableCorsCorrelation: true,
       enableRequestHeaderTracking: true,
       enableResponseHeaderTracking: true,
       correlationHeaderExcludedDomains: ['localhost:3000']
     }
   });
   ```

3. **Test Data Collection:**
   ```javascript
   // Test custom event tracking
   import { trackEvent } from './utils/analytics';
   
   function testTracking() {
     trackEvent('Test Event', { 
       environment: process.env.REACT_APP_ENV,
       timestamp: new Date().toISOString()
     });
     console.log('Test event sent to Application Insights');
   }
   ```

## ⚡ Performance Issues

### Issue: Slow Page Load Times

**Symptoms:**
- High Time to First Byte (TTFB)
- Large bundle sizes
- Poor Lighthouse scores

**Diagnosis:**
```bash
# Analyze bundle size
npm run build
npm install -g bundlephobia
bundlephobia analyze package.json

# Check performance metrics
npm install -g lighthouse
lighthouse https://yourdomain.com --output html --output-path lighthouse-report.html

# Analyze webpack bundle
npm install --save-dev webpack-bundle-analyzer
npx webpack-bundle-analyzer build/static/js/*.js
```

**Solutions:**
1. **Optimize Bundle Size:**
   ```javascript
   // Use dynamic imports for code splitting
   const Dashboard = React.lazy(() => import('./components/Dashboard'));
   const Settings = React.lazy(() => import('./components/Settings'));
   
   function App() {
     return (
       <Suspense fallback={<div>Loading...</div>}>
         <Routes>
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/settings" element={<Settings />} />
         </Routes>
       </Suspense>
     );
   }
   ```

2. **Implement Resource Optimization:**
   ```javascript
   // src/index.js
   import { createRoot } from 'react-dom/client';
   
   // Preload critical resources
   const preloadCriticalResources = () => {
     const link = document.createElement('link');
     link.rel = 'preload';
     link.href = '/api/health';
     link.as = 'fetch';
     document.head.appendChild(link);
   };
   
   preloadCriticalResources();
   ```

3. **Configure Performance Budget:**
   ```json
   // package.json
   {
     "size-limit": [
       {
         "path": "build/static/js/*.js",
         "limit": "2 MB"
       },
       {
         "path": "build/static/css/*.css",
         "limit": "500 KB"
       }
     ]
   }
   ```

### Issue: Memory Leaks

**Symptoms:**
- Browser becoming unresponsive
- Increasing memory usage over time
- Console warnings about memory leaks

**Diagnosis:**
```javascript
// Add memory monitoring
function monitorMemory() {
  if (performance.memory) {
    console.log('Memory usage:', {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576) + ' MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1048576) + ' MB',
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1048576) + ' MB'
    });
  }
}

setInterval(monitorMemory, 30000); // Monitor every 30 seconds
```

**Solutions:**
1. **Fix Event Listener Leaks:**
   ```javascript
   // useEffect cleanup
   useEffect(() => {
     const handleResize = () => {
       // Handle resize
     };
     
     window.addEventListener('resize', handleResize);
     
     return () => {
       window.removeEventListener('resize', handleResize);
     };
   }, []);
   ```

2. **Cleanup Intervals and Timeouts:**
   ```javascript
   // src/context/HealthContext.js
   useEffect(() => {
     let intervalId;
     
     if (autoRefresh) {
       intervalId = setInterval(refreshHealthData, refreshInterval);
     }
     
     return () => {
       if (intervalId) {
         clearInterval(intervalId);
       }
     };
   }, [autoRefresh, refreshInterval]);
   ```

## 🔒 Security & Authentication Issues

### Issue: CORS Errors

**Symptoms:**
- Browser blocking API requests
- "Access-Control-Allow-Origin" errors
- Failed cross-origin requests

**Diagnosis:**
```bash
# Test CORS headers
curl -H "Origin: https://yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://api.yourdomain.com/health

# Check browser network tab for CORS errors
```

**Solutions:**
1. **Configure API CORS:**
   ```javascript
   // Express.js API configuration
   const cors = require('cors');
   
   const corsOptions = {
     origin: [
       'https://yourdomain.com',
       'https://staging.yourdomain.com',
       'https://dev.yourdomain.com'
     ],
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
   };
   
   app.use(cors(corsOptions));
   ```

2. **Configure Azure Static Web Apps:**
   ```json
   // staticwebapp.config.json
   {
     "routes": [
       {
         "route": "/api/*",
         "allowedRoles": ["anonymous"]
       }
     ],
     "responseOverrides": {
       "404": {
         "rewrite": "/index.html"
       }
     }
   }
   ```

## 🛠️ Diagnostic Tools

### Health Check Script

```bash
#!/bin/bash
# scripts/diagnose-health.sh

PROJECT_NAME="myapp"
ENVIRONMENT="$1"

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 <environment>"
    exit 1
fi

echo "🔍 Running comprehensive health diagnostics for $ENVIRONMENT"

# Test DNS resolution
echo "📡 Testing DNS resolution..."
nslookup "$ENVIRONMENT.yourdomain.com" || echo "❌ DNS resolution failed"

# Test SSL certificate
echo "🔒 Testing SSL certificate..."
openssl s_client -connect "$ENVIRONMENT.yourdomain.com:443" -servername "$ENVIRONMENT.yourdomain.com" < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Test HTTP response
echo "🌐 Testing HTTP response..."
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$ENVIRONMENT.yourdomain.com")
echo "HTTP Status: $HTTP_STATUS"

# Test health endpoint
echo "🏥 Testing health endpoint..."
curl -s "https://$ENVIRONMENT.yourdomain.com/api/health" | jq . || echo "❌ Health endpoint failed"

# Test performance
echo "⚡ Testing performance..."
RESPONSE_TIME=$(curl -w "%{time_total}" -s -o /dev/null "https://$ENVIRONMENT.yourdomain.com")
echo "Response time: ${RESPONSE_TIME}s"

# Test Azure resources
echo "☁️ Testing Azure resources..."
az staticwebapp show --name "${PROJECT_NAME}-swa-${ENVIRONMENT}-eastus2" --resource-group "${PROJECT_NAME}-rg-${ENVIRONMENT}-eastus2" --query "defaultHostname" || echo "❌ Azure Static Web App not found"

echo "✅ Diagnostics completed"
```

### Log Analysis Script

```bash
#!/bin/bash
# scripts/analyze-logs.sh

ENVIRONMENT="$1"
HOURS="${2:-24}"

if [ -z "$ENVIRONMENT" ]; then
    echo "Usage: $0 <environment> [hours]"
    exit 1
fi

echo "📊 Analyzing logs for $ENVIRONMENT environment (last $HOURS hours)"

# Query Application Insights
az monitor app-insights query \
  --app "myapp-ai-${ENVIRONMENT}-eastus2" \
  --analytics-query "
    requests
    | where timestamp > ago(${HOURS}h)
    | summarize 
        count(),
        avg(duration),
        percentile(duration, 95),
        countif(success == false)
    | extend errorRate = (countif_success_false * 100.0) / count_
  " \
  --output table

# Query recent errors
echo "🚨 Recent errors:"
az monitor app-insights query \
  --app "myapp-ai-${ENVIRONMENT}-eastus2" \
  --analytics-query "
    exceptions
    | where timestamp > ago(${HOURS}h)
    | summarize count() by type, outerMessage
    | order by count_ desc
  " \
  --output table

echo "✅ Log analysis completed"
```

## 🔗 Related Documentation

- [Infrastructure Setup Guide](./01-INFRASTRUCTURE-SETUP.md)
- [Deployment Guide](./02-DEPLOYMENT-GUIDE.md)
- [Monitoring Guide](./05-MONITORING-GUIDE.md)
- [Security Best Practices](./08-SECURITY-BEST-PRACTICES.md)

---

**Last Updated:** December 2024  
**Version:** 1.0.0
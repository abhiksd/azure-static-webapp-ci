# ⚙️ Environment Configuration Guide

This guide explains how environment configurations are managed in the frontend application and how they're used during deployment to different environments.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Environment Detection](#environment-detection)
3. [Configuration Structure](#configuration-structure)
4. [Build-Time Configuration](#build-time-configuration)
5. [Runtime Configuration](#runtime-configuration)
6. [Environment-Specific Settings](#environment-specific-settings)
7. [Deployment Integration](#deployment-integration)
8. [Local Development](#local-development)

## 🎯 Overview

The application uses a multi-layered configuration system that automatically detects the deployment environment and applies appropriate settings for:

- **API Endpoints** - Environment-specific backend URLs
- **Feature Flags** - Enable/disable features per environment  
- **Monitoring Settings** - Different monitoring levels per environment
- **Performance Budgets** - Environment-specific performance thresholds
- **Security Settings** - Environment-appropriate security configurations

## 🔍 Environment Detection

### Automatic Environment Detection

The application automatically detects the environment using multiple methods:

```javascript
// src/utils/environment.js
export function getEnvironmentInfo() {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  let environment = {
    name: 'development',
    displayName: 'Development',
    version: process.env.REACT_APP_VERSION || '1.0.0',
    buildId: process.env.REACT_APP_BUILD_ID || 'local-dev',
    deployedAt: process.env.REACT_APP_DEPLOYED_AT || new Date().toISOString(),
    status: 'healthy'
  };

  // Azure Static Web Apps environment detection
  if (hostname.includes('.azurestaticapps.net')) {
    if (hostname.includes('-dev') || hostname.includes('.1.')) {
      environment.name = 'development';
      environment.apiUrl = 'https://dev-api.example.com';
    } else if (hostname.includes('-staging') || hostname.includes('.2.')) {
      environment.name = 'staging';
      environment.apiUrl = 'https://staging-api.example.com';
    } else if (hostname.includes('-preprod') || hostname.includes('.3.')) {
      environment.name = 'pre-production';
      environment.apiUrl = 'https://preprod-api.example.com';
    } else {
      environment.name = 'production';
      environment.apiUrl = 'https://api.example.com';
    }
  }

  // Custom domain detection
  if (hostname === 'yourdomain.com') {
    environment.name = 'production';
    environment.apiUrl = 'https://api.yourdomain.com';
  } else if (hostname === 'staging.yourdomain.com') {
    environment.name = 'staging';
    environment.apiUrl = 'https://staging-api.yourdomain.com';
  }

  return environment;
}
```

### Environment Mapping

| Environment | Domain Pattern | Environment Name | API Base URL |
|-------------|----------------|------------------|--------------|
| **Development** | `dev.yourdomain.com` or `*-dev.azurestaticapps.net` | `development` | `https://dev-api.yourdomain.com` |
| **Staging** | `staging.yourdomain.com` or `*-staging.azurestaticapps.net` | `staging` | `https://staging-api.yourdomain.com` |
| **Pre-Production** | `preprod.yourdomain.com` or `*-preprod.azurestaticapps.net` | `pre-production` | `https://preprod-api.yourdomain.com` |
| **Production** | `yourdomain.com` or `*.azurestaticapps.net` (primary) | `production` | `https://api.yourdomain.com` |
| **Local** | `localhost` or `127.0.0.1` | `development` | `http://localhost:3001` |

## 🏗️ Configuration Structure

### Environment Configuration Files

The application uses JSON configuration files for each environment:

```
environments/
├── development.json      # Development environment settings
├── staging.json         # Staging environment settings  
├── pre-production.json  # Pre-production environment settings
└── production.json      # Production environment settings
```

#### Development Configuration (`environments/development.json`)

```json
{
  "environment": "development",
  "api": {
    "baseUrl": "http://localhost:3001",
    "timeout": 30000,
    "retries": 3
  },
  "features": {
    "enableDebugMode": true,
    "enableMocking": true,
    "enableAnalytics": false,
    "enablePerformanceMonitoring": false,
    "enableRealTimeUpdates": true,
    "enableExperimentalFeatures": true
  },
  "monitoring": {
    "healthCheckInterval": 60000,
    "metricsCollectionInterval": 30000,
    "enableDetailedLogging": true,
    "logLevel": "debug"
  },
  "performance": {
    "enablePerformanceBudget": false,
    "maxBundleSize": "5MB",
    "maxLoadTime": 5000
  },
  "security": {
    "enableCSP": false,
    "enableSRI": false,
    "enableHSTS": false
  },
  "ui": {
    "theme": "light",
    "enableAnimations": true,
    "showBuildInfo": true
  }
}
```

#### Staging Configuration (`environments/staging.json`)

```json
{
  "environment": "staging",
  "api": {
    "baseUrl": "https://staging-api.yourdomain.com",
    "timeout": 30000,
    "retries": 3
  },
  "features": {
    "enableDebugMode": true,
    "enableMocking": false,
    "enableAnalytics": true,
    "enablePerformanceMonitoring": true,
    "enableRealTimeUpdates": true,
    "enableExperimentalFeatures": false
  },
  "monitoring": {
    "healthCheckInterval": 120000,
    "metricsCollectionInterval": 60000,
    "enableDetailedLogging": true,
    "logLevel": "info"
  },
  "performance": {
    "enablePerformanceBudget": true,
    "maxBundleSize": "3MB",
    "maxLoadTime": 3000
  },
  "security": {
    "enableCSP": true,
    "enableSRI": true,
    "enableHSTS": false
  },
  "ui": {
    "theme": "light",
    "enableAnimations": true,
    "showBuildInfo": true
  }
}
```

#### Production Configuration (`environments/production.json`)

```json
{
  "environment": "production",
  "api": {
    "baseUrl": "https://api.yourdomain.com",
    "timeout": 15000,
    "retries": 2
  },
  "features": {
    "enableDebugMode": false,
    "enableMocking": false,
    "enableAnalytics": true,
    "enablePerformanceMonitoring": true,
    "enableRealTimeUpdates": false,
    "enableExperimentalFeatures": false
  },
  "monitoring": {
    "healthCheckInterval": 300000,
    "metricsCollectionInterval": 300000,
    "enableDetailedLogging": false,
    "logLevel": "error"
  },
  "performance": {
    "enablePerformanceBudget": true,
    "maxBundleSize": "2MB",
    "maxLoadTime": 2000
  },
  "security": {
    "enableCSP": true,
    "enableSRI": true,
    "enableHSTS": true
  },
  "ui": {
    "theme": "light",
    "enableAnimations": true,
    "showBuildInfo": false
  }
}
```

## 🔨 Build-Time Configuration

### Environment Variables

During the build process, environment-specific variables are injected:

```bash
# GitHub Actions Build Step
- name: Build Application
  run: |
    # Set build environment variables
    export REACT_APP_VERSION=${{ steps.version.outputs.version }}
    export REACT_APP_BUILD_ID="${{ github.run_number }}"
    export REACT_APP_BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    export REACT_APP_GIT_COMMIT="${{ github.sha }}"
    export REACT_APP_GIT_BRANCH="${{ github.ref_name }}"
    export REACT_APP_ENV="${{ matrix.environment }}"
    export REACT_APP_DEPLOYED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Load environment-specific configuration
    if [ -f "environments/${{ matrix.environment }}.json" ]; then
      export REACT_APP_CONFIG=$(cat environments/${{ matrix.environment }}.json | jq -c .)
    fi
    
    npm run build:prod
```

### Build Script Configuration

The `package.json` includes environment-aware build scripts:

```json
{
  "scripts": {
    "build": "react-scripts build",
    "build:prod": "NODE_ENV=production GENERATE_SOURCEMAP=false react-scripts build",
    "build:dev": "NODE_ENV=development react-scripts build",
    "build:staging": "NODE_ENV=production REACT_APP_ENV=staging react-scripts build",
    "build:preprod": "NODE_ENV=production REACT_APP_ENV=pre-production react-scripts build"
  }
}
```

### Configuration Loading

```javascript
// src/utils/environment.js
export function getEnvironmentConfig(envName) {
  const configs = {
    development: {
      enableDebug: true,
      logLevel: 'debug',
      enableMocking: true,
      enableAnalytics: false,
      refreshInterval: 30000,
      healthCheckInterval: 60000
    },
    staging: {
      enableDebug: true,
      logLevel: 'info',
      enableMocking: false,
      enableAnalytics: true,
      refreshInterval: 60000,
      healthCheckInterval: 120000
    },
    'pre-production': {
      enableDebug: false,
      logLevel: 'warn',
      enableMocking: false,
      enableAnalytics: true,
      refreshInterval: 120000,
      healthCheckInterval: 300000
    },
    production: {
      enableDebug: false,
      logLevel: 'error',
      enableMocking: false,
      enableAnalytics: true,
      refreshInterval: 300000,
      healthCheckInterval: 600000
    }
  };

  return configs[envName] || configs.development;
}
```

## 🚀 Runtime Configuration

### Dynamic Configuration Loading

The application can load configuration dynamically at runtime:

```javascript
// src/utils/configLoader.js
class ConfigLoader {
  constructor() {
    this.config = null;
    this.environment = null;
  }

  async loadConfig() {
    try {
      this.environment = getEnvironmentInfo();
      
      // Try to load runtime configuration from API
      const runtimeConfig = await this.loadRuntimeConfig();
      
      // Merge with build-time configuration
      this.config = {
        ...getEnvironmentConfig(this.environment.name),
        ...runtimeConfig
      };
      
      return this.config;
    } catch (error) {
      console.warn('Failed to load runtime config, using defaults:', error);
      this.config = getEnvironmentConfig(this.environment.name);
      return this.config;
    }
  }

  async loadRuntimeConfig() {
    try {
      const response = await fetch(`${this.environment.apiUrl}/config`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Runtime config not available:', error);
    }
    return {};
  }

  getConfig(key, defaultValue = null) {
    if (!this.config) {
      throw new Error('Configuration not loaded. Call loadConfig() first.');
    }
    
    return key.split('.').reduce((obj, k) => obj?.[k], this.config) ?? defaultValue;
  }
}

export const configLoader = new ConfigLoader();
```

### Feature Flags

Feature flags are controlled by environment configuration:

```javascript
// src/utils/featureFlags.js
export function shouldEnableFeature(featureName) {
  const environment = getEnvironmentInfo();
  const config = environment.config;

  const featureFlags = {
    analytics: config.enableAnalytics,
    debugging: config.enableDebug,
    mocking: config.enableMocking,
    realTimeUpdates: environment.name !== 'production',
    experimentalFeatures: environment.name === 'development'
  };

  return featureFlags[featureName] || false;
}

// Usage in components
function Dashboard() {
  const showDebugInfo = shouldEnableFeature('debugging');
  const enableRealTime = shouldEnableFeature('realTimeUpdates');
  
  return (
    <div>
      {showDebugInfo && <DebugPanel />}
      {enableRealTime && <RealTimeUpdates />}
    </div>
  );
}
```

## 🎯 Environment-Specific Settings

### API Configuration

```javascript
// src/utils/apiConfig.js
export function getApiConfig() {
  const environment = getEnvironmentInfo();
  
  return {
    baseURL: environment.apiUrl,
    timeout: environment.name === 'production' ? 15000 : 30000,
    retries: environment.name === 'production' ? 2 : 3,
    headers: {
      'Content-Type': 'application/json',
      'X-Environment': environment.name,
      'X-Version': environment.version
    }
  };
}
```

### Monitoring Configuration

```javascript
// src/utils/monitoringConfig.js
export function getMonitoringConfig() {
  const environment = getEnvironmentInfo();
  
  return {
    healthCheckUrl: `${environment.apiUrl}/health`,
    metricsUrl: `${environment.apiUrl}/metrics`,
    alertsUrl: `${environment.apiUrl}/alerts`,
    refreshInterval: environment.config.refreshInterval,
    healthCheckInterval: environment.config.healthCheckInterval,
    enableRealTime: shouldEnableFeature('realTimeUpdates'),
    logLevel: environment.config.logLevel
  };
}
```

### Performance Configuration

```javascript
// src/utils/performanceConfig.js
export function getPerformanceConfig() {
  const environment = getEnvironmentInfo();
  
  const configs = {
    development: {
      enableBudget: false,
      enableTracing: true,
      sampleRate: 1.0,
      enableProfiling: true
    },
    staging: {
      enableBudget: true,
      enableTracing: true,
      sampleRate: 0.5,
      enableProfiling: false
    },
    production: {
      enableBudget: true,
      enableTracing: false,
      sampleRate: 0.1,
      enableProfiling: false
    }
  };
  
  return configs[environment.name] || configs.development;
}
```

## 🔄 Deployment Integration

### GitHub Actions Integration

The environment configuration is integrated with GitHub Actions workflows:

```yaml
# .github/workflows/enhanced-ci-cd.yml
jobs:
  deploy:
    strategy:
      matrix:
        environment: [development, staging, pre-production, production]
    steps:
      - name: Load Environment Configuration
        run: |
          ENV_CONFIG_FILE="environments/${{ matrix.environment }}.json"
          if [ -f "$ENV_CONFIG_FILE" ]; then
            echo "Loading configuration for ${{ matrix.environment }}"
            cat "$ENV_CONFIG_FILE"
            
            # Extract configuration values
            API_URL=$(jq -r '.api.baseUrl' "$ENV_CONFIG_FILE")
            ENABLE_ANALYTICS=$(jq -r '.features.enableAnalytics' "$ENV_CONFIG_FILE")
            LOG_LEVEL=$(jq -r '.monitoring.logLevel' "$ENV_CONFIG_FILE")
            
            # Set as environment variables
            echo "REACT_APP_API_URL=$API_URL" >> $GITHUB_ENV
            echo "REACT_APP_ENABLE_ANALYTICS=$ENABLE_ANALYTICS" >> $GITHUB_ENV
            echo "REACT_APP_LOG_LEVEL=$LOG_LEVEL" >> $GITHUB_ENV
          fi
```

### Azure Static Web App Configuration

Environment variables are passed to Azure Static Web Apps:

```yaml
# Azure Static Web App Configuration
- name: Deploy to Azure Static Web Apps
  uses: Azure/static-web-apps-deploy@v1
  with:
    azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
    app_location: "."
    build_location: "build"
    action: "upload"
    app_build_command: |
      export REACT_APP_ENV=${{ matrix.environment }}
      export REACT_APP_API_URL=$(jq -r '.api.baseUrl' environments/${{ matrix.environment }}.json)
      npm run build:prod
```

## 💻 Local Development

### Development Environment Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template
cp environments/development.json.template environments/development.json

# 3. Configure local settings
cat > .env.local << EOF
REACT_APP_ENV=development
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENABLE_DEBUGGING=true
REACT_APP_ENABLE_MOCKING=true
EOF

# 4. Start development server
npm start
```

### Local Configuration Override

```javascript
// src/utils/localConfig.js
export function getLocalConfig() {
  if (process.env.NODE_ENV === 'development') {
    return {
      api: {
        baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001'
      },
      features: {
        enableDebugMode: true,
        enableMocking: process.env.REACT_APP_ENABLE_MOCKING === 'true',
        enableAnalytics: false
      },
      monitoring: {
        enableDetailedLogging: true,
        logLevel: 'debug'
      }
    };
  }
  return {};
}
```

### Mock Data Configuration

```javascript
// src/utils/mockConfig.js
export function shouldUseMockData() {
  const environment = getEnvironmentInfo();
  return environment.config.enableMocking || 
         process.env.REACT_APP_USE_MOCK_DATA === 'true';
}

export function getMockConfig() {
  return {
    apiDelay: 500,
    errorRate: 0.1,
    enableRandomFailures: true,
    mockDataVersion: '1.0.0'
  };
}
```

## 🔧 Configuration Management Best Practices

### 1. **Environment Separation**
- Keep environment-specific values in separate files
- Never commit sensitive data to version control
- Use Azure Key Vault for secrets
- Validate configuration on application startup

### 2. **Configuration Validation**

```javascript
// src/utils/configValidator.js
export function validateConfig(config) {
  const required = ['api.baseUrl', 'monitoring.logLevel'];
  const missing = [];
  
  for (const key of required) {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    if (!value) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
  
  return true;
}
```

### 3. **Environment Detection Testing**

```javascript
// src/utils/environment.test.js
describe('Environment Detection', () => {
  test('detects production environment', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'yourdomain.com' }
    });
    
    const env = getEnvironmentInfo();
    expect(env.name).toBe('production');
    expect(env.apiUrl).toBe('https://api.yourdomain.com');
  });
  
  test('detects staging environment', () => {
    Object.defineProperty(window, 'location', {
      value: { hostname: 'staging.yourdomain.com' }
    });
    
    const env = getEnvironmentInfo();
    expect(env.name).toBe('staging');
    expect(env.apiUrl).toBe('https://staging-api.yourdomain.com');
  });
});
```

## 📊 Configuration Monitoring

### Runtime Configuration Changes

```javascript
// src/utils/configMonitor.js
class ConfigMonitor {
  constructor() {
    this.watchers = new Map();
    this.currentConfig = null;
  }
  
  watch(key, callback) {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, new Set());
    }
    this.watchers.get(key).add(callback);
  }
  
  updateConfig(newConfig) {
    const oldConfig = this.currentConfig;
    this.currentConfig = newConfig;
    
    // Notify watchers of changes
    for (const [key, callbacks] of this.watchers) {
      const oldValue = this.getValue(oldConfig, key);
      const newValue = this.getValue(newConfig, key);
      
      if (oldValue !== newValue) {
        callbacks.forEach(callback => callback(newValue, oldValue));
      }
    }
  }
  
  getValue(config, key) {
    return key.split('.').reduce((obj, k) => obj?.[k], config);
  }
}

export const configMonitor = new ConfigMonitor();
```

## 🔗 Related Documentation

- [Infrastructure Setup Guide](./01-INFRASTRUCTURE-SETUP.md)
- [Azure Key Vault Integration](./04-AZURE-KEYVAULT-INTEGRATION.md)
- [Deployment Guide](./02-DEPLOYMENT-GUIDE.md)
- [Monitoring Guide](./05-MONITORING-GUIDE.md)

---

**Last Updated:** December 2024  
**Version:** 1.0.0
// Environment detection and configuration utilities

export function getEnvironmentInfo() {
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  
  // Determine environment based on hostname and environment variables
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
      environment = {
        ...environment,
        name: 'development',
        displayName: 'Development',
        apiUrl: 'https://dev-api.example.com'
      };
    } else if (hostname.includes('-staging') || hostname.includes('.2.')) {
      environment = {
        ...environment,
        name: 'staging',
        displayName: 'Staging',
        apiUrl: 'https://staging-api.example.com'
      };
    } else if (hostname.includes('-preprod') || hostname.includes('.3.')) {
      environment = {
        ...environment,
        name: 'pre-production',
        displayName: 'Pre-Production',
        apiUrl: 'https://preprod-api.example.com'
      };
    } else {
      environment = {
        ...environment,
        name: 'production',
        displayName: 'Production',
        apiUrl: 'https://api.example.com'
      };
    }
  }

  // Custom domain detection
  if (hostname === 'yourdomain.com') {
    environment = {
      ...environment,
      name: 'production',
      displayName: 'Production',
      apiUrl: 'https://api.yourdomain.com'
    };
  } else if (hostname === 'staging.yourdomain.com') {
    environment = {
      ...environment,
      name: 'staging',
      displayName: 'Staging',
      apiUrl: 'https://staging-api.yourdomain.com'
    };
  }

  // Local development
  if (isLocalhost) {
    environment = {
      ...environment,
      name: 'development',
      displayName: 'Local Development',
      apiUrl: 'http://localhost:3001',
      buildId: 'local-dev'
    };
  }

  // Add environment-specific configurations
  environment.config = getEnvironmentConfig(environment.name);
  
  return environment;
}

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

export function isProduction() {
  return getEnvironmentInfo().name === 'production';
}

export function isDevelopment() {
  return getEnvironmentInfo().name === 'development';
}

export function getApiBaseUrl() {
  return getEnvironmentInfo().apiUrl || '/api';
}

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

export function getLogLevel() {
  return getEnvironmentInfo().config.logLevel;
}

export function getBuildInfo() {
  return {
    version: process.env.REACT_APP_VERSION || '1.0.0',
    buildId: process.env.REACT_APP_BUILD_ID || 'unknown',
    buildDate: process.env.REACT_APP_BUILD_DATE || new Date().toISOString(),
    gitCommit: process.env.REACT_APP_GIT_COMMIT || 'unknown',
    gitBranch: process.env.REACT_APP_GIT_BRANCH || 'unknown'
  };
}

export function getMonitoringConfig() {
  const environment = getEnvironmentInfo();
  
  return {
    healthCheckUrl: `${environment.apiUrl}/health`,
    metricsUrl: `${environment.apiUrl}/metrics`,
    alertsUrl: `${environment.apiUrl}/alerts`,
    refreshInterval: environment.config.refreshInterval,
    healthCheckInterval: environment.config.healthCheckInterval,
    enableRealTime: shouldEnableFeature('realTimeUpdates')
  };
}
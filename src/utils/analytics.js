// Analytics and monitoring utilities

import { shouldEnableFeature, getEnvironmentInfo } from './environment';

class Analytics {
  constructor() {
    this.initialized = false;
    this.environment = null;
    this.sessionId = null;
    this.userId = null;
  }

  async initialize(environment) {
    if (this.initialized) return;

    this.environment = environment;
    this.sessionId = this.generateSessionId();
    
    // Only enable analytics in staging and production
    if (!shouldEnableFeature('analytics')) {
      console.log('Analytics disabled for this environment');
      return;
    }

    try {
      // Initialize Application Insights (Azure)
      await this.initializeApplicationInsights();
      
      // Initialize Google Analytics (optional)
      await this.initializeGoogleAnalytics();
      
      // Track page load
      this.trackPageView(window.location.pathname);
      
      this.initialized = true;
      console.log('Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  async initializeApplicationInsights() {
    // In a real app, you would load the Application Insights SDK
    // and configure it with your instrumentation key
    
    if (typeof window !== 'undefined' && window.appInsights) {
      window.appInsights.trackPageView({
        name: 'App Initialization',
        properties: {
          environment: this.environment.name,
          version: this.environment.version,
          buildId: this.environment.buildId
        }
      });
    }
  }

  async initializeGoogleAnalytics() {
    // In a real app, you would load Google Analytics
    const gaId = process.env.REACT_APP_GA_ID;
    
    if (!gaId) return;

    // Simulate GA initialization
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', gaId, {
        custom_map: {
          custom_dimension_1: 'environment',
          custom_dimension_2: 'version'
        }
      });
    }
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2);
  }

  setUserId(userId) {
    this.userId = userId;
    
    if (this.initialized && shouldEnableFeature('analytics')) {
      // Track user identification
      this.trackEvent('user_identified', {
        userId: userId,
        sessionId: this.sessionId
      });
    }
  }

  trackPageView(path, title = null) {
    if (!this.initialized || !shouldEnableFeature('analytics')) return;

    const pageData = {
      path,
      title: title || document.title,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      environment: this.environment.name,
      version: this.environment.version
    };

    // Application Insights
    if (typeof window !== 'undefined' && window.appInsights) {
      window.appInsights.trackPageView({
        name: title || path,
        uri: window.location.href,
        properties: pageData
      });
    }

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: title,
        page_location: window.location.href,
        page_path: path,
        environment: this.environment.name
      });
    }

    console.log('Page view tracked:', pageData);
  }

  trackEvent(eventName, properties = {}) {
    if (!this.initialized || !shouldEnableFeature('analytics')) return;

    const eventData = {
      eventName,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      environment: this.environment.name,
      version: this.environment.version,
      ...properties
    };

    // Application Insights
    if (typeof window !== 'undefined' && window.appInsights) {
      window.appInsights.trackEvent({
        name: eventName,
        properties: eventData
      });
    }

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        event_category: properties.category || 'general',
        event_label: properties.label,
        value: properties.value,
        environment: this.environment.name
      });
    }

    console.log('Event tracked:', eventData);
  }

  trackError(error, context = {}) {
    if (!this.initialized || !shouldEnableFeature('analytics')) return;

    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      environment: this.environment.name,
      version: this.environment.version,
      context
    };

    // Application Insights
    if (typeof window !== 'undefined' && window.appInsights) {
      window.appInsights.trackException({
        exception: error,
        properties: errorData
      });
    }

    // Google Analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        environment: this.environment.name
      });
    }

    console.error('Error tracked:', errorData);
  }

  trackPerformance(metrics) {
    if (!this.initialized || !shouldEnableFeature('analytics')) return;

    const performanceData = {
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
      userId: this.userId,
      environment: this.environment.name,
      version: this.environment.version,
      ...metrics
    };

    // Application Insights
    if (typeof window !== 'undefined' && window.appInsights) {
      window.appInsights.trackMetric({
        name: 'performance_metrics',
        average: metrics.responseTime || 0,
        properties: performanceData
      });
    }

    console.log('Performance tracked:', performanceData);
  }

  trackUserInteraction(action, element, context = {}) {
    if (!this.initialized || !shouldEnableFeature('analytics')) return;

    this.trackEvent('user_interaction', {
      action,
      element,
      category: 'user_interface',
      ...context
    });
  }

  trackHealthCheck(results) {
    if (!this.initialized || !shouldEnableFeature('analytics')) return;

    this.trackEvent('health_check', {
      status: results.overall?.status,
      score: results.overall?.score,
      checks: {
        api: results.api?.status,
        database: results.database?.status,
        external: results.external?.status
      },
      category: 'monitoring'
    });
  }

  trackDeployment(deploymentInfo) {
    if (!this.initialized || !shouldEnableFeature('analytics')) return;

    this.trackEvent('deployment', {
      version: deploymentInfo.version,
      environment: deploymentInfo.environment,
      status: deploymentInfo.status,
      duration: deploymentInfo.duration,
      category: 'deployment'
    });
  }

  // Get analytics session info
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      environment: this.environment?.name,
      initialized: this.initialized
    };
  }
}

// Create singleton instance
const analytics = new Analytics();

// Export functions
export async function initializeAnalytics(environment) {
  return analytics.initialize(environment);
}

export function trackPageView(path, title) {
  return analytics.trackPageView(path, title);
}

export function trackEvent(eventName, properties) {
  return analytics.trackEvent(eventName, properties);
}

export function trackError(error, context) {
  return analytics.trackError(error, context);
}

export function trackPerformance(metrics) {
  return analytics.trackPerformance(metrics);
}

export function trackUserInteraction(action, element, context) {
  return analytics.trackUserInteraction(action, element, context);
}

export function trackHealthCheck(results) {
  return analytics.trackHealthCheck(results);
}

export function trackDeployment(deploymentInfo) {
  return analytics.trackDeployment(deploymentInfo);
}

export function setUserId(userId) {
  return analytics.setUserId(userId);
}

export function getSessionInfo() {
  return analytics.getSessionInfo();
}

// Web Vitals tracking
export function trackWebVitals() {
  if (!shouldEnableFeature('analytics')) return;

  // Core Web Vitals
  if ('web-vitals' in window) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(trackPerformance);
      getFID(trackPerformance);
      getFCP(trackPerformance);
      getLCP(trackPerformance);
      getTTFB(trackPerformance);
    });
  }
}

// Performance observer for custom metrics
export function observePerformance() {
  if (!shouldEnableFeature('analytics') || typeof window === 'undefined') return;

  // Navigation timing
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const metrics = {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      firstByte: timing.responseStart - timing.navigationStart
    };
    
    trackPerformance(metrics);
  }

  // Resource timing
  if (window.performance && window.performance.getEntriesByType) {
    const resources = window.performance.getEntriesByType('resource');
    const slowResources = resources.filter(resource => resource.duration > 1000);
    
    if (slowResources.length > 0) {
      trackEvent('slow_resources', {
        count: slowResources.length,
        resources: slowResources.map(r => ({ name: r.name, duration: r.duration }))
      });
    }
  }
}

export default analytics;
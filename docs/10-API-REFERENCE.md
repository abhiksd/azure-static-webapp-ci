# 📚 API Reference

This comprehensive API reference documents all endpoints, data structures, and integration patterns for the Azure Static Web Apps monitoring and health check system.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Health Check API](#health-check-api)
4. [Monitoring API](#monitoring-api)
5. [Configuration API](#configuration-api)
6. [Data Models](#data-models)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

## 🎯 Overview

The API provides access to health monitoring, performance metrics, and configuration data for Azure Static Web Apps across multiple environments.

### Base URLs

| Environment | Base URL | Purpose |
|------------|----------|---------|
| **Development** | `https://dev.yourdomain.com/api` | Development and testing |
| **Staging** | `https://staging.yourdomain.com/api` | Integration testing |
| **Pre-Production** | `https://preprod.yourdomain.com/api` | Production-like testing |
| **Production** | `https://yourdomain.com/api` | Live production API |

### API Versioning

All API endpoints are versioned using URL path versioning:
```
/api/v1/health
/api/v1/monitoring
```

Current version: **v1**

### Response Format

All API responses follow a consistent JSON structure:

```json
{
  "status": "success|error",
  "data": {},
  "meta": {
    "timestamp": "2024-12-01T12:00:00Z",
    "version": "1.0.0",
    "environment": "production"
  },
  "errors": []
}
```

## 🔐 Authentication

The API uses multiple authentication methods depending on the endpoint and environment.

### Public Endpoints

Some endpoints are publicly accessible for health monitoring:
- `/api/v1/health`
- `/api/v1/version`
- `/api/v1/status`

### Authenticated Endpoints

Authenticated endpoints require an API key or JWT token:

```bash
# Using API Key
curl -H "X-API-Key: your-api-key" https://yourdomain.com/api/v1/monitoring

# Using JWT Token
curl -H "Authorization: Bearer your-jwt-token" https://yourdomain.com/api/v1/config
```

## 🏥 Health Check API

### GET /api/v1/health

Returns the overall health status of the application and its dependencies.

#### Request

```bash
curl https://yourdomain.com/api/v1/health
```

#### Response

```json
{
  "status": "success",
  "data": {
    "timestamp": "2024-12-01T12:00:00Z",
    "status": "healthy",
    "version": "1.2.0",
    "environment": "production",
    "uptime": 3600,
    "checks": {
      "database": {
        "status": "healthy",
        "responseTime": 15,
        "lastChecked": "2024-12-01T12:00:00Z",
        "details": {
          "connectionPool": "active",
          "queries": "responsive"
        }
      },
      "externalServices": {
        "paymentAPI": {
          "status": "healthy",
          "responseTime": 120,
          "httpStatus": 200,
          "lastChecked": "2024-12-01T12:00:00Z"
        },
        "authAPI": {
          "status": "degraded",
          "responseTime": 450,
          "httpStatus": 200,
          "lastChecked": "2024-12-01T12:00:00Z",
          "warning": "Response time above threshold"
        }
      },
      "cache": {
        "status": "healthy",
        "responseTime": 5,
        "hitRate": 85.5,
        "lastChecked": "2024-12-01T12:00:00Z"
      },
      "storage": {
        "status": "healthy",
        "responseTime": 20,
        "availableSpace": 85,
        "lastChecked": "2024-12-01T12:00:00Z"
      },
      "system": {
        "status": "healthy",
        "cpu": {
          "usage": 45,
          "cores": 4
        },
        "memory": {
          "total": 8192,
          "free": 4096,
          "usage": 50
        },
        "uptime": 3600,
        "lastChecked": "2024-12-01T12:00:00Z"
      }
    }
  },
  "meta": {
    "timestamp": "2024-12-01T12:00:00Z",
    "version": "1.0.0",
    "environment": "production"
  }
}
```

#### Status Codes

- `200` - Healthy
- `503` - Unhealthy (one or more checks failed)

### GET /api/v1/health/detailed

Returns detailed health information including historical data.

#### Request

```bash
curl https://yourdomain.com/api/v1/health/detailed
```

#### Response

```json
{
  "status": "success",
  "data": {
    "current": {
      "status": "healthy",
      "timestamp": "2024-12-01T12:00:00Z"
    },
    "history": [
      {
        "timestamp": "2024-12-01T11:55:00Z",
        "status": "healthy",
        "responseTime": 145
      },
      {
        "timestamp": "2024-12-01T11:50:00Z",
        "status": "healthy",
        "responseTime": 132
      }
    ],
    "metrics": {
      "averageResponseTime": 138,
      "uptimePercentage": 99.95,
      "checksInLast24Hours": 288,
      "failuresInLast24Hours": 0
    }
  }
}
```

### POST /api/v1/health/check

Triggers an immediate health check across all systems.

#### Request

```bash
curl -X POST https://yourdomain.com/api/v1/health/check \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

#### Response

```json
{
  "status": "success",
  "data": {
    "checkId": "check-20241201-120000",
    "initiated": "2024-12-01T12:00:00Z",
    "status": "running",
    "estimatedCompletion": "2024-12-01T12:00:30Z"
  }
}
```

## 📊 Monitoring API

### GET /api/v1/monitoring/metrics

Returns performance and usage metrics.

#### Request

```bash
curl https://yourdomain.com/api/v1/monitoring/metrics \
  -H "X-API-Key: your-api-key"
```

#### Query Parameters

- `timeRange` - Time range for metrics (1h, 24h, 7d, 30d)
- `metric` - Specific metric to retrieve
- `aggregation` - Aggregation type (avg, sum, max, min)

#### Response

```json
{
  "status": "success",
  "data": {
    "timeRange": "24h",
    "interval": "1h",
    "metrics": {
      "requests": {
        "total": 125420,
        "successful": 124890,
        "failed": 530,
        "successRate": 99.58
      },
      "performance": {
        "averageResponseTime": 145,
        "p95ResponseTime": 320,
        "p99ResponseTime": 450
      },
      "errors": {
        "total": 530,
        "rate": 0.42,
        "byType": {
          "4xx": 450,
          "5xx": 80
        }
      },
      "users": {
        "activeUsers": 1250,
        "newUsers": 180,
        "returningUsers": 1070
      }
    },
    "timeSeries": [
      {
        "timestamp": "2024-12-01T11:00:00Z",
        "requests": 5220,
        "responseTime": 142,
        "errors": 18
      }
    ]
  }
}
```

### GET /api/v1/monitoring/alerts

Returns current active alerts and their status.

#### Request

```bash
curl https://yourdomain.com/api/v1/monitoring/alerts \
  -H "X-API-Key: your-api-key"
```

#### Response

```json
{
  "status": "success",
  "data": {
    "total": 2,
    "active": 1,
    "resolved": 1,
    "alerts": [
      {
        "id": "alert-001",
        "type": "performance",
        "severity": "warning",
        "title": "High Response Time",
        "description": "Average response time above 300ms",
        "status": "active",
        "triggered": "2024-12-01T11:45:00Z",
        "metric": "responseTime",
        "threshold": 300,
        "currentValue": 345,
        "environment": "production"
      },
      {
        "id": "alert-002",
        "type": "availability",
        "severity": "critical",
        "title": "Service Unavailable",
        "description": "Health check failing",
        "status": "resolved",
        "triggered": "2024-12-01T10:30:00Z",
        "resolved": "2024-12-01T10:35:00Z",
        "duration": 300
      }
    ]
  }
}
```

### POST /api/v1/monitoring/alerts/{alertId}/acknowledge

Acknowledges an alert.

#### Request

```bash
curl -X POST https://yourdomain.com/api/v1/monitoring/alerts/alert-001/acknowledge \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"acknowledgedBy": "john.doe@company.com", "notes": "Investigating root cause"}'
```

#### Response

```json
{
  "status": "success",
  "data": {
    "alertId": "alert-001",
    "status": "acknowledged",
    "acknowledgedAt": "2024-12-01T12:00:00Z",
    "acknowledgedBy": "john.doe@company.com"
  }
}
```

## ⚙️ Configuration API

### GET /api/v1/config

Returns current configuration for the environment.

#### Request

```bash
curl https://yourdomain.com/api/v1/config \
  -H "Authorization: Bearer your-jwt-token"
```

#### Response

```json
{
  "status": "success",
  "data": {
    "environment": "production",
    "features": {
      "healthMonitoring": true,
      "performanceTracking": true,
      "realTimeAlerts": true,
      "debugMode": false
    },
    "monitoring": {
      "healthCheckInterval": 300000,
      "metricsCollectionInterval": 60000,
      "alertThresholds": {
        "responseTime": 300,
        "errorRate": 5,
        "availability": 99
      }
    },
    "integrations": {
      "applicationInsights": {
        "enabled": true,
        "samplingRate": 10
      },
      "slack": {
        "enabled": true,
        "channel": "#alerts"
      }
    }
  }
}
```

### PUT /api/v1/config

Updates configuration settings.

#### Request

```bash
curl -X PUT https://yourdomain.com/api/v1/config \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{
    "monitoring": {
      "healthCheckInterval": 180000,
      "alertThresholds": {
        "responseTime": 250
      }
    }
  }'
```

#### Response

```json
{
  "status": "success",
  "data": {
    "updated": true,
    "changes": [
      "monitoring.healthCheckInterval",
      "monitoring.alertThresholds.responseTime"
    ],
    "effective": "2024-12-01T12:00:00Z"
  }
}
```

### GET /api/v1/version

Returns version and build information.

#### Request

```bash
curl https://yourdomain.com/api/v1/version
```

#### Response

```json
{
  "status": "success",
  "data": {
    "version": "1.2.0",
    "buildId": "build-20241201-1200",
    "buildDate": "2024-12-01T12:00:00Z",
    "gitCommit": "a1b2c3d4e5f6",
    "gitBranch": "main",
    "environment": "production",
    "nodeVersion": "18.17.0",
    "dependencies": {
      "react": "18.2.0",
      "azure-static-web-apps": "1.1.0"
    }
  }
}
```

## 📋 Data Models

### HealthCheck

```typescript
interface HealthCheck {
  timestamp: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  version: string;
  environment: string;
  uptime: number;
  checks: {
    [serviceName: string]: ServiceHealth;
  };
}

interface ServiceHealth {
  status: 'healthy' | 'unhealthy' | 'degraded';
  responseTime: number;
  lastChecked: string;
  details?: Record<string, any>;
  error?: string;
}
```

### Metric

```typescript
interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  tags: Record<string, string>;
}

interface MetricsResponse {
  timeRange: string;
  interval: string;
  metrics: Record<string, any>;
  timeSeries: TimeSeriesPoint[];
}

interface TimeSeriesPoint {
  timestamp: string;
  [metricName: string]: number | string;
}
```

### Alert

```typescript
interface Alert {
  id: string;
  type: 'performance' | 'availability' | 'error' | 'security';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  triggered: string;
  resolved?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  metric: string;
  threshold: number;
  currentValue: number;
  environment: string;
}
```

### Configuration

```typescript
interface Configuration {
  environment: string;
  features: Record<string, boolean>;
  monitoring: {
    healthCheckInterval: number;
    metricsCollectionInterval: number;
    alertThresholds: Record<string, number>;
  };
  integrations: Record<string, any>;
}
```

## ⚠️ Error Handling

### Error Response Format

All errors follow a consistent format:

```json
{
  "status": "error",
  "errors": [
    {
      "code": "VALIDATION_ERROR",
      "message": "Invalid time range parameter",
      "field": "timeRange",
      "details": {
        "provided": "invalid",
        "allowed": ["1h", "24h", "7d", "30d"]
      }
    }
  ],
  "meta": {
    "timestamp": "2024-12-01T12:00:00Z",
    "requestId": "req-a1b2c3d4e5f6"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `AUTHENTICATION_REQUIRED` | 401 | API key or token required |
| `INVALID_API_KEY` | 401 | Invalid or expired API key |
| `INSUFFICIENT_PERMISSIONS` | 403 | Insufficient permissions for operation |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

### Error Handling Best Practices

```javascript
// JavaScript/React example
async function fetchHealthData() {
  try {
    const response = await fetch('/api/v1/health');
    const data = await response.json();
    
    if (data.status === 'error') {
      throw new Error(data.errors[0].message);
    }
    
    return data.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
}

// With retry logic
async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status >= 500 && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}
```

## 🚦 Rate Limiting

### Rate Limits

| Endpoint Category | Rate Limit | Window |
|------------------|------------|---------|
| **Public Health Checks** | 60 requests | 1 minute |
| **Authenticated Monitoring** | 300 requests | 1 minute |
| **Configuration Updates** | 10 requests | 1 minute |
| **Alert Operations** | 30 requests | 1 minute |

### Rate Limit Headers

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1701432000
X-RateLimit-Window: 60
```

### Rate Limit Response

When rate limit is exceeded:

```json
{
  "status": "error",
  "errors": [
    {
      "code": "RATE_LIMIT_EXCEEDED",
      "message": "Rate limit exceeded. Try again in 30 seconds.",
      "retryAfter": 30
    }
  ]
}
```

## 📝 Usage Examples

### React Component Integration

```javascript
import React, { useState, useEffect } from 'react';

function HealthDashboard() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/v1/health');
        const data = await response.json();
        
        if (data.status === 'success') {
          setHealthData(data.data);
        } else {
          throw new Error(data.errors[0].message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>System Health</h1>
      <div className={`status ${healthData.status}`}>
        Status: {healthData.status}
      </div>
      <div>
        <h2>Service Checks</h2>
        {Object.entries(healthData.checks).map(([service, check]) => (
          <div key={service} className={`service ${check.status}`}>
            {service}: {check.status} ({check.responseTime}ms)
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Node.js Client

```javascript
class HealthAPIClient {
  constructor(baseURL, apiKey) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
        ...options.headers
      }
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (data.status === 'error') {
      throw new Error(data.errors[0].message);
    }

    return data.data;
  }

  async getHealth() {
    return this.request('/api/v1/health');
  }

  async getMetrics(timeRange = '24h') {
    return this.request(`/api/v1/monitoring/metrics?timeRange=${timeRange}`);
  }

  async getAlerts() {
    return this.request('/api/v1/monitoring/alerts');
  }

  async acknowledgeAlert(alertId, acknowledgedBy, notes = '') {
    return this.request(`/api/v1/monitoring/alerts/${alertId}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ acknowledgedBy, notes })
    });
  }
}

// Usage
const client = new HealthAPIClient('https://yourdomain.com', 'your-api-key');

async function monitorHealth() {
  try {
    const health = await client.getHealth();
    console.log('System status:', health.status);
    
    if (health.status !== 'healthy') {
      const alerts = await client.getAlerts();
      console.log('Active alerts:', alerts.active);
    }
  } catch (error) {
    console.error('Monitoring failed:', error);
  }
}
```

## 🔗 Related Documentation

- [Infrastructure Setup Guide](./01-INFRASTRUCTURE-SETUP.md)
- [Monitoring Guide](./05-MONITORING-GUIDE.md)
- [Security Best Practices](./08-SECURITY-BEST-PRACTICES.md)
- [Troubleshooting Guide](./07-TROUBLESHOOTING.md)

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**API Version:** v1
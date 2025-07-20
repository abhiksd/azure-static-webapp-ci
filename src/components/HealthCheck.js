import React, { useState, useEffect } from 'react';
import { useHealth } from '../context/HealthContext';
import { formatDate, formatRelativeTime } from '../utils/dateUtils';
import { trackUserInteraction, trackHealthCheck } from '../utils/analytics';
import './HealthCheck.css';

function HealthCheck() {
  const { healthData, isLoading, runHealthCheck, getHealthSummary, isHealthDataStale } = useHealth();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60000); // 1 minute

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (isHealthDataStale()) {
        runHealthCheck();
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, runHealthCheck, isHealthDataStale]);

  const handleManualRefresh = async () => {
    trackUserInteraction('click', 'health_check_refresh');
    const results = await runHealthCheck();
    if (results) {
      trackHealthCheck(results);
    }
  };

  const summary = getHealthSummary();

  return (
    <div className="health-check">
      <header className="health-check-header">
        <h1>System Health Check</h1>
        <div className="health-controls">
          <label className="auto-refresh-toggle">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto-refresh
          </label>
          <select
            value={refreshInterval}
            onChange={(e) => setRefreshInterval(Number(e.target.value))}
            disabled={!autoRefresh}
            className="refresh-interval"
          >
            <option value={30000}>30s</option>
            <option value={60000}>1m</option>
            <option value={300000}>5m</option>
            <option value={600000}>10m</option>
          </select>
          <button
            onClick={handleManualRefresh}
            disabled={isLoading}
            className="refresh-button"
          >
            {isLoading ? '🔄 Checking...' : '🔄 Refresh'}
          </button>
        </div>
      </header>

      {summary && (
        <div className="health-summary">
          <div className="summary-cards">
            <div className="summary-card total">
              <div className="card-value">{summary.total}</div>
              <div className="card-label">Total Checks</div>
            </div>
            <div className="summary-card healthy">
              <div className="card-value">{summary.healthy}</div>
              <div className="card-label">Healthy</div>
            </div>
            <div className="summary-card warning">
              <div className="card-value">{summary.warning}</div>
              <div className="card-label">Warnings</div>
            </div>
            <div className="summary-card error">
              <div className="card-value">{summary.error}</div>
              <div className="card-label">Errors</div>
            </div>
            <div className="summary-card score">
              <div className="card-value">{summary.score}/100</div>
              <div className="card-label">Health Score</div>
            </div>
          </div>
        </div>
      )}

      {healthData ? (
        <div className="health-details">
          <OverallHealth data={healthData.overall} timestamp={healthData.timestamp} />
          <ApiHealth data={healthData.api} />
          <DatabaseHealth data={healthData.database} />
          <ExternalServicesHealth data={healthData.external} />
          <PerformanceHealth data={healthData.performance} />
          <SecurityHealth data={healthData.security} />
        </div>
      ) : (
        <div className="no-health-data">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Running health checks...</p>
            </div>
          ) : (
            <div className="empty-state">
              <p>No health data available</p>
              <button onClick={handleManualRefresh} className="run-check-button">
                Run Health Check
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function OverallHealth({ data, timestamp }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="health-section">
      <h2>Overall System Health</h2>
      <div className="health-card">
        <div className="status-indicator">
          <div
            className="status-dot"
            style={{ backgroundColor: getStatusColor(data.status) }}
          ></div>
          <span className={`status-text ${data.status}`}>
            {data.status.toUpperCase()}
          </span>
        </div>
        <div className="health-metrics">
          <div className="metric">
            <span className="metric-label">Health Score</span>
            <span className="metric-value">{data.score}/100</span>
          </div>
          <div className="metric">
            <span className="metric-label">Last Check</span>
            <span className="metric-value">{formatRelativeTime(timestamp)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ApiHealth({ data }) {
  return (
    <div className="health-section">
      <h2>API Health</h2>
      <div className="health-card">
        <div className="status-row">
          <span className="check-name">API Connectivity</span>
          <span className={`status ${data.status}`}>{data.status}</span>
        </div>
        <div className="health-metrics">
          <div className="metric">
            <span className="metric-label">Response Time</span>
            <span className="metric-value">{data.responseTime}ms</span>
          </div>
          <div className="metric">
            <span className="metric-label">Last Check</span>
            <span className="metric-value">{formatDate(data.lastCheck)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DatabaseHealth({ data }) {
  return (
    <div className="health-section">
      <h2>Database Health</h2>
      <div className="health-card">
        <div className="status-row">
          <span className="check-name">Database Connection</span>
          <span className={`status ${data.status}`}>{data.status}</span>
        </div>
        <div className="health-metrics">
          <div className="metric">
            <span className="metric-label">Connection Pool</span>
            <span className="metric-value">{data.connectionPool}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">Query Time</span>
            <span className="metric-value">{data.queryTime}ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExternalServicesHealth({ data }) {
  return (
    <div className="health-section">
      <h2>External Services</h2>
      <div className="health-card">
        <div className="status-row">
          <span className="check-name">External Services</span>
          <span className={`status ${data.status}`}>{data.status}</span>
        </div>
        <div className="services-list">
          {data.services.map((service, index) => (
            <div key={index} className="service-item">
              <div className="service-header">
                <span className="service-name">{service.name}</span>
                <span className={`service-status ${service.status}`}>
                  {service.status}
                </span>
              </div>
              <div className="service-metrics">
                <span className="response-time">{service.responseTime}ms</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PerformanceHealth({ data }) {
  const getUsageColor = (usage) => {
    if (usage >= 80) return '#F44336';
    if (usage >= 60) return '#FF9800';
    return '#4CAF50';
  };

  return (
    <div className="health-section">
      <h2>Performance Metrics</h2>
      <div className="health-card">
        <div className="performance-metrics">
          <div className="performance-item">
            <div className="metric-header">
              <span className="metric-name">Memory Usage</span>
              <span
                className="metric-percentage"
                style={{ color: getUsageColor(data.memoryUsage) }}
              >
                {data.memoryUsage}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${data.memoryUsage}%`,
                  backgroundColor: getUsageColor(data.memoryUsage)
                }}
              ></div>
            </div>
          </div>

          <div className="performance-item">
            <div className="metric-header">
              <span className="metric-name">CPU Usage</span>
              <span
                className="metric-percentage"
                style={{ color: getUsageColor(data.cpuUsage) }}
              >
                {data.cpuUsage}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${data.cpuUsage}%`,
                  backgroundColor: getUsageColor(data.cpuUsage)
                }}
              ></div>
            </div>
          </div>

          <div className="performance-item">
            <div className="metric-header">
              <span className="metric-name">Disk Usage</span>
              <span
                className="metric-percentage"
                style={{ color: getUsageColor(data.diskUsage) }}
              >
                {data.diskUsage}%
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${data.diskUsage}%`,
                  backgroundColor: getUsageColor(data.diskUsage)
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SecurityHealth({ data }) {
  return (
    <div className="health-section">
      <h2>Security Status</h2>
      <div className="health-card">
        <div className="security-checks">
          <div className="security-item">
            <div className="status-row">
              <span className="check-name">SSL Certificates</span>
              <span className={`status ${data.certificates.status}`}>
                {data.certificates.status}
              </span>
            </div>
            <div className="security-details">
              <span>Expires in {data.certificates.expiresIn} days</span>
            </div>
          </div>

          <div className="security-item">
            <div className="status-row">
              <span className="check-name">Dependency Security</span>
              <span className={`status ${data.dependencies.status}`}>
                {data.dependencies.status}
              </span>
            </div>
            <div className="security-details">
              <span>{data.dependencies.vulnerabilities} vulnerabilities found</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HealthCheck;
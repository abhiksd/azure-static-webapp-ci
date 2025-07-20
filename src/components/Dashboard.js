import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useHealth } from '../context/HealthContext';
import { useMonitoring } from '../context/MonitoringContext';
import { getEnvironmentInfo } from '../utils/environment';
import { formatDate, formatDuration } from '../utils/dateUtils';
import './Dashboard.css';

function Dashboard() {
  const { healthData, runHealthCheck } = useHealth();
  const { metrics, alerts } = useMonitoring();
  const [environment, setEnvironment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeDashboard = async () => {
      setEnvironment(getEnvironmentInfo());
      await runHealthCheck();
      setIsLoading(false);
    };

    initializeDashboard();
  }, [runHealthCheck]);

  if (isLoading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Application Dashboard</h1>
        <p>Monitor your Azure Static Web App deployment status and performance</p>
      </header>

      <div className="dashboard-grid">
        {/* System Overview */}
        <section className="dashboard-card overview-card">
          <h2>System Overview</h2>
          <div className="overview-metrics">
            <div className="metric-item">
              <span className="metric-label">Environment</span>
              <span className="metric-value environment-value" data-env={environment?.name}>
                {environment?.displayName}
              </span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Version</span>
              <span className="metric-value">{environment?.version}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Build ID</span>
              <span className="metric-value">{environment?.buildId}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Last Deploy</span>
              <span className="metric-value">
                {formatDate(environment?.deployedAt)}
              </span>
            </div>
          </div>
        </section>

        {/* Health Status */}
        <section className="dashboard-card health-card">
          <div className="card-header">
            <h2>Health Status</h2>
            <Link to="/health" className="card-link">View Details →</Link>
          </div>
          
          <HealthStatusWidget healthData={healthData} />
        </section>

        {/* Performance Metrics */}
        <section className="dashboard-card metrics-card">
          <div className="card-header">
            <h2>Performance Metrics</h2>
            <Link to="/monitoring" className="card-link">View Details →</Link>
          </div>
          
          <PerformanceMetricsWidget metrics={metrics} />
        </section>

        {/* Recent Deployments */}
        <section className="dashboard-card deployments-card">
          <div className="card-header">
            <h2>Recent Deployments</h2>
            <Link to="/deployments" className="card-link">View All →</Link>
          </div>
          
          <RecentDeploymentsWidget />
        </section>

        {/* Active Alerts */}
        <section className="dashboard-card alerts-card">
          <div className="card-header">
            <h2>Active Alerts</h2>
            <span className="alert-count">{alerts?.length || 0}</span>
          </div>
          
          <ActiveAlertsWidget alerts={alerts} />
        </section>

        {/* Quick Actions */}
        <section className="dashboard-card actions-card">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button 
              onClick={runHealthCheck}
              className="action-button health-check-btn"
            >
              🏥 Run Health Check
            </button>
            <Link to="/monitoring" className="action-button">
              📊 View Monitoring
            </Link>
            <Link to="/deployments" className="action-button">
              🚀 Deployment History
            </Link>
            <Link to="/settings" className="action-button">
              ⚙️ Settings
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// Health Status Widget
function HealthStatusWidget({ healthData }) {
  if (!healthData) {
    return <div className="widget-loading">Loading health data...</div>;
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '❓';
    }
  };

  const getStatusClass = (status) => {
    return `health-status ${status}`;
  };

  return (
    <div className="health-widget">
      <div className={getStatusClass(healthData.overall.status)}>
        <span className="status-icon">{getStatusIcon(healthData.overall.status)}</span>
        <span className="status-text">{healthData.overall.status.toUpperCase()}</span>
      </div>
      
      <div className="health-details">
        <div className="health-item">
          <span>API Connectivity</span>
          <span className={`status ${healthData.api?.status}`}>
            {getStatusIcon(healthData.api?.status)}
          </span>
        </div>
        <div className="health-item">
          <span>Database</span>
          <span className={`status ${healthData.database?.status}`}>
            {getStatusIcon(healthData.database?.status)}
          </span>
        </div>
        <div className="health-item">
          <span>External Services</span>
          <span className={`status ${healthData.external?.status}`}>
            {getStatusIcon(healthData.external?.status)}
          </span>
        </div>
      </div>

      <div className="health-summary">
        Last checked: {formatDate(healthData.timestamp)}
      </div>
    </div>
  );
}

// Performance Metrics Widget
function PerformanceMetricsWidget({ metrics }) {
  if (!metrics) {
    return <div className="widget-loading">Loading metrics...</div>;
  }

  return (
    <div className="metrics-widget">
      <div className="metrics-grid">
        <div className="metric-box">
          <div className="metric-number">{metrics.responseTime || '0'}ms</div>
          <div className="metric-label">Avg Response Time</div>
        </div>
        <div className="metric-box">
          <div className="metric-number">{metrics.uptime || '99.9'}%</div>
          <div className="metric-label">Uptime</div>
        </div>
        <div className="metric-box">
          <div className="metric-number">{metrics.requests || '0'}</div>
          <div className="metric-label">Requests/Hour</div>
        </div>
        <div className="metric-box">
          <div className="metric-number">{metrics.errors || '0'}</div>
          <div className="metric-label">Error Rate</div>
        </div>
      </div>
      
      <div className="performance-chart">
        <div className="chart-placeholder">
          📈 Performance trends available in detailed monitoring
        </div>
      </div>
    </div>
  );
}

// Recent Deployments Widget
function RecentDeploymentsWidget() {
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    // Simulate deployment history
    const mockDeployments = [
      {
        id: '1',
        version: '1.2.1',
        environment: 'production',
        status: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        duration: '3m 45s',
        author: 'deployment-bot'
      },
      {
        id: '2',
        version: '1.2.0',
        environment: 'staging',
        status: 'success',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        duration: '4m 12s',
        author: 'john.doe'
      },
      {
        id: '3',
        version: '1.1.9',
        environment: 'development',
        status: 'failed',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        duration: '1m 23s',
        author: 'jane.smith'
      }
    ];
    setDeployments(mockDeployments);
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  return (
    <div className="deployments-widget">
      {deployments.length === 0 ? (
        <div className="no-deployments">No recent deployments</div>
      ) : (
        <div className="deployments-list">
          {deployments.map(deployment => (
            <div key={deployment.id} className="deployment-item">
              <div className="deployment-header">
                <span className="deployment-version">v{deployment.version}</span>
                <span className={`deployment-status ${deployment.status}`}>
                  {getStatusIcon(deployment.status)}
                </span>
              </div>
              <div className="deployment-details">
                <span className="deployment-env">{deployment.environment}</span>
                <span className="deployment-time">
                  {formatDate(deployment.timestamp)}
                </span>
              </div>
              <div className="deployment-meta">
                <span>Duration: {deployment.duration}</span>
                <span>By: {deployment.author}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Active Alerts Widget
function ActiveAlertsWidget({ alerts }) {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="alerts-widget">
        <div className="no-alerts">
          ✅ No active alerts
        </div>
      </div>
    );
  }

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <div className="alerts-widget">
      <div className="alerts-list">
        {alerts.slice(0, 3).map(alert => (
          <div key={alert.id} className={`alert-item ${alert.severity}`}>
            <span className="alert-icon">{getSeverityIcon(alert.severity)}</span>
            <div className="alert-content">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-time">{formatDate(alert.timestamp)}</div>
            </div>
          </div>
        ))}
      </div>
      
      {alerts.length > 3 && (
        <div className="alerts-more">
          +{alerts.length - 3} more alerts
        </div>
      )}
    </div>
  );
}

export default Dashboard;
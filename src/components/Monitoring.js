import React, { useState, useEffect } from 'react';
import { useMonitoring } from '../context/MonitoringContext';
import { formatDate, formatRelativeTime } from '../utils/dateUtils';
import { trackUserInteraction } from '../utils/analytics';
import './Monitoring.css';

function Monitoring() {
  const { 
    metrics, 
    alerts, 
    realTimeData, 
    isLoading, 
    fetchMonitoringData,
    getPerformanceScore,
    resolveAlert,
    getActiveAlertsCount
  } = useMonitoring();
  
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [selectedMetric, setSelectedMetric] = useState('responseTime');

  const handleRefresh = () => {
    trackUserInteraction('click', 'monitoring_refresh');
    fetchMonitoringData();
  };

  const handleAlertResolve = (alertId) => {
    trackUserInteraction('click', 'alert_resolve', { alertId });
    resolveAlert(alertId);
  };

  const performanceScore = getPerformanceScore();
  const activeAlertsCount = getActiveAlertsCount();

  return (
    <div className="monitoring">
      <header className="monitoring-header">
        <h1>System Monitoring</h1>
        <div className="monitoring-controls">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="time-range-selector"
          >
            <option value="15m">Last 15 minutes</option>
            <option value="1h">Last hour</option>
            <option value="6h">Last 6 hours</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="refresh-button"
          >
            {isLoading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </header>

      <div className="monitoring-grid">
        {/* Real-time Overview */}
        <section className="monitoring-card overview-card">
          <h2>Real-time Overview</h2>
          <RealTimeOverview realTimeData={realTimeData} metrics={metrics} />
        </section>

        {/* Performance Score */}
        <section className="monitoring-card score-card">
          <h2>Performance Score</h2>
          <PerformanceScore score={performanceScore} />
        </section>

        {/* Key Metrics */}
        <section className="monitoring-card metrics-card">
          <h2>Key Metrics</h2>
          <KeyMetrics metrics={metrics} />
        </section>

        {/* Active Alerts */}
        <section className="monitoring-card alerts-card">
          <div className="card-header">
            <h2>Active Alerts</h2>
            <span className="alert-badge">{activeAlertsCount}</span>
          </div>
          <AlertsList alerts={alerts} onResolve={handleAlertResolve} />
        </section>

        {/* Performance Chart */}
        <section className="monitoring-card chart-card">
          <div className="card-header">
            <h2>Performance Trends</h2>
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="metric-selector"
            >
              <option value="responseTime">Response Time</option>
              <option value="requests">Requests/Min</option>
              <option value="errors">Error Rate</option>
              <option value="bandwidth">Bandwidth</option>
            </select>
          </div>
          <PerformanceChart metric={selectedMetric} timeRange={selectedTimeRange} />
        </section>

        {/* System Resources */}
        <section className="monitoring-card resources-card">
          <h2>System Resources</h2>
          <SystemResources realTimeData={realTimeData} />
        </section>
      </div>
    </div>
  );
}

function RealTimeOverview({ realTimeData, metrics }) {
  if (!realTimeData && !metrics) {
    return <div className="loading-indicator">Loading real-time data...</div>;
  }

  const data = realTimeData || metrics;

  return (
    <div className="real-time-overview">
      <div className="metric-tiles">
        <div className="metric-tile">
          <div className="metric-value">{data.responseTime || 0}ms</div>
          <div className="metric-label">Response Time</div>
          <div className="metric-trend">
            {realTimeData && <span className="trend-indicator up">↗</span>}
          </div>
        </div>
        
        <div className="metric-tile">
          <div className="metric-value">{data.activeUsers || data.requests || 0}</div>
          <div className="metric-label">Active Users</div>
          <div className="metric-trend">
            {realTimeData && <span className="trend-indicator down">↘</span>}
          </div>
        </div>
        
        <div className="metric-tile">
          <div className="metric-value">{data.requestsPerMinute || data.requests || 0}</div>
          <div className="metric-label">Requests/Min</div>
          <div className="metric-trend">
            {realTimeData && <span className="trend-indicator up">↗</span>}
          </div>
        </div>
        
        <div className="metric-tile">
          <div className="metric-value">{data.errorRate || data.errors || 0}%</div>
          <div className="metric-label">Error Rate</div>
          <div className="metric-trend">
            {realTimeData && <span className="trend-indicator stable">→</span>}
          </div>
        </div>
      </div>
      
      {realTimeData && (
        <div className="last-updated">
          Last updated: {formatRelativeTime(realTimeData.timestamp)}
        </div>
      )}
    </div>
  );
}

function PerformanceScore({ score }) {
  const getScoreColor = (score) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 70) return '#FF9800';
    return '#F44336';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="performance-score">
      <div className="score-circle">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(score / 100) * 314.159} 314.159`}
            transform="rotate(-90 60 60)"
          />
        </svg>
        <div className="score-content">
          <div className="score-number">{score}</div>
          <div className="score-label">{getScoreLabel(score)}</div>
        </div>
      </div>
      
      <div className="score-details">
        <div className="score-factors">
          <div className="factor">Response Time: Good</div>
          <div className="factor">Error Rate: Excellent</div>
          <div className="factor">Uptime: Excellent</div>
        </div>
      </div>
    </div>
  );
}

function KeyMetrics({ metrics }) {
  if (!metrics) {
    return <div className="loading-indicator">Loading metrics...</div>;
  }

  return (
    <div className="key-metrics">
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">⚡</span>
            <span className="metric-name">Response Time</span>
          </div>
          <div className="metric-value">{metrics.responseTime}ms</div>
          <div className="metric-change">+5ms from last hour</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">📊</span>
            <span className="metric-name">Uptime</span>
          </div>
          <div className="metric-value">{metrics.uptime}%</div>
          <div className="metric-change">+0.1% from last hour</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">🔄</span>
            <span className="metric-name">Requests</span>
          </div>
          <div className="metric-value">{metrics.requests}</div>
          <div className="metric-change">+15% from last hour</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">⚠️</span>
            <span className="metric-name">Error Rate</span>
          </div>
          <div className="metric-value">{metrics.errors}%</div>
          <div className="metric-change">-0.2% from last hour</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">📡</span>
            <span className="metric-name">Bandwidth</span>
          </div>
          <div className="metric-value">{metrics.bandwidth}MB/s</div>
          <div className="metric-change">+2MB/s from last hour</div>
        </div>
        
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-icon">💾</span>
            <span className="metric-name">Cache Hit Rate</span>
          </div>
          <div className="metric-value">{metrics.cacheHitRate}%</div>
          <div className="metric-change">+1.2% from last hour</div>
        </div>
      </div>
    </div>
  );
}

function AlertsList({ alerts, onResolve }) {
  const activeAlerts = alerts.filter(alert => !alert.resolved);
  
  if (activeAlerts.length === 0) {
    return (
      <div className="no-alerts">
        <div className="no-alerts-icon">✅</div>
        <div className="no-alerts-text">No active alerts</div>
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
    <div className="alerts-list">
      {activeAlerts.map(alert => (
        <div key={alert.id} className={`alert-item ${alert.severity}`}>
          <div className="alert-header">
            <span className="alert-icon">{getSeverityIcon(alert.severity)}</span>
            <span className="alert-title">{alert.title}</span>
            <button
              onClick={() => onResolve(alert.id)}
              className="resolve-button"
              title="Resolve alert"
            >
              ✓
            </button>
          </div>
          <div className="alert-message">{alert.message}</div>
          <div className="alert-time">{formatRelativeTime(alert.timestamp)}</div>
        </div>
      ))}
    </div>
  );
}

function PerformanceChart({ metric, timeRange }) {
  // Placeholder for chart implementation
  return (
    <div className="performance-chart">
      <div className="chart-placeholder">
        <div className="chart-info">
          <h3>📈 {metric} over {timeRange}</h3>
          <p>Interactive performance charts would be displayed here</p>
          <p>Integration with Chart.js, D3, or similar charting library</p>
        </div>
      </div>
    </div>
  );
}

function SystemResources({ realTimeData }) {
  // Mock system resource data
  const resources = {
    cpu: 25,
    memory: 65,
    disk: 78,
    network: 42
  };

  const getUsageColor = (usage) => {
    if (usage >= 80) return '#F44336';
    if (usage >= 60) return '#FF9800';
    return '#4CAF50';
  };

  return (
    <div className="system-resources">
      <div className="resource-items">
        {Object.entries(resources).map(([resource, usage]) => (
          <div key={resource} className="resource-item">
            <div className="resource-header">
              <span className="resource-name">{resource.toUpperCase()}</span>
              <span className="resource-percentage">{usage}%</span>
            </div>
            <div className="resource-bar">
              <div
                className="resource-fill"
                style={{
                  width: `${usage}%`,
                  backgroundColor: getUsageColor(usage)
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Monitoring;
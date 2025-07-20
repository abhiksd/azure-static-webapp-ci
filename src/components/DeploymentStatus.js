import React, { useState, useEffect } from 'react';
import { formatDate, formatRelativeTime, formatDuration } from '../utils/dateUtils';
import { getEnvironmentInfo } from '../utils/environment';
import { trackUserInteraction } from '../utils/analytics';
import './DeploymentStatus.css';

function DeploymentStatus() {
  const [deployments, setDeployments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [environment] = useState(getEnvironmentInfo());

  useEffect(() => {
    fetchDeployments();
  }, []);

  const fetchDeployments = async () => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockDeployments = [
      {
        id: '1',
        version: '1.2.1',
        environment: 'production',
        status: 'success',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        duration: 225000, // 3m 45s
        author: 'deployment-bot',
        commitHash: 'a1b2c3d',
        buildId: 'build-456',
        deploymentUrl: 'https://yourdomain.com',
        changes: ['Fixed authentication bug', 'Updated dependencies', 'Performance improvements']
      },
      {
        id: '2',
        version: '1.2.0',
        environment: 'staging',
        status: 'success',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        duration: 252000, // 4m 12s
        author: 'john.doe',
        commitHash: 'x7y8z9w',
        buildId: 'build-455',
        deploymentUrl: 'https://staging.yourdomain.com',
        changes: ['New feature: user dashboard', 'Updated UI components']
      },
      {
        id: '3',
        version: '1.1.9',
        environment: 'development',
        status: 'failed',
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        duration: 83000, // 1m 23s
        author: 'jane.smith',
        commitHash: 'm4n5o6p',
        buildId: 'build-454',
        deploymentUrl: 'https://dev.yourdomain.com',
        changes: ['Work in progress: payment integration'],
        errorMessage: 'Build failed: Missing environment variable API_KEY'
      },
      {
        id: '4',
        version: '1.1.8',
        environment: 'production',
        status: 'success',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        duration: 198000, // 3m 18s
        author: 'deployment-bot',
        commitHash: 'q2w3e4r',
        buildId: 'build-453',
        deploymentUrl: 'https://yourdomain.com',
        changes: ['Security patches', 'Bug fixes']
      },
      {
        id: '5',
        version: '1.1.7',
        environment: 'staging',
        status: 'rollback',
        timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
        duration: 156000, // 2m 36s
        author: 'admin',
        commitHash: 't5y6u7i',
        buildId: 'build-452',
        deploymentUrl: 'https://staging.yourdomain.com',
        changes: ['Rolled back due to critical issue'],
        rollbackReason: 'Critical bug affecting user authentication'
      }
    ];
    
    setDeployments(mockDeployments);
    setIsLoading(false);
  };

  const handleRefresh = () => {
    trackUserInteraction('click', 'deployment_refresh');
    fetchDeployments();
  };

  const filteredDeployments = deployments.filter(deployment => {
    if (filter === 'all') return true;
    return deployment.environment === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      case 'rollback': return '🔄';
      default: return '❓';
    }
  };

  const getEnvironmentColor = (env) => {
    switch (env) {
      case 'production': return '#4CAF50';
      case 'staging': return '#FF9800';
      case 'development': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="deployment-status">
      <header className="deployment-header">
        <h1>Deployment Status</h1>
        <div className="deployment-controls">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="environment-filter"
          >
            <option value="all">All Environments</option>
            <option value="production">Production</option>
            <option value="staging">Staging</option>
            <option value="development">Development</option>
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

      <div className="current-deployment">
        <h2>Current Environment</h2>
        <div className="current-env-card">
          <div className="env-info">
            <div className="env-name">{environment.displayName}</div>
            <div className="env-version">Version: {environment.version}</div>
            <div className="env-build">Build: {environment.buildId}</div>
            <div className="env-deployed">Deployed: {formatDate(environment.deployedAt)}</div>
          </div>
          <div className="env-status">
            <div
              className="env-indicator"
              style={{ backgroundColor: getEnvironmentColor(environment.name) }}
            ></div>
            <span className="env-status-text">Active</span>
          </div>
        </div>
      </div>

      <div className="deployment-history">
        <h2>Deployment History</h2>
        
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading deployment history...</p>
          </div>
        ) : (
          <div className="deployments-list">
            {filteredDeployments.map(deployment => (
              <DeploymentCard
                key={deployment.id}
                deployment={deployment}
                getStatusIcon={getStatusIcon}
                getEnvironmentColor={getEnvironmentColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DeploymentCard({ deployment, getStatusIcon, getEnvironmentColor }) {
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
    if (!expanded) {
      trackUserInteraction('click', 'deployment_expand', { deploymentId: deployment.id });
    }
  };

  return (
    <div className={`deployment-card ${deployment.status}`}>
      <div className="deployment-summary" onClick={handleToggleExpanded}>
        <div className="deployment-main">
          <div className="deployment-header-info">
            <span className="deployment-version">v{deployment.version}</span>
            <span
              className="deployment-environment"
              style={{ backgroundColor: getEnvironmentColor(deployment.environment) }}
            >
              {deployment.environment}
            </span>
            <span className={`deployment-status-badge ${deployment.status}`}>
              {getStatusIcon(deployment.status)} {deployment.status}
            </span>
          </div>
          
          <div className="deployment-meta">
            <span className="deployment-time">{formatRelativeTime(deployment.timestamp)}</span>
            <span className="deployment-duration">Duration: {formatDuration(deployment.duration)}</span>
            <span className="deployment-author">By: {deployment.author}</span>
          </div>
        </div>
        
        <div className="deployment-expand">
          <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
        </div>
      </div>

      {expanded && (
        <div className="deployment-details">
          <div className="details-grid">
            <div className="detail-section">
              <h4>Build Information</h4>
              <div className="detail-items">
                <div className="detail-item">
                  <span className="detail-label">Build ID:</span>
                  <span className="detail-value">{deployment.buildId}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Commit Hash:</span>
                  <span className="detail-value">{deployment.commitHash}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Deployment URL:</span>
                  <a 
                    href={deployment.deploymentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="detail-link"
                  >
                    {deployment.deploymentUrl}
                  </a>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Deployed At:</span>
                  <span className="detail-value">{formatDate(deployment.timestamp)}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>Changes</h4>
              <div className="changes-list">
                {deployment.changes.map((change, index) => (
                  <div key={index} className="change-item">• {change}</div>
                ))}
              </div>
            </div>

            {deployment.errorMessage && (
              <div className="detail-section error-section">
                <h4>Error Details</h4>
                <div className="error-message">
                  {deployment.errorMessage}
                </div>
              </div>
            )}

            {deployment.rollbackReason && (
              <div className="detail-section rollback-section">
                <h4>Rollback Reason</h4>
                <div className="rollback-reason">
                  {deployment.rollbackReason}
                </div>
              </div>
            )}
          </div>

          <div className="deployment-actions">
            {deployment.status === 'success' && (
              <>
                <button className="action-button view-logs">
                  📋 View Logs
                </button>
                <button className="action-button view-diff">
                  📝 View Changes
                </button>
                {deployment.environment !== 'production' && (
                  <button className="action-button promote">
                    🚀 Promote to {deployment.environment === 'development' ? 'Staging' : 'Production'}
                  </button>
                )}
              </>
            )}
            
            {deployment.status === 'failed' && (
              <button className="action-button retry">
                🔄 Retry Deployment
              </button>
            )}
            
            {deployment.environment === 'production' && deployment.status === 'success' && (
              <button className="action-button rollback">
                ⏪ Rollback
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DeploymentStatus;
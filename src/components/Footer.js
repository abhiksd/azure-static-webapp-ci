import React from 'react';
import './Footer.css';

const Footer = ({ version, environment }) => {
  const currentYear = new Date().getFullYear();

  const getEnvironmentColor = (env) => {
    switch (env) {
      case 'production':
        return 'env-production';
      case 'staging':
        return 'env-staging';
      case 'pre-production':
        return 'env-pre-production';
      case 'development':
        return 'env-development';
      default:
        return 'env-default';
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-info">
            <p>&copy; {currentYear} Azure Static Web App Sample. All rights reserved.</p>
            <p>Built with React and deployed with Azure Static Web Apps</p>
          </div>
          
          <div className="footer-meta">
            <div className="version-info">
              <span className="label">Version:</span>
              <span className="value">{version}</span>
            </div>
            <div className="environment-info">
              <span className="label">Environment:</span>
              <span className={`environment-badge ${getEnvironmentColor(environment)}`}>
                {environment.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h4>Resources</h4>
            <ul>
              <li><a href="https://docs.microsoft.com/en-us/azure/static-web-apps/" target="_blank" rel="noopener noreferrer">Azure Static Web Apps Docs</a></li>
              <li><a href="https://docs.github.com/en/actions" target="_blank" rel="noopener noreferrer">GitHub Actions Docs</a></li>
              <li><a href="https://reactjs.org/docs" target="_blank" rel="noopener noreferrer">React Documentation</a></li>
            </ul>
          </div>
          
          <div className="link-group">
            <h4>CI/CD Pipeline</h4>
            <ul>
              <li><a href="https://sonarcloud.io/" target="_blank" rel="noopener noreferrer">SonarCloud</a></li>
              <li><a href="https://checkmarx.com/" target="_blank" rel="noopener noreferrer">Checkmarx</a></li>
              <li><a href="https://semantic-release.gitbook.io/" target="_blank" rel="noopener noreferrer">Semantic Release</a></li>
            </ul>
          </div>
          
          <div className="link-group">
            <h4>Development</h4>
            <ul>
              <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
              <li><a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer">Azure Portal</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()}>API Documentation</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
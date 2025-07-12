import React from 'react';
import './About.css';

const About = () => {
  const buildInfo = {
    version: process.env.REACT_APP_VERSION || '1.0.0',
    environment: process.env.REACT_APP_ENV || 'development',
    buildTime: process.env.REACT_APP_BUILD_TIME || new Date().toISOString(),
    nodeVersion: process.env.REACT_APP_NODE_VERSION || 'Unknown'
  };

  return (
    <div className="about">
      <div className="container">
        <h2>About This Application</h2>
        
        <section className="about-content">
          <p>
            This is a sample Node.js frontend application built with React to demonstrate 
            a production-grade CI/CD pipeline for Azure Static Web Apps.
          </p>
          
          <div className="tech-stack">
            <h3>Technology Stack</h3>
            <ul>
              <li><strong>Frontend:</strong> React 18</li>
              <li><strong>Routing:</strong> React Router v6</li>
              <li><strong>Testing:</strong> Jest & React Testing Library</li>
              <li><strong>E2E Testing:</strong> Cypress</li>
              <li><strong>Linting:</strong> ESLint</li>
              <li><strong>Build Tool:</strong> Create React App</li>
            </ul>
          </div>

          <div className="ci-cd-features">
            <h3>CI/CD Features</h3>
            <ul>
              <li>Multi-environment deployment (Dev, Staging, Pre-Prod, Production)</li>
              <li>Automated security scanning with SonarCloud and Checkmarx</li>
              <li>Semantic versioning with automated releases</li>
              <li>Release branch support for controlled deployments</li>
              <li>Azure Key Vault integration for secrets management</li>
              <li>Branch protection with required reviews and status checks</li>
              <li>Automated testing pipeline with coverage requirements</li>
              <li>Performance testing with Lighthouse</li>
            </ul>
          </div>

          <div className="build-info">
            <h3>Build Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">Version:</span>
                <span className="value">{buildInfo.version}</span>
              </div>
              <div className="info-item">
                <span className="label">Environment:</span>
                <span className="value environment-badge">{buildInfo.environment}</span>
              </div>
              <div className="info-item">
                <span className="label">Build Time:</span>
                <span className="value">{new Date(buildInfo.buildTime).toLocaleString()}</span>
              </div>
              <div className="info-item">
                <span className="label">Node Version:</span>
                <span className="value">{buildInfo.nodeVersion}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
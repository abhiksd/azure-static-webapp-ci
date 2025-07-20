import React from 'react';
import { getBuildInfo, getEnvironmentInfo } from '../utils/environment';
import './About.css';

const About = () => {
  const buildInfo = getBuildInfo();
  const environment = getEnvironmentInfo();

  return (
    <div className="about">
      <header className="about-header">
        <h1>About Azure Static Web App</h1>
        <p>A comprehensive Node.js frontend application with integrated monitoring, health checks, and deployment management</p>
      </header>

      <div className="about-content">
        <section className="about-section">
          <h2>🚀 Features</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h3>📊 Real-time Monitoring</h3>
              <p>Performance metrics, system resources, and application health tracking</p>
            </div>
            <div className="feature-item">
              <h3>🏥 Health Checks</h3>
              <p>Comprehensive health monitoring for APIs, databases, and external services</p>
            </div>
            <div className="feature-item">
              <h3>🚀 Deployment Tracking</h3>
              <p>Complete deployment history with rollback capabilities</p>
            </div>
            <div className="feature-item">
              <h3>🛡️ Security Integration</h3>
              <p>PR protection with SonarCloud and Checkmarx security scanning</p>
            </div>
            <div className="feature-item">
              <h3>📱 Responsive Design</h3>
              <p>Modern, mobile-first design with Azure design language</p>
            </div>
            <div className="feature-item">
              <h3>🔧 Configuration Management</h3>
              <p>Easy-to-use settings and environment-specific configurations</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>🏗️ Technology Stack</h2>
          <div className="tech-stack">
            <div className="tech-category">
              <h3>Frontend</h3>
              <ul>
                <li>React 18</li>
                <li>React Router 6</li>
                <li>Modern CSS with CSS Variables</li>
                <li>Responsive Design</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3>State Management</h3>
              <ul>
                <li>React Context API</li>
                <li>useReducer Hooks</li>
                <li>Custom Hooks</li>
                <li>Local Storage Integration</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3>Monitoring & Analytics</h3>
              <ul>
                <li>Real-time Health Checks</li>
                <li>Performance Monitoring</li>
                <li>Azure Application Insights</li>
                <li>Custom Analytics</li>
              </ul>
            </div>
            <div className="tech-category">
              <h3>Deployment</h3>
              <ul>
                <li>Azure Static Web Apps</li>
                <li>GitHub Actions CI/CD</li>
                <li>Multi-environment Support</li>
                <li>Automated Testing</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>📋 Application Information</h2>
          <div className="app-info-grid">
            <div className="info-card">
              <h3>Environment</h3>
              <div className="info-details">
                <div className="info-item">
                  <span className="info-label">Current Environment:</span>
                  <span className={`info-value environment-${environment.name}`}>
                    {environment.displayName}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">API URL:</span>
                  <span className="info-value">{environment.apiUrl}</span>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>Build Information</h3>
              <div className="info-details">
                <div className="info-item">
                  <span className="info-label">Version:</span>
                  <span className="info-value">{buildInfo.version}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Build ID:</span>
                  <span className="info-value">{buildInfo.buildId}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Build Date:</span>
                  <span className="info-value">
                    {new Date(buildInfo.buildDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Git Commit:</span>
                  <span className="info-value">{buildInfo.gitCommit}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>🔗 Quick Links</h2>
          <div className="quick-links">
            <a href="https://github.com/abhiksd/azure-static-webapp-ci" 
               target="_blank" 
               rel="noopener noreferrer"
               className="quick-link">
              📁 GitHub Repository
            </a>
            <a href="/api/health" 
               target="_blank" 
               rel="noopener noreferrer"
               className="quick-link">
              🏥 API Health Check
            </a>
            <a href="https://azure.microsoft.com/services/app-service/static/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="quick-link">
              ☁️ Azure Static Web Apps
            </a>
            <a href="https://reactjs.org/" 
               target="_blank" 
               rel="noopener noreferrer"
               className="quick-link">
              ⚛️ React Documentation
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
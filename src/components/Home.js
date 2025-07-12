import React, { useState, useEffect } from 'react';
import './Home.css';

const Home = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="home">
      <div className="container">
        <section className="hero">
          <h2>Welcome to Azure Static Web Apps</h2>
          <p>Production-grade CI/CD pipeline demonstration</p>
          <div className="current-time" data-testid="current-time">
            <p>Current Time: {currentTime.toLocaleString()}</p>
          </div>
        </section>

        <section className="features">
          <h3>Pipeline Features</h3>
          <div className="features-grid">
            <div className="feature-card">
              <h4>🚀 Multi-Environment Deployment</h4>
              <p>Automated deployment to Development, Staging, and Production environments</p>
            </div>
            <div className="feature-card">
              <h4>🔐 Security Scanning</h4>
              <p>Integrated SonarCloud and Checkmarx security scanning</p>
            </div>
            <div className="feature-card">
              <h4>🏷️ Semantic Versioning</h4>
              <p>Automated version management with semantic-release</p>
            </div>
            <div className="feature-card">
              <h4>🔄 Release Branches</h4>
              <p>Support for release/** branches for controlled production deployments</p>
            </div>
            <div className="feature-card">
              <h4>🔑 Azure Key Vault</h4>
              <p>Secure secrets management with Azure Key Vault integration</p>
            </div>
            <div className="feature-card">
              <h4>📊 Quality Gates</h4>
              <p>Mandatory security and quality checks before deployment</p>
            </div>
          </div>
        </section>

        <section className="deployment-info">
          <h3>Deployment Strategy</h3>
          <div className="deployment-table">
            <table>
              <thead>
                <tr>
                  <th>Environment</th>
                  <th>Trigger</th>
                  <th>Version Format</th>
                  <th>Approval Required</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Development</td>
                  <td>Push to develop</td>
                  <td>Short SHA</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>Staging</td>
                  <td>Push to main</td>
                  <td>Short SHA</td>
                  <td>No</td>
                </tr>
                <tr>
                  <td>Pre-Production</td>
                  <td>Push to release/**</td>
                  <td>Release version</td>
                  <td>Yes</td>
                </tr>
                <tr>
                  <td>Production</td>
                  <td>Semantic release tag</td>
                  <td>Semantic version</td>
                  <td>Yes</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
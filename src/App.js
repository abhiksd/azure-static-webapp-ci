import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import './App.css';

// Components
import Dashboard from './components/Dashboard';
import HealthCheck from './components/HealthCheck';
import Monitoring from './components/Monitoring';
import DeploymentStatus from './components/DeploymentStatus';
import UserProfile from './components/UserProfile';
import Settings from './components/Settings';
import About from './components/About';

// Context for app-wide state
import { AppProvider } from './context/AppContext';
import { HealthProvider } from './context/HealthContext';
import { MonitoringProvider } from './context/MonitoringContext';

// Utils
import { getEnvironmentInfo } from './utils/environment';
import { initializeAnalytics } from './utils/analytics';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [environment, setEnvironment] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get environment information
        const envInfo = getEnvironmentInfo();
        setEnvironment(envInfo);

        // Initialize analytics and monitoring
        await initializeAnalytics(envInfo);

        // Simulate app initialization
        await new Promise(resolve => setTimeout(resolve, 1000));

        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AppProvider>
      <HealthProvider>
        <MonitoringProvider>
          <Router>
            <div className="app">
              <Header environment={environment} />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/health" element={<HealthCheck />} />
                  <Route path="/monitoring" element={<Monitoring />} />
                  <Route path="/deployments" element={<DeploymentStatus />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/about" element={<About />} />
                </Routes>
              </main>
              <Footer environment={environment} />
            </div>
          </Router>
        </MonitoringProvider>
      </HealthProvider>
    </AppProvider>
  );
}

// Header Component
function Header({ environment }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <div className="header-container">
        <div className="logo-section">
          <h1 className="app-title">
            Azure Static Web App
            <span className="environment-badge" data-env={environment?.name}>
              {environment?.name}
            </span>
          </h1>
        </div>
        
        <nav className={`main-nav ${menuOpen ? 'nav-open' : ''}`}>
          <Link to="/" className="nav-link">Dashboard</Link>
          <Link to="/health" className="nav-link">Health</Link>
          <Link to="/monitoring" className="nav-link">Monitoring</Link>
          <Link to="/deployments" className="nav-link">Deployments</Link>
          <Link to="/settings" className="nav-link">Settings</Link>
        </nav>

        <div className="header-actions">
          <EnvironmentIndicator environment={environment} />
          <button 
            className="mobile-menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
}

// Environment Indicator Component
function EnvironmentIndicator({ environment }) {
  if (!environment) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'error': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div className="environment-indicator">
      <div 
        className="status-dot" 
        style={{ backgroundColor: getStatusColor(environment.status) }}
      ></div>
      <span className="environment-text">
        {environment.displayName} ({environment.version})
      </span>
    </div>
  );
}

// Loading Screen Component
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <h2>Initializing Azure Static Web App</h2>
      <p>Setting up monitoring and health checks...</p>
    </div>
  );
}

// Error Boundary Component
function ErrorBoundary({ error }) {
  const [details, setDetails] = useState(false);

  return (
    <div className="error-boundary">
      <div className="error-container">
        <h1>🚨 Application Error</h1>
        <p>Something went wrong while loading the application.</p>
        
        <div className="error-actions">
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            Reload Page
          </button>
          <button 
            onClick={() => setDetails(!details)}
            className="details-button"
          >
            {details ? 'Hide' : 'Show'} Details
          </button>
        </div>

        {details && (
          <div className="error-details">
            <h3>Error Details:</h3>
            <pre>{error}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Footer Component
function Footer({ environment }) {
  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-info">
          <p>&copy; 2024 Azure Static Web App Sample</p>
          <p>
            Build: {environment?.buildId || 'dev'} | 
            Deployed: {environment?.deployedAt || 'local'} |
            Version: {environment?.version || '1.0.0'}
          </p>
        </div>
        
        <div className="footer-links">
          <Link to="/about">About</Link>
          <a 
            href="https://github.com/abhiksd/azure-static-webapp-ci" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a 
            href="/api/health" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            API Health
          </a>
        </div>
      </div>
    </footer>
  );
}

export default App;
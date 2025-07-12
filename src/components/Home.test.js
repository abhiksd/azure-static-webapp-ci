import { render, screen } from '@testing-library/react';
import Home from './Home';

test('renders welcome message', () => {
  render(<Home />);
  
  const welcomeElement = screen.getByText(/Welcome to Azure Static Web Apps/i);
  expect(welcomeElement).toBeInTheDocument();
});

test('renders pipeline features', () => {
  render(<Home />);
  
  const featuresHeading = screen.getByText(/Pipeline Features/i);
  expect(featuresHeading).toBeInTheDocument();
  
  const multiEnvFeature = screen.getByText(/Multi-Environment Deployment/i);
  const securityFeature = screen.getByText(/Security Scanning/i);
  const versioningFeature = screen.getByText(/Semantic Versioning/i);
  
  expect(multiEnvFeature).toBeInTheDocument();
  expect(securityFeature).toBeInTheDocument();
  expect(versioningFeature).toBeInTheDocument();
});

test('renders deployment strategy table', () => {
  render(<Home />);
  
  const strategyHeading = screen.getByText(/Deployment Strategy/i);
  expect(strategyHeading).toBeInTheDocument();
  
  const table = screen.getByRole('table');
  expect(table).toBeInTheDocument();
  
  // Check for table headers
  const environmentHeader = screen.getByText(/Environment/i);
  const triggerHeader = screen.getByText(/Trigger/i);
  const versionHeader = screen.getByText(/Version Format/i);
  
  expect(environmentHeader).toBeInTheDocument();
  expect(triggerHeader).toBeInTheDocument();
  expect(versionHeader).toBeInTheDocument();
});

test('renders current time', () => {
  render(<Home />);
  
  const timeElement = screen.getByText(/Current Time:/i);
  expect(timeElement).toBeInTheDocument();
});

test('renders feature cards', () => {
  render(<Home />);
  
  const releaseFeature = screen.getByText(/Release Branches/i);
  const keyVaultFeature = screen.getByText(/Azure Key Vault/i);
  const qualityGatesFeature = screen.getByText(/Quality Gates/i);
  
  expect(releaseFeature).toBeInTheDocument();
  expect(keyVaultFeature).toBeInTheDocument();
  expect(qualityGatesFeature).toBeInTheDocument();
});
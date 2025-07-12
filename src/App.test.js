import { render, screen } from '@testing-library/react';
import App from './App';

// Mock environment variables
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    REACT_APP_VERSION: '1.0.0',
    REACT_APP_ENV: 'test'
  };
});

afterEach(() => {
  process.env = originalEnv;
});

test('renders Azure Static Web App heading', () => {
  render(<App />);
  const headingElement = screen.getByText(/Azure Static Web App/i);
  expect(headingElement).toBeInTheDocument();
});

test('renders navigation links', () => {
  render(<App />);
  
  const homeLink = screen.getByRole('link', { name: /home/i });
  const aboutLink = screen.getByRole('link', { name: /about/i });
  const contactLink = screen.getByRole('link', { name: /contact/i });
  
  expect(homeLink).toBeInTheDocument();
  expect(aboutLink).toBeInTheDocument();
  expect(contactLink).toBeInTheDocument();
});

test('renders footer with version information', () => {
  render(<App />);
  
  const versionElement = screen.getByText(/version/i);
  const environmentElement = screen.getByText(/environment/i);
  
  expect(versionElement).toBeInTheDocument();
  expect(environmentElement).toBeInTheDocument();
});

test('renders main content area', () => {
  render(<App />);
  
  const mainElement = screen.getByRole('main');
  expect(mainElement).toBeInTheDocument();
  expect(mainElement).toHaveClass('main-content');
});
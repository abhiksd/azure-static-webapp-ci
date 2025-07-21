# 🔧 Frontend Application Integration Guide

This guide shows exactly what changes you need to make in your frontend application to work seamlessly with the intermediate CI/CD pipeline.

## 📋 **Quick Integration Checklist**

- [ ] Update `package.json` with required scripts and dependencies
- [ ] Create `sonar-project.properties` for SonarCloud
- [ ] Configure test coverage reports
- [ ] Set up environment-specific build configurations
- [ ] Configure Azure Static Web Apps settings
- [ ] Set up repository secrets and variables

---

## 📦 **1. Package.json Configuration**

### **Essential Scripts & Dependencies**

Update your `package.json` with these required scripts:

```json
{
  "name": "your-frontend-app",
  "version": "1.0.0",
  "scripts": {
    "build": "react-scripts build",
    "test": "react-scripts test",
    "test:coverage": "react-scripts test --coverage --ci --passWithNoTests",
    "lint": "eslint src/ --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src/ --ext .js,.jsx,.ts,.tsx --fix",
    "sonar": "sonar-scanner"
  },
  "devDependencies": {
    "sonarqube-scanner": "^3.0.1",
    "@testing-library/jest-dom": "^5.16.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.4.0",
    "eslint": "^8.45.0"
  },
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{js,jsx,ts,tsx}",
      "!src/index.js",
      "!src/serviceWorker.js",
      "!src/reportWebVitals.js",
      "!src/**/*.d.ts"
    ],
    "coverageReporters": ["lcov", "text", "html"],
    "coverageDirectory": "coverage",
    "coverageThreshold": {
      "global": {
        "branches": 70,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  }
}
```

### **Key Changes Explained:**

- **`test:coverage`**: Generates coverage reports for SonarCloud
- **`lint`**: Code quality checking (used in pipeline)
- **`sonar`**: SonarCloud scanning via npm
- **`sonarqube-scanner`**: Required dependency for SonarCloud integration
- **Jest configuration**: Coverage settings and thresholds

---

## 🔬 **2. SonarCloud Configuration**

### **Create `sonar-project.properties`**

```properties
# SonarCloud Configuration
sonar.projectKey=your-github-username/your-repo-name
sonar.organization=your-sonar-organization

# Project information
sonar.projectName=Your Frontend App
sonar.projectVersion=1.0

# Source and test paths
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.js,**/*.test.jsx,**/*.test.ts,**/*.test.tsx,**/*.spec.js,**/*.spec.jsx,**/*.spec.ts,**/*.spec.tsx

# Exclusions
sonar.exclusions=**/node_modules/**,**/dist/**,**/build/**,**/coverage/**,public/**,**/*.config.js
sonar.coverage.exclusions=src/index.js,src/serviceWorker.js,src/reportWebVitals.js,**/*.config.js,**/*.test.*,**/*.spec.*

# Coverage reports
sonar.javascript.lcov.reportPaths=coverage/lcov.info
sonar.typescript.lcov.reportPaths=coverage/lcov.info

# Quality gate
sonar.qualitygate.wait=true
```

### **Alternative: Package.json Configuration**

If you prefer not to use a separate file, add this to `package.json`:

```json
{
  "sonarqube": {
    "projectKey": "your-github-username/your-repo-name",
    "organization": "your-sonar-organization",
    "sources": "src",
    "tests": "src",
    "testInclusions": "**/*.test.*,**/*.spec.*",
    "exclusions": "**/node_modules/**,**/dist/**,**/build/**,**/coverage/**",
    "coverageExclusions": "src/index.js,src/serviceWorker.js,**/*.test.*,**/*.spec.*"
  }
}
```

---

## 🏗️ **3. Build Configuration**

### **Environment-Specific Builds**

Create environment configuration files:

**`.env`** (Development):
```bash
REACT_APP_API_BASE_URL=https://api-dev.yourapp.com
REACT_APP_ENVIRONMENT=development
REACT_APP_VERSION=$npm_package_version
GENERATE_SOURCEMAP=true
```

**`.env.staging`**:
```bash
REACT_APP_API_BASE_URL=https://api-staging.yourapp.com
REACT_APP_ENVIRONMENT=staging
REACT_APP_VERSION=$npm_package_version
GENERATE_SOURCEMAP=false
```

**`.env.production`**:
```bash
REACT_APP_API_BASE_URL=https://api.yourapp.com
REACT_APP_ENVIRONMENT=production
REACT_APP_VERSION=$npm_package_version
GENERATE_SOURCEMAP=false
```

### **Update Build Scripts (Optional)**

```json
{
  "scripts": {
    "build": "react-scripts build",
    "build:staging": "env-cmd -f .env.staging react-scripts build",
    "build:production": "env-cmd -f .env.production react-scripts build"
  },
  "devDependencies": {
    "env-cmd": "^10.1.0"
  }
}
```

---

## 🌐 **4. Azure Static Web Apps Configuration**

### **Create `staticwebapp.config.json`**

```json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["authenticated"]
    },
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
  },
  "mimeTypes": {
    ".json": "application/json"
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'"
  }
}
```

### **Update `public/index.html`** (Optional)

Add environment variables:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>%REACT_APP_TITLE%</title>
  </head>
  <body>
    <div id="root"></div>
    <script>
      window.APP_CONFIG = {
        API_BASE_URL: '%REACT_APP_API_BASE_URL%',
        ENVIRONMENT: '%REACT_APP_ENVIRONMENT%',
        VERSION: '%REACT_APP_VERSION%'
      };
    </script>
  </body>
</html>
```

---

## 🔑 **5. Repository Secrets Configuration**

### **Required Secrets (Repository Settings → Secrets)**

```bash
# SonarCloud
SONAR_TOKEN=your_sonarcloud_token

# Azure Static Web Apps (one per environment)
AZURE_STATIC_WEB_APPS_API_TOKEN_DEV=your_dev_token
AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING=your_staging_token
AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD=your_preprod_token
AZURE_STATIC_WEB_APPS_API_TOKEN_PROD=your_prod_token

# Checkmarx (if using security scanning)
CHECKMARX_URL=https://your-checkmarx-server.com
CHECKMARX_USERNAME=your_username
CHECKMARX_PASSWORD=your_password
CHECKMARX_SECRET=your_client_secret
CHECKMARX_TENANT=your_tenant
```

### **Required Variables (Repository Settings → Variables)**

```bash
# SonarCloud
SONAR_ORGANIZATION=your-sonar-org

# Quality Thresholds
ENABLE_SONAR_SCAN=true
ENABLE_CHECKMARX_SCAN=true
MIN_CODE_COVERAGE=80
MAX_CRITICAL_VULNERABILITIES=0
MAX_HIGH_VULNERABILITIES=2

# Checkmarx
CHECKMARX_SCAN_TYPES=sca,sast,kics
CHECKMARX_PRESET=Checkmarx Default
```

---

## 🧪 **6. Testing Configuration**

### **Example Test File** (`src/App.test.js`):

```javascript
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app component', () => {
  render(<App />);
  const linkElement = screen.getByText(/welcome/i);
  expect(linkElement).toBeInTheDocument();
});

test('app has correct environment', () => {
  expect(process.env.NODE_ENV).toBeDefined();
});
```

### **Coverage Setup**

Ensure your tests generate coverage:

```bash
# This should work after pipeline setup
npm run test:coverage
```

---

## 📁 **7. Project Structure**

Your project should look like this:

```
your-frontend-app/
├── public/
│   ├── index.html
│   └── staticwebapp.config.json
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   ├── App.js
│   ├── App.test.js
│   └── index.js
├── .env
├── .env.staging
├── .env.production
├── .gitignore
├── package.json
├── sonar-project.properties
└── README.md
```

---

## 🚀 **8. Verification Steps**

### **Local Testing:**

```bash
# Install dependencies
npm install

# Run tests with coverage
npm run test:coverage

# Run linting
npm run lint

# Build the app
npm run build

# Test SonarCloud (requires SONAR_TOKEN)
npm run sonar
```

### **Check Pipeline Compatibility:**

1. **Coverage Report**: `coverage/lcov.info` should exist after tests
2. **Build Output**: `build/` directory should be created
3. **Linting**: Should pass without errors
4. **SonarCloud**: Should connect and analyze successfully

---

## ⚡ **9. Quick Setup Script**

Create this setup script (`setup-pipeline.sh`):

```bash
#!/bin/bash
echo "🔧 Setting up frontend app for CI/CD pipeline..."

# Install required dependencies
npm install --save-dev sonarqube-scanner eslint @testing-library/jest-dom @testing-library/react @testing-library/user-event

# Run initial tests to generate coverage
npm run test:coverage -- --passWithNoTests

# Run linting
npm run lint -- --fix

# Create SonarCloud properties if not exists
if [ ! -f "sonar-project.properties" ]; then
    echo "Creating sonar-project.properties..."
    # Add your sonar config here
fi

echo "✅ Setup complete! Your app is ready for the CI/CD pipeline."
```

---

## 🎯 **10. Common Issues & Solutions**

### **Issue: Tests Fail in CI**
```bash
# Solution: Add to package.json
"test": "react-scripts test --ci --passWithNoTests"
```

### **Issue: Coverage Not Generated**
```bash
# Solution: Ensure test script includes coverage
"test:coverage": "react-scripts test --coverage --ci --passWithNoTests"
```

### **Issue: SonarCloud Connection Fails**
- Check `SONAR_TOKEN` secret is set
- Verify `SONAR_ORGANIZATION` variable is correct
- Ensure `sonar-project.properties` has correct project key

### **Issue: Build Fails**
- Check all dependencies are in `package.json`
- Verify build script produces `build/` directory
- Ensure no TypeScript errors if using TypeScript

---

## ✅ **Final Checklist**

Before pushing to trigger the pipeline:

- [ ] `package.json` has all required scripts and dependencies
- [ ] `sonar-project.properties` is configured correctly
- [ ] Test coverage is working locally (`npm run test:coverage`)
- [ ] Build is working locally (`npm run build`)
- [ ] All repository secrets and variables are set
- [ ] `.env` files are configured for different environments
- [ ] `staticwebapp.config.json` is created for Azure deployment

---

**🎉 That's it! Your frontend application is now fully configured to work seamlessly with the intermediate CI/CD pipeline!**

The pipeline will automatically:
- Build and test your app
- Run SonarCloud analysis
- Perform security scanning with Checkmarx
- Deploy to appropriate environments based on branch/tag
- Generate coverage reports and quality metrics

**No more manual configuration needed - just push your code and let the pipeline handle the rest!** 🚀
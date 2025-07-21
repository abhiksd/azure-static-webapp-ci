#!/bin/bash

echo "🔧 Setting up Frontend App for Intermediate CI/CD Pipeline"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ package.json not found! Please run this script in your frontend project root.${NC}"
    exit 1
fi

echo -e "${BLUE}📦 Detected frontend project${NC}"

# Detect framework
if grep -q "react-scripts" package.json; then
    FRAMEWORK="react"
    echo -e "${GREEN}🔍 Detected: React Application${NC}"
elif grep -q "vue-cli-service" package.json || grep -q "@vue/cli" package.json; then
    FRAMEWORK="vue"
    echo -e "${GREEN}🔍 Detected: Vue.js Application${NC}"
elif grep -q "next" package.json; then
    FRAMEWORK="next"
    echo -e "${GREEN}🔍 Detected: Next.js Application${NC}"
else
    FRAMEWORK="generic"
    echo -e "${YELLOW}🔍 Detected: Generic Node.js Application${NC}"
fi

echo ""
echo -e "${BLUE}1. Installing required dependencies...${NC}"

# Install SonarCloud scanner
if ! grep -q "sonarqube-scanner" package.json; then
    echo "Installing sonarqube-scanner..."
    npm install --save-dev sonarqube-scanner
else
    echo "✅ sonarqube-scanner already installed"
fi

# Install testing libraries if React
if [ "$FRAMEWORK" = "react" ]; then
    if ! grep -q "@testing-library/jest-dom" package.json; then
        echo "Installing React testing libraries..."
        npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event
    else
        echo "✅ React testing libraries already installed"
    fi
fi

# Install ESLint if not present
if ! grep -q "eslint" package.json; then
    echo "Installing ESLint..."
    npm install --save-dev eslint
else
    echo "✅ ESLint already installed"
fi

echo ""
echo -e "${BLUE}2. Updating package.json scripts...${NC}"

# Create backup
cp package.json package.json.backup
echo "📋 Created backup: package.json.backup"

# Update scripts using Node.js
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add/update scripts
pkg.scripts = pkg.scripts || {};
pkg.scripts['test:coverage'] = pkg.scripts['test:coverage'] || 
  (pkg.scripts.test ? pkg.scripts.test + ' --coverage --ci --passWithNoTests' : 'npm test -- --coverage --ci --passWithNoTests');
pkg.scripts['lint'] = pkg.scripts['lint'] || 'eslint src/ --ext .js,.jsx,.ts,.tsx';
pkg.scripts['lint:fix'] = pkg.scripts['lint:fix'] || 'eslint src/ --ext .js,.jsx,.ts,.tsx --fix';
pkg.scripts['sonar'] = 'sonar-scanner';

// Add Jest configuration if not present
if (!pkg.jest && '$FRAMEWORK' === 'react') {
  pkg.jest = {
    collectCoverageFrom: [
      'src/**/*.{js,jsx,ts,tsx}',
      '!src/index.js',
      '!src/serviceWorker.js',
      '!src/reportWebVitals.js',
      '!src/**/*.d.ts'
    ],
    coverageReporters: ['lcov', 'text', 'html'],
    coverageDirectory: 'coverage',
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 80,
        lines: 80,
        statements: 80
      }
    }
  };
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
console.log('✅ Updated package.json scripts');
"

echo ""
echo -e "${BLUE}3. Creating SonarCloud configuration...${NC}"

if [ ! -f "sonar-project.properties" ]; then
    cat > sonar-project.properties << EOF
# SonarCloud Configuration
sonar.projectKey=your-github-username/your-repo-name
sonar.organization=your-sonar-organization
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
EOF
    echo "✅ Created sonar-project.properties"
    echo -e "${YELLOW}⚠️  Remember to update project key and organization in sonar-project.properties${NC}"
else
    echo "✅ sonar-project.properties already exists"
fi

echo ""
echo -e "${BLUE}4. Creating Azure Static Web Apps configuration...${NC}"

if [ ! -f "public/staticwebapp.config.json" ] && [ ! -f "staticwebapp.config.json" ]; then
    # Create in public folder if it exists, otherwise in root
    CONFIG_PATH="staticwebapp.config.json"
    if [ -d "public" ]; then
        CONFIG_PATH="public/staticwebapp.config.json"
    fi
    
    cat > "$CONFIG_PATH" << EOF
{
  "routes": [
    {
      "route": "/*",
      "serve": "/index.html",
      "statusCode": 200
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif,ico,svg}", "/css/*", "/js/*", "/static/*"]
  },
  "globalHeaders": {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY"
  }
}
EOF
    echo "✅ Created $CONFIG_PATH"
else
    echo "✅ Azure Static Web Apps config already exists"
fi

echo ""
echo -e "${BLUE}5. Creating/updating .gitignore...${NC}"

# Create or update .gitignore
if [ ! -f ".gitignore" ]; then
    echo "Creating comprehensive .gitignore..."
    cat > .gitignore << 'EOF'
# Frontend Application .gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Package managers  
package-lock.json
yarn.lock
pnpm-lock.yaml

# Coverage
coverage/
*.lcov
.nyc_output

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
.env.staging

# Build outputs
build/
dist/
out/
.next/
.nuxt/

# Logs
logs
*.log

# OS files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo

# Testing
__tests__/__snapshots__/

# SonarCloud
.scannerwork/

# Azure
.azure/

# Temporary files
tmp/
temp/
*.backup
*.bak

# Source maps
*.js.map
*.css.map
EOF
    echo "✅ Created comprehensive .gitignore"
else
    echo "⚠️ .gitignore already exists"
    # Add essential entries if missing
    if ! grep -q "node_modules" .gitignore; then
        echo "" >> .gitignore
        echo "# Added by pipeline setup" >> .gitignore
        echo "node_modules/" >> .gitignore
        echo "coverage/" >> .gitignore
        echo "build/" >> .gitignore
        echo "dist/" >> .gitignore
        echo ".env*" >> .gitignore
        echo "✅ Added essential entries to existing .gitignore"
    else
        echo "✅ Essential entries already present in .gitignore"
    fi
fi

echo ""
echo -e "${BLUE}6. Creating environment files...${NC}"

if [ ! -f ".env" ]; then
    cat > .env << EOF
# Development Environment
REACT_APP_API_BASE_URL=https://api-dev.yourapp.com
REACT_APP_ENVIRONMENT=development
GENERATE_SOURCEMAP=true
EOF
    echo "✅ Created .env (development)"
else
    echo "✅ .env already exists"
fi

if [ ! -f ".env.production" ]; then
    cat > .env.production << EOF
# Production Environment  
REACT_APP_API_BASE_URL=https://api.yourapp.com
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
EOF
    echo "✅ Created .env.production"
else
    echo "✅ .env.production already exists"
fi

echo ""
echo -e "${BLUE}7. Running verification tests...${NC}"

echo "Testing npm scripts..."

# Test if coverage can be generated
if npm run test:coverage 2>/dev/null; then
    echo "✅ Coverage generation works"
else
    echo -e "${YELLOW}⚠️  Coverage test failed - this may be normal if no tests exist yet${NC}"
fi

# Test if build works
if npm run build >/dev/null 2>&1; then
    echo "✅ Build works"
else
    echo -e "${RED}❌ Build failed - please check your build configuration${NC}"
fi

# Test if linting works
if npm run lint >/dev/null 2>&1; then
    echo "✅ Linting works"
else
    echo -e "${YELLOW}⚠️  Linting issues found - run 'npm run lint:fix' to auto-fix${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Frontend app setup complete!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Update sonar-project.properties with your actual project details"
echo "2. Set up repository secrets in GitHub:"
echo "   - SONAR_TOKEN"
echo "   - AZURE_STATIC_WEB_APPS_API_TOKEN_* (for each environment)"
echo "3. Set up repository variables:"
echo "   - SONAR_ORGANIZATION"
echo "   - MIN_CODE_COVERAGE=80"
echo "4. Copy the intermediate CI/CD workflow to .github/workflows/"
echo "5. Push your changes to trigger the pipeline"
echo ""
echo -e "${GREEN}✅ Your app is now ready for the intermediate CI/CD pipeline!${NC}"

# Create a quick reference file
cat > PIPELINE_SETUP.md << EOF
# Pipeline Setup Completed

## What was configured:
- ✅ package.json updated with required scripts
- ✅ SonarCloud configuration created
- ✅ Azure Static Web Apps config created  
- ✅ Environment files created
- ✅ Required dependencies installed

## Required GitHub Secrets:
\`\`\`
SONAR_TOKEN=your_sonarcloud_token
AZURE_STATIC_WEB_APPS_API_TOKEN_DEV=your_dev_token
AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING=your_staging_token
AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD=your_preprod_token
AZURE_STATIC_WEB_APPS_API_TOKEN_PROD=your_prod_token
\`\`\`

## Required GitHub Variables:
\`\`\`
SONAR_ORGANIZATION=your-sonar-org
MIN_CODE_COVERAGE=80
ENABLE_SONAR_SCAN=true
ENABLE_CHECKMARX_SCAN=true
\`\`\`

## Next: 
1. Update sonar-project.properties with your details
2. Copy .github/workflows/intermediate-ci-cd.yml to your repo
3. Set up GitHub secrets and variables
4. Push and enjoy automated CI/CD! 🚀
EOF

echo "📋 Created PIPELINE_SETUP.md with next steps"
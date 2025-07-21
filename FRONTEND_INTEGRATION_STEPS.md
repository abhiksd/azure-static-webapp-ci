# 🚀 Step-by-Step: Integrate CI/CD Pipeline with Your Frontend App

This guide helps you integrate the intermediate CI/CD pipeline with your existing frontend application in **another repository**.

## 📋 **Integration Overview**

You have **two repositories**:
1. **Pipeline Repository** (this repo): Contains the CI/CD workflow and composite actions
2. **Your Frontend App Repository**: Where you want to add the CI/CD pipeline

## 🎯 **Integration Process**

### **Step 1: Copy Pipeline Files to Your Frontend Repository**

Go to your frontend app repository and copy these files from this pipeline repository:

```bash
# Navigate to your frontend app repository
cd /path/to/your-frontend-app

# Create GitHub Actions directory structure
mkdir -p .github/workflows
mkdir -p .github/actions

# Copy the main workflow file
curl -o .github/workflows/intermediate-ci-cd.yml \
  https://raw.githubusercontent.com/abhiksd/azure-static-webapp-ci/main/.github/workflows/intermediate-ci-cd.yml

# Copy the composite actions
curl -o .github/actions/sonar-analysis/action.yml --create-dirs \
  https://raw.githubusercontent.com/abhiksd/azure-static-webapp-ci/main/.github/actions/sonar-analysis/action.yml

curl -o .github/actions/checkmarx-scan/action.yml --create-dirs \
  https://raw.githubusercontent.com/abhiksd/azure-static-webapp-ci/main/.github/actions/checkmarx-scan/action.yml
```

### **Step 2: Use the Automated Setup Script**

Download and run the setup script in your frontend repository:

```bash
# Download the setup script
curl -o setup-frontend-pipeline.sh \
  https://raw.githubusercontent.com/abhiksd/azure-static-webapp-ci/main/setup-frontend-pipeline.sh

# Make it executable
chmod +x setup-frontend-pipeline.sh

# Run the setup (this will configure your frontend app)
./setup-frontend-pipeline.sh
```

**What the script does:**
- ✅ Detects your framework (React/Vue/Next.js)
- ✅ Installs required dependencies (`sonarqube-scanner`, testing libraries)
- ✅ Updates your `package.json` with required scripts
- ✅ Creates `sonar-project.properties` 
- ✅ Sets up Azure Static Web Apps configuration
- ✅ Creates environment files
- ✅ Tests everything to ensure it works

### **Step 3: Configure Your Project Details**

After running the script, update the generated files with your project details:

**3.1. Update `sonar-project.properties`:**
```properties
# Replace these with your actual values
sonar.projectKey=your-github-username/your-frontend-repo-name
sonar.organization=your-sonar-organization
sonar.projectName=Your Frontend App Name
```

**3.2. Update environment files (optional):**
```bash
# .env
REACT_APP_API_BASE_URL=https://api-dev.yourapp.com
REACT_APP_ENVIRONMENT=development

# .env.production  
REACT_APP_API_BASE_URL=https://api.yourapp.com
REACT_APP_ENVIRONMENT=production
```

### **Step 4: Set Up GitHub Repository Secrets**

In your frontend repository, go to **Settings → Secrets and variables → Actions** and add:

**Required Secrets:**
```
SONAR_TOKEN=your_sonarcloud_token
AZURE_STATIC_WEB_APPS_API_TOKEN_DEV=your_dev_token
AZURE_STATIC_WEB_APPS_API_TOKEN_STAGING=your_staging_token
AZURE_STATIC_WEB_APPS_API_TOKEN_PREPROD=your_preprod_token
AZURE_STATIC_WEB_APPS_API_TOKEN_PROD=your_prod_token

# If using Checkmarx
CHECKMARX_BASE_URI=https://ast.checkmarx.net
CHECKMARX_CLIENT_ID=your_client_id
CHECKMARX_SECRET=your_client_secret
CHECKMARX_TENANT=your_tenant
```

**Required Variables:**
```
SONAR_ORGANIZATION=your-sonar-org
MIN_CODE_COVERAGE=80
ENABLE_SONAR_SCAN=true
ENABLE_CHECKMARX_SCAN=true
MAX_CRITICAL_VULNERABILITIES=0
MAX_HIGH_VULNERABILITIES=2
CHECKMARX_SCAN_TYPES=sca,sast,kics
```

### **Step 5: Test Locally (Optional but Recommended)**

Before pushing, test that everything works locally:

```bash
# Test the new scripts work
npm run test:coverage
npm run lint
npm run build
npm run sonar  # (requires SONAR_TOKEN environment variable)
```

### **Step 6: Push and Activate Pipeline**

```bash
# Add all the new files
git add .

# Commit the changes
git commit -m "Add intermediate CI/CD pipeline

- Added GitHub Actions workflow for multi-environment deployment
- Added SonarCloud analysis with npm scripts
- Added Checkmarx security scanning
- Updated package.json with required scripts and dependencies
- Added Azure Static Web Apps configuration"

# Push to trigger the pipeline
git push origin main
```

## 🔍 **File Structure After Integration**

Your frontend repository will have this structure:

```
your-frontend-app/
├── .github/
│   ├── workflows/
│   │   └── intermediate-ci-cd.yml          # Main CI/CD workflow
│   └── actions/
│       ├── sonar-analysis/
│       │   └── action.yml                  # SonarCloud composite action
│       └── checkmarx-scan/
│           └── action.yml                  # Checkmarx composite action
├── public/
│   ├── index.html
│   └── staticwebapp.config.json           # Azure config (created by script)
├── src/
│   └── ... (your existing app code)
├── .env                                    # Development environment
├── .env.production                         # Production environment  
├── package.json                            # Updated with pipeline scripts
├── sonar-project.properties               # SonarCloud configuration
├── setup-frontend-pipeline.sh             # Setup script (can delete after use)
└── PIPELINE_SETUP.md                      # Generated checklist
```

## 🔧 **What Gets Added to Your package.json**

The script will add these scripts to your existing `package.json`:

```json
{
  "scripts": {
    "test:coverage": "react-scripts test --coverage --ci --passWithNoTests",
    "lint": "eslint src/ --ext .js,.jsx,.ts,.tsx",
    "lint:fix": "eslint src/ --ext .js,.jsx,.ts,.tsx --fix", 
    "sonar": "sonar-scanner"
  },
  "devDependencies": {
    "sonarqube-scanner": "^3.0.1",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^14.4.3",
    "eslint": "^8.45.0"
  },
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{js,jsx,ts,tsx}",
      "!src/index.js",
      "!src/serviceWorker.js"
    ],
    "coverageReporters": ["lcov", "text", "html"],
    "coverageDirectory": "coverage"
  }
}
```

## 🎯 **Pipeline Behavior After Integration**

Once set up, your pipeline will automatically:

### **Development/Feature Branches:**
- ✅ Run tests with coverage
- ✅ Perform SonarCloud analysis  
- ✅ Run Checkmarx security scan
- ✅ Deploy to development environment

### **Main Branch:**
- ✅ All quality checks
- ✅ Deploy to development + staging

### **Release Tags (v1.0.0):**
- ✅ All quality checks
- ✅ Deploy to production with approval gates

### **Pre-release Tags (v1.0.0-rc.1):**
- ✅ All quality checks
- ✅ Deploy to pre-production

## 🚨 **Common Issues & Solutions**

### **Issue: Pipeline fails on first run**
**Solution:** Make sure all secrets are set correctly in your repository settings.

### **Issue: SonarCloud scan fails**
**Solution:** 
1. Check `SONAR_TOKEN` is valid
2. Update `sonar-project.properties` with correct project key
3. Ensure your SonarCloud project exists

### **Issue: Tests fail**
**Solution:** The script adds `--passWithNoTests` flag, but if you have failing tests, fix them or temporarily disable the test step.

### **Issue: Build fails**
**Solution:** Ensure your `npm run build` command works locally before pushing.

## 🎉 **Success Indicators**

You'll know the integration worked when:

1. ✅ GitHub Actions tab shows the workflow running
2. ✅ SonarCloud shows analysis results
3. ✅ Azure Static Web Apps shows successful deployment
4. ✅ Quality gates pass/fail based on your thresholds

## 🆘 **Need Help?**

If you run into issues:

1. **Check the setup script output** - it will tell you what failed
2. **Look at the generated `PIPELINE_SETUP.md`** - it has a checklist
3. **Check GitHub Actions logs** - they show detailed error messages
4. **Verify all secrets are set** in repository settings

## 📞 **Quick Start Commands**

Here's the complete quick start for your frontend repository:

```bash
# 1. Copy pipeline files
mkdir -p .github/workflows .github/actions
curl -o .github/workflows/intermediate-ci-cd.yml https://raw.githubusercontent.com/abhiksd/azure-static-webapp-ci/main/.github/workflows/intermediate-ci-cd.yml
curl -o .github/actions/sonar-analysis/action.yml --create-dirs https://raw.githubusercontent.com/abhiksd/azure-static-webapp-ci/main/.github/actions/sonar-analysis/action.yml
curl -o .github/actions/checkmarx-scan/action.yml --create-dirs https://raw.githubusercontent.com/abhiksd/azure-static-webapp-ci/main/.github/actions/checkmarx-scan/action.yml

# 2. Run setup script
curl -o setup-frontend-pipeline.sh https://raw.githubusercontent.com/abhiksd/azure-static-webapp-ci/main/setup-frontend-pipeline.sh
chmod +x setup-frontend-pipeline.sh
./setup-frontend-pipeline.sh

# 3. Update sonar-project.properties with your details
# 4. Set up GitHub secrets and variables
# 5. Push and enjoy automated CI/CD!
```

**That's it! Your frontend app now has production-grade CI/CD! 🚀**
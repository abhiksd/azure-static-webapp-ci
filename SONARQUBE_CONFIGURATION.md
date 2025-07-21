# SonarQube Server Configuration Guide

## Custom SonarQube Server Setup

The SonarCloud Analysis composite action now supports **custom SonarQube server URLs**, allowing you to use your own enterprise SonarQube instance instead of the default SonarCloud.io.

## Configuration Options

### 1. Using Repository Variables (Recommended)

Set up your SonarQube server URL using GitHub repository variables:

```bash
# In your GitHub repository settings > Secrets and variables > Actions > Variables
SONAR_HOST_URL = "https://sonarqube-dces.schneider-electric.com"
SONAR_ORGANIZATION = "your-organization"
```

### 2. Using Environment Variables in Workflow

You can also set the URL directly in your workflow:

```yaml
env:
  SONAR_HOST_URL: "https://your-sonarqube-server.com"
```

### 3. Default Behavior

If no custom URL is provided, the action defaults to `https://sonarcloud.io`.

## Updated Workflow Usage

```yaml
- name: SonarCloud Analysis
  id: sonar-analysis
  uses: ./.github/actions/sonar-analysis
  with:
    enabled: ${{ env.ENABLE_SONAR }}
    sonar-token: ${{ secrets.SONAR_TOKEN }}
    github-token: ${{ secrets.GITHUB_TOKEN }}
    organization: ${{ vars.SONAR_ORGANIZATION }}
    sonar-host-url: ${{ env.SONAR_HOST_URL }}  # 🆕 Now parameterized!
    min-code-coverage: ${{ env.MIN_CODE_COVERAGE }}
    max-blocker-issues: ${{ vars.MAX_BLOCKER_ISSUES || '0' }}
    max-critical-issues: ${{ vars.MAX_CRITICAL_ISSUES || '0' }}
```

## Example Configurations

### Enterprise SonarQube Server
```yaml
env:
  SONAR_HOST_URL: "https://sonarqube-dces.schneider-electric.com"
```

### Local Development SonarQube
```yaml
env:
  SONAR_HOST_URL: "http://localhost:9000"
```

### SonarCloud (Default)
```yaml
env:
  SONAR_HOST_URL: "https://sonarcloud.io"
```

## Repository Setup

### Required Secrets
- `SONAR_TOKEN`: Authentication token for your SonarQube server
- `GITHUB_TOKEN`: Automatically provided by GitHub Actions

### Required Variables
- `SONAR_ORGANIZATION`: Your SonarQube organization/group name
- `SONAR_HOST_URL`: Your custom SonarQube server URL (optional)

### Optional Variables
- `MAX_BLOCKER_ISSUES`: Maximum blocker issues allowed (default: 0)
- `MAX_CRITICAL_ISSUES`: Maximum critical issues allowed (default: 0)
- `MIN_CODE_COVERAGE`: Minimum code coverage percentage (default: 80)

## API Compatibility

The action uses standard SonarQube REST API endpoints:
- `/api/qualitygates/project_status` - Quality gate status
- `/api/measures/component` - Code metrics

These endpoints are available in both SonarCloud and enterprise SonarQube instances.

## Authentication

### SonarCloud
- Use your SonarCloud user token or organization token

### Enterprise SonarQube
- Use a user token generated from your SonarQube instance
- Go to: User Menu > My Account > Security > Generate Token

## Example: Complete Setup

```yaml
# .github/workflows/intermediate-ci-cd.yml
env:
  # SonarQube/SonarCloud configuration
  SONAR_HOST_URL: ${{ vars.SONAR_HOST_URL || 'https://sonarcloud.io' }}
  
jobs:
  quality-checks:
    steps:
      - name: SonarCloud Analysis
        uses: ./.github/actions/sonar-analysis
        with:
          enabled: true
          sonar-token: ${{ secrets.SONAR_TOKEN }}
          github-token: ${{ secrets.GITHUB_TOKEN }}
          organization: ${{ vars.SONAR_ORGANIZATION }}
          sonar-host-url: ${{ env.SONAR_HOST_URL }}
          min-code-coverage: '80'
          max-blocker-issues: '0'
          max-critical-issues: '0'
```

## Migration from Hardcoded URLs

If you were using the previous version with hardcoded URLs, simply:

1. Set the `SONAR_HOST_URL` repository variable
2. The workflow will automatically use your custom server
3. No other changes needed - all existing functionality preserved

## Troubleshooting

### Connection Issues
- Verify your SonarQube server is accessible from GitHub Actions runners
- Check if your server requires VPN or special network access
- Ensure the URL includes the protocol (`https://` or `http://`)

### Authentication Errors
- Verify your `SONAR_TOKEN` is valid for your SonarQube server
- Check token permissions include project analysis and quality gate access

### API Errors
- Ensure your SonarQube version supports the REST API endpoints
- Check project key format matches your SonarQube requirements
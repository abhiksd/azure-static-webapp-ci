# Checkmarx Authentication Error Troubleshooting

## Error You're Seeing:
```
Creating directory
Error: Error validating scan types: Failed to authenticate - please provide tenant
Error validating scan types: Failed to authenticate - please provide tenant
PR decoration not created.
Scan failed
```

## Root Cause:
The Checkmarx AST action is failing to authenticate because one or more required authentication parameters are missing or incorrect.

## Required GitHub Secrets:

You need to set these **Repository Secrets** (not Variables):

### 1. Go to Repository Settings → Secrets and variables → Actions → Secrets

Set these **4 required secrets**:

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `CHECKMARX_CLIENT_ID` | Your Checkmarx AST Client ID | `your-client-id-guid` |
| `CHECKMARX_SECRET` | Your Checkmarx AST Client Secret | `your-client-secret` |
| `CHECKMARX_TENANT` | Your Checkmarx tenant name | `your-company-name` |
| `CHECKMARX_BASE_URI` | Your Checkmarx AST base URI (optional) | `https://ast.checkmarx.net` |

## How to Get Checkmarx Credentials:

### Step 1: Access Checkmarx AST Portal
1. Log into your Checkmarx AST portal
2. Go to **Settings** → **API Keys** or **Access Management**

### Step 2: Create API Key/Client
1. Click **Create New API Key** or **Create Client**
2. Set appropriate permissions for scanning
3. Copy the **Client ID** and **Client Secret**

### Step 3: Find Your Tenant
- Your tenant is usually your organization/company name in Checkmarx
- It's visible in your Checkmarx AST URL or portal

## Repository Variables (Optional):

You can also set these **Repository Variables** for customization:

| Variable Name | Description | Default |
|---------------|-------------|---------|
| `CHECKMARX_SCAN_TYPES` | Scan types to run | `sast,sca` |
| `CHECKMARX_PRESET` | SAST scan preset | `Checkmarx Default` |
| `MAX_CRITICAL_VULNERABILITIES` | Max critical vulns allowed | `0` |
| `MAX_HIGH_VULNERABILITIES` | Max high vulns allowed | `2` |

## Quick Fix Steps:

### Step 1: Set Required Secrets
```bash
# In GitHub: Repository → Settings → Secrets and variables → Actions → Secrets
CHECKMARX_CLIENT_ID = "your-actual-client-id"
CHECKMARX_SECRET = "your-actual-client-secret"  
CHECKMARX_TENANT = "your-tenant-name"
```

### Step 2: Verify Authentication
Run your workflow again and look for:
```
✓ Successfully authenticated with Checkmarx AST
✓ Project created/updated: your-repo-name
✓ Scan types validated: sast,sca
```

Instead of:
```
✗ Error validating scan types: Failed to authenticate - please provide tenant
```

## Alternative: Disable Checkmarx Temporarily

If you want to disable Checkmarx scanning temporarily:

**Set Repository Variable:**
```bash
ENABLE_CHECKMARX_SCAN = "false"
```

Or use workflow dispatch input:
```bash
# When running workflow manually, set:
enable_checkmarx = false
```

## Common Issues:

### 1. Wrong Tenant Name
- **Error**: `Failed to authenticate - please provide tenant`
- **Fix**: Verify tenant name in Checkmarx portal URL or settings

### 2. Invalid Client Credentials
- **Error**: `401 Unauthorized` or authentication failed
- **Fix**: Regenerate API key/client credentials in Checkmarx portal

### 3. Missing Permissions
- **Error**: `403 Forbidden` or permission denied
- **Fix**: Ensure API key has scanning permissions in Checkmarx

### 4. Wrong Base URI
- **Error**: Connection timeout or server not found
- **Fix**: Verify your Checkmarx AST server URL

## Debugging Tips:

### Check Secret Values
Add this debug step temporarily to verify secrets are set:
```yaml
- name: Debug Checkmarx Config
  run: |
    echo "CHECKMARX_CLIENT_ID: ${CHECKMARX_CLIENT_ID:0:8}..." 
    echo "CHECKMARX_SECRET: ${CHECKMARX_SECRET:0:8}..."
    echo "CHECKMARX_TENANT: $CHECKMARX_TENANT"
    echo "CHECKMARX_BASE_URI: $CHECKMARX_BASE_URI"
  env:
    CHECKMARX_CLIENT_ID: ${{ secrets.CHECKMARX_CLIENT_ID }}
    CHECKMARX_SECRET: ${{ secrets.CHECKMARX_SECRET }}
    CHECKMARX_TENANT: ${{ secrets.CHECKMARX_TENANT }}
    CHECKMARX_BASE_URI: ${{ secrets.CHECKMARX_BASE_URI }}
```

### Test Authentication Manually
```bash
# Test Checkmarx authentication
curl -X POST "https://ast.checkmarx.net/auth/realms/YOUR_TENANT/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=YOUR_CLIENT_ID&client_secret=YOUR_CLIENT_SECRET"
```

## Expected Success Output:

When working correctly:
```
Setting up Checkmarx AST scan...
Authenticating with tenant: your-tenant-name
✓ Authentication successful
✓ Project setup: your-repo-name
✓ Scan types: sast,sca
Running security scan...
✓ Scan completed successfully
Processing results...
Checkmarx: PASSED | Vulnerabilities: 0 critical, 2 high
```

## Next Steps:

1. **Set the 4 required secrets** in GitHub repository settings
2. **Run your workflow again** to test authentication
3. **Check the logs** for successful authentication messages
4. **If still failing**, verify credentials in Checkmarx portal

The authentication error should be resolved once you provide the correct Checkmarx credentials! 🔐
# SSL Certificate Error Troubleshooting

## Error You're Seeing:
```
Error: Bootstrapper: Failed to fetch server version: Error: self-signed certificate in certificate chain
Error: Bootstrapper: Verify that https://sonarqube-dces.schneider-electric.com is a valid SonarQube server
```

## Root Cause:
Your SonarQube server `https://sonarqube-dces.schneider-electric.com` is using a self-signed SSL certificate, which Node.js (used by sonar-scanner) rejects by default for security reasons.

## Solution Steps:

### Step 1: Set Repository Variable
You need to set the `SONAR_SKIP_SSL_VERIFICATION` repository variable to `"true"`.

**Navigate to your GitHub repository:**
1. Go to your repository on GitHub
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click the **Variables** tab (not Secrets)
5. Click **New repository variable**
6. Set:
   - **Name**: `SONAR_SKIP_SSL_VERIFICATION`
   - **Value**: `true`
7. Click **Add variable**

### Step 2: Verify Your Current Variables
Make sure you have these repository variables set:

| Variable Name | Value |
|---------------|-------|
| `SONAR_HOST_URL` | `https://sonarqube-dces.schneider-electric.com` |
| `SONAR_SKIP_SSL_VERIFICATION` | `true` |
| `SONAR_ORGANIZATION` | `your-organization-name` |

### Step 3: Verify Your Secrets
Make sure you have this repository secret set:

| Secret Name | Value |
|-------------|-------|
| `SONAR_TOKEN` | `your-sonar-authentication-token` |

### Step 4: Test the Fix
1. Trigger your workflow again (push a commit or run manually)
2. Look for these log messages in the SonarCloud Analysis step:
   ```
   Warning: SSL certificate verification disabled
   [INFO] Bootstrapper: Server URL: https://sonarqube-dces.schneider-electric.com
   [INFO] Bootstrapper: Version: 4.3.0
   ```

## Debugging: Check if SSL Skip is Working

If you're still getting the error, add this temporary debug step to your workflow to verify the variable is being passed correctly:

```yaml
- name: Debug SSL Configuration
  run: |
    echo "SONAR_HOST_URL: ${{ env.SONAR_HOST_URL }}"
    echo "SONAR_SKIP_SSL_VERIFICATION: ${{ env.SONAR_SKIP_SSL_VERIFICATION }}"
    echo "Skip SSL input: ${{ env.SONAR_SKIP_SSL_VERIFICATION }}"
```

## Alternative Solutions:

### Option 1: Use HTTP (if available)
If your SonarQube server supports HTTP, you can use:
```
SONAR_HOST_URL = "http://sonarqube-dces.schneider-electric.com"
```

### Option 2: Install Proper SSL Certificate (Recommended)
Ask your infrastructure team to install a proper SSL certificate from a trusted CA on the SonarQube server.

## Common Mistakes:

1. **Setting as Secret instead of Variable**: `SONAR_SKIP_SSL_VERIFICATION` should be a **Variable**, not a **Secret**
2. **Wrong value**: Make sure the value is exactly `true` (lowercase)
3. **Typo in variable name**: Make sure it's exactly `SONAR_SKIP_SSL_VERIFICATION`

## Verification Commands:

You can test SSL connectivity manually:

```bash
# Test SSL connection (should fail)
curl https://sonarqube-dces.schneider-electric.com/api/system/status

# Test with SSL verification disabled (should work)
curl -k https://sonarqube-dces.schneider-electric.com/api/system/status
```

## Expected Workflow Output:

When working correctly, you should see:
```
Warning: SSL certificate verification disabled
[INFO] Bootstrapper: Server URL: https://sonarqube-dces.schneider-electric.com
[INFO] Bootstrapper: Version: 4.3.0
[INFO] Starting analysis...
```

Instead of:
```
Error: self-signed certificate in certificate chain
```

## Still Having Issues?

If the error persists after setting the variable:

1. **Double-check the variable name and value**
2. **Make sure you're setting it as a Variable, not a Secret**
3. **Try running the workflow again** (sometimes takes one run to pick up new variables)
4. **Check the debug output** to ensure the variable is being passed correctly

## Security Note:
The SSL verification bypass (`NODE_TLS_REJECT_UNAUTHORIZED=0`) only affects the SonarQube scanner connection and is only enabled when you explicitly set the variable to `true`. This is safe for trusted internal servers but should not be used for external services.
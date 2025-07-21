# Certificate Setup Guide for Ubuntu Runners

## Overview

This guide shows you how to properly import SSL certificates for your enterprise SonarQube server instead of bypassing SSL verification. This is the **secure and recommended approach** for production environments.

## Method 1: Auto-Import Server Certificate (Recommended)

The action will automatically extract and import your SonarQube server's certificate.

### Setup:
```bash
# Repository Variables (remove SSL skip if you had it set)
SONAR_HOST_URL = "https://sonarqube-dces.schneider-electric.com"
SONAR_ORGANIZATION = "your-organization"

# Remove this if you had it:
# SONAR_SKIP_SSL_VERIFICATION = "false"  # or delete this variable
```

### How it works:
1. The action extracts the certificate from your SonarQube server using `openssl s_client`
2. Adds it to Ubuntu's system certificate store (`/usr/local/share/ca-certificates/`)
3. Updates the CA certificates with `update-ca-certificates`
4. Sets `NODE_EXTRA_CA_CERTS` for Node.js (sonar-scanner)
5. Creates a custom CA bundle for curl (API calls)

### Expected output:
```
Attempting to auto-import server certificate...
Extracting certificate from: sonarqube-dces.schneider-electric.com
Server certificate extracted successfully
Certificate validation passed
Auto-imported server certificate successfully
Using custom CA certificate: /tmp/server-cert.crt
```

## Method 2: Manual Certificate Import (Most Secure)

If you have access to your SonarQube server's CA certificate, this is the most secure method.

### Step 1: Get Your CA Certificate

From your Ubuntu VM or SonarQube server:
```bash
# Option A: Export from Ubuntu VM certificate store
sudo cp /usr/local/share/ca-certificates/your-ca-cert.crt /tmp/
cat /tmp/your-ca-cert.crt | base64 -w 0

# Option B: Extract from SonarQube server
echo -n | openssl s_client -connect sonarqube-dces.schneider-electric.com:443 -showcerts | \
  sed -n '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/p' | \
  base64 -w 0

# Option C: Get the CA certificate (if you know the issuer)
echo -n | openssl s_client -connect sonarqube-dces.schneider-electric.com:443 -showcerts 2>/dev/null | \
  awk '/-----BEGIN CERTIFICATE-----/{p=1} p{print} /-----END CERTIFICATE-----/{if(++c==1) p=0}' | \
  base64 -w 0
```

### Step 2: Add Certificate to GitHub Secrets

1. Go to GitHub Repository → Settings → Secrets and variables → Actions
2. Click **Secrets** tab
3. Click **New repository secret**
4. Set:
   - **Name**: `SONAR_CUSTOM_CA_CERT`
   - **Value**: `[paste the base64 encoded certificate from step 1]`

### Step 3: Repository Variables Setup
```bash
# Repository Variables
SONAR_HOST_URL = "https://sonarqube-dces.schneider-electric.com"
SONAR_ORGANIZATION = "your-organization"

# Make sure SSL skip is disabled (or remove the variable)
SONAR_SKIP_SSL_VERIFICATION = "false"
```

### Expected output:
```
Setting up custom CA certificate for enterprise SonarQube server...
Certificate format validated successfully
Custom CA certificate imported successfully
Using custom CA certificate: /tmp/sonar-ca-cert.crt
```

## Method 3: Extract Certificate Manually

If the auto-import doesn't work, you can manually extract and provide the certificate.

### From your Ubuntu VM:
```bash
# Connect to your SonarQube server and save certificate
echo -n | openssl s_client -connect sonarqube-dces.schneider-electric.com:443 -servername sonarqube-dces.schneider-electric.com 2>/dev/null | \
  openssl x509 -out sonarqube-cert.crt

# Verify the certificate
openssl x509 -in sonarqube-cert.crt -text -noout

# Convert to base64 for GitHub secret
cat sonarqube-cert.crt | base64 -w 0
```

Then follow Step 2 and Step 3 from Method 2.

## Method 4: Get Certificate Chain

For certificates signed by intermediate CAs:

```bash
# Get the full certificate chain
echo -n | openssl s_client -connect sonarqube-dces.schneider-electric.com:443 -showcerts 2>/dev/null | \
  sed -n '/-----BEGIN CERTIFICATE-----/,/-----END CERTIFICATE-----/p' > sonarqube-chain.crt

# Verify the chain
openssl verify -CAfile sonarqube-chain.crt sonarqube-chain.crt

# Convert to base64
cat sonarqube-chain.crt | base64 -w 0
```

## Troubleshooting

### Certificate Extraction Issues
```bash
# Test certificate extraction manually
openssl s_client -connect sonarqube-dces.schneider-electric.com:443 -servername sonarqube-dces.schneider-electric.com

# Check if the server is accessible
curl -v https://sonarqube-dces.schneider-electric.com/api/system/status

# Test with specific cipher suites
openssl s_client -connect sonarqube-dces.schneider-electric.com:443 -cipher HIGH
```

### Verification Commands
```bash
# Check certificate details
openssl x509 -in certificate.crt -text -noout

# Verify certificate chain
openssl verify -CAfile ca-cert.crt server-cert.crt

# Test Node.js certificate loading
node -e "
process.env.NODE_EXTRA_CA_CERTS = './certificate.crt';
const https = require('https');
https.get('https://sonarqube-dces.schneider-electric.com/api/system/status', (res) => {
  console.log('Certificate working:', res.statusCode);
}).on('error', (err) => {
  console.log('Certificate error:', err.message);
});
"
```

## Priority Order

The action will try methods in this order:
1. **Custom CA Certificate** (if `SONAR_CUSTOM_CA_CERT` secret is provided)
2. **Auto-Import Server Certificate** (if no custom cert and SSL skip is false)
3. **SSL Verification Bypass** (fallback if certificate import fails or if `SONAR_SKIP_SSL_VERIFICATION=true`)

## Security Benefits

✅ **Proper Certificate Validation**: Maintains SSL security
✅ **Man-in-the-Middle Protection**: Prevents certificate spoofing
✅ **Audit Compliance**: Meets enterprise security requirements
✅ **Future-Proof**: Works when certificates are renewed

## Migration from SSL Skip

If you're currently using `SONAR_SKIP_SSL_VERIFICATION=true`:

1. **Remove or set to false**: `SONAR_SKIP_SSL_VERIFICATION = "false"`
2. **Try auto-import first**: Just run the workflow, it should auto-import
3. **If auto-import fails**: Use manual certificate import (Method 2)

## Expected Workflow Output

### Successful Certificate Import:
```
Auto-imported server certificate successfully
Using custom CA certificate: /tmp/server-cert.crt
[INFO] Bootstrapper: Server URL: https://sonarqube-dces.schneider-electric.com
[INFO] Bootstrapper: Version: 4.3.0
[INFO] Starting analysis...
```

### Fallback to SSL Skip:
```
Warning: Could not extract server certificate, falling back to SSL skip
Warning: SSL certificate verification disabled (manual bypass)
```

This approach is much more secure than bypassing SSL verification entirely! 🔒
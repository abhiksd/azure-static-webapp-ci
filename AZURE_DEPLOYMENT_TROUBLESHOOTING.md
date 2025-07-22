# Azure Static Web Apps Deployment - Permission Issues Fix

## Issue: Docker Permission Conflicts

### Problem:
The Azure Static Web Apps deploy action runs in Docker as **root user**, creating files owned by `root:root`. This causes permission errors in subsequent workflow runs when the GitHub runner (running as a regular user) tries to access or modify these files.

### Common Error Messages:
```bash
Error: EACCES: permission denied, unlink '/github/workspace/.azure/config'
Error: EACCES: permission denied, rmdir '/github/workspace/build'
Permission denied: cannot remove 'oryx-manifest.toml'
```

## Solution Implemented

### 1. Pre-deployment Cleanup
Removes root-owned files before deployment to prevent conflicts:
```yaml
- name: Pre-deployment Cleanup
  run: |
    sudo rm -rf .azure deployment-*.json oryx-manifest.toml
    sudo chown -R $USER:$USER .
    chmod -R u+rwX .
```

### 2. Post-deployment Permission Fix
Immediately fixes permissions after Azure action completes:
```yaml
- name: Fix File Permissions
  if: always()
  run: |
    sudo chown -R $USER:$USER .
    chmod -R u+rwX .
    # Fix build directory specifically
    sudo chown -R $USER:$USER build/
```

### 3. Final Cleanup
Ensures workspace is clean for next workflow run:
```yaml
- name: Final Cleanup
  if: always()
  run: |
    sudo chown -R $USER:$USER .
    sudo rm -rf .azure oryx-manifest.toml
```

## Key Features

- **Always runs**: Uses `if: always()` to execute even if deployment fails
- **Error suppression**: Uses `2>/dev/null || true` to prevent cleanup failures
- **Comprehensive**: Handles all Docker-created files and directories
- **Safe**: Preserves important files while fixing permissions

## Files Typically Affected
- `.azure/` - Azure CLI configuration
- `oryx-manifest.toml` - Build manifest
- `build/` - Output directory (if recreated)
- Hidden directories created by Docker

## Manual Troubleshooting

If you still see permission errors:

```bash
# Check file ownership
ls -la
find . -user root

# Manual fix
sudo chown -R $USER:$USER .
chmod -R u+rwX .
sudo rm -rf .azure oryx-manifest.toml
```

This fix ensures reliable Azure Static Web Apps deployments without Docker permission conflicts! 🔧
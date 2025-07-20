# 📚 Operations Runbook

This operations runbook provides step-by-step procedures for day-to-day operations, maintenance tasks, and common operational scenarios for Azure Static Web Apps.

## 📋 Table of Contents

1. [Daily Operations](#daily-operations)
2. [Weekly Maintenance](#weekly-maintenance)
3. [Monthly Tasks](#monthly-tasks)
4. [Emergency Procedures](#emergency-procedures)
5. [Performance Optimization](#performance-optimization)
6. [Backup & Recovery](#backup--recovery)
7. [Cost Management](#cost-management)
8. [Team Handoff Procedures](#team-handoff-procedures)

## 📅 Daily Operations

### Morning Health Check

```bash
#!/bin/bash
# scripts/daily-health-check.sh

echo "🌅 Starting daily health check - $(date)"

ENVIRONMENTS=("dev" "staging" "preprod" "prod")
PROJECT_NAME="myapp"
REPORT_FILE="daily-health-$(date +%Y%m%d).txt"

echo "Daily Health Check Report - $(date)" > "$REPORT_FILE"
echo "=========================================" >> "$REPORT_FILE"

for env in "${ENVIRONMENTS[@]}"; do
    echo "🔍 Checking $env environment..."
    echo "" >> "$REPORT_FILE"
    echo "[$env Environment]" >> "$REPORT_FILE"
    
    # Check Static Web App status
    SWA_NAME="${PROJECT_NAME}-swa-${env}-eastus2"
    RG_NAME="${PROJECT_NAME}-rg-${env}-eastus2"
    
    DEFAULT_DOMAIN=$(az staticwebapp show \
        --name "$SWA_NAME" \
        --resource-group "$RG_NAME" \
        --query "defaultHostname" \
        --output tsv 2>/dev/null)
    
    if [ -n "$DEFAULT_DOMAIN" ]; then
        echo "✅ Static Web App: Online ($DEFAULT_DOMAIN)" >> "$REPORT_FILE"
        
        # Check HTTP response
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEFAULT_DOMAIN" 2>/dev/null)
        if [ "$HTTP_STATUS" = "200" ]; then
            echo "✅ HTTP Status: $HTTP_STATUS" >> "$REPORT_FILE"
        else
            echo "❌ HTTP Status: $HTTP_STATUS" >> "$REPORT_FILE"
        fi
        
        # Check response time
        RESPONSE_TIME=$(curl -w "%{time_total}" -s -o /dev/null "https://$DEFAULT_DOMAIN" 2>/dev/null)
        echo "⏱️ Response Time: ${RESPONSE_TIME}s" >> "$REPORT_FILE"
        
        # Check health endpoint
        HEALTH_STATUS=$(curl -s "https://$DEFAULT_DOMAIN/api/health" 2>/dev/null | jq -r '.status' 2>/dev/null || echo "unavailable")
        echo "🏥 Health Status: $HEALTH_STATUS" >> "$REPORT_FILE"
    else
        echo "❌ Static Web App: Offline or not found" >> "$REPORT_FILE"
    fi
    
    # Check Key Vault status
    KV_NAME="${PROJECT_NAME}-kv-${env}-eastus2"
    KV_STATUS=$(az keyvault show --name "$KV_NAME" --query "properties.provisioningState" --output tsv 2>/dev/null || echo "error")
    echo "🔐 Key Vault: $KV_STATUS" >> "$REPORT_FILE"
    
    # Check Application Insights
    AI_NAME="${PROJECT_NAME}-ai-${env}-eastus2"
    AI_STATUS=$(az monitor app-insights component show --app "$AI_NAME" --resource-group "$RG_NAME" --query "provisioningState" --output tsv 2>/dev/null || echo "error")
    echo "📊 Application Insights: $AI_STATUS" >> "$REPORT_FILE"
done

echo "" >> "$REPORT_FILE"
echo "Report generated at: $(date)" >> "$REPORT_FILE"

# Send report if there are any issues
if grep -q "❌" "$REPORT_FILE"; then
    echo "⚠️ Issues detected in daily health check"
    # Send alert to team (implement your notification method)
    # slack-notify.sh "Daily health check found issues. See attached report." "$REPORT_FILE"
else
    echo "✅ All systems healthy"
fi

echo "📋 Report saved to: $REPORT_FILE"
```

### Monitor Dashboard Review

```bash
#!/bin/bash
# scripts/dashboard-review.sh

echo "📊 Daily dashboard review - $(date)"

ENVIRONMENTS=("prod" "preprod" "staging")

for env in "${ENVIRONMENTS[@]}"; do
    echo "🔍 Reviewing $env environment metrics..."
    
    AI_NAME="myapp-ai-${env}-eastus2"
    RG_NAME="myapp-rg-${env}-eastus2"
    
    # Get yesterday's metrics
    END_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    START_TIME=$(date -u -d "24 hours ago" +"%Y-%m-%dT%H:%M:%SZ")
    
    # Query request metrics
    echo "📈 Request metrics for $env:"
    az monitor app-insights query \
        --app "$AI_NAME" \
        --analytics-query "
            requests 
            | where timestamp between(datetime('$START_TIME') .. datetime('$END_TIME'))
            | summarize 
                TotalRequests = count(),
                SuccessfulRequests = countif(success == true),
                FailedRequests = countif(success == false),
                AvgDuration = avg(duration),
                MaxDuration = max(duration)
            | extend SuccessRate = (SuccessfulRequests * 100.0) / TotalRequests
        " \
        --output table
    
    # Query exceptions
    echo "🚨 Exception summary for $env:"
    az monitor app-insights query \
        --app "$AI_NAME" \
        --analytics-query "
            exceptions 
            | where timestamp between(datetime('$START_TIME') .. datetime('$END_TIME'))
            | summarize count() by type 
            | order by count_ desc
            | limit 5
        " \
        --output table
        
    echo "---"
done
```

## 📅 Weekly Maintenance

### Weekly Maintenance Checklist

```bash
#!/bin/bash
# scripts/weekly-maintenance.sh

echo "🔧 Weekly maintenance tasks - $(date)"

MAINTENANCE_LOG="weekly-maintenance-$(date +%Y%m%d).log"
echo "Weekly Maintenance Log - $(date)" > "$MAINTENANCE_LOG"

# 1. Update dependencies check
echo "📦 Checking for dependency updates..."
echo "[Dependency Updates]" >> "$MAINTENANCE_LOG"

if command -v npm-check-updates &> /dev/null; then
    npm-check-updates >> "$MAINTENANCE_LOG" 2>&1
    echo "✅ Dependency check completed" >> "$MAINTENANCE_LOG"
else
    echo "⚠️ npm-check-updates not installed" >> "$MAINTENANCE_LOG"
fi

# 2. Security vulnerability scan
echo "🔒 Running security vulnerability scan..."
echo "[Security Scan]" >> "$MAINTENANCE_LOG"

npm audit >> "$MAINTENANCE_LOG" 2>&1
echo "✅ Security scan completed" >> "$MAINTENANCE_LOG"

# 3. Performance metrics review
echo "⚡ Reviewing performance metrics..."
echo "[Performance Review]" >> "$MAINTENANCE_LOG"

for env in prod preprod; do
    echo "Performance metrics for $env:" >> "$MAINTENANCE_LOG"
    
    # Get Lighthouse scores if available
    if [ -f "lighthouse-$env-latest.json" ]; then
        PERFORMANCE_SCORE=$(jq '.lhr.categories.performance.score * 100' "lighthouse-$env-latest.json")
        echo "Lighthouse Performance Score: $PERFORMANCE_SCORE" >> "$MAINTENANCE_LOG"
    fi
done

# 4. Backup verification
echo "💾 Verifying backups..."
echo "[Backup Verification]" >> "$MAINTENANCE_LOG"

./scripts/verify-backups.sh >> "$MAINTENANCE_LOG" 2>&1

# 5. Certificate expiry check
echo "🔐 Checking certificate expiry..."
echo "[Certificate Check]" >> "$MAINTENANCE_LOG"

DOMAINS=("yourdomain.com" "staging.yourdomain.com" "preprod.yourdomain.com")

for domain in "${DOMAINS[@]}"; do
    EXPIRY_DATE=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep "notAfter" | cut -d= -f2)
    
    if [ -n "$EXPIRY_DATE" ]; then
        EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
        CURRENT_EPOCH=$(date +%s)
        DAYS_UNTIL_EXPIRY=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
        
        echo "$domain: $DAYS_UNTIL_EXPIRY days until expiry" >> "$MAINTENANCE_LOG"
        
        if [ "$DAYS_UNTIL_EXPIRY" -lt 30 ]; then
            echo "⚠️ Certificate for $domain expires in $DAYS_UNTIL_EXPIRY days!" >> "$MAINTENANCE_LOG"
        fi
    fi
done

# 6. Resource utilization review
echo "📊 Reviewing resource utilization..."
echo "[Resource Utilization]" >> "$MAINTENANCE_LOG"

for env in prod preprod staging dev; do
    RG_NAME="myapp-rg-${env}-eastus2"
    
    echo "Resource group: $RG_NAME" >> "$MAINTENANCE_LOG"
    az resource list --resource-group "$RG_NAME" --output table >> "$MAINTENANCE_LOG" 2>&1
done

echo "✅ Weekly maintenance completed. Check $MAINTENANCE_LOG for details."
```

### Performance Optimization Review

```bash
#!/bin/bash
# scripts/performance-review.sh

echo "⚡ Weekly performance optimization review"

ENVIRONMENTS=("prod" "preprod")

for env in "${ENVIRONMENTS[@]}"; do
    echo "🔍 Analyzing $env environment performance..."
    
    # Run Lighthouse audit
    if [ "$env" = "prod" ]; then
        URL="https://yourdomain.com"
    else
        URL="https://$env.yourdomain.com"
    fi
    
    OUTPUT_FILE="lighthouse-$env-$(date +%Y%m%d).json"
    
    echo "🔍 Running Lighthouse audit for $URL..."
    lighthouse "$URL" \
        --output=json \
        --output-path="$OUTPUT_FILE" \
        --chrome-flags="--headless --no-sandbox" \
        --quiet
    
    if [ -f "$OUTPUT_FILE" ]; then
        PERFORMANCE=$(jq '.lhr.categories.performance.score * 100' "$OUTPUT_FILE")
        ACCESSIBILITY=$(jq '.lhr.categories.accessibility.score * 100' "$OUTPUT_FILE")
        BEST_PRACTICES=$(jq '.lhr.categories["best-practices"].score * 100' "$OUTPUT_FILE")
        SEO=$(jq '.lhr.categories.seo.score * 100' "$OUTPUT_FILE")
        
        echo "📊 $env Performance Scores:"
        echo "  Performance: $PERFORMANCE"
        echo "  Accessibility: $ACCESSIBILITY"
        echo "  Best Practices: $BEST_PRACTICES"
        echo "  SEO: $SEO"
        
        # Alert if performance is below threshold
        if (( $(echo "$PERFORMANCE < 90" | bc -l) )); then
            echo "⚠️ Performance score below 90 for $env environment"
        fi
    fi
done
```

## 📅 Monthly Tasks

### Monthly Security Review

```bash
#!/bin/bash
# scripts/monthly-security-review.sh

echo "🔒 Monthly security review - $(date)"

SECURITY_REPORT="security-review-$(date +%Y%m).md"

cat > "$SECURITY_REPORT" << EOF
# Monthly Security Review - $(date +"%B %Y")

## Security Metrics

### Failed Login Attempts
EOF

# Query Application Insights for security events
for env in prod preprod; do
    AI_NAME="myapp-ai-${env}-eastus2"
    
    echo "### $env Environment" >> "$SECURITY_REPORT"
    
    # Get security events from last 30 days
    az monitor app-insights query \
        --app "$AI_NAME" \
        --analytics-query "
            customEvents
            | where name == 'SecurityEvent'
            | where timestamp > ago(30d)
            | summarize count() by tostring(customDimensions.type)
            | order by count_ desc
        " \
        --output table >> "$SECURITY_REPORT"
done

cat >> "$SECURITY_REPORT" << EOF

## Action Items

### Certificates Expiring Soon
EOF

# Check certificate expiry
DOMAINS=("yourdomain.com" "staging.yourdomain.com" "preprod.yourdomain.com")

for domain in "${DOMAINS[@]}"; do
    EXPIRY_DATE=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep "notAfter" | cut -d= -f2)
    
    if [ -n "$EXPIRY_DATE" ]; then
        EXPIRY_EPOCH=$(date -d "$EXPIRY_DATE" +%s)
        CURRENT_EPOCH=$(date +%s)
        DAYS_UNTIL_EXPIRY=$(( (EXPIRY_EPOCH - CURRENT_EPOCH) / 86400 ))
        
        if [ "$DAYS_UNTIL_EXPIRY" -lt 60 ]; then
            echo "- [ ] Renew certificate for $domain (expires in $DAYS_UNTIL_EXPIRY days)" >> "$SECURITY_REPORT"
        fi
    fi
done

cat >> "$SECURITY_REPORT" << EOF

### Recommended Actions

- [ ] Review and rotate API keys
- [ ] Update dependency versions
- [ ] Review access permissions
- [ ] Update security scanning rules
- [ ] Conduct penetration testing
- [ ] Review incident response procedures

## Compliance Status

- [ ] SOC 2 controls reviewed
- [ ] GDPR compliance verified
- [ ] Data retention policies enforced
- [ ] Access audit completed

EOF

echo "📋 Security review completed. Report saved to: $SECURITY_REPORT"
```

### Cost Optimization Review

```bash
#!/bin/bash
# scripts/cost-optimization.sh

echo "💰 Monthly cost optimization review - $(date)"

COST_REPORT="cost-optimization-$(date +%Y%m).txt"

echo "Cost Optimization Report - $(date)" > "$COST_REPORT"
echo "======================================" >> "$COST_REPORT"

# Get cost information for each resource group
ENVIRONMENTS=("dev" "staging" "preprod" "prod")

for env in "${ENVIRONMENTS[@]}"; do
    RG_NAME="myapp-rg-${env}-eastus2"
    
    echo "" >> "$COST_REPORT"
    echo "[$env Environment - $RG_NAME]" >> "$COST_REPORT"
    
    # List resources and their SKUs
    echo "Resources:" >> "$COST_REPORT"
    az resource list \
        --resource-group "$RG_NAME" \
        --query "[].{Name:name, Type:type, SKU:sku.name}" \
        --output table >> "$COST_REPORT" 2>/dev/null
    
    # Get cost data (requires cost management permissions)
    echo "Cost Analysis:" >> "$COST_REPORT"
    az consumption usage list \
        --start-date "$(date -d '30 days ago' +%Y-%m-%d)" \
        --end-date "$(date +%Y-%m-%d)" \
        --query "[?contains(instanceName, '$RG_NAME')].{Service:meterName, Cost:pretaxCost, Usage:usageQuantity}" \
        --output table >> "$COST_REPORT" 2>/dev/null || echo "Cost data not available" >> "$COST_REPORT"
done

echo "" >> "$COST_REPORT"
echo "Optimization Recommendations:" >> "$COST_REPORT"
echo "- Review unused resources in development environments" >> "$COST_REPORT"
echo "- Consider auto-shutdown for non-production environments" >> "$COST_REPORT"
echo "- Optimize Application Insights retention settings" >> "$COST_REPORT"
echo "- Review Key Vault transaction costs" >> "$COST_REPORT"

echo "💰 Cost review completed. Report saved to: $COST_REPORT"
```

## 🚨 Emergency Procedures

### Incident Response Playbook

```bash
#!/bin/bash
# scripts/incident-response.sh

INCIDENT_TYPE="$1"
SEVERITY="$2"

if [ -z "$INCIDENT_TYPE" ] || [ -z "$SEVERITY" ]; then
    echo "Usage: $0 <incident_type> <severity>"
    echo "Types: outage, security, performance, data"
    echo "Severity: 1-critical, 2-high, 3-medium, 4-low"
    exit 1
fi

INCIDENT_ID="INC-$(date +%Y%m%d-%H%M%S)"
INCIDENT_LOG="incident-$INCIDENT_ID.log"

echo "🚨 INCIDENT RESPONSE ACTIVATED" | tee "$INCIDENT_LOG"
echo "Incident ID: $INCIDENT_ID" | tee -a "$INCIDENT_LOG"
echo "Type: $INCIDENT_TYPE" | tee -a "$INCIDENT_LOG"
echo "Severity: $SEVERITY" | tee -a "$INCIDENT_LOG"
echo "Time: $(date)" | tee -a "$INCIDENT_LOG"
echo "========================================" | tee -a "$INCIDENT_LOG"

case "$SEVERITY" in
    "1")
        echo "🔴 CRITICAL INCIDENT - P1 Response" | tee -a "$INCIDENT_LOG"
        
        # Immediate actions for critical incidents
        case "$INCIDENT_TYPE" in
            "outage")
                echo "🔄 Initiating failover procedures..." | tee -a "$INCIDENT_LOG"
                ./scripts/emergency-failover.sh >> "$INCIDENT_LOG" 2>&1
                ;;
            "security")
                echo "🔒 Implementing security containment..." | tee -a "$INCIDENT_LOG"
                ./scripts/security-incident-response.sh critical "$INCIDENT_TYPE" >> "$INCIDENT_LOG" 2>&1
                ;;
        esac
        
        # Notify on-call team
        echo "📞 Alerting on-call team..." | tee -a "$INCIDENT_LOG"
        # Send critical alert
        ;;
    "2")
        echo "🟠 HIGH SEVERITY - P2 Response" | tee -a "$INCIDENT_LOG"
        # High severity procedures
        ;;
    "3"|"4")
        echo "🟡 STANDARD INCIDENT - P3/P4 Response" | tee -a "$INCIDENT_LOG"
        # Standard procedures
        ;;
esac

echo "✅ Initial incident response completed" | tee -a "$INCIDENT_LOG"
echo "📋 Continue with incident-$INCIDENT_ID.log for tracking" | tee -a "$INCIDENT_LOG"
```

### Emergency Rollback

```bash
#!/bin/bash
# scripts/emergency-rollback.sh

ENVIRONMENT="$1"
VERSION="$2"

if [ -z "$ENVIRONMENT" ]; then
    echo "🚨 Emergency Rollback"
    echo "Usage: $0 <environment> [version]"
    echo "Environments: staging, preprod, prod"
    exit 1
fi

echo "🔄 EMERGENCY ROLLBACK INITIATED"
echo "Environment: $ENVIRONMENT"
echo "Target Version: ${VERSION:-previous}"
echo "Time: $(date)"

ROLLBACK_LOG="emergency-rollback-$(date +%Y%m%d-%H%M%S).log"

{
    echo "Emergency Rollback Log"
    echo "====================="
    echo "Environment: $ENVIRONMENT"
    echo "Initiated: $(date)"
    echo "Operator: $(whoami)"
    
    # Get current deployment info
    echo ""
    echo "Current deployment status:"
    SWA_NAME="myapp-swa-${ENVIRONMENT}-eastus2"
    RG_NAME="myapp-rg-${ENVIRONMENT}-eastus2"
    
    az staticwebapp show \
        --name "$SWA_NAME" \
        --resource-group "$RG_NAME" \
        --query "{name:name, defaultHostname:defaultHostname}" \
        --output table
    
    # Trigger rollback via GitHub Actions
    echo ""
    echo "Triggering rollback deployment..."
    
    if [ -n "$VERSION" ]; then
        gh workflow run enhanced-ci-cd.yml \
            --ref "$VERSION" \
            -f environment="$ENVIRONMENT" \
            -f emergency_deployment=true \
            -f rollback=true
    else
        echo "⚠️ No specific version provided, manual intervention required"
        echo "Available options:"
        echo "1. Identify last known good version from git tags"
        echo "2. Use previous GitHub Actions deployment"
        echo "3. Manual infrastructure rollback"
    fi
    
    echo ""
    echo "Post-rollback verification:"
    echo "1. Check application health"
    echo "2. Verify key functionality"
    echo "3. Monitor error rates"
    echo "4. Communicate status to stakeholders"
    
} | tee "$ROLLBACK_LOG"

echo "📋 Rollback log saved to: $ROLLBACK_LOG"
```

## ⚡ Performance Optimization

### Automatic Performance Tuning

```bash
#!/bin/bash
# scripts/performance-optimization.sh

echo "⚡ Running performance optimization checks"

OPTIMIZATION_LOG="performance-optimization-$(date +%Y%m%d).log"

{
    echo "Performance Optimization Report"
    echo "=============================="
    echo "Date: $(date)"
    
    # Check bundle sizes
    echo ""
    echo "Bundle Size Analysis:"
    if [ -d "build/static/js" ]; then
        echo "JavaScript bundles:"
        ls -lah build/static/js/*.js | awk '{print $5 "\t" $9}'
        
        TOTAL_JS_SIZE=$(du -sh build/static/js/ | cut -f1)
        echo "Total JS size: $TOTAL_JS_SIZE"
        
        # Check if size exceeds thresholds
        TOTAL_BYTES=$(du -sb build/static/js/ | cut -f1)
        if [ "$TOTAL_BYTES" -gt 2097152 ]; then  # 2MB
            echo "⚠️ JavaScript bundle size exceeds 2MB threshold"
            echo "Recommendations:"
            echo "- Implement code splitting"
            echo "- Remove unused dependencies"
            echo "- Enable tree shaking"
        fi
    fi
    
    if [ -d "build/static/css" ]; then
        echo ""
        echo "CSS bundles:"
        ls -lah build/static/css/*.css | awk '{print $5 "\t" $9}'
        
        TOTAL_CSS_SIZE=$(du -sh build/static/css/ | cut -f1)
        echo "Total CSS size: $TOTAL_CSS_SIZE"
    fi
    
    # Analyze dependencies
    echo ""
    echo "Dependency Analysis:"
    if command -v npx &> /dev/null && command -v webpack-bundle-analyzer &> /dev/null; then
        echo "Generating bundle analysis..."
        npx webpack-bundle-analyzer build/static/js/*.js --report --mode static --output-path bundle-analysis.html
        echo "Bundle analysis saved to bundle-analysis.html"
    fi
    
    # Check for unused dependencies
    if command -v depcheck &> /dev/null; then
        echo ""
        echo "Unused dependencies:"
        npx depcheck --json | jq '.dependencies[]' 2>/dev/null || echo "No unused dependencies found"
    fi
    
    # Performance recommendations
    echo ""
    echo "Performance Recommendations:"
    
    # Check if service worker is implemented
    if [ ! -f "public/sw.js" ] && [ ! -f "src/serviceWorker.js" ]; then
        echo "- Consider implementing a service worker for caching"
    fi
    
    # Check if lazy loading is implemented
    if ! grep -r "React.lazy\|lazy(" src/ >/dev/null 2>&1; then
        echo "- Implement lazy loading for routes and components"
    fi
    
    # Check image optimization
    if find public/ -name "*.jpg" -o -name "*.png" | head -1 | grep -q .; then
        echo "- Optimize images (consider WebP format, proper sizing)"
    fi
    
    echo ""
    echo "Optimization completed at: $(date)"
    
} | tee "$OPTIMIZATION_LOG"

echo "⚡ Performance optimization analysis completed"
echo "📋 Report saved to: $OPTIMIZATION_LOG"
```

## 💾 Backup & Recovery

### Automated Backup Verification

```bash
#!/bin/bash
# scripts/verify-backups.sh

echo "💾 Verifying backup systems"

BACKUP_REPORT="backup-verification-$(date +%Y%m%d).log"

{
    echo "Backup Verification Report"
    echo "========================="
    echo "Date: $(date)"
    
    # Check Key Vault backups
    echo ""
    echo "Key Vault Backup Status:"
    
    ENVIRONMENTS=("dev" "staging" "preprod" "prod")
    
    for env in "${ENVIRONMENTS[@]}"; do
        KV_NAME="myapp-kv-${env}-eastus2"
        
        echo "Checking $KV_NAME..."
        
        # Check if Key Vault exists and is accessible
        KV_STATUS=$(az keyvault show --name "$KV_NAME" --query "properties.provisioningState" --output tsv 2>/dev/null)
        
        if [ "$KV_STATUS" = "Succeeded" ]; then
            echo "✅ $KV_NAME: Accessible"
            
            # List recent secret versions (backup verification)
            SECRET_COUNT=$(az keyvault secret list --vault-name "$KV_NAME" --query "length(@)" --output tsv 2>/dev/null || echo "0")
            echo "   Secrets count: $SECRET_COUNT"
            
            # Check soft delete status
            SOFT_DELETE=$(az keyvault show --name "$KV_NAME" --query "properties.enableSoftDelete" --output tsv 2>/dev/null)
            echo "   Soft delete enabled: $SOFT_DELETE"
            
            # Check purge protection
            PURGE_PROTECTION=$(az keyvault show --name "$KV_NAME" --query "properties.enablePurgeProtection" --output tsv 2>/dev/null)
            echo "   Purge protection: $PURGE_PROTECTION"
        else
            echo "❌ $KV_NAME: Not accessible or doesn't exist"
        fi
    done
    
    # Check Application Insights data retention
    echo ""
    echo "Application Insights Data Retention:"
    
    for env in "${ENVIRONMENTS[@]}"; do
        AI_NAME="myapp-ai-${env}-eastus2"
        RG_NAME="myapp-rg-${env}-eastus2"
        
        RETENTION=$(az monitor app-insights component show \
            --app "$AI_NAME" \
            --resource-group "$RG_NAME" \
            --query "retentionInDays" \
            --output tsv 2>/dev/null || echo "unknown")
        
        echo "$AI_NAME: $RETENTION days retention"
    done
    
    # Check GitHub repository backup
    echo ""
    echo "Source Code Backup (GitHub):"
    
    # Verify remote repository access
    if git remote -v >/dev/null 2>&1; then
        REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "No remote configured")
        echo "Remote repository: $REMOTE_URL"
        
        # Check if we can fetch
        if git fetch --dry-run >/dev/null 2>&1; then
            echo "✅ Repository access verified"
        else
            echo "❌ Cannot access remote repository"
        fi
        
        # Check recent commits
        LAST_COMMIT=$(git log -1 --format="%h %s" 2>/dev/null || echo "No commits found")
        echo "Last commit: $LAST_COMMIT"
    else
        echo "⚠️ Not in a git repository"
    fi
    
    # Backup recommendations
    echo ""
    echo "Backup Recommendations:"
    echo "- Regularly test Key Vault secret recovery"
    echo "- Verify Application Insights query capabilities"
    echo "- Ensure GitHub repository is properly mirrored"
    echo "- Document recovery procedures"
    echo "- Test disaster recovery scenarios monthly"
    
    echo ""
    echo "Verification completed at: $(date)"
    
} | tee "$BACKUP_REPORT"

echo "💾 Backup verification completed"
echo "📋 Report saved to: $BACKUP_REPORT"
```

## 💰 Cost Management

### Cost Analysis and Optimization

```bash
#!/bin/bash
# scripts/cost-analysis.sh

echo "💰 Running cost analysis"

COST_REPORT="cost-analysis-$(date +%Y%m%d).csv"

{
    echo "Resource Group,Resource Name,Resource Type,Location,Tags"
    
    ENVIRONMENTS=("dev" "staging" "preprod" "prod")
    
    for env in "${ENVIRONMENTS[@]}"; do
        RG_NAME="myapp-rg-${env}-eastus2"
        
        az resource list \
            --resource-group "$RG_NAME" \
            --query "[].{RG:'$RG_NAME', Name:name, Type:type, Location:location, Tags:tags}" \
            --output json | \
        jq -r '.[] | [.RG, .Name, .Type, .Location, (.Tags | to_entries | map("\(.key)=\(.value)") | join(";"))] | @csv'
    done
    
} > "$COST_REPORT"

echo "💰 Cost analysis completed"
echo "📋 Report saved to: $COST_REPORT"

# Generate cost recommendations
cat > "cost-recommendations-$(date +%Y%m%d).md" << EOF
# Cost Optimization Recommendations

## Current Resource Inventory
See attached CSV file: $COST_REPORT

## Recommendations

### Immediate Actions
- [ ] Review development environment usage patterns
- [ ] Implement auto-shutdown for non-production resources
- [ ] Optimize Application Insights retention settings
- [ ] Review Key Vault transaction patterns

### Medium-term Actions
- [ ] Implement resource tagging for better cost allocation
- [ ] Set up cost alerts and budgets
- [ ] Consider reserved instance pricing for production
- [ ] Evaluate resource right-sizing opportunities

### Monitoring
- [ ] Set up daily cost monitoring
- [ ] Create cost dashboards
- [ ] Implement spending alerts
- [ ] Regular cost reviews with stakeholders

Generated: $(date)
EOF

echo "📋 Cost recommendations generated"
```

## 👥 Team Handoff Procedures

### Shift Handoff Checklist

```markdown
# Operations Shift Handoff Checklist

## Outgoing Team Tasks

### System Status Review
- [ ] All environments healthy (dev, staging, preprod, prod)
- [ ] No active incidents or alerts
- [ ] Recent deployments completed successfully
- [ ] Monitoring dashboards reviewed

### Current Issues
- [ ] Document any ongoing issues
- [ ] Provide status of troubleshooting efforts
- [ ] Share any temporary workarounds in place
- [ ] Note any scheduled maintenance

### Recent Changes
- [ ] List deployments from last 24 hours
- [ ] Note any configuration changes
- [ ] Document any infrastructure modifications
- [ ] Share any security updates applied

## Incoming Team Tasks

### Initial Health Check
- [ ] Run daily health check script
- [ ] Review monitoring dashboards
- [ ] Check alert status
- [ ] Verify backup systems

### Priority Items
- [ ] Review handoff notes from outgoing team
- [ ] Address any urgent issues
- [ ] Check for pending approvals
- [ ] Review scheduled tasks for the shift

## Contact Information

### Escalation Path
1. **Level 1**: On-call engineer
2. **Level 2**: Senior DevOps engineer
3. **Level 3**: Engineering manager
4. **Level 4**: CTO

### Key Contacts
- **Security Team**: security@company.com
- **Network Team**: network@company.com
- **Database Team**: dba@company.com

## Useful Commands

```bash
# Quick health check
./scripts/daily-health-check.sh

# Check recent deployments
gh run list --workflow=enhanced-ci-cd.yml --limit=5

# View current alerts
az monitor metrics alert list --query "[?enabled].{Name:name, Condition:condition}" --output table

# Check resource status
az resource list --tag Project=myapp --output table
```

## Emergency Procedures

### Severity 1 Incidents
1. **Alert**: Immediately notify on-call manager
2. **Response**: Execute incident response playbook
3. **Communication**: Update status page every 15 minutes
4. **Escalation**: If not resolved in 30 minutes, escalate to Level 2

### Contact Numbers
- **On-call Hotline**: +1-XXX-XXX-XXXX
- **Security Hotline**: +1-XXX-XXX-XXXX
- **Management Escalation**: +1-XXX-XXX-XXXX
```

### Knowledge Transfer Template

```bash
#!/bin/bash
# scripts/knowledge-transfer.sh

RECIPIENT="$1"
TRANSFER_DATE="$2"

if [ -z "$RECIPIENT" ]; then
    echo "Usage: $0 <recipient_email> [transfer_date]"
    exit 1
fi

TRANSFER_DATE="${TRANSFER_DATE:-$(date +%Y-%m-%d)}"
TRANSFER_PACKAGE="knowledge-transfer-$TRANSFER_DATE"

mkdir -p "$TRANSFER_PACKAGE"

echo "📚 Preparing knowledge transfer package for $RECIPIENT"

# Copy important documentation
cp -r docs/ "$TRANSFER_PACKAGE/"
cp -r scripts/ "$TRANSFER_PACKAGE/"

# Generate system overview
cat > "$TRANSFER_PACKAGE/system-overview.md" << EOF
# System Overview - $TRANSFER_DATE

## Architecture
- **Frontend**: React 18 application
- **Hosting**: Azure Static Web Apps
- **Environments**: 4 environments (dev, staging, preprod, prod)
- **Security**: Azure Key Vault integration
- **Monitoring**: Application Insights + custom health checks

## Key Components
- **Static Web Apps**: Main hosting platform
- **Key Vault**: Secret management
- **Application Insights**: Monitoring and analytics
- **GitHub Actions**: CI/CD pipeline

## Important URLs
- **Production**: https://yourdomain.com
- **Staging**: https://staging.yourdomain.com
- **Pre-production**: https://preprod.yourdomain.com

## Access Requirements
- Azure subscription access
- GitHub repository access
- VPN access (if applicable)

## Emergency Contacts
- On-call: [Contact information]
- Management: [Contact information]
- Security team: [Contact information]

EOF

# Generate current system status
cat > "$TRANSFER_PACKAGE/current-status.md" << EOF
# Current System Status - $TRANSFER_DATE

## Environment Health
$(./scripts/daily-health-check.sh)

## Recent Deployments
$(gh run list --workflow=enhanced-ci-cd.yml --limit=10 --json conclusion,createdAt,headBranch | jq -r '.[] | "\(.createdAt): \(.headBranch) - \(.conclusion)"')

## Known Issues
- [List any current issues]
- [Include workarounds if applicable]

## Upcoming Maintenance
- [List scheduled maintenance]
- [Include impact assessment]

EOF

# Create tarball
tar -czf "$TRANSFER_PACKAGE.tar.gz" "$TRANSFER_PACKAGE/"

echo "📦 Knowledge transfer package created: $TRANSFER_PACKAGE.tar.gz"
echo "📧 Ready to send to: $RECIPIENT"

# Cleanup
rm -rf "$TRANSFER_PACKAGE/"
```

## 🔗 Related Documentation

- [Infrastructure Setup Guide](./01-INFRASTRUCTURE-SETUP.md)
- [Deployment Guide](./02-DEPLOYMENT-GUIDE.md)
- [Monitoring Guide](./05-MONITORING-GUIDE.md)
- [Troubleshooting Guide](./07-TROUBLESHOOTING.md)

---

**Last Updated:** December 2024  
**Version:** 1.0.0
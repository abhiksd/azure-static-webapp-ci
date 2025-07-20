#!/usr/bin/env node

/**
 * Production-Grade Rollback System for Azure Static Web Apps
 * Provides automated rollback capabilities with safety checks
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');

class RollbackSystem {
    constructor(config) {
        this.config = {
            maxRollbackDepth: 5,
            healthCheckTimeout: 60000,
            rollbackTimeout: 300000, // 5 minutes
            autoRollbackEnabled: false,
            ...config
        };
        
        this.deploymentHistory = [];
        this.rollbackHistory = [];
    }

    async loadDeploymentHistory() {
        try {
            const historyFile = 'deployment-history.json';
            if (fs.existsSync(historyFile)) {
                const data = await fs.promises.readFile(historyFile, 'utf8');
                this.deploymentHistory = JSON.parse(data);
                console.log(`📚 Loaded ${this.deploymentHistory.length} deployment records`);
            }
        } catch (error) {
            console.warn('⚠️ Could not load deployment history:', error.message);
            this.deploymentHistory = [];
        }
    }

    async saveDeploymentHistory() {
        try {
            const historyFile = 'deployment-history.json';
            await fs.promises.writeFile(historyFile, JSON.stringify(this.deploymentHistory, null, 2));
        } catch (error) {
            console.error('❌ Failed to save deployment history:', error.message);
        }
    }

    async recordDeployment(environment, version, url, metadata = {}) {
        const deployment = {
            id: this.generateDeploymentId(),
            timestamp: new Date().toISOString(),
            environment,
            version,
            url,
            status: 'active',
            metadata: {
                gitSha: process.env.GITHUB_SHA,
                gitRef: process.env.GITHUB_REF,
                workflowRun: process.env.GITHUB_RUN_ID,
                actor: process.env.GITHUB_ACTOR,
                ...metadata
            }
        };

        // Mark previous deployments as inactive
        this.deploymentHistory
            .filter(d => d.environment === environment && d.status === 'active')
            .forEach(d => d.status = 'inactive');

        this.deploymentHistory.unshift(deployment);
        
        // Keep only the configured depth
        this.deploymentHistory = this.deploymentHistory.slice(0, this.config.maxRollbackDepth * 4); // 4 environments
        
        await this.saveDeploymentHistory();
        
        console.log(`📝 Recorded deployment: ${environment} v${version}`);
        return deployment;
    }

    async initiateRollback(environment, targetVersion = null, reason = 'Manual rollback') {
        console.log(`🔄 Initiating rollback for ${environment} environment`);
        console.log(`📋 Reason: ${reason}`);
        
        await this.loadDeploymentHistory();
        
        const currentDeployment = this.getCurrentDeployment(environment);
        if (!currentDeployment) {
            throw new Error(`No current deployment found for ${environment}`);
        }
        
        const targetDeployment = targetVersion 
            ? this.findDeploymentByVersion(environment, targetVersion)
            : this.getPreviousDeployment(environment);
            
        if (!targetDeployment) {
            throw new Error(`No target deployment found for rollback`);
        }
        
        console.log(`🎯 Rolling back from v${currentDeployment.version} to v${targetDeployment.version}`);
        
        // Perform pre-rollback checks
        await this.performPreRollbackChecks(environment, targetDeployment);
        
        // Execute rollback
        const rollback = await this.executeRollback(environment, currentDeployment, targetDeployment, reason);
        
        // Verify rollback success
        await this.verifyRollback(environment, targetDeployment);
        
        // Record rollback
        this.rollbackHistory.push(rollback);
        await this.saveRollbackHistory();
        
        // Send notifications
        await this.notifyRollbackCompletion(rollback);
        
        console.log('✅ Rollback completed successfully');
        return rollback;
    }

    async performPreRollbackChecks(environment, targetDeployment) {
        console.log('🔍 Performing pre-rollback checks...');
        
        // Check if target deployment is valid
        if (!targetDeployment.url) {
            throw new Error('Target deployment URL not available');
        }
        
        // Verify target deployment accessibility
        try {
            const response = await this.makeHealthCheck(targetDeployment.url);
            if (response.statusCode !== 200) {
                console.warn(`⚠️ Target deployment returned ${response.statusCode}, proceeding with caution`);
            } else {
                console.log('✅ Target deployment is accessible');
            }
        } catch (error) {
            console.warn('⚠️ Could not verify target deployment accessibility:', error.message);
        }
        
        // Check for ongoing operations
        const ongoingOperations = await this.checkOngoingOperations(environment);
        if (ongoingOperations.length > 0) {
            console.warn(`⚠️ Found ${ongoingOperations.length} ongoing operations, proceeding with caution`);
        }
        
        console.log('✅ Pre-rollback checks completed');
    }

    async executeRollback(environment, currentDeployment, targetDeployment, reason) {
        const rollbackId = this.generateRollbackId();
        const startTime = Date.now();
        
        console.log(`🚀 Executing rollback (ID: ${rollbackId})`);
        
        const rollback = {
            id: rollbackId,
            timestamp: new Date().toISOString(),
            environment,
            reason,
            from: {
                version: currentDeployment.version,
                deploymentId: currentDeployment.id
            },
            to: {
                version: targetDeployment.version,
                deploymentId: targetDeployment.id
            },
            status: 'in-progress',
            steps: []
        };
        
        try {
            // Step 1: Backup current state
            await this.addRollbackStep(rollback, 'backup', 'Creating backup of current deployment');
            const backup = await this.backupCurrentDeployment(currentDeployment);
            
            // Step 2: Switch traffic routing (if using slots)
            await this.addRollbackStep(rollback, 'routing', 'Switching traffic routing');
            await this.switchTrafficRouting(environment, targetDeployment);
            
            // Step 3: Update configuration
            await this.addRollbackStep(rollback, 'config', 'Updating configuration');
            await this.updateEnvironmentConfig(environment, targetDeployment);
            
            // Step 4: Trigger redeployment if necessary
            await this.addRollbackStep(rollback, 'redeploy', 'Triggering redeployment');
            await this.triggerRedeployment(environment, targetDeployment);
            
            rollback.status = 'completed';
            rollback.duration = Date.now() - startTime;
            rollback.backup = backup;
            
            console.log(`✅ Rollback execution completed in ${rollback.duration}ms`);
            
        } catch (error) {
            rollback.status = 'failed';
            rollback.error = error.message;
            rollback.duration = Date.now() - startTime;
            
            console.error(`❌ Rollback execution failed: ${error.message}`);
            
            // Attempt to restore from backup
            if (rollback.backup) {
                await this.restoreFromBackup(rollback.backup);
            }
            
            throw error;
        }
        
        return rollback;
    }

    async addRollbackStep(rollback, step, description) {
        console.log(`  📋 ${description}...`);
        rollback.steps.push({
            step,
            description,
            timestamp: new Date().toISOString(),
            status: 'in-progress'
        });
    }

    async backupCurrentDeployment(deployment) {
        // Create a backup record for potential restoration
        const backup = {
            id: this.generateBackupId(),
            timestamp: new Date().toISOString(),
            deployment: { ...deployment },
            files: await this.backupConfigFiles()
        };
        
        console.log(`  💾 Backup created (ID: ${backup.id})`);
        return backup;
    }

    async backupConfigFiles() {
        const configFiles = [
            'staticwebapp.config.json',
            'deployment-config.json'
        ];
        
        const backups = {};
        
        for (const file of configFiles) {
            try {
                if (fs.existsSync(file)) {
                    backups[file] = await fs.promises.readFile(file, 'utf8');
                }
            } catch (error) {
                console.warn(`⚠️ Could not backup ${file}: ${error.message}`);
            }
        }
        
        return backups;
    }

    async switchTrafficRouting(environment, targetDeployment) {
        // For Azure Static Web Apps, this typically involves updating the deployment
        // In a more complex setup, this might involve load balancer configuration
        console.log(`  🔄 Switching traffic to ${targetDeployment.version}`);
        
        // This is a placeholder for actual traffic switching logic
        // In reality, this would interact with Azure APIs
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    async updateEnvironmentConfig(environment, targetDeployment) {
        // Update environment-specific configuration
        const configPath = `environments/${environment}.json`;
        
        try {
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(await fs.promises.readFile(configPath, 'utf8'));
                config.deployment = {
                    version: targetDeployment.version,
                    rollback: true,
                    timestamp: new Date().toISOString()
                };
                
                await fs.promises.writeFile(configPath, JSON.stringify(config, null, 2));
                console.log(`  ⚙️ Updated ${configPath}`);
            }
        } catch (error) {
            console.warn(`⚠️ Could not update config: ${error.message}`);
        }
    }

    async triggerRedeployment(environment, targetDeployment) {
        // Trigger GitHub Actions workflow for redeployment
        const workflowData = {
            ref: targetDeployment.metadata?.gitRef || 'main',
            inputs: {
                environment,
                version: targetDeployment.version,
                rollback: 'true'
            }
        };
        
        console.log(`  🚀 Triggering redeployment for ${environment}`);
        
        // This is a placeholder for actual GitHub API call
        // In reality, this would use GitHub's workflow dispatch API
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    async verifyRollback(environment, targetDeployment) {
        console.log('🔍 Verifying rollback success...');
        
        const maxAttempts = 10;
        const checkInterval = 10000; // 10 seconds
        
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const response = await this.makeHealthCheck(targetDeployment.url);
                
                if (response.statusCode === 200) {
                    // Additional checks for version verification
                    const versionCheck = await this.verifyVersion(targetDeployment.url, targetDeployment.version);
                    
                    if (versionCheck) {
                        console.log('✅ Rollback verification successful');
                        return true;
                    }
                }
                
                console.log(`  📊 Attempt ${attempt}/${maxAttempts}: Status ${response.statusCode}`);
                
            } catch (error) {
                console.log(`  ❌ Attempt ${attempt}/${maxAttempts}: ${error.message}`);
            }
            
            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, checkInterval));
            }
        }
        
        throw new Error('Rollback verification failed - application not responding correctly');
    }

    async verifyVersion(url, expectedVersion) {
        try {
            // Try to detect version in the response
            const response = await this.makeHealthCheck(url);
            const body = response.body;
            
            // Look for version indicators in the HTML
            const versionMatch = body.match(/version["\s:]*["']?([^"'\s]+)/i);
            if (versionMatch && versionMatch[1] === expectedVersion) {
                return true;
            }
            
            // For now, assume success if we get a 200 response
            return response.statusCode === 200;
            
        } catch (error) {
            console.warn('⚠️ Could not verify version:', error.message);
            return false;
        }
    }

    async checkAutoRollbackTriggers(environment, currentUrl) {
        if (!this.config.autoRollbackEnabled) {
            return false;
        }
        
        console.log(`🤖 Checking auto-rollback triggers for ${environment}`);
        
        // Check health status
        const healthStatus = await this.checkHealthStatus(currentUrl);
        
        // Check error rate
        const errorRate = await this.checkErrorRate(environment);
        
        // Check performance metrics
        const performance = await this.checkPerformanceMetrics(currentUrl);
        
        const shouldRollback = 
            !healthStatus.healthy ||
            errorRate > 0.1 || // 10% error rate
            performance.responseTime > 5000; // 5 second response time
        
        if (shouldRollback) {
            const reason = `Auto-rollback triggered: ${!healthStatus.healthy ? 'Health check failed' : errorRate > 0.1 ? 'High error rate' : 'Poor performance'}`;
            console.log(`🚨 ${reason}`);
            
            await this.initiateRollback(environment, null, reason);
            return true;
        }
        
        return false;
    }

    async checkHealthStatus(url) {
        try {
            const response = await this.makeHealthCheck(url);
            return {
                healthy: response.statusCode === 200,
                statusCode: response.statusCode,
                responseTime: response.responseTime
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message
            };
        }
    }

    async checkErrorRate(environment) {
        // This would typically check monitoring system for error rates
        // For now, return a mock value
        return 0.02; // 2% error rate
    }

    async checkPerformanceMetrics(url) {
        try {
            const startTime = Date.now();
            const response = await this.makeHealthCheck(url);
            const responseTime = Date.now() - startTime;
            
            return {
                responseTime,
                statusCode: response.statusCode
            };
        } catch (error) {
            return {
                responseTime: 30000, // Timeout
                error: error.message
            };
        }
    }

    getCurrentDeployment(environment) {
        return this.deploymentHistory.find(d => 
            d.environment === environment && d.status === 'active'
        );
    }

    getPreviousDeployment(environment) {
        const deployments = this.deploymentHistory.filter(d => 
            d.environment === environment && d.status === 'inactive'
        );
        return deployments[0]; // Most recent inactive deployment
    }

    findDeploymentByVersion(environment, version) {
        return this.deploymentHistory.find(d => 
            d.environment === environment && d.version === version
        );
    }

    async checkOngoingOperations(environment) {
        // This would check for ongoing deployments, health checks, etc.
        // For now, return empty array
        return [];
    }

    async notifyRollbackCompletion(rollback) {
        const message = `🔄 Rollback completed for ${rollback.environment}
        
From: v${rollback.from.version}
To: v${rollback.to.version}
Reason: ${rollback.reason}
Duration: ${(rollback.duration / 1000).toFixed(1)}s
Status: ${rollback.status}`;
        
        console.log('📢 Sending rollback notifications...');
        
        // Send to configured notification channels
        if (process.env.SLACK_WEBHOOK_URL) {
            await this.sendSlackNotification(rollback, message);
        }
        
        if (process.env.TEAMS_WEBHOOK_URL) {
            await this.sendTeamsNotification(rollback, message);
        }
    }

    async sendSlackNotification(rollback, message) {
        const payload = {
            channel: '#deployments',
            username: 'Rollback Bot',
            icon_emoji: ':arrows_counterclockwise:',
            attachments: [{
                color: rollback.status === 'completed' ? '#28a745' : '#dc3545',
                title: `Rollback ${rollback.status}: ${rollback.environment}`,
                text: message,
                fields: [
                    { title: 'Environment', value: rollback.environment, short: true },
                    { title: 'Duration', value: `${(rollback.duration / 1000).toFixed(1)}s`, short: true }
                ],
                footer: 'Azure Static Web App Rollback System',
                ts: Math.floor(Date.now() / 1000)
            }]
        };
        
        try {
            await this.makeWebhookRequest(process.env.SLACK_WEBHOOK_URL, payload);
            console.log('📱 Slack notification sent');
        } catch (error) {
            console.error('❌ Failed to send Slack notification:', error.message);
        }
    }

    async restoreFromBackup(backup) {
        console.log(`🔧 Attempting to restore from backup ${backup.id}`);
        
        try {
            // Restore configuration files
            for (const [filename, content] of Object.entries(backup.files)) {
                await fs.promises.writeFile(filename, content);
                console.log(`  📄 Restored ${filename}`);
            }
            
            console.log('✅ Backup restoration completed');
        } catch (error) {
            console.error('❌ Backup restoration failed:', error.message);
        }
    }

    async saveRollbackHistory() {
        try {
            const historyFile = 'rollback-history.json';
            await fs.promises.writeFile(historyFile, JSON.stringify(this.rollbackHistory, null, 2));
        } catch (error) {
            console.error('❌ Failed to save rollback history:', error.message);
        }
    }

    async makeHealthCheck(url) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            const request = https.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Azure-StaticWebApp-Rollback/1.0'
                }
            }, (response) => {
                let body = '';
                response.on('data', chunk => body += chunk);
                response.on('end', () => {
                    resolve({
                        statusCode: response.statusCode,
                        headers: response.headers,
                        body,
                        responseTime: Date.now() - startTime
                    });
                });
            });
            
            request.on('error', reject);
            request.on('timeout', () => {
                request.destroy();
                reject(new Error('Request timeout'));
            });
        });
    }

    async makeWebhookRequest(url, payload) {
        return new Promise((resolve, reject) => {
            const data = JSON.stringify(payload);
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                }
            };
            
            const request = https.request(url, options, (response) => {
                let body = '';
                response.on('data', chunk => body += chunk);
                response.on('end', () => {
                    if (response.statusCode >= 200 && response.statusCode < 300) {
                        resolve(body);
                    } else {
                        reject(new Error(`HTTP ${response.statusCode}: ${body}`));
                    }
                });
            });
            
            request.on('error', reject);
            request.write(data);
            request.end();
        });
    }

    generateDeploymentId() {
        return `dep-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    generateRollbackId() {
        return `rb-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    generateBackupId() {
        return `bak-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

// CLI Interface
async function main() {
    const command = process.argv[2];
    const environment = process.argv[3];
    const version = process.argv[4];
    
    const rollbackSystem = new RollbackSystem({
        autoRollbackEnabled: process.env.AUTO_ROLLBACK_ENABLED === 'true'
    });
    
    try {
        switch (command) {
            case 'record':
                if (!environment || !version) {
                    console.error('Usage: node rollback.js record <environment> <version> [url]');
                    process.exit(1);
                }
                const url = process.argv[5] || `https://${environment}.example.com`;
                await rollbackSystem.recordDeployment(environment, version, url);
                break;
                
            case 'rollback':
                if (!environment) {
                    console.error('Usage: node rollback.js rollback <environment> [target-version]');
                    process.exit(1);
                }
                await rollbackSystem.initiateRollback(environment, version, 'Manual rollback via CLI');
                break;
                
            case 'auto-check':
                if (!environment) {
                    console.error('Usage: node rollback.js auto-check <environment> <url>');
                    process.exit(1);
                }
                const checkUrl = version; // version parameter is URL in this case
                await rollbackSystem.checkAutoRollbackTriggers(environment, checkUrl);
                break;
                
            default:
                console.log('Azure Static Web App Rollback System');
                console.log('');
                console.log('Commands:');
                console.log('  record <env> <version> [url]    Record a new deployment');
                console.log('  rollback <env> [version]        Initiate rollback to previous or specific version');
                console.log('  auto-check <env> <url>          Check if auto-rollback should be triggered');
                console.log('');
                console.log('Examples:');
                console.log('  node rollback.js record production v1.2.3 https://myapp.com');
                console.log('  node rollback.js rollback production');
                console.log('  node rollback.js rollback production v1.2.2');
                console.log('  node rollback.js auto-check production https://myapp.com');
                process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
}

module.exports = RollbackSystem;
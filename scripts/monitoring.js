#!/usr/bin/env node

/**
 * Production-Grade Monitoring Script for Azure Static Web Apps
 * Provides real-time monitoring, alerting, and dashboard capabilities
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

class MonitoringSystem {
    constructor(config) {
        this.config = {
            checkInterval: 60000, // 1 minute
            alertThresholds: {
                responseTime: 3000, // 3 seconds
                errorRate: 0.05, // 5%
                availability: 0.95 // 95%
            },
            retentionDays: 30,
            ...config
        };
        
        this.metrics = {
            uptime: [],
            responseTime: [],
            errors: [],
            performance: []
        };
        
        this.alertChannels = {
            slack: config.slackWebhook,
            teams: config.teamsWebhook,
            email: config.emailConfig
        };
        
        this.isRunning = false;
        this.startTime = Date.now();
    }

    async startMonitoring(urls) {
        console.log('🚀 Starting production monitoring system...');
        console.log(`📊 Monitoring ${urls.length} endpoint(s)`);
        console.log(`⏱️ Check interval: ${this.config.checkInterval / 1000}s`);
        
        this.isRunning = true;
        this.urls = urls;
        
        // Initialize monitoring loop
        this.monitoringLoop();
        
        // Setup cleanup on exit
        process.on('SIGINT', () => this.stop());
        process.on('SIGTERM', () => this.stop());
        
        console.log('✅ Monitoring system started successfully');
    }

    async monitoringLoop() {
        while (this.isRunning) {
            try {
                await this.performHealthChecks();
                await this.analyzeMetrics();
                await this.checkAlerts();
                await this.saveMetrics();
                
                // Wait for next check
                await new Promise(resolve => setTimeout(resolve, this.config.checkInterval));
            } catch (error) {
                console.error('❌ Monitoring loop error:', error);
                await this.sendAlert('system', 'Monitoring system error', error.message);
            }
        }
    }

    async performHealthChecks() {
        const timestamp = new Date().toISOString();
        
        for (const urlConfig of this.urls) {
            try {
                const startTime = Date.now();
                const response = await this.makeHealthCheck(urlConfig.url);
                const responseTime = Date.now() - startTime;
                
                const metrics = {
                    timestamp,
                    environment: urlConfig.environment,
                    url: urlConfig.url,
                    statusCode: response.statusCode,
                    responseTime,
                    success: response.statusCode === 200,
                    contentLength: parseInt(response.headers['content-length'] || '0'),
                    serverHeader: response.headers['server'] || 'unknown'
                };
                
                // Store metrics
                this.metrics.uptime.push(metrics);
                this.metrics.responseTime.push({
                    timestamp,
                    environment: urlConfig.environment,
                    responseTime
                });
                
                if (!metrics.success) {
                    this.metrics.errors.push({
                        timestamp,
                        environment: urlConfig.environment,
                        statusCode: response.statusCode,
                        error: `HTTP ${response.statusCode}`
                    });
                }
                
                console.log(`${metrics.success ? '✅' : '❌'} ${urlConfig.environment}: ${metrics.statusCode} (${responseTime}ms)`);
                
            } catch (error) {
                const errorMetric = {
                    timestamp,
                    environment: urlConfig.environment,
                    url: urlConfig.url,
                    error: error.message,
                    success: false
                };
                
                this.metrics.errors.push(errorMetric);
                console.log(`❌ ${urlConfig.environment}: Error - ${error.message}`);
            }
        }
    }

    async analyzeMetrics() {
        // Calculate availability for each environment
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        
        for (const urlConfig of this.urls) {
            const recentMetrics = this.metrics.uptime.filter(m => 
                m.environment === urlConfig.environment && 
                new Date(m.timestamp).getTime() > oneHourAgo
            );
            
            if (recentMetrics.length === 0) continue;
            
            const successCount = recentMetrics.filter(m => m.success).length;
            const availability = successCount / recentMetrics.length;
            const avgResponseTime = recentMetrics
                .filter(m => m.responseTime)
                .reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
            
            const analysis = {
                timestamp: new Date().toISOString(),
                environment: urlConfig.environment,
                availability,
                avgResponseTime,
                totalChecks: recentMetrics.length,
                successCount,
                errorCount: recentMetrics.length - successCount
            };
            
            this.metrics.performance.push(analysis);
            
            // Log performance summary
            console.log(`📈 ${urlConfig.environment} (1h): Availability ${(availability * 100).toFixed(2)}%, Avg Response ${avgResponseTime.toFixed(0)}ms`);
        }
    }

    async checkAlerts() {
        const recentPerformance = this.metrics.performance.slice(-this.urls.length);
        
        for (const perf of recentPerformance) {
            // Availability alert
            if (perf.availability < this.config.alertThresholds.availability) {
                await this.sendAlert(
                    'availability',
                    `Low availability in ${perf.environment}`,
                    `Availability dropped to ${(perf.availability * 100).toFixed(2)}% (threshold: ${(this.config.alertThresholds.availability * 100)}%)`
                );
            }
            
            // Response time alert
            if (perf.avgResponseTime > this.config.alertThresholds.responseTime) {
                await this.sendAlert(
                    'performance',
                    `High response time in ${perf.environment}`,
                    `Average response time: ${perf.avgResponseTime.toFixed(0)}ms (threshold: ${this.config.alertThresholds.responseTime}ms)`
                );
            }
            
            // Error rate alert
            const errorRate = perf.errorCount / perf.totalChecks;
            if (errorRate > this.config.alertThresholds.errorRate) {
                await this.sendAlert(
                    'errors',
                    `High error rate in ${perf.environment}`,
                    `Error rate: ${(errorRate * 100).toFixed(2)}% (threshold: ${(this.config.alertThresholds.errorRate * 100)}%)`
                );
            }
        }
    }

    async sendAlert(type, title, message) {
        const alert = {
            timestamp: new Date().toISOString(),
            type,
            title,
            message,
            severity: this.getAlertSeverity(type)
        };
        
        console.log(`🚨 ALERT [${alert.severity.toUpperCase()}]: ${title} - ${message}`);
        
        // Send to configured channels
        if (this.alertChannels.slack) {
            await this.sendSlackAlert(alert);
        }
        
        if (this.alertChannels.teams) {
            await this.sendTeamsAlert(alert);
        }
        
        // Store alert
        if (!this.metrics.alerts) this.metrics.alerts = [];
        this.metrics.alerts.push(alert);
    }

    getAlertSeverity(type) {
        const severityMap = {
            availability: 'critical',
            performance: 'warning',
            errors: 'error',
            system: 'critical'
        };
        return severityMap[type] || 'info';
    }

    async sendSlackAlert(alert) {
        if (!this.alertChannels.slack) return;
        
        const color = {
            critical: '#dc3545',
            error: '#fd7e14',
            warning: '#ffc107',
            info: '#17a2b8'
        }[alert.severity] || '#6c757d';
        
        const payload = {
            channel: '#alerts',
            username: 'Azure Static Web App Monitor',
            icon_emoji: ':warning:',
            attachments: [{
                color,
                title: alert.title,
                text: alert.message,
                fields: [
                    { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
                    { title: 'Type', value: alert.type, short: true },
                    { title: 'Time', value: alert.timestamp, short: false }
                ],
                footer: 'Azure Static Web App Monitoring',
                ts: Math.floor(Date.now() / 1000)
            }]
        };
        
        try {
            await this.makeWebhookRequest(this.alertChannels.slack, payload);
            console.log('📱 Slack alert sent successfully');
        } catch (error) {
            console.error('❌ Failed to send Slack alert:', error.message);
        }
    }

    async sendTeamsAlert(alert) {
        if (!this.alertChannels.teams) return;
        
        const themeColor = {
            critical: 'DC3545',
            error: 'FD7E14',
            warning: 'FFC107',
            info: '17A2B8'
        }[alert.severity] || '6C757D';
        
        const payload = {
            '@type': 'MessageCard',
            '@context': 'http://schema.org/extensions',
            themeColor,
            summary: alert.title,
            sections: [{
                activityTitle: 'Azure Static Web App Alert',
                activitySubtitle: alert.title,
                activityImage: 'https://docs.microsoft.com/en-us/azure/static-web-apps/media/index/static-apps.svg',
                facts: [
                    { name: 'Severity', value: alert.severity.toUpperCase() },
                    { name: 'Type', value: alert.type },
                    { name: 'Time', value: alert.timestamp }
                ],
                markdown: true,
                text: alert.message
            }]
        };
        
        try {
            await this.makeWebhookRequest(this.alertChannels.teams, payload);
            console.log('📱 Teams alert sent successfully');
        } catch (error) {
            console.error('❌ Failed to send Teams alert:', error.message);
        }
    }

    async generateDashboard() {
        const dashboard = {
            timestamp: new Date().toISOString(),
            uptime: this.calculateUptime(),
            environments: this.getEnvironmentSummary(),
            alerts: this.getRecentAlerts(),
            performance: this.getPerformanceSummary()
        };
        
        // Generate HTML dashboard
        const html = this.generateDashboardHTML(dashboard);
        
        // Save dashboard files
        await fs.promises.writeFile('monitoring-dashboard.json', JSON.stringify(dashboard, null, 2));
        await fs.promises.writeFile('monitoring-dashboard.html', html);
        
        console.log('📊 Dashboard generated successfully');
        return dashboard;
    }

    calculateUptime() {
        const totalRuntime = Date.now() - this.startTime;
        const uptimeHours = (totalRuntime / (1000 * 60 * 60)).toFixed(2);
        
        return {
            runtime: `${uptimeHours} hours`,
            started: new Date(this.startTime).toISOString()
        };
    }

    getEnvironmentSummary() {
        const summary = {};
        
        for (const urlConfig of this.urls) {
            const recentMetrics = this.metrics.uptime
                .filter(m => m.environment === urlConfig.environment)
                .slice(-10); // Last 10 checks
            
            if (recentMetrics.length === 0) continue;
            
            const successCount = recentMetrics.filter(m => m.success).length;
            const availability = successCount / recentMetrics.length;
            const avgResponseTime = recentMetrics
                .filter(m => m.responseTime)
                .reduce((sum, m) => sum + m.responseTime, 0) / recentMetrics.length;
            
            summary[urlConfig.environment] = {
                url: urlConfig.url,
                availability: `${(availability * 100).toFixed(2)}%`,
                avgResponseTime: `${avgResponseTime.toFixed(0)}ms`,
                lastCheck: recentMetrics[recentMetrics.length - 1]?.timestamp,
                status: recentMetrics[recentMetrics.length - 1]?.success ? 'healthy' : 'unhealthy'
            };
        }
        
        return summary;
    }

    getRecentAlerts() {
        if (!this.metrics.alerts) return [];
        
        return this.metrics.alerts
            .slice(-10) // Last 10 alerts
            .map(alert => ({
                timestamp: alert.timestamp,
                type: alert.type,
                title: alert.title,
                severity: alert.severity
            }));
    }

    getPerformanceSummary() {
        const summary = {};
        
        for (const urlConfig of this.urls) {
            const recentPerf = this.metrics.performance
                .filter(p => p.environment === urlConfig.environment)
                .slice(-24); // Last 24 hours (assuming hourly checks)
            
            if (recentPerf.length === 0) continue;
            
            const avgAvailability = recentPerf.reduce((sum, p) => sum + p.availability, 0) / recentPerf.length;
            const avgResponseTime = recentPerf.reduce((sum, p) => sum + p.avgResponseTime, 0) / recentPerf.length;
            
            summary[urlConfig.environment] = {
                availability24h: `${(avgAvailability * 100).toFixed(2)}%`,
                avgResponseTime24h: `${avgResponseTime.toFixed(0)}ms`,
                dataPoints: recentPerf.length
            };
        }
        
        return summary;
    }

    generateDashboardHTML(data) {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Azure Static Web App Monitoring Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status-healthy { color: #28a745; }
        .status-unhealthy { color: #dc3545; }
        .metric { display: flex; justify-content: space-between; margin: 10px 0; }
        .alert { padding: 10px; margin: 5px 0; border-radius: 4px; }
        .alert-critical { background: #f8d7da; border-left: 4px solid #dc3545; }
        .alert-error { background: #fdeaa7; border-left: 4px solid #fd7e14; }
        .alert-warning { background: #fff3cd; border-left: 4px solid #ffc107; }
        .timestamp { font-size: 0.9em; color: #666; }
    </style>
    <script>
        // Auto-refresh every 5 minutes
        setTimeout(() => window.location.reload(), 300000);
    </script>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Azure Static Web App Monitoring Dashboard</h1>
            <p class="timestamp">Last updated: ${data.timestamp}</p>
            <p>System uptime: ${data.uptime.runtime} (started: ${data.uptime.started})</p>
        </div>
        
        <div class="grid">
            ${Object.entries(data.environments).map(([env, info]) => `
                <div class="card">
                    <h3>${env.charAt(0).toUpperCase() + env.slice(1)} Environment</h3>
                    <div class="metric">
                        <span>Status:</span>
                        <span class="status-${info.status}">${info.status.toUpperCase()}</span>
                    </div>
                    <div class="metric">
                        <span>Availability:</span>
                        <span>${info.availability}</span>
                    </div>
                    <div class="metric">
                        <span>Response Time:</span>
                        <span>${info.avgResponseTime}</span>
                    </div>
                    <div class="metric">
                        <span>URL:</span>
                        <span><a href="${info.url}" target="_blank">${info.url}</a></span>
                    </div>
                    <div class="metric">
                        <span>Last Check:</span>
                        <span class="timestamp">${info.lastCheck}</span>
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="card" style="margin-top: 20px;">
            <h3>📊 24-Hour Performance Summary</h3>
            ${Object.entries(data.performance).map(([env, perf]) => `
                <div class="metric">
                    <span>${env}:</span>
                    <span>Availability: ${perf.availability24h}, Avg Response: ${perf.avgResponseTime24h}</span>
                </div>
            `).join('')}
        </div>
        
        <div class="card" style="margin-top: 20px;">
            <h3>🚨 Recent Alerts</h3>
            ${data.alerts.length === 0 ? '<p>No recent alerts</p>' : 
                data.alerts.map(alert => `
                    <div class="alert alert-${alert.severity}">
                        <strong>${alert.title}</strong>
                        <div class="timestamp">${alert.timestamp} - ${alert.type}</div>
                    </div>
                `).join('')
            }
        </div>
    </div>
</body>
</html>`;
    }

    async saveMetrics() {
        // Clean old metrics
        const cutoff = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
        
        Object.keys(this.metrics).forEach(key => {
            if (Array.isArray(this.metrics[key])) {
                this.metrics[key] = this.metrics[key].filter(item => 
                    new Date(item.timestamp).getTime() > cutoff
                );
            }
        });
        
        // Save to file
        const metricsFile = 'monitoring-metrics.json';
        await fs.promises.writeFile(metricsFile, JSON.stringify(this.metrics, null, 2));
    }

    async makeHealthCheck(url) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const request = https.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Azure-StaticWebApp-Monitor/1.0'
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

    async stop() {
        console.log('\n🛑 Stopping monitoring system...');
        this.isRunning = false;
        
        // Generate final dashboard
        await this.generateDashboard();
        console.log('✅ Monitoring system stopped');
        process.exit(0);
    }
}

// CLI Interface
async function main() {
    const config = {
        slackWebhook: process.env.SLACK_WEBHOOK_URL,
        teamsWebhook: process.env.TEAMS_WEBHOOK_URL,
        checkInterval: parseInt(process.env.MONITOR_INTERVAL) || 60000,
        alertThresholds: {
            responseTime: parseInt(process.env.ALERT_RESPONSE_TIME) || 3000,
            errorRate: parseFloat(process.env.ALERT_ERROR_RATE) || 0.05,
            availability: parseFloat(process.env.ALERT_AVAILABILITY) || 0.95
        }
    };
    
    const urls = [
        { environment: 'development', url: process.env.DEV_URL || 'https://dev.example.com' },
        { environment: 'staging', url: process.env.STAGING_URL || 'https://staging.example.com' },
        { environment: 'production', url: process.env.PROD_URL || 'https://prod.example.com' }
    ].filter(u => u.url !== 'https://dev.example.com' && u.url !== 'https://staging.example.com' && u.url !== 'https://prod.example.com');
    
    if (urls.length === 0) {
        console.error('❌ No URLs configured. Set DEV_URL, STAGING_URL, and/or PROD_URL environment variables.');
        process.exit(1);
    }
    
    const monitor = new MonitoringSystem(config);
    await monitor.startMonitoring(urls);
}

if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = MonitoringSystem;
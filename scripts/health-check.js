#!/usr/bin/env node

/**
 * Production-Grade Health Check Script for Azure Static Web Apps
 * Validates deployment health across multiple dimensions
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

class HealthChecker {
    constructor(config) {
        this.config = {
            timeout: 30000,
            retryAttempts: 3,
            retryDelay: 5000,
            ...config
        };
        this.results = {
            overall: 'unknown',
            checks: [],
            timestamp: new Date().toISOString(),
            duration: 0
        };
    }

    async runHealthChecks(url, environment) {
        const startTime = Date.now();
        console.log(`🏥 Starting health checks for ${environment} environment`);
        console.log(`🌐 Target URL: ${url}`);
        console.log('─'.repeat(60));

        try {
            // Core health checks
            await this.checkBasicConnectivity(url);
            await this.checkStaticAssets(url);
            await this.checkApplicationRoutes(url);
            await this.checkSecurityHeaders(url);
            await this.checkPerformanceMetrics(url);
            await this.checkAvailability(url);
            
            // Environment-specific checks
            await this.checkEnvironmentSpecific(url, environment);
            
            this.results.duration = Date.now() - startTime;
            this.generateReport();
            
            const passed = this.results.checks.every(check => check.status === 'pass');
            this.results.overall = passed ? 'healthy' : 'unhealthy';
            
            return this.results;
        } catch (error) {
            console.error('❌ Health check failed:', error.message);
            this.results.overall = 'error';
            this.results.error = error.message;
            this.results.duration = Date.now() - startTime;
            return this.results;
        }
    }

    async checkBasicConnectivity(url) {
        console.log('🔗 Checking basic connectivity...');
        
        try {
            const response = await this.makeRequest(url);
            const check = {
                name: 'Basic Connectivity',
                status: response.statusCode === 200 ? 'pass' : 'fail',
                details: {
                    statusCode: response.statusCode,
                    responseTime: response.responseTime,
                    contentLength: response.headers['content-length']
                }
            };
            
            this.results.checks.push(check);
            console.log(`  ✅ Status: ${response.statusCode} (${response.responseTime}ms)`);
        } catch (error) {
            this.results.checks.push({
                name: 'Basic Connectivity',
                status: 'fail',
                error: error.message
            });
            console.log(`  ❌ Failed: ${error.message}`);
        }
    }

    async checkStaticAssets(url) {
        console.log('📦 Checking static assets...');
        
        const assetPaths = [
            '/static/css/',
            '/static/js/',
            '/manifest.json',
            '/favicon.ico'
        ];

        for (const assetPath of assetPaths) {
            try {
                const assetUrl = new URL(assetPath, url).toString();
                const response = await this.makeRequest(assetUrl);
                
                // Accept 200, 404 (for optional assets), or 403 (directory listing disabled)
                const validCodes = [200, 403, 404];
                const isValid = validCodes.includes(response.statusCode);
                
                this.results.checks.push({
                    name: `Static Asset: ${assetPath}`,
                    status: isValid ? 'pass' : 'fail',
                    details: {
                        statusCode: response.statusCode,
                        responseTime: response.responseTime
                    }
                });
                
                console.log(`  ${isValid ? '✅' : '❌'} ${assetPath}: ${response.statusCode}`);
            } catch (error) {
                this.results.checks.push({
                    name: `Static Asset: ${assetPath}`,
                    status: 'fail',
                    error: error.message
                });
                console.log(`  ❌ ${assetPath}: ${error.message}`);
            }
        }
    }

    async checkApplicationRoutes(url) {
        console.log('🛣️ Checking application routes...');
        
        const routes = [
            '/',
            '/about',
            '/contact',
            '/nonexistent-route' // Should return 200 for SPA
        ];

        for (const route of routes) {
            try {
                const routeUrl = new URL(route, url).toString();
                const response = await this.makeRequest(routeUrl);
                
                // SPAs should return 200 for all routes (handled by client-side routing)
                const check = {
                    name: `Route: ${route}`,
                    status: response.statusCode === 200 ? 'pass' : 'warn',
                    details: {
                        statusCode: response.statusCode,
                        responseTime: response.responseTime
                    }
                };
                
                this.results.checks.push(check);
                console.log(`  ${check.status === 'pass' ? '✅' : '⚠️'} ${route}: ${response.statusCode}`);
            } catch (error) {
                this.results.checks.push({
                    name: `Route: ${route}`,
                    status: 'fail',
                    error: error.message
                });
                console.log(`  ❌ ${route}: ${error.message}`);
            }
        }
    }

    async checkSecurityHeaders(url) {
        console.log('🛡️ Checking security headers...');
        
        try {
            const response = await this.makeRequest(url);
            const headers = response.headers;
            
            const securityChecks = [
                {
                    name: 'X-Content-Type-Options',
                    header: 'x-content-type-options',
                    expected: 'nosniff'
                },
                {
                    name: 'X-Frame-Options',
                    header: 'x-frame-options',
                    expected: ['DENY', 'SAMEORIGIN']
                },
                {
                    name: 'X-XSS-Protection',
                    header: 'x-xss-protection',
                    expected: '1; mode=block'
                },
                {
                    name: 'Strict-Transport-Security',
                    header: 'strict-transport-security',
                    expected: null // Just check presence
                }
            ];

            securityChecks.forEach(check => {
                const headerValue = headers[check.header];
                let status = 'fail';
                
                if (headerValue) {
                    if (check.expected === null) {
                        status = 'pass';
                    } else if (Array.isArray(check.expected)) {
                        status = check.expected.includes(headerValue) ? 'pass' : 'warn';
                    } else {
                        status = headerValue === check.expected ? 'pass' : 'warn';
                    }
                }
                
                this.results.checks.push({
                    name: `Security Header: ${check.name}`,
                    status,
                    details: {
                        value: headerValue || 'missing',
                        expected: check.expected
                    }
                });
                
                console.log(`  ${status === 'pass' ? '✅' : status === 'warn' ? '⚠️' : '❌'} ${check.name}: ${headerValue || 'missing'}`);
            });
        } catch (error) {
            this.results.checks.push({
                name: 'Security Headers',
                status: 'fail',
                error: error.message
            });
            console.log(`  ❌ Failed: ${error.message}`);
        }
    }

    async checkPerformanceMetrics(url) {
        console.log('⚡ Checking performance metrics...');
        
        try {
            const startTime = Date.now();
            const response = await this.makeRequest(url);
            const totalTime = Date.now() - startTime;
            
            const metrics = {
                responseTime: response.responseTime,
                totalTime,
                contentLength: parseInt(response.headers['content-length'] || '0'),
                compression: response.headers['content-encoding'] || 'none'
            };
            
            const performanceCheck = {
                name: 'Performance Metrics',
                status: metrics.responseTime < 2000 ? 'pass' : 'warn',
                details: metrics
            };
            
            this.results.checks.push(performanceCheck);
            
            console.log(`  ${performanceCheck.status === 'pass' ? '✅' : '⚠️'} Response time: ${metrics.responseTime}ms`);
            console.log(`  📊 Content length: ${metrics.contentLength} bytes`);
            console.log(`  🗜️ Compression: ${metrics.compression}`);
        } catch (error) {
            this.results.checks.push({
                name: 'Performance Metrics',
                status: 'fail',
                error: error.message
            });
            console.log(`  ❌ Failed: ${error.message}`);
        }
    }

    async checkAvailability(url) {
        console.log('🔄 Checking availability over time...');
        
        const checks = [];
        const numChecks = 5;
        const interval = 2000; // 2 seconds
        
        for (let i = 0; i < numChecks; i++) {
            try {
                const response = await this.makeRequest(url);
                checks.push({
                    attempt: i + 1,
                    statusCode: response.statusCode,
                    responseTime: response.responseTime,
                    success: response.statusCode === 200
                });
                
                if (i < numChecks - 1) {
                    await new Promise(resolve => setTimeout(resolve, interval));
                }
            } catch (error) {
                checks.push({
                    attempt: i + 1,
                    error: error.message,
                    success: false
                });
            }
        }
        
        const successRate = checks.filter(c => c.success).length / numChecks;
        const avgResponseTime = checks
            .filter(c => c.responseTime)
            .reduce((sum, c) => sum + c.responseTime, 0) / checks.filter(c => c.responseTime).length;
        
        this.results.checks.push({
            name: 'Availability Check',
            status: successRate >= 0.8 ? 'pass' : 'fail',
            details: {
                successRate: `${(successRate * 100).toFixed(1)}%`,
                averageResponseTime: `${avgResponseTime.toFixed(0)}ms`,
                checks
            }
        });
        
        console.log(`  ${successRate >= 0.8 ? '✅' : '❌'} Success rate: ${(successRate * 100).toFixed(1)}%`);
        console.log(`  📊 Average response time: ${avgResponseTime.toFixed(0)}ms`);
    }

    async checkEnvironmentSpecific(url, environment) {
        console.log(`🎯 Checking ${environment}-specific requirements...`);
        
        try {
            const response = await this.makeRequest(url);
            const body = response.body;
            
            // Check for environment indicators in the page
            const environmentChecks = [];
            
            if (environment === 'production') {
                // Production should not have debug info
                const hasDebugInfo = body.includes('debug') || body.includes('development');
                environmentChecks.push({
                    name: 'No Debug Information',
                    status: !hasDebugInfo ? 'pass' : 'warn',
                    details: { hasDebugInfo }
                });
                
                // Production should have optimized assets
                const hasMinifiedAssets = body.includes('.min.js') || body.includes('.min.css');
                environmentChecks.push({
                    name: 'Optimized Assets',
                    status: hasMinifiedAssets ? 'pass' : 'warn',
                    details: { hasMinifiedAssets }
                });
            }
            
            // Check for environment-specific content
            if (body.includes(environment)) {
                environmentChecks.push({
                    name: 'Environment Detection',
                    status: 'pass',
                    details: { environment: 'detected' }
                });
            }
            
            environmentChecks.forEach(check => {
                this.results.checks.push(check);
                console.log(`  ${check.status === 'pass' ? '✅' : '⚠️'} ${check.name}`);
            });
            
        } catch (error) {
            this.results.checks.push({
                name: 'Environment-Specific Checks',
                status: 'fail',
                error: error.message
            });
            console.log(`  ❌ Failed: ${error.message}`);
        }
    }

    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const urlObj = new URL(url);
            const isHttps = urlObj.protocol === 'https:';
            const client = isHttps ? https : http;
            
            const requestOptions = {
                hostname: urlObj.hostname,
                port: urlObj.port || (isHttps ? 443 : 80),
                path: urlObj.pathname + urlObj.search,
                method: 'GET',
                timeout: this.config.timeout,
                headers: {
                    'User-Agent': 'Azure-StaticWebApp-HealthCheck/1.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    ...options.headers
                }
            };
            
            const req = client.request(requestOptions, (res) => {
                let body = '';
                
                res.on('data', (chunk) => {
                    body += chunk;
                });
                
                res.on('end', () => {
                    const responseTime = Date.now() - startTime;
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body,
                        responseTime
                    });
                });
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject(new Error(`Request timeout after ${this.config.timeout}ms`));
            });
            
            req.end();
        });
    }

    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 HEALTH CHECK REPORT');
        console.log('='.repeat(60));
        
        const passCount = this.results.checks.filter(c => c.status === 'pass').length;
        const warnCount = this.results.checks.filter(c => c.status === 'warn').length;
        const failCount = this.results.checks.filter(c => c.status === 'fail').length;
        
        console.log(`✅ Passed: ${passCount}`);
        console.log(`⚠️ Warnings: ${warnCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log(`⏱️ Duration: ${this.results.duration}ms`);
        
        console.log('\n📋 Detailed Results:');
        this.results.checks.forEach(check => {
            const icon = check.status === 'pass' ? '✅' : check.status === 'warn' ? '⚠️' : '❌';
            console.log(`  ${icon} ${check.name}`);
            if (check.error) {
                console.log(`    Error: ${check.error}`);
            }
        });
        
        console.log('='.repeat(60));
    }

    async saveReport(filename) {
        const reportPath = path.join(process.cwd(), filename);
        await fs.promises.writeFile(reportPath, JSON.stringify(this.results, null, 2));
        console.log(`📄 Report saved to: ${reportPath}`);
    }
}

// CLI Interface
async function main() {
    const args = process.argv.slice(2);
    const url = args[0];
    const environment = args[1] || 'development';
    
    if (!url) {
        console.error('Usage: node health-check.js <url> [environment]');
        console.error('Example: node health-check.js https://myapp.azurestaticapps.net production');
        process.exit(1);
    }
    
    const healthChecker = new HealthChecker();
    const results = await healthChecker.runHealthChecks(url, environment);
    
    // Save report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await healthChecker.saveReport(`health-check-${environment}-${timestamp}.json`);
    
    // Exit with appropriate code
    const exitCode = results.overall === 'healthy' ? 0 : 1;
    console.log(`\n🎯 Overall health: ${results.overall.toUpperCase()}`);
    process.exit(exitCode);
}

if (require.main === module) {
    main().catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}

module.exports = HealthChecker;
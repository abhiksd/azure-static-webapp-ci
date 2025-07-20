#!/usr/bin/env node

/**
 * Security Configuration Manager for PR Protection
 * Easily enable/disable security checks and configure thresholds
 */

const fs = require('fs');
const path = require('path');

class SecurityConfigManager {
    constructor() {
        this.configFile = '.github/security-config.json';
        this.defaultConfig = {
            enabled: {
                sonarCloud: true,
                checkmarx: true,
                dependencyScan: true,
                licenseScan: false,
                securityGate: true
            },
            thresholds: {
                sonarQualityGate: 'PASSED',
                maxCriticalVulnerabilities: 0,
                maxHighVulnerabilities: 2,
                minCodeCoverage: 80
            },
            scopes: {
                production: {
                    strictMode: true,
                    blockOnFailure: true,
                    requiredChecks: ['sonarCloud', 'checkmarx', 'dependencyScan']
                },
                development: {
                    strictMode: false,
                    blockOnFailure: false,
                    requiredChecks: ['dependencyScan']
                },
                feature: {
                    strictMode: false,
                    blockOnFailure: false,
                    requiredChecks: []
                }
            },
            notifications: {
                slack: {
                    enabled: false,
                    webhook: '',
                    channels: {
                        security: '#security-alerts',
                        development: '#dev-team'
                    }
                },
                teams: {
                    enabled: false,
                    webhook: ''
                }
            }
        };
    }

    async loadConfig() {
        try {
            if (fs.existsSync(this.configFile)) {
                const data = await fs.promises.readFile(this.configFile, 'utf8');
                this.config = { ...this.defaultConfig, ...JSON.parse(data) };
                console.log('✅ Loaded existing security configuration');
            } else {
                this.config = { ...this.defaultConfig };
                console.log('ℹ️ Using default security configuration');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load config, using defaults:', error.message);
            this.config = { ...this.defaultConfig };
        }
    }

    async saveConfig() {
        try {
            const configDir = path.dirname(this.configFile);
            if (!fs.existsSync(configDir)) {
                fs.mkdirSync(configDir, { recursive: true });
            }
            
            await fs.promises.writeFile(
                this.configFile, 
                JSON.stringify(this.config, null, 2)
            );
            console.log('✅ Security configuration saved');
        } catch (error) {
            console.error('❌ Failed to save config:', error.message);
        }
    }

    displayCurrentConfig() {
        console.log('\n🔧 Current Security Configuration:');
        console.log('═'.repeat(50));
        
        console.log('\n📊 Security Checks:');
        Object.entries(this.config.enabled).forEach(([check, enabled]) => {
            const status = enabled ? '✅ Enabled' : '❌ Disabled';
            console.log(`  ${check}: ${status}`);
        });
        
        console.log('\n🎯 Thresholds:');
        Object.entries(this.config.thresholds).forEach(([threshold, value]) => {
            console.log(`  ${threshold}: ${value}`);
        });
        
        console.log('\n🔍 Scope Configuration:');
        Object.entries(this.config.scopes).forEach(([scope, config]) => {
            console.log(`  ${scope}:`);
            console.log(`    Strict Mode: ${config.strictMode ? '✅' : '❌'}`);
            console.log(`    Block on Failure: ${config.blockOnFailure ? '✅' : '❌'}`);
            console.log(`    Required Checks: ${config.requiredChecks.join(', ') || 'None'}`);
        });
    }

    async enableCheck(checkName) {
        if (!(checkName in this.config.enabled)) {
            console.error(`❌ Unknown security check: ${checkName}`);
            console.log('Available checks:', Object.keys(this.config.enabled).join(', '));
            return;
        }
        
        this.config.enabled[checkName] = true;
        console.log(`✅ Enabled ${checkName} security check`);
        await this.saveConfig();
    }

    async disableCheck(checkName) {
        if (!(checkName in this.config.enabled)) {
            console.error(`❌ Unknown security check: ${checkName}`);
            console.log('Available checks:', Object.keys(this.config.enabled).join(', '));
            return;
        }
        
        this.config.enabled[checkName] = false;
        console.log(`❌ Disabled ${checkName} security check`);
        await this.saveConfig();
    }

    async enableAll() {
        Object.keys(this.config.enabled).forEach(check => {
            this.config.enabled[check] = true;
        });
        console.log('✅ Enabled all security checks');
        await this.saveConfig();
    }

    async disableAll() {
        Object.keys(this.config.enabled).forEach(check => {
            this.config.enabled[check] = false;
        });
        console.log('❌ Disabled all security checks');
        await this.saveConfig();
    }

    async setThreshold(thresholdName, value) {
        if (!(thresholdName in this.config.thresholds)) {
            console.error(`❌ Unknown threshold: ${thresholdName}`);
            console.log('Available thresholds:', Object.keys(this.config.thresholds).join(', '));
            return;
        }
        
        // Type conversion based on threshold
        let convertedValue = value;
        if (thresholdName.includes('max') || thresholdName.includes('min')) {
            convertedValue = parseInt(value);
            if (isNaN(convertedValue)) {
                console.error(`❌ Invalid numeric value: ${value}`);
                return;
            }
        }
        
        this.config.thresholds[thresholdName] = convertedValue;
        console.log(`🎯 Set ${thresholdName} to ${convertedValue}`);
        await this.saveConfig();
    }

    async configureScopeStrictness(scope, strict) {
        if (!(scope in this.config.scopes)) {
            console.error(`❌ Unknown scope: ${scope}`);
            console.log('Available scopes:', Object.keys(this.config.scopes).join(', '));
            return;
        }
        
        const isStrict = strict === 'true' || strict === true;
        this.config.scopes[scope].strictMode = isStrict;
        this.config.scopes[scope].blockOnFailure = isStrict;
        
        console.log(`🔍 Set ${scope} scope strict mode: ${isStrict ? 'Enabled' : 'Disabled'}`);
        await this.saveConfig();
    }

    async generateRepositoryVariables() {
        console.log('\n🔧 GitHub Repository Variables Configuration:');
        console.log('═'.repeat(60));
        console.log('Copy these to your GitHub repository Variables:');
        console.log('(Repository Settings → Secrets and variables → Actions → Variables)');
        console.log('');
        
        const variables = {
            'ENABLE_SONAR_SCAN': this.config.enabled.sonarCloud.toString(),
            'ENABLE_CHECKMARX_SCAN': this.config.enabled.checkmarx.toString(),
            'ENABLE_DEPENDENCY_SCAN': this.config.enabled.dependencyScan.toString(),
            'ENABLE_LICENSE_SCAN': this.config.enabled.licenseScan.toString(),
            'SECURITY_GATE_ENABLED': this.config.enabled.securityGate.toString(),
            'SONAR_QUALITY_GATE': this.config.thresholds.sonarQualityGate,
            'MAX_CRITICAL_VULNERABILITIES': this.config.thresholds.maxCriticalVulnerabilities.toString(),
            'MAX_HIGH_VULNERABILITIES': this.config.thresholds.maxHighVulnerabilities.toString(),
            'MIN_CODE_COVERAGE': this.config.thresholds.minCodeCoverage.toString()
        };
        
        Object.entries(variables).forEach(([name, value]) => {
            console.log(`${name}=${value}`);
        });
        
        console.log('\n📝 GitHub CLI Commands:');
        console.log('Run these commands to set variables via GitHub CLI:');
        console.log('');
        
        Object.entries(variables).forEach(([name, value]) => {
            console.log(`gh variable set ${name} --body "${value}"`);
        });
    }

    async generateActionScript() {
        const scriptContent = `#!/bin/bash
# Security Configuration Script
# Generated on ${new Date().toISOString()}

echo "🛡️ Configuring Security Checks..."

# Set GitHub Repository Variables
${Object.entries({
    'ENABLE_SONAR_SCAN': this.config.enabled.sonarCloud.toString(),
    'ENABLE_CHECKMARX_SCAN': this.config.enabled.checkmarx.toString(),
    'ENABLE_DEPENDENCY_SCAN': this.config.enabled.dependencyScan.toString(),
    'ENABLE_LICENSE_SCAN': this.config.enabled.licenseScan.toString(),
    'SECURITY_GATE_ENABLED': this.config.enabled.securityGate.toString(),
    'SONAR_QUALITY_GATE': this.config.thresholds.sonarQualityGate,
    'MAX_CRITICAL_VULNERABILITIES': this.config.thresholds.maxCriticalVulnerabilities.toString(),
    'MAX_HIGH_VULNERABILITIES': this.config.thresholds.maxHighVulnerabilities.toString(),
    'MIN_CODE_COVERAGE': this.config.thresholds.minCodeCoverage.toString()
}).map(([name, value]) => `gh variable set ${name} --body "${value}"`).join('\n')}

echo "✅ Security configuration updated!"
`;
        
        const scriptPath = 'scripts/configure-security.sh';
        await fs.promises.writeFile(scriptPath, scriptContent);
        
        // Make script executable
        try {
            await fs.promises.chmod(scriptPath, '755');
        } catch (error) {
            console.warn('⚠️ Could not make script executable:', error.message);
        }
        
        console.log(`📝 Generated configuration script: ${scriptPath}`);
        console.log('Run with: ./scripts/configure-security.sh');
    }

    async createPreset(name, preset) {
        const presets = {
            strict: {
                enabled: {
                    sonarCloud: true,
                    checkmarx: true,
                    dependencyScan: true,
                    licenseScan: true,
                    securityGate: true
                },
                thresholds: {
                    sonarQualityGate: 'PASSED',
                    maxCriticalVulnerabilities: 0,
                    maxHighVulnerabilities: 0,
                    minCodeCoverage: 90
                }
            },
            moderate: {
                enabled: {
                    sonarCloud: true,
                    checkmarx: true,
                    dependencyScan: true,
                    licenseScan: false,
                    securityGate: true
                },
                thresholds: {
                    sonarQualityGate: 'PASSED',
                    maxCriticalVulnerabilities: 0,
                    maxHighVulnerabilities: 2,
                    minCodeCoverage: 80
                }
            },
            minimal: {
                enabled: {
                    sonarCloud: false,
                    checkmarx: false,
                    dependencyScan: true,
                    licenseScan: false,
                    securityGate: false
                },
                thresholds: {
                    sonarQualityGate: 'PASSED',
                    maxCriticalVulnerabilities: 5,
                    maxHighVulnerabilities: 10,
                    minCodeCoverage: 50
                }
            },
            disabled: {
                enabled: {
                    sonarCloud: false,
                    checkmarx: false,
                    dependencyScan: false,
                    licenseScan: false,
                    securityGate: false
                },
                thresholds: {
                    sonarQualityGate: 'PASSED',
                    maxCriticalVulnerabilities: 999,
                    maxHighVulnerabilities: 999,
                    minCodeCoverage: 0
                }
            }
        };
        
        if (!(name in presets)) {
            console.error(`❌ Unknown preset: ${name}`);
            console.log('Available presets:', Object.keys(presets).join(', '));
            return;
        }
        
        this.config.enabled = { ...this.config.enabled, ...presets[name].enabled };
        this.config.thresholds = { ...this.config.thresholds, ...presets[name].thresholds };
        
        console.log(`🎯 Applied ${name} security preset`);
        await this.saveConfig();
    }

    async validateConfiguration() {
        console.log('\n🔍 Validating Security Configuration:');
        console.log('═'.repeat(50));
        
        const issues = [];
        
        // Check if any security checks are enabled
        const enabledChecks = Object.values(this.config.enabled).filter(Boolean);
        if (enabledChecks.length === 0) {
            issues.push('⚠️ No security checks are enabled');
        }
        
        // Check threshold values
        if (this.config.thresholds.minCodeCoverage < 0 || this.config.thresholds.minCodeCoverage > 100) {
            issues.push('❌ Invalid code coverage threshold (must be 0-100)');
        }
        
        if (this.config.thresholds.maxCriticalVulnerabilities < 0) {
            issues.push('❌ Invalid critical vulnerabilities threshold (must be >= 0)');
        }
        
        // Check scope configuration
        Object.entries(this.config.scopes).forEach(([scope, config]) => {
            if (config.blockOnFailure && config.requiredChecks.length === 0) {
                issues.push(`⚠️ ${scope} scope blocks on failure but has no required checks`);
            }
        });
        
        if (issues.length === 0) {
            console.log('✅ Configuration is valid');
        } else {
            console.log('Issues found:');
            issues.forEach(issue => console.log(`  ${issue}`));
        }
        
        return issues.length === 0;
    }

    async generateDocumentation() {
        const doc = `# Security Configuration Documentation

Generated on: ${new Date().toISOString()}

## Current Configuration

### Security Checks
${Object.entries(this.config.enabled).map(([check, enabled]) => 
    `- **${check}**: ${enabled ? 'Enabled ✅' : 'Disabled ❌'}`
).join('\n')}

### Thresholds
${Object.entries(this.config.thresholds).map(([threshold, value]) => 
    `- **${threshold}**: ${value}`
).join('\n')}

### Scope Configuration
${Object.entries(this.config.scopes).map(([scope, config]) => 
    `#### ${scope.charAt(0).toUpperCase() + scope.slice(1)}
- Strict Mode: ${config.strictMode ? 'Yes' : 'No'}
- Block on Failure: ${config.blockOnFailure ? 'Yes' : 'No'}
- Required Checks: ${config.requiredChecks.join(', ') || 'None'}`
).join('\n\n')}

## Usage Commands

### Enable/Disable Checks
\`\`\`bash
# Enable a specific check
node scripts/security-config.js enable sonarCloud

# Disable a specific check
node scripts/security-config.js disable checkmarx

# Enable all checks
node scripts/security-config.js enable-all

# Disable all checks
node scripts/security-config.js disable-all
\`\`\`

### Configure Thresholds
\`\`\`bash
# Set minimum code coverage
node scripts/security-config.js threshold minCodeCoverage 85

# Set maximum critical vulnerabilities
node scripts/security-config.js threshold maxCriticalVulnerabilities 0
\`\`\`

### Apply Presets
\`\`\`bash
# Apply strict security preset
node scripts/security-config.js preset strict

# Apply moderate security preset
node scripts/security-config.js preset moderate

# Apply minimal security preset
node scripts/security-config.js preset minimal

# Disable all security checks
node scripts/security-config.js preset disabled
\`\`\`

### Configuration Management
\`\`\`bash
# Show current configuration
node scripts/security-config.js status

# Validate configuration
node scripts/security-config.js validate

# Generate GitHub variables
node scripts/security-config.js generate-vars

# Generate setup script
node scripts/security-config.js generate-script
\`\`\`
`;
        
        const docPath = 'docs/security-configuration.md';
        const docDir = path.dirname(docPath);
        
        if (!fs.existsSync(docDir)) {
            fs.mkdirSync(docDir, { recursive: true });
        }
        
        await fs.promises.writeFile(docPath, doc);
        console.log(`📚 Generated documentation: ${docPath}`);
    }
}

// CLI Interface
async function main() {
    const command = process.argv[2];
    const arg1 = process.argv[3];
    const arg2 = process.argv[4];
    
    const manager = new SecurityConfigManager();
    await manager.loadConfig();
    
    try {
        switch (command) {
            case 'status':
                manager.displayCurrentConfig();
                break;
                
            case 'enable':
                if (!arg1) {
                    console.error('Usage: node security-config.js enable <checkName>');
                    console.log('Available checks:', Object.keys(manager.config.enabled).join(', '));
                    process.exit(1);
                }
                await manager.enableCheck(arg1);
                break;
                
            case 'disable':
                if (!arg1) {
                    console.error('Usage: node security-config.js disable <checkName>');
                    console.log('Available checks:', Object.keys(manager.config.enabled).join(', '));
                    process.exit(1);
                }
                await manager.disableCheck(arg1);
                break;
                
            case 'enable-all':
                await manager.enableAll();
                break;
                
            case 'disable-all':
                await manager.disableAll();
                break;
                
            case 'threshold':
                if (!arg1 || !arg2) {
                    console.error('Usage: node security-config.js threshold <thresholdName> <value>');
                    console.log('Available thresholds:', Object.keys(manager.config.thresholds).join(', '));
                    process.exit(1);
                }
                await manager.setThreshold(arg1, arg2);
                break;
                
            case 'scope':
                if (!arg1 || !arg2) {
                    console.error('Usage: node security-config.js scope <scopeName> <strict|lenient>');
                    console.log('Available scopes:', Object.keys(manager.config.scopes).join(', '));
                    process.exit(1);
                }
                await manager.configureScopeStrictness(arg1, arg2 === 'strict');
                break;
                
            case 'preset':
                if (!arg1) {
                    console.error('Usage: node security-config.js preset <presetName>');
                    console.log('Available presets: strict, moderate, minimal, disabled');
                    process.exit(1);
                }
                await manager.createPreset(arg1);
                break;
                
            case 'validate':
                await manager.validateConfiguration();
                break;
                
            case 'generate-vars':
                await manager.generateRepositoryVariables();
                break;
                
            case 'generate-script':
                await manager.generateActionScript();
                break;
                
            case 'generate-docs':
                await manager.generateDocumentation();
                break;
                
            default:
                console.log('Security Configuration Manager for PR Protection');
                console.log('');
                console.log('Commands:');
                console.log('  status                    Show current configuration');
                console.log('  enable <check>            Enable a security check');
                console.log('  disable <check>           Disable a security check');
                console.log('  enable-all               Enable all security checks');
                console.log('  disable-all              Disable all security checks');
                console.log('  threshold <name> <value>  Set security threshold');
                console.log('  scope <scope> <mode>      Configure scope strictness');
                console.log('  preset <preset>           Apply security preset');
                console.log('  validate                  Validate configuration');
                console.log('  generate-vars             Generate GitHub variables');
                console.log('  generate-script           Generate setup script');
                console.log('  generate-docs             Generate documentation');
                console.log('');
                console.log('Examples:');
                console.log('  node scripts/security-config.js status');
                console.log('  node scripts/security-config.js enable sonarCloud');
                console.log('  node scripts/security-config.js preset strict');
                console.log('  node scripts/security-config.js threshold minCodeCoverage 85');
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

module.exports = SecurityConfigManager;
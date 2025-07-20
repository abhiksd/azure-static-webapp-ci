#!/usr/bin/env node

/**
 * Branch Protection Rule Manager
 * Configures GitHub branch protection rules with security gate integration
 */

const { Octokit } = require('@octokit/rest');

class BranchProtectionManager {
    constructor(token, owner, repo) {
        this.octokit = new Octokit({ auth: token });
        this.owner = owner;
        this.repo = repo;
        
        this.defaultRules = {
            main: {
                required_status_checks: {
                    strict: true,
                    contexts: [
                        'Security Gate',
                        'Quality Gate',
                        'SonarCloud Code Analysis',
                        'Checkmarx Security Scan',
                        'Dependency Security Scan'
                    ]
                },
                enforce_admins: false,
                required_pull_request_reviews: {
                    required_approving_review_count: 2,
                    dismiss_stale_reviews: true,
                    require_code_owner_reviews: true,
                    require_last_push_approval: true
                },
                restrictions: null,
                allow_force_pushes: false,
                allow_deletions: false,
                block_creations: false,
                required_conversation_resolution: true
            },
            develop: {
                required_status_checks: {
                    strict: true,
                    contexts: [
                        'Security Gate',
                        'Quality Gate',
                        'Dependency Security Scan'
                    ]
                },
                enforce_admins: false,
                required_pull_request_reviews: {
                    required_approving_review_count: 1,
                    dismiss_stale_reviews: false,
                    require_code_owner_reviews: false,
                    require_last_push_approval: false
                },
                restrictions: null,
                allow_force_pushes: false,
                allow_deletions: false,
                block_creations: false,
                required_conversation_resolution: true
            },
            'release/**': {
                required_status_checks: {
                    strict: true,
                    contexts: [
                        'Security Gate',
                        'Quality Gate',
                        'SonarCloud Code Analysis',
                        'Checkmarx Security Scan',
                        'Dependency Security Scan',
                        'License Compliance Check'
                    ]
                },
                enforce_admins: false,
                required_pull_request_reviews: {
                    required_approving_review_count: 2,
                    dismiss_stale_reviews: true,
                    require_code_owner_reviews: true,
                    require_last_push_approval: true
                },
                restrictions: null,
                allow_force_pushes: false,
                allow_deletions: false,
                block_creations: false,
                required_conversation_resolution: true
            }
        };
    }

    async getCurrentProtection(branch) {
        try {
            const { data } = await this.octokit.rest.repos.getBranchProtection({
                owner: this.owner,
                repo: this.repo,
                branch
            });
            return data;
        } catch (error) {
            if (error.status === 404) {
                return null; // No protection configured
            }
            throw error;
        }
    }

    async applyProtection(branch, rules = null) {
        const protection = rules || this.defaultRules[branch] || this.defaultRules.main;
        
        try {
            console.log(`🛡️ Applying protection rules to ${branch} branch...`);
            
            await this.octokit.rest.repos.updateBranchProtection({
                owner: this.owner,
                repo: this.repo,
                branch,
                ...protection
            });
            
            console.log(`✅ Protection rules applied to ${branch}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to apply protection to ${branch}:`, error.message);
            return false;
        }
    }

    async removeProtection(branch) {
        try {
            console.log(`🔓 Removing protection from ${branch} branch...`);
            
            await this.octokit.rest.repos.deleteBranchProtection({
                owner: this.owner,
                repo: this.repo,
                branch
            });
            
            console.log(`✅ Protection removed from ${branch}`);
            return true;
        } catch (error) {
            if (error.status === 404) {
                console.log(`ℹ️ No protection found on ${branch} branch`);
                return true;
            }
            console.error(`❌ Failed to remove protection from ${branch}:`, error.message);
            return false;
        }
    }

    async enableSecurityGate(branch) {
        const current = await this.getCurrentProtection(branch);
        
        if (!current) {
            console.log(`ℹ️ No protection rules found for ${branch}, applying defaults with security gate`);
            return await this.applyProtection(branch);
        }
        
        // Add security gate to required status checks
        const contexts = current.required_status_checks?.contexts || [];
        const securityContexts = [
            'Security Gate',
            'Quality Gate',
            'SonarCloud Code Analysis',
            'Checkmarx Security Scan',
            'Dependency Security Scan'
        ];
        
        const updatedContexts = [...new Set([...contexts, ...securityContexts])];
        
        const updatedRules = {
            ...current,
            required_status_checks: {
                strict: true,
                contexts: updatedContexts
            }
        };
        
        // Remove properties that can't be updated
        delete updatedRules.url;
        delete updatedRules.enabled;
        
        console.log(`🛡️ Adding security gate to ${branch} protection...`);
        return await this.applyProtection(branch, updatedRules);
    }

    async disableSecurityGate(branch) {
        const current = await this.getCurrentProtection(branch);
        
        if (!current) {
            console.log(`ℹ️ No protection rules found for ${branch}`);
            return true;
        }
        
        // Remove security gate from required status checks
        const contexts = current.required_status_checks?.contexts || [];
        const securityContexts = [
            'Security Gate',
            'Quality Gate',
            'SonarCloud Code Analysis',
            'Checkmarx Security Scan',
            'Dependency Security Scan',
            'License Compliance Check'
        ];
        
        const updatedContexts = contexts.filter(context => 
            !securityContexts.includes(context)
        );
        
        const updatedRules = {
            ...current,
            required_status_checks: updatedContexts.length > 0 ? {
                strict: current.required_status_checks?.strict || false,
                contexts: updatedContexts
            } : null
        };
        
        // Remove properties that can't be updated
        delete updatedRules.url;
        delete updatedRules.enabled;
        
        console.log(`🔓 Removing security gate from ${branch} protection...`);
        return await this.applyProtection(branch, updatedRules);
    }

    async configureEmergencyBypass(branch, enable = true) {
        const current = await this.getCurrentProtection(branch);
        
        if (!current) {
            console.log(`ℹ️ No protection rules found for ${branch}`);
            return false;
        }
        
        const updatedRules = {
            ...current,
            enforce_admins: !enable // Disable admin enforcement for emergency bypass
        };
        
        // Remove properties that can't be updated
        delete updatedRules.url;
        delete updatedRules.enabled;
        
        const action = enable ? 'Enabling' : 'Disabling';
        console.log(`🚨 ${action} emergency bypass for ${branch}...`);
        
        return await this.applyProtection(branch, updatedRules);
    }

    async addRequiredCheck(branch, checkName) {
        const current = await this.getCurrentProtection(branch);
        
        if (!current) {
            console.log(`ℹ️ No protection rules found for ${branch}, applying defaults`);
            const rules = { ...this.defaultRules[branch] || this.defaultRules.main };
            rules.required_status_checks.contexts.push(checkName);
            return await this.applyProtection(branch, rules);
        }
        
        const contexts = current.required_status_checks?.contexts || [];
        
        if (contexts.includes(checkName)) {
            console.log(`ℹ️ Check "${checkName}" already required for ${branch}`);
            return true;
        }
        
        const updatedRules = {
            ...current,
            required_status_checks: {
                strict: current.required_status_checks?.strict || true,
                contexts: [...contexts, checkName]
            }
        };
        
        // Remove properties that can't be updated
        delete updatedRules.url;
        delete updatedRules.enabled;
        
        console.log(`✅ Adding required check "${checkName}" to ${branch}...`);
        return await this.applyProtection(branch, updatedRules);
    }

    async removeRequiredCheck(branch, checkName) {
        const current = await this.getCurrentProtection(branch);
        
        if (!current) {
            console.log(`ℹ️ No protection rules found for ${branch}`);
            return true;
        }
        
        const contexts = current.required_status_checks?.contexts || [];
        const updatedContexts = contexts.filter(context => context !== checkName);
        
        const updatedRules = {
            ...current,
            required_status_checks: updatedContexts.length > 0 ? {
                strict: current.required_status_checks?.strict || false,
                contexts: updatedContexts
            } : null
        };
        
        // Remove properties that can't be updated
        delete updatedRules.url;
        delete updatedRules.enabled;
        
        console.log(`❌ Removing required check "${checkName}" from ${branch}...`);
        return await this.applyProtection(branch, updatedRules);
    }

    async listProtectionStatus() {
        console.log('\n🛡️ Branch Protection Status:');
        console.log('═'.repeat(50));
        
        const branches = ['main', 'develop'];
        
        for (const branch of branches) {
            try {
                const protection = await this.getCurrentProtection(branch);
                
                console.log(`\n📋 ${branch} branch:`);
                
                if (!protection) {
                    console.log('  ❌ No protection configured');
                    continue;
                }
                
                console.log('  ✅ Protection enabled');
                
                if (protection.required_pull_request_reviews) {
                    const reviews = protection.required_pull_request_reviews;
                    console.log(`  👥 Required reviews: ${reviews.required_approving_review_count}`);
                    console.log(`  📝 Code owner reviews: ${reviews.require_code_owner_reviews ? 'Required' : 'Not required'}`);
                    console.log(`  🔄 Dismiss stale reviews: ${reviews.dismiss_stale_reviews ? 'Yes' : 'No'}`);
                }
                
                if (protection.required_status_checks) {
                    console.log('  🔍 Required status checks:');
                    protection.required_status_checks.contexts.forEach(check => {
                        console.log(`    - ${check}`);
                    });
                    console.log(`  📊 Strict mode: ${protection.required_status_checks.strict ? 'Enabled' : 'Disabled'}`);
                }
                
                console.log(`  🚫 Force pushes: ${protection.allow_force_pushes ? 'Allowed' : 'Blocked'}`);
                console.log(`  🗑️ Deletions: ${protection.allow_deletions ? 'Allowed' : 'Blocked'}`);
                console.log(`  👨‍💼 Admin enforcement: ${protection.enforce_admins ? 'Enabled' : 'Disabled'}`);
                
            } catch (error) {
                console.log(`  ❌ Error checking ${branch}: ${error.message}`);
            }
        }
    }

    async setupDefaultProtection() {
        console.log('🛡️ Setting up default branch protection rules...');
        
        const results = [];
        
        for (const [branch, rules] of Object.entries(this.defaultRules)) {
            if (branch.includes('**')) {
                console.log(`ℹ️ Skipping pattern branch: ${branch}`);
                continue;
            }
            
            const result = await this.applyProtection(branch, rules);
            results.push({ branch, success: result });
        }
        
        const successful = results.filter(r => r.success).length;
        console.log(`\n✅ Applied protection to ${successful}/${results.length} branches`);
        
        return results;
    }

    async createSecurityPreset(preset) {
        const presets = {
            strict: {
                enforce_admins: true,
                required_pull_request_reviews: {
                    required_approving_review_count: 2,
                    dismiss_stale_reviews: true,
                    require_code_owner_reviews: true,
                    require_last_push_approval: true
                },
                required_status_checks: {
                    strict: true,
                    contexts: [
                        'Security Gate',
                        'Quality Gate',
                        'SonarCloud Code Analysis',
                        'Checkmarx Security Scan',
                        'Dependency Security Scan',
                        'License Compliance Check'
                    ]
                }
            },
            moderate: {
                enforce_admins: false,
                required_pull_request_reviews: {
                    required_approving_review_count: 1,
                    dismiss_stale_reviews: true,
                    require_code_owner_reviews: true,
                    require_last_push_approval: false
                },
                required_status_checks: {
                    strict: true,
                    contexts: [
                        'Security Gate',
                        'Quality Gate',
                        'Dependency Security Scan'
                    ]
                }
            },
            minimal: {
                enforce_admins: false,
                required_pull_request_reviews: {
                    required_approving_review_count: 1,
                    dismiss_stale_reviews: false,
                    require_code_owner_reviews: false,
                    require_last_push_approval: false
                },
                required_status_checks: {
                    strict: false,
                    contexts: ['Quality Gate']
                }
            }
        };
        
        return presets[preset] || presets.moderate;
    }
}

// CLI Interface
async function main() {
    const command = process.argv[2];
    const branch = process.argv[3];
    const arg3 = process.argv[4];
    
    // Get configuration from environment
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPOSITORY;
    
    if (!token) {
        console.error('❌ GITHUB_TOKEN environment variable is required');
        process.exit(1);
    }
    
    if (!repo) {
        console.error('❌ GITHUB_REPOSITORY environment variable is required');
        console.error('   Format: owner/repo');
        process.exit(1);
    }
    
    const [owner, repoName] = repo.split('/');
    if (!owner || !repoName) {
        console.error('❌ Invalid GITHUB_REPOSITORY format. Expected: owner/repo');
        process.exit(1);
    }
    
    const manager = new BranchProtectionManager(token, owner, repoName);
    
    try {
        switch (command) {
            case 'status':
                await manager.listProtectionStatus();
                break;
                
            case 'apply':
                if (!branch) {
                    console.error('Usage: node branch-protection.js apply <branch>');
                    process.exit(1);
                }
                await manager.applyProtection(branch);
                break;
                
            case 'remove':
                if (!branch) {
                    console.error('Usage: node branch-protection.js remove <branch>');
                    process.exit(1);
                }
                await manager.removeProtection(branch);
                break;
                
            case 'enable-security':
                if (!branch) {
                    console.error('Usage: node branch-protection.js enable-security <branch>');
                    process.exit(1);
                }
                await manager.enableSecurityGate(branch);
                break;
                
            case 'disable-security':
                if (!branch) {
                    console.error('Usage: node branch-protection.js disable-security <branch>');
                    process.exit(1);
                }
                await manager.disableSecurityGate(branch);
                break;
                
            case 'emergency-bypass':
                if (!branch) {
                    console.error('Usage: node branch-protection.js emergency-bypass <branch> <enable|disable>');
                    process.exit(1);
                }
                const enable = arg3 === 'enable';
                await manager.configureEmergencyBypass(branch, enable);
                break;
                
            case 'add-check':
                if (!branch || !arg3) {
                    console.error('Usage: node branch-protection.js add-check <branch> <checkName>');
                    process.exit(1);
                }
                await manager.addRequiredCheck(branch, arg3);
                break;
                
            case 'remove-check':
                if (!branch || !arg3) {
                    console.error('Usage: node branch-protection.js remove-check <branch> <checkName>');
                    process.exit(1);
                }
                await manager.removeRequiredCheck(branch, arg3);
                break;
                
            case 'setup':
                await manager.setupDefaultProtection();
                break;
                
            default:
                console.log('Branch Protection Rule Manager');
                console.log('');
                console.log('Commands:');
                console.log('  status                           Show protection status for all branches');
                console.log('  apply <branch>                   Apply default protection to branch');
                console.log('  remove <branch>                  Remove protection from branch');
                console.log('  enable-security <branch>         Enable security gate for branch');
                console.log('  disable-security <branch>        Disable security gate for branch');
                console.log('  emergency-bypass <branch> <on>   Configure emergency bypass');
                console.log('  add-check <branch> <check>       Add required status check');
                console.log('  remove-check <branch> <check>    Remove required status check');
                console.log('  setup                            Setup default protection for all branches');
                console.log('');
                console.log('Environment Variables:');
                console.log('  GITHUB_TOKEN                     GitHub personal access token');
                console.log('  GITHUB_REPOSITORY                Repository in owner/repo format');
                console.log('');
                console.log('Examples:');
                console.log('  node scripts/branch-protection.js status');
                console.log('  node scripts/branch-protection.js apply main');
                console.log('  node scripts/branch-protection.js enable-security main');
                console.log('  node scripts/branch-protection.js emergency-bypass main enable');
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

module.exports = BranchProtectionManager;
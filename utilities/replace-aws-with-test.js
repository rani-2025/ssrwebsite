#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Get microsite directory from command line argument
const micrositeDir = process.argv[2] || process.cwd();

const getFilesToUpdate = (baseDir) => [
    path.join(baseDir, 'node_modules/yoda-site-components/lib/components/Layout/Layout.jsx'),
    path.join(baseDir, 'node_modules/yoda-app-shell/lib/cdn/fetchServerComponentsJs.js'),
    path.join(baseDir, 'node_modules/yoda-app-shell/lib/cdn/fetchSiteVendorsFilename.js'),
    path.join(baseDir, 'node_modules/yoda-app-shell/lib/helpers/fetchWebpackChunks.js'),
    path.join(baseDir, 'node_modules/yoda-app-shell/lib/components/renderFullPage.jsx'),
];

const requiredFeatureFlags = {
    enableExternalComponent: true,
    enableExternalComponentDll: true,
    enableNetstorageStaticDelivery: false,
};

function replaceInFile(filePath) {
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.log(`❌ File not found: ${filePath}`);
            return false;
        }

        // Read file content
        const content = fs.readFileSync(filePath, 'utf8');

        // Replace 'aws' with 'test'
        const updatedContent = content.replace(/aws/g, 'test');

        // Only write if changes were made
        if (content !== updatedContent) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            console.log(`✅ Updated: ${filePath}`);
            return true;
        }
        console.log(`ℹ️  No changes needed: ${filePath}`);
        return false;
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        return false;
    }
}

function promptUser(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function updateSettingsJson(baseDir) {
    const settingsPath = path.join(baseDir, 'src/settings.json');

    try {
        if (!fs.existsSync(settingsPath)) {
            console.log(`❌ settings.json not found: ${settingsPath}`);
            return false;
        }

        let content = fs.readFileSync(settingsPath, 'utf8');

        // Fix common JSON issues
        content = content.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');

        const settings = JSON.parse(content);

        // Initialize featureFlags if it doesn't exist
        if (!settings.featureFlags) {
            settings.featureFlags = {};
        }

        // Initialize common if it doesn't exist
        if (!settings.featureFlags.common) {
            settings.featureFlags.common = {};
        }

        // Update feature flags
        Object.assign(settings.featureFlags.common, requiredFeatureFlags);

        // Initialize preferences if it doesn't exist
        if (!settings.preferences) {
            settings.preferences = {};
        }

        if (!settings.preferences.common) {
            settings.preferences.common = {};
        }

        // Prompt for prefetchcomponents
        console.log('\n📝 Enter prefetchcomponents configuration:');
        const att = (await promptUser('att (default: blue): ')) || 'blue';
        const filename =
            (await promptUser('filename (default: yoda-site-components): ')) ||
            'yoda-site-components';
        const root =
            (await promptUser('root (default: https://test.static-jcpenney.com): ')) ||
            'https://test.static-jcpenney.com';
        const version = (await promptUser('version (default: 1000.0.29): ')) || '1000.0.29';

        settings.preferences.common.prefetchcomponents = {
            att,
            filename,
            root,
            version,
        };
        
        // Initialize environments if it doesn't exist
        if (!settings.environments) {
            settings.environments = {};
        }
        
        if (!settings.environments.common) {
            settings.environments.common = {};
        }
        
        // Prompt for environment configuration
        console.log('\n🌍 Enter environment configuration:');
        const cluster = (await promptUser('cluster (default: integration3a): ')) || 'integration3a';
        const environment = (await promptUser('environment (default: te3): ')) || 'te3';
        const name = (await promptUser('name (default: te3): ')) || 'te3';
        
        // Update environments.common (avoid duplicates by overwriting)
        settings.environments.common.cluster = cluster;
        settings.environments.common.environment = environment;
        settings.environments.common.name = name;

        fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 4), 'utf8');
        console.log(`✅ Updated settings.json: ${settingsPath}`);
        return true;
    } catch (error) {
        console.error(`❌ Error updating settings.json:`, error.message);
        return false;
    }
}

async function main() {
    console.log(`🔄 Starting AWS to Test replacement for SSR in: ${micrositeDir}\n`);

    const filesToUpdate = getFilesToUpdate(micrositeDir);
    let updatedCount = 0;

    filesToUpdate.forEach((filePath) => {
        if (replaceInFile(filePath)) {
            updatedCount++;
        }
    });

    // Update settings.json
    if (await updateSettingsJson(micrositeDir)) {
        updatedCount++;
    }

    console.log(`\n✨ Process complete! Updated ${updatedCount} file(s).`);
}

// Run the script
main();

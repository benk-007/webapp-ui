const fs = require('fs');
const path = require('path');

// Read package.json
const packageJson = require(path.join(__dirname, '../package.json'));

// Extract version
const version = packageJson.version;

// Define content for version.ts
const versionFileContent = `export const APP_VERSION = '${version}';\n`;

// Write version.ts file to src/environments/
fs.writeFileSync(path.join(__dirname, 'src', 'environments', 'version.ts'), versionFileContent);

console.log(`✅ Application version ${version} written to version.ts`);
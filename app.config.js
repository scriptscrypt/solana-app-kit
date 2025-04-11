const fs = require('fs');
const path = require('path');

// Check if app.json.sample exists, and if so read it
let appConfig = {};
const appJsonSamplePath = path.resolve(__dirname, 'app.json.sample');
if (fs.existsSync(appJsonSamplePath)) {
  try {
    const sampleConfig = JSON.parse(fs.readFileSync(appJsonSamplePath, 'utf8'));
    appConfig = sampleConfig;
  } catch (error) {
    console.error('Error reading app.json.sample:', error);
  }
}

// Expo handles EXPO_PUBLIC_ variables automatically, so no custom logic needed here.

// Export the config
module.exports = ({ config }) => {
  return {
    ...appConfig,
    ...config,
    // Ensure any existing extra properties are preserved
    extra: {
      ...(config.extra || {}),
      ...(appConfig.extra || {}),
    },
  };
}; 
# Dev Mode

This document explains how to use the development mode features in the app, which allow the application to build and run even without all environment variables set.

## Enabling Dev Mode

Dev mode can be enabled by:

Use the `--dev` flag when starting the app (recommended):

   ```bash
   # For development with dev mode enabled
   yarn start --dev
   ```


### Recommended: Clear Cache When Switching Dev Mode

When switching between normal mode and dev mode, it's recommended to clear the cache (using --clear flag) to ensure all settings are properly applied:

```bash
# Start with dev mode and clear cache
yarn start --dev --clear
```

## Troubleshooting Dev Mode

If dev mode isn't activating properly:

1. Check that the app is truly running in development mode (`--dev` flag)
2. Verify your `.env.local` file contains `EXPO_PUBLIC_DEV_MODE=true` with no typos
3. Try restarting the Metro bundler completely (kill the process and restart)
4. Check the console logs for any errors related to environment variables
5. As a last resort, try clearing the cache manually:
   ```bash
   # Clear Expo cache
   expo start -c
   # Or clear Metro bundler cache
   yarn start --reset-cache
   ```

## What Dev Mode Does

When dev mode is enabled:

1. The app builds and runs even if required environment variables are missing
2. A green "DEV MODE" indicator appears at the bottom of the screen
3. A dev tools drawer is accessible by tapping the indicator
4. Features requiring missing environment variables will show warnings instead of crashing
5. Mock data is used when possible for features requiring missing environment variables

## Dev Mode Drawer

The dev mode drawer provides several useful utilities:

1. **Missing Environment Variables**: Shows a list of all missing environment variables that might be needed for full app functionality.
2. **App Navigation**: Allows direct navigation to any screen in the app without following normal navigation flows.
3. **Developer Info**: Shows environment, app version, and login status information.
4. **Force Login**: Allows bypassing authentication for testing protected features.

## Environment Variable Handling

In dev mode, when the app encounters a missing environment variable:

1. The user sees an alert notification that the variable is missing
2. The app continues to run with mock data where possible
3. A warning is logged to the console
4. The missing variable is displayed in the dev drawer

## Implementing Dev Mode in Your Code

If you're adding new features that require environment variables, use the `getEnvWithFallback` function:

```typescript
import {getEnvWithFallback} from '../utils/envValidator';

// Basic usage with default empty string fallback
const apiKey = getEnvWithFallback('API_KEY', API_KEY, 'Feature Name', '');

// With a specific mock value
const apiUrl = getEnvWithFallback(
  'API_URL',
  API_URL,
  'Feature Name',
  'https://mock-api.example.com',
);

// Handle missing values
if (!apiKey && global.__DEV_MODE__) {
  console.log('[DEV MODE] Using mock implementation for Feature Name');
  // Implement mock version of the feature
  return mockData;
}

// Continue with normal implementation when variable exists
```

## Best Practices

1. Always include meaningful feature names when calling `getEnvWithFallback` to help users understand which functionality is affected.
2. Provide appropriate mock data for development.
3. Use `global.__DEV_MODE__` to check if dev mode is active elsewhere in your code.
4. Keep error messages helpful and informative.
5. Use the `--clear` flag when switching between normal and dev modes to avoid caching issues.

## Important Note

Dev mode is strictly for development purposes and should never be enabled in production. The mock data and behavior are intended to facilitate development only.

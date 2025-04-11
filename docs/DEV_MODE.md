# Dev Mode

This document explains how to use the development mode features in the app, which allow the application to build and run even without all environment variables set.

## Enabling Dev Mode

Dev mode can be enabled in one of two ways:

1. Add this line to your `.env.local` file:

   ```
   EXPO_PUBLIC_DEV_MODE=true
   ```

2. Set the environment variable when running the app:

   ```bash
   # For development
   EXPO_PUBLIC_DEV_MODE=true yarn start

   # Or for running on iOS
   EXPO_PUBLIC_DEV_MODE=true yarn ios

   # Or for running on Android
   EXPO_PUBLIC_DEV_MODE=true yarn android
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

## Important Note

Dev mode is strictly for development purposes and should never be enabled in production. The mock data and behavior are intended to facilitate development only.

# Developer Mode Module

The Developer Mode module provides components and utilities for enabling development and debugging features in the application. This module is intended for use during development and testing phases.

## Components

- **DevDrawer**: A drawer component that shows development options and debugging tools
- **DevModeActivator**: Component for activating and deactivating developer mode
- **DevModeStatusBar**: Status indicator showing when developer mode is active
- **DevModeTrigger**: Trigger component to open the developer drawer
- **DevModeWrapper**: Wrapper component that provides developer mode context to child components

## Usage

```typescript
import {DevDrawer, DevModeActivator, DevModeWrapper} from '@core/devMode';

function App() {
  return (
    <DevModeWrapper>
      <MainApp />
      <DevDrawer />
      <DevModeActivator />
    </DevModeWrapper>
  );
}
```

## Features

- Environment variable inspection
- Performance monitoring
- API request logging
- State inspection
- Feature flag toggling

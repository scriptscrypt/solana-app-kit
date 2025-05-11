# Profile Module

The Profile module provides functionality for user profiles, including display, editing, and interaction features. It contains components for rendering profile information, hooks for profile data management, and services for profile-related API interactions.

## Structure

- **components**: UI components for profile functionality

  - **CoinDetails**: Components for displaying token and coin information
  - **ProfileEditDrawer**: Profile editing interface
  - **ProfileInfo**: Profile display components
  - **ProfileTabs**: Tab navigation for profile sections
  - **actions**: Action components for profile interactions
  - **addButton**: Button components for adding content
  - **buyCard**: Components for token purchase
  - **collectibles**: NFT and collectible display components

- **hooks**: Custom hooks for profile data and state management

- **services**: Services for profile data retrieval and manipulation

- **types**: TypeScript type definitions for profile-related data

- **utils**: Helper functions for profile data formatting and processing

## Usage

Import components and utilities from the profile module:

```typescript
import {ProfileInfo, ProfileEditDrawer, useProfileData} from '@core/profile';
```

## Integration

The Profile module integrates with:

- Authentication system for user data
- Wallet providers for token information
- NFT modules for collectible display
- Thread module for user content

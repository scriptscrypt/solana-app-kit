# Chat Module

The Chat Module provides messaging and communication capabilities for the application. It includes components for rendering chat interfaces, services for managing message data, and utilities for formatting and processing chat-related content.

## Structure

- **components**: UI components for chat functionality

  - **agentic-chat**: Components related to AI-assisted chat features
  - **chat-composer**: Message input and composition components
  - **message**: Message display and rendering components

- **services**: Backend services for chat functionality

  - Message retrieval, sending, and management
  - Real-time synchronization

- **utils**: Helper functions for chat-related operations
  - Message formatting
  - Time and date handling
  - Data validation

## Usage

Import components and utilities from the chat module:

```typescript
import {MessageBubble, ChatComposer} from '@core/chat';
```

## Integration with other modules

The Chat module integrates with the Profile module for user information and with authentication services for secure messaging.

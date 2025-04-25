// Add TypeScript declarations for global objects
declare global {
  interface Window {
    fs: any;
  }
  interface Global {
    ReadableStream: any;
    WritableStream: any;
    TransformStream: any;
  }
}

// Polyfill for structuredClone
if (typeof global.structuredClone !== 'function') {
  global.structuredClone = function structuredClone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  };
}

// Polyfill ReadableStream and WritableStream for AI SDK
if (typeof global.ReadableStream === 'undefined') {
  // Simple stub implementations that will allow the code to run
  class MockReadableStream {
    constructor(source?: any) {
      // Minimal implementation
    }
    
    getReader() {
      return {
        read: async () => ({ done: true, value: undefined }),
        releaseLock: () => {},
        cancel: async () => {},
      };
    }
  }
  
  class MockWritableStream {
    constructor(sink?: any) {
      // Minimal implementation
    }
    
    getWriter() {
      return {
        write: async () => {},
        close: async () => {},
        abort: async () => {},
        releaseLock: () => {},
      };
    }
  }
  
  class MockTransformStream {
    constructor(transformer?: any) {
      this.readable = new MockReadableStream();
      this.writable = new MockWritableStream();
    }
    
    readable: typeof MockReadableStream.prototype;
    writable: typeof MockWritableStream.prototype;
  }
  
  // Assign to global
  (global as any).ReadableStream = MockReadableStream;
  (global as any).WritableStream = MockWritableStream;
  (global as any).TransformStream = MockTransformStream;
  
  console.log('Polyfilled ReadableStream and WritableStream for AI SDK compatibility');
}

// Ensure TextEncoder and TextDecoder are available
if (typeof global.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('text-encoding');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
  console.log('Polyfilled TextEncoder and TextDecoder');
}

// Ensure Buffer is available globally (if not already)
if (typeof global.Buffer === 'undefined') {
  global.Buffer = require('buffer').Buffer;
  console.log('Polyfilled Buffer');
}

// Mock fs module for React Native environment
const mockFs = {
  readFileSync: () => {
    throw new Error('fs.readFileSync is not supported in React Native');
  },
  writeFileSync: () => {
    throw new Error('fs.writeFileSync is not supported in React Native');
  },
  promises: {
    readFile: async () => {
      throw new Error('fs.promises.readFile is not supported in React Native');
    },
    writeFile: async () => {
      throw new Error('fs.promises.writeFile is not supported in React Native');
    },
  },
};

// Assign to global
(global as any).fs = mockFs;

// Export the polyfill functions for explicit importing where needed
export function ensureBuffer() {
  // This is now handled by the global Buffer check above
  return global.Buffer !== undefined;
}

export {};

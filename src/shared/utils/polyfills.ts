// Add TypeScript declarations for global objects
declare global {
  interface Window {
    fs: any;
  }
}

// Polyfill for structuredClone
if (typeof global.structuredClone !== 'function') {
  global.structuredClone = function structuredClone(obj: any) {
    return JSON.parse(JSON.stringify(obj));
  };
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

export {};

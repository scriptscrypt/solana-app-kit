import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Declare global __DEV_MODE__ to avoid TypeScript errors
declare global {
    var __DEV_MODE__: boolean;
}

interface DevModeContextType {
    isDevMode: boolean;
    toggleDevDrawer: () => void;
    isDevDrawerOpen: boolean;
}

const DevModeContext = createContext<DevModeContextType | undefined>(undefined);

interface DevModeProviderProps {
    children: ReactNode;
}

export function DevModeProvider({ children }: DevModeProviderProps) {
    // Start with the environment variable value
    const [isDevMode, setIsDevMode] = useState(process.env.EXPO_PUBLIC_DEV_MODE === 'true');
    const [isDevDrawerOpen, setIsDevDrawerOpen] = useState(false);

    useEffect(() => {
        const checkDevMode = async () => {
            try {
                console.log('[DEV MODE] Checking dev mode status...');

                // The most reliable source is the environment variable passed at startup
                const envDevMode = process.env.EXPO_PUBLIC_DEV_MODE === 'true';
                console.log('[DEV MODE] From process.env.EXPO_PUBLIC_DEV_MODE:', process.env.EXPO_PUBLIC_DEV_MODE);

                // Set the dev mode state based on environment variable
                setIsDevMode(envDevMode);

                // Update global flag for access elsewhere in the app
                global.__DEV_MODE__ = envDevMode;

                // Store setting in AsyncStorage for persistence
                if (envDevMode) {
                    await AsyncStorage.setItem('devMode', 'true');
                    console.log('[DEV MODE] Persisted to storage');
                } else {
                    await AsyncStorage.removeItem('devMode');
                    console.log('[DEV MODE] Cleared persisted dev mode setting');
                }

                console.log(`[DEV MODE] Final status: ${envDevMode ? 'ENABLED' : 'DISABLED'}`);
            } catch (error) {
                console.error('[DEV MODE] Error checking dev mode:', error);
                setIsDevMode(false);
                global.__DEV_MODE__ = false;
            }
        };

        checkDevMode();
    }, []);

    const toggleDevDrawer = () => {
        console.log('Toggling dev drawer');
        setIsDevDrawerOpen((prev) => !prev);
    };

    return (
        <DevModeContext.Provider
            value={{
                isDevMode,
                toggleDevDrawer,
                isDevDrawerOpen,
            }}
        >
            {children}
        </DevModeContext.Provider>
    );
}

// Hook to use the DevMode context
export function useDevMode() {
    const context = useContext(DevModeContext);
    if (context === undefined) {
        throw new Error('useDevMode must be used within a DevModeProvider');
    }
    return context;
} 
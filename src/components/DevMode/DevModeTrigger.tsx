import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDevMode } from '../../context/DevModeContext';

const DevModeTrigger = () => {
    const { isDevMode, toggleDevDrawer } = useDevMode();
    const insets = useSafeAreaInsets();
    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        console.log('DevModeTrigger - isDevMode:', isDevMode);
    }, [isDevMode]);

    // Only render in dev mode - return null otherwise
    if (!isDevMode) {
        console.log('DevModeTrigger - Not rendering (dev mode is OFF)');
        return null;
    }

    console.log('DevModeTrigger - Rendering dev mode indicator');

    // Position the indicator at the very bottom, accounting for home indicator
    const bottomPadding = Platform.OS === 'ios'
        ? Math.max(insets.bottom - 20, 0) // Lower on iOS, almost at the home indicator
        : 0; // At the very bottom on Android

    return (
        <TouchableOpacity
            style={[
                styles.container,
                { bottom: bottomPadding }
            ]}
            activeOpacity={0.8}
            onPress={toggleDevDrawer}
        >
            <View style={styles.line}>
                <Text style={styles.text}>DEV MODE</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignSelf: 'center',
        width: '60%',
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999, // Ensure it's above everything
        elevation: 9999,
    },
    line: {
        width: '100%',
        height: 20,
        backgroundColor: 'rgba(0, 230, 118, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    text: {
        fontSize: 10,
        color: '#000',
        fontWeight: 'bold',
    }
});

export default DevModeTrigger; 
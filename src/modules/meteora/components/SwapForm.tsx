import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';
import { executeTrade } from '../services/meteoraService';
import { MeteoraTrade } from '../types';
import { Connection } from '@solana/web3.js';
import { useWallet } from '@/modules/walletProviders/hooks/useWallet';

interface SwapFormProps {
    defaultInputToken?: string;
    defaultOutputToken?: string;
    defaultAmount?: string;
    onSwapComplete?: (txId: string) => void;
}

export default function SwapForm({
    defaultInputToken = 'So11111111111111111111111111111111111111112', // SOL
    defaultOutputToken = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
    defaultAmount = '',
    onSwapComplete,
}: SwapFormProps) {
    const [inputToken, setInputToken] = useState(defaultInputToken);
    const [outputToken, setOutputToken] = useState(defaultOutputToken);
    const [amount, setAmount] = useState(defaultAmount);
    const [slippage, setSlippage] = useState(0.5); // 0.5% default slippage
    const [isLoading, setIsLoading] = useState(false);
    const [estimatedOutput, setEstimatedOutput] = useState('0');
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    // Get wallet and connection
    const wallet = useWallet();
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');

    // The pool address would typically come from the context or be fetched based on the token pair
    // For now, we'll hardcode a mock pool address
    const poolAddress = 'pool1';

    // Simulate price calculation whenever amount or tokens change
    useEffect(() => {
        if (!amount || parseFloat(amount) <= 0) {
            setEstimatedOutput('0');
            return;
        }

        // Mock price calculation - would be replaced with actual API call
        const mockExchangeRate = 10.5; // 1 SOL = 10.5 USDC
        const calculatedOutput = (parseFloat(amount) * mockExchangeRate).toFixed(6);
        setEstimatedOutput(calculatedOutput);
    }, [amount, inputToken, outputToken]);

    const handleSwap = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        try {
            setError('');
            setIsLoading(true);

            // Show confirmation dialog
            Alert.alert(
                "Confirm Swap",
                `You are about to swap ${amount} SOL for approximately ${estimatedOutput} USDC with ${slippage}% slippage.`,
                [
                    {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => {
                            setIsLoading(false);
                        }
                    },
                    {
                        text: "Confirm",
                        onPress: async () => {
                            try {
                                setStatusMessage('Preparing swap...');

                                const tradeParams: MeteoraTrade = {
                                    inputToken,
                                    outputToken,
                                    amount,
                                    slippage
                                };

                                const result = await executeTrade(
                                    tradeParams,
                                    poolAddress,
                                    connection,
                                    wallet,
                                    setStatusMessage
                                );

                                console.log('Swap completed:', result);
                                if (onSwapComplete) {
                                    onSwapComplete(result.txId);
                                }

                                // Clear input amount after successful swap
                                setAmount('');
                            } catch (err) {
                                console.error('Swap error:', err);
                                setError('Failed to execute swap. Please try again.');
                            } finally {
                                setIsLoading(false);
                                setStatusMessage('');
                            }
                        }
                    }
                ]
            );
        } catch (err) {
            console.error('Swap preparation error:', err);
            setError('Failed to prepare swap. Please try again.');
            setIsLoading(false);
        }
    };

    const handleSlippageChange = (value: number) => {
        setSlippage(value);
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Swap Tokens</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>From</Text>
                    <View style={styles.tokenInputContainer}>
                        <TextInput
                            style={styles.input}
                            value={amount}
                            onChangeText={setAmount}
                            placeholder="0.0"
                            placeholderTextColor={COLORS.greyDark}
                            keyboardType="numeric"
                        />
                        <TouchableOpacity style={styles.tokenButton}>
                            <Text style={styles.tokenButtonText}>SOL</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity style={styles.switchButton}>
                    <Text style={styles.switchIcon}>↑↓</Text>
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>To (Estimated)</Text>
                    <View style={styles.tokenInputContainer}>
                        <Text style={styles.estimatedOutput}>{estimatedOutput}</Text>
                        <TouchableOpacity style={styles.tokenButton}>
                            <Text style={styles.tokenButtonText}>USDC</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.slippageContainer}>
                    <Text style={styles.slippageLabel}>Slippage Tolerance</Text>
                    <View style={styles.slippageButtonContainer}>
                        {[0.1, 0.5, 1, 2].map((value) => (
                            <TouchableOpacity
                                key={value}
                                style={[
                                    styles.slippageButton,
                                    slippage === value && styles.slippageButtonActive
                                ]}
                                onPress={() => handleSlippageChange(value)}
                            >
                                <Text
                                    style={[
                                        styles.slippageButtonText,
                                        slippage === value && styles.slippageButtonTextActive
                                    ]}
                                >
                                    {value}%
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                    style={styles.swapButtonContainer}
                    onPress={handleSwap}
                    disabled={isLoading}
                >
                    <LinearGradient
                        colors={['#32D4DE', '#B591FF']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.swapButtonGradient}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={COLORS.white} />
                        ) : (
                            <Text style={styles.swapButtonText}>Swap</Text>
                        )}
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    card: {
        backgroundColor: COLORS.lighterBackground,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: TYPOGRAPHY.size.xl,
        fontWeight: TYPOGRAPHY.weights.semiBold,
        color: COLORS.white,
        marginBottom: 24,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.greyMid,
        marginBottom: 8,
    },
    tokenInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.darkerBackground,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 4,
        height: 56,
    },
    input: {
        flex: 1,
        height: 50,
        color: COLORS.white,
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weights.medium,
    },
    estimatedOutput: {
        flex: 1,
        color: COLORS.white,
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.weights.medium,
    },
    tokenButton: {
        backgroundColor: COLORS.background,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.borderDarkColor,
    },
    tokenButtonText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weights.semiBold,
    },
    switchButton: {
        alignSelf: 'center',
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: COLORS.darkerBackground,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: -8,
        zIndex: 1,
        borderWidth: 1,
        borderColor: COLORS.borderDarkColor,
    },
    switchIcon: {
        color: COLORS.brandPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
    slippageContainer: {
        marginTop: 24,
        marginBottom: 16,
    },
    slippageLabel: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.greyMid,
        marginBottom: 8,
    },
    slippageButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    slippageButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        backgroundColor: COLORS.darkerBackground,
        borderWidth: 1,
        borderColor: COLORS.borderDarkColor,
    },
    slippageButtonActive: {
        backgroundColor: COLORS.brandPrimary,
        borderColor: COLORS.brandPrimary,
    },
    slippageButtonText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weights.medium,
    },
    slippageButtonTextActive: {
        color: COLORS.black,
        fontWeight: TYPOGRAPHY.weights.semiBold,
    },
    errorText: {
        color: COLORS.errorRed,
        fontSize: TYPOGRAPHY.size.sm,
        marginVertical: 8,
        textAlign: 'center',
    },
    swapButtonContainer: {
        marginTop: 24,
        overflow: 'hidden',
        borderRadius: 12,
    },
    swapButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
        borderRadius: 12,
    },
    swapButtonText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weights.bold,
    },
}); 
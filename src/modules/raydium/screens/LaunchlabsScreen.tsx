import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';

import { useAuth } from '../../walletProviders/hooks/useAuth';
import { useWallet } from '../../walletProviders/hooks/useWallet';
import { useAppSelector } from '@/shared/hooks/useReduxHooks';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';
import LaunchlabsLaunchSection, { TokenData } from '../components/LaunchlabsLaunchSection';
import { AdvancedOptionsSection } from '../components/AdvancedOptionsSection';
import { AppHeader } from '@/core/sharedUI';
import { RaydiumService, LaunchpadConfigData } from '../services/raydiumService';
import { CLUSTER, HELIUS_STAKED_URL } from '@env';
import { ENDPOINTS } from '@/config/constants';
import { Buffer } from 'buffer';
import { TransactionService } from '../../walletProviders/services/transaction/transactionService';

export default function LaunchlabsScreen() {
    const { solanaWallet } = useAuth();
    const { sendTransaction, publicKey: walletPublicKey, connected, address: walletAddress } = useWallet();
    const myWallet = useAppSelector(state => state.auth.address);
    const navigation = useNavigation();
    
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
    const [tokenData, setTokenData] = useState<TokenData | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    
    const mountedRef = useRef(true);
    
    // Clean up on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);
    
    // Function to check if component is still mounted
    const isComponentMounted = useCallback(() => {
        return mountedRef.current;
    }, []);

    // Make sure we use the exact same wallet address in all places
    // Use the wallet's address directly when available
    const userPublicKey = walletPublicKey?.toString() || walletAddress || myWallet || null;
    
    // Enhanced sendTransaction wrapper for Raydium service
    const handleSendTransaction = useCallback(async (base64Transaction: string) => {
        if (!userPublicKey || !connected || !walletPublicKey) {
            throw new Error('Wallet not connected');
        }
        
        try {
            // Decode the base64 transaction
            const txBuffer = Buffer.from(base64Transaction, 'base64');
            
            // Get RPC URL from env vars or constants
            const rpcUrl = HELIUS_STAKED_URL || ENDPOINTS.helius || `https://api.${CLUSTER}.solana.com`;
            const connection = new Connection(rpcUrl, 'confirmed');
            
            // Always try to deserialize as a VersionedTransaction first
            let transaction: Transaction | VersionedTransaction;
            
            try {
                // Deserialize as a VersionedTransaction (V0)
                transaction = VersionedTransaction.deserialize(new Uint8Array(txBuffer));
                console.log('[LaunchlabsScreen] Successfully deserialized as VersionedTransaction');
                
                // For VersionedTransaction, we need to pass it directly without modifying
                // The wallet adapter will handle the signing
            } catch (e) {
                console.log('[LaunchlabsScreen] Failed to deserialize as VersionedTransaction, trying legacy format');
                
                // If that fails, try to deserialize as a legacy Transaction
                transaction = Transaction.from(txBuffer);
                
                // For Legacy transaction, set the fee payer
                transaction.feePayer = walletPublicKey;
                
                // Get a recent blockhash
                const { blockhash } = await connection.getLatestBlockhash('confirmed');
                transaction.recentBlockhash = blockhash;
            }
            
            // Log transaction details for debugging
            console.log('[LaunchlabsScreen] Transaction type:', transaction instanceof VersionedTransaction ? 'Versioned' : 'Legacy');
            
            // Send the transaction
            const signature = await sendTransaction(
                transaction,
                connection,
                {
                    statusCallback: (status) => {
                        if (mountedRef.current) {
                            TransactionService.filterStatusUpdate(status, (filteredStatus) => {
                                setStatus(filteredStatus);
                            });
                        }
                    },
                    confirmTransaction: true
                }
            );
            
            // Show success notification
            if (mountedRef.current) {
                TransactionService.showSuccess(signature, 'token');
            }
            
            return signature;
        } catch (error) {
            console.error('[LaunchlabsScreen] Transaction send error:', error);
            throw error;
        }
    }, [userPublicKey, connected, walletPublicKey, sendTransaction]);

    const handleBack = useCallback(() => {
        if (showAdvancedOptions) {
            // Go back to the initial screen
            setShowAdvancedOptions(false);
            setTokenData(null);
        } else {
            navigation.goBack();
        }
    }, [navigation, showAdvancedOptions]);

    const handleGoToLab = useCallback((data: TokenData) => {
        setTokenData(data);
        setShowAdvancedOptions(true);
    }, []);

    // Handle JustSendIt mode - create token with standard settings
    const handleJustSendIt = useCallback(async (data: TokenData) => {
        if (!userPublicKey) {
            Alert.alert('Error', 'Please connect your wallet first');
            return;
        }
        
        // Check if wallet is connected
        if (!connected) {
            Alert.alert('Error', 'Please connect your wallet to continue');
            return;
        }
        
        setTokenData(data);
        setLoading(true);
        setStatus('Creating token with JustSendIt...');
        
        try {
            // Create a PublicKey from the string - make sure it's valid
            if (!PublicKey.isOnCurve(new PublicKey(userPublicKey))) {
                throw new Error('Invalid wallet public key');
            }
            
            const userWalletPublicKey = new PublicKey(userPublicKey);
            
            // Create default configuration for JustSendIt mode (standard settings)
            // According to Raydium docs, JustSendIt uses standard bonding curve settings
            const defaultConfig: LaunchpadConfigData = {
                quoteTokenMint: 'So11111111111111111111111111111111111111112', // SOL
                tokenSupply: '1000000000', // 1 billion tokens
                solRaised: '85', // 85 SOL threshold for migrating to AMM pool
                bondingCurvePercentage: '70', // Raydium standard is 50% of tokens on curve
                poolMigration: '30', // Threshold in SOL
                vestingPercentage: '0', // No vesting in JustSendIt mode
                mode: 'justSendIt' // Set mode to justSendIt
            };
            
            // Call the RaydiumService to create the token with standard settings
            const result = await RaydiumService.createAndLaunchToken(
                {
                    name: data.name,
                    symbol: data.symbol,
                    description: data.description || '',
                    image: data.imageUri || undefined,
                    twitter: data.twitter,
                    telegram: data.telegram,
                    website: data.website
                },
                defaultConfig,
                userWalletPublicKey,
                handleSendTransaction,
                {
                    statusCallback: setStatus,
                    isComponentMounted
                }
            );
            
            if (result.success) {
                Alert.alert(
                    'Success',
                    `Token created with JustSendIt!\nToken address: ${result.mintAddress}\nPool ID: ${result.poolId}`,
                    [{
                        text: 'OK',
                        onPress: () => {
                            // Reset the form
                            setTokenData(null);
                        }
                    }]
                );
            } else {
                Alert.alert('Error', result.error?.toString() || 'Failed to create token');
            }
        } catch (error: any) {
            console.error('JustSendIt error:', error);
            Alert.alert('Error', error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
            setStatus(null);
        }
    }, [userPublicKey, isComponentMounted, connected, handleSendTransaction]);

    // Handle token creation with custom parameters (LaunchLab mode)
    const handleCreateToken = useCallback(async (configData: LaunchpadConfigData) => {
        if (!tokenData || !userPublicKey) {
            Alert.alert('Error', 'Missing required data to create token');
            return;
        }
        
        // Check if wallet is connected
        if (!connected) {
            Alert.alert('Error', 'Please connect your wallet to continue');
            return;
        }
        
        setLoading(true);
        setStatus('Creating token with LaunchLab...');
        
        try {
            // Create a PublicKey from the string - make sure it's valid
            if (!PublicKey.isOnCurve(new PublicKey(userPublicKey))) {
                throw new Error('Invalid wallet public key');
            }
            
            const userWalletPublicKey = new PublicKey(userPublicKey);
            
            // Set the mode to launchLab for custom settings
            const fullConfigData: LaunchpadConfigData = {
                ...configData,
                mode: 'launchLab' as 'justSendIt' | 'launchLab'
            };
            
            // Call the RaydiumService to create the token with custom settings
            const result = await RaydiumService.createAndLaunchToken(
                {
                    name: tokenData.name,
                    symbol: tokenData.symbol,
                    description: tokenData.description || '',
                    image: tokenData.imageUri || undefined,
                    twitter: tokenData.twitter,
                    telegram: tokenData.telegram,
                    website: tokenData.website
                },
                fullConfigData,
                userWalletPublicKey,
                handleSendTransaction,
                {
                    statusCallback: setStatus,
                    isComponentMounted
                }
            );
            
            if (result.success) {
                Alert.alert(
                    'Success',
                    `Token created with LaunchLab!\nToken address: ${result.mintAddress}\nPool ID: ${result.poolId}`,
                    [{
                        text: 'OK',
                        onPress: () => {
                            // Reset the form and go back to the first screen
                            setShowAdvancedOptions(false);
                            setTokenData(null);
                        }
                    }]
                );
            } else {
                Alert.alert('Error', result.error?.toString() || 'Failed to create token');
            }
        } catch (error: any) {
            console.error('LaunchLab error:', error);
            Alert.alert('Error', error.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
            setStatus(null);
        }
    }, [tokenData, userPublicKey, isComponentMounted, connected, handleSendTransaction]);

    if (!userPublicKey) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <AppHeader
                    title="LaunchLab"
                    showBackButton={true}
                    onBackPress={handleBack}
                    showDefaultRightIcons={true}
                />
                <View style={styles.centeredMessageContainer}>
                    <Text style={styles.warnText}>Please connect your wallet first!</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <AppHeader
                title="LaunchLab"
                showBackButton={true}
                onBackPress={handleBack}
                showDefaultRightIcons={true}
            />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>
                    {showAdvancedOptions ? "Configure token options" : "Launch a token via Raydium"}
                </Text>

                {loading && status && (
                    <View style={styles.statusContainer}>
                        <ActivityIndicator size="small" color={COLORS.brandBlue} style={styles.loader} />
                        <Text style={styles.statusText}>{status}</Text>
                    </View>
                )}

                {!showAdvancedOptions ? (
                    <LaunchlabsLaunchSection
                        containerStyle={styles.cardContainer}
                        inputStyle={styles.input}
                        buttonStyle={styles.button}
                        launchButtonLabel="Launch on Raydium"
                        onGoToLab={handleGoToLab}
                        onJustSendIt={handleJustSendIt}
                    />
                ) : (
                    <AdvancedOptionsSection
                        containerStyle={styles.cardContainer}
                        onCreateToken={handleCreateToken}
                        onBack={handleBack}
                        isLoading={loading}
                        tokenName={tokenData?.name}
                        tokenSymbol={tokenData?.symbol}
                    />
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 40,
    },
    centeredMessageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    warnText: {
        fontSize: TYPOGRAPHY.size.lg,
        color: COLORS.white,
        textAlign: 'center',
        fontFamily: TYPOGRAPHY.fontFamily,
    },
    sectionTitle: {
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
        color: COLORS.white,
        marginBottom: 16,
        fontFamily: TYPOGRAPHY.fontFamily,
        alignSelf: 'center',
    },
    cardContainer: {
        backgroundColor: COLORS.background,
        padding: 10,
        borderRadius: 12,
        marginBottom: 20,
    },
    input: {
        backgroundColor: 'transparent',
        color: COLORS.white,
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: TYPOGRAPHY.size.md,
        borderWidth: 1.5,
        borderColor: COLORS.borderDarkColor,
        marginBottom: 12,
        fontFamily: TYPOGRAPHY.fontFamily,
    },
    button: {
        backgroundColor: COLORS.brandBlue,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.lighterBackground,
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    loader: {
        marginRight: 10,
    },
    statusText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.size.sm,
        fontFamily: TYPOGRAPHY.fontFamily,
    },
}); 
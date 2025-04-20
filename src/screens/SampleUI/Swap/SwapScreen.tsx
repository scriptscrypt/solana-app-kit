import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { PublicKey } from '@solana/web3.js';

import { styles } from './SwapScreen.styles';
import COLORS from '@/assets/colors';
import SelectTokenModal from './SelectTokenModal';
import { useWallet } from '@/modules/walletProviders/hooks/useWallet';
import { 
  TokenInfo,
  DEFAULT_SOL_TOKEN, 
  DEFAULT_USDC_TOKEN, 
  fetchTokenBalance, 
  fetchTokenPrice,
  ensureCompleteTokenInfo,
  estimateTokenUsdValue
} from '@/modules/dataModule';
import { TradeService } from '@/modules/dataModule/services/tradeService';

// Swap providers
const swapProviders = ['Rayduim', 'Pumpswap', 'Jupiter'];

export default function SwapScreen() {
  const navigation = useNavigation();
  const { publicKey: userPublicKey, connected, sendTransaction } = useWallet();
  
  // UI States
  const [activeProvider, setActiveProvider] = useState('Rayduim');
  const [inputValue, setInputValue] = useState('5');
  const [showSelectTokenModal, setShowSelectTokenModal] = useState(false);
  const [selectingWhichSide, setSelectingWhichSide] = useState<'input' | 'output'>('input');
  
  // Token States
  const [inputToken, setInputToken] = useState<TokenInfo>(DEFAULT_SOL_TOKEN);
  const [outputToken, setOutputToken] = useState<TokenInfo>(DEFAULT_USDC_TOKEN);
  const [tokensInitialized, setTokensInitialized] = useState(false);
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [currentTokenPrice, setCurrentTokenPrice] = useState<number | null>(null);
  const [estimatedOutputAmount, setEstimatedOutputAmount] = useState<string>('');
  
  // Transaction States
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  
  // Refs
  const isMounted = useRef(true);
  const pendingTokenOps = useRef<{ input: boolean, output: boolean }>({ input: false, output: false });

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      pendingTokenOps.current = { input: false, output: false };
    };
  }, []);

  // Initialize tokens with details
  const initializeTokens = useCallback(async () => {
    if (!isMounted.current || (pendingTokenOps.current.input && pendingTokenOps.current.output)) {
      return;
    }

    try {
      pendingTokenOps.current = { input: true, output: true };
      console.log('[SwapScreen] Initializing tokens...');

      const completeInputToken = await ensureCompleteTokenInfo(DEFAULT_SOL_TOKEN);
      const completeOutputToken = await ensureCompleteTokenInfo(DEFAULT_USDC_TOKEN);

      if (isMounted.current) {
        setInputToken(completeInputToken);
        setOutputToken(completeOutputToken);
        pendingTokenOps.current = { input: false, output: false };
        setTokensInitialized(true);

        // Fetch balance and price
        if (userPublicKey) {
          fetchTokenBalance(userPublicKey, completeInputToken).then(balance => {
            if (isMounted.current && balance !== null) {
              setCurrentBalance(balance);
              fetchTokenPrice(completeInputToken).then(price => {
                if (isMounted.current && price !== null) {
                  setCurrentTokenPrice(price);
                }
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('[SwapScreen] Error initializing tokens:', error);
      pendingTokenOps.current = { input: false, output: false };
    }
  }, [userPublicKey]);

  // Initialize tokens on component mount
  useEffect(() => {
    if (!tokensInitialized) {
      initializeTokens();
    }
  }, [tokensInitialized, initializeTokens]);

  // Fetch token balance
  const fetchBalance = useCallback(async (tokenToUse?: TokenInfo) => {
    if (!connected || !userPublicKey) {
      console.log("[SwapScreen] No wallet connected, cannot fetch balance");
      return null;
    }

    const tokenForBalance = tokenToUse || inputToken;

    try {
      console.log(`[SwapScreen] Fetching balance for ${tokenForBalance.symbol}...`);
      const balance = await fetchTokenBalance(userPublicKey, tokenForBalance);

      if (isMounted.current) {
        console.log(`[SwapScreen] Token balance fetched for ${tokenForBalance.symbol}: ${balance}`);
        setCurrentBalance(balance);
        return balance;
      }
    } catch (err) {
      console.error('[SwapScreen] Error fetching balance:', err);
      if (isMounted.current) {
        setCurrentBalance(null);
        setErrorMsg(`Failed to fetch ${tokenForBalance.symbol} balance`);
        setTimeout(() => isMounted.current && setErrorMsg(''), 3000);
      }
    }
    return null;
  }, [connected, userPublicKey, inputToken]);

  // Get token price
  const getTokenPrice = useCallback(async (tokenToUse?: TokenInfo): Promise<number | null> => {
    const tokenForPrice = tokenToUse || inputToken;

    try {
      console.log(`[SwapScreen] Fetching price for ${tokenForPrice.symbol}...`);
      const price = await fetchTokenPrice(tokenForPrice);
      if (isMounted.current) {
        console.log(`[SwapScreen] Token price fetched for ${tokenForPrice.symbol}: ${price}`);
        setCurrentTokenPrice(price);
        return price;
      }
    } catch (err) {
      console.error('[SwapScreen] Error fetching token price:', err);
      if (isMounted.current) {
        setCurrentTokenPrice(null);
      }
    }
    return null;
  }, [inputToken]);

  // Handle token selection
  const handleTokenSelected = useCallback(async (token: TokenInfo) => {
    if (!isMounted.current) return;

    try {
      console.log(`[SwapScreen] Token selected: ${token.symbol || 'Unknown'}`);

      if (selectingWhichSide === 'input') {
        pendingTokenOps.current.input = true;
      } else {
        pendingTokenOps.current.output = true;
      }

      const completeToken = await ensureCompleteTokenInfo(token);

      if (!isMounted.current) return;

      if (selectingWhichSide === 'input') {
        setInputToken(completeToken);
        pendingTokenOps.current.input = false;
        
        // Reset input value and fetch new balance
        setInputValue('0');
        setCurrentBalance(null);
        
        if (userPublicKey) {
          setTimeout(async () => {
            if (isMounted.current) {
              const newBalance = await fetchBalance(completeToken);
              if (isMounted.current && newBalance !== null) {
                await getTokenPrice(completeToken);
              }
            }
          }, 100);
        }
      } else {
        setOutputToken(completeToken);
        pendingTokenOps.current.output = false;
      }

      setShowSelectTokenModal(false);
    } catch (error) {
      console.error('[SwapScreen] Error selecting token:', error);
      if (selectingWhichSide === 'input') {
        pendingTokenOps.current.input = false;
      } else {
        pendingTokenOps.current.output = false;
      }

      if (isMounted.current) {
        setErrorMsg('Failed to load token information');
        setTimeout(() => isMounted.current && setErrorMsg(''), 3000);
      }
    }
  }, [selectingWhichSide, fetchBalance, getTokenPrice, userPublicKey]);

  // Handle max button click
  const handleMaxButtonClick = useCallback(async () => {
    console.log("[SwapScreen] MAX button clicked, current balance:", currentBalance);

    if (isMounted.current) {
      setErrorMsg('');
    }

    if (!connected || !userPublicKey) {
      if (isMounted.current) {
        Alert.alert(
          "Wallet Not Connected",
          "Please connect your wallet to view your balance."
        );
      }
      return;
    }

    if (currentBalance !== null && currentBalance > 0) {
      setInputValue(String(currentBalance));
      return;
    }

    if (isMounted.current) {
      setLoading(true);
      setResultMsg("Fetching your balance...");
    }

    try {
      const balance = await fetchBalance();
      
      if (isMounted.current) {
        setLoading(false);
        setResultMsg("");
      }

      if (balance !== null && balance > 0 && isMounted.current) {
        setInputValue(String(balance));
      } else if (isMounted.current) {
        Alert.alert(
          "Balance Unavailable",
          `Could not get your ${inputToken.symbol} balance. Please check your wallet connection.`
        );
      }
    } catch (error) {
      console.error("[SwapScreen] Error in MAX button handler:", error);
      if (isMounted.current) {
        setLoading(false);
        setResultMsg("");
        setErrorMsg(`Failed to fetch your ${inputToken.symbol} balance`);
        setTimeout(() => isMounted.current && setErrorMsg(''), 3000);
      }
    }
  }, [currentBalance, fetchBalance, inputToken.symbol, userPublicKey, connected]);

  // Estimate the output amount based on input
  const estimateSwap = useCallback(async () => {
    if (!connected || parseFloat(inputValue) <= 0) {
      return;
    }

    try {
      // Get prices for both tokens
      const inputPrice = await getTokenPrice(inputToken);
      const outputPrice = await getTokenPrice(outputToken);
      
      if (inputPrice && outputPrice && isMounted.current) {
        const inputValueNum = parseFloat(inputValue);
        
        // Calculate USD value
        const inputValueUsd = inputValueNum * inputPrice;
        
        // Calculate output amount based on equivalent USD value (minus simulated 0.3% fee)
        const estimatedOutput = (inputValueUsd / outputPrice) * 0.997;
        
        // Format the number properly based on token decimals
        setEstimatedOutputAmount(estimatedOutput.toFixed(outputToken.decimals <= 6 ? outputToken.decimals : 6));
        
        console.log(`[SwapScreen] Estimate: ${inputValueNum} ${inputToken.symbol} (${inputPrice} USD) → ${estimatedOutput} ${outputToken.symbol} (${outputPrice} USD)`);
      }
    } catch (error) {
      console.error('[SwapScreen] Error estimating swap:', error);
    }
  }, [connected, inputValue, getTokenPrice, inputToken, outputToken]);
  
  // Calculate USD value for a given token amount
  const calculateUsdValue = useCallback((amount: string, tokenPrice: number | null) => {
    if (!tokenPrice || !amount || isNaN(parseFloat(amount))) {
      return '$0.00';
    }
    return `$${(parseFloat(amount) * tokenPrice).toFixed(2)}`;
  }, []);
  
  // Calculate USD value for output token
  const [outputTokenUsdValue, setOutputTokenUsdValue] = useState('$0.00');
  
  // Update output token USD value when estimated amount changes
  useEffect(() => {
    const updateOutputUsdValue = async () => {
      if (parseFloat(estimatedOutputAmount) > 0) {
        const outputPrice = await getTokenPrice(outputToken);
        if (outputPrice && isMounted.current) {
          setOutputTokenUsdValue(calculateUsdValue(estimatedOutputAmount, outputPrice));
        }
      } else {
        setOutputTokenUsdValue('$0.00');
      }
    };
    
    updateOutputUsdValue();
  }, [estimatedOutputAmount, outputToken, getTokenPrice, calculateUsdValue]);
  
  // Calculate conversion rate
  const getConversionRate = useCallback(() => {
    if (!inputToken || !outputToken || !estimatedOutputAmount || parseFloat(inputValue || '0') <= 0) {
      return `1 ${inputToken.symbol} = 0 ${outputToken.symbol}`;
    }
    
    const inputAmt = parseFloat(inputValue);
    const outputAmt = parseFloat(estimatedOutputAmount);
    const rate = outputAmt / inputAmt;
    
    return `1 ${inputToken.symbol} = ${rate.toFixed(6)} ${outputToken.symbol}`;
  }, [inputToken, outputToken, inputValue, estimatedOutputAmount]);

  // Update output estimate when input changes
  useEffect(() => {
    if (parseFloat(inputValue) > 0) {
      estimateSwap();
    } else {
      setEstimatedOutputAmount('0');
    }
  }, [inputValue, estimateSwap]);

  // Function to handle keypad input
  const handleKeyPress = (key: string) => {
    if (key === 'delete') {
      setInputValue(prev => prev.slice(0, -1) || '0');
      return;
    }
    
    if (key === '.') {
      if (inputValue.includes('.')) return;
    }
    
    if (inputValue === '0' && key !== '.') {
      setInputValue(key);
    } else {
      setInputValue(prev => prev + key);
    }
  };

  // Execute swap
  const handleSwap = useCallback(async () => {
    if (!connected || !userPublicKey) {
      Alert.alert('Wallet not connected', 'Please connect your wallet first.');
      return;
    }
    
    if (isNaN(parseFloat(inputValue)) || parseFloat(inputValue) <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid amount to swap.');
      return;
    }

    setLoading(true);
    setResultMsg('');
    setErrorMsg('');

    let retryCount = 0;
    const MAX_RETRIES = 2;

    while (retryCount <= MAX_RETRIES) {
      try {
        // Execute the swap using the trade service
        const response = await TradeService.executeSwap(
          inputToken,
          outputToken,
          inputValue,
          userPublicKey,
          sendTransaction,
          {
            statusCallback: (status) => {
              if (isMounted.current) {
                setResultMsg(status);
              }
            }
          }
        );

        if (response.success && response.signature) {
          if (isMounted.current) {
            setResultMsg(`Swap successful!`);
            Alert.alert(
              'Swap Successful', 
              `Successfully swapped ${inputValue} ${inputToken.symbol} for ${outputToken.symbol}`,
              [{ text: 'OK', onPress: () => {
                setInputValue('0');
                fetchBalance();
              }}]
            );
          }
          break;
        } else {
          throw new Error(response.error?.toString() || 'Transaction failed');
        }
      } catch (err: any) {
        console.error('Trade error:', err);

        if (err.message.includes('signature verification') && retryCount < MAX_RETRIES) {
          console.log(`Retrying transaction (attempt ${retryCount + 1} of ${MAX_RETRIES})...`);
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }

        if (isMounted.current) {
          let errorMessage = 'Trade failed. ';
          if (err.message.includes('signature verification')) {
            errorMessage += 'Please try again.';
          } else if (err.message.includes('0x1771')) {
            errorMessage += 'Insufficient balance or price impact too high.';
          } else {
            errorMessage += err.message;
          }

          setErrorMsg(errorMessage);
          Alert.alert('Swap Failed', errorMessage);
        }
        break;
      }
    }

    if (isMounted.current) {
      setLoading(false);
    }
  }, [connected, userPublicKey, inputValue, inputToken, outputToken, sendTransaction, fetchBalance]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Swap via</Text>
        </View>
        
        <View style={styles.contentContainer}>
          <ScrollView 
            bounces={false} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 250 }} // Extra padding for keypad
          >
            {/* Swap Providers */}
            <View style={styles.providerButtons}>
              {swapProviders.map(provider => (
                <TouchableOpacity
                  key={provider}
                  style={[
                    styles.providerButton,
                    activeProvider === provider && { backgroundColor: COLORS.lightBackground, borderWidth: 1, borderColor: COLORS.white }
                  ]}
                  onPress={() => setActiveProvider(provider)}
                >
                  <Text
                    style={[
                      styles.providerButtonText,
                      activeProvider === provider && { color: COLORS.white }
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {provider}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Swap Interface */}
            <View style={styles.swapContainer}>
              {/* From Token */}
              <View>
                <TouchableOpacity 
                  style={styles.tokenRow}
                  onPress={() => {
                    setSelectingWhichSide('input');
                    setShowSelectTokenModal(true);
                  }}
                >
                  {inputToken.logoURI ? (
                    <Image source={{ uri: inputToken.logoURI }} style={styles.tokenIcon} />
                  ) : (
                    <View style={[styles.tokenIcon, { backgroundColor: COLORS.lighterBackground, justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 10 }}>
                        {inputToken.symbol?.charAt(0) || '?'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.tokenInfo}>
                    <Text style={styles.tokenSymbol} numberOfLines={1} ellipsizeMode="tail">
                      {inputToken.symbol}
                    </Text>
                    <Text style={styles.tokenBalance} numberOfLines={1} ellipsizeMode="tail">
                      {currentBalance !== null 
                        ? `Balance: ${currentBalance.toFixed(6)} ${inputToken.symbol}`
                        : connected ? 'Loading...' : 'Connect wallet'}
                    </Text>
                  </View>
                  <View style={styles.valueContainer}>
                    <Text style={styles.valueLabel}>You Pay</Text>
                    <Text style={styles.tokenValue} numberOfLines={1} ellipsizeMode="tail">
                      {inputValue}
                    </Text>
                    <Text style={styles.fiatValue} numberOfLines={1} ellipsizeMode="tail">
                      {calculateUsdValue(inputValue, currentTokenPrice)}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              
              {/* Swap Button */}
              <TouchableOpacity 
                style={styles.swapButton}
                onPress={() => {
                  // Swap tokens
                  const temp = inputToken;
                  setInputToken(outputToken);
                  setOutputToken(temp);
                  
                  // Reset values
                  setInputValue('0');
                  setEstimatedOutputAmount('0');
                  setOutputTokenUsdValue('$0.00');
                  
                  // Update balances and prices for new input token
                  if (userPublicKey) {
                    fetchBalance(outputToken);
                    getTokenPrice(outputToken);
                  }
                }}
              >
                <Ionicons name="swap-vertical" size={20} color={COLORS.background} />
              </TouchableOpacity>
              
              {/* To Token */}
              <View>
                <TouchableOpacity 
                  style={styles.tokenRow}
                  onPress={() => {
                    setSelectingWhichSide('output');
                    setShowSelectTokenModal(true);
                  }}
                >
                  {outputToken.logoURI ? (
                    <Image source={{ uri: outputToken.logoURI }} style={styles.tokenIcon} />
                  ) : (
                    <View style={[styles.tokenIcon, { backgroundColor: COLORS.lighterBackground, justifyContent: 'center', alignItems: 'center' }]}>
                      <Text style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 10 }}>
                        {outputToken.symbol?.charAt(0) || '?'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.tokenInfo}>
                    <Text style={styles.tokenSymbol} numberOfLines={1} ellipsizeMode="tail">
                      {outputToken.symbol}
                    </Text>
                    <Text style={styles.tokenBalance}></Text>
                  </View>
                  <View style={styles.valueContainer}>
                    <Text style={styles.valueLabel}>You Receive</Text>
                    <Text style={styles.receiveValue} numberOfLines={1} ellipsizeMode="tail">
                      +{estimatedOutputAmount || '0'}
                    </Text>
                    <Text style={styles.fiatValue} numberOfLines={1} ellipsizeMode="tail">
                      {outputTokenUsdValue}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Max Button */}
              <TouchableOpacity 
                style={styles.maxButtonContainer}
                onPress={handleMaxButtonClick}
              >
                <Text style={styles.maxButtonText}>MAX</Text>
              </TouchableOpacity>
            </View>
            
            {/* Status Messages */}
            {loading && (
              <View style={styles.statusContainer}>
                <ActivityIndicator size="small" color={COLORS.brandPrimary} />
                <Text style={styles.statusText} numberOfLines={2} ellipsizeMode="tail">
                  {resultMsg || 'Processing...'}
                </Text>
              </View>
            )}
            
            {errorMsg ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText} numberOfLines={2} ellipsizeMode="tail">
                  {errorMsg}
                </Text>
              </View>
            ) : null}
            
            {/* Additional Swap Info */}
            <View style={styles.swapInfoContainer}>
              <View style={styles.swapInfoRow}>
                <Text style={styles.swapInfoLabel}>Rate</Text>
                <Text style={styles.swapInfoValue} numberOfLines={1} ellipsizeMode="tail">
                  {getConversionRate()}
                </Text>
              </View>
              <View style={styles.swapInfoRow}>
                <Text style={styles.swapInfoLabel}>Network Fee</Text>
                <Text style={styles.swapInfoValue}>~0.00005 SOL</Text>
              </View>
              <View style={styles.swapInfoRow}>
                <Text style={styles.swapInfoLabel}>Price Impact</Text>
                <Text style={styles.swapInfoValue}>
                  <Text style={{ color: COLORS.brandPrimary }}>~0.05%</Text>
                </Text>
              </View>
            </View>
          </ScrollView>
          
          {/* Keypad */}
          <View style={styles.keypadContainer}>
            <View style={styles.keypadRow}>
              <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('1')}>
                <Text style={styles.keypadButtonText}>1</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('2')}>
                <Text style={styles.keypadButtonText}>2</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('3')}>
                <Text style={styles.keypadButtonText}>3</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.keypadRow}>
              <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('4')}>
                <Text style={styles.keypadButtonText}>4</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('5')}>
                <Text style={styles.keypadButtonText}>5</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('6')}>
                <Text style={styles.keypadButtonText}>6</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.keypadRow}>
              <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('7')}>
                <Text style={styles.keypadButtonText}>7</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('8')}>
                <Text style={styles.keypadButtonText}>8</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('9')}>
                <Text style={styles.keypadButtonText}>9</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.keypadRow}>
              <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('.')}>
                <Text style={styles.keypadButtonText}>.</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('0')}>
                <Text style={styles.keypadButtonText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.keypadButton} onPress={() => handleKeyPress('delete')}>
                <Ionicons name="backspace-outline" size={22} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Swap Button */}
          <TouchableOpacity 
            style={[
              styles.swapActionButton,
              (!connected || loading) && { opacity: 0.6 }
            ]} 
            onPress={handleSwap}
            disabled={!connected || loading}
          >
            <Text style={[styles.swapActionButtonText, { color: COLORS.textDark }]}>
              {!connected ? 'Connect Wallet to Swap' : 'Swap'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {/* Token Selection Modal */}
        <SelectTokenModal
          visible={showSelectTokenModal}
          onClose={() => setShowSelectTokenModal(false)}
          onTokenSelected={handleTokenSelected}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
} 
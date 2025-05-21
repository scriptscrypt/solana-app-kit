import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { styles, modalOverlayStyles } from './transferBalanceButton.style';
import { useAppSelector, useAppDispatch } from '@/shared/hooks/useReduxHooks';
import { Cluster, Connection, clusterApiUrl, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import {
  sendSOL,
  COMMISSION_PERCENTAGE,
} from '@/shared/services/transactions';
import { useWallet } from '@/modules/wallet-providers/hooks/useWallet';
import {
  setSelectedFeeTier as setFeeTier,
  setTransactionMode as setMode
} from '@/shared/state/transaction/reducer';
import { CLUSTER, HELIUS_STAKED_URL } from '@env';
import { TransactionService } from '@/modules/wallet-providers/services/transaction/transactionService';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';
import { ENDPOINTS } from '@/shared/config/constants';

export interface TransferBalanceButtonProps {
  amIFollowing?: boolean;
  areTheyFollowingMe?: boolean;
  onPressFollow?: () => void;
  onPressUnfollow?: () => void;
  onSendToWallet?: () => void;
  recipientAddress?: string;
  showOnlyTransferButton?: boolean;
  showCustomWalletInput?: boolean;
  buttonLabel?: string;
  externalModalVisible?: boolean;
  externalSetModalVisible?: (visible: boolean) => void;
}

const TransferBalanceButton: React.FC<TransferBalanceButtonProps> = ({
  amIFollowing = false,
  areTheyFollowingMe = false,
  onPressFollow = () => {},
  onPressUnfollow = () => {},
  onSendToWallet,
  recipientAddress = '',
  showOnlyTransferButton = false,
  showCustomWalletInput = false,
  buttonLabel = 'Send to Wallet',
  externalModalVisible,
  externalSetModalVisible,
}) => {
  const dispatch = useAppDispatch();
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'jito' | 'priority' | null>(
    null,
  );
  const [selectedFeeTier, setSelectedFeeTier] = useState<
    'low' | 'medium' | 'high' | 'very-high'
  >('low');
  const [amountSol, setAmountSol] = useState('');
  const [transactionStatus, setTransactionStatus] = useState<string | null>(
    null,
  );
  const [customWalletAddress, setCustomWalletAddress] = useState(recipientAddress);
  const [walletAddressError, setWalletAddressError] = useState('');
  const [fetchingBalance, setFetchingBalance] = useState(false);

  const modalRef = useRef<View | null>(null);
  const keyboardAvoidingRef = useRef<KeyboardAvoidingView | null>(null);

  const currentProvider = useAppSelector(state => state.auth.provider);
  const transactionState = useAppSelector(state => state.transaction);

  const {wallet, address, isMWA} = useWallet();

  useEffect(() => {
    if (externalModalVisible !== undefined && externalModalVisible !== sendModalVisible) {
      setSendModalVisible(externalModalVisible);
    }
  }, [externalModalVisible]);

  useEffect(() => {
    if (externalSetModalVisible) {
      externalSetModalVisible(sendModalVisible);
    }
  }, [sendModalVisible, externalSetModalVisible]);

  useEffect(() => {
    if (sendModalVisible) {
      setSelectedMode(transactionState.transactionMode);
      setSelectedFeeTier(transactionState.selectedFeeTier);
      setTransactionStatus(null);
      setWalletAddressError('');
      
      if (!showCustomWalletInput) {
        setCustomWalletAddress(recipientAddress);
      } else if (!customWalletAddress) {
        setCustomWalletAddress('');
      }
    }
  }, [sendModalVisible, transactionState, recipientAddress, showCustomWalletInput]);

  let followLabel = 'Follow';
  if (amIFollowing) {
    followLabel = 'Following';
  } else if (!amIFollowing && areTheyFollowingMe) {
    followLabel = 'Follow Back';
  }

  const handlePressFollowButton = () => {
    if (amIFollowing) {
      onPressUnfollow();
    } else {
      onPressFollow();
    }
  };

  const validateSolanaAddress = (address: string): boolean => {
    try {
      if (!address || address.trim() === '') return false;
      
      new PublicKey(address);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handlePressSendToWallet = () => {
    if (!showCustomWalletInput && !recipientAddress) {
      Alert.alert('Error', 'No recipient address available');
      return;
    }

    if (onSendToWallet) {
      onSendToWallet();
    }

    setSendModalVisible(true);
  };

  const handleWalletAddressChange = (text: string) => {
    setCustomWalletAddress(text);
    setWalletAddressError('');
  };

  const handleSendTransaction = async () => {
    try {
      if (!selectedMode) {
        Alert.alert('Error', "Please select 'Priority' or 'Jito' first.");
        return;
      }

      const finalRecipientAddress = showCustomWalletInput ? customWalletAddress : recipientAddress;
      
      if (!validateSolanaAddress(finalRecipientAddress)) {
        setWalletAddressError('Please enter a valid Solana wallet address');
        return;
      }

      if (!finalRecipientAddress || !amountSol) {
        Alert.alert('Error', 'Please provide recipient address and amount.');
        return;
      }
      
      const parsedAmount = parseFloat(amountSol);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        Alert.alert('Error', 'Invalid SOL amount.');
        return;
      }

      if (!wallet) {
        Alert.alert('Error', 'Wallet not connected');
        return;
      }

      if (selectedMode) {
        dispatch(setMode(selectedMode));

        if (selectedMode === 'priority' && selectedFeeTier) {
          dispatch(setFeeTier(selectedFeeTier));
        }
      }
      const rpcUrl =
        HELIUS_STAKED_URL ||
        ENDPOINTS.helius ||
        clusterApiUrl(CLUSTER as Cluster);
      const connection = new Connection(rpcUrl, 'confirmed');

      setTransactionStatus('Preparing transaction...');

      const signature = await sendSOL({
        wallet,
        recipientAddress: finalRecipientAddress,
        amountSol: parsedAmount,
        connection,
        onStatusUpdate: status => {
          if (!status.startsWith('Error:')) {
            console.log(`[AddButton] ${status}`);
            setTransactionStatus(status);
          } else {
            setTransactionStatus('Processing transaction...');
          }
        },
      });

      console.log(`[AddButton] sendSOL returned signature: ${signature}`);

      setTimeout(() => {
        setSendModalVisible(false);
        setSelectedMode(null);
        setAmountSol('');
        setTransactionStatus(null);
        if (showCustomWalletInput) {
          setCustomWalletAddress('');
        }
      }, 3000);
    } catch (err: any) {
      console.error('Error during transaction initiation:', err);

      setTransactionStatus('Transaction failed');

      TransactionService.showError(err);

      setTimeout(() => {
        setSendModalVisible(false);
        setSelectedMode(null);
        setAmountSol('');
        setTransactionStatus(null);
      }, 2000);
    }
  };

  const fetchSolBalance = useCallback(async () => {
    if (!wallet || !('publicKey' in wallet) || !wallet.publicKey) {
      Alert.alert('Error', 'Wallet not connected');
      return;
    }

    try {
      setFetchingBalance(true);
      
      const rpcUrl =
        HELIUS_STAKED_URL ||
        ENDPOINTS.helius ||
        clusterApiUrl(CLUSTER as Cluster);
      
      const connection = new Connection(rpcUrl, 'confirmed');
      
      const publicKey = typeof wallet.publicKey === 'string' 
        ? new PublicKey(wallet.publicKey)
        : wallet.publicKey;
        
      const balance = await connection.getBalance(publicKey);
      
      const solBalance = (balance / LAMPORTS_PER_SOL) - 0.001;
      
      if (solBalance <= 0) {
        Alert.alert('Insufficient Balance', 'Your wallet does not have enough SOL to transfer.');
        setFetchingBalance(false);
        return;
      }
      
      setAmountSol(solBalance.toFixed(Math.min(9, solBalance.toString().split('.')[1]?.length || 9)));
      
      setFetchingBalance(false);
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      Alert.alert('Error', 'Failed to fetch your balance. Please try again.');
      setFetchingBalance(false);
    }
  }, [wallet]);

  const showSendToWalletButton =
    (currentProvider === 'privy' ||
    currentProvider === 'dynamic' ||
    currentProvider === 'mwa') && !showOnlyTransferButton;

  return (
    <View style={styles.container}>
      {!showOnlyTransferButton && (
        <TouchableOpacity style={styles.btn} onPress={handlePressFollowButton}>
          <Text style={styles.text}>{followLabel}</Text>
        </TouchableOpacity>
      )}

      {(showSendToWalletButton || showOnlyTransferButton) && (
        <TouchableOpacity 
          style={[styles.btn, showOnlyTransferButton && styles.fullWidthBtn]} 
          onPress={handlePressSendToWallet}
        >
          <Text style={styles.text}>{buttonLabel}</Text>
        </TouchableOpacity>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={sendModalVisible}
        onRequestClose={() => setSendModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={modalOverlayStyles.overlay}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
          ref={keyboardAvoidingRef}
        >
          <View style={modalOverlayStyles.drawerContainer} ref={modalRef}>
            <View style={modalOverlayStyles.dragHandle} />

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={modalOverlayStyles.scrollContent}>
              <Text style={modalOverlayStyles.title}>Send SOL</Text>

              {showCustomWalletInput && (
                <View style={modalOverlayStyles.inputContainer}>
                  <Text style={modalOverlayStyles.label}>Recipient Wallet Address</Text>
                  <TextInput
                    style={[modalOverlayStyles.input, walletAddressError ? modalOverlayStyles.inputError : null]}
                    value={customWalletAddress}
                    onChangeText={handleWalletAddressChange}
                    placeholder="Enter Solana wallet address"
                    placeholderTextColor={COLORS.textHint}
                  />
                  {walletAddressError ? (
                    <Text style={modalOverlayStyles.errorText}>{walletAddressError}</Text>
                  ) : null}
                </View>
              )}

              <View style={modalOverlayStyles.modeContainer}>
                <View style={modalOverlayStyles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      modalOverlayStyles.modeButton,
                      selectedMode === 'priority' &&
                        modalOverlayStyles.selectedBtn,
                    ]}
                    onPress={() => setSelectedMode('priority')}>
                    <Text
                      style={[
                        modalOverlayStyles.modeButtonText,
                        selectedMode === 'priority' &&
                          modalOverlayStyles.selectedBtnText,
                      ]}>
                      Priority
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      modalOverlayStyles.modeButton,
                      selectedMode === 'jito' && modalOverlayStyles.selectedBtn,
                    ]}
                    onPress={() => setSelectedMode('jito')}>
                    <Text
                      style={[
                        modalOverlayStyles.modeButtonText,
                        selectedMode === 'jito' &&
                          modalOverlayStyles.selectedBtnText,
                      ]}>
                      Jito
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {selectedMode === 'priority' && (
                <View style={modalOverlayStyles.tierContainer}>
                  <Text style={modalOverlayStyles.sectionTitle}>
                    Priority Fee Tier:
                  </Text>
                  <View style={modalOverlayStyles.tierButtonRow}>
                    {(['low', 'medium', 'high', 'very-high'] as const).map(
                      tier => (
                        <TouchableOpacity
                          key={tier}
                          style={[
                            modalOverlayStyles.tierButton,
                            selectedFeeTier === tier &&
                              modalOverlayStyles.selectedBtn,
                          ]}
                          onPress={() => setSelectedFeeTier(tier)}>
                          <Text
                            style={[
                              modalOverlayStyles.tierButtonText,
                              selectedFeeTier === tier &&
                                modalOverlayStyles.selectedBtnText,
                            ]}>
                            {tier.charAt(0).toUpperCase() + tier.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ),
                    )}
                  </View>
                </View>
              )}

              <View style={modalOverlayStyles.inputContainer}>
                <View style={modalOverlayStyles.amountLabelRow}>
                  <Text style={modalOverlayStyles.label}>Amount (SOL)</Text>
                  <TouchableOpacity 
                    style={modalOverlayStyles.maxButton}
                    onPress={fetchSolBalance}
                    disabled={fetchingBalance}
                  >
                    {fetchingBalance ? (
                      <ActivityIndicator size="small" color={COLORS.white} />
                    ) : (
                      <Text style={modalOverlayStyles.maxButtonText}>MAX</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={modalOverlayStyles.presetButtonsRow}>
                  <TouchableOpacity
                    style={modalOverlayStyles.presetButton}
                    onPress={() => setAmountSol('1')}>
                    <Text style={modalOverlayStyles.presetButtonText}>
                      1 SOL
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={modalOverlayStyles.presetButton}
                    onPress={() => setAmountSol('5')}>
                    <Text style={modalOverlayStyles.presetButtonText}>
                      5 SOL
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={modalOverlayStyles.presetButton}
                    onPress={() => setAmountSol('10')}>
                    <Text style={modalOverlayStyles.presetButtonText}>
                      10 SOL
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={modalOverlayStyles.amountControlContainer}>
                  <TouchableOpacity
                    style={modalOverlayStyles.controlButton}
                    onPress={() => {
                      const currentVal = parseFloat(amountSol) || 0;
                      if (currentVal > 0) {
                        setAmountSol((currentVal - 1).toString());
                      }
                    }}>
                    <Text style={modalOverlayStyles.controlButtonText}>−</Text>
                  </TouchableOpacity>

                  <TextInput
                    style={modalOverlayStyles.amountInput}
                    value={amountSol}
                    onChangeText={setAmountSol}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={COLORS.textHint}
                    textAlign="center"
                  />

                  <TouchableOpacity
                    style={modalOverlayStyles.controlButton}
                    onPress={() => {
                      const currentVal = parseFloat(amountSol) || 0;
                      setAmountSol((currentVal + 1).toString());
                    }}>
                    <Text style={modalOverlayStyles.controlButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {transactionStatus && (
                <View style={modalOverlayStyles.statusContainer}>
                  <Text style={modalOverlayStyles.statusText}>
                    {transactionStatus}
                  </Text>
                </View>
              )}

              <View style={modalOverlayStyles.buttonRow}>
                <TouchableOpacity
                  style={[
                    modalOverlayStyles.modalButton,
                    {backgroundColor: COLORS.lightBackground},
                  ]}
                  onPress={() => setSendModalVisible(false)}
                  disabled={
                    !!transactionStatus && !transactionStatus.includes('Error')
                  }>
                  <Text style={modalOverlayStyles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    modalOverlayStyles.modalButton,
                    {backgroundColor: COLORS.brandBlue},
                    !!transactionStatus && {opacity: 0.5},
                  ]}
                  onPress={handleSendTransaction}
                  disabled={!!transactionStatus}>
                  <Text style={modalOverlayStyles.modalButtonText}>Send</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default TransferBalanceButton;

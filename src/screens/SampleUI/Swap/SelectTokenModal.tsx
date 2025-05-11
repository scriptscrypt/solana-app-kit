import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';
import { TokenInfo } from '@/modules/dataModule';

const { height, width } = Dimensions.get('window');

// Styles specific to this modal
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.lightBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingBottom: Platform.OS === 'ios' ? 48 : 24,
    maxHeight: height * 0.8,
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: String(TYPOGRAPHY.bold) as any,
    color: COLORS.white,
  },
  modalCloseButton: {
    padding: 8,
  },
  modalCloseText: {
    fontSize: 20,
    color: COLORS.white,
    fontWeight: String(TYPOGRAPHY.medium) as any,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkerBackground,
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.white,
    padding: 0,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDarkColor,
  },
  tokenItemContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.darkerBackground,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenTextContainer: {
    marginLeft: 16,
    flex: 1,
  },
  tokenSymbol: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: String(TYPOGRAPHY.bold) as any,
    color: COLORS.white,
  },
  tokenName: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.greyMid,
    marginTop: 2,
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.greyMid,
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.greyMid,
    textAlign: 'center',
  },
  closeButton: {
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: COLORS.darkerBackground,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  closeButtonText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: String(TYPOGRAPHY.medium) as any,
    color: COLORS.white,
  },
});

interface SelectTokenModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback fired when the modal is closed */
  onClose: () => void;
  /** Callback fired when a token is selected */
  onTokenSelected: (token: TokenInfo) => void;
}

export default function SelectTokenModal({
  visible,
  onClose,
  onTokenSelected,
}: SelectTokenModalProps) {
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [searchInput, setSearchInput] = useState('');

  // Keep track of whether the component is mounted
  const isMounted = useRef(true);

  useEffect(() => {
    // Clean up function for unmounting
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (visible) {
      fetchTokens();
    } else {
      // Clear search when modal closes
      setSearchInput('');
    }
  }, [visible]);

  /**
   * Fetches the list of verified tokens from Jupiter's API
   * @returns {Promise<void>}
   */
  const fetchTokens = async () => {
    setLoading(true);
    try {
      const url = 'https://api.jup.ag/tokens/v1/tagged/verified';
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`Failed to load tokens: ${resp.status}`);
      }
      const data = await resp.json();
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid data structure from tokens API');
      }

      // Add default empty string for logoURI if missing
      const result: TokenInfo[] = data.map((item: any) => ({
        address: item.address,
        symbol: item.symbol,
        name: item.name,
        decimals: item.decimals,
        logoURI: item.logoURI || '',
      }));

      if (isMounted.current) {
        setTokens(result);
      }
    } catch (err: any) {
      console.error('fetchTokens error:', err);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const filteredTokens = useMemo(() => {
    if (!searchInput.trim()) return tokens;
    return tokens.filter(
      t =>
        t.symbol.toLowerCase().includes(searchInput.toLowerCase()) ||
        t.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        t.address.toLowerCase().includes(searchInput.toLowerCase()),
    );
  }, [tokens, searchInput]);

  /**
   * Renders a single token item in the list
   */
  const renderItem = ({ item }: { item: TokenInfo }) => (
    <TouchableOpacity
      style={styles.tokenItem}
      onPress={() => onTokenSelected(item)}
      activeOpacity={0.7}>
      <View style={styles.tokenItemContent}>
        {item.logoURI ? (
          <Image
            source={{ uri: item.logoURI }}
            style={styles.tokenLogo}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.tokenLogo}>
            <Text style={{ color: COLORS.white, fontWeight: '600', fontSize: 12 }}>
              {item.symbol.charAt(0)}
            </Text>
          </View>
        )}
        <View style={styles.tokenTextContainer}>
          <Text style={styles.tokenSymbol} numberOfLines={1} ellipsizeMode="tail">
            {item.symbol}
          </Text>
          <Text style={styles.tokenName} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select a Token</Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <FontAwesome5 name="search" size={16} color={COLORS.greyMid} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, symbol, or address"
              placeholderTextColor={COLORS.greyMid}
              value={searchInput}
              onChangeText={setSearchInput}
              clearButtonMode="while-editing"
            />
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={COLORS.brandPrimary}
              />
              <Text style={styles.loadingText}>Loading tokens...</Text>
            </View>
          ) : (
            <>
              <FlatList
                data={filteredTokens}
                keyExtractor={item => item.address}
                renderItem={renderItem}
                contentContainerStyle={styles.listContentContainer}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                      No tokens found matching "{searchInput}"
                    </Text>
                  </View>
                }
              />

              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}>
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
} 
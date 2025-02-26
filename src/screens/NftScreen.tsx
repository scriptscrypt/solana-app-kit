import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Image,
  Modal,
  Pressable,
  Alert
} from 'react-native';
import { 
  PublicKey, 
  Connection, 
  Transaction, 
  VersionedTransaction 
} from '@solana/web3.js';
import { HELIUS_API_KEY, TENSOR_API_KEY } from '@env';  // from your .env
import { useAuth } from '../hooks/useAuth';
import { fetchWithRetries } from '../utils/common/fetch';
import { BlinkExample } from '../components/BlinkRequestCard/BlinkRequestCard';

interface NftItem {
  mint: string;
  name: string;
  uri?: string;
  symbol?: string;
  collection?: string;
  image?: string;
}

const NftScreen: React.FC = () => {
  const { solanaWallet } = useAuth();

  // The user’s public key (string) and wallet object
  const userPublicKey = solanaWallet?.wallets?.[0]?.publicKey || null;
  const userWallet = solanaWallet?.wallets?.[0] || null;

  // ----------------------------------
  // Tabs: 'buy' / 'sell'
  // ----------------------------------
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');

  // ----------------------------------
  // BUY section
  // ----------------------------------
  const [collectionName, setCollectionName] = useState('madlads');
  const [buyBlinkUrl, setBuyBlinkUrl] = useState<string | null>(null);

  // ----------------------------------
  // SELL section
  // ----------------------------------
  const [loadingNfts, setLoadingNfts] = useState(false);
  const [ownedNfts, setOwnedNfts] = useState<NftItem[]>([]);
  const [selectedNft, setSelectedNft] = useState<NftItem | null>(null);

  // Additional fields for listing
  const [salePrice, setSalePrice] = useState<string>('1.0'); // price in SOL
  const [durationDays, setDurationDays] = useState<string>(''); // optional listing duration

  // ----------------------------------
  // Error handling
  // ----------------------------------
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ----------------------------------
  // 1) Build Dialect Blink URLs (Buy only)
  // ----------------------------------
  const buildBuyFloorBlink = useCallback((slug: string) => {
    const baseUrl = 'https://api.dial.to/v1/blink';
    const encodedApiUrl = encodeURIComponent(`https://tensor.dial.to/buy-floor/${slug}`);
    return `${baseUrl}?apiUrl=${encodedApiUrl}`;
  }, []);

  // ----------------------------------
  // 2) Buy Floor Flow
  // ----------------------------------
  const handleGenerateBuyBlink = () => {
    if (!collectionName.trim()) return;
    const url = buildBuyFloorBlink(collectionName.trim());
    setBuyBlinkUrl(url);
  };

  // ----------------------------------
  // 3) Sell NFT Flow (Tensor API)
  // ----------------------------------
  /**
   * Convert SOL (user input) to lamports before calling Tensor’s API.
   * 1 SOL = 1,000,000,000 lamports
   */
  const SOL_TO_LAMPORTS = 1_000_000_000;

  const handleSellNftOnTensor = async () => {
    if (!selectedNft) {
      console.log('No NFT selected. Aborting listing.');
      return;
    }
    if (!salePrice) {
      Alert.alert('Error', 'Please enter a valid sale price in SOL.');
      return;
    }
    if (!userPublicKey || !userWallet) {
      Alert.alert('Error', 'Wallet not connected.');
      return;
    }

    try {
      console.log('Starting NFT listing on Tensor...');

      const mintAddress = selectedNft.mint;
      // Convert SOL to lamports
      const priceLamports = Math.floor(parseFloat(salePrice) * SOL_TO_LAMPORTS);

      // Optionally compute expiry if provided
      let expiryParam = '';
      if (durationDays && !isNaN(parseFloat(durationDays))) {
        const nowSeconds = Math.floor(Date.now() / 1000);
        const addedSeconds = parseFloat(durationDays) * 24 * 60 * 60;
        const expiryTs = Math.floor(nowSeconds + addedSeconds);
        expiryParam = `&expiry=${expiryTs}`;
        console.log(`Listing will expire in ${durationDays} day(s) => ${expiryTs}`);
      }

      // Create a connection to fetch a recent blockhash
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      const { blockhash } = await connection.getRecentBlockhash();
      console.log('Obtained recent blockhash:', blockhash);

      // Construct the URL for Tensor's list transaction endpoint.
      // We now include both seller and owner (set to the userPublicKey)
      const baseUrl = 'https://api.mainnet.tensordev.io/api/v1/tx/list';
      const listUrl = `${baseUrl}?seller=${userPublicKey}&owner=${userPublicKey}&mint=${mintAddress}&price=${priceLamports}&blockhash=${blockhash}${expiryParam}`;
      console.log('Tensor listing URL:', listUrl);

      // Call the Tensor API with the API key header
      const resp = await fetch(listUrl, {
        headers: { 'x-tensor-api-key': TENSOR_API_KEY }
      });
      const rawText = await resp.text();
      console.log('Raw response from Tensor (text):\n', rawText);

      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.error('Failed to parse Tensor response as JSON. Full text:\n', rawText);
        throw new Error('Tensor returned non-JSON response. Check console for details.');
      }

      if (!data.txs || data.txs.length === 0) {
        throw new Error('No transactions returned from Tensor API for listing.');
      }

      // For each returned transaction, sign & send
      for (let i = 0; i < data.txs.length; i++) {
        const txObj = data.txs[i];
        let transaction: Transaction | VersionedTransaction;
        if (txObj.txV0) {
          const txBuffer = Buffer.from(txObj.txV0.data);
          transaction = VersionedTransaction.deserialize(txBuffer);
          console.log(`Deserialized versioned transaction #${i + 1}`);
        } else if (txObj.tx) {
          const txBuffer = Buffer.from(txObj.tx.data);
          transaction = Transaction.from(txBuffer);
          console.log(`Deserialized legacy transaction #${i + 1}`);
        } else {
          throw new Error(`Transaction #${i + 1} is in an unknown format.`);
        }
        console.log(`Signing & sending transaction #${i + 1}...`);
        const provider = await userWallet.getProvider();
        const { signature } = await provider.request({
          method: 'signAndSendTransaction',
          params: { transaction, connection }
        });
        console.log(`Transaction #${i + 1} signature: ${signature}`);
      }

      Alert.alert('Success', `NFT listed on Tensor at ${salePrice} SOL!`);
      console.log('Listing complete.');
    } catch (err: any) {
      console.error('Error listing NFT on Tensor:', err);
      Alert.alert('Error', err.message || 'Failed to list NFT on Tensor.');
    } finally {
      setSelectedNft(null);
      setSalePrice('1.0');
      setDurationDays('');
    }
  };

  // ----------------------------------
  // 4) Fetch Owned NFTs
  // ----------------------------------
  const fixImageUrl = (url: string): string => {
    if (!url) return '';
    if (url.startsWith('ipfs://')) {
      return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
    }
    if (url.startsWith('ar://')) {
      return url.replace('ar://', 'https://arweave.net/');
    }
    if (url.startsWith('/')) {
      return `https://arweave.net${url}`;
    }
    if (!url.startsWith('http') && !url.startsWith('data:')) {
      return `https://${url}`;
    }
    return url;
  };

  const fetchMetadataIfNeeded = async (nfts: NftItem[]): Promise<NftItem[]> => {
    const nftsToUpdate = nfts.filter(nft => nft.uri && (!nft.image || !nft.name));
    if (nftsToUpdate.length === 0) return nfts;
    const updatedNfts = [...nfts];
    await Promise.all(
      nftsToUpdate.map(async (nft) => {
        if (!nft.uri) return;
        try {
          const fixedUri = fixImageUrl(nft.uri);
          const response = await fetchWithRetries(fixedUri, { method: 'GET' });
          if (!response.ok) {
            console.warn(`Metadata fetch failed for ${nft.mint} => status: ${response.status}`);
            return;
          }
          const metadata = await response.json();
          const index = updatedNfts.findIndex(item => item.mint === nft.mint);
          if (index !== -1) {
            if (!updatedNfts[index].image && metadata.image) {
              updatedNfts[index].image = fixImageUrl(metadata.image);
            }
            if (!updatedNfts[index].name && metadata.name) {
              updatedNfts[index].name = metadata.name;
            }
            if (!updatedNfts[index].collection && metadata.collection?.name) {
              updatedNfts[index].collection = metadata.collection.name;
            }
          }
        } catch (error) {
          console.error(`Failed to fetch metadata for ${nft.mint}:`, error);
        }
      })
    );
    return updatedNfts;
  };

  const fetchOwnedNfts = useCallback(async () => {
    if (!userPublicKey) return;
    setLoadingNfts(true);
    setOwnedNfts([]);
    setFetchError(null);
    const apiKey = HELIUS_API_KEY || 'da5b04e7-ae1c-4474-ae18-cf81af2b0653';
    try {
      const url = `https://api.helius.xyz/v1/addresses/${userPublicKey}/assets?api-key=${apiKey}`;
      console.log('Fetching NFTs from Helius DAS API:', url);
      const response = await fetchWithRetries(url, { 
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) {
        throw new Error(`DAS API request failed with status ${response.status}`);
      }
      const data = await response.json();
      if (data.result && Array.isArray(data.result)) {
        const mappedNfts = data.result
          .filter((item: any) => 
            item.interface === 'NFT' || 
            (item.tokenStandard === 'NonFungible' && !item.compression?.compressed)
          )
          .map((item: any) => {
            const name =
              item.content?.json?.name ||
              item.content?.metadata?.name ||
              item.name ||
              'Unknown NFT';
            const rawImage =
              item.content?.json?.image ||
              item.content?.metadata?.image ||
              item.content?.files?.[0]?.uri ||
              (item.content?.links?.image || '');
            const collection =
              item.grouping?.find((g: any) => g.group_key === 'collection')?.group_value ||
              item.content?.json?.collection?.name ||
              item.content?.metadata?.collection?.name;
            const uri =
              item.content?.json_uri ||
              item.content?.metadata?.uri ||
              '';
            return {
              mint: item.id || item.mint,
              name,
              symbol: item.content?.metadata?.symbol || item.symbol,
              collection,
              image: fixImageUrl(rawImage),
              uri: fixImageUrl(uri),
            } as NftItem;
          });
        console.log('NFTs found via DAS API:', mappedNfts.length);
        const nftsWithMetadata = await fetchMetadataIfNeeded(mappedNfts);
        setOwnedNfts(nftsWithMetadata);
        setLoadingNfts(false);
        return;
      }
      throw new Error('DAS API did not return expected data format');
    } catch (error) {
      console.error('DAS API error:', error);
      try {
        const fallbackUrl = `https://api.helius.xyz/v0/addresses/${userPublicKey}/nfts?api-key=${apiKey}`;
        console.log('Trying legacy Helius endpoint:', fallbackUrl);
        const fallbackRes = await fetchWithRetries(fallbackUrl, { method: 'GET' });
        const fallbackData = await fallbackRes.json();
        if (Array.isArray(fallbackData)) {
          const mappedNfts = fallbackData
            .filter((item: any) => item.tokenStandard === 'NonFungible')
            .map((item: any) => {
              const name =
                item.offChainData?.metadata?.name ||
                item.onChainMetadata?.metadata?.name ||
                item.symbol ||
                'Unknown NFT';
              const rawImage =
                item.offChainData?.metadata?.image ||
                item.onChainMetadata?.metadata?.image ||
                '';
              const collection =
                item.offChainData?.metadata?.collection?.name ||
                item.onChainMetadata?.metadata?.collection?.name ||
                '';
              const uri =
                item.offChainData?.uri ||
                item.onChainMetadata?.uri ||
                '';
              return {
                mint: item.mint,
                name,
                symbol: item.offChainData?.metadata?.symbol || item.onChainMetadata?.metadata?.symbol || '',
                collection,
                image: fixImageUrl(rawImage),
                uri: fixImageUrl(uri),
              } as NftItem;
            });
          console.log('NFTs found via legacy API:', mappedNfts.length);
          const nftsWithMetadata = await fetchMetadataIfNeeded(mappedNfts);
          setOwnedNfts(nftsWithMetadata);
          setLoadingNfts(false);
          return;
        }
        throw new Error('Legacy API did not return valid data');
      } catch (legacyError) {
        console.error('Legacy API error:', legacyError);
        try {
          console.log('Attempting RPC fallback...');
          const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
          const accounts = await connection.getParsedTokenAccountsByOwner(
            new PublicKey(userPublicKey),
            { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
          );
          const nfts = accounts.value
            .filter(({ account }) => {
              const amount = account.data.parsed.info.tokenAmount;
              return amount.amount === '1' && amount.decimals === 0;
            })
            .map(({ account }) => {
              const { mint } = account.data.parsed.info;
              return {
                mint,
                name: `NFT ${mint.slice(0, 6)}...`,
                image: '',
                symbol: '',
                uri: '',
              } as NftItem;
            });
          console.log('NFTs from RPC fallback:', nfts.length);
          setOwnedNfts(nfts);
          setFetchError('Limited NFT data available (RPC fallback) - only basic info shown');
        } catch (rpcError) {
          console.error('RPC fallback failed:', rpcError);
          setFetchError('Failed to fetch NFTs. Please try again later.');
        }
      } finally {
        setLoadingNfts(false);
      }
    }
  }, [userPublicKey]);

  useEffect(() => {
    if (activeTab === 'sell' && userPublicKey) {
      fetchOwnedNfts();
    }
  }, [activeTab, userPublicKey, fetchOwnedNfts]);

  if (!userPublicKey) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.warnText}>Please connect your wallet first!</Text>
      </SafeAreaView>
    );
  }

  const renderNftCard = ({ item }: { item: NftItem }) => {
    const isSelected = selectedNft?.mint === item.mint;
    return (
      <TouchableOpacity
        style={[styles.nftCard, isSelected && styles.nftCardSelected]}
        onPress={() => setSelectedNft(item)}
      >
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image 
              source={{ uri: fixImageUrl(item.image) }} 
              style={styles.nftImage}
              resizeMode="cover"
              onError={() => console.log(`Failed to load image for ${item.mint}`)}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>
        <View style={styles.nftDetails}>
          <Text style={styles.nftName} numberOfLines={1}>
            {item.name || 'Unnamed NFT'}
          </Text>
          {!!item.collection && (
            <Text style={styles.collectionName} numberOfLines={1}>
              {item.collection}
            </Text>
          )}
          <Text style={styles.mintAddress} numberOfLines={1}>
            {item.mint.slice(0, 8)}...{item.mint.slice(-4)}
          </Text>
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs: Buy / Sell */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'buy' && styles.tabButtonActive]}
          onPress={() => {
            setActiveTab('buy');
            setBuyBlinkUrl(null);
          }}
        >
          <Text style={[styles.tabButtonText, activeTab === 'buy' && styles.tabButtonTextActive]}>
            Buy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'sell' && styles.tabButtonActive]}
          onPress={() => {
            setActiveTab('sell');
          }}
        >
          <Text style={[styles.tabButtonText, activeTab === 'sell' && styles.tabButtonTextActive]}>
            Sell
          </Text>
        </TouchableOpacity>
      </View>

      {/* BUY SECTION */}
      {activeTab === 'buy' && (
        <View style={styles.contentContainer}>
          <Text style={styles.label}>Collection Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. madlads"
            value={collectionName}
            onChangeText={setCollectionName}
          />
          <TouchableOpacity style={styles.actionButton} onPress={handleGenerateBuyBlink}>
            <Text style={styles.actionButtonText}>Buy Floor</Text>
          </TouchableOpacity>
          {buyBlinkUrl && (
            <View style={styles.blinkContainerBuy}>
              <BlinkExample url={buyBlinkUrl} />
            </View>
          )}
        </View>
      )}

      {/* SELL SECTION */}
      {activeTab === 'sell' && (
        <View style={styles.sellContainer}>
          <View style={styles.sellHeader}>
            <Text style={styles.infoText}>
              Your NFTs ({ownedNfts.length})
            </Text>
            <TouchableOpacity style={styles.reloadButton} onPress={fetchOwnedNfts}>
              <Text style={styles.reloadButtonText}>Reload</Text>
            </TouchableOpacity>
          </View>
          {fetchError && (
            <Text style={styles.errorText}>{fetchError}</Text>
          )}
          {loadingNfts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#32D4DE" />
              <Text style={styles.loadingText}>Fetching your NFTs...</Text>
            </View>
          ) : (
            <FlatList
              data={ownedNfts}
              keyExtractor={(item) => item.mint}
              renderItem={renderNftCard}
              numColumns={2}
              columnWrapperStyle={styles.nftGrid}
              contentContainerStyle={styles.nftList}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyListText}>No NFTs found in this wallet.</Text>
                </View>
              }
            />
          )}
        </View>
      )}

      {/* Modal for Listing/Selling NFT */}
      <Modal
        transparent
        visible={selectedNft !== null}
        animationType="fade"
        onRequestClose={() => setSelectedNft(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSelectedNft(null)}>
          <Pressable style={styles.sellForm} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.formTitle}>List NFT for Sale</Text>
            <View style={styles.selectedNftInfo}>
              <Text style={styles.label}>Selected NFT</Text>
              <Text style={styles.selectedNftName}>{selectedNft?.name}</Text>
              <Text style={styles.selectedMint}>{selectedNft?.mint}</Text>
            </View>
            <Text style={styles.label}>Sale Price (SOL)</Text>
            <TextInput
              style={styles.input}
              placeholder="1.0"
              keyboardType="numeric"
              value={salePrice}
              onChangeText={setSalePrice}
            />
            <Text style={styles.label}>Duration (days, optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 7"
              keyboardType="numeric"
              value={durationDays}
              onChangeText={setDurationDays}
            />
            <TouchableOpacity style={styles.actionButton} onPress={handleSellNftOnTensor}>
              <Text style={styles.actionButtonText}>List on Tensor</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

export default NftScreen;

/**
 * Styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 12,
  },
  warnText: {
    color: 'red',
    marginTop: 40,
    textAlign: 'center',
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    justifyContent: 'space-around',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    padding: 4,
  },
  tabButton: {
    flex: 1,
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#32D4DE',
  },
  tabButtonText: {
    color: '#2a2a2a',
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#ffffff',
  },
  contentContainer: {
    marginTop: 8,
    flex: 1,
  },
  sellContainer: {
    flex: 1,
  },
  label: {
    fontWeight: '600',
    marginVertical: 4,
    color: '#444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#dadada',
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  actionButton: {
    backgroundColor: '#32D4DE',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  blinkContainerBuy: {
    marginVertical: 16,
    flex: 1,
    minHeight: 500,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
  },
  blinkContainerSell: {
    marginVertical: 16,
    flex: 1,
    minHeight: 500,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 80,
  },
  sellHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  reloadButton: {
    backgroundColor: '#f3f3f3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  reloadButtonText: {
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#fff0f0',
    borderRadius: 4,
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  nftList: {
    paddingBottom: 120,
  },
  nftGrid: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  nftCard: {
    width: '48%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  nftCardSelected: {
    borderColor: '#32D4DE',
    borderWidth: 2,
    backgroundColor: '#f0fbfc',
  },
  imageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#f7f7f7',
  },
  nftImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
  },
  nftDetails: {
    padding: 8,
  },
  nftName: {
    fontWeight: '600',
    fontSize: 14,
    color: '#222',
    marginBottom: 4,
  },
  collectionName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  mintAddress: {
    fontSize: 10,
    color: '#999',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#32D4DE',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyListText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sellForm: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    width: '90%',
    borderWidth: 1,
    borderColor: '#eee',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  selectedNftInfo: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  selectedNftName: {
    fontWeight: '500',
    marginBottom: 4,
    color: '#222',
  },
  selectedMint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
});

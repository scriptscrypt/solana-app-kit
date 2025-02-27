import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { 
  Connection, 
  Transaction, 
  VersionedTransaction, 
  PublicKey 
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount 
} from '@solana/spl-token';

import { TENSOR_API_KEY } from '@env';
import { fetchWithRetries } from '../../utils/common/fetch';

const SOL_TO_LAMPORTS = 1_000_000_000;

interface NftItem {
  mint: string;
  name: string;
  uri?: string;
  symbol?: string;
  collection?: string;
  image?: string;
  priceSol?: number;
  description?: string;
  isCompressed?: boolean; // new flag
}

interface SellSectionProps {
  userPublicKey: string;
  userWallet: any;
}

/**
 * Helper to fix IPFS/Arweave/etc. URLs
 */
function fixImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('ipfs://')) return url.replace('ipfs://', 'https://ipfs.io/ipfs/');
  if (url.startsWith('ar://')) return url.replace('ar://', 'https://arweave.net/');
  if (url.startsWith('/')) return `https://arweave.net${url}`;
  if (!url.startsWith('http') && !url.startsWith('data:')) return `https://${url}`;
  return url;
}

/**
 * Ensures the ATA (associated token account) for (mint, userPublicKey) exists.
 * If not, creates it before we proceed with the listing.
 */
async function ensureAtaIfNeeded(
  connection: Connection,
  mint: string,
  owner: string,
  userWallet: any
) {
  const mintPubkey = new PublicKey(mint);
  const ownerPubkey = new PublicKey(owner);

  // Derive the ATA
  const ataAddr = await getAssociatedTokenAddress(mintPubkey, ownerPubkey);
  try {
    // If getAccount() succeeds, the ATA is already initialized
    await getAccount(connection, ataAddr);
    // No need to create
    return ataAddr;
  } catch (err) {
    console.log('ATA not found, creating it now...', ataAddr.toBase58());
  }

  // Construct a tx to create the associated token account
  const createTx = new Transaction();
  const instruction = createAssociatedTokenAccountInstruction(
    ownerPubkey,   // payer
    ataAddr,       // the new associated token account address
    ownerPubkey,   // token account owner
    mintPubkey     // mint
  );
  createTx.add(instruction);

  // Set feePayer, blockhash
  const { blockhash } = await connection.getLatestBlockhash();
  createTx.recentBlockhash = blockhash;
  createTx.feePayer = ownerPubkey;

  // Request the wallet to sign & send
  const provider = await userWallet.getProvider();
  console.log('Creating ATA transaction, signing now...');
  const { signature } = await provider.request({
    method: 'signAndSendTransaction',
    params: { transaction: createTx, connection }
  });

  console.log('ATA creation sig:', signature);
  // Once confirmed, the ATA is created
  return ataAddr;
}

const SellSection: React.FC<SellSectionProps> = ({ userPublicKey, userWallet }) => {
  const [loadingNfts, setLoadingNfts] = useState(false);
  const [ownedNfts, setOwnedNfts] = useState<NftItem[]>([]);
  const [selectedNft, setSelectedNft] = useState<NftItem | null>(null);
  const [salePrice, setSalePrice] = useState<string>('1.0');
  const [durationDays, setDurationDays] = useState<string>('');

  const [activeListings, setActiveListings] = useState<NftItem[]>([]);
  const [loadingActiveListings, setLoadingActiveListings] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // -------------------------------------------------------------------------
  // 1) On mount, fetch both owned NFTs & active listings
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (userPublicKey) {
      fetchOwnedNfts();
      fetchActiveListings();
    }
  }, [userPublicKey]);

  // -------------------------------------------------------------------------
  // 2) Fetch user’s NFTs from Tensor portfolio
  //    Mark compressed NFTs with isCompressed
  // -------------------------------------------------------------------------
  const fetchOwnedNfts = useCallback(async () => {
    if (!userPublicKey) return;
    setLoadingNfts(true);
    setOwnedNfts([]);
    setFetchError(null);

    const url = `https://api.mainnet.tensordev.io/api/v1/user/portfolio?wallet=${userPublicKey}&includeUnverified=true&includeCompressed=true`;
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        'x-tensor-api-key': TENSOR_API_KEY
      }
    };

    try {
      const response = await fetchWithRetries(url, options);
      if (!response.ok) {
        throw new Error(`Portfolio API request failed with status ${response.status}`);
      }
      const data = await response.json();

      const dataArray = Array.isArray(data) ? data : [];
      const mappedNfts: NftItem[] = dataArray.map((item: any) => {
        if (!item.setterMintMe) return null;
        const mint = item.setterMintMe;
        const name = item.name || 'Unnamed NFT';
        const image = item.imageUri ? fixImageUrl(item.imageUri) : '';
        const description = item.description || '';
        const symbol = item.symbol || '';
        const collection = item.slugDisplay || '';
        const isCompressed = !!item.compressed;

        let priceSol;
        if (item.statsV2?.buyNowPrice) {
          const lamports = parseInt(item.statsV2.buyNowPrice, 10);
          priceSol = lamports / SOL_TO_LAMPORTS;
        }

        return {
          mint,
          name,
          description,
          symbol,
          collection,
          image,
          priceSol,
          isCompressed
        };
      }).filter(Boolean) as NftItem[];

      console.log('Mapped NFTs:', mappedNfts);
      setOwnedNfts(mappedNfts);
    } catch (error: any) {
      console.error('Error fetching portfolio:', error);
      setFetchError(error.message);
    } finally {
      setLoadingNfts(false);
    }
  }, [userPublicKey]);

  // -------------------------------------------------------------------------
  // 3) Fetch active listings from Tensor
  // -------------------------------------------------------------------------
  const fetchActiveListings = useCallback(async () => {
    if (!userPublicKey) return;
    setLoadingActiveListings(true);

    try {
      const url = `https://api.mainnet.tensordev.io/api/v1/user/active_listings?wallets=${userPublicKey}&sortBy=PriceAsc&limit=50`;
      const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          'x-tensor-api-key': TENSOR_API_KEY
        }
      };
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`Failed to fetch active listings: ${res.status}`);
      }
      const data = await res.json();

      if (data.listings && Array.isArray(data.listings)) {
        const mappedListings = data.listings.map((item: any) => {
          const mintObj = item.mint || {};
          const mintAddress = (typeof item.mint === 'object' && item.mint.onchainId)
            ? item.mint.onchainId
            : item.mint;
          const nftName = mintObj?.name || 'Unnamed NFT';
          const nftImage = fixImageUrl(mintObj?.imageUri || '');
          const nftCollection = mintObj?.collName || '';
          const lamports = parseInt(item.grossAmount || '0', 10);
          const priceSol = lamports / SOL_TO_LAMPORTS;

          return {
            mint: mintAddress,
            name: nftName,
            collection: nftCollection,
            image: nftImage,
            priceSol
          } as NftItem;
        });
        console.log('Mapped active listings:', mappedListings);
        setActiveListings(mappedListings);
      } else {
        setActiveListings([]);
      }
    } catch (err: any) {
      console.error('Error fetching active listings:', err);
      Alert.alert('Error', err.message || 'Failed to fetch active listings');
    } finally {
      setLoadingActiveListings(false);
    }
  }, [userPublicKey]);

  // -------------------------------------------------------------------------
  // 4) Handle listing with “NFT List” endpoint (legacy). 
  //    If compressed => block. 
  //    If uninitialized ATA => create it, then proceed.
  // -------------------------------------------------------------------------
  const handleSellNftOnTensor = async () => {
    if (!selectedNft) {
      console.log('No NFT selected. Aborting listing.');
      return;
    }

    // If the NFT is compressed, block listing
    if (selectedNft.isCompressed) {
      Alert.alert(
        'Compressed NFT Not Supported',
        'This NFT is compressed. Tensor’s Legacy listing endpoint cannot list compressed NFTs.'
      );
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
      const mintAddress = selectedNft.mint;
      const priceLamports = Math.floor(parseFloat(salePrice) * SOL_TO_LAMPORTS);

      // Attempt to ensure the ATA is created for this mint
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      await ensureAtaIfNeeded(connection, mintAddress, userPublicKey, userWallet);

      // Optional expiry
      let expiryParam = '';
      if (durationDays && !isNaN(parseFloat(durationDays))) {
        const nowSeconds = Math.floor(Date.now() / 1000);
        const addedSeconds = parseFloat(durationDays) * 24 * 60 * 60;
        const expiryTs = Math.floor(nowSeconds + addedSeconds);
        expiryParam = `&expiry=${expiryTs}`;
        console.log(`Listing will expire in ${durationDays} day(s) => ${expiryTs}`);
      }

      // Get blockhash for listing TX
      const { blockhash } = await connection.getRecentBlockhash();
      console.log('Obtained recent blockhash:', blockhash);

      // Construct the list URL
      const listUrl =
        `https://api.mainnet.tensordev.io/api/v1/tx/list` +
        `?seller=${userPublicKey}&owner=${userPublicKey}` +
        `&mint=${mintAddress}&price=${priceLamports}` +
        `&blockhash=${blockhash}${expiryParam}`;

      console.log('Tensor listing URL:', listUrl);

      const resp = await fetch(listUrl, {
        headers: { 'x-tensor-api-key': TENSOR_API_KEY }
      });
      const rawText = await resp.text();
      console.log('Raw response from Tensor (list):', rawText);

      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.error('Failed to parse Tensor response as JSON. Full text:', rawText);
        throw new Error('Tensor returned non-JSON response. Check console for details.');
      }

      if (!data.txs || data.txs.length === 0) {
        throw new Error('No transactions returned from Tensor API for listing.');
      }

      // Execute each transaction
      for (let i = 0; i < data.txs.length; i++) {
        const txObj = data.txs[i];
        let transaction: Transaction | VersionedTransaction;

        if (txObj.txV0) {
          const txBuffer = Buffer.from(txObj.txV0.data, 'base64');
          transaction = VersionedTransaction.deserialize(txBuffer);
          console.log(`Deserialized versioned transaction #${i + 1}`);
        } else if (txObj.tx) {
          const txBuffer = Buffer.from(txObj.tx.data, 'base64');
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
    } catch (err: any) {
      console.error('Error listing NFT on Tensor:', err);
      Alert.alert('Error', err.message || 'Failed to list NFT on Tensor.');
    } finally {
      setSelectedNft(null);
      setSalePrice('1.0');
      setDurationDays('');
    }
  };

  // -------------------------------------------------------------------------
  // 5) Renders an active listing
  // -------------------------------------------------------------------------
  const renderActiveListingCard = ({ item }: { item: NftItem }) => {
    return (
      <View style={styles.listedCard}>
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.nftImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>
        <View style={styles.nftDetails}>
          <Text style={styles.nftName} numberOfLines={1}>
            {item.name}
          </Text>
          {!!item.collection && (
            <Text style={styles.collectionName} numberOfLines={1}>
              {item.collection}
            </Text>
          )}
          <Text style={styles.mintAddress} numberOfLines={1}>
            {item.mint
              ? item.mint.slice(0, 8) + '...' + item.mint.slice(-4)
              : 'No Mint'}
          </Text>
          {item.priceSol !== undefined && (
            <Text style={styles.priceText}>
              Listed @ {item.priceSol.toFixed(2)} SOL
            </Text>
          )}
        </View>
      </View>
    );
  };

  // -------------------------------------------------------------------------
  // 6) Renders each owned NFT card; tap to select
  // -------------------------------------------------------------------------
  const renderNftCard = ({ item }: { item: NftItem }) => {
    const isSelected = selectedNft?.mint === item.mint;
    return (
      <TouchableOpacity
        style={[styles.nftCard, isSelected && styles.nftCardSelected]}
        onPress={() => setSelectedNft(item)}
      >
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.nftImage} resizeMode="cover" />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>
        <View style={styles.nftDetails}>
          <Text style={styles.nftName} numberOfLines={1}>
            {item.name || 'Unnamed'}
          </Text>
          {!!item.collection && (
            <Text style={styles.collectionName} numberOfLines={1}>
              {item.collection}
            </Text>
          )}
          {item.description ? (
            <Text style={{ fontSize: 10, color: '#666', marginVertical: 2 }} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
          <Text style={styles.mintAddress} numberOfLines={1}>
            {item.mint
              ? item.mint.slice(0, 8) + '...' + item.mint.slice(-4)
              : 'No Mint'}
          </Text>
          {/* Optionally show isCompressed status */}
        </View>
        {isSelected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // -------------------------------------------------------------------------
  // 7) Render the main Sell Section UI
  // -------------------------------------------------------------------------
  return (
    <View style={{ flex: 1 }}>
      {/* Active Listings */}
      <View style={styles.sellHeader}>
        <Text style={styles.infoText}>Active Listings ({activeListings.length})</Text>
        <TouchableOpacity style={styles.reloadButton} onPress={fetchActiveListings}>
          <Text style={styles.reloadButtonText}>Reload Active Listings</Text>
        </TouchableOpacity>
      </View>
      {loadingActiveListings ? (
        <ActivityIndicator size="large" color="#32D4DE" style={{ marginVertical: 16 }} />
      ) : (
        <FlatList
          data={activeListings}
          keyExtractor={(item) => item.mint}
          renderItem={renderActiveListingCard}
          horizontal
          contentContainerStyle={{ paddingHorizontal: 4 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyListText}>No active listings found.</Text>
            </View>
          }
        />
      )}

      {/* Owned NFTs */}
      <View style={styles.sellHeader}>
        <Text style={styles.infoText}>Your NFTs ({ownedNfts.length})</Text>
        <TouchableOpacity style={styles.reloadButton} onPress={fetchOwnedNfts}>
          <Text style={styles.reloadButtonText}>Reload</Text>
        </TouchableOpacity>
      </View>
      {fetchError && <Text style={styles.errorText}>{fetchError}</Text>}
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
              <Text style={styles.emptyListText}>No items found in this wallet.</Text>
            </View>
          }
        />
      )}

      {/* Modal: Listing Form */}
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
    </View>
  );
};

export default SellSection;

// -------------------- STYLES --------------------
const styles = StyleSheet.create({
  sellHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
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
  listedCard: {
    width: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    margin: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  priceText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  nftList: {
    paddingBottom: 80,
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
  label: {
    fontWeight: '600',
    marginVertical: 4,
    color: '#444',
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
});

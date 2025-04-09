import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TabView, SceneMap, SceneRendererProps, NavigationState } from 'react-native-tab-view';
import SearchIcon from '../../../assets/svg/SearchIcon';
import CloseIcon from '../../../assets/svg/CloseIcon';
import { SERVER_URL, BIRDEYE_API_KEY } from '@env';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import TokenDetailsSheet from '../../../modules/onChainData/components/TrendingTokenDetails/TokenDetailsSheet';
import { getTokenRiskReport, getRiskScoreColor, getRiskLevel } from '../../../services/rugCheckService';

const { width } = Dimensions.get('window');

type User = {
  id: string;
  username: string;
  profile_picture_url: string | null;
};

type Token = {
  address: string;
  name: string;
  symbol: string;
  logoURI?: string;
  price: number;
  priceChange24h?: number;
  rank?: number;
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  isRugged?: boolean;
  riskLoading?: boolean;
  riskError?: boolean;
};

// Define the route type
type RouteType = {
  key: string;
  title: string;
};

export default function SearchScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');

  // Tabs state
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'profiles', title: 'Profiles' },
    { key: 'tokens', title: 'Tokens' },
  ]);

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Tokens state
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(false);

  // Selected token state
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isTokenDetailsVisible, setIsTokenDetailsVisible] = useState(false);

  // Get the status bar height for Android
  const STATUSBAR_HEIGHT = Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0;

  // Fetch users and tokens on component mount
  useEffect(() => {
    fetchUsers();
    fetchTrendingTokens();
  }, []);

  // Filter users and tokens when search query changes
  useEffect(() => {
    // Filter users
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(query)
      );
      setFilteredUsers(filtered);
    }

    // Filter tokens
    if (searchQuery.trim() === '') {
      setFilteredTokens(tokens);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = tokens.filter(token =>
        token.name.toLowerCase().includes(query) ||
        token.symbol.toLowerCase().includes(query)
      );
      setFilteredTokens(filtered);
    }
  }, [searchQuery, users, tokens]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      console.log('Fetching users from:', `${SERVER_URL}/api/profile/search`);
      const response = await fetch(`${SERVER_URL}/api/profile/search`);

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      console.log('Fetched user data:', data);

      if (data.success && data.users) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      } else {
        console.error('Invalid response format:', data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchTrendingTokens = async () => {
    setLoadingTokens(true);
    try {
      // Using BirdEye API to get trending tokens with proper params and API key
      const response = await fetch(
        'https://public-api.birdeye.so/defi/token_trending?sort_by=rank&sort_type=asc&offset=0&limit=20',
        {
          method: 'GET',
          headers: {
            'accept': 'application/json',
            'x-chain': 'solana',
            'X-API-KEY': BIRDEYE_API_KEY
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch trending tokens');

      const data = await response.json();
      console.log('Fetched token data:', data);

      if (data.success && data.data?.tokens) {
        const formattedTokens: Token[] = data.data.tokens.map((token: any) => ({
          address: token.address,
          name: token.name,
          symbol: token.symbol,
          logoURI: token.logoURI,
          price: token.price,
          priceChange24h: token.price24hChangePercent,
          rank: token.rank,
          riskLoading: true, // Initially set to loading state
        }));

        // Set the initial token list first to show content quickly
        setTokens(formattedTokens);
        setFilteredTokens(formattedTokens);

        // Fetch risk data for each token in the background
        const tokensWithRiskPromises = formattedTokens.map(async (token) => {
          try {
            console.log(`Fetching risk data for token: ${token.symbol} (${token.address})`);
            const riskReport = await getTokenRiskReport(token.address);

            if (riskReport) {
              console.log(`Received risk data for ${token.symbol}: score=${riskReport.score_normalised}, rugged=${riskReport.rugged}`);
              return {
                ...token,
                riskScore: riskReport.score_normalised,
                riskLevel: getRiskLevel(riskReport.score_normalised),
                isRugged: riskReport.rugged,
                riskLoading: false,
              };
            } else {
              console.log(`No risk data available for ${token.symbol}`);
              return {
                ...token,
                riskLoading: false,
                riskError: true
              };
            }
          } catch (error) {
            console.error(`Error fetching risk data for ${token.symbol}:`, error);
            return {
              ...token,
              riskLoading: false,
              riskError: true
            };
          }
        });

        // Update tokens when all risk data has been fetched
        const tokensWithRisk = await Promise.all(tokensWithRiskPromises);
        console.log('Updated tokens with risk data:', tokensWithRisk.map(t => ({ symbol: t.symbol, riskScore: t.riskScore })));
        setTokens(tokensWithRisk);
        setFilteredTokens(tokensWithRisk);
      } else {
        console.error('Invalid token response format:', data);
      }
    } catch (error) {
      console.error('Error fetching trending tokens:', error);
    } finally {
      setLoadingTokens(false);
    }
  };

  const handleUserPress = (user: User) => {
    navigation.navigate('OtherProfile', { userId: user.id });
  };

  // Token item press handler (placeholder - implement as needed)
  const handleTokenPress = (token: Token) => {
    setSelectedToken(token);
    setIsTokenDetailsVisible(true);
  };

  // PROFILE TAB COMPONENTS

  const renderUserItem = ({ item }: { item: User }) => {
    // Handle profile picture URL for Android - transform IPFS URLs to avoid 403/429 errors
    const getProfileImageSource = () => {
      // Default fallback image
      if (!item.profile_picture_url) {
        return require('../../../assets/images/User.png');
      }

      // On iOS, use the original URL directly - no transformations needed
      if (Platform.OS === 'ios') {
        return { uri: item.profile_picture_url };
      }

      // ANDROID ONLY - Transform IPFS URLs to avoid loading issues
      const profileUrl = String(item.profile_picture_url);

      // Handle ipfs.io URLs
      if (profileUrl.includes('ipfs.io/ipfs/')) {
        const parts = profileUrl.split('/ipfs/');
        if (parts.length > 1) {
          const ipfsHash = parts[1].split('?')[0]?.split('#')[0];
          if (ipfsHash) {
            return { uri: `https://nftstorage.link/ipfs/${ipfsHash}` };
          }
        }
      }
      // Handle ipfs:// protocol
      else if (profileUrl.startsWith('ipfs://')) {
        const ipfsHash = profileUrl.slice(7).split('?')[0]?.split('#')[0];
        if (ipfsHash) {
          return { uri: `https://nftstorage.link/ipfs/${ipfsHash}` };
        }
      }

      // Not an IPFS URL or couldn't extract hash, use original
      return { uri: profileUrl };
    };

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => handleUserPress(item)}
        activeOpacity={0.7}
      >
        <Image
          source={getProfileImageSource()}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.userId}>@{item.id.substring(0, 6)}...{item.id.substring(item.id.length - 4)}</Text>
        </View>
        <View style={styles.arrowContainer}>
          <Text style={styles.arrow}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // TOKEN TAB COMPONENTS

  const renderTokenItem = ({ item }: { item: Token }) => {
    const priceChangeColor =
      !item.priceChange24h ? '#999' :
        item.priceChange24h >= 0 ? '#4CAF50' : '#F44336';

    const formattedPrice = item.price < 0.01
      ? item.price.toFixed(8)
      : item.price.toFixed(2);

    const formattedPriceChange = item.priceChange24h
      ? `${item.priceChange24h >= 0 ? '+' : ''}${item.priceChange24h.toFixed(2)}%`
      : 'N/A';

    // Get rank display (medal or number)
    const getRankDisplay = (rank: number) => {
      switch (rank) {
        case 1:
          return <Text style={styles.medalEmoji}>🥇</Text>;
        case 2:
          return <Text style={styles.medalEmoji}>🥈</Text>;
        case 3:
          return <Text style={styles.medalEmoji}>🥉</Text>;
        default:
          return <Text style={styles.rankNumber}>{rank}</Text>;
      }
    };

    return (
      <TouchableOpacity
        style={styles.tokenItem}
        onPress={() => handleTokenPress(item)}
        activeOpacity={0.7}
      >
        {/* Rank Display */}
        <View style={styles.rankContainer}>
          {getRankDisplay(item.rank || 0)}
        </View>

        {/* Token Logo */}
        <View style={styles.tokenLogoContainer}>
          {item.logoURI ? (
            <Image
              source={{ uri: item.logoURI }}
              style={styles.tokenLogo}
              defaultSource={require('../../../assets/images/SENDlogo.png')}
            />
          ) : (
            <View style={styles.tokenLogoPlaceholder}>
              <Text style={styles.tokenLogoText}>
                {item.symbol[0] || '?'}
              </Text>
            </View>
          )}
        </View>

        {/* Token Info */}
        <View style={styles.tokenInfo}>
          <Text style={styles.tokenSymbol}>{item.symbol}</Text>
          <Text style={styles.tokenName} numberOfLines={1}>{item.name}</Text>
        </View>

        {/* Token Price Info */}
        <View style={styles.tokenPriceContainer}>
          <Text style={styles.tokenPrice}>${formattedPrice}</Text>
          <Text style={[styles.tokenPriceChange, { color: priceChangeColor }]}>
            {formattedPriceChange}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // TAB SCENES

  const ProfilesTab = () => (
    <View style={styles.tabContent}>
      {loadingUsers ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0099ff" style={styles.loader} />
          <Text style={styles.loaderText}>Searching for users...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          renderItem={renderUserItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.length > 0 ? 'No users found matching your search' : 'No users available'}
              </Text>
              <Text style={styles.emptySubText}>
                {searchQuery.length > 0 ? 'Try different keywords' : 'Check back later'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );

  const TokensTab = () => (
    <View style={styles.tabContent}>
      {loadingTokens ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0099ff" style={styles.loader} />
          <Text style={styles.loaderText}>Loading trending tokens...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTokens}
          renderItem={renderTokenItem}
          keyExtractor={item => item.address}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery.length > 0 ? 'No tokens found matching your search' : 'No trending tokens available'}
              </Text>
              <Text style={styles.emptySubText}>
                {searchQuery.length > 0 ? 'Try different keywords' : 'Check back later'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );

  const renderScene = SceneMap({
    profiles: ProfilesTab,
    tokens: TokensTab,
  });

  // Custom tab bar component
  const CustomTabBar = () => {
    return (
      <View style={styles.tabBarContainer}>
        <TouchableOpacity
          style={[styles.tab, index === 0 && styles.activeTab]}
          onPress={() => setIndex(0)}
        >
          <Text style={[styles.tabText, index === 0 && styles.activeTabText]}>
            Profiles
          </Text>
          {index === 0 && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, index === 1 && styles.activeTab]}
          onPress={() => setIndex(1)}
        >
          <Text style={[styles.tabText, index === 1 && styles.activeTabText]}>
            Tokens
          </Text>
          {index === 1 && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <>
      {Platform.OS === 'android' && <View style={{ height: STATUSBAR_HEIGHT, backgroundColor: '#fff' }} />}
      <SafeAreaView style={[
        styles.safeArea,
        Platform.OS === 'android' && androidStyles.safeArea
      ]}>
        <View style={[
          styles.header,
          Platform.OS === 'android' && androidStyles.header
        ]}>
          <Text style={styles.headerTitle}>Search</Text>
        </View>

        <View style={styles.searchContainer}>
          <View style={styles.searchIcon}>
            <SearchIcon size={20} color="#666" />
          </View>
          <TextInput
            style={styles.searchInput}
            placeholder={index === 0 ? "Search by username..." : "Search tokens..."}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => setSearchQuery('')}
            >
              <CloseIcon size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>

        <CustomTabBar />

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width }}
          swipeEnabled={true}
          renderTabBar={() => null}
          lazy
        />

        {selectedToken && (
          <TokenDetailsSheet
            visible={isTokenDetailsVisible}
            onClose={() => setIsTokenDetailsVisible(false)}
            token={selectedToken}
          />
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  tabBarContainer: {
    flexDirection: 'row',
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#888',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    width: '50%',
    backgroundColor: '#000',
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  tabContent: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    margin: 16,
    paddingHorizontal: 12,
    height: 46,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  listContainer: {
    paddingBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    marginBottom: 10,
  },
  loaderText: {
    fontSize: 14,
    color: '#666',
  },
  // User Item Styles
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
  },
  userInfo: {
    marginLeft: 16,
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  userId: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  arrowContainer: {
    padding: 8,
  },
  arrow: {
    fontSize: 20,
    color: '#999',
    fontWeight: '300',
  },
  // Token Item Styles
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  tokenLogoContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  tokenLogo: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  tokenLogoPlaceholder: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenLogoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
  },
  tokenInfo: {
    marginLeft: 16,
    flex: 1,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  tokenName: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  tokenPriceContainer: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  tokenPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  tokenPriceChange: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#555',
    textAlign: 'center',
  },
  emptySubText: {
    marginTop: 8,
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
  rankContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  medalEmoji: {
    fontSize: 20,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});

// Enhanced Android-specific styles
const androidStyles = StyleSheet.create({
  safeArea: {
    paddingTop: 0,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 15,
  },
  // Add any other Android-specific style overrides here
});


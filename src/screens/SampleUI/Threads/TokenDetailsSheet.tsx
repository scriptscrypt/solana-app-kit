import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    StyleSheet,
    Dimensions,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { BIRDEYE_API_KEY } from '@env';
import LineGraph from '@/core/sharedUI/Common/TradeCard/LineGraph';
import { Timeframe, useCoingecko } from '@/modules/onChainData/hooks/useCoingecko';


const { width } = Dimensions.get('window');

interface TokenDetailsSheetProps {
    visible: boolean;
    onClose: () => void;
    token: {
        address: string;
        name: string;
        symbol: string;
        logoURI?: string;
        price: number;
        priceChange24h?: number;
    };
}

interface PriceHistoryItem {
    unixTime: number;
    value: number;
    marketCap?: number;
    volume?: number;
}

interface BirdEyeHistoryItem {
    unixTime: number;
    value: number;
}

interface BirdEyeHistoryResponse {
    success: boolean;
    data?: {
        items: BirdEyeHistoryItem[];
    };
}

interface CoinGeckoResponse {
    prices?: [number, number][];
    market_caps?: [number, number][];
    total_volumes?: [number, number][];
}

interface TokenMetadata {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    extensions: {
        coingecko_id?: string;
        website?: string;
        twitter?: string;
        discord?: string;
    };
    logo_uri: string;
}

const TokenDetailsSheet: React.FC<TokenDetailsSheetProps> = ({
    visible,
    onClose,
    token,
}) => {
    const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);
    const [metadata, setMetadata] = useState<TokenMetadata | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedTimeframe, setSelectedTimeframe] = useState<string>('1D');

    // Initialize the useCoingecko hook
    const {
        timeframe,
        setTimeframe,
        graphData,
        timestamps,
        setSelectedCoinId,
        loadingOHLC,
    } = useCoingecko();

    useEffect(() => {
        if (visible && token.address) {
            fetchTokenData();
            // Fetch initial price history with 1D timeframe
            handleTimeframeChange('1D');
        }
    }, [visible, token.address]);

    // Add new effect to sync metadata with CoinGecko
    useEffect(() => {
        if (metadata?.extensions?.coingecko_id) {
            console.log(`Setting CoinGecko ID: ${metadata.extensions.coingecko_id}`);
            setSelectedCoinId(metadata.extensions.coingecko_id);
        }
    }, [metadata, setSelectedCoinId]);

    // Listen for changes in graphData from CoinGecko
    useEffect(() => {
        // Skip for the short timeframes which use BirdEye
        const currentTimeframe = selectedTimeframe;
        if ((currentTimeframe === '1W' || currentTimeframe === '1M' ||
            currentTimeframe === 'YTD' || currentTimeframe === 'ALL') &&
            graphData.length > 0 && timestamps.length > 0) {

            console.log(`Received CoinGecko data for ${currentTimeframe}, ${graphData.length} points`);
            // Convert the graphData and timestamps from useCoingecko to our PriceHistoryItem format
            const items: PriceHistoryItem[] = graphData.map((value: number, index: number) => ({
                unixTime: Math.floor(timestamps[index] / 1000), // Convert ms to seconds
                value: value
            }));

            setPriceHistory(items);
            setLoading(false); // CoinGecko data has arrived
        }
    }, [graphData, timestamps, selectedTimeframe]);

    const fetchTokenData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchTokenMetadata(),
            ]);
        } catch (error) {
            console.error('Error fetching token data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getBirdeyeTimeParams = (timeframe: string): { type: string; time_from: number; time_to: number } => {
        const now = Math.floor(Date.now() / 1000);
        let type = '15m';
        let time_from = now - 60 * 60; // Default to 1H

        switch (timeframe) {
            case '1H':
                type = '1m';
                time_from = now - 60 * 60;
                break;
            case '1D':
                type = '15m';
                time_from = now - 24 * 60 * 60;
                break;
            case '1W':
                type = '1h';
                time_from = now - 7 * 24 * 60 * 60;
                break;
            case '1M':
                type = '4h';
                time_from = now - 30 * 24 * 60 * 60;
                break;
            case 'YTD':
            case 'ALL':
                type = '1D'; // Birdseye uses 1D for daily
                // For YTD/ALL, let's fetch a longer history, e.g., 1 year for YTD, or a very large range for ALL if needed
                const startOfYear = Math.floor(new Date(new Date().getFullYear(), 0, 1).getTime() / 1000);
                time_from = timeframe === 'YTD' ? startOfYear : now - 5 * 365 * 24 * 60 * 60; // 5 years for ALL? Adjust as needed
                break;
        }
        return { type, time_from, time_to: now };
    };

    const getCoinGeckoTimeParams = (timeframe: string): { days: string; interval?: string } => {
        switch (timeframe) {
            case '1H': return { days: '1', interval: '5m' }; // CoinGecko needs interval for < 1 day
            case '1D': return { days: '1' };
            case '1W': return { days: '7' };
            case '1M': return { days: '30' };
            case 'YTD': return { days: String(Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24))) };
            case 'ALL': return { days: 'max' };
            default: return { days: '1' };
        }
    };

    const fetchPriceHistory = async (timeframe: string) => {
        setLoading(true);
        setPriceHistory([]); // Clear previous history
        const { address } = token;

        // For 1H and 1D, use BirdEye API (more reliable for short timeframes)
        if (timeframe === '1H' || timeframe === '1D') {
            const birdeyeParams = getBirdeyeTimeParams(timeframe);
            const birdeyeUrl = `https://public-api.birdeye.so/defi/history_price?address=${address}&address_type=token&type=${birdeyeParams.type}&time_from=${birdeyeParams.time_from}&time_to=${birdeyeParams.time_to}`;
            const birdeyeOptions = {
                method: 'GET',
                headers: {
                    'accept': 'application/json',
                    'x-chain': 'solana',
                    'X-API-KEY': BIRDEYE_API_KEY
                }
            };

            try {
                console.log(`Fetching BirdEye history for ${timeframe}: ${address}`);
                const birdeyeResponse = await fetch(birdeyeUrl, birdeyeOptions);

                if (birdeyeResponse.ok) {
                    const birdeyeData: BirdEyeHistoryResponse = await birdeyeResponse.json();
                    if (birdeyeData.success && birdeyeData.data?.items && birdeyeData.data.items.length > 0) {
                        const items: PriceHistoryItem[] = birdeyeData.data.items.map((item: BirdEyeHistoryItem) => ({
                            unixTime: item.unixTime,
                            value: item.value
                        }));
                        setPriceHistory(items);
                        setLoading(false);
                        return; // Success with BirdEye
                    }
                    console.log('BirdEye response OK but data invalid/empty.');
                } else {
                    const errorText = await birdeyeResponse.text();
                    console.error(`BirdEye API Error: Status ${birdeyeResponse.status}`, errorText);
                }
            } catch (error) {
                console.error('Error fetching BirdEye price history:', error);
            }
        }

        // For longer timeframes (1W, 1M, YTD, ALL) or if BirdEye failed for short timeframes,
        // Set the timeframe in useCoingecko hook to trigger data fetch
        try {
            // Map our timeframe to Coingecko's format
            const coinGeckoTimeframe = timeframe === 'YTD' || timeframe === 'ALL' ? 'All' : timeframe as Timeframe;

            // Set the timeframe in the hook to trigger a data fetch
            console.log(`Setting CoinGecko timeframe to ${coinGeckoTimeframe}`);
            setTimeframe(coinGeckoTimeframe);

            // The data will be updated via the useEffect hook when graphData changes
            // Keep loading state true - it will be set to false when data arrives
        } catch (error) {
            console.error('Error using CoinGecko data:', error);
            setPriceHistory([]);
            setLoading(false);
        }
    };

    const fetchTokenMetadata = async () => {
        try {
            const response = await fetch(
                `https://public-api.birdeye.so/defi/v3/token/meta-data/single?address=${token.address}`,
                {
                    method: 'GET',
                    headers: {
                        accept: 'application/json',
                        'x-chain': 'solana',
                        'X-API-KEY': BIRDEYE_API_KEY
                    }
                }
            );
            const data = await response.json();
            if (data.success && data.data) {
                setMetadata(data.data);
            }
        } catch (error) {
            console.error('Error fetching token metadata:', error);
        }
    };

    const formatPrice = (price: number) => {
        return price < 0.01 ? price.toFixed(8) : price.toFixed(2);
    };

    const formatPriceChange = (change?: number) => {
        if (!change) return 'N/A';
        return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
    };

    const formatDollarChange = (price: number, change?: number) => {
        if (!change) return 'N/A';
        const dollarChange = (price * change) / 100;
        return `${dollarChange >= 0 ? '+' : ''}$${Math.abs(dollarChange).toFixed(8)}`;
    };

    const getGraphData = () => {
        if (!priceHistory.length) return [];

        const values = priceHistory.map(item => item.value);

        // If all values are the same, create slight variations for visualization
        const allSame = values.every(v => v === values[0]);
        if (allSame) {
            return values.map((v, i) => v * (1 + (Math.sin(i * 0.1) * 0.001)));
        }

        // Return actual values if they're different
        return values;
    };

    const getTimestamps = () => {
        return priceHistory.map(item => item.unixTime * 1000);
    };

    // Update timeframe handler
    const handleTimeframeChange = async (tf: string) => {
        setSelectedTimeframe(tf);
        fetchPriceHistory(tf);
    };

    return (
        <Modal
            animationType="slide"
            transparent
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay} />
            </TouchableWithoutFeedback>

            <View style={styles.container}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Text style={styles.closeButtonText}>×</Text>
                </TouchableOpacity>

                <ScrollView style={styles.content}>
                    {/* Token Header */}
                    <View style={styles.header}>
                        <Image
                            source={{ uri: token.logoURI }}
                            style={styles.tokenLogo}
                            defaultSource={require('../../../assets/images/SENDlogo.png')}
                        />
                        <View style={styles.tokenInfo}>
                            <Text style={styles.tokenName}>{token.name}</Text>
                            <Text style={styles.tokenSymbol}>{token.symbol}</Text>
                        </View>
                    </View>

                    {/* Price Information */}
                    <View style={styles.priceContainer}>
                        <Text style={styles.price}>${formatPrice(token.price)}</Text>
                        <View style={styles.priceChangeContainer}>
                            <Text style={[
                                styles.priceChangeAmount,
                                { color: token.priceChange24h && token.priceChange24h >= 0 ? '#4CAF50' : '#F44336' }
                            ]}>
                                {formatDollarChange(token.price, token.priceChange24h)}
                            </Text>
                            <View style={[
                                styles.percentageBox,
                                { backgroundColor: token.priceChange24h && token.priceChange24h >= 0 ? '#4CAF50' : '#F44336' }
                            ]}>
                                <Text style={styles.percentageText}>
                                    {formatPriceChange(token.priceChange24h)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Update Chart Section */}
                    <View style={styles.chartContainer}>
                        {loading ? (
                            <ActivityIndicator size="large" color="#32D4DE" />
                        ) : (
                            <>
                                <View style={styles.timeframeContainer}>
                                    {['1H', '1D', '1W', '1M', 'YTD', 'ALL'].map((tf) => (
                                        <TouchableOpacity
                                            key={tf}
                                            style={[
                                                styles.timeframeButton,
                                                selectedTimeframe === tf && styles.selectedTimeframe
                                            ]}
                                            onPress={() => handleTimeframeChange(tf)}
                                        >
                                            <Text style={[
                                                styles.timeframeText,
                                                selectedTimeframe === tf && styles.selectedTimeframeText
                                            ]}>
                                                {tf}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                {priceHistory.length > 0 ? (
                                    <View style={styles.graphWrapper}>
                                        <LineGraph
                                            data={getGraphData()}
                                            width={width - 72}
                                            timestamps={getTimestamps()}
                                        />
                                    </View>
                                ) : (
                                    <View style={styles.noDataContainer}>
                                        <Text style={styles.noDataText}>No price data available</Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>

                    {/* Info Section */}
                    <View style={styles.infoSection}>
                        <Text style={styles.sectionTitle}>Info</Text>
                        <View style={styles.infoGrid}>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Created On</Text>
                                <Text style={styles.infoValue}>pump.fun</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Status</Text>
                                <Text style={styles.infoValue}>Graduated</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Mint</Text>
                                <Text style={styles.infoValue} numberOfLines={1}>
                                    {token.address.substring(0, 6)}...{token.address.substring(token.address.length - 6)}
                                </Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Market Cap</Text>
                                <Text style={styles.infoValue}>$8.64M</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Circulating Supply</Text>
                                <Text style={styles.infoValue}>999.92M</Text>
                            </View>
                            <View style={styles.infoItem}>
                                <Text style={styles.infoLabel}>Holders</Text>
                                <Text style={styles.infoValue}>9,036</Text>
                            </View>
                        </View>
                    </View>

                    {/* 24h Performance Section */}
                    <View style={styles.performanceSection}>
                        <Text style={styles.sectionTitle}>24h Performance</Text>
                        <View style={styles.performanceItem}>
                            <Text style={styles.performanceLabel}>Volume</Text>
                            <Text style={styles.performanceValue}>$54.05M</Text>
                        </View>
                    </View>

                    {/* Security Section */}
                    <View style={styles.securitySection}>
                        <Text style={styles.sectionTitle}>Security</Text>
                        <View style={styles.securityGrid}>
                            <View style={styles.securityItem}>
                                <Text style={styles.securityLabel}>Top 10 Holders</Text>
                                <Text style={styles.securityValue}>15.93%</Text>
                            </View>
                            <View style={styles.securityItem}>
                                <Text style={styles.securityLabel}>Mintable</Text>
                                <Text style={styles.securityValue}>No</Text>
                            </View>
                            <View style={styles.securityItem}>
                                <Text style={styles.securityLabel}>Mutable Info</Text>
                                <Text style={styles.securityValue}>No</Text>
                            </View>
                            <View style={styles.securityItem}>
                                <Text style={styles.securityLabel}>Ownership Renounced</Text>
                                <Text style={styles.securityValue}>No</Text>
                            </View>
                            <View style={styles.securityItem}>
                                <Text style={styles.securityLabel}>Update Authority</Text>
                                <Text style={styles.securityValue} numberOfLines={1}>
                                    TSLvd...1eokM
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 20,
    },
    closeButton: {
        position: 'absolute',
        right: 16,
        top: 16,
        zIndex: 1,
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 20,
        color: '#666',
        lineHeight: 20,
    },
    content: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 20,
    },
    tokenLogo: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#F5F5F5',
    },
    tokenInfo: {
        marginLeft: 16,
        flex: 1,
    },
    tokenName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111',
        marginBottom: 4,
    },
    tokenSymbol: {
        fontSize: 16,
        color: '#666',
    },
    priceContainer: {
        marginBottom: 28,
    },
    price: {
        fontSize: 36,
        fontWeight: '700',
        color: '#111',
        marginBottom: 8,
    },
    priceChangeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceChangeAmount: {
        fontSize: 18,
        fontWeight: '600',
        marginRight: 12,
    },
    percentageBox: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    percentageText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    chartContainer: {
        marginBottom: 32,
        height: 300,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    graphWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        height: 220,
    },
    graph: {
        backgroundColor: 'transparent',
    },
    noDataContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noDataText: {
        color: '#666',
        fontSize: 16,
    },
    timeframeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 4,
    },
    timeframeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    selectedTimeframe: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    timeframeText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '600',
    },
    selectedTimeframeText: {
        color: '#111',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
        marginBottom: 16,
    },
    infoSection: {
        marginBottom: 32,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 20,
    },
    infoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    infoItem: {
        width: '50%',
        paddingHorizontal: 8,
        marginBottom: 20,
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    infoValue: {
        fontSize: 16,
        color: '#111',
        fontWeight: '600',
    },
    performanceSection: {
        marginBottom: 32,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 20,
    },
    performanceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEE',
    },
    performanceLabel: {
        fontSize: 16,
        color: '#666',
    },
    performanceValue: {
        fontSize: 16,
        color: '#111',
        fontWeight: '600',
    },
    securitySection: {
        marginBottom: 32,
        backgroundColor: '#F8F9FA',
        borderRadius: 16,
        padding: 20,
    },
    securityGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -8,
    },
    securityItem: {
        width: '50%',
        paddingHorizontal: 8,
        marginBottom: 20,
    },
    securityLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 6,
    },
    securityValue: {
        fontSize: 16,
        color: '#111',
        fontWeight: '600',
    },
});

export default TokenDetailsSheet; 
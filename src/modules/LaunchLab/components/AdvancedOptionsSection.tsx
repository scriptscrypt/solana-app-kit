import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
    View,
    Text as RNText,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Modal,
    FlatList,
    Image,
    ActivityIndicator,
    Dimensions,
    TextInput as RNTextInput,
    Platform
} from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { Feather, Ionicons, FontAwesome5 } from '@expo/vector-icons';

import Svg, { Path, Line, Circle, Text, Defs, LinearGradient, Stop } from 'react-native-svg';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

// Helper Functions
function parseNumericString(value: string): number {
    if (!value) return 0;
    // Remove commas and handle potential non-numeric characters gracefully
    const cleanedValue = value.replace(/,/g, '');
    const number = parseFloat(cleanedValue);
    return isNaN(number) ? 0 : number;
}

function formatNumber(num: number): string {
    if (isNaN(num) || num === 0) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(1).replace(/\.0$/, '') + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';

    // Improved small number formatting to handle very small values
    if (num < 0.0001) return num.toExponential(2); // Use scientific notation for very small numbers
    if (num < 0.001) return num.toFixed(6);
    if (num < 0.01) return num.toFixed(5);
    if (num < 0.1) return num.toFixed(4);
    if (Math.abs(num) < 1) return num.toFixed(4);
    if (Math.abs(num) < 100) return num.toFixed(2);
    return String(Math.round(num));
}

// Address truncation helper
function truncateAddress(address: string, startChars: number = 6, endChars: number = 4): string {
    if (!address) return '';
    if (address.length <= startChars + endChars) return address;
    return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
}

// Sample token interface similar to what's used in SwapScreen
interface TokenInfo {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
}

// Sample tokens for demonstration
const SAMPLE_TOKENS: TokenInfo[] = [
    {
        address: 'So11111111111111111111111111111111111111112',
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    },
    {
        address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
    },
    {
        address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        symbol: 'BONK',
        name: 'Bonk',
        decimals: 5,
        logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I'
    },
    {
        address: '7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx',
        symbol: 'GMT',
        name: 'STEPN',
        decimals: 9,
        logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7i5KKsX2weiTkry7jA4ZwSuXGhs5eJBEjY8vVxR4pfRx/logo.png'
    }
];

interface AdvancedOptionsSectionProps {
    containerStyle?: any;
    onBack?: () => void;
    onCreateToken?: () => void;
}

export const AdvancedOptionsSection: React.FC<AdvancedOptionsSectionProps> = ({
    containerStyle,
    onBack,
    onCreateToken,
}) => {
    const [quoteToken, setQuoteToken] = useState<TokenInfo>(SAMPLE_TOKENS[0]);
    const [tokenSupply, setTokenSupply] = useState('1,000,000,000');
    const [solRaised, setSolRaised] = useState('85');
    const [bondingCurve, setBondingCurve] = useState('85');
    const [poolMigration, setPoolMigration] = useState('85');
    const [vestingPercentage, setVestingPercentage] = useState('85');
    const [showTokenSupplyOptions, setShowTokenSupplyOptions] = useState(false);

    // Token selection modal state
    const [showTokenModal, setShowTokenModal] = useState(false);
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(false);

    // Input change handlers with formatting
    const handleSolRaisedChange = (value: string) => {
        // Allow only numbers and decimal point
        const filtered = value.replace(/[^0-9.]/g, '');
        setSolRaised(filtered);
    };

    const handleBondingCurveChange = (value: string) => {
        // Allow only numbers, limit to 100
        const filtered = value.replace(/[^0-9]/g, '');
        const number = parseInt(filtered, 10);
        if (!isNaN(number)) {
            setBondingCurve(number > 100 ? '100' : filtered);
        } else {
            setBondingCurve('');
        }
    };

    const handleTokenSupplyChange = (value: string) => {
        // Allow numbers and commas
        const filtered = value.replace(/[^0-9,]/g, '');
        setTokenSupply(filtered);
    };

    // Graph Calculation Logic
    const graphData = useMemo(() => {
        // Parse input values, ensuring we handle commas and convert to numbers
        const supplyNum = parseNumericString(tokenSupply);
        const solNum = parseNumericString(solRaised);
        const curvePercent = parseNumericString(bondingCurve);

        console.log('Graph inputs:', { supplyNum, solNum, curvePercent });

        const width = 300;
        const height = 200;
        const margin = { top: 30, right: 30, bottom: 40, left: 40 }; // Increased left margin for y-axis labels
        const graphWidth = width - margin.left - margin.right;
        const graphHeight = height - margin.top - margin.bottom;

        // Validate inputs - ensure they are positive and curvePercent is within range
        if (supplyNum <= 0 || solNum <= 0 || curvePercent <= 0 || curvePercent > 100) {
            // Return default/empty state for invalid inputs
            const defaultY = height - margin.bottom;
            const defaultX = margin.left;
            return {
                linePath: `M${defaultX},${defaultY}L${defaultX + graphWidth},${defaultY}`, // Flat line at bottom
                areaPath: `M${defaultX},${defaultY}L${defaultX + graphWidth},${defaultY}Z`, // No area
                xTicks: Array.from({ length: 5 }).map((_, i) => ({ value: '0', x: defaultX + (i / 4) * graphWidth, y: defaultY + 12 })),
                yTicks: Array.from({ length: 5 }).map((_, i) => ({ value: '0', x: defaultX - 10, y: defaultY - (i / 4) * graphHeight, textAnchor: 'end' })),
                startPoint: { cx: defaultX, cy: defaultY },
                endPoint: { cx: defaultX + graphWidth, cy: defaultY },
                graphWidth, graphHeight, margin, width, height
            };
        }

        // Calculate max supply on curve (tokens to be sold on the bonding curve)
        const maxSupplyOnCurve = supplyNum * (curvePercent / 100);

        // Use a modified formula that scales better with large supplies
        // Instead of using a standard quadratic curve which gives tiny prices,
        // we'll use an adjusted formula that maintains the curve shape but scales better

        // Scale the supply to a more reasonable range for calculation
        const scaleFactor = Math.pow(10, Math.max(0, Math.floor(Math.log10(maxSupplyOnCurve)) - 6));
        const scaledSupply = maxSupplyOnCurve / scaleFactor;

        // Use a simple quadratic formula: Price = C * (Supply/scale)^2
        // where C is calculated to ensure the total SOL raised is correct
        const C = 3 * solNum / Math.pow(scaledSupply, 3);
        const maxPrice = C * Math.pow(scaledSupply, 2);

        console.log('Curve params:', { maxSupplyOnCurve, scaleFactor, scaledSupply, C, maxPrice });

        // Generate points along the curve
        const points: { cx: number; cy: number }[] = [];
        const numPoints = 50; // Number of points for curve smoothness

        for (let i = 0; i <= numPoints; i++) {
            const supplyRatio = i / numPoints; // From 0 to 1
            const s = supplyRatio * maxSupplyOnCurve; // Current supply
            const scaledS = s / scaleFactor; // Scaled supply for price calculation

            // Calculate price using our scaled formula
            const p = C * Math.pow(scaledS, 2); // Current price at this supply

            // Map supply/price to SVG coordinates
            const svgX = margin.left + supplyRatio * graphWidth;
            const svgY = height - margin.bottom - (p / maxPrice) * graphHeight;

            // Ensure Y is within bounds
            const boundedY = Math.max(margin.top, Math.min(height - margin.bottom, svgY));
            points.push({ cx: svgX, cy: boundedY });
        }

        // Ensure start point is exactly on the x-axis
        if (points.length > 0) {
            points[0].cy = height - margin.bottom;
        } else {
            points.push({ cx: margin.left, cy: height - margin.bottom });
        }

        // Create path data for the curve and area
        const linePath = points.map((p, i) =>
            (i === 0 ? 'M' : 'L') + `${p.cx.toFixed(1)},${p.cy.toFixed(1)}`
        ).join(' ');

        const areaPath = `${linePath} L${points[points.length - 1].cx.toFixed(1)},${height - margin.bottom} L${margin.left},${height - margin.bottom} Z`;

        // Generate X-axis tick labels (token supply values)
        const xTicks = Array.from({ length: 5 }).map((_, i) => {
            const val = (i / 4) * maxSupplyOnCurve;
            return {
                value: formatNumber(val),
                x: margin.left + (i / 4) * graphWidth,
                y: height - margin.bottom + 12,
            };
        });

        // Generate Y-axis tick labels (price values)
        const yTicks = Array.from({ length: 5 }).map((_, i) => {
            // For y-axis, we want to show prices at different supply points
            // This gives more intuitive price points for the user
            const priceVal = i === 0 ? 0 : maxPrice * (i / 4);

            return {
                value: formatNumber(priceVal),
                x: margin.left - 10,
                y: height - margin.bottom - (i / 4) * graphHeight,
                textAnchor: 'end',
            };
        });

        return {
            linePath,
            areaPath,
            xTicks,
            yTicks,
            startPoint: points[0],
            endPoint: points[points.length - 1],
            graphWidth, graphHeight, margin, width, height
        };

    }, [tokenSupply, solRaised, bondingCurve]); // Dependencies

    const handleCreateToken = () => {
        if (onCreateToken) {
            onCreateToken();
        } else {
            console.log('Create token clicked');
        }
    };

    const tokenSupplyOptions = ["1,000,000,000", "10,000,000", "100,000,000", "1,000,000"];

    const selectTokenSupply = (supply: string) => {
        setTokenSupply(supply);
        setShowTokenSupplyOptions(false);
    };

    const handleTokenSelected = (token: TokenInfo) => {
        setQuoteToken(token);
        setShowTokenModal(false);
    };

    // Filter tokens based on search input
    const filteredTokens = useMemo(() => {
        if (!searchInput.trim()) return SAMPLE_TOKENS;
        return SAMPLE_TOKENS.filter(
            t =>
                t.symbol.toLowerCase().includes(searchInput.toLowerCase()) ||
                t.name.toLowerCase().includes(searchInput.toLowerCase()) ||
                t.address.toLowerCase().includes(searchInput.toLowerCase()),
        );
    }, [searchInput]);

    return (
        <ScrollView style={[styles.container, containerStyle]}>
            <View style={styles.header}>
                {/* <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color={COLORS.white} />
                </TouchableOpacity> */}
                {/* <RNText style={styles.headerTitle}>Advanced Options</RNText> */}
            </View>

            {/* Curve Preview */}
            <View style={styles.sectionContainer}>
                <RNText style={styles.sectionTitle}>Curve Preview</RNText>
                <View style={styles.graphContainer}>
                    {/* Dynamic SVG Graph */}
                    <Svg height={graphData.height} width={graphData.width} viewBox={`0 0 ${graphData.width} ${graphData.height}`}>
                        <Defs>
                            <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                {/* Use brandPurple or a similar color from your palette */}
                                <Stop offset="0%" stopColor={COLORS.brandPurple} stopOpacity="0.4" />
                                <Stop offset="100%" stopColor={COLORS.brandPurple} stopOpacity="0.05" />
                            </LinearGradient>
                        </Defs>

                        {/* Grid Lines (Subtle) */}
                        {graphData.xTicks.map((tick, i) => i > 0 && i < 4 && ( // Skip first/last for cleaner look?
                            <Line
                                key={`vx-${i}`}
                                x1={tick.x}
                                y1={graphData.margin.top}
                                x2={tick.x}
                                y2={graphData.height - graphData.margin.bottom}
                                stroke={COLORS.borderDarkColor} // Very subtle grid
                                strokeWidth="0.5"
                                strokeDasharray="2 3"
                            />
                        ))}
                        {graphData.yTicks.map((tick, i) => i > 0 && i < 4 && ( // Skip first/last
                            <Line
                                key={`hy-${i}`}
                                x1={graphData.margin.left}
                                y1={tick.y}
                                x2={graphData.width - graphData.margin.right}
                                y2={tick.y}
                                stroke={COLORS.borderDarkColor} // Very subtle grid
                                strokeWidth="0.5"
                                strokeDasharray="2 3"
                            />
                        ))}

                        {/* Area Fill Path */}
                        <Path d={graphData.areaPath} fill="url(#areaGradient)" />

                        {/* Curve Line Path */}
                        <Path
                            d={graphData.linePath}
                            fill="none"
                            stroke={COLORS.brandPurple} // Use brand purple
                            strokeWidth="2"
                            strokeDasharray="4 4" // Dashed line style
                        />

                        {/* Start and End Point Markers - Use .cx and .cy */}
                        <Circle cx={graphData.startPoint.cx} cy={graphData.startPoint.cy} r="4" fill={COLORS.brandPurple} />
                        <Circle cx={graphData.endPoint.cx} cy={graphData.endPoint.cy} r="4" fill={COLORS.brandPurple} />

                        {/* Axes Lines (Optional: can be removed if grid is sufficient) */}
                        {/* X Axis */}
                        {/* <Line
                             x1={graphData.margin.left} y1={graphData.height - graphData.margin.bottom}
                            x2={graphData.width - graphData.margin.right} y2={graphData.height - graphData.margin.bottom}
                             stroke={COLORS.accessoryDarkColor} strokeWidth="1" /> */}
                        {/* Y Axis */}
                        {/* <Line
                            x1={graphData.margin.left} y1={graphData.margin.top}
                             x2={graphData.margin.left} y2={graphData.height - graphData.margin.bottom}
                             stroke={COLORS.accessoryDarkColor} strokeWidth="1" /> */}

                        {/* Axis Tick Labels */}
                        {graphData.xTicks.map((tick, i) => (
                            <Text
                                key={`xLabel-${i}`}
                                x={tick.x}
                                y={tick.y}
                                fill={COLORS.greyMid}
                                fontSize="10"
                                fontFamily={TYPOGRAPHY.fontFamily}
                                textAnchor="middle"
                            >
                                {tick.value}
                            </Text>
                        ))}
                        {graphData.yTicks.map((tick, i) => (
                            <Text
                                key={`yLabel-${i}`}
                                x={tick.x}
                                y={tick.y}
                                fill={COLORS.greyMid}
                                fontSize="10"
                                fontFamily={TYPOGRAPHY.fontFamily}
                                textAnchor={tick.textAnchor as any}
                                alignmentBaseline="middle"
                            >
                                {tick.value}
                            </Text>
                        ))}
                    </Svg>
                </View>
            </View>

            {/* Quote Token Selection */}
            <View style={styles.formField}>
                <RNText style={styles.fieldLabel}>Quote Token</RNText>
                <TouchableOpacity
                    style={styles.dropdownContainer}
                    onPress={() => setShowTokenModal(true)}
                >
                    <View style={styles.tokenSelectRow}>
                        {quoteToken.logoURI ? (
                            <Image source={{ uri: quoteToken.logoURI }} style={styles.tokenIcon} />
                        ) : (
                            <View style={[styles.tokenIcon, { backgroundColor: COLORS.lighterBackground, justifyContent: 'center', alignItems: 'center' }]}>
                                <RNText style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 10 }}>
                                    {quoteToken.symbol?.charAt(0) || '?'}
                                </RNText>
                            </View>
                        )}
                        <View style={styles.tokenInfo}>
                            <RNText style={styles.tokenName}>{quoteToken.symbol}</RNText>
                            <RNText style={styles.tokenAddress}>
                                {truncateAddress(quoteToken.address)}
                            </RNText>
                        </View>
                        <Feather name="chevron-down" size={20} color={COLORS.white} />
                    </View>
                </TouchableOpacity>
            </View>

            {/* Token Supply */}
            <View style={styles.formField}>
                <RNText style={styles.fieldLabel}>Token Supply</RNText>
                <View style={styles.dropdownInputContainer}>
                    <View style={styles.tokenIconSmallContainer}>
                        {quoteToken.logoURI ? (
                            <Image source={{ uri: quoteToken.logoURI }} style={styles.tokenIconSmall} />
                        ) : (
                            <View style={[styles.tokenIconSmall, { backgroundColor: COLORS.lighterBackground, justifyContent: 'center', alignItems: 'center' }]}>
                                <RNText style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 8 }}>
                                    {quoteToken.symbol?.charAt(0) || '?'}
                                </RNText>
                            </View>
                        )}
                    </View>
                    <TextInput
                        style={styles.input}
                        value={tokenSupply}
                        onChangeText={handleTokenSupplyChange}
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.greyMid}
                    />
                    <TouchableOpacity
                        style={styles.dropdownButton}
                        onPress={() => setShowTokenSupplyOptions(!showTokenSupplyOptions)}>
                        <Feather name="chevron-down" size={20} color={COLORS.white} />
                    </TouchableOpacity>
                </View>

                {showTokenSupplyOptions && (
                    <View style={styles.dropdownOptions}>
                        {tokenSupplyOptions.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.dropdownOption}
                                onPress={() => selectTokenSupply(option)}>
                                <RNText style={styles.dropdownOptionText}>{option}</RNText>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            {/* Two column layout */}
            <View style={styles.twoColumnContainer}>
                {/* SOL Raised */}
                <View style={[styles.formField, styles.columnItem]}>
                    <RNText style={styles.fieldLabel}>SOL Raised</RNText>
                    <View style={styles.inputContainer}>
                        <View style={styles.tokenIconSmallContainer}>
                            {SAMPLE_TOKENS[0].logoURI ? (
                                <Image source={{ uri: SAMPLE_TOKENS[0].logoURI }} style={styles.tokenIconSmall} />
                            ) : (
                                <View style={[styles.tokenIconSmall, { backgroundColor: COLORS.lighterBackground, justifyContent: 'center', alignItems: 'center' }]}>
                                    <RNText style={{ color: COLORS.white, fontWeight: 'bold', fontSize: 8 }}>
                                        {SAMPLE_TOKENS[0].symbol?.charAt(0) || '?'}
                                    </RNText>
                                </View>
                            )}
                        </View>
                        <TextInput
                            style={styles.input}
                            value={solRaised}
                            onChangeText={handleSolRaisedChange}
                            keyboardType="numeric"
                            placeholderTextColor={COLORS.greyMid}
                        />
                    </View>
                </View>

                {/* Bonding Curve */}
                <View style={[styles.formField, styles.columnItem]}>
                    <RNText style={styles.fieldLabel}>Bonding Curve %</RNText>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={bondingCurve}
                            onChangeText={handleBondingCurveChange}
                            keyboardType="numeric"
                            placeholderTextColor={COLORS.greyMid}
                        />
                        <RNText style={styles.percentSign}>%</RNText>
                    </View>
                </View>
            </View>

            <View style={styles.twoColumnContainer}>
                {/* Pool Migration */}
                <View style={[styles.formField, styles.columnItem]}>
                    <RNText style={styles.fieldLabel}>Pool Migration</RNText>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={poolMigration}
                            onChangeText={setPoolMigration}
                            keyboardType="numeric"
                            placeholderTextColor={COLORS.greyMid}
                        />
                    </View>
                </View>

                {/* Vesting */}
                <View style={[styles.formField, styles.columnItem]}>
                    <RNText style={styles.fieldLabel}>Vesting %</RNText>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.input}
                            value={vestingPercentage}
                            onChangeText={setVestingPercentage}
                            keyboardType="numeric"
                            placeholderTextColor={COLORS.greyMid}
                        />
                        <RNText style={styles.percentSign}>%</RNText>
                    </View>
                </View>
            </View>

            {/* Create Token Button */}
            <TouchableOpacity style={styles.createButton} onPress={handleCreateToken}>
                <RNText style={styles.createButtonText}>Create Token</RNText>
            </TouchableOpacity>

            {/* Token Selection Modal */}
            <Modal
                visible={showTokenModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowTokenModal(false)}
            >
                <View style={modalStyles.modalOverlay}>
                    <View style={modalStyles.modalContainer}>
                        <View style={modalStyles.modalHeader}>
                            <RNText style={modalStyles.modalTitle}>Select Token</RNText>
                            <TouchableOpacity
                                style={modalStyles.modalCloseButton}
                                onPress={() => setShowTokenModal(false)}
                            >
                                <Ionicons name="close" size={24} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>

                        <View style={modalStyles.searchContainer}>
                            <Ionicons name="search" size={20} color={COLORS.greyMid} style={modalStyles.searchIcon} />
                            <RNTextInput
                                style={modalStyles.searchInput}
                                placeholder="Search by name or address"
                                placeholderTextColor={COLORS.greyMid}
                                value={searchInput}
                                onChangeText={setSearchInput}
                                autoCapitalize="none"
                                returnKeyType="search"
                            />
                        </View>

                        {loading ? (
                            <View style={modalStyles.loadingContainer}>
                                <ActivityIndicator size="large" color={COLORS.brandBlue} />
                                <RNText style={modalStyles.loadingText}>Loading tokens...</RNText>
                            </View>
                        ) : (
                            <FlatList
                                data={filteredTokens}
                                keyExtractor={item => item.address}
                                contentContainerStyle={modalStyles.listContentContainer}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={modalStyles.tokenItem}
                                        onPress={() => handleTokenSelected(item)}
                                    >
                                        <View style={modalStyles.tokenItemContent}>
                                            {item.logoURI ? (
                                                <Image source={{ uri: item.logoURI }} style={modalStyles.tokenLogo} />
                                            ) : (
                                                <View style={[modalStyles.tokenLogo, { justifyContent: 'center', alignItems: 'center' }]}>
                                                    <RNText style={{ color: COLORS.white, fontWeight: 'bold' }}>
                                                        {item.symbol.charAt(0)}
                                                    </RNText>
                                                </View>
                                            )}
                                            <View style={modalStyles.tokenTextContainer}>
                                                <RNText style={modalStyles.tokenSymbol}>{item.symbol}</RNText>
                                                <RNText style={modalStyles.tokenName}>{item.name}</RNText>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={
                                    <View style={modalStyles.emptyContainer}>
                                        <RNText style={modalStyles.emptyText}>
                                            No tokens found matching your search.
                                        </RNText>
                                    </View>
                                }
                            />
                        )}

                        <TouchableOpacity
                            style={modalStyles.closeButton}
                            onPress={() => setShowTokenModal(false)}
                        >
                            <RNText style={modalStyles.closeButtonText}>Cancel</RNText>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.white,
        marginLeft: 8,
    },
    sectionContainer: {
        marginBottom: 20,
    },
    formField: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white,
        marginBottom: 8,
    },
    fieldLabel: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.greyMid,
        marginBottom: 8,
        fontFamily: TYPOGRAPHY.fontFamily,
    },
    graphContainer: {
        backgroundColor: COLORS.background,
        borderRadius: 12,
        padding: 16,
        height: 200,
        borderWidth: 1,
        borderColor: COLORS.borderDarkColor,
    },
    dropdownContainer: {
        backgroundColor: COLORS.background,
        borderRadius: 8,
        padding: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderDarkColor,
    },
    tokenSelectRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingVertical: 4,
    },
    tokenIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 12,
    },
    tokenIconSmall: {
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    tokenIconSmallContainer: {
        marginLeft: 8,
        marginRight: 8,
    },
    tokenInfo: {
        flex: 1,
    },
    tokenName: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.white,
    },
    tokenAddress: {
        fontSize: 12,
        color: COLORS.greyMid,
        marginTop: 2,
    },
    dropdownInputContainer: {
        backgroundColor: COLORS.background,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderDarkColor,
    },
    inputContainer: {
        backgroundColor: COLORS.background,
        borderRadius: 8,
        padding: 4,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.borderDarkColor,
    },
    input: {
        flex: 1,
        color: COLORS.white,
        padding: 12,
        fontSize: 16,
    },
    dropdownButton: {
        padding: 12,
    },
    dropdownOptions: {
        backgroundColor: COLORS.background,
        borderRadius: 8,
        marginTop: 4,
        borderWidth: 1,
        borderColor: COLORS.borderDarkColor,
        zIndex: 10,
    },
    dropdownOption: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderDarkColor,
    },
    dropdownOptionText: {
        color: COLORS.white,
        fontSize: 16,
    },
    percentSign: {
        color: COLORS.white,
        fontSize: 16,
        marginRight: 12,
    },
    twoColumnContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    columnItem: {
        flex: 1,
        marginRight: 8,
    },
    createButton: {
        backgroundColor: COLORS.brandBlue,
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginTop: 24,
        marginBottom: 36,
    },
    createButtonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
});

// Separate styles for the modal
const modalStyles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContainer: {
        backgroundColor: COLORS.background,
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
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.black,
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
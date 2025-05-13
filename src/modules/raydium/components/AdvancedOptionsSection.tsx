import React, {useState, useMemo} from 'react';
import {
  View,
  Text as RNText,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Switch,
} from 'react-native';
import {TextInput} from 'react-native-gesture-handler';
import {Feather} from '@expo/vector-icons';
import {Alert} from 'react-native';

import Svg, {
  Path,
  Line,
  Circle,
  Text,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';
import { styles } from './AdvancedOptionsSection.styles';
import {
  parseNumericString,
  truncateAddress,
  SAMPLE_TOKENS,
  TokenInfo,
  LaunchpadConfigData,
  AdvancedOptionsSectionProps,
  TokenSelectionModal,
  calculateGraphData
} from '../utils/AdvancedOptionsSectionUtils';

export const AdvancedOptionsSection: React.FC<AdvancedOptionsSectionProps> = ({
  containerStyle,
  onBack,
  onCreateToken,
  isLoading = false,
  tokenName,
  tokenSymbol,
}) => {
  const [quoteToken, setQuoteToken] = useState<TokenInfo>(SAMPLE_TOKENS[0]);
  const [tokenSupply, setTokenSupply] = useState('1,000,000,000');
  const [solRaised, setSolRaised] = useState('85');
  const [bondingCurve, setBondingCurve] = useState('50'); // Default to 50% on bonding curve
  const [poolMigration, setPoolMigration] = useState('30'); // Min limit is 30 SOL per docs
  const [vestingPercentage, setVestingPercentage] = useState('0'); // Default to no vesting
  const [showTokenSupplyOptions, setShowTokenSupplyOptions] = useState(false);
  const [enableFeeSharingPost, setEnableFeeSharingPost] = useState(false);

  // Token selection modal state
  const [showTokenModal, setShowTokenModal] = useState(false);

  // Vesting options
  const [vestingEnabled, setVestingEnabled] = useState(false);
  const [vestingDuration, setVestingDuration] = useState('6'); // In months
  const [vestingCliff, setVestingCliff] = useState('1'); // In months

  // Input change handlers with formatting
  const handleSolRaisedChange = (value: string) => {
    // Allow only numbers and decimal point
    const filtered = value.replace(/[^0-9.]/g, '');
    // Ensure it's at least 30 SOL per Raydium docs
    const numVal = parseFloat(filtered || '0');
    if (numVal < 30) {
      setSolRaised('30');
    } else {
      setSolRaised(filtered);
    }
  };

  const handleBondingCurveChange = (value: string) => {
    // Allow only numbers, limit to 80%
    const filtered = value.replace(/[^0-9]/g, '');
    const number = parseInt(filtered, 10);
    if (!isNaN(number)) {
      // Per Raydium docs: min 20% and max 80%
      if (number < 20) {
        setBondingCurve('20');
      } else if (number > 80) {
        setBondingCurve('80');
      } else {
        setBondingCurve(filtered);
      }
    } else {
      setBondingCurve('50');
    }
  };

  const handleVestingPercentageChange = (value: string) => {
    // Allow only numbers, limit to 100
    const filtered = value.replace(/[^0-9]/g, '');
    const number = parseInt(filtered, 10);
    if (!isNaN(number)) {
      setVestingPercentage(number > 100 ? '100' : filtered);
    } else {
      setVestingPercentage('0');
    }
  };

  const handleTokenSupplyChange = (value: string) => {
    // Allow numbers and commas
    const filtered = value.replace(/[^0-9,]/g, '');
    setTokenSupply(filtered);
  };

  // Get graph data
  const graphData = useMemo(() => {
    return calculateGraphData(tokenSupply, solRaised, bondingCurve);
  }, [tokenSupply, solRaised, bondingCurve]); // Dependencies

  const handleCreateToken = () => {
    if (onCreateToken) {
      // Validate minimum SOL raised (30 SOL per Raydium docs)
      const solRaisedNum = parseFloat(solRaised);
      if (solRaisedNum < 30) {
        Alert.alert('Error', 'Minimum SOL raised must be at least 30 SOL');
        return;
      }

      // Validate bonding curve percentage (20-80% per Raydium docs)
      const bondingCurveNum = parseInt(bondingCurve, 10);
      if (bondingCurveNum < 20 || bondingCurveNum > 80) {
        Alert.alert(
          'Error',
          'Bonding curve percentage must be between 20% and 80%',
        );
        return;
      }

      // Create the config data object from state
      const configData: LaunchpadConfigData = {
        quoteTokenMint: quoteToken.address,
        tokenSupply: tokenSupply,
        solRaised: solRaised,
        bondingCurvePercentage: bondingCurve,
        poolMigration: solRaised, // Use same value as solRaised by default
        vestingPercentage: vestingEnabled ? vestingPercentage : '0',
        vestingDuration: vestingEnabled ? vestingDuration : '0',
        vestingCliff: vestingEnabled ? vestingCliff : '0',
        enableFeeSharingPost: enableFeeSharingPost,
        mode: 'launchLab', // Set mode to launchLab for advanced options
      };

      onCreateToken(configData);
    } else {
      console.log('Create token clicked');
    }
  };

  const tokenSupplyOptions = [
    '1,000,000,000',
    '10,000,000',
    '100,000,000',
    '1,000,000',
  ];

  const selectTokenSupply = (supply: string) => {
    setTokenSupply(supply);
    setShowTokenSupplyOptions(false);
  };

  const handleTokenSelected = (token: TokenInfo) => {
    setQuoteToken(token);
    setShowTokenModal(false);
  };

  return (
    <ScrollView style={[styles.container, containerStyle]}>
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
        )}
        <RNText style={styles.headerTitle}>
          {tokenName && tokenSymbol
            ? `Configure ${tokenName} (${tokenSymbol})`
            : 'Advanced Options'}
        </RNText>
      </View>

      {/* Curve Preview */}
      <View style={styles.sectionContainer}>
        <RNText style={styles.sectionTitle}>Curve Preview</RNText>
        <View style={styles.graphContainer}>
          {/* Dynamic SVG Graph */}
          <Svg
            height={graphData.height}
            width={graphData.width}
            viewBox={`0 0 ${graphData.width} ${graphData.height}`}>
            <Defs>
              <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                {/* Use brandPurple or a similar color from your palette */}
                <Stop
                  offset="0%"
                  stopColor={COLORS.brandPurple}
                  stopOpacity="0.4"
                />
                <Stop
                  offset="100%"
                  stopColor={COLORS.brandPurple}
                  stopOpacity="0.05"
                />
              </LinearGradient>
            </Defs>

            {/* Grid Lines (Subtle) */}
            {graphData.xTicks.map(
              (tick, i) =>
                i > 0 &&
                i < 4 && ( // Skip first/last for cleaner look?
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
                ),
            )}
            {graphData.yTicks.map(
              (tick, i) =>
                i > 0 &&
                i < 4 && ( // Skip first/last
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
                ),
            )}

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
            <Circle
              cx={graphData.startPoint.cx}
              cy={graphData.startPoint.cy}
              r="4"
              fill={COLORS.brandPurple}
            />
            <Circle
              cx={graphData.endPoint.cx}
              cy={graphData.endPoint.cy}
              r="4"
              fill={COLORS.brandPurple}
            />

            {graphData.xTicks.map((tick, i) => (
              <Text
                key={`xLabel-${i}`}
                x={tick.x}
                y={tick.y}
                fill={COLORS.greyMid}
                fontSize="10"
                fontFamily={TYPOGRAPHY.fontFamily}
                textAnchor="middle">
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
                alignmentBaseline="middle">
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
          disabled={isLoading}>
          <View style={styles.tokenSelectRow}>
            {quoteToken.logoURI ? (
              <Image
                source={{uri: quoteToken.logoURI}}
                style={styles.tokenIcon}
              />
            ) : (
              <View
                style={[
                  styles.tokenIcon,
                  {
                    backgroundColor: COLORS.lighterBackground,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}>
                <RNText
                  style={{
                    color: COLORS.white,
                    fontWeight: 'bold',
                    fontSize: 10,
                  }}>
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
              <Image
                source={{uri: quoteToken.logoURI}}
                style={styles.tokenIconSmall}
              />
            ) : (
              <View
                style={[
                  styles.tokenIconSmall,
                  {
                    backgroundColor: COLORS.lighterBackground,
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}>
                <RNText
                  style={{
                    color: COLORS.white,
                    fontWeight: 'bold',
                    fontSize: 8,
                  }}>
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
            editable={!isLoading}
          />
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setShowTokenSupplyOptions(!showTokenSupplyOptions)}
            disabled={isLoading}>
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
          <RNText style={styles.fieldLabel}>SOL Raised (min 30)</RNText>
          <View style={styles.inputContainer}>
            <View style={styles.tokenIconSmallContainer}>
              {SAMPLE_TOKENS[0].logoURI ? (
                <Image
                  source={{uri: SAMPLE_TOKENS[0].logoURI}}
                  style={styles.tokenIconSmall}
                />
              ) : (
                <View
                  style={[
                    styles.tokenIconSmall,
                    {
                      backgroundColor: COLORS.lighterBackground,
                      justifyContent: 'center',
                      alignItems: 'center',
                    },
                  ]}>
                  <RNText
                    style={{
                      color: COLORS.white,
                      fontWeight: 'bold',
                      fontSize: 8,
                    }}>
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
              editable={!isLoading}
            />
          </View>
        </View>

        {/* Bonding Curve */}
        <View style={[styles.formField, styles.columnItem]}>
          <RNText style={styles.fieldLabel}>Curve % (20-80%)</RNText>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={bondingCurve}
              onChangeText={handleBondingCurveChange}
              keyboardType="numeric"
              placeholderTextColor={COLORS.greyMid}
              editable={!isLoading}
            />
            <RNText style={styles.percentSign}>%</RNText>
          </View>
        </View>
      </View>

      {/* Vesting Options */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <RNText style={styles.sectionTitle}>Vesting Options</RNText>
          <Switch
            value={vestingEnabled}
            onValueChange={setVestingEnabled}
            trackColor={{
              false: COLORS.darkerBackground,
              true: COLORS.brandBlue,
            }}
            thumbColor={COLORS.white}
            disabled={isLoading}
          />
        </View>

        {vestingEnabled && (
          <View style={styles.vestingOptions}>
            <View style={styles.formField}>
              <RNText style={styles.fieldLabel}>Vesting Percentage</RNText>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={vestingPercentage}
                  onChangeText={handleVestingPercentageChange}
                  keyboardType="numeric"
                  placeholderTextColor={COLORS.greyMid}
                  editable={!isLoading}
                />
                <RNText style={styles.percentSign}>%</RNText>
              </View>
            </View>

            <View style={styles.twoColumnContainer}>
              <View style={[styles.formField, styles.columnItem]}>
                <RNText style={styles.fieldLabel}>Cliff (months)</RNText>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={vestingCliff}
                    onChangeText={setVestingCliff}
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.greyMid}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={[styles.formField, styles.columnItem]}>
                <RNText style={styles.fieldLabel}>Duration (months)</RNText>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    value={vestingDuration}
                    onChangeText={setVestingDuration}
                    keyboardType="numeric"
                    placeholderTextColor={COLORS.greyMid}
                    editable={!isLoading}
                  />
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Post-migration Fee Share */}
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <View>
            <RNText style={styles.sectionTitle}>
              Post-migration Fee Share
            </RNText>
            <RNText style={styles.sectionDescription}>
              Claim 10% of LP trading fees after token graduates to AMM pool
            </RNText>
          </View>
          <Switch
            value={enableFeeSharingPost}
            onValueChange={setEnableFeeSharingPost}
            trackColor={{
              false: COLORS.darkerBackground,
              true: COLORS.brandBlue,
            }}
            thumbColor={COLORS.white}
            disabled={isLoading}
          />
        </View>
      </View>

      {/* Create Token Button */}
      <TouchableOpacity
        style={[styles.createButton, isLoading && styles.disabledButton]}
        onPress={handleCreateToken}
        disabled={isLoading}>
        <RNText style={styles.createButtonText}>
          {isLoading ? 'Creating Token...' : 'Create Token'}
        </RNText>
      </TouchableOpacity>

      {/* Token Selection Modal */}
      <TokenSelectionModal
        visible={showTokenModal}
        onClose={() => setShowTokenModal(false)}
        onSelectToken={handleTokenSelected}
        tokens={SAMPLE_TOKENS}
      />
    </ScrollView>
  );
};

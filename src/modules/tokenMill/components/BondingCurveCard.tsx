import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import BN from 'bn.js';
import { BondingCurveCardProps } from '../types';
import BondingCurveConfigurator from './BondingCurveConfigurator';
import { setBondingCurve } from '../services/tokenMillService';
import { BondingCurveCardStyles as styles } from './styles/BondingCurveCard.style';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CHART_WIDTH = Math.min(width * 0.85, 350);
const CHART_HEIGHT = 220; // Increased height for better visualization

const BondingCurveCard = React.memo(({
  marketAddress,
  connection,
  publicKey,
  solanaWallet,
  setLoading,
  styleOverrides = {},
}: BondingCurveCardProps) => {
  // Local states for curve values
  const [pricePoints, setPricePoints] = useState<BN[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'info' | 'success' | 'error'>('info');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Curve parameters for display
  const [curveType, setCurveType] = useState<string>('linear');
  const [basePrice, setBasePrice] = useState<number>(0);
  const [topPrice, setTopPrice] = useState<number>(0);
  const [pointCount, setPointCount] = useState<number>(0);
  const [feePercent, setFeePercent] = useState<number>(2.0);

  // Safely convert BN to number to prevent Infinity/NaN errors
  const safeConvertBnToNumber = useCallback((bn: BN) => {
    try {
      const num = bn.toNumber();
      return Number.isFinite(num) ? num : 0;
    } catch (e) {
      return 0; // Fallback to 0 if conversion fails
    }
  }, []);

  // Chart data derived from pricePoints with safety checks
  const chartData = useMemo(() => {
    if (pricePoints.length === 0) {
      // Default empty data if no prices yet
      return {
        labels: ['0', '5', '10'],
        datasets: [
          { data: [0, 0, 0], color: () => '#5078FF', strokeWidth: 3 },
          { data: [0, 0, 0], color: () => '#FF4F78', strokeWidth: 2, strokeDashArray: [4, 2] },
        ],
        legend: ['Ask Price', 'After Fee (Bid)'],
      };
    }

    // Create safe arrays of numbers from BN values
    const askPrices = pricePoints.map(safeConvertBnToNumber);
    
    // Calculate prices after fee (bid prices)
    const bidPrices = askPrices.map(price => {
      const bidPrice = price * (1 - feePercent / 100);
      return Number.isFinite(bidPrice) ? bidPrice : 0;
    });
    
    return {
      labels: pricePoints.map((_, idx) => String(idx + 1)),
      datasets: [
        { 
          data: askPrices.length > 0 ? askPrices : [0, 0, 0], 
          color: () => '#5078FF', 
          strokeWidth: 3 
        },
        {
          data: bidPrices.length > 0 ? bidPrices : [0, 0, 0],
          color: () => '#FF4F78',
          strokeWidth: 2,
          strokeDashArray: [4, 2] // Dashed line for bid prices
        }
      ],
      legend: ['Ask Price', 'After Fee (Bid)'],
    };
  }, [pricePoints, feePercent, safeConvertBnToNumber]);

  /**
   * Handles curve changes from the configurator
   */
  const handleCurveChange = useCallback((newPrices: BN[], parameters: any) => {
    setPricePoints(newPrices);

    // Update display parameters
    if (parameters) {
      setCurveType(parameters.curveType || 'linear');
      setBasePrice(parameters.basePrice || 0);
      setTopPrice(parameters.topPrice || 0);
      setPointCount(parameters.points || 0);
      setFeePercent(parameters.feePercent || 0);
    }
  }, []);

  /**
   * Derives bid prices from ask prices based on fee percentage
   */
  const deriveBidPricesFromAsk = useCallback((askPrices: number[]): number[] => {
    return askPrices.map(price => {
      const bidPrice = price * (1 - feePercent / 100);
      return Number.isFinite(bidPrice) ? bidPrice : 0;
    });
  }, [feePercent]);

  /**
   * Handles the process of setting the bonding curve on-chain
   * @returns {Promise<void>}
   */
  const onPressSetCurve = useCallback(async () => {
    if (!marketAddress) {
      Alert.alert(
        'No Market Address',
        'Please enter or create a market first before setting the bonding curve.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    if (pricePoints.length === 0) {
      Alert.alert(
        'Configure Curve First',
        'Please configure the bonding curve parameters before submitting.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    try {
      setLoading(true);
      setIsSubmitting(true);
      setStatus('Preparing bonding curve transaction...');
      setStatusType('info');

      // Convert BN => number before passing
      const askNumbers = pricePoints.map(p => {
        try {
          const num = p.toNumber();
          return Number.isFinite(num) ? num : 0;
        } catch (e) {
          return 0;
        }
      });
      
      // Derive bid prices from ask prices
      const bidNumbers = deriveBidPricesFromAsk(askNumbers);

      const txSig = await setBondingCurve({
        marketAddress,
        askPrices: askNumbers,
        bidPrices: bidNumbers,
        userPublicKey: publicKey,
        connection,
        solanaWallet,
        onStatusUpdate: (newStatus) => {
          console.log('Bonding curve status:', newStatus);
          setStatus(newStatus);
          // Keep type as info during transaction processing
          setStatusType('info');
        }
      });

      setStatus('Bonding curve set successfully!');
      setStatusType('success');
    } catch (err: any) {
      console.error('Bonding curve error:', err);
      setStatus('Transaction failed. Please try again.');
      setStatusType('error');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setIsSubmitting(false);
      }, 1000);

      // Keep success/error message visible a bit longer
      setTimeout(() => {
        setStatus(null);
      }, 5000);
    }
  }, [marketAddress, pricePoints, connection, publicKey, solanaWallet, setLoading, deriveBidPricesFromAsk]);

  // Determine which status container style to use based on status type
  const getStatusContainerStyle = useCallback(() => {
    if (statusType === 'success') return [styles.statusContainer, styles.successStatusContainer];
    if (statusType === 'error') return [styles.statusContainer, styles.errorStatusContainer];
    return styles.statusContainer;
  }, [statusType]);

  // Determine which status text style to use based on status type
  const getStatusTextStyle = useCallback(() => {
    if (statusType === 'success') return [styles.statusText, styles.successStatusText];
    if (statusType === 'error') return [styles.statusText, styles.errorStatusText];
    return styles.statusText;
  }, [statusType]);

  return (
    <View style={styles.section}>
      <View style={styles.cardHeader}>
        <Text style={styles.sectionTitle}>Bonding Curve</Text>
        <Text style={styles.sectionDescription}>
          Configure the pricing curve for your token. The bonding curve determines how token price
          changes based on supply.
        </Text>
      </View>

      <View style={styles.mainContainer}>
        {/* Visual preview */}
        <View style={styles.chartContainer}>
          <Text style={styles.livePreviewTitle}>Live Preview</Text>
          
          <LineChart
            data={chartData}
            width={CHART_WIDTH}
            height={CHART_HEIGHT}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(70, 70, 70, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '1',
                stroke: '#fafafa',
              },
            }}
            bezier={false} // Use straight lines instead of curved
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
            formatYLabel={(value) => {
              const num = parseFloat(value);
              if (!Number.isFinite(num)) return '0';
              if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
              if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
              return value;
            }}
            withInnerLines={false}
            withOuterLines
            withVerticalLines={false}
          />

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.bidDot]} />
              <Text style={styles.legendText}>Ask Price</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.askDot]} />
              <Text style={styles.legendText}>After Fee (Bid)</Text>
            </View>
          </View>

          {/* Current parameters display */}
          {pricePoints.length > 0 && (
            <View style={styles.curveParameters}>
              <View style={styles.parameterRow}>
                <Text style={styles.parameterLabel}>Type:</Text>
                <Text style={styles.parameterValue}>{curveType.charAt(0).toUpperCase() + curveType.slice(1)}</Text>
              </View>
              <View style={styles.parameterRow}>
                <Text style={styles.parameterLabel}>Base:</Text>
                <Text style={styles.parameterValue}>{basePrice.toFixed(0)}</Text>
              </View>
              <View style={styles.parameterRow}>
                <Text style={styles.parameterLabel}>Top:</Text>
                <Text style={styles.parameterValue}>{topPrice.toFixed(0)}</Text>
              </View>
              <View style={styles.parameterRow}>
                <Text style={styles.parameterLabel}>Points:</Text>
                <Text style={styles.parameterValue}>{pointCount}</Text>
              </View>
              <View style={styles.parameterRow}>
                <Text style={styles.parameterLabel}>Fee:</Text>
                <Text style={styles.parameterValue}>{feePercent.toFixed(1)}%</Text>
              </View>
            </View>
          )}
        </View>

        {/* Configuration controls */}
        <View style={styles.configuratorContainer}>
          <BondingCurveConfigurator
            onCurveChange={handleCurveChange}
            disabled={!!isSubmitting}
          />
        </View>
      </View>

      <View style={styles.divider} />

      {status && (
        <View style={getStatusContainerStyle()}>
          {isSubmitting && (
            <ActivityIndicator
              size="small"
              color={statusType === 'error' ? '#e12d39' : statusType === 'success' ? '#03a66d' : '#0065ff'}
            />
          )}
          <Text style={getStatusTextStyle()}>{status}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, isSubmitting ? styles.disabledButton : {}]}
        onPress={onPressSetCurve}
        disabled={isSubmitting}>
        <Text style={styles.buttonText}>
          {isSubmitting ? 'Setting Curve...' : 'Set Curve On-Chain'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.helpText}>
        Setting the curve will require a transaction approval from your wallet
      </Text>
    </View>
  );
});

export default BondingCurveCard;

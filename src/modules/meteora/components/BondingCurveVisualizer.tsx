import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, Text as SvgText } from 'react-native-svg';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

interface BondingCurveVisualizerProps {
    initialMarketCap: number;
    migrationMarketCap: number;
    tokenSupply: number;
}

export default function BondingCurveVisualizer({
    initialMarketCap,
    migrationMarketCap,
    tokenSupply,
}: BondingCurveVisualizerProps) {
    const [points, setPoints] = useState<Array<{ x: number; y: number }>>([]);
    const [maxY, setMaxY] = useState(0);

    const WIDTH = Dimensions.get('window').width - 64;
    const HEIGHT = 200;
    const PADDING = 24;

    // Calculate key points on the curve
    useEffect(() => {
        if (!initialMarketCap || !migrationMarketCap || !tokenSupply) return;

        try {
            // Ensure valid inputs
            const initialCap = Math.max(1, initialMarketCap);
            const migrationCap = Math.max(initialCap * 1.1, migrationMarketCap);
            const supply = Math.max(1, tokenSupply);

            // Calculate the price at various points along the curve
            const newPoints = [];
            const numPoints = 50;

            // Dynamic bonding curve approximation
            const initialPrice = initialCap / supply;
            const finalPrice = migrationCap / supply;
            let highestY = 0;

            for (let i = 0; i <= numPoints; i++) {
                // Using a quadratic curve to show accelerating price growth
                const percentSupply = i / numPoints;
                const supplyAtPoint = percentSupply * supply;

                // Quadratic price curve: p = a*x² + b*x + c
                // Where x is the percentage of supply sold
                const price = initialPrice + (finalPrice - initialPrice) * Math.pow(percentSupply, 2);

                // Map supply (x) to horizontal position
                const x = (percentSupply * (WIDTH - 2 * PADDING)) + PADDING;

                // Map price (y) to vertical position (inverted, as SVG y-axis goes down)
                const y = HEIGHT - PADDING - (price / finalPrice) * (HEIGHT - 2 * PADDING);

                if (price > highestY) highestY = price;

                newPoints.push({ x, y });
            }

            setMaxY(highestY);
            setPoints(newPoints);
        } catch (error) {
            console.error('Error calculating curve points:', error);
        }
    }, [initialMarketCap, migrationMarketCap, tokenSupply]);

    // Format numbers with k/m suffix
    const formatNumber = (num: number): string => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toFixed(2);
    };

    if (points.length === 0) {
        return (
            <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>
                    Fill in all parameters to view bonding curve preview
                </Text>
            </View>
        );
    }

    // Create the path string from points
    const pathData = points.reduce((acc, point, i) => {
        if (i === 0) {
            return `M ${point.x} ${point.y}`;
        }
        return `${acc} L ${point.x} ${point.y}`;
    }, '');

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bonding Curve Preview</Text>

            <Svg width={WIDTH} height={HEIGHT} style={styles.svgContainer}>
                {/* X and Y axes */}
                <Line
                    x1={PADDING}
                    y1={HEIGHT - PADDING}
                    x2={WIDTH - PADDING}
                    y2={HEIGHT - PADDING}
                    stroke={COLORS.greyMid}
                    strokeWidth={1}
                />
                <Line
                    x1={PADDING}
                    y1={PADDING}
                    x2={PADDING}
                    y2={HEIGHT - PADDING}
                    stroke={COLORS.greyMid}
                    strokeWidth={1}
                />

                {/* Curve */}
                <Path
                    d={pathData}
                    stroke={COLORS.brandPrimary}
                    strokeWidth={2.5}
                    fill="none"
                />

                {/* X axis labels */}
                <SvgText
                    x={PADDING}
                    y={HEIGHT - 8}
                    fontSize={10}
                    fill={COLORS.greyMid}
                    textAnchor="middle"
                >
                    0
                </SvgText>
                <SvgText
                    x={WIDTH / 2}
                    y={HEIGHT - 8}
                    fontSize={10}
                    fill={COLORS.greyMid}
                    textAnchor="middle"
                >
                    {formatNumber(tokenSupply / 2)}
                </SvgText>
                <SvgText
                    x={WIDTH - PADDING}
                    y={HEIGHT - 8}
                    fontSize={10}
                    fill={COLORS.greyMid}
                    textAnchor="middle"
                >
                    {formatNumber(tokenSupply)}
                </SvgText>

                {/* Y axis labels */}
                <SvgText
                    x={8}
                    y={HEIGHT - PADDING}
                    fontSize={10}
                    fill={COLORS.greyMid}
                    textAnchor="start"
                >
                    0
                </SvgText>
                <SvgText
                    x={8}
                    y={HEIGHT / 2}
                    fontSize={10}
                    fill={COLORS.greyMid}
                    textAnchor="start"
                >
                    {formatNumber(maxY / 2)}
                </SvgText>
                <SvgText
                    x={8}
                    y={PADDING + 4}
                    fontSize={10}
                    fill={COLORS.greyMid}
                    textAnchor="start"
                >
                    {formatNumber(maxY)}
                </SvgText>

                {/* Key Points */}
                <Circle
                    cx={PADDING}
                    cy={points[0]?.y || HEIGHT - PADDING}
                    r={5}
                    fill={COLORS.brandPrimary}
                />
                <Circle
                    cx={WIDTH - PADDING}
                    cy={points[points.length - 1]?.y || PADDING}
                    r={5}
                    fill={COLORS.brandPrimary}
                />
            </Svg>

            <View style={styles.labelContainer}>
                <Text style={styles.xAxisLabel}>Token Supply</Text>
                <Text style={styles.yAxisLabel}>Price (SOL)</Text>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>Key Metrics</Text>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Initial Price:</Text>
                    <Text style={styles.infoValue}>
                        {formatNumber(initialMarketCap / tokenSupply)} SOL
                    </Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Migration Price:</Text>
                    <Text style={styles.infoValue}>
                        {formatNumber(migrationMarketCap / tokenSupply)} SOL
                    </Text>
                </View>
                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Price Increase:</Text>
                    <Text style={styles.infoValue}>
                        {formatNumber((migrationMarketCap / initialMarketCap) * 100)}%
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.darkerBackground,
        padding: 16,
        borderRadius: 16,
        marginVertical: 24,
        borderWidth: 1,
        borderColor: COLORS.borderDarkColor,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    svgContainer: {
        marginTop: 8,
    },
    title: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weights.semiBold,
        color: COLORS.white,
        marginBottom: 16,
        textAlign: 'center',
    },
    placeholderContainer: {
        height: 200,
        backgroundColor: COLORS.darkerBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        padding: 16,
        marginVertical: 24,
        borderWidth: 1,
        borderColor: COLORS.borderDarkColor,
    },
    placeholderText: {
        color: COLORS.greyMid,
        fontSize: TYPOGRAPHY.size.sm,
        textAlign: 'center',
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    xAxisLabel: {
        color: COLORS.greyMid,
        fontSize: TYPOGRAPHY.size.xs,
        textAlign: 'center',
        flex: 1,
    },
    yAxisLabel: {
        color: COLORS.greyMid,
        fontSize: TYPOGRAPHY.size.xs,
        width: 80,
        textAlign: 'right',
    },
    infoContainer: {
        marginTop: 20,
        padding: 16,
        backgroundColor: COLORS.lighterBackground,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.borderDarkColor,
    },
    infoTitle: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: TYPOGRAPHY.weights.semiBold,
        color: COLORS.white,
        marginBottom: 12,
        textAlign: 'center',
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderDarkColor,
    },
    infoLabel: {
        color: COLORS.greyMid,
        fontSize: TYPOGRAPHY.size.sm,
    },
    infoValue: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: TYPOGRAPHY.weights.semiBold,
    },
}); 
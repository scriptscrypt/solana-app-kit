import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getTokenRiskReport, TokenRiskReport, getRiskScoreColor, getRiskLevelColor, RiskLevel } from '../../../services/rugCheckService';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

interface RiskAnalysisSectionProps {
    tokenAddress: string;
}

const RiskAnalysisSection: React.FC<RiskAnalysisSectionProps> = ({ tokenAddress }) => {
    const [loading, setLoading] = useState(true);
    const [riskReport, setRiskReport] = useState<TokenRiskReport | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRiskReport();
    }, [tokenAddress]);

    const fetchRiskReport = async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('[RiskAnalysis] Fetching report for', tokenAddress);
            const report = await getTokenRiskReport(tokenAddress, true);

            if (report) {
                console.log('[RiskAnalysis] Successfully received report');
                setRiskReport(report);
            } else {
                console.log('[RiskAnalysis] No report data received');
                setError('Unable to retrieve risk data for this token');
            }
        } catch (err) {
            console.error('[RiskAnalysis] Error fetching risk report:', err);
            setError('Error loading risk data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.brandPrimary} />
                <Text style={styles.loadingText}>Loading security analysis...</Text>
            </View>
        );
    }

    if (error || !riskReport) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error || 'No risk data available'}</Text>
            </View>
        );
    }

    // Format the risk score as a percentage
    const normalizedScore = Math.min(100, Math.max(0, Math.round(riskReport.score_normalised)));
    const scoreColor = getRiskScoreColor(normalizedScore);

    // Get risk label based on score
    const getRiskLabel = (score: number): string => {
        if (score < 30) return 'Low Risk';
        if (score < 60) return 'Medium Risk';
        if (score < 80) return 'High Risk';
        return 'Critical Risk';
    };

    return (
        <View style={styles.container}>
            {/* Risk Score */}
            <View style={styles.scoreSection}>
                <View style={styles.scoreContainer}>
                    <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
                        <Text style={styles.scoreValue}>{normalizedScore}</Text>
                    </View>
                    <Text style={[styles.riskLabel, { color: scoreColor }]}>
                        {riskReport.rugged ? 'RUGGED' : getRiskLabel(normalizedScore)}
                    </Text>
                </View>

                {riskReport.rugged && (
                    <View style={styles.ruggedBadge}>
                        <Text style={styles.ruggedText}>RUGGED</Text>
                    </View>
                )}
            </View>

            {/* Risk Explanation */}
            <View style={styles.explanationContainer}>
                <Text style={styles.explanationTitle}>Security Analysis</Text>
                <Text style={styles.explanationText}>
                    {getRiskExplanation(normalizedScore, riskReport.rugged)}
                </Text>
            </View>

            {/* Risk Factors */}
            {riskReport.risks && riskReport.risks.length > 0 && (
                <View style={styles.riskFactorsContainer}>
                    <Text style={styles.factorsTitle}>Risk Factors</Text>

                    {riskReport.risks.map((risk, index) => (
                        <View key={index} style={styles.riskItem}>
                            <View style={styles.riskItemHeader}>
                                <Text style={styles.riskName}>{risk.name}</Text>
                                <View style={[
                                    styles.riskLevelBadge,
                                    { backgroundColor: getRiskLevelColor(risk.level.toLowerCase() as RiskLevel) }
                                ]}>
                                    <Text style={styles.riskLevelText}>{risk.level.toUpperCase()}</Text>
                                </View>
                            </View>
                            <Text style={styles.riskDescription}>{risk.description}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Distribution Section */}
            {riskReport.topHolders && riskReport.topHolders.length > 0 && (
                <View style={styles.holdersContainer}>
                    <Text style={styles.holdersTitle}>Top Holders</Text>
                    <Text style={styles.holdersSubtitle}>
                        Total Holders: {riskReport.totalHolders?.toLocaleString() || 'N/A'}
                    </Text>

                    {riskReport.topHolders.slice(0, 5).map((holder, index) => (
                        <View key={index} style={styles.holderItem}>
                            <Text style={styles.holderAddress} numberOfLines={1}>
                                {holder.address.substring(0, 8)}...{holder.address.substring(holder.address.length - 8)}
                            </Text>
                            <View style={styles.holderBarContainer}>
                                <View
                                    style={[
                                        styles.holderBar,
                                        { width: `${Math.min(100, holder.pct * 100)}%` },
                                        holder.insider && styles.insiderBar
                                    ]}
                                />
                            </View>
                            <Text style={styles.holderPercentage}>
                                {(holder.pct * 100).toFixed(2)}%
                            </Text>
                            {holder.insider && (
                                <View style={styles.insiderBadge}>
                                    <Text style={styles.insiderText}>INSIDER</Text>
                                </View>
                            )}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

// Helper function to generate risk explanations
function getRiskExplanation(score: number, isRugged: boolean): string {
    if (isRugged) {
        return 'This token has been identified as rugged. This means the project has likely been abandoned or was a scam. Trading is not recommended.';
    }

    if (score < 30) {
        return 'This token has a low risk score. It shows strong security indicators and appears to have legitimate tokenomics.';
    } else if (score < 60) {
        return 'This token has a medium risk score. While it shows some positive signs, there are potential concerns that should be evaluated carefully.';
    } else if (score < 80) {
        return 'This token has a high risk score. Multiple risk factors have been identified that could indicate potential issues.';
    } else {
        return 'This token has a critical risk score. Significant red flags have been detected that suggest high risk of loss.';
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.lightBackground,
        borderRadius: 16,
        padding: 20,
        marginBottom: 30,
    },
    loadingContainer: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        marginTop: 12,
        color: COLORS.greyMid,
        fontSize: TYPOGRAPHY.size.md,
    },
    errorContainer: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    errorText: {
        color: COLORS.greyMid,
        fontSize: TYPOGRAPHY.size.md,
        textAlign: 'center',
    },
    scoreSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    scoreContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scoreBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scoreValue: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: '700',
    },
    riskLabel: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: '600',
        marginLeft: 12,
    },
    ruggedBadge: {
        backgroundColor: COLORS.errorRed,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    ruggedText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.size.xs,
        fontWeight: '700',
    },
    explanationContainer: {
        backgroundColor: COLORS.darkerBackground,
        borderRadius: 10,
        padding: 14,
        marginBottom: 20,
    },
    explanationTitle: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: '600',
        color: COLORS.white,
        marginBottom: 12,
    },
    explanationText: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.greyMid,
        lineHeight: 20,
    },
    riskFactorsContainer: {
        marginBottom: 20,
    },
    factorsTitle: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: '600',
        color: COLORS.white,
        marginBottom: 12,
    },
    riskItem: {
        backgroundColor: COLORS.darkerBackground,
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
    },
    riskItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    riskName: {
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: '600',
        color: COLORS.white,
        flex: 1,
    },
    riskLevelBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    riskLevelText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.size.xs,
        fontWeight: '700',
    },
    riskDescription: {
        fontSize: TYPOGRAPHY.size.xs,
        color: COLORS.greyMid,
        lineHeight: 18,
    },
    holdersContainer: {
        marginTop: 4,
    },
    holdersTitle: {
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: '600',
        color: COLORS.white,
        marginBottom: 4,
    },
    holdersSubtitle: {
        fontSize: TYPOGRAPHY.size.sm,
        color: COLORS.greyMid,
        marginBottom: 12,
    },
    holderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    holderAddress: {
        width: 120,
        fontSize: TYPOGRAPHY.size.xs,
        color: COLORS.white,
    },
    holderBarContainer: {
        flex: 1,
        height: 6,
        backgroundColor: COLORS.darkerBackground,
        borderRadius: 3,
        marginHorizontal: 8,
    },
    holderBar: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: COLORS.brandPrimary,
    },
    insiderBar: {
        backgroundColor: COLORS.brandPurple,
    },
    holderPercentage: {
        width: 50,
        fontSize: TYPOGRAPHY.size.xs,
        color: COLORS.white,
        textAlign: 'right',
    },
    insiderBadge: {
        backgroundColor: COLORS.brandPurple,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        marginLeft: 8,
    },
    insiderText: {
        color: COLORS.white,
        fontSize: TYPOGRAPHY.size.xs,
        fontWeight: '700',
    },
});

export default RiskAnalysisSection; 
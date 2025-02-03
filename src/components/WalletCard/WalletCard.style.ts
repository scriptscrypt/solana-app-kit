import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    balanceSection: {
        alignItems: 'center',
        marginBottom: 28,
    },
    balanceAmount: {
        fontSize: 36,
        fontWeight: '700',
        color: '#000000',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    priceChangeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    priceChangeText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#32D4DE',
    },
    percentageContainer: {
        backgroundColor: '#D6FDFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    percentageText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#32D4DE',
    },
    portfolioLabel: {
        fontSize: 16,
        color: '#666666',
        fontWeight: '500',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    actionButton: {
        flex: 1,
        alignItems: 'center',
    },
    buttonIconContainer: {
        width: 52,
        height: 52,
        backgroundColor: '#F5F5F5',
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    buttonLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000000',
        marginBottom: 2,
    },
    buttonSubLabel: {
        fontSize: 12,
        color: '#666666',
        fontWeight: '500',
    },
}); 
import { StyleSheet, Dimensions } from "react-native";
import COLORS from "../../../../assets/colors";
import TYPOGRAPHY from "../../../../assets/typography";

// Get screen dimensions for grid items
const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width * 0.9 - 48) / 3; // 3 items per row with padding

export const styles = StyleSheet.create({
    // Main container styles
    container: {
        width: "100%",
        height: "auto",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderColor: COLORS.greyBorderdark,
        borderRadius: 12,
        // borderWidth: 1
        backgroundColor: COLORS.lighterBackground
    },
    contentContainer: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 8
    },
    buyButtonContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },

    // Image styles
    imgContainer: {
        width: 38,
        height: 38,
        borderRadius: 8,
        overflow: "hidden", 
    },
    img: {
        width: "100%",
        height: "100%",
    },
    imgWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    imgBackground: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.2,
    },

    // Button styles
    buyButton: {
        paddingHorizontal: 16,
        height: 36,
        borderRadius: 12,
        backgroundColor: COLORS.lightBackground, 
        alignItems: "center",
        justifyContent: "center",
    },
    buyButtonText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.xs,
        fontWeight: '600',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: COLORS.greyMid,
    },
    arrowButton: {
        padding: 8,
        marginLeft: 8,
        color: COLORS.greyMid,
    },
    pinArrowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.brandBlue,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    pinButtonText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: '600',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: COLORS.white,
        marginLeft: 6,
    },

    // Pin your coin styles
    pinYourCoinContainer: {
        borderStyle: "dashed",
        borderColor: COLORS.brandBlue,
        borderWidth: 1.5,
        backgroundColor: "rgba(29, 155, 240, 0.05)",
    },

    // Token name styles (recently added)
    tokenNameText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: '500',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: COLORS.white,
    },
    pinYourCoinText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: '500',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: COLORS.brandBlue,
    },

    // Portfolio modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eaecef',
    },
    modalTitle: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.xl,
        fontWeight: '600',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#14171a',
    },
    closeButton: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15,
        backgroundColor: '#f7f8fa',
    },
    closeButtonText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.lg,
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#657786',
    },

    // Loading and error states
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.lg,
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#657786',
        textAlign: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.lg,
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#e0245e',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#1d9bf0',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 10,
    },
    retryText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.md,
        fontWeight: '600',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: COLORS.white,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.lg,
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#657786',
        textAlign: 'center',
    },

    // Asset list styles
    assetsContainer: {
        flex: 1,
    },
    sectionContainer: {
        marginVertical: 16,
    },
    sectionTitle: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.lg,
        fontWeight: '600',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#14171a',
        marginHorizontal: 16,
        marginBottom: 12,
    },
    assetsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 8,
    },
    assetItem: {
        marginBottom: 12,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        margin: 8,
        overflow: 'hidden',
    },
    assetImageContainer: {
        height: 120,
        width: '100%',
        borderRadius: 8,
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: '#f0f2f5',
    },
    assetImageWrapper: {
        width: '100%',
        height: '100%',
        position: 'relative',
    },
    fallbackImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.2,
    },
    assetImage: {
        width: '100%',
        height: '100%',
    },
    assetPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f7f8fa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    assetPlaceholderText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.xxl,
        fontWeight: 'bold',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#AAB8C2',
    },
    assetDetails: {
        padding: 8,
    },
    assetName: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: '500',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#14171a',
        marginBottom: 2,
    },
    assetBalance: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.xs,
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#657786',
    },
    assetCollection: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.xs,
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#657786',
    },

    // Token styles
    tokenItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        margin: 8,
        overflow: 'hidden',
    },
    tokenLogoContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        overflow: 'hidden',
        marginRight: 8,
    },
    tokenLogo: {
        width: '100%',
        height: '100%',
    },
    tokenLogoPlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#f7f8fa',
        justifyContent: 'center',
        alignItems: 'center',
    },
    tokenLogoPlaceholderText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.xxl,
        fontWeight: 'bold',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#AAB8C2',
    },
    tokenDetails: {
        flex: 1,
    },
    tokenName: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: '500',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#14171a',
        marginBottom: 2,
    },
    tokenSymbol: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.xs,
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#657786',
    },
    tokenBalanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tokenBalance: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.xs,
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#657786',
    },
    tokenValue: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.xs,
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#657786',
    },
    tokenListContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        overflow: 'hidden',
        margin: 8,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },

    // Collection styles
    collectionGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 8,
    },
    collectionItem: {
        width: ITEM_WIDTH,
        marginBottom: 12,
        backgroundColor: COLORS.white,
        borderRadius: 12,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
        margin: 8,
        overflow: 'hidden',
    },
    collectionImage: {
        width: '100%',
        height: 100,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    collectionName: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.xs,
        fontWeight: '500',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        padding: 8,
        textAlign: 'center',
        color: '#14171a',
    },

    // Search styles
    searchContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        borderRadius: 14,
        paddingHorizontal: 15,
        paddingVertical: 8,
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.sm,
        letterSpacing: TYPOGRAPHY.letterSpacing,
        marginRight: 8,
    },
    searchButton: {
        backgroundColor: '#1d9bf0',
        paddingHorizontal: 16,
        borderRadius: 14,
        justifyContent: 'center',
    },
    searchButtonText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: '600',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: COLORS.white,
    },

    // Badge styles
    compressedBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(29, 155, 240, 0.8)',
        borderRadius: 12,
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    compressedText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.xs,
        fontWeight: 'bold',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: COLORS.white,
    },
    priceBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    priceText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.xs,
        fontWeight: 'bold',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: COLORS.white,
    },

    // SOL balance styles
    solBalanceContainer: {
        margin: 16,
        padding: 16,
        backgroundColor: '#f7fbfe',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e1e8ed',
        elevation: 2,
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    solBalanceLabel: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.sm,
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#657786',
        marginBottom: 4,
    },
    solBalanceValue: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.xxl,
        fontWeight: '600',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#14171a',
    },

    // Action styles
    actionsContainer: {
        padding: 16,
        backgroundColor: '#f7f9fa',
        marginBottom: 8,
    },
    actionsText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.sm,
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#555',
        marginBottom: 8,
    },
    removeButton: {
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: '#f7f7f7',
        borderWidth: 1,
        borderColor: '#e0245e',
        borderRadius: 16,
        marginBottom: 8,
    },
    removeButtonText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.sm,
        fontWeight: '500',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#e0245e',
    },
    instructionsContainer: {
        marginVertical: 12,
        paddingHorizontal: 16,
    },
    instructionsText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.sm,
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#657786',
        fontStyle: 'italic',
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: '#f0f2f5',
        marginLeft: 56,
    },

    // Token description styles
    tokenDescText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.xs,
        fontWeight: '400',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: COLORS.greyDark,
    },
    tokenDescriptionText: {
        fontFamily: TYPOGRAPHY.fontFamily,
        fontSize: TYPOGRAPHY.size.xs,
        fontWeight: '400',
        letterSpacing: TYPOGRAPHY.letterSpacing,
        color: '#666',
        marginTop: 4,
    },
});
import { StyleSheet, Dimensions } from "react-native";
import COLORS from "../../../../assets/colors";

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
        borderWidth: 1
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
        backgroundColor: COLORS.greyLight, 
        alignItems: "center",
        justifyContent: "center",
    },
    buyButtonText: {
        color: "black",
        fontSize: 12,
        fontWeight: "600",
    },
    arrowButton: {
        padding: 8,
        marginLeft: 8,
    },
    pinArrowButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1d9bf0',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
    },
    pinButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 6,
    },

    // Pin your coin styles
    pinYourCoinContainer: {
        borderStyle: "dashed",
        borderColor: "#1d9bf0",
        backgroundColor: "rgba(29, 155, 240, 0.05)",
    },

    // Portfolio modal styles
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
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
        fontSize: 18,
        fontWeight: '600',
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
        fontSize: 16,
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
        fontSize: 16,
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
        fontSize: 16,
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
        color: 'white',
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
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
        fontSize: 16,
        fontWeight: '600',
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
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#AAB8C2',
    },
    assetDetails: {
        padding: 8,
    },
    assetName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#14171a',
        marginBottom: 2,
    },
    assetBalance: {
        fontSize: 12,
        color: '#657786',
    },
    assetCollection: {
        fontSize: 12,
        color: '#657786',
    },

    // Token styles
    tokenItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
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
        fontSize: 24,
        fontWeight: 'bold',
        color: '#AAB8C2',
    },
    tokenDetails: {
        flex: 1,
    },
    tokenName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#14171a',
        marginBottom: 2,
    },
    tokenSymbol: {
        fontSize: 12,
        color: '#657786',
    },
    tokenBalanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tokenBalance: {
        fontSize: 12,
        color: '#657786',
    },
    tokenValue: {
        fontSize: 12,
        color: '#657786',
    },
    tokenListContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        margin: 8,
        shadowColor: '#000',
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
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
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
        fontSize: 12,
        fontWeight: '500',
        color: '#14171a',
        padding: 8,
        textAlign: 'center',
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
        fontSize: 14,
        marginRight: 8,
    },
    searchButton: {
        backgroundColor: '#1d9bf0',
        paddingHorizontal: 16,
        borderRadius: 14,
        justifyContent: 'center',
    },
    searchButtonText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
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
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
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
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    solBalanceLabel: {
        fontSize: 14,
        color: '#657786',
        marginBottom: 4,
    },
    solBalanceValue: {
        fontSize: 24,
        fontWeight: '600',
        color: '#14171a',
    },

    // Action styles
    actionsContainer: {
        padding: 16,
        backgroundColor: '#f7f9fa',
        marginBottom: 8,
    },
    actionsText: {
        fontSize: 14,
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
        color: '#e0245e',
        fontSize: 14,
        fontWeight: '500',
    },
    instructionsContainer: {
        marginVertical: 12,
        paddingHorizontal: 16,
    },
    instructionsText: {
        fontSize: 14,
        color: '#657786',
        fontStyle: 'italic',
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: '#f0f2f5',
        marginLeft: 56,
    },
});
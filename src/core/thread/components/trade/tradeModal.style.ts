import {StyleSheet, Platform, Dimensions} from 'react-native';
import COLORS from '../../../../assets/colors';
import TYPOGRAPHY from '../../../../assets/typography';

const {width, height} = Dimensions.get('window');

export default StyleSheet.create({
  /** Main Modal / Container styles */
  flexFill: {
    flex: 1,
  },
  darkOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  centeredWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContentContainer: {
    backgroundColor: COLORS.lightBackground,
    width: '100%',
    maxWidth: '100%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    maxHeight: Platform.OS === 'ios' ? height * 0.85 : height * 0.8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: -4},
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
    borderBottomWidth: 0,
  },

  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: COLORS.borderDarkColor,
    alignSelf: 'center',
    marginBottom: 15,
  },

  /** Header styles */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.bold),
    color: COLORS.white,
    letterSpacing: TYPOGRAPHY.letterSpacing,
  },
  headerClose: {
    position: 'absolute',
    right: 0,
    top: 0,
    padding: 4,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: COLORS.lighterBackground,
  },
  headerCloseText: {
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.accessoryDarkColor,
    lineHeight: 18,
  },

  /** Tab row styles */
  tabRow: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: COLORS.lighterBackground,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.15,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabButtonText: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.medium),
    color: COLORS.accessoryDarkColor,
  },
  tabButtonTextActive: {
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    color: COLORS.brandBlue,
  },

  /** Tab content wrapper */
  fullWidthScroll: {
    width: '100%',
    paddingBottom: 16,
  },
  tabContentContainer: {
    paddingVertical: 8,
  },

  /** Token row and selectors */
  tokenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 12,
  },
  tokenColumn: {
    flex: 1,
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lighterBackground,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.15,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  arrowText: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.bold),
    color: COLORS.brandBlue,
  },
  tokenSelector: {
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.lighterBackground,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  tokenSelectorText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    color: COLORS.white,
  },
  tokenIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  chevronDown: {
    width: 16,
    height: 16,
    opacity: 0.7,
  },
  tokenSelectorInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /** Text inputs and labels */
  inputLabel: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    color: COLORS.accessoryDarkColor,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 20,
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.white,
    backgroundColor: COLORS.lighterBackground,
  },

  /** Buttons & loaders */
  swapButton: {
    backgroundColor: COLORS.brandBlue,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    alignSelf: 'center',
    width: 'auto',
    maxWidth: '80%',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 171, 228, 0.5)',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  swapButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.bold),
  },
  activityLoader: {
    marginVertical: 20,
  },

  /** Result & error messages */
  resultText: {
    color: '#10B981',
    fontSize: TYPOGRAPHY.size.sm,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
  },
  errorText: {
    color: COLORS.errorRed,
    fontSize: TYPOGRAPHY.size.sm,
    marginTop: 12,
    textAlign: 'center',
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
  },

  /**
   * Confirmation ("Share your trade?") Modal Styles
   */
  sharePromptBackdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  sharePromptContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sharePromptBox: {
    backgroundColor: COLORS.lightBackground,
    width: '85%',
    borderRadius: 16,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  sharePromptTitle: {
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.bold),
    marginBottom: 12,
    textAlign: 'center',
    color: COLORS.white,
  },
  sharePromptDescription: {
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.accessoryDarkColor,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.lineHeight.md,
  },
  sharePromptButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  sharePromptBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  sharePromptBtnCancel: {
    backgroundColor: COLORS.darkerBackground,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  sharePromptBtnConfirm: {
    backgroundColor: COLORS.brandBlue,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 171, 228, 0.5)',
        shadowOffset: {width: 0, height: 3},
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sharePromptBtnText: {
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.accessoryDarkColor,
  },
  sharePromptConfirmText: {
    color: COLORS.white,
  },

  // Past swaps tab
  pastSwapsContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    width: '100%',
    height: Platform.OS === 'ios' ? height * 0.45 : height * 0.4,
    maxHeight: 450,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  pastSwapsContent: {
    flex: 1,
    paddingBottom: 8,
  },
  swapsListContainer: {
    flex: 1,
  },
  pastSwapsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderDarkColor,
  },
  pastSwapsHeaderText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    color: COLORS.white,
  },
  refreshButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.lighterBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  refreshingOverlay: {
    position: 'absolute',
    zIndex: 10,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(12, 16, 26, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  walletNotConnected: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    margin: 10,
  },
  walletNotConnectedText: {
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.accessoryDarkColor,
    textAlign: 'center',
    marginTop: 12,
  },
  connectWalletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.lighterBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(12, 16, 26, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: TYPOGRAPHY.size.md,
    color: COLORS.brandBlue,
    textAlign: 'center',
  },
  swapItemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  emptySwapsList: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptySwapsIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.brandBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptySwapsText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySwapsSubtext: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.accessoryDarkColor,
    textAlign: 'center',
    marginBottom: 20,
  },
  swapsList: {
    paddingBottom: 16,
  },
  
  // Input amount section
  amountInputContainer: {
    marginBottom: 20,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  amountInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    color: COLORS.white,
    paddingVertical: 8,
  },
  maxButton: {
    backgroundColor: COLORS.lighterBackground,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  maxButtonText: {
    color: COLORS.brandBlue,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    fontSize: TYPOGRAPHY.size.sm,
  },
  amountUsdValue: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.accessoryDarkColor,
    marginTop: 4,
  },
  
  // Transaction history tab
  txHistoryHeader: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    color: COLORS.white,
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  txSignatureInputContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lighterBackground,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  pasteButtonText: {
    color: COLORS.brandBlue,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    marginLeft: 4,
  },
  txDescription: {
    fontSize: TYPOGRAPHY.size.sm,
    color: COLORS.accessoryDarkColor,
    lineHeight: TYPOGRAPHY.lineHeight.sm,
    marginBottom: 12,
  },
});

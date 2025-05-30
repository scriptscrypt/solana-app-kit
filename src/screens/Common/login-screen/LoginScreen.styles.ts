import {StyleSheet, Dimensions} from 'react-native';
import COLORS from '../../../assets/colors';
import TYPOGRAPHY from '../../../assets/typography';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  headerContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.05,
    alignItems: 'center',
  },
  welcomeText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.size.heading,
    fontWeight: '600',
    lineHeight: TYPOGRAPHY.lineHeight.heading,
    letterSpacing: TYPOGRAPHY.letterSpacing,
    color: COLORS.white,
  },
  subtitleText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: '400',
    lineHeight: TYPOGRAPHY.lineHeight.xl,
    letterSpacing: TYPOGRAPHY.letterSpacing,
    color: COLORS.accessoryDarkColor,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
  },
  svgContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashTextContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  smileFaceContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.3,
    left: SCREEN_WIDTH * 0.6,
    paddingVertical: 10,
    paddingHorizontal: 30,
    shadowColor: COLORS.black,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 1,
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 60,
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '75%',
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.lightBackground,
    marginVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: '600',
    lineHeight: TYPOGRAPHY.lineHeight.md,
    letterSpacing: TYPOGRAPHY.letterSpacing,
    marginLeft: 10,
    color: COLORS.greyMid,
  },
  buttonIcon: {
    marginRight: 8,
  },
  arrowCircle: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: COLORS.lighterBackground,
    justifyContent: 'center',
    alignItems: 'center',
    right: -8,
  },
  arrowText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.size.xxl,
    fontWeight: '900',
    color: COLORS.accessoryDarkColor,
    marginLeft: 2,
  },
  agreementText: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: '400',
    lineHeight: TYPOGRAPHY.lineHeight.sm,
    letterSpacing: TYPOGRAPHY.letterSpacing,
    position: 'absolute',
    bottom: 30,
    textAlign: 'center',
    color: COLORS.greyDark,
  },
  shapesBackground: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: -1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    backgroundColor: COLORS.darkerBackground,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  loadingText: {
    color: COLORS.white,
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default styles;

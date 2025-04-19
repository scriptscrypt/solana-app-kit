import { StyleSheet, Dimensions, Platform } from 'react-native';
import COLORS from '@/assets/colors';
import TYPOGRAPHY from '@/assets/typography';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1D212D', // Dark background color as specified
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.85,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    // Remove border
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: String(TYPOGRAPHY.semiBold),
    color: COLORS.white,
    fontFamily: TYPOGRAPHY.fontFamily,
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.xl,
    fontWeight: String(TYPOGRAPHY.semiBold),
  },
  saveButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  saveButtonText: {
    color: COLORS.brandBlue,
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: String(TYPOGRAPHY.semiBold),
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 10,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editPictureText: {
    color: COLORS.brandBlue,
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: String(TYPOGRAPHY.medium),
    fontFamily: TYPOGRAPHY.fontFamily,
    marginTop: 10,
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: TYPOGRAPHY.size.lg,
    color: COLORS.white,
    marginBottom: 8,
    fontWeight: String(TYPOGRAPHY.medium),
    fontFamily: TYPOGRAPHY.fontFamily,
    opacity: 0.7,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.lg,
    borderWidth: 0,
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  disabledInput: {
    opacity: 0.5,
    color: COLORS.greyMid,
  },
  bioInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  updateButton: {
    backgroundColor: COLORS.brandPrimary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  updateButtonText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: '600',
  },
}); 
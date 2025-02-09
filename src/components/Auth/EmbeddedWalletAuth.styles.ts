// File: /src/components/auth/EmbeddedWalletAuth.styles.ts
import {StyleSheet, Dimensions} from 'react-native';
import COLORS from '../../assets/colors';

const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    // Use similar container styling as LoginScreen
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
    color: COLORS.black,
  },
  bottomButtonsContainer: {
    // This container wraps the buttons and email input area.
    width: '100%',
    alignItems: 'center',
    marginVertical: 16,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '90%',
    height: 45,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.greyBorder,
  },
  buttonText: {
    marginLeft: 10,
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19.6,
    letterSpacing: -0.01,
    textAlign: 'center',
    color: COLORS.black,
  },
  emailContainer: {
    width: '90%',
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
  },
  statusText: {
    marginTop: 16,
    color: '#555',
    textAlign: 'center',
  },
});

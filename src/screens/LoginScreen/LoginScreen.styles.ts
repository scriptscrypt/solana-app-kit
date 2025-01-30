import {StyleSheet, Dimensions} from 'react-native';
const {width: SCREEN_WIDTH, height: SCREEN_HEIGHT} = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 1,
  },
  bottomButtonsContainer: {
    position: 'absolute',
    bottom: 60, // or whatever spacing you want
    width: '100%',
    alignItems: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80%', // 80% width
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFF',
    marginVertical: 8,
  },
  buttonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#000',
  },
});

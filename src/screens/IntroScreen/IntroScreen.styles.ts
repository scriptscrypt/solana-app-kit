import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
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
    top: SCREEN_HEIGHT * 0.30,
    left: SCREEN_WIDTH * 0.6,
    paddingVertical: 10.14,
    paddingHorizontal: 30.43,
  },
  bottomRectContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});

export default styles;

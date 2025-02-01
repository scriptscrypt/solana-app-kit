import {StyleSheet} from 'react-native';
import COLORS from '../../assets/colors';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 10,
    // borderWidth: 1,
    // borderColor: '#ECECEC',
    // borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flex: 1,
  },
  // to combine left and right sides
  combinedSides: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.greyLight,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  leftSide: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tokenImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  namePriceContainer: {
    flexDirection: 'column',
  },
  tokenName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  tokenPrice: {
    fontSize: 14,
    color: '#999999',
    fontWeight: 500,
  },
  rightSide: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  solPrice: {
    color: '#32DE6B',
    fontSize: 14,
    fontWeight: '600',
  },
  usdPrice: {
    fontSize: 13,
    color: '#777',
  },
  swapIcon: {
    backgroundColor: COLORS.greyLight,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: '50%',
    right: '50%',
    borderWidth: 8,
    borderColor: 'white',
    zIndex: 10,
    transform: [{translateX: 15}, {translateY: -15}],
  },
  copyButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  copyButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
});

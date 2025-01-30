import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ECECEC',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
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
    fontSize: 13,
    color: '#777',
  },
  rightSide: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  solPrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  usdPrice: {
    fontSize: 13,
    color: '#777',
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

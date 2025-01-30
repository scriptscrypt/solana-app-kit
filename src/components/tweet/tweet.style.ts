import {StyleSheet} from 'react-native';
import COLORS from '../../assets/colors';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    width: '100%',
  },
  avatarContainer: {
    width: '15%',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'cover',
  },
  infoContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    position: 'relative',
    flexWrap: 'wrap',
  },
  username: {
    fontWeight: '600',
  },
  handle: {
    fontWeight: '400',
    color: COLORS.greyMid,
  },
  menuIcon: {
    position: 'absolute',
    right: 8,
  },
  tweetText: {
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  reactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  reactionIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  buyButton: {
    backgroundColor: COLORS.brandPurpleBg,
    width: 40,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.brandPurple,
  },
  metricsContainer: {
    display: 'flex',
    alignContent: 'center',
    flexDirection: 'row',
  },
  metricsText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'left',
    color: COLORS.greyMid,
  },
});

import {StyleSheet} from 'react-native';
import COLORS from '../../assets/colors';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    marginVertical: -16,
  },
  header: {
    width: '100%',
    alignItems: 'center',
  },
  postSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  postAvatarContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    marginRight: 8,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  feedAvatarContainer: {
    position: 'relative',
    width: 40,
    height: 40,
    marginRight: 8,
  },
  feedAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  plusIconContainer: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    borderRadius: 25,
  },
  postMiddle: {
    flex: 1,
  },
  postUsername: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    color: COLORS.black,
  },
  postInput: {
    borderWidth: 0,
    borderColor: '#ECECEC',
    borderRadius: 8,
    height: 40,
    paddingHorizontal: 1,
    marginBottom: 4,
    fontSize: 14,
    color: COLORS.black,
  },
  iconsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  leftIcons: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  rightIcons: {
    flexDirection: 'row',
    gap: 10,
  },
  iconText: {
    fontSize: 12,
    color: COLORS.greyDark,
    left: -5,
  },
  reactionUsersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    left: -4,
  },
  reactionUserImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  reactionUserImageOverlap: {
    marginLeft: -8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.greyBorder,
    marginVertical: 4,
    width: '90%',
    alignContent: 'center',
    alignSelf: 'center',
  },
  feedListContainer: {
    paddingBottom: 20,
  },

  // Feed items
  feedItemContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  feedContent: {
    flex: 1,
  },
  feedUsername: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
    color: COLORS.black,
  },
  feedText: {
    fontSize: 14,
    color: COLORS.black,
    marginBottom: 6,
  },
  feedPostImage: {
    width: '70%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'cover',
    marginBottom: 6,
  },
});

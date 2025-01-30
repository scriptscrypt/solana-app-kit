import React, {useState} from 'react';
import {Image, Text, TouchableOpacity, View, FlatList} from 'react-native';
import {styles} from './userListing.style';
import {dummyData, UserItem} from '../../mocks/users';

const UserListing = () => {
  const [userData, setUserData] = useState(dummyData);

  const handleFollow = (id: string) => {
    setUserData(prevData =>
      prevData.map(user =>
        user.id === id ? {...user, following: !user.following} : user,
      ),
    );
  };

  const renderItem = ({item}: {item: UserItem}) => (
    <View style={styles.container}>
      <View style={styles.userDetails}>
        <View style={styles.imgBox}>
          <Image source={item.image} style={styles.image} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.usernameText}>{item.username}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={[
          styles.button,
          item.following ? styles.followingButton : styles.followButton,
        ]}
        onPress={() => handleFollow(item.id)}>
        <Text
          style={[
            styles.buttonText,
            item.following
              ? styles.followingButtonText
              : styles.followButtonText,
          ]}>
          {item.following ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <FlatList
      data={userData}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.flatListContainer}
    />
  );
};

export default UserListing;

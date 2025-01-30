import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View, FlatList } from "react-native";
import { styles } from "./userListing.style";

interface UserItem {
  id: string;
  name: string;
  username: string;
  image: any;  
  following: boolean; 
}

const dummyData: UserItem[] = [
  { id: "1", name: "Jian", username: "@jianYang", image: require("../../assets/images/Smiley.png"), following: false },
  { id: "2", name: "John", username: "@johnDoe", image: require("../../assets/images/Smiley.png"), following: true },
  { id: "3", name: "Alice", username: "@aliceSmith", image: require("../../assets/images/Smiley.png"), following: false },
  { id: "4", name: "Bob", username: "@bob123", image: require("../../assets/images/Smiley.png"), following: true },
  { id: "5", name: "Charlie", username: "@charlieBrown", image: require("../../assets/images/Smiley.png"), following: false },
  { id: "6", name: "David", username: "@davidKing", image: require("../../assets/images/Smiley.png"), following: true },
  { id: "7", name: "Eve", username: "@eveMiller", image: require("../../assets/images/Smiley.png"), following: false },
  { id: "8", name: "Frank", username: "@frankWhite", image: require("../../assets/images/Smiley.png"), following: true },
  { id: "9", name: "Grace", username: "@graceLee", image: require("../../assets/images/Smiley.png"), following: false },
  { id: "10", name: "Hank", username: "@hankWright", image: require("../../assets/images/Smiley.png"), following: false },
];


const UserListing = () => {
  const [userData, setUserData] = useState(dummyData);

  const handleFollow = (id: string) => {
    setUserData(prevData =>
      prevData.map(user =>
        user.id === id ? { ...user, following: !user.following } : user
      )
    );
  };

  const renderItem = ({ item }: { item: UserItem }) => (
    <View style={styles.container}>
      <View style={styles.userDetails}>
        <View style={styles.imgBox}>
          <Image
            source={item.image} 
            style={styles.image}
          />
        </View>
        <View style={{ display: "flex", flexDirection: "column" }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: "#1E1E1E" }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 15, fontWeight: "500", color: "#999999" }}>
            {item.username}
          </Text>
        </View>
      </View>
      <View>
        <TouchableOpacity
          style={[
            styles.button,
            { 
              backgroundColor: item.following ? "#F6F7F9" : "black", 
            }
          ]}
          onPress={() => handleFollow(item.id)} 
        >
          <Text
            style={[
              styles.buttonText,
              { color: item.following ? "#ADADAD" : "white" } 
            ]}
          >
            {item.following ? "Following" : "Follow"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <FlatList
      data={userData}  
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingBottom: 10 }}
    />
  );
};

export default UserListing;

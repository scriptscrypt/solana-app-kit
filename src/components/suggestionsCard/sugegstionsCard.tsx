import React from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { styles } from "./suggestionsCard.style";

const SuggestionsCard = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/suggestionCardBg.png")}
        style={styles.image}
      />
      <View style={styles.imgBox}>
        <Image
          source={require("../../assets/images/image 24.png")}
          style={styles.profImg}
        />
      </View>

      <View
        style={{
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "absolute",
          top: "50%",
          left: "50%",
          marginLeft: -59.5,
          height: 37,
          width: 119,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          0X5
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "500",
            textAlign: "center",
            color: "#ADADAD",
          }}
        >
          @0X33
        </Text>
      </View>

      {/* Follow Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Follow</Text>
      </TouchableOpacity>
    </View>
  );
};
export default SuggestionsCard
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
      position: "relative",
      width: 131,
      height: 161,
      backgroundColor: "#F6F7F9",
      borderWidth: 1,
      borderRadius: 12,
      overflow: "hidden",
      borderColor: "#EDEFF3",
      
    },
    image: {
      height: 46,
    },
    profImg: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    imgBox: {
      overflow: "hidden",
      position: "absolute",
      top: 12,
      left: "50%",
      marginLeft: -32,
      width: 64,
      height: 64,
      borderWidth: 4,
      borderColor: "white",
      borderRadius: 32, // Half of 64 to make it a circle
      alignItems: "center", // Optional: centers any content inside the circle
      justifyContent: "center", // Optional: centers any content inside the circle
    },
    button: {
      position: "absolute",
      bottom: 4,
      left: "50%", // Set the left to 50% to center horizontally
      marginLeft: -59.5,
      backgroundColor: "black",
      width: 119,
      height: 30,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: {
      fontSize: 12,
      fontWeight: "500",
      color: "white",
      textAlign: "center",
    },
  });
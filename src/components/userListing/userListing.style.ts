import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 66,

    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    alignItems: "center",
  },
  imgBox: {
    width: 32,
    height: 32,
    borderRadius: 64,
    overflow: "hidden",
    marginRight: 7,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  userDetails: {
    display: "flex",
    flexDirection: "row",
    width: "60%",
  },
  button: {
    backgroundColor: "black",
    width: 96,
    height: 32,
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

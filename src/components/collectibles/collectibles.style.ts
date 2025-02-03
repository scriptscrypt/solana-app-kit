import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap", 
    justifyContent: "space-between", 
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap:14
  },
  image: {
    width: "48%", 
    aspectRatio: 1, 
    borderRadius: 8, 
  },
});

import { StyleSheet } from "react-native";
import COLORS from "@/assets/colors";
import TYPOGRAPHY from "@/assets/typography";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between", // Changed from flex-start to space-between
    alignItems: "center",
    width: "100%", // Ensure container takes full width
    gap: 8,
  },
  btn: {
    position: "relative",
    backgroundColor: COLORS.lighterBackground,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    flex: 1, // Make buttons grow equally to fill space
    borderWidth: 1,
    borderColor: COLORS.borderDarkColor,
  },
  text: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
    textAlign: "center", // Ensure text is centered
  },
  lastBtn: {
    backgroundColor: COLORS.darkerBackground,
    borderWidth: 1,
    borderColor: COLORS.brandPrimary,
  },
  lastBtnText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.fontWeightToString(TYPOGRAPHY.semiBold),
  },
});

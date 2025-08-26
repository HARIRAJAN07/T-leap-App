// src/components/AppBackground.js
import React from "react";
import { View, StyleSheet } from "react-native";

const AppBackground = ({ children }) => {
  return <View style={styles.container}>{children}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e8f9ff", // shared background
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default AppBackground;

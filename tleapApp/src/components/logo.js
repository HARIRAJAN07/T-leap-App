import React from "react";
import { View, Image, Dimensions, StyleSheet } from "react-native";
import LogoImage from "../../assets/logo.png"; // adjust path if needed

const { height } = Dimensions.get("window");

const Logo = () => (
  <View style={styles.logoContainer}>
    <Image source={LogoImage} style={styles.logo} resizeMode="contain" />
  </View>
);

const styles = StyleSheet.create({
  logoContainer: {
    position: "absolute",
    top: height * 0.02,
    right: 20,
    alignItems: "flex-end",
    zIndex: 20,
  },
  logo: {
    width: 170,
    height: 170,
  },
});

export default Logo;

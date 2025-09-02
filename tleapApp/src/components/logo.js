import React from "react";
import { View, Image, Dimensions, StyleSheet } from "react-native";
import LogoImage from "../../assets/logo.png";

const { height } = Dimensions.get("window");

const Logo = () => (
  <View style={styles.logoContainer}>
    <Image source={LogoImage} style={styles.logoImage} resizeMode="contain" />
  </View>
);

const styles = StyleSheet.create({
  logoContainer: {
    position: "absolute",
    top: height * 0.05, // same as Dashboard
    left: 20,           // same as Dashboard
    zIndex: 10,
  },
  logoImage: {
    width: 140,         // fixed width
    height: 100,        // fixed height
  },
});

export default Logo;

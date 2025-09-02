import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const BackButton = ({ onPress, style, iconStyle, size = 24 }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        onPress={onPress} 
        style={[styles.button, style]}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={size} style={[styles.icon, iconStyle]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    zIndex: 10,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  icon: {
    color: '#8E7FD9',
  },
});

export default BackButton;
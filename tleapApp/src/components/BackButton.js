import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");
const wp = (perc) => (width * perc) / 100;
const hp = (perc) => (height * perc) / 100;

export default function BackButton({ customOnPress }) {
  const navigation = useNavigation();

  const handlePress = () => {
    if (customOnPress) {
      customOnPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={{ paddingTop: hp(5), paddingLeft: wp(3) }}>
      <TouchableOpacity
        onPress={handlePress}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.7)",
          paddingVertical: hp(0.8),
          paddingHorizontal: wp(1),
          borderRadius: wp(5),
          alignSelf: "flex-start",
          elevation: 3,
        }}
      >
        <Ionicons name="arrow-back" size={50} color="#333" />
      </TouchableOpacity>
    </View>
  );
}

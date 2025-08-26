// ModeSelectionPage.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

// helpers for responsiveness
const wp = (perc) => (width * perc) / 100;
const hp = (perc) => (height * perc) / 100;

const modes = [
  { key: "practice", title: "Practice 📝", desc: "See answers & explanations" },
  { key: "test", title: "Test 🏆", desc: "No explanations, get a report" },
];

const ModeSelectionPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { classId, subject, topic, difficulty, questionType } = route.params;

  const go = (mode) => {
    navigation.navigate("LanguageSelection", {
      classId,
      subject,
      topic,
      difficulty,
      questionType,
      mode,
    });
  };

  return (
    <LinearGradient
          colors={["#c5baff", "#c4d9ff", "#e8f9ff"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ flex: 1 }}
        >
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: wp(1),
  
      }}
    >
      <View
        style={{
          backgroundColor: "#fbfbfb",
          borderRadius: wp(2),
          padding: wp(2),
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: wp(2),
          elevation: 8,
          width: "80%",
          maxWidth: wp(80),
        }}
      >
        <Text
          style={{
            fontSize: wp(2.5),
            fontWeight: "800",
            textAlign: "center",
            marginBottom: hp(1),
            color: "#000",
          }}
        >
          Choose Mode
        </Text>
        <Text
          style={{
            fontSize: wp(1.5),
            color: "#555",
            textAlign: "center",
            marginBottom: hp(3),
          }}
        >
          Select how you want to learn and challenge yourself!
        </Text>

        <View
          style={{
            flexDirection: width > 1000 ? "row" : "column", // row on big screens
            justifyContent: "space-evenly",
            flexWrap: "wrap",
            gap: wp(2),
          }}
        >
          {modes.map((m) => (
            <TouchableOpacity
              key={m.key}
              onPress={() => go(m.key)}
              activeOpacity={0.85}
              style={{
                backgroundColor: "#e8f9ff",
                paddingVertical: hp(2),
                paddingHorizontal: wp(2),
                borderRadius: wp(2),
                width: width > 1000 ? "45%" : "100%",
                alignItems: "center",
                justifyContent: "center",
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowRadius: wp(2),
                elevation: 6,
                position: "relative",
              }}
            >
              <Text
                style={{
                  fontSize: wp(2),
                  fontWeight: "700",
                  textAlign: "center",
                  color: "#333",
                }}
              >
                {m.title}
              </Text>
              <Text
                style={{
                  fontSize: wp(1.2),
                  color: "#666",
                  textAlign: "center",
                  marginTop: hp(1.5),
                }}
              >
                {m.desc}
              </Text>

              {/* Decorative glowing circle */}
              <View
                style={{
                  position: "absolute",
                  top: -hp(1.5),
                  right: -wp(1.5),
                  width: wp(3),
                  height: wp(3),
                  borderRadius: wp(1.5),
                  backgroundColor: "#c5baff",
                  opacity: 0.7,
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
    </LinearGradient>
  );
};

export default ModeSelectionPage;
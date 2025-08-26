// DifficultySelectionPage.js
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

// scale helper (like Tailwind rem)
const wp = (perc) => (width * perc) / 100;
const hp = (perc) => (height * perc) / 100;

const levels = [
  { key: "Beginner 🐣", desc: "Start easy and warm up" },
  { key: "Intermediate 🚀", desc: "A balanced challenge" },
  { key: "Advanced 🧠", desc: "For pros only" },
];

export default function DifficultySelectionPage() {
  const navigation = useNavigation();
  const route = useRoute();
  const { classId, subject, topic } = route.params;

  const goNext = (difficulty) => {
    navigation.navigate("QuizType", {
      classId,
      subject,
      topic,
      difficulty,
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
        padding: wp(2), // responsive padding
      }}
    >
      <View
        style={{
          backgroundColor: "#fbfbfb",
          borderRadius: wp(2),
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: wp(1),
          paddingVertical: hp(5),
          paddingHorizontal: wp(1),
          width: "100%",
          maxWidth: wp(90),
        }}
      >
        {/* Heading */}
        <Text
          style={{
            fontSize: wp(3), // ~ big title
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: hp(2.5),
            color: "black",
          }}
        >
          Select Difficulty
        </Text>
        <Text
          style={{
            fontSize: wp(1.5),
            textAlign: "center",
            color: "#555",
            marginBottom: hp(6.5),
          }}
        >
          Choose your challenge level and test your knowledge at your own pace.
        </Text>

        {/* Grid - single column, but responsive */}
        <View
          style={{
            flexDirection: width > 1200 ? "row" : "column", // row in big screens
            justifyContent: "center",
            flexWrap: "wrap",
            gap: wp(2),

          }}
        >
          {levels.map((l) => (
            <TouchableOpacity
              key={l.key}
              onPress={() => goNext(l.key)}
              activeOpacity={0.85}
              style={{
                position: "relative",
                borderRadius: wp(1.6),
                paddingVertical: hp(4),
                paddingHorizontal: wp(1),
                backgroundColor: "#e8f9ff",
                width: width > 1200 ? wp(25) : "100%", // grid-like responsive
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.2,
                shadowRadius: wp(1),
                elevation: 10,
              }}
            >
              <Text
                style={{
                  fontSize: wp(1.75),
                  fontWeight: "bold",
                  color: "#333",
                  textAlign: "center",
                }}
              >
                {l.key}
              </Text>
              <Text
                style={{
                  marginTop: hp(2),
                  fontSize: wp(1.3),
                  color: "#666",
                  textAlign: "center",
                }}
              >
                {l.desc}
              </Text>

              {/* Decorative circle */}
              <View
                style={{
                  position: "absolute",
                  top: -hp(2),
                  right: -wp(2),
                  width: wp(2.5),
                  height: wp(2.5),
                  borderRadius: wp(1.25),
                  backgroundColor: "#c5baff",
                }}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
    </LinearGradient>
  );
}
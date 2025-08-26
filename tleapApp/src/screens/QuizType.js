// QuizType.js
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

const questionTypes = [
  { key: "mcq", label: "Multiple Choice", emoji: "📝", desc: "Pick the correct option" },
  { key: "match", label: "Match the Following", emoji: "🔗", desc: "Pair items correctly" },
  { key: "assertion", label: "Assertion & Reason", emoji: "🤔", desc: "Decide if reasoning fits" },
  { key: "truefalse", label: "True or False", emoji: "✔️❌", desc: "Simple but tricky" },
  { key: "fill", label: "Fill in the Blanks", emoji: "✍️", desc: "Complete the sentences" },
];

export default function QuizType() {
  const navigation = useNavigation();
  const route = useRoute();
  const { classId, subject, topic, difficulty } = route.params;

  const goNext = (typeKey) => {
    navigation.navigate("ModeSelection", {
      classId,
      subject,
      topic,
      difficulty,
      questionType: typeKey,
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
          padding: wp(3),
        }}
      >
        {/* Outer card */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: wp(3),
            padding: wp(2),
            width: "80%",
            maxWidth: wp(90),
            shadowColor: "#000",
            shadowOpacity: 0.15,
            shadowRadius: wp(1),
            elevation: 8,
    
          }}
        >
          {/* Heading */}
          <Text
            style={{
              fontSize: wp(2.75),
              fontWeight: "800",
              textAlign: "center",
              marginBottom: hp(1.5),
              color: "#000",
            }}
          >
            Select Question Type
          </Text>
          <Text
            style={{
              fontSize: wp(1.5),
              color: "#555",
              textAlign: "center",
              marginBottom: hp(5),
            }}
          >
            Choose how you want to test your knowledge.
          </Text>

          {/* Grid Layout */}
          <View
            style={{
              flexDirection: width > 1000 ? "row" : "row", // row wrap always
              flexWrap: "wrap",
              justifyContent: "space-around",
              gap: wp(1),
            }}
          >
            {questionTypes.map((q) => (
              <TouchableOpacity
                key={q.key}
                onPress={() => goNext(q.key)}
                activeOpacity={0.85}
                style={{
                  backgroundColor: "#f0f7ff",
                  borderRadius: wp(2),
                  paddingVertical: hp(3),
                  paddingHorizontal: wp(2),
                  width: width > 1000 ? "30%" : "47%", // 3 columns on big screens, 2 columns otherwise
                  marginBottom: hp(2),
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowRadius: wp(1),
                  elevation: 5,
                  position: "relative",
                }}
              >
                {/* Emoji */}
                <Text style={{ fontSize: wp(3), marginBottom: hp(1.5) }}>
                  {q.emoji}
                </Text>

                {/* Label */}
                <Text
                  style={{
                    fontSize: wp(1.75),
                    fontWeight: "700",
                    color: "#111",
                    textAlign: "center",
                  }}
                >
                  {q.label}
                </Text>

                {/* Description */}
                <Text
                  style={{
                    fontSize: wp(1.2),
                    color: "#555",
                    textAlign: "center",
                    marginTop: hp(1),
                  }}
                >
                  {q.desc}
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
}

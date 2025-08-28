// src/screens/LanguageSelectionScreen.js
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
import { Ionicons } from "@expo/vector-icons"; // ✅ back icon

const { width, height } = Dimensions.get("window");

// helpers for responsiveness
const wp = (perc) => (width * perc) / 100;
const hp = (perc) => (height * perc) / 100;

export default function LanguageSelectionScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { classId, subject, topic, difficulty, questionType, mode } =
    route.params;

  const languages = [
    { key: "English", title: "🇬🇧 English", desc: "Get the questions in English" },
    { key: "Tamil", title: "🇮🇳 Tamil", desc: "Get the questions in Tamil" },
  ];

  const selectLanguage = (lang) => {
    navigation.navigate("Question", {
      classId,
      subject,
      topic,
      difficulty,
      questionType,
      mode,
      language: lang,
    });
  };

  return (
    <LinearGradient
      colors={["#c5baff", "#c4d9ff", "#e8f9ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* ✅ Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.7)",
          paddingVertical: hp(0.8),
          paddingHorizontal: wp(3),
          borderRadius: wp(5),
          alignSelf: "flex-start",
          marginTop: hp(4),
          marginLeft: wp(4),
          elevation: 3,
        }}
      >
        <Ionicons name="arrow-back" size={20} color="#333" />
        <Text
          style={{
            marginLeft: wp(1.5),
            fontSize: wp(2.2),
            fontWeight: "600",
            color: "#333",
          }}
        >
          Back
        </Text>
      </TouchableOpacity>

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
          {/* Heading */}
          <Text
            style={{
              fontSize: wp(2.5),
              fontWeight: "800",
              textAlign: "center",
              marginBottom: hp(1),
              color: "#000",
            }}
          >
            🌐 Choose Language
          </Text>

          <Text
            style={{
              fontSize: wp(1.5),
              color: "#555",
              textAlign: "center",
              marginBottom: hp(3),
            }}
          >
            Do you want the questions in Tamil or English?
          </Text>

          {/* Language Cards */}
          <View
            style={{
              flexDirection: width > 1000 ? "row" : "column",
              justifyContent: "space-evenly",
              flexWrap: "wrap",
              gap: wp(2),
            }}
          >
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.key}
                onPress={() => selectLanguage(lang.key)}
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
                {/* Emoji */}
                <Text
                  style={{
                    fontSize: wp(4),
                    textAlign: "center",
                    marginBottom: hp(1),
                  }}
                >
                  {lang.title.split(" ")[0]} {/* Just emoji */}
                </Text>

                {/* Title (without emoji) */}
                <Text
                  style={{
                    fontSize: wp(2),
                    fontWeight: "700",
                    textAlign: "center",
                    color: "#333",
                  }}
                >
                  {lang.title.split(" ").slice(1).join(" ")}
                </Text>

                {/* Subtitle */}
                <Text
                  style={{
                    fontSize: wp(1.2),
                    color: "#666",
                    textAlign: "center",
                    marginTop: hp(1),
                  }}
                >
                  {lang.desc}
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
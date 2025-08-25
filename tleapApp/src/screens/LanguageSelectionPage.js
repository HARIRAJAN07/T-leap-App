// src/screens/LanguageSelectionScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function LanguageSelectionScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  const { classId, subject, topic, difficulty, questionType, mode } = route.params;

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
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.heading}>🌐 Choose Language</Text>
        <Text style={styles.subHeading}>
          Do you want the questions in Tamil or English?
        </Text>

        <View style={styles.grid}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.key}
              onPress={() => selectLanguage(lang.key)}
              style={styles.button}
            >
              <Text style={styles.langTitle}>{lang.title}</Text>
              <Text style={styles.langDesc}>{lang.desc}</Text>
              <View style={styles.circle} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c4d9ff",
    padding: 16,
  },
  card: {
    backgroundColor: "#fbfbfb",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    maxWidth: 500,
    elevation: 5, // shadow for Android
    shadowColor: "#000", // shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#000",
  },
  subHeading: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#555",
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
    paddingVertical: 24,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#e8f9ff",
    alignItems: "center",
    justifyContent: "center",
  },
  langTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  langDesc: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  circle: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#c5baff",
  },
});

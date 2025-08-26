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
    backgroundColor: "#c5baff",
    padding: 16,
  },
card: {
  backgroundColor: "#fbfbfb",
  borderRadius: 24,
  padding: 32,        // more padding
  width: "100%",
  maxWidth: 700,      // make card wider
  elevation: 5,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 4,
},
heading: {
  fontSize: 36,       // much bigger
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: 12,
  color: "#000",
},
subHeading: {
  fontSize: 18,       // slightly bigger
  textAlign: "center",
  marginBottom: 36,   // more spacing
  color: "#555",
},

grid: {
  flexDirection: "row",
  justifyContent: "space-evenly", // spread evenly
},
button: {
  width: "40%",       // larger card buttons
  paddingVertical: 40, // taller
  paddingHorizontal: 20,
  borderRadius: 20,
  backgroundColor: "#e8f9ff",
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 3,
},

langTitle: {
  fontSize: 26,       // bigger text + emoji
  fontWeight: "bold",
  color: "#333",
},

langDesc: {
  marginTop: 12,
  fontSize: 16,
  color: "#666",
  textAlign: "center",
},
circle: {
  position: "absolute",
  top: 10,
  right: 10,
  width: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: "#c5baff",
  borderWidth: 2,
  borderColor: "#fff",
},

});

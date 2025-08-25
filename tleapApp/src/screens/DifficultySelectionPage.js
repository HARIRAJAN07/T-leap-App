// DifficultySelectionPage.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

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
    console.log("Navigating with params:", { classId, subject, topic, difficulty });
    navigation.navigate("QuizType", {
      classId,
      subject,
      topic,
      difficulty,
    });
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.heading}>Select Difficulty</Text>
        <Text style={styles.subheading}>
          Choose your challenge level and test your knowledge at your own pace.
        </Text>

        <View style={styles.grid}>
          {levels.map((l) => (
            <TouchableOpacity
              key={l.key}
              style={styles.button}
              onPress={() => goNext(l.key)}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonTitle}>{l.key}</Text>
              <Text style={styles.buttonDesc}>{l.desc}</Text>
              <View style={styles.circle} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#c5baff",
    padding: 20,
  },
  card: {
    backgroundColor: "#fbfbfb",
    borderRadius: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    padding: 20,
    width: "100%",
    maxWidth: 700,
  },
  heading: {
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subheading: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 30,
  },
  grid: {
    flexDirection: "column", // stacked in RN (can adjust to row if you want)
    gap: 20,
  },
  button: {
    backgroundColor: "#e8f9ff",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
  },
  buttonDesc: {
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  circle: {
    position: "absolute",
    top: -10,
    right: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#c5baff",
  },
});

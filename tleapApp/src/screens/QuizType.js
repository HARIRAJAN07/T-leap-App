// QuizType.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

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
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Heading */}
        <Text style={styles.heading}>Select Question Type</Text>
        <Text style={styles.subText}>
          Choose how you want to test your knowledge.
        </Text>

        {/* Cards Grid */}
        <ScrollView contentContainerStyle={styles.grid}>
          {questionTypes.map((q) => (
            <TouchableOpacity
              key={q.key}
              onPress={() => goNext(q.key)}
              style={styles.typeButton}
              activeOpacity={0.8}
            >
              <Text style={styles.emoji}>{q.emoji}</Text>
              <Text style={styles.label}>{q.label}</Text>
              <Text style={styles.desc}>{q.desc}</Text>
              <View style={styles.glowCircle} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c5baff", // Use expo-linear-gradient if you want gradient
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fbfbfb",
    borderRadius: 24,
    padding: 20,
    width: "100%",
    maxWidth: 800,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    color: "#000",
  },
  subText: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  typeButton: {
    backgroundColor: "#e8f9ff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    width: "48%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
  },
  desc: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
    textAlign: "center",
  },
  glowCircle: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#c5baff",
    opacity: 0.7,
  },
});

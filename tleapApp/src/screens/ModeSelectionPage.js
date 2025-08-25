// ModeSelectionPage.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

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
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardContainer}>
        <Text style={styles.heading}>Choose Mode</Text>
        <Text style={styles.subHeading}>
          Select how you want to learn and challenge yourself!
        </Text>

        <View style={styles.grid}>
          {modes.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={styles.card}
              onPress={() => go(m.key)}
              activeOpacity={0.85}
            >
              <Text style={styles.cardTitle}>{m.title}</Text>
              <Text style={styles.cardDesc}>{m.desc}</Text>

              {/* Decorative glowing circle */}
              <View style={styles.glowCircle} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#c5baff",
  },
  cardContainer: {
    backgroundColor: "#fbfbfb",
    borderRadius: 30,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 6,
    width: "100%",
    maxWidth: 600,
  },
  heading: {
    fontSize: 32,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    color: "#000",
  },
  subHeading: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },
  grid: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 20,
  },
  card: {
    backgroundColor: "#e8f9ff",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: "45%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 8,
    elevation: 6,
    position: "relative",
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#333",
  },
  cardDesc: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  glowCircle: {
    position: "absolute",
    top: -12,
    right: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#c5baff",
    opacity: 0.7,
  },
});

export default ModeSelectionPage;

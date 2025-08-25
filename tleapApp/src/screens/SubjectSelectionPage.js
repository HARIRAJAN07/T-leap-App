// src/screens/Subjects/SubjectSelectionPage.js
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const subjects = [
  { name: "Science", icon: "🔬", color: "#4ade80" },
  { name: "Math", icon: "➗", color: "#a78bfa" },
  { name: "Social Studies", icon: "📜", color: "#facc15" },
  { name: "Tamil", icon: "📖", color: "#3b82f6" },
  { name: "English", icon: "🗣️", color: "#ef4444" },
];

const SubjectSelectionPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { classId } = route.params;

  const [flipped, setFlipped] = useState({});

  const toggleFlip = (subjectName) => {
    setFlipped((prev) => ({ ...prev, [subjectName]: !prev[subjectName] }));
  };

  const handleSelectSubject = (subjectName) => {
    navigation.navigate("TopicSelection", { classId, subject: subjectName });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Choose Your Subject</Text>
      <Text style={styles.subheading}>
        Select a subject to test your knowledge and begin your quiz!
      </Text>

      <View style={styles.grid}>
        {subjects.map((subject) => (
          <TouchableOpacity
            key={subject.name}
            style={[styles.card, { backgroundColor: flipped[subject.name] ? "#e0f7fa" : subject.color }]}
            onPress={() => toggleFlip(subject.name)}
          >
            {!flipped[subject.name] ? (
              <>
                <Text style={styles.icon}>{subject.icon}</Text>
                <Text style={styles.cardText}>{subject.name}</Text>
              </>
            ) : (
              <>
                <Text style={styles.backTitle}>Go to {subject.name}</Text>
                <Text style={styles.backText}>Click below to continue with {subject.name}</Text>
                <TouchableOpacity
                  style={styles.chooseButton}
                  onPress={() => handleSelectSubject(subject.name)}
                >
                  <Text style={styles.chooseText}>Choose Topic</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "center",
    backgroundColor: "#e8f9ff",
  },
  heading: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  subheading: { fontSize: 16, textAlign: "center", marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 15 },
  card: {
    width: 140,
    height: 180,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    margin: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  icon: { fontSize: 50, marginBottom: 10 },
  cardText: { fontSize: 18, fontWeight: "bold", color: "#fff", textAlign: "center" },
  backTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 5, textAlign: "center" },
  backText: { fontSize: 14, textAlign: "center", marginBottom: 10 },
  chooseButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  chooseText: { color: "#2c2c2c", fontWeight: "bold", textAlign: "center" },
});

export default SubjectSelectionPage;

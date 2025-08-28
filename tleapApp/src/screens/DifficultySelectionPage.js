// screens/DifficultySelectionPage.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons"; // ✅ back icon

const { width, height } = Dimensions.get("window");

// scale helpers
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
      <ScrollView contentContainerStyle={styles.container}>
        {/* ✅ Styled Back Button */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={20} color="#333" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        {/* Box wrapper */}
        <View style={styles.box}>
          {/* Heading */}
          <Text style={styles.heading}>🎯 Select Difficulty</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Choose your challenge level and test your knowledge at your own pace.
          </Text>

          {/* Difficulty Cards */}
          <View
            style={[
              styles.grid,
              { flexDirection: width > 1200 ? "row" : "column" },
            ]}
          >
            {levels.map((l) => (
              <TouchableOpacity
                key={l.key}
                onPress={() => goNext(l.key)}
                activeOpacity={0.85}
                style={[
                  styles.card,
                  { width: width > 1200 ? wp(28) : "100%" },
                ]}
              >
                <Text style={styles.cardTitle}>{l.key}</Text>
                <Text style={styles.cardDesc}>{l.desc}</Text>

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

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: wp(3),
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingVertical: hp(0.8),
    paddingHorizontal: wp(3),
    borderRadius: wp(5),
    alignSelf: "flex-start",
    marginTop: hp(4),
    marginBottom: hp(2),
    marginLeft: wp(2),
    elevation: 3,
  },
  backText: {
    marginLeft: wp(1.5),
    fontSize: wp(2.2),
    fontWeight: "600",
    color: "#333",
  },
  box: {
    backgroundColor: "#fbfbfb",
    borderRadius: wp(2),
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: wp(1.5),
    paddingVertical: hp(5),
    paddingHorizontal: wp(3),
    width: "100%",
    maxWidth: wp(90),
  },
  heading: {
    fontSize: wp(4),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp(2),
    color: "#000",
  },
  subtitle: {
    fontSize: wp(2),
    textAlign: "center",
    color: "#555",
    marginBottom: hp(5),
  },
  grid: {
    justifyContent: "center",
    alignItems: "center",
    gap: wp(3),
    flexWrap: "wrap",
  },
  card: {
    borderRadius: wp(2),
    paddingVertical: hp(4),
    paddingHorizontal: wp(2),
    backgroundColor: "#e8f9ff",
    alignItems: "center",
    marginBottom: hp(3),
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: wp(1),
    elevation: 8,
  },
  cardTitle: {
    fontSize: wp(2.2),
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  cardDesc: {
    marginTop: hp(1.5),
    fontSize: wp(1.6),
    color: "#666",
    textAlign: "center",
  },
});

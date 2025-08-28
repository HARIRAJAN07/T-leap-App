// screens/DifficultySelectionPage.js
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Logo from "../components/logo";
import BackButton from "../components/BackButton";

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
      <Logo />
      <BackButton />

      <View style={styles.container}>
        <View style={styles.box}>
          {/* Heading */}
          <Text style={styles.heading}>🎯 Select Difficulty</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            Choose your challenge level and test your knowledge at your own pace.
          </Text>

          {/* Difficulty Cards */}
          <View style={styles.grid}>
            {levels.map((l) => (
              <TouchableOpacity
                key={l.key}
                onPress={() => goNext(l.key)}
                activeOpacity={0.85}
                style={styles.card}
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
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: wp(3),
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
    flexDirection: "row",   // ✅ always horizontal
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "nowrap",     // ✅ prevent wrapping
  },
  card: {
    flex: 1,                        // ✅ equal width
    marginHorizontal: wp(1),        // ✅ small gap
    borderRadius: wp(2),
    paddingVertical: hp(8),         // 🔥 taller cards
    paddingHorizontal: wp(3),
    backgroundColor: "#e8f9ff",
    alignItems: "center",
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
    marginTop: hp(2),
    fontSize: wp(1.8),
    color: "#666",
    textAlign: "center",
  },
});

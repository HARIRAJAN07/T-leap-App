// src/screens/Subjects/SubjectSelectionPage.js
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const subjects = [
  { name: "Science", icon: "🔬", color: "#22c55e" },
  { name: "Math", icon: "➗", color: "#8b5cf6" },
  { name: "Social Studies", icon: "📜", color: "#f59e0b" },
  { name: "Tamil", icon: "📖", color: "#3b82f6" },
  { name: "English", icon: "🗣️", color: "#ef4444" },
];

const CARD_SIZE = width * 0.2;

const SubjectSelectionPage = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { classId } = route.params;

  const [flipped, setFlipped] = useState({});
  const animations = useRef(
    subjects.reduce((acc, subj) => {
      acc[subj.name] = new Animated.Value(0);
      return acc;
    }, {})
  ).current;

  const toggleFlip = (subjectName) => {
    const isFlipped = flipped[subjectName];
    Animated.timing(animations[subjectName], {
      toValue: isFlipped ? 0 : 180,
      duration: 500,
      useNativeDriver: true,
    }).start();
    setFlipped((prev) => ({ ...prev, [subjectName]: !isFlipped }));
  };

  const handleSelectSubject = (subjectName) => {
    navigation.navigate("TopicSelection", { classId, subject: subjectName });
  };

  return (
  <View style={{ flex: 1, backgroundColor: "#c5baff" }}>
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* Title + Subtitle */}
      <View style={{ alignItems: "center", marginBottom: 20 }}>
        <Text style={styles.heading}>Choose Your Subject</Text>
        <Text style={styles.subtitle}>
          Select a subject to test your knowledge and begin your quiz!
        </Text>
      </View>

      <View style={styles.grid}>
        {subjects.map((subject) => {
          const rotateY = animations[subject.name].interpolate({
            inputRange: [0, 180],
            outputRange: ["0deg", "180deg"],
          });

          return (
            <TouchableOpacity
              key={subject.name}
              activeOpacity={0.9}
              onPress={() => toggleFlip(subject.name)}
              style={styles.cardWrapper}
            >
              {/* Front side */}
              <Animated.View
                style={[
                  styles.card,
                  {
                    backgroundColor: subject.color,
                    transform: [{ rotateY }],
                  },
                ]}
              >
                <Text style={styles.icon}>{subject.icon}</Text>
                <Text style={styles.cardText}>{subject.name}</Text>
              </Animated.View>

              {/* Back side */}
              <Animated.View
                style={[
                  styles.card,
                  styles.cardBack,
                  {
                    transform: [
                      {
                        rotateY: animations[subject.name].interpolate({
                          inputRange: [0, 180],
                          outputRange: ["180deg", "360deg"],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={styles.backTitle}>Go to {subject.name}</Text>
                <Text style={styles.backSubtitle}>
                  Click below to continue with {subject.name}.
                </Text>
                <TouchableOpacity
                  style={styles.chooseButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    handleSelectSubject(subject.name);
                  }}
                >
                  <Text style={styles.chooseText}>Choose Topic</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  </View>
);


};

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: "#c5baff", // full background color
  padding: 20,
},

cardContainer: {
  width: CARD_SIZE,
  height: CARD_SIZE,
  backfaceVisibility: "hidden",
},

  heading: {
  fontSize: 35,
  fontWeight: "bold",
  textAlign: "center",
  color: "#333",
},
subtitle: {
  fontSize: 26,
  textAlign: "center",
  color: "#666",
  marginTop: 5,
},
backSubtitle: {
  fontSize: 14,
  textAlign: "center",
  color: "#555",
  marginVertical: 8,
},
grid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-around",
    paddingHorizontal: 20, 
},

cardWrapper: {
  width: "30%",        // 👈 makes 3 fit per row (with some spacing)
  aspectRatio: 1,      // 👈 keeps them square (optional)
  marginBottom: 15,
},

  card: {
    position: "absolute",

    height: "100%",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backfaceVisibility: "hidden",
      width: "90%",   // 👈 about 1/3 of row (with gaps)
  aspectRatio: 1, // 👈 makes it a square (optional)
  marginVertical: 10,


  },
icon: {
  fontSize: 100,  // try 50 or 60 depending on your design
  marginBottom: 10,
},

  cardText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  cardBack: {
    backgroundColor: "#c4d9ff",
    padding: 12,
    justifyContent: "center",
  },
  backTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  chooseButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    elevation: 3,
  },
  chooseText: { fontWeight: "600", color: "#333" },
});

export default SubjectSelectionPage;

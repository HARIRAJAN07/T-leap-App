// src/screens/Subjects/SubjectSelectionPage.js
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons"; // back icon
import Logo from "../components/logo";
const { width, height } = Dimensions.get("window");

// helpers for responsiveness
const wp = (perc) => (width * perc) / 100;
const hp = (perc) => (height * perc) / 100;

const subjects = [
  { name: "Science", icon: "🔬", color: "#22c55e" },
  { name: "Math", icon: "➗", color: "#8b5cf6" },
  { name: "Social Studies", icon: "📜", color: "#f59e0b" },
  { name: "Tamil", icon: "📖", color: "#3b82f6" },
  { name: "English", icon: "🗣", color: "#ef4444" },
];

// adjust so all 5 fit in one row
const CARD_WIDTH = width / 5.8;
const CARD_HEIGHT = CARD_WIDTH * 1.3;

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
    <LinearGradient
      colors={["#c5baff", "#c4d9ff", "#e8f9ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
       {/* ✅ Reusable Logo (top-right corner) */}
      <Logo size={120} position="top-right" />
      {/* Back Button */}
      <View style={{ paddingTop: hp(5), paddingLeft: wp(3) }}>
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
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: wp(3.5),
        }}
      >
        {/* Title + Subtitle */}
        <View
          style={{
            alignItems: "center",
            marginBottom: hp(2),
            paddingBottom: "3.5%",
          }}
        >
          <Text
            style={{
              fontSize: wp(2.5),
              fontWeight: "800",
              textAlign: "center",
              color: "#333",
            }}
          >
            Choose Your Subject
          </Text>
          <Text
            style={{
              fontSize: wp(1.7),
              textAlign: "center",
              color: "#666",
              marginTop: hp(1),
            }}
          >
            Select a subject to test your knowledge and begin your quiz!
          </Text>
        </View>

        {/* Single row of subjects */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "nowrap",
            width: "100%",
          }}
        >
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
                style={{
                  width: CARD_WIDTH,
                  height: CARD_HEIGHT,
                  perspective: 1000,
                }}
              >
                {/* Front side */}
                <Animated.View
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: wp(2),
                    alignItems: "center",
                    justifyContent: "center",
                    backfaceVisibility: "hidden",
                    backgroundColor: subject.color,
                    transform: [{ rotateY }],
                    elevation: 3, // shadow for Android
                    shadowColor: "#000", // shadow for iOS
                    shadowOpacity: 0.4,
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: wp(5),
                      marginBottom: hp(1),
                    }}
                  >
                    {subject.icon}
                  </Text>
                  <Text
                    style={{
                      fontSize: wp(2),
                      fontWeight: "700",
                      color: "#fff",
                    }}
                  >
                    {subject.name}
                  </Text>
                </Animated.View>

                {/* Back side */}
                <Animated.View
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    borderRadius: wp(2),
                    alignItems: "center",
                    justifyContent: "center",
                    backfaceVisibility: "hidden",
                    backgroundColor: "#c4d9ff",
                    padding: wp(2),
                    elevation: 3, // shadow for Android
                    shadowColor: "#000", // shadow for iOS
                    shadowOpacity: 0.3,
                    shadowOffset: { width: 0, height: 0 },
                    shadowRadius: 6,
                    transform: [
                      {
                        rotateY: animations[subject.name].interpolate({
                          inputRange: [0, 180],
                          outputRange: ["180deg", "360deg"],
                        }),
                      },
                    ],
                  }}
                >
                  <Text
                    style={{
                      fontSize: wp(1.5),
                      fontWeight: "700",
                      marginBottom: hp(1),
                      textAlign: "center",
                    }}
                  >
                    Go to {subject.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: wp(1.2),
                      textAlign: "center",
                      color: "#555",
                      marginBottom: hp(1.5),
                    }}
                  >
                    Click below to continue with {subject.name}.
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#fff",
                      paddingVertical: hp(1),
                      paddingHorizontal: wp(2.5),
                      borderRadius: wp(4),
                      elevation: 3,
                    }}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleSelectSubject(subject.name);
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        color: "#333",
                        fontSize: "2.5vh",
                      }}
                    >
                      Choose Topic
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

export default SubjectSelectionPage;

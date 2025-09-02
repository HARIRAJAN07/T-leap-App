import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Logo from "../components/logo";
import BackButton from "../components/BackButton";

const { width, height } = Dimensions.get("window");

// helpers for responsiveness
const wp = (perc) => (width * perc) / 100;
const hp = (perc) => (height * perc) / 100;

// subjects with gradients
const subjects = [
  { name: "Science", icon: "🔬", gradient: ["#a8e6cf", "#dcedc1"]  }, // light green → green
  { name: "Math", icon: "➗", gradient: ["#e0c3fc", "#8ec5fc"] }, // light purple → deep purple
  { name: "Social Studies", icon: "📜", gradient: ["#f6d365", "#fda085"] }, // yellow → amber
  { name: "Tamil", icon: "📖", gradient: ["#a1c4fd", "#c2e9fb"] }, // light blue → blue
  { name: "English", icon: "🗣", gradient: ["#ffc7d7ff", "#f25f6dff"] }, // light red → red
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
      colors={["#FBFBFB", "#E8F9FF"]}
      style={{ flex: 1 }}
    >
      <Logo />
      <BackButton onPress={() => navigation.goBack()} />

      <View style={{ flex: 1, padding: wp(5) }}>
        {/* Title + Subtitle */}
        <View style={{ alignItems: "center", marginBottom: hp(2), paddingBottom: "3.5%" }}>
          <Text style={{ fontSize: wp(4), fontWeight: "bold", textAlign: "center", color: "#000", marginBottom: hp(1.5) }}>
            🎯 Choose Your Subject
          </Text>
          <Text style={{ fontSize: wp(2), textAlign: "center", color: "#555" }}>
            Select a subject to test your knowledge and begin your quiz!
          </Text>
        </View>

        {/* Single row of subjects */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", flexWrap: "nowrap", width: "100%" }}>
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
                style={{ width: CARD_WIDTH, height: CARD_HEIGHT, perspective: 1000 }}
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
                    overflow: "hidden",
                    transform: [{ rotateY }],
                    elevation: 3,
                    shadowColor: "#000",
                    shadowOpacity: 0.2,
                    shadowOffset: { width: 0, height: 2 },
                    shadowRadius: 6,
                  }}
                >
                  <LinearGradient
                    colors={subject.gradient}
                    style={{ flex: 1, width: "100%", justifyContent: "center", alignItems: "center", borderRadius: wp(2) }}
                  >
                    <Text style={{ fontSize: wp(5), marginBottom: hp(1) }}>{subject.icon}</Text>
                    <Text style={{ fontSize: wp(2), fontWeight: "700", color: "#fff" }}>
                      {subject.name}
                    </Text>
                  </LinearGradient>
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
                    backgroundColor: "#E8F9FF",
                    padding: wp(2),
                    elevation: 3,
                    shadowColor: "#000",
                    shadowOpacity: 0.2,
                    shadowOffset: { width: 0, height: 2 },
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
                  <Text style={{ fontSize: wp(1.5), fontWeight: "700", marginBottom: hp(1), textAlign: "center" }}>
                    Go to {subject.name}
                  </Text>
                  <Text style={{ fontSize: wp(1.2), textAlign: "center", color: "#555", marginBottom: hp(1.5) }}>
                    Click below to continue with {subject.name}.
                  </Text>
                  <TouchableOpacity
                    style={{ backgroundColor: "#fff", paddingVertical: hp(1), paddingHorizontal: wp(2.5), borderRadius: wp(4), elevation: 2 }}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleSelectSubject(subject.name);
                    }}
                  >
                    <Text style={{ fontWeight: "600", color: "#333", fontSize: wp(1) }}>
                      Choose Topic
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </LinearGradient>
  );
};

export default SubjectSelectionPage;
